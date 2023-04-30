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
    path('serving/<str:pk>/',Servinglist.as_view(),name="serving_list"),
    path('serving/',Servinglist.as_view(),name="serving"),
    path('served/',Servinglist.as_view(),name="served"),
    path('served/<str:pk>/',Servedlist.as_view(),name="served_history"),
    path('resources/',ResourcesViews.as_view(),name="resources"),
    path('resources/<str:pk>/',ResourcesViews.as_view(),name="resources")

]