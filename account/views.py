from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import *
from account.models import *
from .renderers import UserRenderer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response 
from rest_framework import status,serializers




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
                return Response({"token":token,"msg":"user login sucessfull"},status=status.HTTP_200_OK)
            else:
                return Response({"errors":{"password":["Password is incorrect"]}},status=status.HTTP_400_BAD_REQUEST)



    
