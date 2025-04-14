from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, ChatHistory, ChatMessage
import jwt
import datetime
from functools import wraps
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from sentence_transformers import SentenceTransformer, util
from collections import deque
import numpy as np
import pandas as pd

# Secret key for JWT
SECRET_KEY = 'raur'

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

intent_model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
embedding_model = SentenceTransformer('all-mpnet-base-v2')
emotion_model = SentenceTransformer('SamLowe/roberta-base-go_emotions')
EMOTION_LABELS = [
    'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring',
    'confusion', 'curiosity', 'desire', 'disappointment', 'disapproval',
    'disgust', 'embarrassment', 'excitement', 'fear', 'gratitude', 'grief',
    'joy', 'love', 'nervousness', 'neutral', 'optimism', 'pride',
    'realization', 'relief', 'remorse', 'sadness', 'surprise'
]
mood_intent_phrases = [
    "what's my mood", "how am I feeling", "can you detect my emotion",
    "tell me my emotion", "what do you think my mood is", "how do I feel",
    "can you tell my mood", "analyze my emotions", "what emotion am I showing",
    "read my feelings", "guess my current mood", "how would you describe my state",
    "what's my emotional state", "detect my vibe"
]
movie_intent_phrases = [
    "want movie recommendations", "I would like to watch movies", "can you recommend a movie",
    "suggest a movie for me", "what should I watch", "recommend a movie", "give me movie suggestions",
    "looking for a movie to watch", "any good movie suggestions", "help me pick a movie", "movie suggestions please",'give me movie recommendations',
    "I need a movie to watch", "what's a good movie to watch", "can you suggest a film",
    "what's a good film to watch", "I want to watch a movie", "movie ideas", "movie time",
    "I need a film to watch", "what movie should I see", "movie recommendations please",
    "what's a good movie", "I want to see a film", "can you suggest a movie for me",
    "what's a good film", "I want to watch a film", "movie suggestions for me",
    "I need a movie recommendation", "what should I see", "movie recommendations for me"
]
emotion_genre_map = {
    'happy': ['comedy', 'romance', 'family'],
    'sad': ['drama', 'family', 'biography'],
    'angry': ['action', 'thriller', 'crime'],
    'neutral': ['sci-fi', 'comedy', 'romance'],
    'exhausted': ['family', 'comedy', 'drama', 'romance'],
    'motivation':['motivation','patriotic','drama','sci-fi']
}

# Pre-compute embeddings (768-dimensional vectors)
mood_embeddings = intent_model.encode(mood_intent_phrases, convert_to_tensor=True)

# Pre-compute embeddings for movie-related queries
movie_embeddings = intent_model.encode(movie_intent_phrases, convert_to_tensor=True)

def is_movie_query(prompt: str, threshold: float = 0.72) -> bool:
    query_embedding = intent_model.encode(prompt, convert_to_tensor=True)
    similarities = util.cos_sim(query_embedding, movie_embeddings)
    
    top_values, top_indices = similarities[0].topk(2)
    top_score = top_values[0].item()
    second_score = top_values[1].item()
    
    return top_score > threshold


def is_mood_query(prompt: str, threshold: float = 0.72) -> bool:
    query_embedding = intent_model.encode(prompt, convert_to_tensor=True)
    similarities = util.cos_sim(query_embedding, mood_embeddings)
    
    top_values, top_indices = similarities[0].topk(2)
    top_score = top_values[0].item()
    second_score = top_values[1].item()
    
    return top_score > threshold
def analyze_emotion(texts):
    # Get embeddings for all texts
    embeddings = emotion_model.encode(texts, convert_to_tensor=True)

    # Average all embeddings (torch tensor)
    avg_embedding = embeddings.mean(dim=0)

    # Get emotion label embeddings
    emotion_embeddings = emotion_model.encode(EMOTION_LABELS, convert_to_tensor=True)

    # Compare using cosine similarity (unsqueeze to add batch dim)
    similarities = util.cos_sim(avg_embedding.unsqueeze(0), emotion_embeddings)
    print("similarities[0] shape:", similarities[0].shape)

    # Get top 3 emotions
    top_values, top_indices = similarities[0].flatten().topk(3)

    return {
        'dominant_emotion': EMOTION_LABELS[top_indices[0].item()],
        'confidence': top_values[0].item(),
        'secondary_emotions': [
            (EMOTION_LABELS[top_indices[i].item()], top_values[i].item())
            for i in range(1, 3)
        ]
    }

