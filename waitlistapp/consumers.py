from asgiref.sync import async_to_sync,sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer,AsyncJsonWebsocketConsumer
import json,time,jwt
from account.helpers import SaveLogs
import asyncio
from django.utils import timezone
from waitlistapp.views import sendsms_thread
from datetime import date,timedelta,datetime
from urllib.parse import parse_qs
from django.core.exceptions import ObjectDoesNotExist
from .models import Waitlist,First_on_queue
from account.models import User,Business_Profile
from threading import Thread
from django.conf import settings
from django.db.models import Window,F
from django.db.models.functions import Rank
from .serializers import WaitlistSerializer,ServingSerializer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
# @database_sync_to_async
# def getwaitlist():
#     data=Waitlist.objects.all().values()
#     await self.send_json(data)

# class WaitlistConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         await self.accept()

#         while True:
            
#             data = await threading.Thread(target=getwaitlist)
#             data.start()
            
            # await asyncio.sleep(5)

# class WaitlistConsumer(AsyncWebsocketConsumer):
    
#     def getwaitlist(self):
#         return Waitlist.objects.all()
#     async def connect(self):
#         waitlist =await database_sync_to_async(self.getwaitlist)()
#         print(waitlist)
#         await self.accept()
#         # try:
#         #     asyncio.ensure_future(self.send_data())
#         # except Exception as e:
#         #     print(e)

#     async def disconnect(self, close_code):
#         self.task.cancel()

#     async def send_data(self):
#         while True:
#             await asyncio.sleep(3)
#             try:
#                 waitlist =await database_sync_to_async(self.getwaitlist)()
#                 print(waitlist)
            
                
#                 if waitlist.exists():
#                         print("first name")
#                         data={"first_name":waitlist[0].first_name}
#                 else:
#                         data = {"first_name": "No one is waiting"}
#                 await self.send(json.dumps(data))
#             except Exception as e:
#                 print(e)


from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
class WaitlistConsumer(WebsocketConsumer):
    groups = ["waitlist"]

    def connect(self):
        try:
            access_token = parse_qs(self.scope['query_string'].decode("utf-8"))["access_token"][0]
        except:
            self.close(code=1002)
            return
        SECRET_KEY = settings.SECRET_KEY

        
        try:
            decoded_token = jwt.decode(access_token,SECRET_KEY, algorithms=["HS256"])
            self.user = User.objects.get(id=int(decoded_token['user_id']))
        except Exception as e:
            print(e)
            self.close(code=1002)
            return
            
        self.accept()
        self.waitlist_thread = Thread(target=self.send_waitlist_periodically, args=(self.user,))
        self.waitlist_thread.start()
   
        
    def disconnect(self, close_code):
        pass
    def send_waitlist_periodically(self, user):
               while self.websocket_connect or self.websocket_keepalive:
                    queryset = Waitlist.objects.filter(user=user, serving=False, served=False).annotate(
                            rank=Window(
                                expression=Rank(),
                                order_by=F('added_time').asc(),
                            )
                        )
                    try:
                        first_on_queue=First_on_queue.objects.get(user=user)
                        time_difference = timezone.now() - first_on_queue.started_time
                        profile=user.profile_of
                        if time_difference > timedelta(minutes=profile.auto_remove_after):
                                Waitlist.objects.get(id=first_on_queue.waitlist.id).delete()
                                business_name=profile.business_name
                                SaveLogs(user,f"customer with id {first_on_queue.waitlist.id} first_name {first_on_queue.waitlist.first_name} is autoremoved","INFO")
                                msg1=f"You have been auto removed from the queue cause.Our apologies on this behaviour but its our policy to serve users on time."
                                msg2 = f"""
                                <h3 style='color: black;'>Dear customer,</h3>
                                <p style='color: black;'>We regret to inform you that you have been automatically removed from the waitlist for business <strong>{business_name}</strong>.</p>
                                <p style='color: black;'>We apologize for any inconvenience caused, but it is our policy to ensure timely service for all customers.</p>
                                <p style='color: black;'>If you have any questions or concerns, please do not hesitate to contact us at <a href='mailto:larkoinc@gmail.com' style='color: #007bff;'>larkoinc@gmail.com</a>.</p>
                                <p style='color: black;'>Best Regards,<br>Team Larko</p>
                                """
                                thread1=Thread(target=sendsms_thread,args=(first_on_queue.waitlist,msg1,msg2,"You have been removed from the queue"))

                                first_on_queue.delete()
                                continue


                    except ObjectDoesNotExist:
                        if queryset:
                            first_on_queue=First_on_queue.objects.create(user=user,waitlist=queryset[0])
                    except Exception as e:
                        print(e)
                            
                    
                    if queryset:
                        serialized_data = WaitlistSerializer(queryset,many=True)
                        self.send(json.dumps(serialized_data.data))
                        time.sleep(3)
                    else:
                        time.sleep(6)

