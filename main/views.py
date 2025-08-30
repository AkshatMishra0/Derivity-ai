from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.middleware.csrf import get_token
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from .models import UserProfile, ContactMessage, AIConversation, LoginAttempt
import json
import re
import uuid
import hashlib
import secrets
from datetime import timedelta
import logging

# Set up logging
logger = logging.getLogger(__name__)

def get_client_ip(request):
    """Get the client's IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_user_agent(request):
    """Get the client's user agent"""
    return request.META.get('HTTP_USER_AGENT', '')

def validate_email(email):
    """Enhanced email validation"""
    if not email:
        return False, "Email is required"
    
    # Basic format validation
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False, "Please enter a valid email address"
    
    # Check for common disposable email domains
    disposable_domains = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
        'mailinator.com', 'throwaway.email', '0-mail.com'
    ]
    domain = email.split('@')[1].lower()
    if domain in disposable_domains:
        return False, "Please use a permanent email address"
    
    # Check email length
    if len(email) > 254:
        return False, "Email address is too long"
    
    return True, "Valid email"

def validate_password(password):
    """Enhanced password validation"""
    if not password:
        return False, "Password is required"
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if len(password) > 128:
        return False, "Password is too long (maximum 128 characters)"
    
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    # Check for at least one digit
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    # Check for common weak passwords
    common_passwords = [
        'password', '12345678', 'qwerty123', 'abc123456',
        'password123', '123456789', 'welcome123'
    ]
    if password.lower() in common_passwords:
        return False, "Password is too common. Please choose a stronger password"
    
    return True, "Valid password"

def validate_name(name):
    """Validate full name"""
    if not name or not name.strip():
        return False, "Full name is required"
    
    name = name.strip()
    if len(name) < 2:
        return False, "Full name must be at least 2 characters long"
    
    if len(name) > 100:
        return False, "Full name is too long (maximum 100 characters)"
    
    # Check for valid characters (letters, spaces, hyphens, apostrophes)
    if not re.match(r"^[a-zA-Z\s\-']+$", name):
        return False, "Full name can only contain letters, spaces, hyphens, and apostrophes"
    
    return True, "Valid name"

def index(request):
    """Homepage view"""
    return render(request, 'index.html')

def about(request):
    """About page view"""
    return render(request, 'about.html')

def features(request):
    """Features page view"""
    return render(request, 'features.html')

def pricing(request):
    """Pricing page view"""
    return render(request, 'pricing.html')

def contact(request):
    """Contact page view"""
    return render(request, 'contact.html')

def login_view(request):
    """Login page view"""
    return render(request, 'login.html')

def dashboard_view(request):
    """Dashboard page view"""
    return render(request, 'dashboard.html')

def ai_interface(request):
    """AI Interface page view"""
    return render(request, 'ai-interface.html')

def signup_view(request):
    """Signup page view"""
    return render(request, 'signup.html')