def detect_user_mood(prompt_list):
    """Full pipeline for mood detection"""
    analysis = analyze_emotion(prompt_list)

    # Simplified mood map for chatbot usage
    mood_map = {
        'anger': 'angry',
        'joy': 'happy',
        'sadness': 'sad',
        'fear': 'anxious',
        'surprise': 'excited',
        'neutral': 'neutral',
        'optimism': 'happy',
        'admiration': 'happy',
        'amusement': 'happy',
        'disappointment': 'sad',
        'disapproval': 'angry',
        'curiousity': 'neutral'
    }

    dominant = analysis['dominant_emotion']
    mood = mood_map.get(dominant, dominant)  # Fallback to raw label if not mapped

    return mood


#Emotion mapping
def map_emotion(genres):
    for emotion, genre_list in emotion_genre_map.items():
        if any(genre in genre_list for genre in genres):
            return emotion
    return 'neutral' 
# Load movie dataset
df = pd.read_excel('Movie_DataSet.xlsx')
df['Genre'] = df['Genre'].fillna('').apply(lambda x: [g.lower().strip() for g in str(x).split() if g])
df['Emotion'] = df['Genre'].apply(map_emotion)


def recommend_movies(emotion, top_n=5):
    relevant_movies = df[df['Emotion'] == emotion]
    return relevant_movies[['Title', 'Genre']].sample(n=min(top_n, len(relevant_movies)))


def detect_emotion(text):
    detected_emotion = analyze_emotion(text)

    emotion_mapping = {
        'admiration':'happy', 'amusement':'happy', 'anger':'angry', 'annoyance':'angry', 'approval':'neutral', 'caring':'neutral',
    'confusion':'motivation', 'curiosity':'neutral', 'desire':'neutral', 'disappointment':'exhausted', 'disapproval':'angry',
    'disgust':'angry', 'embarrassment':'sad', 'excitement':'happy', 'fear':'exhausted', 'gratitude':'happy', 'grief':'sad',
    'joy':'happy', 'love':'happy', 'nervousness':'fear', 'neutral':'neutral', 'optimism':'happy', 'pride':'happy',
    'realization':'neutral', 'relief':'neutral', 'remorse':'sad', 'sadness':'sad', 'surprise' :'neutral'       
    }
    dominant = detected_emotion['dominant_emotion']
    movies_recommended=recommend_movies(emotion_mapping.get(dominant, 'neutral'))
    return movies_recommended

def generate_response(messages):
    # Format all messages for the model
    prompt = ""
    for message in messages:
        if message['role'] == 'user':
            prompt += f"<|im_start|>user\n{message['content']}<|im_end|>\n"
        else:
            prompt += f"<|im_start|>assistant\n{message['content']}<|im_end|>\n"
    
    # Add the final assistant prefix for the response
    prompt += "<|im_start|>assistant\n"
    
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

# Get all chat histories for a user
@auth_blueprint.route('/chat-histories', methods=['GET'])
@token_required
def get_chat_histories(current_user):
    chat_histories = ChatHistory.query.filter_by(user_id=current_user.id).order_by(ChatHistory.updated_at.desc()).all()
    
    histories = []
    for history in chat_histories:
        histories.append({
            'id': history.id,
            'title': history.title,
            'created_at': history.created_at.isoformat(),
            'updated_at': history.updated_at.isoformat()
        })
    
    return jsonify({'chat_histories': histories}), 200

# Create a new chat history
@auth_blueprint.route('/chat-histories', methods=['POST'])
@token_required
def create_chat_history(current_user):
    data = request.get_json()
    title = data.get('title', f"Chat {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M')}")
    
    new_chat = ChatHistory(user_id=current_user.id, title=title)
    db.session.add(new_chat)
    db.session.commit()
    
    return jsonify({
        'message': 'Chat history created', 
        'chat_history': {
            'id': new_chat.id,
            'title': new_chat.title,
            'created_at': new_chat.created_at.isoformat(),
            'updated_at': new_chat.updated_at.isoformat()
        }
    }), 201

# Get a specific chat history with messages
@auth_blueprint.route('/chat-histories/<int:chat_id>', methods=['GET'])
@token_required
def get_chat_history(current_user, chat_id):
    chat_history = ChatHistory.query.filter_by(id=chat_id, user_id=current_user.id).first()
    
    if not chat_history:
        return jsonify({'message': 'Chat history not found'}), 404
    
    messages = []
    for message in ChatMessage.query.filter_by(chat_history_id=chat_id).order_by(ChatMessage.timestamp).all():
        messages.append({
            'id': message.id,
            'role': message.role,
            'content': message.content,
            'timestamp': message.timestamp.isoformat()
        })
    
    return jsonify({
        'chat_history': {
            'id': chat_history.id,
            'title': chat_history.title,
            'created_at': chat_history.created_at.isoformat(),
            'updated_at': chat_history.updated_at.isoformat(),
            'messages': messages
        }
    }), 200

