from django.shortcuts import render
from rest_framework.views import APIView
from account.renderers import UserRenderer
from .helpers import encrypt_user_id,decrypt_user_id
from waitlistapp.models import Waitlist,FieldList
from rest_framework.response import Response 
from rest_framework import status,serializers
from waitlistapp.serializers import WaitlistSerializer
from .serializers import *
# Create your views here.
class Public_link_Views(APIView):
    renderer_classes=[UserRenderer]

    def get(self,pk):
        try:
            obj=Public_link.objects.get(public_id=pk)
        except:
            return Response({"AccessError":"The given url is not valid"},status=status.HTTP_502_BAD_GATEWAY)
        profile=obj.profile
        if not profile.open_now or not obj.public_access:
            return Response({"AccessError":"The service is closed at the moment or not receiving public registration","business_name":profile.business_name},status=status.HTTP_503_SERVICE_UNAVAILABLE)
        waitlist_count=profile.user.waitlist_for.all().count()
        return Response({"business_name":profile.business_name,"waitlist_count":waitlist_count})
    
    def post(self,request,pk):
        # Check if the cookie is present and contains user information
        cookie_name = 'queue_cookie'
        try:
            public_link_profile=Public_link.objects.get(public_id=pk)
        except:
            return Response({"AccessError":"The provided url is not valid."},status=status.HTTP_400_BAD_REQUEST)
        user_info = request.COOKIES.get(cookie_name, None)
        key=public_link_profile.fernet_key
        print(user_info)
        if user_info:
            customerid=decrypt_user_id(user_info,key)
            print(customerid)
            waitlist_profile=Waitlist.objects.get(id=customerid)
            if waitlist_profile.serving and not waitlist_profile.served:
                return Response({"status":"You are being served","serving time":waitlist_profile.burst_time})
            elif not waitlist_profile.serving and not waitlist_profile.served:

                user=public_link_profile.profile.user
                ordered=Waitlist.objects.filter(user=user).order_by('added_time')
                rank=list(ordered).index(waitlist_profile)+1
                return Response({"status":"You are on the queue","waited_for":waitlist_profile.wait_time(),"rank":rank})
            else:
                return Response({"status":"You are served.","serving time":waitlist_profile.burst_time()})

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
                    user_identifier = encrypt_user_id(serialized.id,key)
                    ordered=Waitlist.objects.filter(user=user).order_by('added_time')
                    rank=list(ordered).index(serialized)+1
                    response = Response({'status': 'You have been added to the queue.','rank':rank})
                    response.set_cookie(cookie_name, user_identifier, max_age=86400) # Cookie expires in 24 hours
                    return response
            
            return Response({"error":"There is problem in validating the data.Please check the inputs"},status=status.HTTP_502_BAD_GATEWAY)



