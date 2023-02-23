from django.urls import path,include
from .views import *
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
urlpatterns=[
    path('updatetoken/',TokenRefreshView.as_view(),name="refresh"),
    path('signup/',SignUpViews.as_view(),name="signup"),
    path('login/',LoginViews.as_view(),name="login"),
    path('checkbussinessname/',CheckBussinessName.as_view(),name="checkbussinessname"),
    path('bussinessprofile/',Bussiness_Profile_Views.as_view(),name="bussiness_profile"),
    path('getrequiredfields/',RequiredFieldsViews.as_view(),name="checkbussinessname"),

]