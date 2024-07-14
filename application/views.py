from flask import current_app as app, jsonify, request, render_template, send_file , abort
from flask_security import auth_required, roles_required,current_user
from werkzeug.security import check_password_hash, generate_password_hash
from flask_restful import marshal, fields
from application.sec import datastore
from .models import RequestFromManager,Cart,Product,Categories,User,Purchased, db
from .sec import datastore
# from .resources import *
import flask_excel as excel
from .tasks import generate_csv
from celery.result import AsyncResult
from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm.exc import NoResultFound

###########################  --- General Routes ------##################

@app.get('/')
def home():
    return render_template("index.html")

@app.post('/user-login')  ## Login for everyone
def user_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"message": "Email or password not provided"}), 400
    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message": "User not found"}), 404
    if check_password_hash(user.password, password):
        user.is_login = True
        db.session.commit()
        response_data = {
            "token": user.get_auth_token(),
            "email": user.email,
            "role": user.roles[0].name,
            "first_name":user.first_name
        }
        return jsonify(response_data), 200
    else:
        return jsonify({"message": "Wrong password"}), 401   ## Returned a 401 status code for unauthorized access (wrong password).

@app.post('/logout')  ## Logout for everyone
def logout():
    try:
        data = request.get_json()
        email = data.get('email')
        user = datastore.find_user(email=email)
        user.is_login = False
        user.logout_time = datetime.utcnow()
        db.session.commit()
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        print(f"An error occurred during logout: {str(e)}")
        return jsonify({"message": "An unexpected error occurred"}), 500

@app.post('/registration')   # Registration of new User or Manager
def registration():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email not provided"}), 400
    
    if datastore.find_user(email=email):
        return jsonify({"message": "User already exists. Please choose a different email."}), 409
    role = data.get('role')
    first_name = data.get('first_name')
    address = data.get('address')
    pincode = data.get('pincode')
    password = data.get('password')
    if role not in ['manager', 'user']:
        return jsonify({"message": "Invalid role provided"}), 400

    # Setting active status based on the role since when Role is manager then Admin will approve it.
    active_status = False if role == 'manager' else True

    user_data = {
        "email": email,
        "password": generate_password_hash(password),
        "first_name": first_name,
        "address": address,
        "pincode": pincode,
        "roles": [role],
        "active": active_status,
        "logout_time": datetime.utcnow(),
        "is_login": False
    }
    datastore.create_user(**user_data)
    db.session.commit()
    return jsonify({'message': "Registered successfully"}), 200



#############################       ADMIN     ########################

@auth_required("token")    ## Admin Dashboard
@app.get("/admin-dashboard/<string:user_email>")
def admin_dashboard(user_email):
    user = datastore.find_user(email=user_email)

    if not user.active:
        return jsonify({'message1': 'Your account is currently inactive. Please await approval from the administrator before accessing the system.'}), 403

    category_records = Categories.query.all()

    if not category_records:
        return jsonify({"message2": "No category found"}), 404

    categories = {category.category_id: category.category_name for category in category_records}

    return jsonify(categories)


@auth_required("token")   ## To Delete Category by Admin
@roles_required("admin")
@app.route('/category/<int:category_id>/delete', methods=['POST'])
def delete_category(category_id):
    # Deleting products related to the category
    Product.query.filter(Product.category_id == category_id).delete()

    # Deleting the category itself
    Categories.query.filter(Categories.category_id == category_id).delete()

    # Deleting related entries in the Cart table
    Cart.query.filter(Cart.category_id == category_id).delete()

    # Deleting entries related to the category in the RequestFromManager table
    RequestFromManager.query.filter(RequestFromManager.actionID == category_id).delete()
    
    db.session.commit()
    return jsonify({'message': 'Category deleted successfully'}), 200



@auth_required("token")   ## Creating New Category by Admin
@roles_required("admin")
@app.route('/create-category', methods=['POST'])
def create_category():
    data = request.get_json()
    cat_name = data.get('category_name')

    # Checking if a category with the same name already exists
    existing_category = Categories.query.filter_by(category_name=cat_name).first()
    if existing_category:
        return jsonify({"message":  "Category with the given name already exists. Choose a different name."}), 400

    # Creating a new category
    new_category = Categories(category_name=cat_name)
    db.session.add(new_category)
    db.session.commit()

    return jsonify({"message": "Category created successfully"}), 201



