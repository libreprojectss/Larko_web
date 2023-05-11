from rest_framework import serializers
from .models import Public_link
from waitlistapp.models import Waitlist
class Public_Link_Serializer(serializers.ModelSerializer):
    class Meta:
        model=Public_link
        fields=["public_access","public_join_link"]

class QueueSerializer(serializers.ModelSerializer):
    rank=serializers.IntegerField(read_only=True)
    class Meta:
        model=Waitlist
        fields=['first_name','wait_time','last_name','service','rank']

