"""
ASGI config for larko_web project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from django.urls import path
from .urls import urlpatterns
import os
from waitlistapp import consumers
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'larko_web.settings')

application = get_asgi_application()
 
 
websocket_urlpatterns = [
    path('ws/waitlist/', consumers.WaitlistConsumer.as_asgi()),
    path('ws/servinglist/', consumers.ServinglistConsumer.as_asgi()),
    path('ws/analytics/',consumers.AnalyticsConsumer.as_asgi())

]
application = ProtocolTypeRouter({
    # Django's ASGI application to handle traditional HTTP requests
    "http": get_asgi_application(),

    # WebSocket chat handler
    "websocket":AuthMiddlewareStack(URLRouter(
               websocket_urlpatterns
        ))

        
    ,
})

app=application