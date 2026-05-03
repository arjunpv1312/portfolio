import os
import re
import json
import hmac
import uuid
import hashlib
import logging
import secrets
from datetime import datetime

import bleach
from flask import (
    render_template, request, flash, redirect,
    url_for, jsonify, send_from_directory, abort, make_response
)
from flask_mail import Message
from werkzeug.utils import secure_filename
from app import app, mail, limiter

# ═══════════════════════════════════════════════════════════════
#  LAYER 3 — Data integrity constants & helpers
# ═══════════════════════════════════════════════════════════════

ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'txt'
}

# Magic-byte signatures for binary file types.
# Each value is the expected header bytes (or None = skip magic check).
_FILE_MAGIC: dict[str, bytes | None] = {
    'pdf':  b'%PDF',
    'png':  b'\x89PNG',
    'jpg':  b'\xff\xd8\xff',
    'jpeg': b'\xff\xd8\xff',
    'gif':  b'GIF8',
    'doc':  b'\xd0\xcf\x11\xe0',
    'docx': b'PK\x03\x04',
    'txt':  None,   # plain text — no magic bytes
    'mp4':  None,   # complex container
    'mov':  None,   # complex container
}

# Input length limits
_LIMITS = {
    'name':    120,
    'email':   254,
    'subject': 200,
    'message': 4000,
}


def allowed_file(filename: str) -> bool:
    return (
        '.' in filename
        and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def validate_file_magic(file_obj, ext: str) -> bool:
    """Read the first N bytes and compare against the expected magic header."""
    magic = _FILE_MAGIC.get(ext.lower())
    if magic is None:
        return True          # skip check for text/container formats
    header = file_obj.read(len(magic))
    file_obj.seek(0)
    return header == magic


def sanitize_field(raw: str, field: str) -> str:
    """
    LAYER 2 — Strip all HTML tags (bleach), normalise whitespace,
    and enforce per-field length cap.
    """
    clean = bleach.clean(raw, tags=[], attributes={}, strip=True)
    clean = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', clean)  # strip control chars
    clean = clean.strip()
    return clean[:_LIMITS.get(field, 500)]


def submission_hmac(payload: str, salt: str) -> str:
    """
    LAYER 3 — HMAC-SHA-256 with a per-submission random salt.

    Key derivation:
      base_key  = SESSION_SECRET (server-side secret, never exposed)
      salted_key = SHA-256( base_key || salt )   ← stretches & mixes the salt
      digest     = HMAC-SHA-256( salted_key, payload )
    """
    base_key   = (os.environ.get('SESSION_SECRET') or 'portfolio-fallback').encode('utf-8')
    salted_key = hashlib.sha256(base_key + salt.encode('utf-8')).digest()
    return hmac.new(salted_key, payload.encode('utf-8'), hashlib.sha256).hexdigest()


def file_sha256(file_obj) -> str:
    """Return a SHA-256 hex digest of the uploaded file's content."""
    digest = hashlib.sha256(file_obj.read()).hexdigest()
    file_obj.seek(0)
    return digest


def save_submission(name, email, subject, message,
                    attachment=None, file_hash=None,
                    integrity_salt=None, integrity_hmac=None):
    """
    Persist every contact form submission to JSON.
    Each record includes a per-submission salt and HMAC-SHA-256 digest
    so any tampering of the stored data is detectable.
    """
    path = os.path.join(app.root_path, 'instance', 'submissions.json')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    submissions = []
    if os.path.exists(path):
        try:
            with open(path, 'r') as f:
                submissions = json.load(f)
        except Exception:
            submissions = []

    record = {
        'id':         str(uuid.uuid4()),
        'timestamp':  datetime.utcnow().isoformat() + 'Z',
        'name':       name,
        'email':      email,
        'subject':    subject,
        'message':    message,
        'attachment': attachment,
        'file_sha256':      file_hash,
        'integrity_salt':   integrity_salt,
        'integrity_hmac':   integrity_hmac,
    }
    submissions.append(record)
    with open(path, 'w') as f:
        json.dump(submissions, f, indent=2)


# ═══════════════════════════════════════════════════════════════
#  SEO files
# ═══════════════════════════════════════════════════════════════

@app.route('/robots.txt')
def robots_txt():
    content = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /instance/\n"
        "Disallow: /files/\n\n"
        "Sitemap: https://personal-portfolio--serenayt06.replit.app/sitemap.xml\n"
    )
    resp = make_response(content)
    resp.headers['Content-Type'] = 'text/plain'
    return resp


