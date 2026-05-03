"""
Secure Admin Panel for Arjun PV Portfolio
==========================================
Triple-layer protection:
  Layer 1 — Credential storage: PBKDF2-SHA256 password hash + per-config HMAC-SHA256
  Layer 2 — Session: timeout, IP binding, per-request activity refresh
  Layer 3 — Data: HMAC verification of every submission record before display

Access control:
  • First visit   → /admin/setup  (one-time credential creation, disabled after)
  • Subsequent    → /admin/login  (username + password; locked after 5 failures)
  • Authenticated → /admin/dashboard  (30-minute idle timeout, IP-bound)
"""

import os
import json
import hmac
import hashlib
import logging
import secrets
import functools
from datetime import datetime, timedelta

from flask import (
    render_template, request, flash, redirect,
    url_for, session, abort
)
from werkzeug.security import generate_password_hash, check_password_hash

from app import app, limiter

# ═══════════════════════════════════════════════════════════════
#  Configuration
# ═══════════════════════════════════════════════════════════════
SESSION_TIMEOUT_MIN  = 30
MAX_FAILED_ATTEMPTS  = 5
LOCKOUT_DURATION_MIN = 15
ADMIN_CONFIG_PATH    = os.path.join(app.root_path, 'instance', 'admin_config.json')

# In-memory failed-attempt tracker  {ip: {count, locked_until}}
_failed: dict = {}


# ═══════════════════════════════════════════════════════════════
#  Admin credential helpers
# ═══════════════════════════════════════════════════════════════

def _load_config() -> dict | None:
    if not os.path.exists(ADMIN_CONFIG_PATH):
        return None
    try:
        with open(ADMIN_CONFIG_PATH, 'r') as f:
            return json.load(f)
    except Exception:
        return None


def _config_hmac(username_hash: str, password_hash: str, salt: str) -> str:
    """HMAC-SHA256 of the config record — detects file tampering."""
    base_key   = (os.environ.get('SESSION_SECRET') or 'admin-cfg-key').encode()
    salted_key = hashlib.sha256(base_key + salt.encode()).digest()
    payload    = f"{username_hash}|{password_hash}"
    return hmac.new(salted_key, payload.encode(), hashlib.sha256).hexdigest()


def _save_config(username: str, password: str) -> None:
    os.makedirs(os.path.dirname(ADMIN_CONFIG_PATH), exist_ok=True)
    u_hash = hashlib.sha256(username.lower().encode()).hexdigest()
    p_hash = generate_password_hash(password)         # pbkdf2:sha256 + random salt built-in
    salt   = secrets.token_hex(24)                    # 192-bit config salt
    record = {
        'username_hash':   u_hash,
        'password_hash':   p_hash,
        'config_salt':     salt,
        'config_hmac':     _config_hmac(u_hash, p_hash, salt),
        'created_at':      datetime.utcnow().isoformat() + 'Z',
        'algorithm':       'PBKDF2-SHA256 + HMAC-SHA256',
    }
    with open(ADMIN_CONFIG_PATH, 'w') as f:
        json.dump(record, f, indent=2)
    logging.info("Admin config saved with HMAC integrity seal.")


def _config_intact(cfg: dict) -> bool:
    """Constant-time HMAC check on the stored config."""
    try:
        expected = _config_hmac(cfg['username_hash'], cfg['password_hash'], cfg['config_salt'])
        return hmac.compare_digest(expected, cfg['config_hmac'])
    except Exception:
        return False


# ═══════════════════════════════════════════════════════════════
#  Lockout helpers
# ═══════════════════════════════════════════════════════════════

def _is_locked(ip: str) -> tuple[bool, int]:
    rec = _failed.get(ip, {})
    until = rec.get('locked_until')
    if until:
        until_dt = datetime.fromisoformat(until)
        if datetime.utcnow() < until_dt:
            return True, int((until_dt - datetime.utcnow()).total_seconds())
        _failed.pop(ip, None)
    return False, 0


