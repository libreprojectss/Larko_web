from django.db import models
from django.contrib.postgres.fields import ArrayField
from account.models import User 
import datetime,uuid
from django.utils import timezone
from django.utils.timesince import timesince
from django.dispatch import receiver
from phonenumber_field.modelfields import PhoneNumberField

class FieldList(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    fields=models.JSONField()
    fieldlist=ArrayField(models.CharField(max_length=100),default=list)
    policy_status=models.BooleanField(default=False,null=False)
    policy=models.TextField(default=None)

class Services(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name="services_for",default=None)
    service_name=models.CharField(max_length=100)
    image=models.ImageField(upload_to='service_images/',default=None)
    category_name=models.CharField(max_length=100)
    description=models.TextField()
    duration=models.IntegerField(default=5)
    price=models.IntegerField(blank=True,default=0)
    buffer_time=models.IntegerField(default=1)


    def __str__(self):
        return self.service_name

class Resources(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name="resources_for",default=None)
    services=models.ManyToManyField(Services)
    currently_serving=models.ForeignKey('Waitlist',on_delete=models.SET_NULL,related_name="currently_served_waitlist",default=None,null=True) #string representation due to circular references
    name=models.CharField(max_length=255)
    image=models.ImageField(upload_to='resource_images/',default=None)
    is_available=models.BooleanField(default=True,null=False)
    is_free=models.BooleanField(default=True,null=False)
    description=models.CharField(max_length=255,blank=True)
    def __str__(self):
        return self.name


class Waitlist(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name="waitlist_for")
    service=models.ForeignKey(Services,on_delete=models.SET_NULL,null=True,default=None,related_name="services_taken")
    resource=models.ForeignKey(Resources,on_delete=models.SET_NULL,related_name="resource",default=None,null=True)
    phone_number=PhoneNumberField(null=True,default=None)
    dateofbirth=models.DateField(null=True,default=None)
    email=models.EmailField(null=True,default=None)
    party_size=models.IntegerField(null=True,default=None)
    first_name=models.CharField(null=True,max_length=100,default=None)
    last_name=models.CharField(null=True,max_length=100,default=None)
    description=models.TextField(null=True,default=None)
    added_time=models.DateTimeField(auto_now_add=True)
    served_time=models.DateTimeField(null=True,default=None)
    serving_started_time=models.DateTimeField(null=True,default=None)
    serving=models.BooleanField(default=False,null=False)
    served=models.BooleanField(default=False,null=False)
    validated=models.BooleanField(default=False,null=False)
    self_checkin=models.BooleanField(default=False,null=False)
    
    def wait_time(self):
        if self.serving_started_time==None:
            current_time = timezone.now()
        else:
            current_time = self.serving_started_time
        time_difference = current_time - self.added_time
        minutes, seconds = divmod(time_difference.seconds, 60)

        
        return {"days":time_difference.days,"minutes": minutes,"seconds":seconds}
    
    def burst_time(self):
        if self.serving_started_time==None:
            return "Not served yet"
        elif self.served_time:
            current_time = self.served_time
        else:
            current_time = timezone.now()
        
        time_difference = current_time - self.serving_started_time
        minutes, seconds = divmod(time_difference.seconds, 60)

        
        return {"days":time_difference.days,"minutes": minutes,"seconds":seconds}
    
    


    class Meta:
        get_latest_by = "added_time"
    

class Notes(models.Model):
    customer_on_waitlist=models.ForeignKey(Waitlist,on_delete=models.CASCADE,related_name='note')
    notes=models.CharField(max_length=100)
    edited_time=models.DateTimeField(auto_now=True)


class ValidationToken(models.Model):
    waitlist=models.OneToOneField(Waitlist,on_delete=models.CASCADE,related_name="waitlist")
    token = models.CharField(max_length=100)
    is_valid = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class First_on_queue(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE,related_name="user_of")
    waitlist=models.ForeignKey(Waitlist,on_delete=models.CASCADE,related_name="waitlist_for")
    started_time=models.DateTimeField(auto_now_add=True)

class Removed(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name="removed_user")
    added_time=models.DateTimeField()
    self_cancelled=models.BooleanField(default=False,blank=True)
    auto_removed=models.BooleanField(default=False,blank=True)



