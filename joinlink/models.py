from django.db import models
from account.models import *
from cryptography.fernet import Fernet


class Public_link(models.Model):
    profile=models.OneToOneField(User,on_delete=models.CASCADE,related_name='public_link_to')
    public_access=models.BooleanField(default=True)
    public_id=models.UUIDField(default=uuid.uuid4, editable=False)
    fernet_key=models.BinaryField(default=Fernet.generate_key())

    def public_join_link(self):
        return("/publicjoin/"+self.profile.business_name+"/"+str(public_id))
# Create your models here.
