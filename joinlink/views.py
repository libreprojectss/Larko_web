from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.views import APIView
from account.renderers import UserRenderer
from .helpers import encrypt_user_id,decrypt_user_id
from waitlistapp.models import Waitlist,FieldList,Services,ValidationToken
from rest_framework.response import Response 
from waitlistapp.tools.helpers import send_sms,send_email,generate_token
from rest_framework import status,serializers
from django.db.models.functions import Rank
from django.db.models import Window,F
from waitlistapp.serializers import WaitlistSerializer
from account.models import Business_Profile
from .serializers import *
import threading
# Create your views here.
class Public_link_Views(APIView):
    renderer_classes=[UserRenderer]

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

    def get(self,request,pk):
        cookie_name = 'queue_cookie'
        try:
            obj=Public_link.objects.get(public_id=pk)
        except:
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)
        profile=obj.profile
        waitlist_count=profile.user.waitlist_for.all().count()

        if not profile.open_now or not obj.public_access:
            return Response({"AccessError":"The service is closed at the moment or not receiving public registration","business_name":profile.business_name},status=status.HTTP_503_SERVICE_UNAVAILABLE)
        user_info = request.data.get("validation_token", None)
        key=obj.fernet_key
        if user_info:
            try:
                customerid=decrypt_user_id(user_info,key)
            except:
                return Response({"error":"The request cannot be processed because the validation token is not correct"},status=status.HTTP_400_BAD_REQUEST)
            waitlist_profile=Waitlist.objects.get(id=customerid)
            if waitlist_profile.serving and not waitlist_profile.served:
                return Response({"joined":True,"status":"You are being served","serving time":waitlist_profile.burst_time,"business_name":profile.business_name,"waitlist_count":waitlist_count})
            elif not waitlist_profile.serving and not waitlist_profile.served:

                user=obj.profile.user
                ordered=Waitlist.objects.filter(user=user).order_by('added_time')
                rank=list(ordered).index(waitlist_profile)+1
                return Response({"joined":True,"status":"You are on the queue","waited_for":waitlist_profile.wait_time(),"rank":rank,"business_name":profile.business_name,"waitlist_count":waitlist_count})
            else:
                return Response({"joined":True,"status":"You are served.","serving time":waitlist_profile.burst_time(),"business_name":profile.business_name,"waitlist_count":waitlist_count})
        
        return Response({"joined":False,"business_name":profile.business_name,"waitlist_count":waitlist_count})
    
    def post(self,request,pk):
        # Check if the cookie is present and contains user information
        cookie_name = 'queue_cookie'
        try:
            public_link_profile=Public_link.objects.get(public_id=pk)
        except:
            return Response({"AccessError":"The provided url is not valid."},status=status.HTTP_400_BAD_REQUEST)
        user_info = request.data.get('validation_token', None)
        key=public_link_profile.fernet_key
        if user_info:
            try:
                customerid=decrypt_user_id(user_info,key)
            except:
                return Response({"error":"The request cannot be processed because the validation token is not correct"},status=status.HTTP_400_BAD_REQUEST)
            print(customerid)
            waitlist_profile=Waitlist.objects.get(id=customerid)
            

            serialized=QueueProfileSerializer(waitlist_profile)
            if waitlist_profile.serving and not waitlist_profile.served:
                return Response({"status":"You are being served","serving time":waitlist_profile.burst_time,"personalInfo":serialized.data})
            elif not waitlist_profile.serving and not waitlist_profile.served:
                try:
                    queue_token=ValidationToken.objects.get(waitlist=waitlist_profile).token
                except:
                    return Response({"error":"This is old waitlist please delete this and create a new one"},status=status.HTTP_400_BAD_REQUEST)
                user=public_link_profile.profile.user
                ordered=Waitlist.objects.filter(user=user).order_by('added_time')
                rank=list(ordered).index(waitlist_profile)+1
                return Response({"status":"You are on the queue","waited_for":waitlist_profile.wait_time(),"rank":rank,"personalInfo":serialized.data,"queue_token":queue_token})
            else:
                return Response({"status":"You are served.","serving time":waitlist_profile.burst_time(),"personalInfo":serialized.data})

        else:
            
            user=public_link_profile.profile.user
            print(user)
            user_fields=FieldList.objects.filter(user=user).values("fieldlist","fields")[0]
            
            updated_data=request.data.copy()
            updated_data.update({"user":user})
            required_fields=[i["field_name"] for i in  user_fields["fields"] if i["required"]==True]
            error_dict=dict()
            for i in user_fields["fieldlist"]:
                if not request.data.get(i,False):
                    if i in required_fields:
                        error_dict.update({i:"This field cannot be blank "})
            if error_dict:
                output={"errors":error_dict}
                return Response(output,status=status.HTTP_400_BAD_REQUEST)
            serializeddata=WaitlistSerializer(data=updated_data,context={"notes":None})
            if serializeddata.is_valid(raise_exception=True):
                    serialized=serializeddata.save(user=user)
                    serialized.self_checkin=True
                    serialized.save()
                    ValidationToken.objects.create(waitlist=serialized,token=generate_token(serialized.id))

                    thread1=threading.Thread(target=self.smsthread1,args=(serialized,user))
                    thread1.start()
                    user_identifier = encrypt_user_id(serialized.id,key)
                    ordered=Waitlist.objects.filter(user=user).order_by('added_time')
                    rank=list(ordered).index(serialized)+1
                    response = Response({'status': 'You have been added to the queue.','rank':rank,'validation_token':user_identifier})
                    response.set_cookie(cookie_name, user_identifier, max_age=86400) # Cookie expires in 24 hours
                    return response
            
            return Response({"error":"There is problem in validating the data.Please check the inputs"},status=status.HTTP_502_BAD_GATEWAY)

    def delete(self,request,pk):
        cookie_name = 'queue_cookie'
        try:
            public_link_profile=Public_link.objects.get(public_id=pk)
        except:
            return Response({"AccessError":"The provided url is not valid."},status=status.HTTP_400_BAD_REQUEST)
        user_info = request.data.get('validation_token', None)
        key=public_link_profile.fernet_key
        if user_info:
            customerid=decrypt_user_id(user_info,key)
            waitlist_profile=Waitlist.objects.get(id=customerid)
            waitlist_profile.delete()
            response = Response({"message": "You have been removed from the waitlist."}, status=status.HTTP_200_OK)
            response.delete_cookie(cookie_name)
            return response

        else:
            return Response({"error":"Some error occured.Token is not available."},status=status.HTTP_400_BAD_REQUEST)



