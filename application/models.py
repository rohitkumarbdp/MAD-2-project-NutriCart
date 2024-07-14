from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
db = SQLAlchemy()


class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))




class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer,  primary_key=True)
    first_name = db.Column(db.String(30))
    email = db.Column(db.String, unique= True, nullable=False)
    password = db.Column(db.String(255), nullable = False)
    address = db.Column(db.String())
    pincode = db.Column(db.String(6))
    active = db.Column(db.Boolean())
    is_login = db.Column(db.Boolean())
    logout_time = db.Column(db.DateTime())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)   # to generate auth token uniquely
    roles = db.relationship('Role', secondary='roles_users',
                            backref=db.backref('users', lazy='dynamic'))
    
    

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class Categories(db.Model, UserMixin):
    __tablename__ = "categories"
    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column(db.String(100), unique= True, nullable= False )

class Product(db.Model, UserMixin):
    __tablename__="product"
    id= db.Column(db.Integer,autoincrement=True, primary_key=True)
    product_name = db.Column(db.String(50), unique=True, nullable= False)
    rate = db.Column(db.Float,nullable = False)
    unit = db.Column(db.String(20), nullable = False)
    manufacture= db.Column(db.String(100))
    expiry =db.Column(db.String(100))
    stock_quantity = db.Column(db.Integer,nullable = False)
    category_id = db.Column(db.Integer ,db.ForeignKey("categories.category_id"), nullable=False)

class Purchased(db.Model):
    __tablename__ = 'purchased'
    email = db.Column(db.String, db.ForeignKey("user.email"), primary_key = True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.category_id"), nullable=False, primary_key=True)
    quantity_added = db.Column(db.Integer)
    product_name = db.Column(db.String, db.ForeignKey("product.product_name"),nullable = False)

class Cart(db.Model, UserMixin):
    __tablename__="cart"
    id= db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, db.ForeignKey("user.email"), nullable = False)
    product_id = db.Column(db.Integer , db.ForeignKey('product.id'), nullable =False)
    category_id= db.Column(db.Integer, db.ForeignKey("categories.category_id"), nullable = False)
    quantity_added = db.Column(db.Integer, nullable = False)
    product_name= db.Column(db.String, db.ForeignKey("product.product_name"),nullable = False)


class RequestFromManager(db.Model):
    __tablename__ = "requestFromManager"
    email = db.Column(db.String, nullable = False)
    type_of = db.Column(db.String,nullable = False)
    actionID = db.Column(db.Integer)
    actionInput = db.Column(db.String)
    actionReason= db.Column(db.String)
    nameBeforeChange= db.Column(db.String)
    id = db.Column(db.Integer,primary_key=True,autoincrement=True)