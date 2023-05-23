from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import *
import pandas as pd
from time import sleep
from io import BytesIO
from django.http import HttpResponse
from corsheaders.defaults import default_headers
from django.http import StreamingHttpResponse
from account.models import User,Business_Profile,OperationSchedule
from django.utils import timezone
from waitlistapp.models import *
from .tools.renderers import WaitlistRenderer
from .tools.helpers import send_email,send_sms,generate_token,prepare_excel_data
from .tools.calculate_stat import calculate_stats
from .timefunc import *
from datetime import date,timedelta,time,datetime
from rest_framework.response import Response 
from rest_framework import status,serializers
from rest_framework.permissions import BasePermission, IsAuthenticated
import random,base64,json
from django.db.models import F, Window,Count,Q
from django.db.models.functions import Rank
import threading


def sendsms_thread(waitlistobj,msg1,msg2,subject="Larko reminder"): #For sending sms msg1=msg for sms and msg2-message for mails

                    if waitlistobj.phone_number:
                        try:
                            send_sms(message=msg1,to_number=waitlistobj.phone_number)
                        except:
                            pass
                    if waitlistobj.email:
                        send_email(message=msg2,to_email=waitlistobj.email,subject=subject)

def allocate_resource_thread(waitlistobj,user): #Auto allocation of resources to a particular waitlist
    resource=Resources.objects.filter(user=user,is_available=True,is_free=True) #get all resources that are free at the moment
    if resource.exists():
        if waitlistobj.service:
            #get all resources which service array have the waitlistobj.service
            resources = resource.filter(service__in=[waitlistobj.service])
            waitlistobj.resource = resources[0]
            waitlistobj.save()
            #allocate the resource
            Resources.objects.filter(id=resources[0].id).update(is_free=False,currently_serving=waitlistobj)
            print("resource alloted")

        else:
            #if there is no service allocated to the waitlist because the system have not specified any particular service
            waitlistobj.resource=resource[0]
            #here the resource which is free and first on the list has been selected automatically
            waitlistobj.save()
            Resources.objects.filter(id=resource[0].id).update(is_free=False,currently_serving=waitlistobj)
            print("resource alloted")

            
#Get all services for the user       
class Getservices(APIView):
    
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request):
        servicesobj=Services.objects.filter(user=request.user)
        serialized_data=ServicesNameSerializer(servicesobj,many=True)
        return Response(serialized_data.data)

#Get required fields which are to be filled in the waitlist manual section
class RequiredFieldsViews(APIView): 
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request):
        user_fields=FieldList.objects.get(user=request.user)
        fields=user_fields.fieldlist
        field_list=[i for i in user_fields.fields if i['field_name'] in fields]
        services=Services.objects.filter(user=request.user)
        service_list=[{"name":i.service_name,"duration":i.duration,"id":i.id} for i in services]
        return Response({"field_list":field_list,"services":service_list})
    