@csrf_exempt
def contact_form(request):
    """Handle contact form submissions"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            message = data.get('message')
            
            # Here you would typically save to database or send email
            # For now, we'll just return a success response
            
            return JsonResponse({
                'status': 'success',
                'message': 'Thank you for your message! We\'ll get back to you soon.'
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': 'There was an error sending your message. Please try again.'
            })
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def user_login(request):
    """Enhanced user login with security features"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('username', '').strip().lower()  # Frontend sends as 'username' but it's email
            password = data.get('password', '')
            
            # Get client information for security tracking
            client_ip = get_client_ip(request)
            user_agent = get_user_agent(request)
            
            # Input validation
            if not email or not password:
                LoginAttempt.objects.create(
                    email=email,
                    ip_address=client_ip,
                    user_agent=user_agent,
                    success=False,
                    failure_reason='Missing email or password'
                )
                return JsonResponse({
                    'status': 'error',
                    'message': 'Email and password are required'
                })
            
            # Validate email format
            email_valid, email_message = validate_email(email)
            if not email_valid:
                LoginAttempt.objects.create(
                    email=email,
                    ip_address=client_ip,
                    user_agent=user_agent,
                    success=False,
                    failure_reason='Invalid email format'
                )
                return JsonResponse({
                    'status': 'error',
                    'message': 'Please enter a valid email address'
                })
            
            # Try to find user by email
            try:
                user_obj = User.objects.get(email=email)
                
                # Check if account is locked
                profile, created = UserProfile.objects.get_or_create(user=user_obj)
                if profile.is_account_locked():
                    LoginAttempt.objects.create(
                        user=user_obj,
                        email=email,
                        ip_address=client_ip,
                        user_agent=user_agent,
                        success=False,
                        failure_reason='Account locked'
                    )
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Account is temporarily locked due to multiple failed login attempts. Please try again in 30 minutes.'
                    })
                
                # Authenticate user
                user = authenticate(request, username=user_obj.username, password=password)
                
                if user is not None and user.is_active:
                    # Reset failed attempts on successful login
                    profile.reset_failed_attempts()
                    profile.last_login_ip = client_ip
                    profile.save()
                    
                    # Log successful login
                    LoginAttempt.objects.create(
                        user=user,
                        email=email,
                        ip_address=client_ip,
                        user_agent=user_agent,
                        success=True
                    )
                    
                    # Login user
                    login(request, user)
                    
                    # Update last login time
                    user.last_login = timezone.now()
                    user.save()
                    
                    logger.info(f"User {email} logged in from IP {client_ip}")
                    
                    return JsonResponse({
                        'status': 'success',
                        'message': 'Login successful!',
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'email': user.email,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'full_name': f"{user.first_name} {user.last_name}".strip(),
                            'newsletter_subscription': profile.newsletter_subscription
                        }
                    })
                else:
                    # Increment failed attempts
                    profile.increment_failed_attempts()
                    
                    # Log failed login
                    LoginAttempt.objects.create(
                        user=user_obj,
                        email=email,
                        ip_address=client_ip,
                        user_agent=user_agent,
                        success=False,
                        failure_reason='Invalid password'
                    )
                    
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Invalid email or password. Please check your credentials and try again.'
                    })
                    
            except User.DoesNotExist:
                # Log failed login attempt
                LoginAttempt.objects.create(
                    email=email,
                    ip_address=client_ip,
                    user_agent=user_agent,
                    success=False,
                    failure_reason='User not found'
                )
                
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid email or password. Please check your credentials and try again.'
                })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid data format. Please check your input.'
            })
        except Exception as e:
            logger.error(f"Login error for {email if 'email' in locals() else 'unknown'}: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'There was an error processing your login. Please try again.'
            })
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def ai_chat(request):
    """Handle AI chat requests - placeholder for future AI integration"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            message = data.get('message')
            
            # Placeholder response - in the future, integrate with actual AI service
            response = "Thank you for your interest in Derivity AI! We're currently in development and will be launching soon. Stay tuned for updates!"
            
            return JsonResponse({
                'status': 'success',
                'response': response
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': 'There was an error processing your request'
            })
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def user_signup(request):
    """Enhanced user signup with comprehensive validation and security"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            full_name = data.get('fullName', '').strip()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            newsletter = data.get('newsletter', False)
            
            # Get client information for security tracking
            client_ip = get_client_ip(request)
            user_agent = get_user_agent(request)
            
            # Comprehensive input validation
            name_valid, name_message = validate_name(full_name)
            if not name_valid:
                return JsonResponse({
                    'status': 'error',
                    'message': name_message
                })
            
            email_valid, email_message = validate_email(email)
            if not email_valid:
                return JsonResponse({
                    'status': 'error',
                    'message': email_message
                })
            
            password_valid, password_message = validate_password(password)
            if not password_valid:
                return JsonResponse({
                    'status': 'error',
                    'message': password_message
                })
            
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                # Log this attempt for security monitoring
                LoginAttempt.objects.create(
                    email=email,
                    ip_address=client_ip,
                    user_agent=user_agent,
                    success=False,
                    failure_reason='Email already exists'
                )
                return JsonResponse({
                    'status': 'error',
                    'message': 'An account with this email already exists. Please try logging in instead.'
                })
            
            # Create unique username from email
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
                if counter > 1000:  # Prevent infinite loop
                    username = f"{base_username}_{uuid.uuid4().hex[:8]}"
                    break
            
            # Split full name
            name_parts = full_name.split()
            first_name = name_parts[0] if name_parts else ''
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            # Use database transaction for data consistency
            with transaction.atomic():
                # Create user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True  # You can set to False if you want email verification
                )
                
                # Create user profile with additional information
                profile = UserProfile.objects.create(
                    user=user,
                    newsletter_subscription=newsletter,
                    email_verified=True,  # Set to False if implementing email verification
                    last_login_ip=client_ip
                )
                
                # Log successful signup
                LoginAttempt.objects.create(
                    user=user,
                    email=email,
                    ip_address=client_ip,
                    user_agent=user_agent,
                    success=True
                )
                
                # Auto-login the user after signup
                login(request, user)
                
                # Log user login
                user.last_login = timezone.now()
                user.save()
                
                logger.info(f"New user registered: {email} from IP {client_ip}")
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Account created successfully! Welcome to Derivity AI.',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'full_name': f"{user.first_name} {user.last_name}".strip(),
                        'newsletter_subscription': profile.newsletter_subscription
                    }
                })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid data format. Please check your input.'
            })
        except Exception as e:
            # Log the actual error for debugging
            logger.error(f"Signup error for {email if 'email' in locals() else 'unknown'}: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'There was an error creating your account. Please try again later.'
            })
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def user_logout(request):
    """Handle user logout"""
    if request.method == 'POST':
        logout(request)
        return JsonResponse({
            'status': 'success',
            'message': 'Logged out successfully'
        })
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def get_csrf_token(request):
    """Get CSRF token for frontend"""
    return JsonResponse({
        'csrf_token': get_token(request)
    })

