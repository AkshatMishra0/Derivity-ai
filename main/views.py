from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.middleware.csrf import get_token
import json
import re

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
    """Handle user login"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')  # This will be email from frontend
            password = data.get('password')
            
            # Try to authenticate with email as username
            user = authenticate(request, username=username, password=password)
            
            # If that fails, try to find user by email and use their username
            if user is None:
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(request, username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'status': 'success',
                    'message': 'Login successful!',
                    'user': {
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    }
                })
            else:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid email or password'
                })
        except Exception as e:
            print(f"Login error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'There was an error processing your request'
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
    """Handle user signup"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            full_name = data.get('fullName', '').strip()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            newsletter = data.get('newsletter', False)
            
            # Input validation
            if not email or not password:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Email and password are required'
                })
            
            if not validate_email(email):
                return JsonResponse({
                    'status': 'error',
                    'message': 'Please enter a valid email address'
                })
            
            if len(password) < 6:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Password must be at least 6 characters long'
                })
            
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'status': 'error',
                    'message': 'An account with this email already exists'
                })
            
            # Create username from email
            username = email.split('@')[0]
            counter = 1
            original_username = username
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=full_name.split(' ')[0] if full_name else '',
                last_name=' '.join(full_name.split(' ')[1:]) if full_name and len(full_name.split(' ')) > 1 else ''
            )
            
            # Auto-login the user after signup
            login(request, user)
            
            return JsonResponse({
                'status': 'success',
                'message': 'Account created successfully! Welcome to Derivity AI.',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'full_name': f"{user.first_name} {user.last_name}".strip()
                }
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid data format'
            })
        except Exception as e:
            # Log the actual error for debugging
            print(f"Signup error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'There was an error creating your account. Please try again.'
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
    """Check if user is authenticated and return user info"""
    if request.user.is_authenticated:
        return JsonResponse({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'full_name': f"{request.user.first_name} {request.user.last_name}".strip()
            }
        })
    else:
        return JsonResponse({
            'authenticated': False,
            'user': None
        })

@csrf_exempt
@login_required
def get_user_profile(request):
    """Get detailed user profile"""
    if request.method == 'GET':
        user = request.user
        return JsonResponse({
            'status': 'success',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': f"{user.first_name} {user.last_name}".strip(),
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'is_active': user.is_active
            }
        })
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
@login_required
def update_user_profile(request):
    """Update user profile"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user = request.user
            
            # Update allowed fields
            if 'first_name' in data:
                user.first_name = data['first_name'].strip()
            if 'last_name' in data:
                user.last_name = data['last_name'].strip()
            if 'email' in data:
                new_email = data['email'].strip().lower()
                # Check if email is already taken by another user
                if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                    return JsonResponse({
                        'status': 'error',
                        'message': 'This email is already in use by another account'
                    })
                user.email = new_email
            
            user.save()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Profile updated successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'full_name': f"{user.first_name} {user.last_name}".strip()
                }
            })
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid data format'
            })
        except Exception as e:
            print(f"Profile update error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'There was an error updating your profile'
            })
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None
