# Generated by Django 4.1.6 on 2023-05-13 08:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='business_profile',
            name='enable_validation',
            field=models.BooleanField(default=True),
        ),
    ]