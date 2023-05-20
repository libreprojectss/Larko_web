from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import *
import pandas as pd
from time import sleep
from io import BytesIO
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


def sendsms_thread(waitlistobj,msg1,msg2,subject="Larko reminder"):

                    if waitlistobj.phone_number:
                        try:
                            send_sms(message=msg1,to_number=waitlistobj.phone_number)
                        except:
                            pass
                    if waitlistobj.email:
                        send_email(message=msg2,to_email=waitlistobj.email,subject=subject)

def allocate_resource_thread(waitlistobj,user):
    resource=Resources.objects.filter(user=user,is_available=True,is_free=True)
    if resource.exists():
        if waitlistobj.service:
            resources = resources.filter(service__in=[waitlistobj.service])
            waitlistobj.resource = resources[0]
            resources[0].is_free = False
            resources[0].save()
            print("resource alloted")

        else:
            waitlistobj=resource[0]
            resource[0].is_free = False
            resource[0].save()
            print("resource alloted")

            
        
class Getservices(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request):
        servicesobj=Services.objects.filter(user=request.user)
        serialized_data=ServicesNameSerializer(servicesobj,many=True)
        return Response(serialized_data.data)
class RequiredFieldsViews(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request):
        user_fields=FieldList.objects.get(user=request.user)
        fields=user_fields.fieldlist
        print(user_fields.fieldlist)
        field_list=[i for i in user_fields.fields if i['field_name'] in fields]
        services=Services.objects.filter(user=request.user)
        service_list=[{"name":i.service_name,"duration":i.duration,"id":i.id} for i in services]
        return Response({"field_list":field_list,"services":service_list})
    




