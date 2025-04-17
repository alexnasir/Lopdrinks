import os
from flask import Flask, request, jsonify, make_response, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import random
import logging
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from dotenv import load_dotenv
from extensions import db, migrate, jwt

load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='/')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(app.instance_path, 'coffee.db'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'a-very-secure-random-string')
app.config['UPLOAD_FOLDER'] = os.path.join(app.static_folder, 'Uploads')
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure instance and upload directories exist
os.makedirs(app.instance_path, exist_ok=True)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

db.init_app(app)
migrate.init_app(app, db)
jwt.init_app(app)

from model import User, Recipe, Order, BrewMethod, Ingredient, RecipeIngredient

with app.app_context():
    db.create_all()

ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001,http://localhost:5173,http://127.0.0.1:3000,https://lopdrinks-blwa.vercel.app').split(',')
app.logger.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# ... rest of the code remains unchanged ...

@app.before_request
def log_request():
    headers = {k: v for k, v in request.headers.items() if k not in ['Authorization', 'Cookie']}
    body = request.get_data(as_text=True)[:200]  # Limit body length
    app.logger.debug(f"Incoming request: {request.method} {request.path} Headers: {headers} Body: {body}")

@app.after_request
def log_cors_headers(response):
    app.logger.debug(f"Response CORS headers: {response.headers.get('Access-Control-Allow-Origin')}, "
                     f"Allow-Credentials: {response.headers.get('Access-Control-Allow-Credentials')}")
    return response

