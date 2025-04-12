# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy
# from flask_cors import CORS
# from models import db
# from routes import auth_blueprint
# from datetime import timedelta

# app = Flask(__name__)
# CORS(app, supports_credentials=True)

# # Configuration
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['SESSION_PERMANENT'] = True
# app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=60)
# app.secret_key = 'raur'

# db.init_app(app)
# app.register_blueprint(auth_blueprint)

# if __name__ == '__main__':
#     with app.app_context():
#         db.create_all()  # This creates the tables based on the models
#     app.run(debug=True)
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_session import Session
from models import db
from routes import auth_blueprint
from datetime import timedelta

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable cookies to be sent with cross-origin requests

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_TYPE'] = 'filesystem'  # Change to 'redis' or 'sqlalchemy' for production
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=60)
app.secret_key = 'raur'

# Initialize Session and DB
Session(app)  # Initialize Flask-Session to handle sessions
db.init_app(app)

app.register_blueprint(auth_blueprint)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables based on models
    app.run(debug=True)