class WaitListView(APIView): #View that controls crud operations in the waitlist
        renderer_classes=[WaitlistRenderer]
        permission_classes=[IsAuthenticated]
        def smsthread1(self,waitlistobj,user): #Seperate thread for waitlist to send sms and mails
                    business_name=Business_Profile.objects.get(user=user).business_name

                    ordered=Waitlist.objects.filter(user=user,serving=False,served=False).order_by('added_time')
                    rank=list(ordered).index(waitlistobj)+1
                    if waitlistobj.phone_number:

                        msg=f"You have been added to the queue of {business_name}.You are at {rank} position."
                        try:
                            send_sms(message=msg,to_number=waitlistobj.phone_number)
                        except:
                            pass
                
                    if waitlistobj.email:
                        msg=f"<h3 style='color:black'>Dear customer,</h3><p style='color:black'>You ahve been added to the waitlist of business <strong>{business_name}</strong></p><h2 style='color:black'> Your current position in the queue is <strong>{rank}</strong></h2></p><p style='color:black'>We appreciate your patience as we work to ensure that each customer receives the best possible service.</p><p style='color:black'>If you have any questions or concerns, please don't hesitate to contact us at <a href='mailto:larkoinc@gmail.com'>larkoinc@gmail.com</a>.</p><p style='color:black'>Best Regards,<br>Team Larko</p>"
                        send_email(message=msg,to_email=waitlistobj.email,subject=f"You have been added to the queue at {rank} position")


        def get(self, request, pk=None):
            #get all the waitlist who are currently free and allocate them rank accordingly
                        queryset = Waitlist.objects.filter(user=request.user, serving=False, served=False).annotate(
                            rank=Window(
                                expression=Rank(),
                                order_by=F('added_time').asc(),
                            )
                        )
                        serializer = WaitlistSerializer(queryset, many=True)

                        response=Response(serializer.data)   
                        return response





        def post(self,request,pk=None):
            #seperate notes from the received data to save it seperately as it has its own model
            if request.data.get("notes",None):
                notes=request.data["notes"]
            else:
                notes=None
            user_fields=FieldList.objects.filter(user=request.user).values("fieldlist","fields")[0]
            
            #Request.data is not mutable so had to make  a copy to make the changes
            updated_data=request.data.copy()
            
            #Should have given user in the serializers.save but works fine like this too so kept it
            updated_data.update({"user":request.user.id})
            required_fields=[i["field_name"] for i in  user_fields["fields"] if i["required"]==True]
            error_dict=dict()
            
            #For manual validation as the fields are dynamic and can change their values for the sake of customization.The model has it all not required 
            #but for maintaining the settings that has been set had to do manual authentication
            for i in user_fields["fieldlist"]:
                if not request.data.get(i,False):
                    if i in required_fields:
                        error_dict.update({i:"This field cannot be blank "})

            #if any errors get encountered than it is caught here and sent as a bad request
            if error_dict:
                output={"errors":error_dict}
                return Response(output,status=status.HTTP_400_BAD_REQUEST)
            
            #passed notes as context as it is extracted and saved seperately in the serializers
            serializeddata=WaitlistSerializer(data=updated_data,context={"notes":notes})
            if serializeddata.is_valid(raise_exception=True):
                    waitlistobj=serializeddata.save(user=request.user)
                    ValidationToken.objects.create(waitlist=waitlistobj,token=generate_token(waitlistobj.id))
                    thread1=threading.Thread(target=self.smsthread1,args=(waitlistobj,request.user))
                    thread1.start()
            #send the waitlist with rank as in the get method.This is sent as response so that the frontend systems can built the components without waiting for the response of get request   
            serializeddata=WaitlistSerializer(Waitlist.objects.filter(user=request.user,serving=False,served=False).annotate(
             rank=Window(
            expression=Rank(),
            order_by=F('added_time').asc(),
    )
            ),many=True)
            return Response(serializeddata.data)
        
        def put(self,request,pk=None): #For editing a particular waitlist entry
            try:                        

                customer=Waitlist.objects.get(id=int(pk))
            except:
                return Response({"AccessError":"The given url is not valid"},status=status.HTTP_400_BAD_REQUEST)        
            if request.user==customer.user:
                user_fields=FieldList.objects.filter(user=request.user).values("fieldlist","fields")[0]
                required_fields=[i["field_name"] for i in  user_fields["fields"] if i["required"]==True]
                error_dict=dict()
                #Manual authentication according to user customized settings
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

        #Deleting the waitlist entry
        def delete(self,request,pk=None):
            try:

                waitlistobj=Waitlist.objects.get(id=int(pk))
            except:
                return Response({"AccessError":"The given url is not valid"},status=status.HTTP_400_BAD_REQUEST)        
            if request.user==waitlistobj.user:
                business_name=Business_Profile.objects.get(user=request.user).business_name
                msg1=f"You have been removed from the queue of {business_name}.Please feel free to ask any queries at larkoinc@gmail.com"
                msg2=f"<h3 style='color:black'>Dear customer,</h3><p style='color:black'>We would like to inform that you have been removed from the waitlist of business <strong>{business_name}</strong></p><p style='color:black'>We appreciate your patience as we work to ensure that each customer receives the best possible service.</p><p style='color:black'>If you have any questions or concerns, please don't hesitate to contact us at <a href='mailto:larkoinc@gmail.com'>larkoinc@gmail.com</a>.</p><p style='color:black'>Best Regards,<br>Team Larko</p>"
                subject=f"You have been removed from the queue"
                thread1=threading.Thread(target=sendsms_thread,args=(waitlistobj,msg1,msg2,subject))
                thread1.start()
                fmsg1 = f"<h3 style='color:black'>Hello,</h3><p style='color:black'>It's your turn to be served at <strong>{business_name}</strong>!</p><h2 style='color:black'>Please proceed to the front of the queue.</h2><p style='color:black'>We hope you enjoy your experience with us, and thank you for your patience while waiting.</p><p style='color:black'>If you have any questions or concerns, please don't hesitate to contact us at <a href='mailto:larkoinc@gmail.com'>larkoinc@gmail.com</a>.</p><p style='color:black'>Best Regards,<br>Team Larko</p>"
                fmsg2=f"Its your turn at the queue of {business_name}.Please proceed to the front of the queue."
                fsubject=f"You are next in the queue at {business_name}"
                smsg1 = f"<h3 style='color:black'>Hello,</h3><p style='color:black'>This is a notification from <strong>{business_name}</strong>.</p><h2 style='color:black'>You are currently second in line and will be served soon!</h2><p style='color:black'>Please be ready and arrive on time to ensure a smooth experience for you and our other customers.</p><p style='color:black'>If you have any questions or concerns, please don't hesitate to contact us at <a href='mailto:larkoinc@gmail.com'>larkoinc@gmail.com</a>.</p><p style='color:black'>Thank you for your patience, and we look forward to serving you soon.</p><p style='color:black'>Best Regards,<br>Team Larko</p>"
                smsg2=f"Reminder: You are second in line at {business_name}. Please be ready to be served soon. Thank you!"
                ssubject=f"You are second in line at {business_name}"
                ordered=Waitlist.objects.filter(user=request.user,served=False,serving=False).order_by('added_time')
                if len(ordered)!=0:
                    waitlistobj=ordered[0]
                    smsthread=threading.Thread(target=sendsms_thread,args=(waitlistobj,fmsg2,fmsg1,fsubject))
                    smsthread.start()
                if len(ordered)>1:
                    waitlistobj=ordered[1]
                    smsthread=threading.Thread(target=sendsms_thread,args=(waitlistobj,smsg2,smsg1,ssubject))
                    smsthread.start()
                Removed.objects.create(user=request.user,added_time=waitlistobj.added_time)
                waitlistobj.delete()

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

            


                
#Views for serving list
class Servinglist(APIView):
    renderer_classes=[WaitlistRenderer]           
    permission_classes=[IsAuthenticated]
    def get(self,request,pk=None):
        user_objects=Waitlist.objects.filter(user=request.user,serving=True,served=False).annotate(
             rank=Window(
            expression=Rank(),
            order_by=F('added_time').asc(),
    )
            )

        serializeddata=ServingSerializer(user_objects,many=True)
        return Response(serializeddata.data)


    def post(self,request,pk=None):
        try:
            serveobj=Waitlist.objects.get(id=pk)
        except:
            return Response({"error":"Some error occured"},status=status.HTTP_502_BAD_GATEWAY)
        if serveobj.user!=request.user:
                return Response({"error":"Some error occured please recheck the hit address"},status=status.HTTP_502_BAD_GATEWAY)

        
        serveobj.serving=True
        serveobj.serving_started_time=timezone.now()
        serveobj.save()
        #allocate the resouces automatically when the entry is sent for serving
        if serveobj.resource:
            serveobj.resource.update(is_free=False)
        else:
            thread_allocate=threading.Thread(target=allocate_resource_thread,args=(serveobj,request.user))
            thread_allocate.start()
        business_name=Business_Profile.objects.get(user=request.user).business_name
        fmsg1 = f"<h3 style='color:black'>Hello,</h3><p style='color:black'>It's your turn to be served at <strong>{business_name}</strong>!</p><h2 style='color:black'>Please proceed to the front of the queue.</h2><p style='color:black'>We hope you enjoy your experience with us, and thank you for your patience while waiting.</p><p style='color:black'>If you have any questions or concerns, please don't hesitate to contact us at <a href='mailto:larkoinc@gmail.com'>larkoinc@gmail.com</a>.</p><p style='color:black'>Best Regards,<br>Team Larko</p>"
        fmsg2=f"Its your turn at the queue of {business_name}.Please proceed to the front of the queue."
        fsubject=f"You are next in the queue at {business_name}"
        smsg1 = f"<h3 style='color:black'>Hello,</h3><p style='color:black'>This is a notification from <strong>{business_name}</strong>.</p><h2 style='color:black'>You are currently second in line and will be served soon!</h2><p style='color:black'>Please be ready and arrive on time to ensure a smooth experience for you and our other customers.</p><p style='color:black'>If you have any questions or concerns, please don't hesitate to contact us at <a href='mailto:larkoinc@gmail.com'>larkoinc@gmail.com</a>.</p><p style='color:black'>Thank you for your patience, and we look forward to serving you soon.</p><p style='color:black'>Best Regards,<br>Team Larko</p>"
        smsg2=f"Reminder: You are second in line at {business_name}. Please be ready to be served soon. Thank you!"
        ssubject=f"You are second in line at {business_name}"
        ordered=Waitlist.objects.filter(user=request.user,served=False,serving=False).order_by('added_time')
        #Auto message to the 2nd and 3rd on the waitllist that the 1st one is sent for service and its their turn.For auto reminder
        #if length !=0 then the waitlist is not empty so the first rank will be notified 
        if len(ordered)!=0:
            waitlistobj=ordered[0]
            smsthread=threading.Thread(target=sendsms_thread,args=(waitlistobj,fmsg2,fmsg1,fsubject))
            smsthread.start()
        #For notifying the second one
        if len(ordered)>1:
            waitlistobj=ordered[1]
            smsthread=threading.Thread(target=sendsms_thread,args=(waitlistobj,smsg2,smsg1,ssubject))
            smsthread.start()
        



        return Response({"success":"successfully sent for serving"},status=status.HTTP_200_OK)

