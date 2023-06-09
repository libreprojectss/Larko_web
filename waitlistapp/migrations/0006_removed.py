# Generated by Django 4.1.6 on 2023-05-20 03:55

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('waitlistapp', '0005_first_on_queue'),
    ]

    operations = [
        migrations.CreateModel(
            name='Removed',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('added_time', models.DateTimeField()),
                ('self_cancelled', models.BooleanField(blank=True, default=False)),
                ('auto_removed', models.BooleanField(blank=True, default=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='removed_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
