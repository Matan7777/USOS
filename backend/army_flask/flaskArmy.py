from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Matanadani345!@localhost:5432/StoreData'
db = SQLAlchemy(app)
CORS(app)

# הגדרת תיקיית התמונות
app.config['UPLOAD_FOLDER'] = r'C:\Users\User\PycharmProjects\army_flask\.venv\src'

# מודל של קטגוריה
class Category(db.Model):
    __tablename__ = 'Category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    items = db.relationship('Item', backref='category', lazy=True)

# מודל של פריט
class Item(db.Model):
    __tablename__ = 'Item'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    size = db.Column(db.String(10))
    color = db.Column(db.String(50))
    in_stock = db.Column(db.Boolean, default=True)
    quantity = db.Column(db.Integer, default=1)
    image_url = db.Column(db.String(255))
    category_id = db.Column(db.Integer, db.ForeignKey('Category.id'), nullable=False)
    cart_items = db.relationship('Cart', backref='item_ref', lazy=True)

# מודל של עגלת קניות
class Cart(db.Model):
    __tablename__ = 'Cart'
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('Item.id'), primary_key=True)
    quantity = db.Column(db.Integer, default=1)
    user = db.relationship('User', backref='cart_items')
    item = db.relationship('Item', backref='cart_references')

# מודל של משתמש
class User(db.Model):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    money = db.Column(db.Float, default=1000.0)
    cart = db.relationship('Cart', backref='user_ref', lazy=True)

# פונקציה לרישום משתמש
@app.route('/signup', methods=['POST'])
def register_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'message': 'User already exists!'}), 400

    new_user = User(
        username=username,
        password_hash=generate_password_hash(password)
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully!'}), 201

# פונקציה להתחברות משתמש
@app.route('/login', methods=['POST'])
def login_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid username or password!'}), 401

    return jsonify({'message': 'Login successful!', 'user_id': user.id}), 200

# פונקציה להוספת פריט לעגלה
@app.route('/cart/add', methods=['POST'])
def add_to_cart():
    data = request.json
    user_id = data.get('user_id')
    item_id = data.get('item_id')
    quantity = data.get('quantity', 1)

    if not user_id or not item_id:
        return jsonify({'message': 'User ID and Item ID are required'}), 400

    existing_cart_item = Cart.query.filter_by(user_id=user_id, item_id=item_id).first()

    if existing_cart_item:
        existing_cart_item.quantity += quantity
    else:
        new_cart_item = Cart(user_id=user_id, item_id=item_id, quantity=quantity)
        db.session.add(new_cart_item)

    db.session.commit()
    return jsonify({'message': 'Item added to cart successfully!'}), 200

# פונקציה לשליפת פריטים
@app.route('/items', methods=['GET'])
def get_items():
    category = request.args.get('category')
    if category:
        items = Item.query.join(Category).filter(Category.name == category).all()
    else:
        items = Item.query.all()

    items_list = [
        {
            'id': item.id,
            'name': item.name,
            'price': item.price,
            'size': item.size,
            'color': item.color,
            'in_stock': item.in_stock,
            'quantity': item.quantity,
            'image_url': f"http://localhost:5000/src/{os.path.basename(item.image_url)}"
        } for item in items
    ]

    return jsonify(items_list), 200

# פונקציה לקבלת תמונות מתיקיית src
@app.route('/src/<filename>', methods=['GET'])
def get_image(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'error': 'Image not found'}), 404

# פונקציה לשליפת עגלת הקניות של המשתמש
@app.route('/cart', methods=['GET'])
def get_cart():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    cart_items = Cart.query.filter_by(user_id=user_id).all()

    cart_list = [
        {
            'id': item.item_id,
            'name': item.item_ref.name,
            'price': item.item_ref.price,
            'quantity': item.quantity
        } for item in cart_items
    ]

    return jsonify(cart_list), 200

