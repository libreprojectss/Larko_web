from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser
from django.contrib.postgres.fields import ArrayField
import datetime,uuid
from django.dispatch import receiver

class UserManager(BaseUserManager):
    def create_user(self, email, first_name,last_name,password=None,password_confirm=None):
       
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
           
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name,last_name, password=None):
        user = self.create_user(
            email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password
        )

        user.is_admin = True
        user.is_staff=True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    first_name=models.CharField(verbose_name='first name',
        max_length=255)
    last_name=models.CharField(verbose_name='last name',
        max_length=255)
    password=models.CharField(max_length=100)
    account_created=models.DateField(auto_now_add=True,blank=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name','last_name','password']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
            "Does the user have a specific permission?"
            return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        return True

    @property
    def is_staff(self):
        return self.is_admin