#Views for served list
class Servedlist(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    #Get all the served users
    def get(self,request,pk=None):
        user_objects=Waitlist.objects.filter(user=request.user,serving=False,served=True).annotate(
             rank=Window(
            expression=Rank(),
            order_by=F('serving_started_time').asc(),
    )
            )

        serializeddata=HistorySerializer(user_objects,many=True)
        return Response(serializeddata.data)


    def post(self,request,pk=None):
        try:
            serveobj=Waitlist.objects.get(id=pk)
        except:
            return Response({"error":"Some error occured"},status=status.HTTP_502_BAD_GATEWAY)
        if serveobj.user!=request.user:
                return Response({"error":"Some error occured"},status=status.HTTP_502_BAD_GATEWAY)
        elif not serveobj.serving:
                return Response({"error":"The selected waitlist cusutomer is not sent for serving"},status=status.HTTP_502_BAD_GATEWAY)
        serveobj.serving=False
        serveobj.served_time=timezone.now()
        serveobj.served=True
        serveobj.save()
        print(serveobj.resource)
        if serveobj.resource:
            Resources.objects.filter(id=serveobj.resource.id).update(is_free=True,currently_serving=None)
        business=Business_Profile.objects.get(user=request.user)
        msg1=f"You have been served by {business.business_name}.Thank you for using our services."
        msg2=f"<h3 style='color:black'>Dear customer,</h3><p style='color:black'>You have been served by <strong>{business.business_name}</strong></p><p style='color:black'>We appreciate your patience as we work to ensure that each customer receives the best possible service.</p><p style='color:black'>If you have any questions or concerns, please don't hesitate to contact us at <a href='mailto:larkoinc@gmail.com'>larkoinc@gmail.com</a>.</p><p style='color:black'>Best Regards,<br>Team Larko</p>"
        subject=f"You have been served"
        smsthread=threading.Thread(target=sendsms_thread,args=(serveobj,msg1,msg2,subject))
        smsthread.start()
        return Response({"success":"successfully served"},status=status.HTTP_200_OK)

#Field for getting and modifying the manual fields and their customizations
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
        print(serializeddata.data)
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
            return Response(self.calculate_values(start_time, end_time))

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

class ServicesViews(APIView): #add and modify services
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request,pk=None):
        user=request.user
        objectlist=user.services_for.all()
        objectlist = objectlist.annotate(
        waiting=Count('services_taken', filter=Q(services_taken__served=False, services_taken__serving=False)),
        serving=Count('services_taken', filter=Q(services_taken__served=False, services_taken__serving=True))
    )
    
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

