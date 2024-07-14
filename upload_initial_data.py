from main import app
from application.sec import datastore
from application.models import *
from flask_security import hash_password
from werkzeug.security import generate_password_hash
from datetime import datetime

with app.app_context():
    db.create_all()
    datastore.find_or_create_role(name="admin", description="User is an admin")
    datastore.find_or_create_role(name="manager", description="User is a manager")
    datastore.find_or_create_role(name="user", description="User is a user")
    db.session.commit()
    if not datastore.find_user(email="admin@gmail.com"):
        datastore.create_user(email="admin@gmail.com", password=generate_password_hash("admin"), roles=["admin"], logout_time = datetime.utcnow(), is_login = False)
    if not datastore.find_user(email="manager1@gmail.com"):
        datastore.create_user(email="manager1@gmail.com", password=generate_password_hash("manager1"), roles=["manager"], active=False, logout_time = datetime.utcnow(), is_login = False)   
    if not datastore.find_user(email="user1@gmail.com"):
        datastore.create_user(email="user1@gmail.com", password=generate_password_hash("user1"), roles=["user"], logout_time = datetime.utcnow(), is_login = False)
    
    try:
        db.session.commit()
    except:
        pass