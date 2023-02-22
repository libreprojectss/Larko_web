from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import *
 
 
@receiver(post_save,sender=Bussiness_Profile)
def create_fieldlist(sender, instance, created, **kwargs):
    if created:
        FieldList.objects.create(user=instance.user,fields=
        [
            {"field_name":"phone_number","label":"Phone number","required":True},
            {"field_name":"dateofbirth","label":"Date of birth","required":False},
            {"field_name":"email","label":"Email","required":True},
            {"field_name":"party_size","label":"Party Size","required":False},
            {"field_name":"first_name","label":"First Name","required":True},
            {"field_name":"last_name","label":"Last Name","required":False},
            {"field_name":"notes","label":"Notes","required":False},
            {"field_name":"description","label":"Description","required":True}
        ],fieldlist=["email","first_name", "last_name","notes"],
        policy="")
        

