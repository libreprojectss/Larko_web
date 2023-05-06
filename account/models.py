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
    is_active = models.BooleanField(default=True,null=False)
    is_verified = models.BooleanField(default=True,null=False)
    is_admin = models.BooleanField(default=False,null=False)
    is_staff = models.BooleanField(default=False,null=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name','last_name','password']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
            return True

    def has_module_perms(self, app_label):
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

class Business_Profile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE,related_name="profile_of")
    business_name=models.CharField(max_length=100,blank=False,unique=True)
    business_title=models.CharField(max_length=100)
    category=models.CharField(max_length=100)
    role=models.CharField(max_length=100,choices=roles,default='Manager')
    open_now=models.BooleanField(default=True,null=False)
    business_phone_number=PhoneNumberField(null=True,default=None)
    business_email=models.EmailField(null=True,default=None)
    business_website=models.CharField(max_length=200,null=True,default=None)
    business_address=models.CharField(max_length=50,null=True,default=None)

DAY_CHOICES = [
        ('MONDAY', 'Monday'),
        ('TUESDAY', 'Tuesday'),
        ('WEDNESDAY', 'Wednesday'),
        ('THURSDAY', 'Thursday'),
        ('FRIDAY', 'Friday'),
        ('SATURDAY', 'Saturday'),
        ('SUNDAY', 'Sunday'),]
def default_days_of_week():
    return ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
class OperationSchedule(models.Model):
    business_profile = models.OneToOneField(Business_Profile, on_delete=models.CASCADE, related_name='operation_schedule')
    start_time = models.TimeField(default='10:00')
    end_time = models.TimeField(default='16:00')
    days_of_week =ArrayField(
        models.CharField(max_length=10),
        choices=DAY_CHOICES,
        default=default_days_of_week,
    )

    def __str__(self):
        days = ', '.join(self.days_of_week)
        return f"{days} from {self.start_time} to {self.end_time}"








