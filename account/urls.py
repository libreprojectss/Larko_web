from django.urls import path,include
from .views import *
urlpatterns=[
    path('signup/',SignUpViews.as_view(),name="signup"),
    path('login/',LoginViews.as_view(),name="login"),
]