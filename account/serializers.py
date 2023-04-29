from rest_framework import serializers
from .models import *
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .helpers import IdEncodeDecode
import re

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
            # if len(value)<8:
            #     raise serializers.ValidationError("password must be at least 8 characters long")
            pattern=r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$" #Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
            if not re.search(pattern,value):
                raise serializers.ValidationError("password must contain minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character")


            return value
    
    def validate_email(self,value):
        pattern=r"^[a-zA-Z0-9._%+-]+@gmail\.com$"
        x = re.search(pattern,value)
        if(x==None):
            raise serializers.ValidationError("the provided email is not in gmail format")
        return value



    def validate_first_name(self,value):
        if len(value)<3:
                raise serializers.ValidationError("First name length must be at 3 characters")
        pattern=r"^[a-zA-Z]+$"
        if not re.search(pattern,value):
                raise serializers.ValidationError("Name should only contain alphabets")
        
        
        return value
    
    def validate_last_name(self,value):
        if len(value)<3:
                raise serializers.ValidationError("Last name length must be at 3 characters")
        pattern=r"^[a-zA-Z]+$"
        if not re.search(pattern,value):
                raise serializers.ValidationError("Name should only contain alphabets")
        
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
    
    def validate(self,args):
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

class Business_name_serializer(serializers.Serializer):
    business_name=serializers.CharField(max_length=100)
    class Meta:
        fields=['business_name']
    def validate_business_name(self,data):
        if len(data)<3:
            raise serializers.ValidationError("Business name must me at least of 3 characters")
        elif Business_Profile.objects.filter(business_name__iexact=data).exists():
            raise serializers.ValidationError("This name is unavailable")
        elif not data.isalnum():
            raise serializers.ValidationError("The name must be alphanumeric")
        return data

class Business_Profile_Serializer(serializers.ModelSerializer):
    business_name=serializers.CharField(max_length=100,validators=[Business_name_serializer().validate_business_name])
    class Meta:
        model=Business_Profile
        fields=['category','role','open_now','business_name','business_title','public_link']
        extra_kwargs={
            'business_name':{'required':True},
            'public_link':{'required':True},
            

        }
    def create(self,validated_data):
        if Business_Profile.objects.filter(user=validated_data["user"]).exists():
            raise serializers.ValidationError("User already linked with this account")
        profile=Business_Profile(**validated_data)
        profile.save()
        return profile

class Business_Edit_Serializer(serializers.ModelSerializer):
    class Meta:
        model=Business_Profile
        fields=['category','role','open_now','business_name','business_title','public_link']