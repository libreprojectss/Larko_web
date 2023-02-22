from django.urls import path,include
from .views import *
urlpatterns=[
    path('signup/',SignUpViews.as_view(),name="signup"),
    path('login/',LoginViews.as_view(),name="login"),
    path('checkbussinessname/',CheckBussinessName.as_view(),name="checkbussinessname"),
    path('bussinessprofile/',Bussiness_Profile_Views.as_view(),name="bussiness_profile"),
    path('getrequiredfields/',RequiredFieldsViews.as_view(),name="checkbussinessname"),

]