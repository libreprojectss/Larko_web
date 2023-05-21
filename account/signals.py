from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from joinlink.models import Public_link
from .models import *
from waitlistapp.models import FieldList
from cryptography.fernet import Fernet
 
 
@receiver(post_save,sender=Business_Profile)
def create_fieldlist(sender, instance, created, **kwargs):
    if created:
        FieldList.objects.create(user=instance.user,fields=
        [
            {"field_name":"phone_number","label":"Phone number","required":True,"selected":True},
            {"field_name":"dateofbirth","label":"Date of birth","required":False,"selected":False},
            {"field_name":"email","label":"Email","required":True,"selected":True},
            {"field_name":"party_size","label":"Party Size","required":False,"selected":False},
            {"field_name":"first_name","label":"First Name","required":True,"selected":True},
            {"field_name":"last_name","label":"Last Name","required":False,"selected":True},
            {"field_name":"notes","label":"Notes","required":False,"selected":True},
            {"field_name":"description","label":"Description","required":True,"selected":False}
        ],fieldlist=["email","phone_number","first_name", "last_name","notes"],
        policy="")
        
@receiver(post_save,sender=Business_Profile)
def create_public_link(sender,instance,created, **kwargs):
    if created:
        Public_link.objects.create(profile=instance,fernet_key=Fernet.generate_key())
        OperationSchedule.objects.create(business_profile=instance,operation_time=[
            {"day":"SUNDAY","start_time":"10:00","end_time":"16:00","holiday":False},
            {"day":"MONDAY","start_time":"10:00","end_time":"16:00","holiday":False},
            {"day":"TUESDAY","start_time":"10:00","end_time":"16:00","holiday":False},
            {"day":"WEDNESDAY","start_time":"10:00","end_time":"16:00","holiday":False},
            {"day":"THURSDAY","start_time":"10:00","end_time":"16:00","holiday":False},
            {"day":"FRIDAY","start_time":"10:00","end_time":"14:00","holiday":False},
            {"day":"SATURDAY","start_time":"10:00","end_time":"16:00","holiday":True},


        ])


