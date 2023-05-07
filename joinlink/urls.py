from django.urls import path
from .views import *

urlpatterns = [
    # ...
    path("joinwaitlist/<uuid:pk>/",Public_link_Views.as_view()),
    path("publiclink/getrequiredfields/<uuid:pk>/",RequiredFieldsViews.as_view()), #for getting required fields and available services for the public link

]