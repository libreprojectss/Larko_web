from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import *
from account.models import *
from .renderers import UserRenderer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response 
from rest_framework import status,serializers
from rest_framework.permissions import BasePermission, IsAuthenticated
import random,base64,json
import threading



def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
class SignUpViews(APIView):
    renderer_classes=[UserRenderer]
    def post(self,request):
        serializeddata=SignUpSerializer(data=request.data)
        if serializeddata.is_valid(raise_exception=True):
                user=serializeddata.save()
                token=get_tokens_for_user(user)
                Otp(otp=random.randint(100000,999999),user=user).save()
                return Response({"token":token,"msg":"registration completed sucessfully"},status=status.HTTP_201_CREATED)
        
        return Response({"msg":"data is invalid"},status=status.HTTP_400_BAD_REQUEST)


class LoginViews(APIView):
    renderer_classes=[UserRenderer]
    def post(self,request):
        serializeddata=LoginSerializer(data=request.data)
        if serializeddata.is_valid(raise_exception=True):
            user=User.objects.get(email=serializeddata.data.get("email"))
            if user.check_password(serializeddata.data.get("password")):
                token=get_tokens_for_user(user)
                return Response({"token":token,"msg":"user login sucessful"},status=status.HTTP_200_OK)
            else:
                return Response({"errors":{"password":["Password is incorrect"]}},status=status.HTTP_400_BAD_REQUEST)

class Bussiness_Profile_Views(APIView):
    renderer_classes=[UserRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request):
        obj=Bussiness_Profile.objects.get(user=request.user)
        serializeddata=Bussiness_Profile_Seriaizer(obj)
        return Response({"user":obj.user.first_name+" "+obj.user.last_name,"data":serializeddata.data})
        
    def post(self,request):
        serializeddata=Bussiness_Profile_Seriaizer(data=request.data)
        if serializeddata.is_valid(raise_exception=True):
            serializeddata.save(user=request.user)
            return Response({"msg":"Bussiness account created successfully"},status=status.HTTP_200_OK)
        return Response({"error":"failed to serialize the given data"},status=status.HTTP_403_FAILED)

class CheckBussinessName(APIView):
    renderer_classes=[UserRenderer]
    def post(self,request):
        serializeddata=Bussiness_name_serializer(data=request.data)
        if serializeddata.is_valid(raise_exception=True):
            pass
        return Response({"msg":"Bussiness name is valid"})
        




class ChangePasswordViews(APIView):
    renderer_classes=[UserRenderer]
    def post(self,request):
        serializeddata=ChangePasswordSerializer(data=request.data,context={"user":request.user})
        if serializeddata.is_valid(raise_exception=True):
                return Response({"msg":"Password changed successfully"},status=status.HTTP_200_OK)

class SendPasswordResetEmailViews(APIView):
    renderer_classes=[UserRenderer]
    def post(self,request):
        serializeddata=SendPasswordResetEmailSerializer(data=request.data)
        serializeddata.is_valid(raise_exception=True)
        return Response({"msg":"Please check your email for password reset."},status=status.HTTP_200_OK)

