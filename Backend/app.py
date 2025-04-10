from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db
from routes import auth_blueprint

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'your_secret_key'

db.init_app(app)
app.register_blueprint(auth_blueprint)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # This creates the tables based on the models
    app.run(debug=True)