#CRUD for resources
class ResourcesViews(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request,pk=None):
        user=request.user
        objectlist=user.resources_for.all()
        serializer=ResourcesSerializer(objectlist,many=True)
        return Response(serializer.data)
    def post(self,request,pk=None):
        
        serializer=ResourcesSerializer(data=request.data)
        servicelist = request.data.get("services", [])
        if serializer.is_valid(raise_exception=True):
            obj=serializer.save(user=request.user)
            # for i in servicelist:
            #     i=Services.objects.get(id=int(i))
            

            user=request.user
            objectlist=user.resources_for.all()
            serializer=ResourcesSerializer(objectlist,many=True)
            return Response(serializer.data)
        return Response(request.data)
    def put(self,request,pk=None):
        try:
            resourceobj=Resources.objects.get(id=pk)
        except:
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)

        serializer=ResourcesSerializer(resourceobj,data=request.data,partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
        return Response({"errors":"Some error occured"},status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request,pk=None):
        try:
            resourceobj=Resources.objects.get(id=pk)
        except:
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)
        resourceobj.delete()
        user=request.user
        objectlist=user.resources_for.all()
        serializer=ResourcesSerializer(objectlist,many=True)
        return Response(serializer.data)

#Views for analytics
class AnalyticsViews(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]

    # def calculate_average_working_hours(self,schedule):
    #     current_datetime = timezone.localtime(timezone.now())

    #     current_day = current_datetime.strftime("%A").upper()

    #     current_day_schedule = next(item for item in schedule if item["day"] == current_day)
    #     start_time = time.fromisoformat(current_day_schedule["start_time"])
    #     end_time = time.fromisoformat(current_day_schedule["end_time"])
    #     print(start_time)
    #     print(end_time)
    #     current_date = timezone.now()

    #     # Set the current date and time to the start and end times
    #     start_datetime = timezone.make_aware(datetime.combine(current_date, start_time))
    #     end_datetime = timezone.make_aware(datetime.combine(current_date, end_time))
    #     # Calculate the time difference in hours
    #     time_difference = end_datetime - start_datetime
    #     time_difference_in_hours = time_difference.total_seconds() / 3600
    #     return(time_difference_in_hours)
    
    def calculate_values(self,user,start_time,end_time):
       #Total served between the start and end time
        total_served = Waitlist.objects.filter(user=user,served_time__range=(start_time, end_time)).count()
        #Total entries between the start and end time which includes those in waitlist,in serving state and those served

        total_entries = Waitlist.objects.filter(user=user,added_time__range=(start_time, end_time)).count() #total entities
        #calculate serve rate
        if total_entries!=0:
            serve_rate = (total_served / total_entries) * 100
        else:
            serve_rate=0
        average_working_hours=(end_time-start_time).total_seconds() / 3600 #calculated average working hours
        #Total cancellations made including autoremoved and self exits(exit from queue itself from the public link status)
        cancelled=Removed.objects.filter(user=user,added_time__range=(start_time, end_time)).count()
        total_waitlist_entries=total_entries+cancelled

        #Calculate arrival rate using little law
        arrival_rate=total_entries/average_working_hours
        
        servinglist= Waitlist.objects.exclude(serving_started_time=None).filter(user=user,serving_started_time__range=(start_time, end_time))
        total_wait_time = sum([waitlist.serving_started_time - waitlist.added_time for waitlist in servinglist], timedelta())
        average_wait_time = total_wait_time / len(servinglist) if len(servinglist) > 0 else None
        waitlists_served = Waitlist.objects.exclude(served_time=None).filter(user=user,served_time__range=(start_time, end_time))
        total_serve_time = sum([waitlist.served_time - waitlist.added_time for waitlist in waitlists_served], timedelta())
        average_serve_time = total_serve_time / len(waitlists_served) if len(waitlists_served) > 0 else None
        auto_cancelled=Removed.objects.filter(user=user,added_time__range=(start_time, end_time),auto_removed=True).count()
        
        return({"total_served":total_served,"total_entries":total_waitlist_entries,"serve_rate":round(serve_rate,2),"avg_arrival_rate":round(arrival_rate,2),"avg_wait_time":str(average_wait_time),"avg_serve_time":str(average_serve_time),"total_cancelled":cancelled,"auto_removed":auto_cancelled})

    
    
    #Data that has values whether the entries are self checked or manulally added
    def self_checked(self,user,start_time,end_time):
        self_checked=Waitlist.objects.filter(user=user,added_time__range=(start_time, end_time),self_checkin=True).count()
        total_entries = Waitlist.objects.filter(user=user,added_time__range=(start_time, end_time)).count()
        return({"self_checked":self_checked,"manually_added":total_entries-self_checked})
    
    #Data about individual resources 
    def resources_data(self,user, start_time, end_time):
        resources_objs = Resources.objects.all()
        resources_dict = {}
        for resource_obj in resources_objs:
            waitlist_qs = Waitlist.objects.filter(user=user,resource=resource_obj,served=True,added_time__range=(start_time, end_time))
            waitlist_count = waitlist_qs.count()
            resources_dict[resource_obj.name] = waitlist_count
        return resources_dict
    
    #Data about individual services
    def services_data(self,user, start_time, end_time):
        services_objs = Services.objects.all()
        services_dict = {}
        for service_obj in services_objs:
            waitlists_served = Waitlist.objects.filter(user=user,service=service_obj,served=True,added_time__range=(start_time, end_time))
            total_system_time = sum([waitlist.served_time - waitlist.added_time for waitlist in waitlists_served], timedelta())
            average_system_time = total_system_time / len(waitlists_served) if len(waitlists_served) > 0 else None
            total_service_time = sum([waitlist.served_time - waitlist.serving_started_time for waitlist in waitlists_served], timedelta())
            average_service_duration = total_service_time / len(waitlists_served) if len(waitlists_served) > 0 else None
            waitlist_count = waitlists_served.count()
            services_dict[service_obj.service_name] = {"served":waitlist_count,"avg_system_time":str(average_system_time),"average_service_duration":str(average_service_duration)}
        return services_dict
    
    


    def get(self,request,pk):

        today = timezone.now()
        user=request.user
        if pk=="today":
            
