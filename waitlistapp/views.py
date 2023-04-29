from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import *
from account.models import User
from waitlistapp.models import *
from .tools.renderers import WaitlistRenderer
from datetime import date
from rest_framework.response import Response 
from rest_framework import status,serializers
from rest_framework.permissions import BasePermission, IsAuthenticated
import random,base64,json
from django.db.models import F, Window
from django.db.models.functions import Rank

import threading
class RequiredFieldsViews(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request):
        user_fields=FieldList.objects.get(user=request.user)
        fields=user_fields.fieldlist
        print(user_fields.fieldlist)
        field_list=[i for i in user_fields.fields if i['field_name'] in fields]
        return Response(field_list)
    


class WaitListView(APIView):
        renderer_classes=[WaitlistRenderer]
        permission_classes=[IsAuthenticated]
        
        def get(self,request,pk=None):
        
            user_objects=Waitlist.objects.filter(user=request.user,serving=False,served=False).annotate(
             rank=Window(
            expression=Rank(),
            order_by=F('added_time').asc(),
    )
            )

            serializeddata=WaitlistSerializer(user_objects,many=True)
            return Response(serializeddata.data)


        def post(self,request,pk=None):
            print(request.data)
            if request.data.get("notes",None):
                notes=request.data["notes"]
            else:
                notes=None
            user_fields=FieldList.objects.filter(user=request.user).values("fieldlist","fields")[0]
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
            serializeddata=WaitlistSerializer(data=updated_data,context={"notes":notes})
            if serializeddata.is_valid(raise_exception=True):
                    serializeddata.save(user=request.user)
            serializeddata=WaitlistSerializer(Waitlist.objects.filter(user=request.user).annotate(
             rank=Window(
            expression=Rank(),
            order_by=F('added_time').asc(),
    )
            ),many=True)
            return Response(serializeddata.data)
        
        def put(self,request,pk=None):
            try:
                customer=Waitlist.objects.get(id=int(pk))
            except:

                return Response({"AccessError":"The given url is not valid"},status=status.HTTP_400_BAD_REQUEST)        
            if request.user==customer.user:
                user_fields=FieldList.objects.filter(user=request.user).values("fieldlist","fields")[0]
                required_fields=[i["field_name"] for i in  user_fields["fields"] if i["required"]==True]
                error_dict=dict()
                for i in user_fields["fieldlist"]:
                    if not request.data.get(i,False):
                        if i in required_fields:
                            error_dict.update({i:"This field cannot be blank "})
                if error_dict:
                    output={"errors":error_dict}
                    return Response(output,status=status.HTTP_400_BAD_REQUEST)
                
                serializer = WaitlistSerializer(customer, data=request.data,partial=True)

                if serializer.is_valid(raise_exception=True):
                        serializer.save(user=request.user)
                user=request.user
                object_list=user.waitlist_for.all().filter(served=False,serving=False).annotate(
                
             rank=Window(
            expression=Rank(),
            order_by=F('added_time').asc(),
    )
            )
    
                serializer = WaitlistSerializer(object_list,many=True)
                return Response(serializer.data)


            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

            
        def delete(self,request,pk=None):
            try:

                customer=Waitlist.objects.get(id=int(pk))
            except:
                return Response({"AccessError":"The given url is not valid"},status=status.HTTP_400_BAD_REQUEST)        
            if request.user==customer.user:
                customer.delete()
                # user_objects=Waitlist.objects.filter(user=request.user).order_by('added_time')
                user=request.user
                object_list=user.waitlist_for.all().filter(serving=False,served=False).annotate(
                
             rank=Window(
            expression=Rank(),
            order_by=F('added_time').asc(),
    )
            )
    
                serializeddata=WaitlistSerializer(object_list,many=True)
                return Response(serializeddata.data)
            return Response({"AccessError":"The given url is not valid because the given id don't exists"},status=status.HTTP_400_BAD_REQUEST)

            


                


class Servinglist(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request):
        user_objects=Waitlist.objects.filter(user=request.user,serving=True,served=False).annotate(
             rank=Window(
            expression=Rank(),
            order_by=F('added_time').asc(),
    )
            )

        serializeddata=WaitlistSerializer(user_objects,many=True)
        return Response(serializeddata.data)


    def post(self,request,pk=None):
        try:
            serveobj=Waitlist.objects.get(id=pk)
        except:
            return Response({"error":"Some error occured"},status=status.HTTP_502_BAD_GATEWAY)
        serveobj.serving=True
        serveobj.save()
        return Response({"success":"successfully sent for serving"},status=status.HTTP_200_OK)

