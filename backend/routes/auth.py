from flask import Blueprint, request, jsonify, session
from db import cursor, db
import bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity;
import json 


auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    allowed_roles = ["customer", "manager"]
    if data["role"] not in allowed_roles:
        return jsonify({"error": "Invalid Role"}), 400

    username = data["name"]
    email = data["email"]
    password = data["password"]
    role = data["role"]

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "User already exists"}), 409

        sql = "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (username, email, hashed_password, role))
        db.commit()
        return jsonify({"message": "User Registered"}), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    selected_role = data.get("role")

    cursor.execute("SELECT email, password, role FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404
    
    db_email, db_password, db_role = user

    if not bcrypt.checkpw(password.encode("utf-8"), db_password.encode("utf-8")):
        return jsonify({"error": "Invalid Password"}), 401

    if selected_role != db_role:
        return jsonify({"error": f"Invalid Role. You are registered as a {db_role}."}), 403

    session["user_role"] = db_role  # Store role in session

    access_token = create_access_token(identity=json.dumps({"email": db_email, "role": db_role}))

    return jsonify({
        "message": "Login Successful",
        "role": db_role,
        "access_token": access_token  # Send token in response
    }), 200


@auth_bp.route('/username', methods=['GET'])
@jwt_required()
def get_username():
    try:
        # Get user email from JWT
        current_user = get_jwt_identity()
        user_data = json.loads(current_user)
        email = user_data["email"]

        # Fetch the username from the database
        cursor.execute("SELECT username FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"username": user[0]}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
