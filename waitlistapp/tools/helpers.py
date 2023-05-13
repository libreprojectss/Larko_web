from django.core.mail import send_mail
from twilio.rest import Client
from django.conf import settings
import random



def send_email(message, to_email,subject="Larko reminder"):
    send_mail(
        subject=subject,
        message=message,
        from_email=None, # Default from email will be used
        recipient_list=[to_email],
        fail_silently=False,
        html_message=message
    )
    return("mail sent sucessfully")

def send_sms(message,to_number):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)        
    message = client.messages.create(
                body=message,
                from_=settings.TWILO_PHONE_NUMBER,
                to=str(to_number)
    )


def generate_token(waitlistid):
    random_number = random.randint(1000, 9999)
    
    token = str(waitlistid) + str(random_number)
    
    return token