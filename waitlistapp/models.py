from django.db import models
from django.contrib.postgres.fields import ArrayField
from account.models import User 
import datetime,uuid
from django.dispatch import receiver
from phonenumber_field.modelfields import PhoneNumberField

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
    added_time=models.DateTimeField(auto_now_add=True)
    
    class Meta:
        get_latest_by = "added_time"

class Notes(models.Model):
    customer_on_waitlist=models.ForeignKey(Waitlist,on_delete=models.CASCADE,related_name='note')
    notes=ArrayField(models.CharField(max_length=100),default=list)
    edited_time=models.DateTimeField(auto_now=True)
