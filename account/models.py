from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser
from django.contrib.postgres.fields import ArrayField
import datetime,uuid
from django.dispatch import receiver
from phonenumber_field.modelfields import PhoneNumberField

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
        max_length=20)
    last_name=models.CharField(verbose_name='last name',
        max_length=20)
    password=models.CharField(max_length=100)
    account_created=models.DateField(auto_now_add=True,blank=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=True)
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

class Otp(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    otp=models.IntegerField()
    issued_time=models.DateTimeField(auto_now_add=True)

roles=[
    ('Manager','manager'),
    ('Developer','developer'),
    ('Owner','owner'),
    ('Consultant','consultant'),
    ('Contractor','contractor'),
    ('Vp/Director','vp/director'),
]

class Bussiness_Profile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    bussiness_name=models.CharField(max_length=100,blank=False,unique=True)
    public_link=models.CharField(max_length=200)
    category=models.CharField(max_length=100)
    role=models.CharField(max_length=100,choices=roles,default='Manager')
    open_now=models.BooleanField(default=True)




class FieldList(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    fields=models.JSONField()
    fieldlist=ArrayField(models.CharField(max_length=100),default=list)
    policy_status=models.BooleanField(default=False)
    policy=models.TextField(default=None)


class Waitlist(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name="waitlist_for")
    phone_number=PhoneNumberField(null=True,default=None)
    dateofbirth=models.DateField(null=True,default=None)
    email=models.EmailField(null=True,default=None)
    party_size=models.IntegerField(null=True,default=None)
    first_name=models.CharField(null=True,max_length=100,default=None)
    last_name=models.CharField(null=True,max_length=100,default=None)
    notes=models.CharField(null=True,max_length=100,default=None)
    description=models.TextField(null=True,default=None)

