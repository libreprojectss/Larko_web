from datetime import timedelta
from django.utils import timezone
from waitlistapp.models import Waitlist,Removed
from datetime import datetime
from django.db.models import Count

def format_interval(interval, interval_start, interval_end):
    if interval == 'today':
        return f"{interval_start.strftime('%H:%M')} - {interval_end.strftime('%H:%M')}"
    elif interval == 'week' or interval == 'month':
        return f"{interval_start.strftime('%Y-%m-%d')}"
    elif interval == 'year':
        return f"{interval_start.strftime('%Y-%m')}"

def get_total_served_and_entries(user, start_time, end_time):
    total_served = Waitlist.objects.filter(user=user, served_time__range=(start_time, end_time)).count()
    total_entries = Waitlist.objects.filter(user=user, added_time__range=(start_time, end_time)).count()+Removed.objects.filter(user=user, added_time__range=(start_time, end_time)).count()
    return total_served, total_entries

def get_time_intervals(start_time, end_time, interval):
    time_intervals = []
    current_time = start_time
    while current_time < end_time:
        time_intervals.append(current_time)
        if interval == 'today':
            current_time += timedelta(hours=1)
        elif interval == 'week':
            current_time += timedelta(days=1)
        elif interval == 'month':
            current_time += timedelta(days=1)
        elif interval == 'year':
            current_time = current_time.replace(month=current_time.month + 1, day=1, hour=0, minute=0, second=0)
    return time_intervals

def calculate_stats(user,interval):
    today = timezone.localtime(timezone.now()).date()
    if interval == 'today':
        start_time = timezone.make_aware(datetime.combine(today, datetime.min.time()))
        end_time = timezone.now()
    elif interval == 'week':
        start_time = timezone.make_aware(datetime.combine(today - timedelta(days=today.weekday()), datetime.min.time()))
        end_time = timezone.now()
    elif interval == 'month':
        start_time = timezone.make_aware(datetime.combine(today.replace(day=1), datetime.min.time()))
        end_time = timezone.now()
    elif interval == 'year':
        start_time = timezone.make_aware(datetime.combine(today.replace(month=1, day=1), datetime.min.time()))
        end_time = timezone.now()

    time_intervals = get_time_intervals(start_time, end_time, interval)

    stats = []
    for i in range(len(time_intervals) - 1):
        interval_start = time_intervals[i]
        interval_end = time_intervals[i + 1]
        total_served, total_entries = get_total_served_and_entries(user, interval_start, interval_end)
        interval_formatted = format_interval(interval, interval_start, interval_end)
        stats.append({
            'interval':interval_formatted,
            'total_served': total_served,
            'total_entries': total_entries
        })
    return stats


