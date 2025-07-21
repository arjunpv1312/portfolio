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
        
        # Create email message
        msg = Message(
            subject=f"Portfolio Contact: {subject}",
            recipients=[app.config.get('MAIL_DEFAULT_SENDER', 'your-email@example.com')],
            body=f"""
New message from your portfolio website:

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}
            """,
            reply_to=email
        )
        
        # Send email
        mail.send(msg)
        flash('Thank you for your message! I\'ll get back to you soon.', 'success')
        
    except Exception as e:
        logging.error(f"Error sending email: {str(e)}")
        flash('Sorry, there was an error sending your message. Please try again later.', 'error')
    
    return redirect(url_for('index') + '#contact')