class RequiredFieldsViews(APIView):
    renderer_classes=[UserRenderer]
    def get(self,request,pk):
        try:
            public_link_profile=Public_link.objects.get(public_id=pk)
        except:
            return Response({"AccessError":"The provided url is not valid."},status=status.HTTP_502_BAD_GATEWAY)
        user=public_link_profile.profile.user
        user_fields=FieldList.objects.get(user=user)
        fields=user_fields.fieldlist
        field_list=[i for i in user_fields.fields if i['field_name'] in fields]
        services=Services.objects.filter(user=user)
        service_list=[{"name":i.service_name,"duration":i.duration,"id":i.id} for i in services]
        return Response({"field_list":field_list,"services":service_list})

class QueueStatus(APIView):
    renderer_classes=[UserRenderer]
    def post(self,request,pk):
        cookie_name = 'validation_token'

        try:
            public_link_profile=Public_link.objects.get(public_id=pk)
        except:
            return Response({"AccessError":"The provided url is not valid."},status=status.HTTP_502_BAD_GATEWAY)
        user=public_link_profile.profile.user
        user_info = request.data.get(cookie_name, None)
        key=public_link_profile.fernet_key
        if user_info:
            try:
                customerid=decrypt_user_id(user_info,key)
            except:
                return Response({"error":"Couldn't read the provided cookie"},status=status.HTTP_400_BAD_REQUEST)
            waitlist_profile=Waitlist.objects.get(id=customerid)
            ordered=Waitlist.objects.filter(user=user,serving=False,served=False).only('first_name','last_name','self_checkin','service__service_name').annotate(rank=Window(
            expression=Rank(),
            order_by=F('added_time').asc(),))
            for obj in ordered:
                obj.wait_time = obj.wait_time
            rank=list(ordered).index(waitlist_profile)+1
            serializeddata=QueueSerializer(ordered,many=True)
            return Response({"Queue_data":serializeddata.data,"rank":rank})
        return Response({"error":"The cookie is invalid"})


