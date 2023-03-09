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


class NoteSerializer(serializers.Serializer):
    notes=serializers.CharField(max_length=200)
    class Meta:
        model=Notes
        fields='notes'
class WaitlistSerializer(serializers.ModelSerializer):
    note=NoteSerializer(many=True,read_only=True) #note is related name so it is used notes would have given an error
    rank=serializers.IntegerField(read_only=True)
    class Meta:
        model=Waitlist
        fields='__all__'
        extra_fields=['rank','note']
    def create(self,validated_data):
        try:
            note = validated_data.pop('notes')
        except:
            note=None
        waitlist=Waitlist(**validated_data)
        if note:
            
                waitlist.save()
                Notes.objects.create(customer_on_waitlist=waitlist,notes=note)
        else:
            waitlist.save()
        return waitlist
   
        
