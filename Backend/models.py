from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(50), nullable=False)


# from flask_sqlalchemy import SQLAlchemy

# db = SQLAlchemy()

# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(50), unique=True, nullable=False)
#     email = db.Column(db.String(50), unique=True, nullable=False)
#     password_hash = db.Column(db.String(50), nullable=False)

#     chat_history = db.relationship('ChatHistory', backref='user', lazy=True, cascade='all, delete-orphan')

# class ChatHistory(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     user_input = db.Column(db.Text, nullable=False)
#     bot_response = db.Column(db.Text, nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
