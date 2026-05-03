import os
import logging
from flask import Flask
from flask_mail import Mail

def get_secret(name):
    value = os.environ.get(name)
    if not value:
        raise ValueError(f"Missing secret: {name}")
    return value

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = get_secret("SESSION_SECRET")

# Configure Flask-Mail
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', '587'))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', 'Pvarjun527@gmail.com')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'Pvarjun527@gmail.com')
app.config['MAIL_FORWARD_TO'] = os.environ.get('MAIL_FORWARD_TO', 'Pvarjun527@gmail.com')

# Upload / file settings
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max upload
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'instance', 'uploads')

# Initialize Flask-Mail
mail = Mail(app)

# Import routes
from routes import *

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