class ServinglistConsumer(WebsocketConsumer):
    groups = ["serving"]

    def connect(self):
        try:
            access_token = parse_qs(self.scope['query_string'].decode("utf-8"))["access_token"][0]
        except:
            self.close(code=1002, reason="Access token is not specified")
            return
        SECRET_KEY = settings.SECRET_KEY

        
        try:
            decoded_token = jwt.decode(access_token,SECRET_KEY, algorithms=["HS256"])
            self.user = User.objects.get(id=int(decoded_token['user_id']))
        except Exception as e:
            print(e)
            self.close(code=1002, reason=str(e))
            return
            
        self.accept()
        self.waitlist_thread = Thread(target=self.send_servelist_periodically, args=(self.user,))
        self.waitlist_thread.start()
    def send_servelist_periodically(self, user):
               while self.websocket_connect or self.websocket_keepalive:
                    waitlist = Waitlist.objects.filter(user=user,served=False,serving=True)
                    serialized_data = ServingSerializer(waitlist,many=True)
                    self.send(json.dumps(serialized_data.data))
                    time.sleep(3)

class AnalyticsConsumer(WebsocketConsumer):
    groups = ["analytics"]

    def connect(self):
        try:
            access_token = parse_qs(self.scope['query_string'].decode("utf-8"))["access_token"][0]
        except:
            self.close(code=1002, reason="Access token is not specified")
            return
        SECRET_KEY = settings.SECRET_KEY

        
        try:
            decoded_token = jwt.decode(access_token,SECRET_KEY, algorithms=["HS256"])
            self.user = User.objects.get(id=int(decoded_token['user_id']))
        except Exception as e:
            print(e)
            self.close(code=1002, reason=str(e))
            return
            
        self.accept()
        self.waitlist_thread = Thread(target=self.send_servelist_periodically, args=(self.user,))
        self.waitlist_thread.start()
    def send_servelist_periodically(self, user):
               while self.websocket_connect or self.websocket_keepalive:
                    waitlist = Waitlist.objects.filter(user=user,served=False,serving=True)
                    serialized_data = ServingSerializer(waitlist,many=True)
                    self.send(json.dumps(serialized_data.data))
                    time.sleep(6)


# class ServelistConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.channel_layer=get_channel_layer()
#         try:
#             access_token = parse_qs(self.scope['query_string'].decode("utf-8"))["access_token"][0]
#         except:
#             self.send("Access token is not specified")
#             self.close()
#             return
#         SECRET_KEY = settings.SECRET_KEY

#         await self.accept()
#         try:
#             decoded_token = jwt.decode(access_token,SECRET_KEY, algorithms=["HS256"])
#             print(decoded_token['user_id'])
#             self.user = await self.get_user(int(decoded_token['user_id']))
#             self.profile=await  self.get_profile(self.user)
#         except Exception as e :

#             print(e)
#             self.send(str(e))
#             self.close()
#             return

#         await self.channel_layer.group_add(
#             self.profile.business_name,
#             self.channel_name
#         )
#         await self.waitlist_changed()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.business_name,
#             self.channel_name
#         )auto
#     @database_sync_to_async
#     def get_servinglist(self):
#         return Waitlist.objects.filter(user=self.user,served=False,serving=True)
#     @database_sync_to_async
#     def get_user(self,user_id):
#             user = User.objects.get(id=int(user_id))
#             return user
#     @database_sync_to_async
#     def get_profile(self,user):
#             profile=Business_Profile.objects.get(user=user)
#             return profile
#     @sync_to_async
#     def serialize_waitlist(self,waitlist):
#         serializeddata=ServingSerializer(waitlist,many=True)
#         return serializeddata
#     async def waitlist_changed(self):
#         serving_waitlist = await self.get_servinglist()
#         serialized_waitlist = await self.serialize_waitlist(serving_waitlist)

#         await self.channel_layer.group_send(
#             self.profile.business_name,
#             {
#                 "type": "waitlist_change",
#                 "waitlist":"hello"
#             }
#         )
#     async def waitlist_change(self, event):
#         waitlist = event["waitlist"]
#         await self.send(text_data=json.dumps({
#         "waitlist": waitlist,
#     }))
