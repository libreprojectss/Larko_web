from rest_framework import serializers
from .models import *

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

        