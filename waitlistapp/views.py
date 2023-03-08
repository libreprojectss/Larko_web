from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import *
from account.models import User
from waitlistapp.models import *
from .tools.renderers import WaitlistRenderer
from rest_framework.response import Response 
from rest_framework import status,serializers
from rest_framework.permissions import BasePermission, IsAuthenticated
import random,base64,json
import threading
# Create your views here.
class RequiredFieldsViews(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request):
        user_fields=Fieldlist.objects.get(user=request.user)
        fields=user_fields.fieldlist
        print(user_fields.fieldlist)
        field_list=[i for i in user_fields.fields if i['field_name'] in fields]
        return Response(field_list)
    


class WaitListView(APIView):
        renderer_classes=[WaitlistRenderer]
        permission_classes=[IsAuthenticated]
        def get(self,request,pk=None):
            user_objects=Waitlist.objects.filter(user=request.user)
            serializeddata=WaitlistSerializer(user_objects,many=True)
            return Response(serializeddata.data)


        def post(self,request,pk=None):
            user_fields=Fieldlist.objects.filter(user=request.user).values("fieldlist","fields")[0]
            updated_data=request.data.copy()
            updated_data.update({"user":request.user.id})
            required_fields=[i["field_name"] for i in  user_fields["fields"] if i["required"]==True]
            error_dict=dict()
            for i in user_fields["fieldlist"]:
                if not request.data.get(i,False):
                    if i in required_fields:
                        error_dict.update({i:"This field cannot be blank "})
            if error_dict:
                output={"errors":error_dict}
                return Response(output,status=status.HTTP_400_BAD_REQUEST)
            serializeddata=WaitlistSerializer(data=updated_data)
            if serializeddata.is_valid(raise_exception=True):
                    serializeddata.save(user=request.user)
            serializeddata=WaitlistSerializer(Waitlist.objects.filter(user=request.user),many=True)
            return Response(serializeddata.data)
        
        def put(self,request,pk):
            try:
                customer=Waitlist.objects.get(id=pk)
            except:

                return Response({"AccessError":"The given url is not valid"},status=status.HTTP_400_BAD_REQUEST)        
            if request.user==customer.user:
                user_fields=Fieldlist.objects.filter(user=request.user).values("fieldlist","fields")[0]
                required_fields=[i["field_name"] for i in  user_fields["fields"] if i["required"]==True]
                error_dict=dict()
                for i in user_fields["fieldlist"]:
                    if not request.data.get(i,False):
                        if i in required_fields:
                            error_dict.update({i:"This field cannot be blank "})
                if error_dict:
                    output={"errors":error_dict}
                    return Response(output,status=status.HTTP_400_BAD_REQUEST)
                serializer = WaitlistSerializer(customer, data=request.data)
                if serializer.is_valid(raise_exception=True):
                        serializer.save()
                user=request.user
                object_list=user.waitlist_for.all()
                print(object_list)
                serializer = WaitlistSerializer(object_list,many=True)
                return Response(serializer.data)


            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

            
        def delete(self,request,pk):
            print(pk)
            try:

                customer=Waitlist.objects.get(id=pk)
            except:
                return Response({"AccessError":"The given url is not valid"},status=status.HTTP_400_BAD_REQUEST)        
            if request.user==customer.user:
                customer.delete()
                user_objects=Waitlist.objects.filter(user=request.user).order_by('added_time')
                serializeddata=WaitlistSerializer(user_objects,many=True)
                return Response(serializeddata.data)
            return Response({"AccessError":"The given url is not valid because the given id don't exists"},status=status.HTTP_400_BAD_REQUEST)

            


                

            


class AllFieldsView(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def thread1(self,fields,user):
        obj=Fieldlist.objects.get(user=user)
        obj.fields=fields
        obj.fieldlist=[i["field_name"] for i in fields if i["selected"]==True]
        obj.save()
        print(obj.fieldlist)

    def get(self,request):
        fields=Fieldlist.objects.get(user=request.user)
        serializeddata=FieldlistSerializer(fields)
        return Response(serializeddata.data)
    def put(self,request):
        serializeddata=FieldsSerializer(data=request.data)
        fields=Fieldlist.objects.get(user=request.user).fields
        if serializeddata.is_valid(raise_exception=True):
            
            for i in fields:
                if i['field_name']==serializeddata.data["field_name"]:
                    i['label']=serializeddata.data["label"]
                    i['required']=serializeddata.data["required"]
                    i['selected']=serializeddata.data["selected"]
            thread1=threading.Thread(target=self.thread1,args=(fields,request.user))
            thread1.start()
            

        
        fields={"fields":fields} 
        fields=json.dumps(fields)
        return Response(fields)


class Notes(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def post(self,request,pk):
        try:
            customer=WaitList.objects.get(id=pk)
        except:
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_400_BAD_REQUEST)        
        if request.user==customer.user:
            serializeddata=NoteSerializer(data=request.data)
            if serializeddata.is_valid(raise_exception=True):
                serializeddata.save(customer=customer)
        return Response({"AccessError":"The given url is not valid because the given id don't exists"},status=status.HTTP_400_BAD_REQUEST)        
       
                


            



        