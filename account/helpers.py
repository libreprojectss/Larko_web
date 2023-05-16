from django.utils.encoding import  smart_str,force_bytes,DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode,urlsafe_base64_encode
from .models import Logs

class IdEncodeDecode():
    @staticmethod
    def IdEncode(self,value):
        return urlsafe_base64_encode(force_bytes(value))

def SaveLogs(user,message,level):
    Logs.objects.create(user=user,message=message,level=level)