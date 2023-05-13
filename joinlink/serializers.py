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
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        service = instance.service
        if service is not None:
            representation['service_name'] = service.service_name
        return representation

class QueueProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model=Waitlist
        fields=['phone_number','dateofbirth','email','party_size','first_name','last_name','description','added_time','service']
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        service = instance.service
        if service is not None:
            representation['service_name'] = service.service_name
        return representation