@csrf_exempt
def check_auth_status(request):
    """Enhanced auth status check with detailed user info"""
    if request.user.is_authenticated:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        return JsonResponse({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'full_name': f"{request.user.first_name} {request.user.last_name}".strip(),
                'email_verified': profile.email_verified,
                'newsletter_subscription': profile.newsletter_subscription,
                'date_joined': request.user.date_joined.isoformat(),
                'last_login': request.user.last_login.isoformat() if request.user.last_login else None
            }
        })
    else:
        return JsonResponse({
            'authenticated': False,
            'user': None
        })

@csrf_exempt
def user_logout(request):
    """Enhanced user logout with logging"""
    if request.method == 'POST':
        if request.user.is_authenticated:
            user_email = request.user.email
            client_ip = get_client_ip(request)
            logger.info(f"User {user_email} logged out from IP {client_ip}")
        
        logout(request)
        return JsonResponse({
            'status': 'success',
            'message': 'Logged out successfully'
        })
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def contact_form(request):
    """Enhanced contact form with better validation and storage"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name', '').strip()
            email = data.get('email', '').strip().lower()
            message = data.get('message', '').strip()
            
            # Input validation
            name_valid, name_message = validate_name(name)
            if not name_valid:
                return JsonResponse({
                    'status': 'error',
                    'message': name_message
                })
            
            email_valid, email_message = validate_email(email)
            if not email_valid:
                return JsonResponse({
                    'status': 'error',
                    'message': email_message
                })
            
            if not message or len(message.strip()) < 10:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Message must be at least 10 characters long'
                })
            
            if len(message) > 5000:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Message is too long (maximum 5000 characters)'
                })
            
            # Save to database
            contact_message = ContactMessage.objects.create(
                name=name,
                email=email,
                message=message
            )
            
            logger.info(f"New contact message from {email}")
            
            return JsonResponse({
                'status': 'success',
                'message': 'Thank you for your message! We\'ll get back to you soon.'
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid data format'
            })
        except Exception as e:
            logger.error(f"Contact form error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'There was an error sending your message. Please try again.'
            })
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
@login_required
def update_user_profile(request):
    """Enhanced user profile update with validation"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user = request.user
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            updated_fields = []
            
            # Update name fields
            if 'first_name' in data:
                first_name = data['first_name'].strip()
                if first_name:
                    name_valid, name_message = validate_name(first_name)
                    if not name_valid:
                        return JsonResponse({
                            'status': 'error',
                            'message': f"First name: {name_message}"
                        })
                    user.first_name = first_name
                    updated_fields.append('first name')
            
            if 'last_name' in data:
                last_name = data['last_name'].strip()
                if last_name:
                    name_valid, name_message = validate_name(last_name)
                    if not name_valid:
                        return JsonResponse({
                            'status': 'error',
                            'message': f"Last name: {name_message}"
                        })
                    user.last_name = last_name
                    updated_fields.append('last name')
            
            # Update email
            if 'email' in data:
                new_email = data['email'].strip().lower()
                email_valid, email_message = validate_email(new_email)
                if not email_valid:
                    return JsonResponse({
                        'status': 'error',
                        'message': email_message
                    })
                
                # Check if email is already taken by another user
                if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                    return JsonResponse({
                        'status': 'error',
                        'message': 'This email is already in use by another account'
                    })
                
                user.email = new_email
                profile.email_verified = False  # Reset verification status
                updated_fields.append('email')
            
            # Update newsletter subscription
            if 'newsletter_subscription' in data:
                profile.newsletter_subscription = bool(data['newsletter_subscription'])
                updated_fields.append('newsletter subscription')
            
            # Update phone number
            if 'phone_number' in data:
                phone = data['phone_number'].strip()
                if phone:
                    # Basic phone validation
                    phone_pattern = r'^\+?1?\d{9,15}$'
                    if not re.match(phone_pattern, phone):
                        return JsonResponse({
                            'status': 'error',
                            'message': 'Please enter a valid phone number'
                        })
                profile.phone_number = phone
                updated_fields.append('phone number')
            
            # Save changes
            with transaction.atomic():
                user.save()
                profile.save()
            
            logger.info(f"Profile updated for user {user.email}: {', '.join(updated_fields)}")
            
            return JsonResponse({
                'status': 'success',
                'message': f'Profile updated successfully! Updated: {", ".join(updated_fields)}' if updated_fields else 'Profile updated successfully!',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'full_name': f"{user.first_name} {user.last_name}".strip(),
                    'phone_number': profile.phone_number,
                    'newsletter_subscription': profile.newsletter_subscription,
                    'email_verified': profile.email_verified
                }
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid data format'
            })
        except Exception as e:
            logger.error(f"Profile update error for user {request.user.email}: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'There was an error updating your profile'
            })
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def validate_email_api(request):
    """API endpoint to validate email in real-time"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email', '').strip().lower()
            
            email_valid, email_message = validate_email(email)
            
            # Check if email already exists
            email_exists = User.objects.filter(email=email).exists() if email_valid else False
            
            return JsonResponse({
                'valid': email_valid,
                'message': email_message,
                'exists': email_exists
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'valid': False,
                'message': 'Invalid data format'
            })
        except Exception as e:
            logger.error(f"Email validation error: {str(e)}")
            return JsonResponse({
                'valid': False,
                'message': 'Error validating email'
            })
    
    return JsonResponse({'valid': False, 'message': 'Invalid request method'})

# Remove the old validate_email function and replace with the enhanced ones above
def validate_email_old(email):
    """Validate email format - DEPRECATED, use validate_email instead"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None
