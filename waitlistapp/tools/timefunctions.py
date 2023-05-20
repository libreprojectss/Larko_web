from datetime import datetime, timedelta
from django.utils import timezone

def get_day_range(today):
    start_time = today.replace(hour=0, minute=0, second=0, microsecond=0)
    end_time = today
    return start_time, end_time

def get_week_range(today):
    start_time = today - timedelta(days=today.weekday())
    start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
    end_time = today
    return start_time, end_time

def get_month_range(today):
    start_time = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end_time = today
    return start_time, end_time

def get_year_range(today):
    start_time = today.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    end_time = today
    return start_time, end_time