class WaitListView(APIView):
        renderer_classes=[WaitlistRenderer]
        permission_classes=[IsAuthenticated]
        def smsthread1(self,waitlistobj,user):
                    business_name=Business_Profile.objects.get(user=user).business_name

                    ordered=Waitlist.objects.filter(user=user).order_by('added_time')
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
                    waitlistobj=serializeddata.save(user=request.user)
                    ValidationToken.objects.create(waitlist=waitlistobj,token=generate_token(waitlistobj.id))
                    thread1=threading.Thread(target=self.smsthread1,args=(waitlistobj,request.user))
                    thread1.start()
                    
            serializeddata=WaitlistSerializer(Waitlist.objects.filter(user=request.user,serving=False,served=False).annotate(
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

                waitlistobj=Waitlist.objects.get(id=int(pk))
            except:
                return Response({"AccessError":"The given url is not valid"},status=status.HTTP_400_BAD_REQUEST)        
            if request.user==waitlistobj.user:
                business_name=Business_Profile.objects.get(user=request.user).business_name
                msg1=f"You have been removed from the queue of {business_name}.Please feel free to ask any queries at larkoinc@gmail.com"
                msg2=f"<h3 style='color:black'>Dear customer,</h3><p style='color:black'>We would like to inform that you have been removed from the waitlist of business <strong>{business_name}</strong></p><p style='color:black'>We appreciate your patience as we work to ensure that each customer receives the best possible service.</p><p style='color:black'>If you have any questions or concerns, please don't hesitate to contact us at <a href='mailto:larkoinc@gmail.com'>larkoinc@gmail.com</a>.</p><p style='color:black'>Best Regards,<br>Team Larko</p>"
                subject=f"You have been removed from the queue"
                thread1=threading.Thread(target=sendsms_thread,args=(waitlistobj,msg1,msg2,subject))
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
        ordered=Waitlist.objects.filter(user=request.user).order_by('added_time')
        if len(ordered)!=0:
            waitlistobj=ordered[0]
            smsthread=threading.Thread(target=sendsms_thread,args=(waitlistobj,fmsg2,fmsg1,fsubject))
            smsthread.start()
        if len(ordered)>1:
            waitlistobj=ordered[1]
            smsthread=threading.Thread(target=sendsms_thread,args=(waitlistobj,smsg2,smsg1,ssubject))
            smsthread.start()
        



        return Response({"success":"successfully sent for serving"},status=status.HTTP_200_OK)

class Servedlist(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
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
        if serveobj.resource:
            serveobj.resource.update(is_free=True)
        business=Business_Profile.objects.get(user=request.user)
        msg1=f"You have been served by {business.business_name}.Thank you for using our services."
        msg2=f"<h3 style='color:black'>Dear customer,</h3><p style='color:black'>You have been served by <strong>{business.business_name}</strong></p><p style='color:black'>We appreciate your patience as we work to ensure that each customer receives the best possible service.</p><p style='color:black'>If you have any questions or concerns, please don't hesitate to contact us at <a href='mailto:larkoinc@gmail.com'>larkoinc@gmail.com</a>.</p><p style='color:black'>Best Regards,<br>Team Larko</p>"
        subject=f"You have been served"
        smsthread=threading.Thread(target=sendsms_thread,args=(serveobj,msg1,msg2,subject))
        smsthread.start()
        return Response({"success":"successfully served"},status=status.HTTP_200_OK)

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

class ServicesViews(APIView):
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

class ResourcesViews(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]
    def get(self,request,pk=None):
        user=request.user
        objectlist=user.resources_for.all()
        serializer=ResourcesSerializer(objectlist,many=True)
        return Response(serializer.data)
    def post(self,request,pk=None):

        servicelist=request.data["services"] if request.data["services"] else []
        print(servicelist)
        
        serializer=ResourcesSerializer(data=request.data)
       
        if serializer.is_valid(raise_exception=True):
            obj=serializer.save(user=request.user)
            # for i in servicelist:
            #     i=Services.objects.get(id=int(i))
            

            obj.services.set(servicelist)
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
       
        total_served = Waitlist.objects.filter(user=user,served_time__range=(start_time, end_time)).count()
        total_entries = Waitlist.objects.filter(user=user,added_time__range=(start_time, end_time)).count() #total entities
        if total_entries!=0:
            serve_rate = (total_served / total_entries) * 100
        else:
            serve_rate=0
        average_working_hours=(end_time-start_time).total_seconds() / 3600 #calculated average working hours
        cancelled=Removed.objects.filter(user=user,added_time__range=(start_time, end_time)).count()
        total_waitlist_entries=total_entries+cancelled
        arrival_rate=total_entries/average_working_hours
        waitlists= Waitlist.objects.exclude(serving_started_time=None).filter(user=user,serving_started_time__range=(start_time, end_time))
        total_wait_time = sum([waitlist.serving_started_time - waitlist.added_time for waitlist in waitlists], timedelta())
        average_wait_time = total_wait_time / len(waitlists) if len(waitlists) > 0 else None
        waitlists_served = Waitlist.objects.exclude(served_time=None).filter(user=user,served_time__range=(start_time, end_time))
        total_serve_time = sum([waitlist.served_time - waitlist.added_time for waitlist in waitlists_served], timedelta())
        average_serve_time = total_serve_time / len(waitlists_served) if len(waitlists_served) > 0 else None
        auto_cancelled=Removed.objects.filter(user=user,added_time__range=(start_time, end_time),auto_removed=True).count()
        
        return({"total_served":total_served,"total_entries":total_waitlist_entries,"serve_rate":serve_rate,"avg_arrival_rate":arrival_rate,"avg_wait_time":str(average_wait_time),"avg_serve_time":str(average_serve_time),"total_cancelled":cancelled,"auto_removed":auto_cancelled})

    
    
    
    def self_checked(self,user,start_time,end_time):
        self_checked=Waitlist.objects.filter(user=user,added_time__range=(start_time, end_time),self_checkin=True).count()
        total_entries = Waitlist.objects.filter(user=user,added_time__range=(start_time, end_time)).count()
        return({"self_checked":self_checked,"manually_added":total_entries-self_checked})
    
    def resources_data(self,user, start_time, end_time):
        resources_objs = Resources.objects.all()
        resources_dict = {}
        for resource_obj in resources_objs:
            waitlist_qs = Waitlist.objects.filter(user=user,resource=resource_obj,served=True,added_time__range=(start_time, end_time))
            waitlist_count = waitlist_qs.count()
            resources_dict[resource_obj.name] = waitlist_count
        return resources_dict
    
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
        ordered=Waitlist.objects.filter(user=request.user).order_by('added_time')
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

    def get(self,request,pk):
        try:
            validobj=ValidationToken.objects.get(token=pk)
        except:
            return Response({"error":"The provided token is not valid"},status=status.HTTP_400_BAD_REQUEST)
        waitistobj=validobj.waitlist
        serialized=WaitlistSerializer(waitistobj)
        return Response(serialized.data)
    def post(self,request):
        if request.data.get('queue_token',None):
            try:
                validobj=ValidationToken.objects.filter(token=request.data["queue_token"])[0]
                waitistobj=validobj.waitlist
                if waitistobj.user==request.user:
                    validobj.waitlist.validated=True
                    validobj.save()
                else:
                    return Response({"error":"The provided token is not valid"},status=status.HTTP_400_BAD_REQUEST)


                validobj.delete()
                return Response({"success":"Customer sucessfully validated"},status=status.HTTP_200_OK)

            except:
                return Response({"error":"The provided token is not valid"},status=status.HTTP_400_BAD_REQUEST)
        return Response({"error":"The provided token is not valid"},status=status.HTTP_400_BAD_REQUEST)


class DownloadRecordsViews(APIView):
    renderer_classes=[WaitlistRenderer]
    permission_classes=[IsAuthenticated]     

    def get(self,request):
        waitlist=Waitlist.objects.filter(user=request.user)
        serialized_data=WaitlistSerializer(waitlist,many=True)
        df=prepare_excel_data(serialized_data.data)

        # Create an in-memory Excel file
        excel_buffer = BytesIO()
        with pd.ExcelWriter(excel_buffer, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Queue Records')  # Customize sheet name

        excel_blob = excel_buffer.getvalue()

        # Set up the response
        response = Response(content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="queue_entries.xlsx"'

        # Create JSON response with Blob data
        json_data = json.dumps({'blob': excel_blob.decode('latin1')})
        response.write(json_data)
        print(response)
        return response

