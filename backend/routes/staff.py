from flask import Blueprint, request, jsonify
from db import cursor, db
from utils import role_required
from flask_jwt_extended import jwt_required,get_jwt_identity
import json

staff_bp = Blueprint("staff", __name__)

@staff_bp.route("/", methods=["GET"])
@role_required(["manager"])
def get_all_staff():
    try:
        cursor.execute("SELECT * FROM staff")
        staffs = cursor.fetchall()
        staff_list = [{
            "staff_id": staff[0],
            "name": staff[1],
            "role": staff[2],
            "salary": staff[3],
            "shift_timing": staff[4]
        } for staff in staffs]
        return jsonify(staff_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@staff_bp.route("/", methods=["POST"])
@role_required(["manager"])
def add_staff():
    data = request.get_json()
    try:
        sql = """
            INSERT INTO staff (name, role, salary, shift_timing)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (data["name"], data["role"], data["salary"], data["shift_timing"]))
        db.commit()
        return jsonify({"message": "Staff added"}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
        
        
