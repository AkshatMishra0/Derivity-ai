# Derivity AI - Django Backend Setup

## Overview
A fully functional Django backend for the Derivity AI website with admin panel, contact form functionality, and database models.

## Features
- **Contact Form**: Functional contact form that saves messages to database
- **Admin Panel**: Django admin interface for managing messages
- **User Authentication**: Ready for user login/registration
- **AI Chat API**: Placeholder API for future AI integration
- **Database Models**: Contact messages, AI conversations, user profiles

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Migrations
```bash
python manage.py migrate
```

### 3. Create Superuser (Already created)
```
Username: admin
Email: admin@derivityai.com
Password: 12345678
```

### 4. Start Development Server
```bash
python manage.py runserver
```

### 5. Access the Website
- **Frontend**: http://127.0.0.1:8000/
- **Admin Panel**: http://127.0.0.1:8000/admin/
- **Login Page**: http://127.0.0.1:8000/login/
- **Dashboard**: http://127.0.0.1:8000/dashboard/ (after login)

## API Endpoints
- `/api/contact/` - Contact form submission
- `/api/login/` - User authentication
- `/api/logout/` - User logout
- `/api/signup/` - User registration
- `/api/ai-chat/` - AI chat placeholder

## About Page Updates
Updated to reflect:
- Solo founder: Akshat Mishra
- Personal mission and journey
- Removed team references
- Updated timeline for solo development

## File Structure
```
├── derivity_backend/     # Django project settings
├── main/                 # Main Django app
├── manage.py            # Django management script
├── requirements.txt     # Python dependencies
├── db.sqlite3          # SQLite database
└── *.html              # Frontend templates
```

## Admin Access
Visit `/admin/` and login with the superuser credentials to:
- View contact form submissions
- Manage user accounts
- Monitor AI conversations (when implemented)

## Next Steps
1. Integrate with actual AI service
2. Add email notifications for contact form
3. Add email verification for user registration
4. Add newsletter functionality
5. Deploy to production server
