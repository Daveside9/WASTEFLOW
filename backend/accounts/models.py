from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault('role', 'admin')
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        extra.setdefault('approved', True)
        return self.create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('seller',  'Seller'),
        ('buyer',   'Buyer'),
        ('weigher', 'Weigher'),
        ('admin',   'Admin'),
    ]

    email      = models.EmailField(unique=True)
    full_name  = models.CharField(max_length=150)
    role       = models.CharField(max_length=10, choices=ROLE_CHOICES, default='seller')
    region     = models.CharField(max_length=100, default='Lagos')
    approved   = models.BooleanField(default=False)
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Buyer-only fields
    is_company           = models.BooleanField(default=False)
    company_name         = models.CharField(max_length=200, blank=True)
    registration_number  = models.CharField(max_length=100, blank=True)
    processing_capacity  = models.CharField(max_length=100, blank=True)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name       = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f'{self.full_name} <{self.email}> [{self.role}]'

    @property
    def avatar_initials(self):
        parts = self.full_name.strip().split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[-1][0]).upper()
        return self.full_name[:2].upper() if self.full_name else '??'
