# Generated by Django 4.1.6 on 2023-05-01 11:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('waitlistapp', '0011_alter_service_resource_resource_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='resources',
            name='services',
            field=models.ManyToManyField(to='waitlistapp.services'),
        ),
        migrations.DeleteModel(
            name='Service_resource',
        ),
    ]