def _fail(ip: str) -> int:
    """Record a failed attempt; return attempts remaining (0 = now locked)."""
    if ip not in _failed:
        _failed[ip] = {'count': 0}
    _failed[ip]['count'] += 1
    count = _failed[ip]['count']
    if count >= MAX_FAILED_ATTEMPTS:
        _failed[ip]['locked_until'] = (
            datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MIN)
        ).isoformat()
        logging.warning(f"[ADMIN] IP {ip} locked for {LOCKOUT_DURATION_MIN} min")
        return 0
    return MAX_FAILED_ATTEMPTS - count


def _clear_fails(ip: str) -> None:
    _failed.pop(ip, None)


# ═══════════════════════════════════════════════════════════════
#  Session guard decorator
# ═══════════════════════════════════════════════════════════════

def admin_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_ok'):
            return redirect(url_for('admin_login'))

        # IP binding — reject if the IP changed mid-session
        if session.get('admin_ip') != request.remote_addr:
            logging.warning(
                f"[ADMIN] Session IP mismatch: "
                f"stored={session.get('admin_ip')} actual={request.remote_addr}"
            )
            session.clear()
            flash('Session invalid. Please log in again.', 'danger')
            return redirect(url_for('admin_login'))

        # Idle timeout
        last = session.get('admin_active')
        if last:
            elapsed = datetime.utcnow() - datetime.fromisoformat(last)
            if elapsed > timedelta(minutes=SESSION_TIMEOUT_MIN):
                session.clear()
                flash('Session expired after inactivity. Please log in.', 'warning')
                return redirect(url_for('admin_login'))

        # Refresh activity timestamp on every authenticated request
        session['admin_active'] = datetime.utcnow().isoformat()
        session.modified = True
        return f(*args, **kwargs)
    return decorated


# ═══════════════════════════════════════════════════════════════
#  Submission helpers
# ═══════════════════════════════════════════════════════════════

def _verify_record_hmac(rec: dict) -> bool | None:
    """True = intact, False = tampered, None = legacy (no HMAC stored)."""
    salt   = rec.get('integrity_salt')
    stored = rec.get('integrity_hmac')
    if not salt or not stored:
        return None

    from routes import submission_hmac
    payload  = (
        f"{rec.get('name','')}"
        f"|{rec.get('email','')}"
        f"|{rec.get('subject','')}"
        f"|{rec.get('message','')}"
        f"|{rec.get('attachment') or ''}"
    )
    computed = submission_hmac(payload, salt)
    return hmac.compare_digest(computed, stored)


def _load_submissions() -> list:
    path = os.path.join(app.root_path, 'instance', 'submissions.json')
    if not os.path.exists(path):
        return []
    try:
        with open(path, 'r') as f:
            data = json.load(f)
    except Exception as e:
        logging.error(f"Failed to load submissions: {e}")
        return []
    for rec in data:
        rec['_hmac_status'] = _verify_record_hmac(rec)
    return list(reversed(data))   # newest first


# ═══════════════════════════════════════════════════════════════
#  Routes
# ═══════════════════════════════════════════════════════════════

@app.route('/admin')
def admin_index():
    if not _load_config():
        return redirect(url_for('admin_setup'))
    if session.get('admin_ok'):
        return redirect(url_for('admin_dashboard'))
    return redirect(url_for('admin_login'))


# ── First-time setup (disabled once credentials exist) ─────────
@app.route('/admin/setup', methods=['GET', 'POST'])
@limiter.limit("5 per hour")
def admin_setup():
    if _load_config():
        flash('Admin account already configured.', 'info')
        return redirect(url_for('admin_login'))

    error = None
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        confirm  = request.form.get('confirm_password', '').strip()

        if not username or not password:
            error = 'Username and password are required.'
        elif len(username) < 3:
            error = 'Username must be at least 3 characters.'
        elif len(password) < 10:
            error = 'Password must be at least 10 characters.'
        elif password != confirm:
            error = 'Passwords do not match.'
        else:
            _save_config(username, password)
            logging.info(f"[ADMIN] Account created from IP {request.remote_addr}")
            flash('Admin account created. Please log in.', 'success')
            return redirect(url_for('admin_login'))

    return render_template('admin/setup.html', error=error)


