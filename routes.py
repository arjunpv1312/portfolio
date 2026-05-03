import os
import json
import logging
from datetime import datetime
from flask import render_template, request, flash, redirect, url_for, jsonify, send_from_directory, abort
from flask_mail import Message
from werkzeug.utils import secure_filename
from app import app, mail

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'txt'}

def allowed_file(filename):
    return '.' in filename and '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_submission(name, email, subject, message, attachment=None):
    """Persist every contact form submission to JSON — backup if email fails."""
    path = os.path.join(app.root_path, 'instance', 'submissions.json')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    submissions = []
    if os.path.exists(path):
        try:
            with open(path, 'r') as f:
                submissions = json.load(f)
        except Exception:
            submissions = []
    submissions.append({
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'name': name,
        'email': email,
        'subject': subject,
        'message': message,
        'attachment': attachment,
    })
    with open(path, 'w') as f:
        json.dump(submissions, f, indent=2)


# ── File downloads ────────────────────────────────────────────
@app.route('/download-cv')
def download_cv():
    """Serve the CV PDF with Content-Disposition: attachment so browsers download it."""
    assets_dir = os.path.join(app.root_path, 'static', 'assets')
    cv_file = 'arjun_cv.pdf'
    if not os.path.isfile(os.path.join(assets_dir, cv_file)):
        abort(404)
    return send_from_directory(
        assets_dir,
        cv_file,
        as_attachment=True,
        download_name='Arjun_PV_CV.pdf',
        mimetype='application/pdf',
    )


@app.route('/view-cert/<path:filename>')
def view_cert(filename):
    """Serve certificate files inline (no download prompt)."""
    cert_dir = os.path.join(app.root_path, 'static', 'assets', 'certificates')
    safe_name = os.path.basename(filename)
    full_path = os.path.join(cert_dir, safe_name)
    if not os.path.isfile(full_path):
        abort(404)
    ext = safe_name.rsplit('.', 1)[-1].lower()
    mime_types = {
        'pdf': 'application/pdf',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
    }
    mime = mime_types.get(ext, 'application/octet-stream')
    response = send_from_directory(cert_dir, safe_name, mimetype=mime)
    response.headers['Content-Disposition'] = f'inline; filename="{safe_name}"'
    return response


@app.route('/files/<path:filename>')
def download_file(filename):
    """Download a previously uploaded file (e.g. contact attachment)."""
    uploads_dir = os.path.join(app.root_path, 'instance', 'uploads')
    safe_name = os.path.basename(filename)
    if not os.path.isfile(os.path.join(uploads_dir, safe_name)):
        abort(404)
    return send_from_directory(uploads_dir, safe_name, as_attachment=True)


# ── Pages ─────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')


# ── Contact form ──────────────────────────────────────────────
@app.route('/contact', methods=['POST'])
def contact():
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    name    = request.form.get('name', '').strip()
    email   = request.form.get('email', '').strip()
    subject = request.form.get('subject', '').strip()
    message = request.form.get('message', '').strip()

    if not all([name, email, subject, message]):
        if is_ajax:
            return jsonify(success=False, error='Please fill in all fields.'), 400
        flash('Please fill in all fields.', 'error')
        return redirect(url_for('index') + '#contact')

    # ── Optional file attachment ──────────────────────────────
    attachment_filename = None
    if 'attachment' in request.files:
        file = request.files['attachment']
        if file and file.filename:
            if not allowed_file(file.filename):
                err = 'File type not allowed. Please attach a PDF, image, or video.'
                if is_ajax:
                    return jsonify(success=False, error=err), 400
                flash(err, 'error')
                return redirect(url_for('index') + '#contact')
            safe_name = secure_filename(file.filename)
            ts = datetime.utcnow().strftime('%Y%m%d_%H%M%S_')
            safe_name = ts + safe_name
            uploads_dir = os.path.join(app.root_path, 'instance', 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            file.save(os.path.join(uploads_dir, safe_name))
            attachment_filename = safe_name
            logging.info(f"Attachment saved: {safe_name}")

    # ── Log always ────────────────────────────────────────────
    logging.info("=" * 60)
    logging.info("CONTACT FORM SUBMISSION")
    logging.info(f"  Name:       {name}")
    logging.info(f"  Email:      {email}")
    logging.info(f"  Subject:    {subject}")
    logging.info(f"  Message:    {message}")
    if attachment_filename:
        logging.info(f"  Attachment: {attachment_filename}")
    logging.info("=" * 60)

    # ── Always save JSON backup ───────────────────────────────
    try:
        save_submission(name, email, subject, message, attachment=attachment_filename)
    except Exception as exc:
        logging.error(f"Failed to save submission backup: {exc}")

    # ── Try email ─────────────────────────────────────────────
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
            body += f"\n---\nReply to respond directly to {name} at {email}."
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
