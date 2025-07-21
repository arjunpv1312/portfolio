from flask import render_template, request, flash, redirect, url_for, jsonify
from flask_mail import Message
from app import app, mail
import logging

@app.route('/')
def index():
    """Main route for the personal introduction website"""
    return render_template('index.html')

@app.route('/contact', methods=['POST'])
def contact():
    """Handle contact form submission"""
    try:
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        subject = request.form.get('subject', '').strip()
        message = request.form.get('message', '').strip()
        
        # Basic validation
        if not all([name, email, subject, message]):
            flash('Please fill in all fields.', 'error')
            return redirect(url_for('index') + '#contact')
        
        # Prepare recipient list
        recipients = []
        default_sender = app.config.get('MAIL_DEFAULT_SENDER')
        forward_to = app.config.get('MAIL_FORWARD_TO')
        
        if default_sender:
            recipients.append(default_sender)
        if forward_to and forward_to != default_sender:
            recipients.append(forward_to)
            
        if not recipients:
            recipients = ['your-email@example.com']  # fallback
        
        # Create email message
        msg = Message(
            subject=f"Portfolio Contact: {subject}",
            recipients=recipients,
            body=f"""
New message from your portfolio website:

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}

---
This message was sent through the contact form on Arjun PV's portfolio website.
Reply directly to this email to respond to {name} at {email}.
            """,
            reply_to=email
        )
        
        # Send email
        mail.send(msg)
        
        # Log successful forwarding
        if len(recipients) > 1:
            logging.info(f"Contact form message forwarded to {len(recipients)} recipients")
        flash('Thank you for your message! I\'ll get back to you soon.', 'success')
        
    except Exception as e:
        logging.error(f"Error sending email: {str(e)}")
        flash('Sorry, there was an error sending your message. Please try again later.', 'error')
    
    return redirect(url_for('index') + '#contact')