#get day range inported from timefunc
            start_time,end_time=get_day_range(today)
        elif pk=="week":
            start_time,end_time=get_week_range(today)

        elif pk=="month":
            start_time,end_time=get_month_range(today)

        elif pk=="year":
            start_time,end_time=get_year_range(today)

        else:
            return Response({"error":"Invalid url.Please check the url and try again."},status=status.HTTP_404_NOT_FOUND)
        schedule=OperationSchedule.objects.get(business_profile=user.profile_of).operation_time
        return Response({"statistics":self.calculate_values(request.user,start_time, end_time),"pie_chart":self.self_checked(request.user,start_time, end_time),"chart":calculate_stats(request.user,pk,schedule),
        "services":self.services_data(request.user,start_time,end_time),"resources":self.resources_data(request.user,start_time,end_time)
        })


#send mail manually
class NotifyByEmailSmsViews(APIView):
    permission_classes=[IsAuthenticated]
    renderer_classes=[WaitlistRenderer]

    def get(self,request,pk):
        try:
            waitlistobj=Waitlist.objects.get(id=int(pk))
        except:
            return Response({"error":"The value of pk is not valid.Cannot access the api.","status":status.HTTP_403_FORBIDDEN})
        if waitlistobj.user!=request.user:
            return Response({"error":"The value of pk is not valid.Cannot access the api.","status":status.HTTP_403_FORBIDDEN})
        ordered=Waitlist.objects.filter(user=request.user,serving=False,served=False).order_by('added_time')
        rank=list(ordered).index(waitlistobj)+1
        business_name=Business_Profile.objects.get(user=request.user).business_name

        if waitlistobj.first_name:
                customer=waitlistobj.first_name
        else:
                customer="customer"

        if waitlistobj.phone_number:

            msg=f"You are at postion {rank} at the queue of {business_name}.Hope you will be on time."
            try:
                send_sms(message=msg,to_number=waitlistobj.phone_number)
            except:
                pass
            # except :
            #     return Response({"errors":"Cannot send sms to the given number"},status=status.HTTP_400_BAD_REQUEST)

        if waitlistobj.email:
                msg=f"<h3 style='color:black'>Dear {customer},</h3><p style='color:black'>We wanted to provide you with an update on your waitlist status for <strong>{business_name}</strong>.\n<h2 style='color:black'> Your current position in the queue is <strong>{rank}</strong></h2>.</p><p style='color:black'>We appreciate your patience as we work to ensure that each customer receives the best possible service.</p><p style='color:black'>If you have any questions or concerns, please don't hesitate to contact us at <a href='mailto:larkoinc@gmail.com'>larkoinc@gmail.com</a>.</p><p style='color:black'>Best Regards,<br>Team Larko</p>"

                send_email(message=msg,to_email=waitlistobj.email,subject=f"Update on your queue postion.You are at {rank}")
        
        elif not waitlistobj.phone_number:
            return Response({"errors":"Cannot send mail or sms as neither mail or phone_number is available"},status=status.HTTP_400_BAD_REQUEST)


            
        return Response({"success":"sent sucessfully"})


        
