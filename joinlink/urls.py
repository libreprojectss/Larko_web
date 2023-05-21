from django.urls import path
from .views import *

urlpatterns = [
    # ...
    path("joinwaitlist/<uuid:pk>/",Public_link_Views.as_view()),
    path("publiclink/removedata/<uuid:pk>/",RemoveFromQueue.as_view()),

    path("publiclink/getrequiredfields/<uuid:pk>/",RequiredFieldsViews.as_view()), #for getting required fields and available services for the public link
    path("publiclink/checkqueuestatus/<uuid:pk>/",QueueStatus.as_view(),name="Queue status"), #for getting required fields and available services for the public link

]