from rest_framework import serializers
from .models import *
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .helpers import IdEncodeDecode

class SignUpSerializer(serializers.ModelSerializer):
    password_confirm=serializers.CharField(style={'input_type':'password'}, write_only=True)
    class Meta:
        model = User
        fields=['first_name','last_name','email','password','password_confirm']
        extra_kwargs={
            'password':{'write_only':True}
        }
    def validate(self,args):
            password=args.get('password')
            password_confirm=args.pop('password_confirm')
            if password!=password_confirm:
                raise serializers.ValidationError("passwords dont match")
            return args
    
    def validate_password(self,value):
            if len(value)<8:
                raise serializers.ValidationError("password must be at least 8 characters long")
            return value
            
    def create(self,validated_data):
            return User.objects.create_user(**validated_data)
    
class LoginSerializer(serializers.ModelSerializer):
    email=serializers.EmailField()
    password=serializers.CharField()
    class Meta:
        model=User
        fields=['email','password']
    
    def validate_email(self,email):
        if User.objects.filter(email=email).exists():
            return email
        else:
            raise serializers.ValidationError("User with this email does not exist")


class ChangePasswordSerializer(serializers.Serializer):
    password=serializers.CharField(style={'input_type':'password'}, write_only=True)
    password_confirm=serializers.CharField(style={'input_type':'password'}, write_only=True)
    class Meta:
        fields=['password','password_confirm']
    
    def validate_password(self,value):
        if len(value)<8:
            raise serializers.ValidationError("password must be 8 characters long")
        return value
    
    def validate(self,data):
        password=args.get('password')
        password_confirm=args.pop('password_confirm')
        if password!=password_confirm:
                raise serializers.ValidationError("passwords dont match")
        user=self.context.get("user")
        user.set_password(password)
        user.save()
    
class SendPasswordResetEmailSerializer(serializers.Serializer):
    email=serializers.EmailField()
    class Meta:
        fields=["email"]
    def validate(self,attrs):
        email=attrs.get("email")
        try:
            user=User.objects.get(email=email)
        except:
            raise serializers.ValidationError("User with this email does not exists")
        uid=IdEncodeDecode(user.id)
        token=PasswordResetTokenGenerator().make_token(user)
        link='http://localhost:3000/user/resetpassword/'+uid+"/"+token
        print("password reset link:"+link)

class Bussiness_name_serializer(serializers.Serializer):
    bussiness_name=serializers.CharField(max_length=100)
    class Meta:
        fields=['bussiness_name']
    def validate_bussiness_name(self,data):
        if len(data)<3:
            raise serializers.ValidationError("Bussiness name must me at least of 3 characters")
        elif Bussiness_Profile.objects.filter(bussiness_name__iexact=data).exists():
            raise serializers.ValidationError("This name is unavailable")
        elif not data.isalnum():
            raise serializers.ValidationError("The name must be alphanumeric")
        return data

class Bussiness_Profile_Seriaizer(serializers.ModelSerializer):
    bussiness_name=serializers.CharField(max_length=100,validators=[Bussiness_name_serializer().validate_bussiness_name])
    class Meta:
        model=Bussiness_Profile
        fields=['category','role','open_now','bussiness_name','public_link']
        extra_kwargs={
            'bussiness_name':{'required':True},
            'public_link':{'required':True}

        }
    def create(self,validated_data):
        if Bussiness_Profile.objects.filter(user=validated_data["user"]).exists():
            raise serializers.ValidationError("User already linked with this account")
        profile=Bussiness_Profile(**validated_data)
        profile.save()
        return profile
 
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
    class Meta:
        model:Waitlist
        fields='__all__'
        

      