# Update chat history title
@auth_blueprint.route('/chat-histories/<int:chat_id>', methods=['PUT'])
@token_required
def update_chat_history(current_user, chat_id):
    chat_history = ChatHistory.query.filter_by(id=chat_id, user_id=current_user.id).first()
    
    if not chat_history:
        return jsonify({'message': 'Chat history not found'}), 404
    
    data = request.get_json()
    if 'title' in data:
        chat_history.title = data['title']
        db.session.commit()
    
    return jsonify({
        'message': 'Chat history updated',
        'chat_history': {
            'id': chat_history.id,
            'title': chat_history.title,
            'updated_at': chat_history.updated_at.isoformat()
        }
    }), 200

# Delete a chat history
@auth_blueprint.route('/chat-histories/<int:chat_id>', methods=['DELETE'])
@token_required
def delete_chat_history(current_user, chat_id):
    chat_history = ChatHistory.query.filter_by(id=chat_id, user_id=current_user.id).first()
    
    if not chat_history:
        return jsonify({'message': 'Chat history not found'}), 404
    
    db.session.delete(chat_history)
    db.session.commit()
    
    return jsonify({'message': 'Chat history deleted'}), 200

# Send a chat message and get a response
@auth_blueprint.route('/chat', methods=['POST'])
@token_required
def chat(current_user):
    data = request.get_json()
    user_message = data.get('message', '')
    chat_id = data.get('chat_id')
    
    if not user_message:
        return jsonify({"error": "Message is required"}), 400
    
    # If no chat_id is provided, create a new chat history
    if not chat_id:
        # Create a title from the first message (limit to 50 chars)
        title = user_message[:50] + ('...' if len(user_message) > 50 else '')
        new_chat = ChatHistory(user_id=current_user.id, title=title)
        db.session.add(new_chat)
        db.session.flush()  # Get the ID without committing
        chat_id = new_chat.id
    else:
        # Verify chat history exists and belongs to user
        chat_history = ChatHistory.query.filter_by(id=chat_id, user_id=current_user.id).first()
        if not chat_history:
            return jsonify({'message': 'Chat history not found'}), 404
    
    # Save user message
    user_chat_message = ChatMessage(
        chat_history_id=chat_id,
        role='user',
        content=user_message
    )
    db.session.add(user_chat_message)
    if is_mood_query(user_message):
           chats = ChatMessage.query.filter_by(chat_history_id=chat_id).order_by(ChatMessage.timestamp.desc()).limit(8).all()
           messages = [chat.content for chat in chats if chat.role == 'user']
           emotion = detect_user_mood(messages)
           ai_response=f'You seem to be feeling {emotion}'
           
    elif is_movie_query(user_message):
        chats = ChatMessage.query.filter_by(chat_history_id=chat_id).order_by(ChatMessage.timestamp.desc()).limit(8).all()
        messages = [chat.content for chat in chats if chat.role == 'user']
        recommended_movies=detect_emotion(messages)
        movie_list = recommended_movies[['Title', 'Genre']].to_dict(orient='records')
        formatted_movies = '\n'.join([f"{i+1}. {movie['Title']} ({', '.join(movie['Genre'])})" for i, movie in enumerate(movie_list)])
        ai_response = f"Based on your mood, I recommend the following movies:\n\n{formatted_movies}"

    else:
        # Get all previous messages in this chat for context
        messages = []
        for msg in ChatMessage.query.filter_by(chat_history_id=chat_id).order_by(ChatMessage.timestamp).all():
            messages.append({
                'role': msg.role,
                'content': msg.content
            })
        
        # Add the current user message
        messages.append({
            'role': 'user',
            'content': user_message
        })
        
        # Generate response based on full conversation history
        ai_response = generate_response(messages)
        
    # Save assistant response
    assistant_chat_message = ChatMessage(
        chat_history_id=chat_id,
        role='assistant',
        content=ai_response
    )
    db.session.add(assistant_chat_message)
    
    # Update the chat history's updated_at timestamp
    chat_history = ChatHistory.query.get(chat_id)
    chat_history.updated_at = datetime.datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        "response": ai_response,
        "chat_id": chat_id
    })