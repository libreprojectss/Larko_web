# Generated by Django 4.1.6 on 2023-05-16 07:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0003_logs'),
    ]

    operations = [
        migrations.AddField(
            model_name='business_profile',
            name='auto_remove_after',
            field=models.IntegerField(default=5),
        ),
        migrations.AddField(
            model_name='business_profile',
            name='maximum_serve_per_day',
            field=models.IntegerField(default=100),
        ),
    ]
