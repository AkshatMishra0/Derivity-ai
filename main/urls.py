from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('about/', views.about, name='about'),
    path('features/', views.features, name='features'),
    path('pricing/', views.pricing, name='pricing'),
    path('contact/', views.contact, name='contact'),
    path('login/', views.login_view, name='login'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('signup/', views.signup_view, name='signup'),
    path('ai-interface/', views.ai_interface, name='ai_interface'),
    
    # API endpoints
    path('api/contact/', views.contact_form, name='contact_form'),
    path('api/login/', views.user_login, name='user_login'),
    path('api/logout/', views.user_logout, name='user_logout'),
    path('api/signup/', views.user_signup, name='user_signup'),
    path('api/ai-chat/', views.ai_chat, name='ai_chat'),
]
