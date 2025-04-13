from flask import Flask
from flask_cors import CORS
from flask_session import Session
from datetime import timedelta
from models import db
from routes import auth_blueprint

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable cookies to be sent with cross-origin requests

# PostgreSQL Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://root:0rHsPRUXFv1mFGqrGhe9tGhYTtFaVkp2@dpg-cvtll0p5pdvs73dt846g-a.oregon-postgres.render.com/aura_dnfj'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Flask-Session Configuration
app.config['SESSION_TYPE'] = 'sqlalchemy'
app.config['SESSION_SQLALCHEMY'] = db  # Tell Flask-Session to use our SQLAlchemy instance
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=60)
app.secret_key = 'raur'

# Initialize DB first
db.init_app(app)

# Initialize Session after DB
app.config['SESSION_SQLALCHEMY_TABLE'] = 'sessions'  # Optional: specify the table name
Session(app)

# Register blueprints
app.register_blueprint(auth_blueprint)

# Create tables and run app
if __name__ == '__main__':
    with app.app_context():
        db.drop_all()  # Temporarily add this to reset tables
        db.create_all()  # Create tables with new naming
    app.run(debug=True)