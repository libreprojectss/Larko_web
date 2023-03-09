from django.urls import path,include
from .views import *

urlpatterns=[
    path('getrequiredfields/',RequiredFieldsViews.as_view(),name="requiredfields"),
    path('allfields/',AllFieldsView.as_view(),name="allfields"),
    path('waitlist/',WaitListView.as_view(),name="waitlist"),
    path('waitlist/<str:pk>/',WaitListView.as_view(),name="waitlist"),
    path('notes/',WaitListView.as_view(),name="notes"),
]