@app.route('/sitemap.xml')
def sitemap_xml():
    content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://personal-portfolio--serenayt06.replit.app/</loc>
    <lastmod>2026-05-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://personal-portfolio--serenayt06.replit.app/#gallery</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://personal-portfolio--serenayt06.replit.app/#interests</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://personal-portfolio--serenayt06.replit.app/#journey</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://personal-portfolio--serenayt06.replit.app/#certificates</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://personal-portfolio--serenayt06.replit.app/#projects</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://personal-portfolio--serenayt06.replit.app/#recognition</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://personal-portfolio--serenayt06.replit.app/#contact</loc>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>"""
    resp = make_response(content)
    resp.headers['Content-Type'] = 'application/xml'
    return resp


# ═══════════════════════════════════════════════════════════════
#  Pages
# ═══════════════════════════════════════════════════════════════

@app.route('/')
def index():
    return render_template('index.html')


# ═══════════════════════════════════════════════════════════════
#  Contact form  ← LAYER 2 + LAYER 3 fully applied
# ═══════════════════════════════════════════════════════════════

@app.route('/contact', methods=['POST'])
@limiter.limit("5 per minute; 20 per hour; 50 per day",
               error_message="Too many messages sent. Please wait a few minutes and try again.")
def contact():
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    def _fail(msg, status=400):
        if is_ajax:
            return jsonify(success=False, error=msg), status
        flash(msg, 'error')
        return redirect(url_for('index') + '#contact')

    # ── LAYER 2a: Honeypot — bots fill hidden fields, humans don't ──
    if request.form.get('_hp_field', ''):
        logging.warning(f"Honeypot triggered from IP {request.remote_addr}")
        # Silently "succeed" so bots don't know they were caught
        if is_ajax:
            return jsonify(success=True, message="Thank you! I'll get back to you soon.")
        flash("Thank you for your message! I'll get back to you soon.", 'success')
        return redirect(url_for('index') + '#contact')

    # ── LAYER 2b: Sanitize & length-cap every field (bleach) ──────
    name    = sanitize_field(request.form.get('name',    ''), 'name')
    email   = sanitize_field(request.form.get('email',   ''), 'email')
    subject = sanitize_field(request.form.get('subject', ''), 'subject')
    message = sanitize_field(request.form.get('message', ''), 'message')

    if not all([name, email, subject, message]):
        return _fail('Please fill in all fields.')

    # ── LAYER 2c: Email format validation ─────────────────────────
    _email_re = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')
    if not _email_re.match(email):
        return _fail('Please enter a valid email address.')

    # ── LAYER 2d: File attachment security ────────────────────────
    attachment_filename = None
    file_hash_value     = None

    if 'attachment' in request.files:
        file = request.files['attachment']
        if file and file.filename:
            ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''

            if not allowed_file(file.filename):
                return _fail('File type not allowed. Allowed: PDF, image, video, DOC, TXT.')

            # Magic-byte check — extension spoofing protection
            if not validate_file_magic(file, ext):
                logging.warning(
                    f"Magic-byte mismatch for '{file.filename}' (ext={ext}) "
                    f"from IP {request.remote_addr}"
                )
                return _fail('File content does not match its extension. Upload rejected.')

            # SHA-256 integrity hash of file content
            file_hash_value = file_sha256(file)

            safe_name   = secure_filename(file.filename)
            ts          = datetime.utcnow().strftime('%Y%m%d_%H%M%S_')
            unique_name = ts + str(uuid.uuid4())[:8] + '_' + safe_name
            uploads_dir = os.path.join(app.root_path, 'instance', 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            file.save(os.path.join(uploads_dir, unique_name))
            attachment_filename = unique_name
            logging.info(f"Attachment saved: {unique_name}  SHA-256: {file_hash_value[:16]}…")

    # ── LAYER 3: HMAC-SHA-256 with per-submission random salt ─────
    sub_salt    = secrets.token_hex(16)            # 128-bit random salt
    hmac_payload = f"{name}|{email}|{subject}|{message}|{attachment_filename or ''}"
    sub_hmac    = submission_hmac(hmac_payload, sub_salt)

    # ── Log ───────────────────────────────────────────────────────
    logging.info("=" * 60)
    logging.info("CONTACT FORM SUBMISSION")
    logging.info(f"  Name:    {name}")
    logging.info(f"  Email:   {email}")
    logging.info(f"  Subject: {subject}")
    logging.info(f"  HMAC:    {sub_hmac[:16]}…  Salt: {sub_salt[:8]}…")
    if attachment_filename:
        logging.info(f"  File:    {attachment_filename}  SHA-256: {(file_hash_value or '')[:16]}…")
    logging.info("=" * 60)

    # ── Persist JSON backup (with integrity proof) ─────────────────
    try:
        save_submission(
            name, email, subject, message,
            attachment=attachment_filename,
            file_hash=file_hash_value,
            integrity_salt=sub_salt,
            integrity_hmac=sub_hmac,
        )
    except Exception as exc:
        logging.error(f"Failed to save submission backup: {exc}")

    # ── Send email ────────────────────────────────────────────────
    mail_password = os.environ.get('MAIL_PASSWORD')
    if mail_password:
        try:
            recipient = os.environ.get('MAIL_FORWARD_TO', 'Pvarjun527@gmail.com')
            body = (
                f"New message from your portfolio website:\n\n"
                f"Name:    {name}\n"
                f"Email:   {email}\n"
                f"Subject: {subject}\n\n"
                f"Message:\n{message}\n"
            )
            if attachment_filename:
                body += f"\nAttachment stored as: {attachment_filename}\n"
                body += f"File SHA-256: {file_hash_value}\n"
            body += f"\n---\nReply to respond directly to {name} at {email}."
            body += f"\n\nIntegrity: HMAC-SHA256 salt={sub_salt[:8]}… digest={sub_hmac[:16]}…"
            msg = Message(
                subject=f"Portfolio Contact: {subject}",
                recipients=[recipient],
                body=body,
                reply_to=email,
            )
            mail.send(msg)
            logging.info(f"Contact email sent to {recipient}")
        except Exception as exc:
            logging.error(f"Failed to send contact email: {exc}")
    else:
        logging.warning("MAIL_PASSWORD not set — submission saved to JSON, not emailed.")

    if is_ajax:
        return jsonify(success=True, message="Thank you! I'll get back to you soon.")
    flash("Thank you for your message! I'll get back to you soon.", 'success')
    return redirect(url_for('index') + '#contact')


# ═══════════════════════════════════════════════════════════════
#  Static file routes
# ═══════════════════════════════════════════════════════════════

@app.route('/resume')
def resume():
    return render_template('resume.html')


@app.route('/download-cv')
def download_cv():
    assets_dir = os.path.join(app.root_path, 'static', 'assets')
    cv_file = 'arjun_cv.pdf'
    if not os.path.isfile(os.path.join(assets_dir, cv_file)):
        abort(404)
    return send_from_directory(
        assets_dir,
        cv_file,
        as_attachment=True,
        mimetype='application/pdf',
        download_name='Arjun_PV_CV.pdf',
    )


@app.route('/view-cert/<path:filename>')
def view_cert(filename):
    cert_dir  = os.path.join(app.root_path, 'static', 'assets', 'certificates')
    safe_name = os.path.basename(filename)
    full_path = os.path.join(cert_dir, safe_name)
    if not os.path.isfile(full_path):
        abort(404)
    ext  = safe_name.rsplit('.', 1)[-1].lower() if '.' in safe_name else ''
    mime = {
        'pdf':  'application/pdf',
        'jpg':  'image/jpeg',
        'jpeg': 'image/jpeg',
        'png':  'image/png',
    }.get(ext, 'application/octet-stream')
    response = send_from_directory(cert_dir, safe_name, mimetype=mime)
    response.headers['Content-Disposition'] = f'inline; filename="{safe_name}"'
    return response


@app.route('/files/<path:filename>')
def download_file(filename):
    uploads_dir = os.path.join(app.root_path, 'instance', 'uploads')
    safe_name   = os.path.basename(filename)
    if not os.path.isfile(os.path.join(uploads_dir, safe_name)):
        abort(404)
    return send_from_directory(uploads_dir, safe_name, as_attachment=True)


# ─── Health check (uptime monitors, load balancers) ───────────────────────────
@app.route('/health')
@limiter.exempt
def health():
    from datetime import timezone
    return jsonify(
        status='ok',
        service='arjunpv-portfolio',
        timestamp=datetime.now(timezone.utc).isoformat()
    ), 200
