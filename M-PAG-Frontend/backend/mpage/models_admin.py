from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from .models import Project, UserProfile  # noqa: F401


class SystemAdmin(models.Model):
    """System administrator - manages accounts and roles"""
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_admin'
        verbose_name = 'System Administrator'
        verbose_name_plural = 'System Administrators'

    def __str__(self):
        return f"{self.username} (System Admin)"

    def set_password(self, raw_password):
        """Hash and store the password"""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Check the password"""
        return check_password(raw_password, self.password)


class UserPlainPassword(models.Model):
    user = models.OneToOneField(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='plain_password',
    )
    password = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_plain_password'
        verbose_name = 'User plain password'
        verbose_name_plural = 'User plain passwords'

    def __str__(self):
        return f"Password for {self.user.username}"