@jwt.unauthorized_loader
def unauthorized_callback(error):
    app.logger.error(f"JWT unauthorized error: {str(error)}")
    return jsonify({"error": True, "message": "Missing or invalid token", "code": 401}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    app.logger.error(f"JWT invalid token error: {str(error)}")
    return jsonify({"error": True, "message": "Invalid token", "code": 401}), 401

def send_verification_email(email, code):
    app.logger.debug(f"[Mock Email] OTP {code} sent to {email}")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# --- Image Upload ---
@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    try:
        current_user = get_jwt_identity()
        user_role = current_user['role']
        if user_role != 'Admin':
            return jsonify({"error": True, "message": "Admins only.", "code": 403}), 403
        if 'file' not in request.files:
            return jsonify({"error": True, "message": "No file part", "code": 400}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": True, "message": "No selected file", "code": 400}), 400
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{datetime.utcnow().timestamp()}_{filename}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
            image_url = f"/uploads/{unique_filename}"
            return jsonify({
                "error": False,
                "message": "File uploaded successfully",
                "image_url": image_url
            }), 200
        return jsonify({"error": True, "message": "Invalid file type", "code": 400}), 400
    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to upload file", "code": 500}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- Auth ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not all([data.get('username'), data.get('email'), data.get('password')]):
        return jsonify({"error": True, "message": "Missing required fields", "code": 400}), 400
    hashed_pw = generate_password_hash(data['password'])
    otp = str(random.randint(100000, 999999))
    user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_pw,
        otp_code=otp,
        role=data.get('role', 'User')
    )
    try:
        db.session.add(user)
        db.session.commit()
        send_verification_email(user.email, otp)
        return jsonify({
            "error": False,
            "message": "Registered. OTP sent to email."
        }), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Register error: {str(e)}")
        return jsonify({"error": True, "message": "Registration failed", "code": 500}), 500

@app.route('/verify', methods=['POST'])
def verify():
    data = request.json
    if not all([data.get('email'), data.get('otp')]):
        return jsonify({"error": True, "message": "Missing email or OTP", "code": 400}), 400
    user = User.query.filter_by(email=data['email']).first()
    if user and user.otp_code == data['otp']:
        user.is_verified = True
        user.otp_code = None
        try:
            db.session.commit()
            return jsonify({"error": False, "message": "Email verified."})
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Verify error: {str(e)}")
            return jsonify({"error": True, "message": "Verification failed", "code": 500}), 500
    return jsonify({"error": True, "message": "Invalid OTP.", "code": 400}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not all([data.get('email'), data.get('password')]):
        return jsonify({"error": True, "message": "Missing email or password", "code": 400}), 400
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        if not user.is_verified:
            return jsonify({"error": True, "message": "Verify email first.", "code": 401}), 401
        token = create_access_token(identity={'id': user.id, 'role': user.role}, expires_delta=False)
        app.logger.debug(f"Non-expiring token created for user {user.email}")
        return jsonify({
            "error": False,
            "message": "Login successful",
            "token": token,
            "role": user.role
        })
    return jsonify({"error": True, "message": "Invalid credentials.", "code": 401}), 401

# --- Brew Methods ---
@app.route('/brew_methods/', methods=['GET'])
def get_brew_methods():
    try:
        brew_methods = BrewMethod.query.all()
        return jsonify([
            {'id': bm.id, 'name': bm.name, 'details': bm.details}
            for bm in brew_methods
        ])
    except Exception as e:
        app.logger.error(f"Get brew methods error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to fetch brew methods", "code": 500}), 500

@app.route('/brew_methods/', methods=['POST'])
@jwt_required()
def create_brew_method():
    try:
        current_user = get_jwt_identity()
        user_role = current_user['role']
        if user_role != 'Admin':
            return jsonify({"error": True, "message": "Admins only.", "code": 403}), 403
        data = request.json
        if not data.get('name'):
            return jsonify({"error": True, "message": "Name is required", "code": 400}), 400
        brew_method = BrewMethod(name=data['name'], details=data.get('details'))
        db.session.add(brew_method)
        db.session.commit()
        return jsonify({"error": False, "message": "Brew method created."}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Create brew method error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to create brew method", "code": 500}), 500

# --- Ingredients ---
@app.route('/ingredients/', methods=['GET'])
def get_ingredients():
    try:
        ingredients = Ingredient.query.all()
        return jsonify([
            {'id': ing.id, 'name': ing.name}
            for ing in ingredients
        ])
    except Exception as e:
        app.logger.error(f"Get ingredients error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to fetch ingredients", "code": 500}), 500

@app.route('/ingredients/', methods=['POST'])
@jwt_required()
def create_ingredient():
    try:
        current_user = get_jwt_identity()
        user_role = current_user['role']
        if user_role != 'Admin':
            return jsonify({"error": True, "message": "Admins only.", "code": 403}), 403
        data = request.json
        if not data.get('name'):
            return jsonify({"error": True, "message": "Name is required", "code": 400}), 400
        ingredient = Ingredient(name=data['name'])
        db.session.add(ingredient)
        db.session.commit()
        return jsonify({"error": False, "message": "Ingredient created."}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Create ingredient error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to create ingredient", "code": 500}), 500

# --- Recipes ---
@app.route('/recipes/', methods=['GET'])
def get_recipes():
    try:
        recipes = Recipe.query.all()
        result = [
            {
                'id': r.id,
                'name': r.name,
                'description': r.description,
                'price': float(r.price),
                'takeaway': r.takeaway,
                'image_url': r.image_url,
                'brew_method': {
                    'id': r.brew_method.id,
                    'name': r.brew_method.name,
                    'details': r.brew_method.details
                } if r.brew_method else None,
                'ingredients': [
                    {'id': ri.ingredient.id, 'name': ri.ingredient.name, 'quantity': ri.quantity}
                    for ri in r.ingredients
                ]
            }
            for r in recipes
        ]
        app.logger.debug(f"Recipes fetched: {len(result)}")
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Get recipes error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to fetch recipes", "code": 500}), 500

@app.route('/recipes/', methods=['POST'])
@jwt_required()
def create_recipe():
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']
        user_role = current_user['role']
        if user_role != 'Admin':
            return jsonify({"error": True, "message": "Admins only.", "code": 403}), 403
        data = request.json
        if not all([data.get('name'), data.get('price'), data.get('brew_method_id')]):
            return jsonify({"error": True, "message": "Missing required fields", "code": 400}), 400
        brew_method = BrewMethod.query.get(data['brew_method_id'])
        if not brew_method:
            return jsonify({"error": True, "message": "Brew method not found.", "code": 400}), 400
        for ing in data.get('ingredients', []):
            ingredient = Ingredient.query.get(ing.get('ingredient_id'))
            if not ingredient:
                return jsonify({"error": True, "message": f"Ingredient {ing.get('ingredient_id')} not found.", "code": 400}), 400
        recipe = Recipe(
            name=data['name'],
            description=data.get('description'),
            price=float(data['price']),
            takeaway=data.get('takeaway', False),
            image_url=data.get('image_url'),
            brew_method_id=data['brew_method_id'],
            created_by=user_id
        )
        db.session.add(recipe)
        db.session.flush()
        for ing in data.get('ingredients', []):
            recipe_ing = RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=ing['ingredient_id'],
                quantity=ing['quantity']
            )
            db.session.add(recipe_ing)
        db.session.commit()
        return jsonify({"error": False, "message": "Recipe created."}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Create recipe error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to create recipe", "code": 500}), 500

@app.route('/recipes/<int:recipe_id>', methods=['PUT'])
@jwt_required()
def update_recipe(recipe_id):
    try:
        current_user = get_jwt_identity()
        user_role = current_user['role']
        if user_role != 'Admin':
            return jsonify({"error": True, "message": "Admins only.", "code": 403}), 403
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": True, "message": "Recipe not found.", "code": 404}), 404
        data = request.json
        recipe.name = data.get('name', recipe.name)
        recipe.description = data.get('description', recipe.description)
        recipe.price = float(data.get('price', recipe.price))
        recipe.takeaway = data.get('takeaway', recipe.takeaway)
        recipe.image_url = data.get('image_url', recipe.image_url)
        if 'brew_method_id' in data:
            brew_method = BrewMethod.query.get(data['brew_method_id'])
            if not brew_method:
                return jsonify({"error": True, "message": "Brew method not found.", "code": 400}), 400
            recipe.brew_method_id = data['brew_method_id']
        if 'ingredients' in data:
            RecipeIngredient.query.filter_by(recipe_id=recipe.id).delete()
            for ing in data['ingredients']:
                ingredient = Ingredient.query.get(ing.get('ingredient_id'))
                if not ingredient:
                    return jsonify({"error": True, "message": f"Ingredient {ing.get('ingredient_id')} not found.", "code": 400}), 400
                recipe_ing = RecipeIngredient(
                    recipe_id=recipe.id,
                    ingredient_id=ing.get('ingredient_id'),
                    quantity=ing['quantity']
                )
                db.session.add(recipe_ing)
        db.session.commit()
        return jsonify({"error": False, "message": "Recipe updated."})
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Update recipe error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to update recipe", "code": 500}), 500

@app.route('/recipes/<int:recipe_id>', methods=['DELETE'])
@jwt_required()
def delete_recipe(recipe_id):
    try:
        current_user = get_jwt_identity()
        user_role = current_user['role']
        if user_role != 'Admin':
            return jsonify({"error": True, "message": "Admins only.", "code": 403}), 403
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            return jsonify({"error": True, "message": "Recipe not found.", "code": 404}), 404
        db.session.delete(recipe)
        db.session.commit()
        return jsonify({"error": False, "message": "Recipe deleted."})
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Delete recipe error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to delete recipe", "code": 500}), 500

# ... (other imports and setup unchanged)

# --- Orders ---
@app.route('/orders/', methods=['GET'])
@jwt_required()
def get_all_orders():
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']
        user_role = current_user['role']
        app.logger.debug(f"Fetching orders for user_id={user_id}, role={user_role}")
        user = User.query.get(user_id)
        if not user:
            app.logger.error(f"User not found: user_id={user_id}")
            return jsonify({"error": True, "message": "User not found", "code": 404}), 404
        limit = request.args.get('limit', default=5, type=int)
        status = request.args.get('status', default=None, type=str)  # Add status filter
        if limit < 1:
            app.logger.error(f"Invalid limit: {limit}")
            return jsonify({"error": True, "message": "Limit must be a positive integer", "code": 400}), 400
        query = Order.query
        if user_role == "Admin":
            if status:
                query = query.filter_by(status=status)
            orders = query.order_by(Order.ordered_at.desc()).limit(limit).all()
        else:
            query = query.filter_by(user_id=user_id)
            if status:
                query = query.filter_by(status=status)
            orders = query.order_by(Order.ordered_at.desc()).limit(limit).all()
        result = [
            {
                "id": o.id,
                "recipe_id": o.recipe_id,
                "recipe_name": o.recipe.name if o.recipe else None,
                "quantity": o.quantity,
                "unit_price": float(o.unit_price),
                "status": o.status,
                "ordered_at": o.ordered_at.isoformat(),
                "user_id": o.user_id
            }
            for o in orders if o
        ]
        app.logger.debug(f"Orders fetched: {len(result)}")
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Get orders error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to fetch orders", "code": 500}), 500
    
@app.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order_by_id(order_id):
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']
        user_role = current_user['role']
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": True, "message": "User not found", "code": 404}), 404
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": True, "message": "Order not found", "code": 404}), 404
        if user_role != "Admin" and order.user_id != user_id:
            return jsonify({"error": True, "message": "Unauthorized", "code": 403}), 403
        return jsonify({
            "id": order.id,
            "recipe_id": order.recipe_id,
            "recipe_name": order.recipe.name if order.recipe else None,
            "quantity": order.quantity,
            "unit_price": float(order.unit_price),
            "status": order.status,
            "ordered_at": order.ordered_at.isoformat(),
            "user_id": order.user_id
        })
    except Exception as e:
        app.logger.error(f"Get order {order_id} error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to fetch order", "code": 500}), 500

@app.route('/orders/', methods=['POST'])
@jwt_required()
def create_order():
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']
        data = request.get_json(silent=True)
        if not data:
            app.logger.error("Invalid JSON payload")
            return jsonify({"error": True, "message": "Invalid JSON payload", "code": 400}), 400
        
        recipe_id = data.get('recipe_id')
        quantity = data.get('quantity', 1)
        
        if not recipe_id:
            app.logger.error("Missing recipe_id")
            return jsonify({"error": True, "message": "Recipe ID required", "code": 400}), 400
        
        try:
            quantity = int(quantity)
            if quantity < 1:
                raise ValueError("Quantity must be positive")
        except (ValueError, TypeError):
            app.logger.error(f"Invalid quantity: {quantity}")
            return jsonify({"error": True, "message": "Quantity must be a positive integer", "code": 400}), 400
        
        recipe = Recipe.query.get(recipe_id)
        if not recipe:
            app.logger.error(f"Recipe not found: recipe_id={recipe_id}")
            return jsonify({"error": True, "message": "Recipe not found", "code": 404}), 404
        
        order = Order(
            user_id=user_id,
            recipe_id=recipe_id,
            quantity=quantity,
            unit_price=float(recipe.price),
            status="Pending",
            ordered_at=datetime.utcnow()
        )
        db.session.add(order)
        db.session.commit()
        app.logger.info(f"Order created: order_id={order.id}")
        return jsonify({
            "error": False,
            "message": "Order placed successfully",
            "order_id": order.id,
            "quantity": order.quantity,
            "recipe_id": order.recipe_id
        }), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Create order error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to place order", "code": 500}), 500

@app.route('/orders/<int:order_id>', methods=['PATCH'])
@jwt_required()
def update_order(order_id):
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']
        user_role = current_user['role']
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": True, "message": "Order not found", "code": 404}), 404
        if order.user_id != user_id and user_role != 'Admin':
            return jsonify({"error": True, "message": "Unauthorized", "code": 403}), 403
        data = request.get_json()
        if not data:
            return jsonify({"error": True, "message": "No data provided", "code": 400}), 400
        updated = False
        if 'quantity' in data:
            try:
                quantity = int(data['quantity'])
                if quantity < 1:
                    return jsonify({"error": True, "message": "Quantity must be a positive integer", "code": 400}), 400
                order.quantity = quantity
                updated = True
            except (ValueError, TypeError):
                return jsonify({"error": True, "message": "Quantity must be a positive integer", "code": 400}), 400
        if 'status' in data:
            if user_role != 'Admin':
                return jsonify({"error": True, "message": "Only admins can update status", "code": 403}), 403
            valid_statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
            if data['status'] not in valid_statuses:
                return jsonify({"error": True, "message": "Invalid status value", "code": 400}), 400
            order.status = data['status']
            updated = True
        if not updated:
            return jsonify({"error": True, "message": "No valid fields to update", "code": 400}), 400
        db.session.commit()
        app.logger.info(f"Order updated: order_id={order_id}")
        return jsonify({
            "error": False,
            "message": "Order updated",
            "order_id": order.id,
            "quantity": order.quantity,
            "status": order.status
        })
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Update order {order_id} error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to update order", "code": 500}), 500

@app.route('/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    try:
        current_user = get_jwt_identity()
        user_id = current_user['id']
        user_role = current_user['role']
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"error": True, "message": "Order not found", "code": 404}), 404
        if order.user_id != user_id and user_role != 'Admin':
            return jsonify({"error": True, "message": "Unauthorized", "code": 403}), 403
        if order.status != 'Pending' and user_role != 'Admin':
            return jsonify({"error": True, "message": "Only pending orders can be deleted", "code": 403}), 403
        db.session.delete(order)
        db.session.commit()
        app.logger.info(f"Order deleted: order_id={order_id}")
        return jsonify({
            "error": False,
            "message": "Order deleted",
            "order_id": order_id
        })
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Delete order {order_id} error: {str(e)}")
        return jsonify({"error": True, "message": "Failed to delete order", "code": 500}), 500

# ... (rest of the file unchanged)
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)