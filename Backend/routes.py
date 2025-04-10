from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
import jwt
import datetime
from functools import wraps

# Secret key for JWT
SECRET_KEY = 'potti_the_kuyya'

auth_blueprint = Blueprint('auth', __name__)
@auth_blueprint.route('/', methods=['GET'])
def root():
    return jsonify({'message': 'Sending the request'}), 200
@auth_blueprint.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 409

    hashed_password = generate_password_hash(password)

    new_user = User(username=username, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first()

    if user is None:
        # Email not found in the database
        return jsonify({'message': 'Please register first.'}), 404

    if not check_password_hash(user.password_hash, password):
        # Password is incorrect
        return jsonify({'message': 'Invalid credentials entered.'}), 401

    # If email and password are correct, generate the token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, SECRET_KEY, algorithm='HS256')
    
    return jsonify({'message': 'Login successful', 'token': token, 'user': user.username}), 200

# New decorator to protect routes
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

@auth_blueprint.route('/chat', methods=['GET'])
@token_required
def chat(current_user):
    return jsonify({'message': f'Welcome to the chat, {current_user.username}!'}), 200
