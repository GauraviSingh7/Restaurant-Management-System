from flask import Blueprint, request, jsonify
from db import cursor, db
from utils import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity
import json

orders_bp = Blueprint("orders", __name__)

# Place an order (customer only)
@orders_bp.route("/", methods=["POST"])
@jwt_required()
@role_required(["customer"])
def place_order():
    data = request.get_json()

    # Get current user from JWT
    current_user = get_jwt_identity()
    user_data = json.loads(current_user)
    customer_email = user_data["email"]

    # Get customer_id from the users table based on the email
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (customer_email,))
    customer = cursor.fetchone()
    
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    customer_id = customer[0]

    # Ensure total_amount and items are provided
    if not data.get("total_amount") or not data.get("items"):
        return jsonify({"error": "Total amount and items are required"}), 400

    try:
        # Step 1: Insert the order into the orders table
        sql_order = """
            INSERT INTO orders (customer_id, table_id, status, total_amount, created_at)
            VALUES (%s, %s, %s, %s, NOW())
        """
        cursor.execute(sql_order, (customer_id, data.get("table_id"), "Pending", data["total_amount"]))
        order_id = cursor.lastrowid  # Get the ID of the newly inserted order
        db.commit()

        # Step 2: Insert the order items into the order_items table
        for item in data["items"]:
            sql_order_item = """
                INSERT INTO order_items (order_id, menu_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql_order_item, (order_id, item["menu_id"], item["quantity"], item["price"]))
        db.commit()

        return jsonify({"message": "Order placed", "order_id": order_id}), 201
    except Exception as e:
        print("couldn't place order")
        db.rollback()
        return jsonify({"error": str(e)}), 500

@orders_bp.route("/", methods=["GET"])
@role_required(["manager"])
def get_orders():
    try:
        cursor.execute("SELECT * FROM orders order by created_at desc")
        orders = cursor.fetchall()
        # print("Fetched orders from DB:", orders)  # Add this to debug


        order_list = [{
            "order_id": order[0],
            "customer_id": order[1],
            "table_id": order[2],
            "status": order[3],
            "total_amount": order[4],
            "created_at": order[5]
        } for order in orders]

        return jsonify(order_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Update order status (manager only)
@orders_bp.route("/<int:order_id>/status", methods=["PUT"])
@role_required(["manager"])
def update_order_status(order_id):
    data = request.get_json()

    if not data.get("status"):
        return jsonify({"error": "Status is required"}), 400

    try:
        sql = "UPDATE orders SET status=%s WHERE order_id=%s"
        cursor.execute(sql, (data["status"], order_id))
        db.commit()
        return jsonify({"message": "Order status updated"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

@orders_bp.route("/order_history", methods=["GET"])
@jwt_required()
@role_required(["customer"])
def get_order_history():
    current_user = get_jwt_identity()
    user_data = json.loads(current_user)
    customer_email = user_data["email"]

    # Get customer_id from the users table based on the email
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (customer_email,))
    customer = cursor.fetchone()

    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    customer_id = customer[0]

    try:
        # Fetch order details along with ordered items
        sql = """
            SELECT 
                o.order_id, o.status, o.total_amount, o.created_at,
                oi.menu_id, m.name AS menu_item_name, oi.quantity, oi.price
            FROM orders o
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            LEFT JOIN menu m ON oi.menu_id = m.menu_id
            WHERE o.customer_id = %s
            ORDER BY o.created_at DESC;
        """
        cursor.execute(sql, (customer_id,))
        orders_data = cursor.fetchall()

        # Organizing orders into a structured format
        orders_dict = {}

        for row in orders_data:
            order_id = row[0]

            if order_id not in orders_dict:
                orders_dict[order_id] = {
                    "order_id": order_id,
                    "status": row[1],
                    "total_amount": row[2],
                    "created_at": row[3],
                    "items": []
                }

            if row[4]:  # Only add items if they exist (handle potential NULL cases)
                orders_dict[order_id]["items"].append({
                    "menu_id": row[4],
                    "name": row[5],
                    "quantity": row[6],
                    "price": row[7]
                })

        return jsonify(list(orders_dict.values())), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
