from django.contrib import admin
from .models import ContactMessage, UserProfile, AIConversation, LoginAttempt

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at', 'responded')
    list_filter = ('responded', 'created_at')
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('created_at',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_verified', 'newsletter_subscription', 'created_at', 'failed_login_attempts')
    list_filter = ('email_verified', 'newsletter_subscription', 'created_at', 'failed_login_attempts')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'user', 'created_at', 'ip_address')
    list_filter = ('created_at',)
    search_fields = ('session_id', 'message', 'response', 'user__email')
    readonly_fields = ('created_at',)

@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('email', 'success', 'ip_address', 'timestamp', 'failure_reason')
    list_filter = ('success', 'timestamp', 'failure_reason')
    search_fields = ('email', 'ip_address', 'user_agent')
    readonly_fields = ('timestamp',)
    
    def has_add_permission(self, request):
        return False  # Prevent manual addition
    
    def has_change_permission(self, request, obj=None):
        return False  # Prevent editing
