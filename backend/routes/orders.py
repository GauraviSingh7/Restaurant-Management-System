from flask import Blueprint, request, jsonify
from db import cursor, db
from utils import role_required

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/", methods=["POST"])
@role_required(["customer"])
def place_order():
    data = request.get_json()
    sql = "INSERT INTO orders (customer_id, table_id, status, total_amount, created_at) VALUES (%s, %s, %s, %s, NOW())"
    cursor.execute(sql, (data["customer_id"], data["table_id"], "Pending", data["total_amount"]))
    db.commit()
    return jsonify({"message": "Order placed"}), 201

@orders_bp.route("/<int:order_id>/status", methods=["PUT"])
@role_required(["manager"])
def update_order_status(order_id):
    data = request.get_json()
    sql = "UPDATE orders SET status=%s WHERE order_id=%s"
    cursor.execute(sql, (data["status"], order_id))
    db.commit()
    return jsonify({"message": "Order status updated"}), 200
