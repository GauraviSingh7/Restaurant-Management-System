from flask import request, jsonify
from functools import wraps
import jwt
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get secret key from environment
SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY is missing in the .env file!")

def role_required(allowed_roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            token = request.headers.get("Authorization")  # Get token from headers
            print(f"Received Authorization Header: {token}")  # Debugging

            if not token:
                return jsonify({"error": "Missing token"}), 403
            
            try:
                token = token.replace("Bearer ", "")  # Ensure correct format
                print(f"Extracted Token: {token}") 
                decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                print(f"Decoded Token: {decoded_token}") 

                user_data = json.loads(decoded_token["sub"]) if isinstance(decoded_token["sub"], str) else decoded_token["sub"]
                user_role = user_data.get("role")
                print(f"User Role: {user_role}, Allowed Roles: {allowed_roles}")

                if user_role not in allowed_roles:
                    return jsonify({"error": "Forbidden: You don't have permission."}), 403

                return func(*args, **kwargs)
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 403
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 403
        return wrapper
    return decorator
