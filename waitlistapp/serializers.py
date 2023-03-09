from rest_framework import serializers
from .models import *
import re
class FieldlistSerializer(serializers.ModelSerializer):
    class Meta:
        model=FieldList
        fields=['fields']

class FieldsSerializer(serializers.Serializer):
    field_name=serializers.CharField(max_length=100)
    label=serializers.CharField(max_length=100)
    required=serializers.BooleanField(default=None)
    selected=serializers.BooleanField(default=None)
    class Meta:
        fields=['field_name','label','required','selected']

class WaitlistSerializer(serializers.ModelSerializer):
    rank=serializers.IntegerField(read_only=True)
    class Meta:
        model=Waitlist
        fields='__all__'
        extra_fields=['rank']
    def create(self,validated_data):
        waitlist=Waitlist(**validated_data)
        waitlist.save()
        return waitlist
   
        
class NoteSerializer(serializers.Serializer):
    notes=serializers.CharField(max_length=200)
    class Meta:
        model=Notes
        fields='notes'