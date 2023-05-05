from django.urls import path
from .views import *

urlpatterns = [
    # ...
    path("joinwaitlist/<uuid:pk>/",Public_link_Views.as_view()),

]