from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from accounts.models import Business_Profile
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import *
import random
from .helpers import generate_token
 
@receiver(post_save,sender=Waitlist)
def create_notes(sender, instance, created, **kwargs):
    if instance.note:
        note=[instance.note]
    else:
        note=[]
    if created:
        Notes.objects.create(customer=instance,notes=note
        )

@receiver([post_save, post_delete], sender=Waitlist)
def on_waitlist_change(sender,instance, **kwargs):
    profile=Business_Profile.objects.get(user=instance.user).business_name
    channel_layer = get_channel_layer()
    print("changed")
    async_to_sync(channel_layer.group_send)(
        profile, 
        {
            "type": "waitlist_changed"
        }
    )
        

