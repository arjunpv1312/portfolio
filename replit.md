# Personal Introduction Website

## Overview

This is a personal portfolio website built with Flask that showcases an individual's professional background, interests, and contact information. The application features a single-page design with smooth scrolling navigation, a contact form with email functionality, and a responsive dark-themed interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## Personal Information
- Full Name: Arjun PV
- Email: Pvarjun527@gmail.com
- LinkedIn: https://www.linkedin.com/in/arjun-pv1312
- Education: 
  - SSLC: 2021-2022
  - Plus Two: 2022-2024
  - BTech in Artificial Intelligence and Data Science: 2024-2028
- Programming Skills: Python, HTML/CSS, C++

### Certificates
- Google AI Studio App Deployment (GUVI/HCL)
- Kaggle Python Coder
- AI Tool Creation (SkillEcted)
- AI Workshop Completion
- AWS Cloud
- Microsoft Data Analytics
- Generative AI
- Introduction to Generative AI and Agents
- India AI Impact Buildathon - Certificate of Participation (HCL GUVI, India AI Impact Summit 2026)
- HCL GUVI AI Blogathon - Certificate of Participation (HCL GUVI, Chennai 2026)
- NASSCOM FutureSkills Prime - Yuva AI for All (April 2026)
- Power BI Certification (Business Intelligence & Data Viz)
- Claude Code: The Coding Assistant (Free Course Completion)
- Career Readiness Challenge 2026 - Rank 57 (upDt Education Technology)
- Mindluster Certification (Online Learning Platform)
- Explore Machine Learning with Python (Infosys Springboard)
- Professional Career Development (Skillified Mentor — Industry Orientation)
- IGEN GREENDAY 2024 (Institution of Green Engineers — SDG 17 Pledge)

## System Architecture

The application follows a simple Flask-based architecture with the following characteristics:

- **Frontend**: Single-page application using Bootstrap with dark theme
- **Backend**: Flask web framework with minimal server-side logic
- **Email Service**: Flask-Mail integration for contact form functionality
- **Deployment**: Configured for Replit hosting environment

## Key Components

### Backend Components

1. **Flask Application (`app.py`)**
   - Main application factory with Flask-Mail configuration
   - Environment-based configuration for email settings
   - Session management with secret key

2. **Routing System (`routes.py`)**
   - Home page route serving the main template
   - Contact form handler with email sending capability
   - Basic form validation and error handling

3. **Email Integration**
   - Flask-Mail configured for SMTP email sending
   - Contact form submissions sent via email
   - Configurable email server settings through environment variables

### Frontend Components

1. **Single Page Template (`templates/index.html`)**
   - Bootstrap-based responsive design with dark theme
   - Navigation with smooth scrolling
   - Multiple content sections (home, about, interests, journey, experience, certificates, learning, projects, recognition, contact)

2. **Styling (`static/css/style.css`)**
   - Custom CSS variables for consistent theming
   - Hover effects and transitions
   - Hero section with gradient backgrounds

3. **Interactive Features (`static/js/main.js`)**
   - Dynamic navigation highlighting
   - Scroll-based effects and IntersectionObserver animations
   - AJAX contact form with real-time validation
   - Animated hero counters (17+ certs, #57 national rank, 3 projects)
   - Interactive skill progress bars
   - Project screenshot carousels (3 slides per project, swipe/keyboard/dot nav)
   - Recognition section scroll-reveal animations

## Data Flow

1. **Page Loading**: User visits the site and receives the single-page application
2. **Navigation**: Client-side JavaScript handles smooth scrolling between sections
3. **Contact Form**: 
   - User fills out contact form
   - Form data submitted via POST to `/contact` route
   - Server validates data and sends email via Flask-Mail
   - User redirected back to contact section with flash message

## External Dependencies

### Python Packages
- **Flask**: Web framework for handling HTTP requests and responses
- **Flask-Mail**: Email sending functionality with SMTP support

### Frontend Libraries
- **Bootstrap**: CSS framework with dark theme variant from Replit CDN
- **Font Awesome**: Icon library for UI elements

### Email Service
- **SMTP Server**: Configurable email server (defaults to Gmail SMTP)
- **Environment Variables**: Email credentials and configuration stored securely

## GitHub Sync

The project is configured to automatically push to GitHub after every task merge.

- **Repository**: https://github.com/arjunpv1312/portfolio
- **Mechanism**: `scripts/post-merge.sh` runs after each merge and pushes to the `github` remote
- **Authentication**: Uses the `GITHUB_PAT` secret (stored in Replit Secrets) — do NOT use the Replit GitHub integration, use this PAT-based approach instead
- **Remote**: The `github` remote URL is a plain HTTPS URL; the PAT is injected temporarily via a git credential helper at push time and is never stored in the remote URL or git config
- No manual git push steps are required

## Deployment Strategy

### Environment Configuration
- **Development**: Debug mode enabled with localhost binding
- **Production**: Environment variables for secure configuration
- **Replit Integration**: Configured for Replit's hosting environment

### Required Environment Variables
- `SESSION_SECRET`: Flask session encryption key
- `MAIL_SERVER`: SMTP server address
- `MAIL_PORT`: SMTP server port
- `MAIL_USE_TLS`: TLS encryption flag
- `MAIL_USERNAME`: Email account username
- `MAIL_PASSWORD`: Email account password
- `MAIL_DEFAULT_SENDER`: Default sender email address

### Deployment Considerations
- Static files served directly by Flask in development
- Contact form requires proper email configuration
- No database dependencies for simple deployment
- Single entry point through `main.py` for consistent startup

## Technical Notes

- **No Database**: Application is stateless with no persistent data storage
- **Client-Side Navigation**: Uses JavaScript for smooth scrolling between sections
- **Email Validation**: Basic server-side validation for contact form fields
- **Error Handling**: Flash messages for user feedback on contact form submission
- **Responsive Design**: Mobile-first approach with Bootstrap grid system