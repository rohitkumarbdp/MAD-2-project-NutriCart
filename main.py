from flask import Flask
from flask_security import SQLAlchemyUserDatastore, Security
import flask_excel as excel
from application.models import db, User, Role
from application.sec import datastore
from application.tasks import *
from config import DevelopmentConfig
from application.workers import celery_init_app
from celery.schedules import crontab
from datetime import datetime, timedelta



def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    excel.init_excel(app)
    app.security = Security(app, datastore)
    with app.app_context():
        import application.views

    return app, datastore
app, datastore = create_app()



celery_app = celery_init_app(app)
@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    
    sender.add_periodic_task(
        crontab(hour=22, minute=53),  #,day_of_week=1
        daily_reminder.s('MynameisIndia@gmail.com','Subject to be written here'),
    )
    sender.add_periodic_task(
        crontab(hour=1, minute=0, day_of_month=1),  # Run monthly_report on the 1st day of every month
        monthly_report.s('manager@example.com', 'Monthly Report'),
    )

if __name__=='__main__':
    app.run(debug=True, port=8080)

