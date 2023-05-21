from django.db import models
from account.models import *



class Public_link(models.Model):
    profile=models.OneToOneField(Business_Profile,on_delete=models.CASCADE,related_name='public_link_to')
    public_access=models.BooleanField(default=True)
    public_id=models.UUIDField(default=uuid.uuid4, editable=False)
    fernet_key=models.BinaryField()

    def public_join_link(self):
        return("/publicjoin/"+str(self.public_id))

# Create your models here.