class Validate_customer(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    #get data of the person to be validated before validating them
    def get(self,request,pk):
        try:
            validobj=ValidationToken.objects.get(token=pk)
        except:
            return Response({"error":"The provided token is not valid"},status=status.HTTP_400_BAD_REQUEST)
        waitistobj=validobj.waitlist
        serialized=WaitlistSerializer(waitistobj)
        return Response(serialized.data)
    #Do actual validation 
    def post(self,request):
        if request.data.get('queue_token',None):
            try:
                validobj=ValidationToken.objects.filter(token=request.data["queue_token"])[0]
                waitistobj=validobj.waitlist
                if waitistobj.user==request.user:
                    Waitlist.objects.filter(id=validobj.waitlist.id).update(validated=True)
                
                else:
                    return Response({"error":"The provided token is not valid"},status=status.HTTP_400_BAD_REQUEST)


                validobj.delete()
                return Response({"success":"Customer sucessfully validated"},status=status.HTTP_200_OK)

            except:
                return Response({"error":"The provided token is not valid"},status=status.HTTP_400_BAD_REQUEST)
        return Response({"error":"The provided token is not valid"},status=status.HTTP_400_BAD_REQUEST)

#Download records which include all the entries data
class DownloadRecordsViews(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]     
    def get(self, request):
        waitlist = Waitlist.objects.filter(user=request.user)
        serialized_data = WaitlistSerializer(waitlist, many=True)
        return Response(serialized_data.data)

