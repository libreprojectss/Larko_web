from asgiref.sync import async_to_sync,sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer,AsyncJsonWebsocketConsumer
import json,time,jwt,time
import asyncio
from urllib.parse import parse_qs
from .models import Waitlist
from account.models import User
from threading import Thread
from django.conf import settings

from .serializers import WaitlistSerializer
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

class WaitlistConsumer(WebsocketConsumer):
    groups = ["broadcast"]

    def connect(self):
        try:
            access_token = parse_qs(self.scope['query_string'].decode("utf-8"))["access_token"][0]
        except:
            self.send("Access toke is not specified")
            self.close()
            return
        SECRET_KEY = settings.SECRET_KEY

        
        try:
            decoded_token = jwt.decode(access_token,SECRET_KEY, algorithms=["HS256"])
            self.user = User.objects.get(id=int(decoded_token['user_id']))
        except Exception as e:
            print(e)
            self.send(str(e))
            self.close()
            return
            
        self.accept()
        self.waitlist_thread = Thread(target=self.send_waitlist_periodically, args=(self.user,))
        self.waitlist_thread.start()
    def receive(self, text_data=None, bytes_data=None):
        self.send(text_data="Hello world!")
        
    def disconnect(self, close_code):
        pass
    def send_waitlist_periodically(self, user):
               while self.websocket_connect or self.websocket_keepalive:
                    waitlist = Waitlist.objects.filter(user=user,served=False,serving=False)
                    serialized_data = WaitlistSerializer(waitlist,many=True)
                    self.send(json.dumps(serialized_data.data))
                    time.sleep(3)