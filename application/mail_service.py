from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_SERVER = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = "21f1006595@ds.study.iitm.ac.in"
SENDER_PASSWORD = ''

def send_message(to, subject,content_body):
    msg = MIMEMultipart()
    msg['To'] = to
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg.attach(MIMEText(content_body,'html'))
    client = SMTP(host=SMTP_SERVER,port=SMTP_PORT)
    client.send_message(msg=msg)
    client.quit()

def send_monthly_report(to,subject,content_body):
    msg = MIMEMultipart()
    msg['To'] = to
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg.attach(MIMEText(content_body,'html'))
    client = SMTP(host=SMTP_SERVER,port=SMTP_PORT)
    client.send_monthly_report(msg=msg)
    client.quit()



# send_message("rohitkumarbdp786@gmail.com", "Reminder for shopping", 'You have not visited Nutricart.com for a long time.')