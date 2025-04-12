from flask import Blueprint, request, jsonify,session
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
import jwt
import datetime
from functools import wraps
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig


# Secret key for JWT
SECRET_KEY = 'raur'

# Secret key for JWT
# SECRET_KEY = 'your_secret_key_here'  # Replace with a secure key

auth_blueprint = Blueprint('auth', __name__) 

# Load model and tokenizer once on app start
model_name = "teknium/OpenHermes-2.5-Mistral-7B"
tokenizer = AutoTokenizer.from_pretrained(model_name)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto",
)


def generate_response(user_input):
    prompt = f"<|im_start|>user\n{user_input}<|im_end|>\n<|im_start|>assistant\n"
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

    with torch.inference_mode():
        outputs = model.generate(
            **inputs,
            max_new_tokens=500,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            eos_token_id=tokenizer.eos_token_id,
        )

    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response.split("assistant\n")[-1].strip()



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




@auth_blueprint.route('/chat', methods=['POST'])
@token_required
def chat(current_user):
    data = request.get_json()
    user_message = data.get('message', '')
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    response = generate_response(user_message)
    return jsonify({"response": response})