class Servedlist(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request):
        user_objects=Waitlist.objects.filter(user=request.user,serving=False,served=True).annotate(
             rank=Window(
            expression=Rank(),
            order_by=F('added_time').asc(),
    )
            )

        serializeddata=WaitlistSerializer(user_objects,many=True)
        return Response(serializeddata.data)


    def post(self,request,pk=None):
        try:
            serveobj=Waitlist.objects.get(id=pk)
        except:
            return Response({"error":"Some error occured"},status=status.HTTP_502_BAD_GATEWAY)
        serveobj.serving=False
        serveobj.served=True
        serveobj.save()
        return Response({"success":"successfully served"},status=status.HTTP_200_OK)

class Resources(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request):
        










class AllFieldsView(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def thread1(self,fields,user):
        obj=FieldList.objects.get(user=user)
        obj.fields=fields
        obj.fieldlist=[i["field_name"] for i in fields if i["selected"]==True]
        obj.save()
        print(obj.fieldlist)

    def get(self,request):
        fields=FieldList.objects.get(user=request.user)
        serializeddata=FieldlistSerializer(fields)
        return Response(serializeddata.data)
    def put(self,request):
        serializeddata=FieldsSerializer(data=request.data)
        fields=FieldList.objects.get(user=request.user).fields
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


class NotesView(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request,cid=None,nid=None): #For fetching notes
        try:
            customer=Waitlist.objects.get(id=int(cid))
        except:
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)
        if request.user==customer.user:
            notes=customer.note.all()
            serializeddata=NoteSerializer(notes,many=True)
            return Response(serializeddata.data)
        return Response({"AccessError":"The given url is not valid because the given id don't exists"},status=status.HTTP_502_BAD_GATEWAY)        


    def post(self,request,cid=None,nid=None): #For saving notes
        try:
            customer=Waitlist.objects.get(id=int(cid))
        except:
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)        
        if request.user==customer.user:
            serializeddata=NoteSerializer(data=request.data)
            if serializeddata.is_valid(raise_exception=True):
                data=serializeddata.save(customer_on_waitlist=customer)
                return  Response("notes saved")

        return Response({"AccessError":"The given url is not valid because the given id don't exists"},status=status.HTTP_502_BAD_GATEWAY)        
    
    def delete(self,request,cid=None,nid=None): #For deleting notes
        try:
            notes=Notes.objects.get(id=int(nid))
        except:
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)

        customer=notes.customer_on_waitlist
        if customer.id!=int(cid):
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)


        if request.user==customer.user:
            notes.delete()
            return  Response("notes deleted")    
        return Response({"AccessError":"The given url is not valid because the given id don't exists"},status=status.HTTP_502_BAD_GATEWAY)   

    def put(self,request,cid=None,nid=None): #For updating notes
        try:
            notes=Notes.objects.get(id=int(nid))

        except:
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)

        customer=notes.customer_on_waitlist
        if customer.id!=int(cid):
            print(customer.id)
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)
        if request.user==customer.user:
            serializeddata=NoteSerializer(instance=notes,data=request.data,partial=True)
            if serializeddata.is_valid(raise_exception=True):
                data=serializeddata.save()
                return  Response("notes updated")
        return Response({"AccessError":"The given url is not valid because the given id don't exists"},status=status.HTTP_502_BAD_GATEWAY)

class ServicesViews(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request,pk=None):
        user=request.user
        objectlist=user.services_for.all()
        serializer=ServiceSerializer(objectlist,many=True)
        return Response(serializer.data)
    def post(self,request,pk=None):
        serializer=ServiceSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(user=request.user)
            user=request.user
            objectlist=user.services_for.all()
            serializer=ServiceSerializer(objectlist,many=True)
            return Response(serializer.data)
        return Response(serializer.data)
    def put(self,request,pk=None):
        try:
            serviceobj=Services.objects.get(id=pk)
        except:
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)

        serializer=ServiceSerializer(serviceobj,data=request.data,partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
        return Response({"errors":"Some error occured"},status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request,pk=None):
        try:
            serviceobj=Services.objects.get(id=pk)
        except:
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)
        serviceobj.delete()
        user=request.user
        objectlist=user.services_for.all()
        serializer=ServiceSerializer(objectlist,many=True)
        return Response(serializer.data)

    

        
    

    



        