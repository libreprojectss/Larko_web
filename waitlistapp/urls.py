from django.urls import path,include
from .views import *

urlpatterns=[
    path('getrequiredfields/',RequiredFieldsViews.as_view(),name="requiredfields"),
    path('allfields/',AllFieldsView.as_view(),name="allfields"),
    path('waitlist/',WaitListView.as_view(),name="waitlist"),
    path('waitlist/<str:pk>/',WaitListView.as_view(),name="waitlist"),
    path('notes/<str:cid>/',NotesView.as_view(),name="notes"),
    path('notes/<str:cid>/<str:nid>/',NotesView.as_view(),name="notes"),
    path('services/',ServicesViews.as_view(),name="services"),
    path('services/<str:pk>/',ServicesViews.as_view(),name="services_edit_delete"),
    path('serving/<str:pk>/',Servinglist.as_view(),name="serving_list"), #send waitlist id from waitlist to be served here in pk in post request
    path('serving/',Servinglist.as_view(),name="serving"),    #for get request 
    path('served/',Servedlist.as_view(),name="served"),        #send serving id from serving list to be served here in pk in post request
    path('served/<str:pk>/',Servedlist.as_view(),name="served_history"),  #for get request 
    path('resources/',ResourcesViews.as_view(),name="resources"),  #for resources get and post
    path('resources/<str:pk>/',ResourcesViews.as_view(),name="resources"), #For resources put and delete. can send services along with the data
    path('analytics/<str:pk>/',AnalyticsViews.as_view(),name="analytics"),
    path("sendsms/",NotifyByEmailSmsViews.as_view(),name="notify")
]