# פונקציה להסרת פריט מהעגלה
@app.route('/cart/remove/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    cart_item = Cart.query.filter_by(user_id=user_id, item_id=item_id).first()

    if cart_item:
        db.session.delete(cart_item)
        db.session.commit()
        return jsonify({'message': 'Item removed from cart successfully!'}), 200
    else:
        return jsonify({'message': 'Item not found in cart'}), 404

# פונקציה לניקוי כל העגלה
@app.route('/cart/clear', methods=['DELETE'])
def clear_cart():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    Cart.query.filter_by(user_id=user_id).delete()
    db.session.commit()

    return jsonify({'message': 'All items removed from cart successfully!'}), 200

# פונקציה לעדכון כמות של פריט בעגלה
@app.route('/cart/update', methods=['PUT'])
def update_cart():
    data = request.json
    user_id = data.get('user_id')
    item_id = data.get('item_id')
    change = data.get('change')

    if not user_id or not item_id:
        return jsonify({'message': 'User ID and Item ID are required'}), 400

    cart_item = Cart.query.filter_by(user_id=user_id, item_id=item_id).first()

    if cart_item:
        cart_item.quantity += change
        db_item = cart_item.item_ref

        # בדיקת סטוק לאחר עדכון כמות
        if db_item.quantity <= 0:
            db_item.in_stock = False
        else:
            db_item.in_stock = True

        db.session.commit()
        return jsonify({'message': 'Cart updated successfully!'}), 200
    else:
        return jsonify({'message': 'Item not found in cart'}), 404

# פונקציה לחישוב מחיר כולל עם הנחה
@app.route('/cart/total', methods=['GET'])
def calculate_discounted_total():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    cart_items = Cart.query.filter_by(user_id=user_id).all()

    category_items = {}
    for cart_item in cart_items:
        category = cart_item.item_ref.category_id
        if category not in category_items:
            category_items[category] = []
        category_items[category].append(cart_item)

    total_price = 0

    for items in category_items.values():
        sorted_items = sorted(items, key=lambda x: x.item_ref.price, reverse=True)
        for i in range(len(sorted_items)):
            if i % 2 == 1:
                total_price += sorted_items[i].item_ref.price * 0.5 * sorted_items[i].quantity
            else:
                total_price += sorted_items[i].item_ref.price * sorted_items[i].quantity

    return jsonify({'total_price': total_price}), 200

# פונקציה לרכישת פריטים בעגלה
@app.route('/cart/buy', methods=['POST'])
def buy_items():
    data = request.json
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # חישוב מחיר כולל הנחה
    total_price = 0
    cart_items = Cart.query.filter_by(user_id=user_id).all()

    # ארגון לפי קטגוריות
    category_items = {}
    for cart_item in cart_items:
        category = cart_item.item_ref.category_id
        if category not in category_items:
            category_items[category] = []
        category_items[category].append(cart_item)

    # יישום ההנחה
    for items in category_items.values():
        sorted_items = sorted(items, key=lambda x: x.item_ref.price, reverse=True)
        for i in range(len(sorted_items)):
            if i % 2 == 1:
                total_price += sorted_items[i].item_ref.price * 0.5 * sorted_items[i].quantity
            else:
                total_price += sorted_items[i].item_ref.price * sorted_items[i].quantity

    if user.money < total_price:
        return jsonify({'success': False, 'message': 'Not enough money'}), 400

    # עדכון הכמות במלאי לאחר רכישה
    for cart_item in cart_items:
        db_item = cart_item.item_ref
        if db_item.quantity < cart_item.quantity:
            return jsonify({'success': False, 'message': f'Not enough stock for {db_item.name}'}), 400

        db_item.quantity -= cart_item.quantity
        if db_item.quantity <= 0:
            db_item.in_stock = False

    # הפחתת הסכום מחשבון המשתמש
    user.money -= total_price
    db.session.commit()

    return jsonify({'success': True, 'message': 'Purchase successful', 'total_price': total_price}), 200

# הרצת האפליקציה
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
