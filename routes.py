import os
from flask import render_template, request, flash, redirect, url_for, jsonify, send_from_directory, abort
from flask_mail import Message
from app import app, mail
import logging

@app.route('/view-cert/<path:filename>')
def view_cert(filename):
    """Serve certificate files inline (no download prompt)"""
    cert_dir = os.path.join(app.root_path, 'static', 'assets', 'certificates')
    safe_name = os.path.basename(filename)
    full_path = os.path.join(cert_dir, safe_name)
    if not os.path.isfile(full_path):
        abort(404)
    ext = safe_name.rsplit('.', 1)[-1].lower()
    mime_types = {'pdf': 'application/pdf', 'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg'}
    mime = mime_types.get(ext, 'application/octet-stream')
    response = send_from_directory(cert_dir, safe_name, mimetype=mime)
    response.headers['Content-Disposition'] = f'inline; filename="{safe_name}"'
    return response


@app.route('/')
def index():
    """Main route for the personal introduction website"""
    return render_template('index.html')

@app.route('/contact', methods=['POST'])
def contact():
    """Handle contact form submission"""
    name    = request.form.get('name', '').strip()
    email   = request.form.get('email', '').strip()
    subject = request.form.get('subject', '').strip()
    message = request.form.get('message', '').strip()

    if not all([name, email, subject, message]):
        flash('Please fill in all fields.', 'error')
        return redirect(url_for('index') + '#contact')

    # Always log the submission so nothing is ever lost
    logging.info("=" * 60)
    logging.info("CONTACT FORM SUBMISSION")
    logging.info(f"  Name:    {name}")
    logging.info(f"  Email:   {email}")
    logging.info(f"  Subject: {subject}")
    logging.info(f"  Message: {message}")
    logging.info("=" * 60)

    mail_password = os.environ.get('MAIL_PASSWORD')
    if not mail_password:
        # Email not configured yet — submission is logged but not emailed
        logging.warning("MAIL_PASSWORD not set — message logged only, not emailed.")
        flash("Thank you for your message! I'll get back to you soon.", 'success')
        return redirect(url_for('index') + '#contact')

    try:
        recipient = os.environ.get('MAIL_FORWARD_TO', 'Pvarjun527@gmail.com')
        msg = Message(
            subject=f"Portfolio Contact: {subject}",
            recipients=[recipient],
            body=f"""New message from your portfolio website:

Name:    {name}
Email:   {email}
Subject: {subject}

Message:
{message}

---
Reply to this email to respond directly to {name} at {email}.
""",
            reply_to=email
        )
        mail.send(msg)
        logging.info(f"Contact email sent to {recipient}")
        flash("Thank you for your message! I'll get back to you soon.", 'success')

    except Exception as e:
        logging.error(f"Failed to send contact email: {str(e)}")
        flash("Thank you for reaching out! I received your message and will reply shortly.", 'success')

    return redirect(url_for('index') + '#contact')
