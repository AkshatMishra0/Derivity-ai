from django.contrib import admin
from .models import ContactMessage, UserProfile, AIConversation

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at', 'responded')
    list_filter = ('responded', 'created_at')
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('created_at',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'last_login')
    list_filter = ('created_at', 'last_login')
    search_fields = ('user__username', 'user__email')

@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('session_id', 'message', 'response')
    readonly_fields = ('created_at',)
