from django.urls import path,include
from .views import *
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
urlpatterns=[
    path('updatetoken/',TokenRefreshView.as_view(),name="refresh"),
    path('signup/',SignUpViews.as_view(),name="signup"),
    path('login/',LoginViews.as_view(),name="login"),
    path('checkbusinessname/',CheckBusinessName.as_view(),name="checkbusinessname"),
    path('businessprofile/',Business_Profile_Views.as_view(),name="business_profile"),
  

]