from flask import Flask
from db import db
import json
from routes.auth import auth_bp
from routes.menu import menu_bp
from routes.orders import orders_bp
from routes.reservations import reservations_bp
from routes.tables import tables_bp
from routes.payments import payments_bp
from flask_cors import CORS
import os
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask import jsonify

load_dotenv()

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")  # Ensure this exists in .env
app.config["JWT_TOKEN_LOCATION"] = [os.getenv("JWT_TOKEN_LOCATION")]  # Usually "headers"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False  # Optional: Change based on needs

jwt = JWTManager(app) 

app.secret_key = os.environ.get("FLASK_SECRET_KEY", "fallback_secret_key")

cors = CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/get-role', methods=['GET'])
@jwt_required()
def get_role():
    current_user = get_jwt_identity()  # Decode JWT token
    print("Raw Decoded User:", current_user)  # Debugging
    
    try:
        user_data = json.loads(current_user)  # Convert string back to dictionary
        return jsonify({"role": user_data["role"]}), 200
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid token format!"}), 400

# Register Blueprints (Routes)
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(menu_bp, url_prefix="/menu")
app.register_blueprint(orders_bp, url_prefix="/orders")
app.register_blueprint(reservations_bp, url_prefix="/reservations")
app.register_blueprint(tables_bp, url_prefix="/tables")
app.register_blueprint(payments_bp, url_prefix="/payments")

if __name__ == "__main__":
    app.run(debug=True)
