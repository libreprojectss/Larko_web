from django.urls import path,include
from .views import *
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView
)
urlpatterns=[
    path('token/update/',TokenRefreshView.as_view(),name="refresh"),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('signup/',SignUpViews.as_view(),name="signup"),
    path('login/',LoginViews.as_view(),name="login"),
    path('checkbusinessname/',CheckBusinessName.as_view(),name="checkbusinessname"),
    path('businessprofile/',Business_Profile_Views.as_view(),name="business_profile"),
    path("openclosebusiness/",OpenCloseBusiness.as_view(),name="open close business"), #For getting the information either business is open or closed

    path("openclosebusiness/<str:pk>/",OpenCloseBusiness.as_view(),name="open close business"), #For psot request to change the value if pk=1 it set open as true else open is set to false that means closed
    path("openclosepubliclink/",OpenClosePublicLink.as_view(),name="open close business"), #Similar to open close business this is for open close the public self checkins

    path("openclosepubliclink/<str:pk>/",OpenClosePublicLink.as_view(),name="open close business"),
    path("operationschedule/",OperationScheduleView.as_view(),name="operation shedule for  business"),
    path("openclosevalidation/",OpenCloseValidation.as_view(),name="open close validation"),
    path("openclosevalidation/<str:pk>/",OpenCloseValidation.as_view(),name="open close validation"),

]