@app.get('/inactive-managers')   ## Getting list of Inactive Managers to activate
def inactive_manager():
    inactive_managers = User.query.filter(User.active == 0).all()

    manager_dict = {}
    for manager in inactive_managers:
        manager_dict[len(manager_dict)] = manager.email

    return jsonify(manager_dict), 200



@auth_required("token")  ## Route to activate inactive Managers
@roles_required("admin")
@app.post('/activate/manager/<string:email>')
def activate_manager(email):
    try:
        manager = User.query.filter(User.email == email).first()

        if not manager:
            abort(404, description="Manager not found")
        manager.active = True
        db.session.commit()
        return jsonify({"message": "Manager activated"}), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500
    



@app.route('/reject/manager/<string:email>', methods=['POST'])     ## Rejecting Manager Confirmation request
def reject_manager(email):
    try:
        request_entry = User.query.filter_by(email=email).first()
        if request_entry:
            db.session.delete(request_entry)
            db.session.commit()
            return jsonify({'message': f'Manager request for {email} rejected successfully'}), 200
        else:
            return jsonify({'error': f'Manager request for {email} not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Error rejecting manager request: {str(e)}'}), 500



@app.route('/active-managers', methods=['GET'])    ### Get list of active managers
def active_managers():
    # Query all users with the role 'manager' and active status True
    managers = User.query.filter(User.roles.any(name='manager'), User.active==True).all()

    # Create a list of manager details and we want only name and email
    manager_list = [{
        # 'id': manager.id,
        'first_name': manager.first_name,
        'email': manager.email,
        # 'address': manager.address,
        # 'pincode': manager.pincode,
        # 'active': manager.active,
        # 'is_login': manager.is_login,
        # 'logout_time': manager.logout_time,
    } for manager in managers]
    return jsonify(manager_list)


