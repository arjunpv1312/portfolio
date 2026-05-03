import os
import logging
from flask import Flask
from flask_mail import Mail
from flask_compress import Compress
from flask_talisman import Talisman, DENY
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect

# ── Logging ───────────────────────────────────────────────────
logging.basicConfig(level=logging.DEBUG)

# ── App ───────────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# ── Session cookie hardening ──────────────────────────────────
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE']   = False   # True in prod (Replit handles TLS)

# ── CSRF ─────────────────────────────────────────────────────
app.config['WTF_CSRF_HEADERS']     = ['X-CSRFToken']
app.config['WTF_CSRF_TIME_LIMIT']  = 3600          # 1 hour token lifetime
csrf = CSRFProtect(app)

# ── Flask-Mail ────────────────────────────────────────────────
app.config['MAIL_SERVER']         = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT']           = int(os.environ.get('MAIL_PORT', '587'))
app.config['MAIL_USE_TLS']        = True
app.config['MAIL_USE_SSL']        = False
app.config['MAIL_USERNAME']       = os.environ.get('MAIL_USERNAME', 'Pvarjun527@gmail.com')
app.config['MAIL_PASSWORD']       = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'Pvarjun527@gmail.com')
app.config['MAIL_FORWARD_TO']     = os.environ.get('MAIL_FORWARD_TO', 'Pvarjun527@gmail.com')

# ── Upload settings ───────────────────────────────────────────
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['UPLOAD_FOLDER']      = os.path.join(app.root_path, 'instance', 'uploads')

# ── Initialise extensions ─────────────────────────────────────
mail = Mail(app)

# ── Gzip compression ─────────────────────────────────────────
app.config['COMPRESS_REGISTER'] = True
app.config['COMPRESS_LEVEL']    = 6
app.config['COMPRESS_MIN_SIZE'] = 500
Compress(app)

# ── Rate limiting (in-memory, no Redis required) ──────────────
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["500 per day", "100 per hour"],
    storage_uri="memory://",
)

# ── Security headers — LAYER 1 ────────────────────────────────
# Content Security Policy: whitelist every CDN the site uses.
_CSP = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        "'unsafe-inline'",          # Bootstrap + inline onkeydown handler
        'cdn.jsdelivr.net',
        'cdnjs.cloudflare.com',
    ],
    'style-src': [
        "'self'",
        "'unsafe-inline'",          # Inline <style> block + Bootstrap dark theme
        'cdn.replit.com',
        'cdn.jsdelivr.net',
        'cdnjs.cloudflare.com',
        'fonts.googleapis.com',
    ],
    'font-src': [
        "'self'",
        'cdnjs.cloudflare.com',
        'fonts.gstatic.com',
        'cdn.replit.com',
        'data:',
    ],
    'img-src':     ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'"],
    'frame-src':   ["'none'"],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri':    ["'self'"],
    'object-src':  ["'none'"],
}

Talisman(
    app,
    force_https=False,                              # Replit proxy handles TLS
    strict_transport_security=True,
    strict_transport_security_max_age=31536000,     # 1 year HSTS
    strict_transport_security_include_subdomains=True,
    x_content_type_options=True,                    # nosniff
    frame_options=DENY,                             # X-Frame-Options: DENY
    referrer_policy='strict-origin-when-cross-origin',
    content_security_policy=_CSP,
    content_security_policy_report_only=False,
    session_cookie_secure=False,                    # Replit handles TLS
    session_cookie_http_only=True,
    session_cookie_samesite='Lax',
    permissions_policy={
        'geolocation': '()',
        'microphone':  '()',
        'camera':      '()',
        'payment':     '()',
        'usb':         '()',
    },
)

# ── Minify assets on startup ──────────────────────────────────
try:
    from build_assets import minify_assets
    minify_assets()
except Exception as _e:
    logging.warning(f"Asset minification skipped: {_e}")

# ── Routes & Admin ────────────────────────────────────────────
from routes import *   # noqa: F401, E402
from admin  import *   # noqa: F401, E402

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
