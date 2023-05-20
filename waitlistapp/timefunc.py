# from django.utils import timezone
# import calendar
# from datetime import date, timedelta
# def get_day_range(date):
#     start_time = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.min.time()))
#     end_time = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.max.time()))
#     return start_time, end_time

# def get_week_range(date):
#     start_time = timezone.make_aware(timezone.datetime.combine(date - timezone.timedelta(days=date.weekday()), timezone.datetime.min.time()))
#     end_time = timezone.make_aware(timezone.datetime.combine(date + timezone.timedelta(days=6-date.weekday()), timezone.datetime.max.time()))
#     return start_time, end_time

# def get_month_range(date):
#     start_time = date.replace(day=1)
#     end_time = start_time + timedelta(days=calendar.monthrange(date.year, date.month)[1] - 1)
#     return start_time, end_time

# def get_year_range(date):
#     start_time = timezone.make_aware(timezone.datetime.combine(date.replace(month=1, day=1), timezone.datetime.min.time()))
#     end_time = timezone.make_aware(timezone.datetime.combine(date.replace(month=12, day=31), timezone.datetime.max.time()))
#     return start_time, end_time

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