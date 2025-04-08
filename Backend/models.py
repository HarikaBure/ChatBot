from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(50), primary_key=True)
    password_hash = db.Column(db.String(50), nullable=False)
