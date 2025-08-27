from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
import json

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
            username = data.get('username')
            password = data.get('password')
            
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'status': 'success',
                    'message': 'Login successful!'
                })
            else:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid username or password'
                })
        except Exception as e:
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
            full_name = data.get('fullName')
            email = data.get('email')
            password = data.get('password')
            newsletter = data.get('newsletter', False)
            
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
            
            # You can add newsletter subscription logic here
            if newsletter:
                # Add to newsletter (implement Newsletter model logic if needed)
                pass
            
            return JsonResponse({
                'status': 'success',
                'message': 'Account created successfully! Welcome to Derivity AI.'
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': 'There was an error creating your account. Please try again.'
            })
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})
