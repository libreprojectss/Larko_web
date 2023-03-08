from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import *
 
 
@receiver(post_save,sender=Waitlist)
def create_notes(sender, instance, created, **kwargs):
    if instance.note:
        note=[instance.note]
    else:
        note=[]
    if created:
        Notes.objects.create(customer=instance,notes=note
        )
        

