# Generated by Django 4.1.6 on 2023-03-09 15:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0016_alter_business_profile_bussiness_detail_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='business_profile',
            name='bussiness_detail_name',
            field=models.CharField(default=None, max_length=100),
        ),
    ]