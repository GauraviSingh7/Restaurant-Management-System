from flask import Blueprint, request, jsonify
from db import cursor, db
from utils import role_required
from flask_jwt_extended import jwt_required,get_jwt_identity
import json

inventory_bp = Blueprint("inventory", __name__)

@inventory_bp.route("/", methods=["GET"])
@role_required(["manager"])
def get_all_inventory():
    try:
        cursor.execute("SELECT * FROM inventory")
        inventory = cursor.fetchall()
        inventory_list = [{
            "inventory_item_id": item[0],
            "name": item[1],
            "quantity_available": item[2],
        } for item in inventory]
        return jsonify(inventory_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@inventory_bp.route("/", methods=["POST"])
@role_required(["manager"])
def add_inventory():
    data = request.get_json()
    try:
        sql = """
            INSERT INTO inventory (name, quantity_available)
            VALUES (%s, %s)
        """
        cursor.execute(sql, (data["name"], data["quantity_available"]))
        db.commit()
        return jsonify({"message": "Inventory added"}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

@inventory_bp.route("/<int:item_id>", methods=["PUT"])
@role_required(["manager"])
def update_inventory(item_id):
    data = request.get_json()
    try:
        sql = """
            UPDATE inventory
            SET name = %s, quantity_available = %s
            WHERE inventory_item_id = %s
        """
        cursor.execute(sql, (data["name"], data["quantity_available"], item_id))
        db.commit()
        return jsonify({"message": "Inventory updated"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500