from rest_framework import serializers
from .models import Public_link
class Public_Link_Serializer(serializers.ModelSerializer):
    class Meta:
        model=Public_link
        fields=["public_access","public_join_link"]