@auth_required("token")   ## Dismiss Manager
@roles_required("admin")
@app.route('/dismiss/manager/<string:email>', methods=['DELETE'])
def delete_manager(email):
    try:
        # Find the manager by email
        manager = User.query.filter_by(email=email).first()

        if not manager:
            return jsonify({"message": "Manager not found"}), 404

        # Delete the manager
        db.session.delete(manager)
        db.session.commit()

        return jsonify({"message": "Manager deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500


#### #####           HANDLING REQUESTS            #################

@auth_required("token")   ### Request from Manager to Admin to Edit the category
@roles_required("manager")
@app.route('/request-edit-category/<int:category_id>/<string:user_mail>', methods=['POST'])
def requestEditCategory(category_id, user_mail):
    data = request.get_json()
    actionID = category_id
    actionInput = data.get('category_name')
    actionReason= data.get('actionReason')
    categoryNameBefore= data.get('categoryNameBefore')
    email = user_mail
    type_of = 'edit'
    
    existing_request_check = RequestFromManager.query.filter(
        RequestFromManager.email == email,
        RequestFromManager.type_of == type_of,
        RequestFromManager.actionID == actionID,
        RequestFromManager.actionInput == actionInput
    ).all()

    if not existing_request_check:
        requested_record = RequestFromManager(
            email=email,
            type_of=type_of,
            actionID=actionID,
            actionInput=actionInput,
            actionReason=actionReason,
            nameBeforeChange=categoryNameBefore
        )
        db.session.add(requested_record)
        db.session.commit()
        return jsonify({'message': 'Your request to edit the category has been successfully submitted.'}), 200
    else:
        return jsonify({'message': 'An edit request for this category already exists.'}), 200



@app.route('/all-requests')   ## to Get all the pending requests to be Approved by Manager
def pendingRequests():
    all_requests = RequestFromManager.query.all()
    request_list = []

    if not all_requests:
        return jsonify({'message': 'No requests pending'}), 200
    

    for index, request in enumerate(all_requests, start=1):
        data_dict = {
            'id':request.id,
            'email': request.email,
            'type_of': request.type_of,
            'actionID': request.actionID,
            'actionInput': request.actionInput,
            'actionReason': request.actionReason,
            'nameBeforeChange': request.nameBeforeChange,
            
        }
        request_list.append(data_dict)

    return jsonify(request_list), 200


@auth_required("token")   # admin Approving  Delete request
@roles_required("admin")
@app.route('/approve-category-delete/<int:category_id>', methods=['POST'])
def approveDeleteAction(category_id):
    try:
        # Delete products
        Product.query.filter(Product.category_id == category_id).delete()

        # Delete category
        Categories.query.filter(Categories.category_id == category_id).delete()

        # Delete from carts
        Cart.query.filter(Cart.category_id == category_id).delete()

        # Delete from request table
        RequestFromManager.query.filter(RequestFromManager.actionID == category_id).delete()

        
        db.session.commit()

        return jsonify({'message': 'Deleted successfully'}), 200
    except Exception as e:
        print(f"Error deleting category: {e}")
        return abort(500)  # Internal Server Error


@auth_required("token")   # admin Approving  Edit request
@roles_required("admin")
@app.route('/approve-category-edit/<int:category_id>', methods=['POST'])
def approveEditAction(category_id):
    try:
        data = request.get_json()
        type_of = 'edit'
        actionInput = data.get('category_name')

        # Get the corresponding request record
        request_record = RequestFromManager.query.filter(
            RequestFromManager.actionID == category_id,
            RequestFromManager.type_of == type_of,
            RequestFromManager.actionInput == actionInput
        ).one()

        # Update the category name
        category_record = Categories.query.get(category_id)
        category_record.category_name = request_record.actionInput

        # Delete the request record
        db.session.delete(request_record)
        db.session.commit()

        return jsonify({'message': 'Category updated successfully'}), 200

    except NoResultFound:
        return jsonify({'message': 'Request record not found'}), 404

    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500



@auth_required("token")    # admin Editing category
@roles_required("admin")
@app.route('/category-edit/<int:category_id>', methods=['POST'])   
def edit_category(category_id):
    try:
        category = Categories.query.get(category_id)
        if not category:
            return jsonify({"message": "Category not found"}), 404
        new_name = request.json.get('category_name')
        # Check if a category with the new name already exists
        existing_category = Categories.query.filter_by(category_name=new_name).first()
        if existing_category and existing_category.category_id != category_id:
            return jsonify({"message": "Category with the given name already exists. Choose a different name."}), 400

        
        category.category_name = new_name
        db.session.commit()
        return jsonify({"message": "Category updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/approve-add-category', methods=['POST'])  ## Admin Approving Add category request
def approveAddCategory():
    data = request.get_json()
    new_cat_name = data.get('category_name')

    if Categories.query.filter_by(category_name=new_cat_name).first():
        return jsonify({"message":"Error: The provided category name already exists. Please choose a different name."}), 400

    cat_record = Categories(category_name=new_cat_name)
    db.session.add(cat_record)
    db.session.commit()

    RequestFromManager.query.filter_by(actionInput=new_cat_name).delete()
    db.session.commit()

    return jsonify({"message": "Success: The category has been created successfully."})




@auth_required("token")  # Admin  rejecting a request
@roles_required("admin")
@app.route('/reject-request/<int:request_id>', methods=['POST'])
def rejectRequest(request_id):
    try:
        # Get the request record from the database
        request_record = RequestFromManager.query.get(request_id)

        if not request_record:
            return jsonify({'message': 'Request not found'}), 404

        # Delete the request record from the database
        db.session.delete(request_record)
        db.session.commit()

        return jsonify({'message': 'Request rejected successfully'}), 200

    except Exception as e:
        print(f"Error rejecting request: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500



####################   MANAGER #########################
    

@app.get('/products/<int:category_id>')  ## Get Products in a particular category
def show_products(category_id):
    # Using first_or_404 to handle cases where the category is not found
    category = Categories.query.filter(Categories.category_id == category_id).first_or_404()

    # Fetching products
    product_records = Product.query.filter(Product.category_id == category_id).all()

    # Check if any products are found
    if not product_records:
        return jsonify({"message": "No products found for category '{}'.".format(category.category_name)})

   
    products = [
        {
            "product_id": product.id,
            "product_name": product.product_name,
            "rate": product.rate,
            "unit": product.unit,
            "manufacture": product.manufacture,
            "expiry": product.expiry,
            "stock_quantity": product.stock_quantity,
            
        }
        for product in product_records
    ]

    return jsonify(products)


@auth_required("token")   ## Adding New Product
@roles_required("manager")
@app.route('/add-product/<int:category_id>', methods=['POST'])
def add_products(category_id):
    try:
        category_id_ = category_id
        category = Categories.query.get(category_id_)

        if not category:
            return jsonify({"message": "Category not found"}), 404

        data = request.get_json()

        # Validating required fields
        required_fields = ['product_name', 'manufacture', 'expiry', 'unit', 'rate', 'stock_quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({"message": f"Missing required field: {field}"}), 422

        product_name = data["product_name"]
        man_date = data["manufacture"]
        exp_date = data["expiry"]
        unit = data["unit"]
        rate = data["rate"]
        quantity = data["stock_quantity"]

        # Checking if rate and stock_quantity are greater than 0
        if float(rate) <= 0 or float(quantity) <= 0:
            return jsonify({"message": "Rate and stock quantity must be greater than 0"}), 422

        product_records = Product.query.filter(Product.category_id == category_id_).all()

        for product in product_records:
            if product.product_name == product_name:
                return jsonify({"message":"A product with the same name already exists. Please choose a different name."}), 422

        product_record = Product(
            product_name=product_name,
            manufacture=man_date,
            expiry=exp_date,
            unit=unit,
            rate=rate,
            category_id=category_id_,
            stock_quantity=quantity
        )

        db.session.add(product_record)
        db.session.commit()

        return jsonify({"message": "Product added successfully"}), 201  # 201 Created status code

    except ValueError as ve:
        return jsonify({"message": f"Invalid input: {ve}"}), 422
    except Exception as e:
        return jsonify({"message": f"Internal Server Error: {e}"}), 500



@auth_required("token")   ## Delete Product 
@roles_required("manager")
@app.route('/delete-product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        product = Product.query.get(product_id)

        if not product:
            return jsonify({"message": "Product not found"}), 404

        # Delete the product from related tables
        Cart.query.filter_by(product_id=product_id).delete()

        # Commit changes to the database
        db.session.commit()

        # Finally, delete the product itself
        db.session.delete(product)
        db.session.commit()

        return jsonify({"message": "Product deleted successfully"}), 200

    except Exception as e:
        return jsonify({"message": f"Internal Server Error: {e}"}), 500


@app.get('/product-detail/<int:product_id>')     # Fetch details of a particular Product
def productDetail(product_id):
    product = Product.query.filter(Product.id == product_id).first_or_404()

    prod = {
        'product_id': product.id,
        'product_name': product.product_name,
        'manufacture': product.manufacture,
        'expiry': product.expiry,
        'unit': product.unit,
        'rate': product.rate,
        'category_id': product.category_id,
        'stock_quantity': product.stock_quantity
    }

    return jsonify(prod)



@auth_required("token")    ## Edit Product 
@roles_required("manager")
@app.route('/edit-product/<int:product_id>', methods=['POST'])
def edit_product(product_id):
    try:
        # Assuming you are using SQLAlchemy for database operations
        product = Product.query.get(product_id)
        
        if product is None:
            abort(404, description="Product not found")

        data = request.get_json()

        if float(data.get('rate')) <= 0 or float(data.get('stock_quantity')) <= 0:
            return jsonify({"message": "Rate and stock quantity must be greater than 0"}), 422

        # Update product details
        product.product_name = request.json.get('product_name', product.product_name)
        product.rate = request.json.get('rate', product.rate)
        product.unit = request.json.get('unit', product.unit)
        product.stock_quantity = request.json.get('stock_quantity', product.stock_quantity)
        
        if data.get('manufacture') != None:
            product.manufacture = data['manufacture']
        if data.get('expiry') != None:
            product.expiry = data['expiry']

        # Commit changes to the database
        db.session.commit()

        return jsonify({"message": "Product details updated successfully"})

    except Exception as e:
        return jsonify({"message": str(e)}), 500



@app.route('/category-details/<int:category_id>', methods=['GET'])   ## get category Details from category id
def categoryDetails(category_id):
    category_record = Categories.query.get(category_id)

    if category_record:
        cat_dict = {'category_name': category_record.category_name}
        return jsonify(cat_dict), 200
    else:
        return jsonify({'message': 'Category not found'}), 404
    


@auth_required("token")   ## Request by Manager to Delete the Category
@roles_required("manager")
@app.route('/category/<int:category_id>/delete/<string:email>', methods=['POST'])
def requestCategoryDeletion(category_id, email):
    user_email = email
    request_type = 'delete'
    action_id = category_id
    action_input = ''

    # Checking if a similar request has already been made
    existing_request = RequestFromManager.query.filter(
        RequestFromManager.email == user_email,
        RequestFromManager.type_of == request_type,
        RequestFromManager.actionID == action_id
    ).first()
    nameBeforeChange= Categories.query.get(action_id).category_name

    if existing_request:
        return jsonify({'message': 'A similar request has already been made'}), 200
    else:
        # Make a new request
        new_request = RequestFromManager(
            email=user_email,
            type_of=request_type,
            actionID=action_id,
            actionInput=action_input,
            nameBeforeChange=nameBeforeChange
        )
        db.session.add(new_request)
        db.session.commit()
        return jsonify({'message': 'Request sent to Admin for category deletion'}), 200



@auth_required("token")     ## Request by Manager to Add new Category
@roles_required("manager")
@app.route('/request-add-category/<string:userEmail>', methods=['POST'])
def requestToCreateCategory(userEmail):
    data = request.get_json()
    cat_name = data.get('categoryName')
    actionReason=data.get('actionReason')

    if Categories.query.filter_by(category_name=cat_name).first():
        return jsonify({"message": "Category name already exists, try a different name"}), 400

    email_ = userEmail
    type_of_ = 'add'
    actionID = None
    actionInput = cat_name
    

    if not RequestFromManager.query.filter_by(email=email_, type_of=type_of_, actionID=actionID, actionInput=actionInput).first():
        req = RequestFromManager(email=email_, type_of=type_of_, actionID=actionID, actionInput=actionInput,actionReason=actionReason)
        db.session.add(req)
        db.session.commit()
        return jsonify({'message': 'Request sent to Admin'}), 200

    return jsonify({'message': 'Request has already been made'}), 200



########################   User dashbord things  #############
 

@app.route('/all-categories')   ## User Getting the categories 
def allCategories():
    category_records = Categories.query.all()

    if not category_records:
        return jsonify({"message": "No categories found"}), 404

    categories_dict = {category.category_id: category.category_name for category in category_records}
    
    return jsonify(categories_dict), 200



@auth_required("token")    # Adding product to Cart by user
@app.route('/add-to-cart/<string:user_email>/<int:product_id>', methods=['POST'])
def addToCart(user_email, product_id):
    try:
        product = Product.query.filter_by(id=product_id).first()

        if not product:
            return jsonify({"message": "Product not found"}), 404

        user_cart_item = Cart.query.filter_by(product_id=product_id, email=user_email).first()

        if not user_cart_item and product.stock_quantity >= 1:
            cart_item = Cart(
                email=user_email,
                product_id=product_id,
                category_id=product.category_id,
                quantity_added=1,
                product_name=product.product_name
            )
            db.session.add(cart_item)
            db.session.commit()
            return jsonify({"message": "Item added to cart successfully"}), 200
        else:
            return jsonify({"message": "Item is already in the cart or not enough stock"}), 200

    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500



@auth_required("token")   ## Fetching  products in Cart
@app.route('/user-cart/<string:user_email>')    
def see_cart(user_email):
    user_cart = Cart.query.filter_by(email=user_email).all()

    if user_cart:
        cart_data = {
            item.product_id: {
                "email": item.email,
                "category_id": item.category_id,
                "quantity": item.quantity_added,
                "product_name": item.product_name,
            }
            for item in user_cart
        }
        return jsonify(cart_data)
    else:
        return jsonify({"message": "No item in the cart"}), 200
    

@auth_required("token")      ### Details of every product present in Cart
@app.route('/product-details-cart/<string:user_email>')
def cart_product(user_email):
    user_cart = Cart.query.filter_by(email=user_email).all()
    products = Product.query.all()

    if user_cart:
        product_data = {}
        for item in user_cart:
            product_match = next((prod for prod in products if prod.id == item.product_id), None)

            if product_match:
                product_data[item.product_id] = {
                    "product_id": product_match.id,
                    "product_name": product_match.product_name,
                    "manufacture_date": product_match.manufacture,
                    "expiry_date": product_match.expiry,
                    "rate": product_match.rate,
                    "unit": product_match.unit,
                }
        return jsonify(product_data), 200
    else:
        return jsonify({"message": "The shopping cart currently has no items."}), 200



@app.route('/remove-cart-item/<string:user_email>/<int:product_id>', methods=['POST'])   ### Remove product from Cart
def removeProductFromCart(user_email, product_id):
    # Use first() instead of all() if you expect only one result
    cart_prod = Cart.query.filter(Cart.product_id == product_id, Cart.email == user_email).first()

    # Check if cart_prod exists before attempting to delete
    if cart_prod:
        try:
            db.session.delete(cart_prod)
            db.session.commit()
            return jsonify({'message': 'Product deleted successfully'}), 200
        except Exception as e:
            return jsonify({'message': f'Error deleting product: {str(e)}'}), 500

    return jsonify({'message': 'Product not found or already deleted'}), 404




@app.route('/edit-cart-item-quantity/<string:user_email>/<int:product_id>', methods=['POST'])   ## Updating item Quantity in Cart
def editCartItemQuantity(user_email, product_id):
    data = request.get_json()
    new_quantity = data.get('quantity')

    if int(new_quantity) <= 0:
        return jsonify({'message': f'Quantity must be greater than or equal to 1.'}), 400
    
       
    else:
        cart_product = Cart.query.filter(Cart.product_id == product_id, Cart.email == user_email).first()
        prod = Product.query.get(product_id)
        if int(new_quantity) > int(prod.stock_quantity):
            return jsonify({'message':f'Quantity should be less than Stock. Please choose a number less than {prod.stock_quantity}'}), 400
        if cart_product:
            cart_product.quantity_added = new_quantity
            db.session.commit()
            return jsonify({'message': 'Quantity updated successfully'}), 200
        else:
            return jsonify({'message': 'Product not found in the cart'}), 404






@app.route('/make-payment/<string:usermail>', methods=['GET'])    ### Grabbing details and getting ready for final payment button
def making_purchase(usermail):
    cart_items = Cart.query.filter(Cart.email == usermail).all()

    if len(cart_items) == 0:
        return jsonify({'message': 'No Cart item to purchase'}), 200

    final_dict = {'grandTotal': 0, 'items': []}

    for each in cart_items:
        prod_id = each.product_id
        prod_quant = each.quantity_added

        product_info = Product.query.get(prod_id)

        if not product_info:
            continue

        available_quantity = min(product_info.stock_quantity, prod_quant)

        prod_dict = {
            'product_name': product_info.product_name,
            'rate': product_info.rate,
            'unit': product_info.unit,
            'quantity': available_quantity,
            'subTotal': product_info.rate * available_quantity
        }

        final_dict['items'].append(prod_dict)
        final_dict['grandTotal'] += prod_dict['subTotal']

    return jsonify(final_dict), 200

        

@app.route('/final-payment/<string:username>', methods=['GET'])   ### final payment button
def finalPayment(username):
    cart_items = Cart.query.filter(Cart.email == username).all()

    if not cart_items:
        abort(404, description='No items in the cart for payment')

    try:
        for cart_item in cart_items:
            prod_id = cart_item.product_id
            prod_quant = cart_item.quantity_added
            product_info = Product.query.get_or_404(prod_id)

            if product_info.stock_quantity - prod_quant >= 0:
                product_info.stock_quantity -= prod_quant
            else:
                product_info.stock_quantity = 0

            purchased_item = Purchased.query.filter(
                Purchased.product_id == prod_id, Purchased.email == username
            ).first()

            if purchased_item:
                purchased_item.quantity_added += prod_quant
            else:
                purchased_item = Purchased(
                    email=username,
                    product_id=prod_id,
                    category_id=cart_item.category_id,
                    quantity_added=prod_quant,
                    product_name=cart_item.product_name
                )
                db.session.add(purchased_item)

            db.session.delete(cart_item)

        db.session.commit()
        return jsonify({'message': 'Payment successful'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500




@app.get('/search')
def search():
    q = request.args.get("term", '')
    if q:
        results = Product.query.join(Categories).filter(
            or_(
                Product.product_name.ilike(f'%{q}%'),
                Categories.category_name.ilike(f'%{q}%')
            )
        ).limit(100).all()

        response_data = []
        for result in results:
            prod_dict = {
                'product_id' :result.id,
                'product_name': result.product_name,
                'manufacture_date': result.manufacture,
                'expiry_date': result.expiry,
                'rate': result.rate,
                'unit': result.unit,
                'quantity': result.stock_quantity
            }
            response_data.append(prod_dict)

        if response_data:
            return jsonify(response_data)
        else:
            return jsonify({'message': "No matching products found"})
    else:
        return jsonify({'message': "No search term provided"})

######################################   Celery Redis part ##################

@app.get('/download-csv')
def download_csv():
    task = generate_csv.delay()
    return jsonify({"task-id":task.id})
    

@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({'message':'task pending'}), 404