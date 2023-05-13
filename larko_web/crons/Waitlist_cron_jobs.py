from datetime import datetime, timedelta
from django_cron import CronJobBase, Schedule
from waitlistapp.models import Waitlist

class WaitlistCronJob(CronJobBase):
    RUN_EVERY_MINS = 5 # Run every 5 minutes

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'larko_web.Waitlist_cron_jobs'    

    def remove_customer(self, waitlist):
        customer = waitlist[0]
        # waitlist_log = WaitlistLog(
        #     customer_name=customer.customer_name,
        #     service=customer.service,
        #     requested_time=customer.requested_time,
        #     removed_at=datetime.now(),
        #     reason="Customer waited for more than the threshold value."
        # )
        # waitlist_log.save()
        customer.delete()

    def remove_all_customers(self, waitlist):
        # Remove all customers from the waitlist
        # for customer in waitlist:
        #     waitlist_log = WaitlistLog(
        #         customer_name=customer.customer_name,
        #         service=customer.service,
        #         requested_time=customer.requested_time,
        #         removed_at=datetime.now(),
        #         reason="End of the day."
        #     )
        #     waitlist_log.save()
            customer.delete()

    def do(self):
        waitlist = Waitlist.objects.filter(served=False,serving=False).order_by('added_time')
        # if waitlist.exists():
        #     # Check if the customer at rank 1 has waited for more than the threshold value
        #     first_customer = waitlist[0]
        #     waiting_time = datetime.now() - first_customer.requested_time
        #     if waiting_time > timedelta(minutes=10): # 10 minutes is the waiting threshold value
        #         self.remove_customer(waitlist)
        
        # Check if it's the end of the day (e.g., 9pm)
        now = datetime.now()
        end_of_day = datetime(now.year, now.month, now.day, 24, 0, 0) # 12am
        if now >= end_of_day:
            self.remove_all_customers(waitlist)
