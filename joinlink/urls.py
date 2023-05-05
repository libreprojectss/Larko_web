from django.urls import path
from graphene_django.views import GraphQLView
from .views import *
from .schema import  schema

urlpatterns = [
    # ...
    path("joinwaitlist/<uuid:pk>/",Public_link_Views.as_view()),

]