# ── Login ───────────────────────────────────────────────────────
@app.route('/admin/login', methods=['GET', 'POST'])
@limiter.limit("15 per minute")
def admin_login():
    cfg = _load_config()
    if not cfg:
        return redirect(url_for('admin_setup'))
    if session.get('admin_ok'):
        return redirect(url_for('admin_dashboard'))

    ip    = request.remote_addr
    error = None

    if request.method == 'POST':
        locked, remaining = _is_locked(ip)
        if locked:
            m, s = divmod(remaining, 60)
            error = f'Too many failed attempts. Try again in {m}m {s}s.'
        else:
            username = request.form.get('username', '').strip()
            password = request.form.get('password', '').strip()

            # 1 — Verify config integrity before trusting stored hashes
            if not _config_intact(cfg):
                logging.critical('[ADMIN] Config HMAC mismatch — possible file tampering!')
                error = 'System integrity error. Contact the site owner.'

            else:
                # 2 — Constant-time username comparison (hash vs hash)
                u_input = hashlib.sha256(username.lower().encode()).hexdigest()
                u_ok    = hmac.compare_digest(u_input, cfg['username_hash'])

                # 3 — PBKDF2 password check (handles its own salt)
                p_ok    = check_password_hash(cfg['password_hash'], password) if password else False

                if u_ok and p_ok:
                    _clear_fails(ip)
                    session.clear()
                    session['admin_ok']     = True
                    session['admin_ip']     = ip
                    session['admin_active'] = datetime.utcnow().isoformat()
                    session['admin_login']  = datetime.utcnow().isoformat()
                    session.permanent       = False
                    logging.info(f'[ADMIN] Login SUCCESS from {ip}')
                    return redirect(url_for('admin_dashboard'))
                else:
                    remaining_attempts = _fail(ip)
                    logging.warning(
                        f'[ADMIN] Login FAILED from {ip} '
                        f'(attempts left: {remaining_attempts})'
                    )
                    if remaining_attempts > 0:
                        error = (
                            f'Invalid credentials. '
                            f'{remaining_attempts} attempt(s) remaining.'
                        )
                    else:
                        error = (
                            f'Account locked for {LOCKOUT_DURATION_MIN} minutes '
                            'due to repeated failures.'
                        )

    return render_template('admin/login.html', error=error)


# ── Dashboard ───────────────────────────────────────────────────
@app.route('/admin/dashboard')
@admin_required
def admin_dashboard():
    subs     = _load_submissions()
    verified = sum(1 for s in subs if s['_hmac_status'] is True)
    tampered = sum(1 for s in subs if s['_hmac_status'] is False)
    legacy   = sum(1 for s in subs if s['_hmac_status'] is None)
    return render_template(
        'admin/dashboard.html',
        subs=subs,
        total=len(subs),
        verified=verified,
        tampered=tampered,
        legacy=legacy,
        timeout_min=SESSION_TIMEOUT_MIN,
    )


# ── Submission detail ───────────────────────────────────────────
@app.route('/admin/submission/<sub_id>')
@admin_required
def admin_submission(sub_id):
    subs   = _load_submissions()
    record = next((s for s in subs if s.get('id') == sub_id), None)
    if not record:
        abort(404)
    return render_template('admin/submission.html', rec=record)


# ── Logout ──────────────────────────────────────────────────────
@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    logging.info(f'[ADMIN] Logout from {request.remote_addr}')
    session.clear()
    flash('Logged out successfully.', 'success')
    return redirect(url_for('admin_login'))
