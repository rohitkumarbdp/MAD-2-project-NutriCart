from celery import shared_task
from .models import db, Purchased
import flask_excel as excel
from .mail_service import send_message, send_monthly_report
from application.sec import datastore
from datetime import datetime, timedelta
from .models import RequestFromManager,Cart,Product,Categories ,User,Purchased




@shared_task(ignore_result = False)
def generate_csv():
    record = Purchased.query.with_entities(Purchased.email, Purchased.product_name, Purchased.quantity_added).all()
    csv_output = excel.make_response_from_query_sets(record,["email", "product_name", "quantity_added"],"csv")
    fileName = "test1.csv"
    with open(fileName, 'wb') as f:
        f.write(csv_output.data)

    return fileName    

@shared_task(ignore_result = False)
def daily_reminder(to,subject): 
    users = User.query.filter(User.is_login == False).all()
    for user in users:
        current_time = datetime.utcnow()
        time_difference = current_time - user.logout_time
        if time_difference > timedelta(minutes=5): 
            send_message(user.email,subject,f'Hello {user.first_name} \n\n You have not visited NutriCart for a long time. We have added new products please login and enjoy Shopping.')
    return "OK"

@shared_task(ignore_result = False)
def monthly_report(to,subject):
    content_body = "This is a placeholder for the monthly report content."
    send_monthly_report(to,subject,content_body)
    return "Monthly report sent successfully"


