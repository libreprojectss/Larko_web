from django.utils.encoding import  smart_str,force_bytes,DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode,urlsafe_base64_encode


class IdEncodeDecode():
    @staticmethod
    def IdEncode(self,value):
        return urlsafe_base64_encode(force_bytes(value))

