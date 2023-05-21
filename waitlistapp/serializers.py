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


class NoteSerializer(serializers.ModelSerializer):
    notes=serializers.CharField(max_length=200)
    class Meta:
        model=Notes
        fields=['id','notes']
    def create(self,validated_data):
        return Notes.objects.create(**validated_data)

class WaitlistSerializer(serializers.ModelSerializer):
    wait_time = serializers.CharField(read_only=True)
    note=NoteSerializer(many=True,read_only=True) #note is related name so it is used notes would have given an error
    rank=serializers.IntegerField(read_only=True)
    class Meta:
        model=Waitlist
        fields=['phone_number','dateofbirth','validated','self_checkin','email','party_size','first_name','last_name','description','added_time','wait_time','rank','note','id','service']
        extra_fields=['rank','note']
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        service = instance.service
        if service is not None:
            representation['service_name'] = service.service_name
        return representation
   
    def create(self,validated_data):
        try:
            serviceid=validated_data.pop("service")
        except:
            serviceid=None
        note = self.context["notes"]      
        waitlist=Waitlist(**validated_data)
        if note:
            
                waitlist.save()
                Notes.objects.create(customer_on_waitlist=waitlist,notes=note)
        else:
            waitlist.save()
        if serviceid:
            waitlist.service=serviceid
            waitlist.save()
        return waitlist
    
    

class HistorySerializer(serializers.ModelSerializer):
    wait_time = serializers.CharField(read_only=True)
    burst_time = serializers.CharField(read_only=True)

    note=NoteSerializer(many=True,read_only=True) #note is related name so it is used notes would have given an error
    rank=serializers.IntegerField(read_only=True)
    class Meta:
        model=Waitlist
        fields=['phone_number','dateofbirth','email','party_size','first_name','last_name','note','rank','description','added_time','served_time','wait_time','burst_time','id']
        extra_fields=['rank','note']

class ServingSerializer(serializers.ModelSerializer):
    wait_time = serializers.CharField(read_only=True)
    burst_time = serializers.CharField(read_only=True)

    note=NoteSerializer(many=True,read_only=True) #note is related name so it is used notes would have given an error
    rank=serializers.IntegerField(read_only=True)
    class Meta:
        model=Waitlist
        fields=['phone_number','dateofbirth','email','party_size','first_name','last_name','description','added_time','serving_started_time','wait_time','burst_time','rank','note','id']
        extra_fields=['rank','note']

class ServiceSerializer(serializers.ModelSerializer):
    waiting=serializers.IntegerField(read_only=True)
    serving=serializers.IntegerField(read_only=True)

    class Meta:
        model=Services
        fields=['id','service_name','image','category_name','description','duration','price','buffer_time','waiting','serving']
    # def to_internal_value(self, data):
    #     try:
    #         return Service.objects.get(id=data)
    #     except Service.DoesNotExist:
    #         self.fail('does_not_exist', pk_value=data)
    #     except (TypeError, ValueError):
    #         self.fail('incorrect_type', data_type=type(data).__name__)

class ServicesNameSerializer(serializers.ModelSerializer):
    class Meta:
        model=Services
        fields=['id','service_name']


class ResourcesSerializer(serializers.ModelSerializer):
    currently_serving = serializers.SerializerMethodField()

    class Meta:
        model = Resources
        fields = ('id','services','currently_serving',
                  'name', 'image', 'is_available', 'is_free', 'description')
        
    def get_currently_serving(self, obj):
            waitlist = obj.currently_serving
            if waitlist:
                currently_serving={"service_name":"","name":"","serving_for":""}
                service = waitlist.service
                if service:
                    currently_serving["service_name"]=service.service_name
                currently_serving_name =""
                if waitlist.first_name and waitlist.last_name:
                    currently_serving_name = f"{waitlist.first_name} {waitlist.last_name}"
                elif waitlist.first_name:
                    currently_serving_name = waitlist.first_name
                elif waitlist.last_name:
                    currently_serving_name = waitlist.last_name

                currently_serving["name"] = currently_serving_name

                currently_serving["serving_for"]=waitlist.burst_time()
                return currently_serving
            return ""

    
    def create(self, validated_data):
        servicelist = validated_data.pop("services", [])
        validated_data['is_available'] = True
        validated_data['is_free'] = True
        resource = Resources.objects.create(**validated_data)
        resource.services.set(servicelist)

        return resource

    

        

   
        
