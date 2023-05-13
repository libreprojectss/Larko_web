from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
import json,time
import asyncio
from .models import Waitlist
from .serializers import WaitlistSerializer

class WaitlistConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        self.task = asyncio.create_task(self.send_data())

    async def disconnect(self, close_code):
        self.task.cancel()

    async def send_data(self):
        while True:
            await asyncio.sleep(3)
            data = {"message": "Hello World!"}
            await self.send(json.dumps(data))
    
    

# from channels.generic.websocket import WebsocketConsumer

# class WaitlistConsumer(WebsocketConsumer):
#     groups = ["broadcast"]

#     def connect(self):

#         self.accept()
#         print("connected")
#         self.close()

#     def receive(self, text_data=None, bytes_data=None):
#         self.send(text_data="Hello world!")
        
#     def disconnect(self, close_code):
#         pass