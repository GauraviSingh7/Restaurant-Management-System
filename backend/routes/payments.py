from flask import Blueprint, request, jsonify
from db import cursor, db
from utils import role_required
from flask_jwt_extended import jwt_required,get_jwt_identity
import json

payments_bp = Blueprint("payments", __name__)

@payments_bp.route("/", methods=["POST"])
@jwt_required()
@role_required(["customer"])
def make_payment():
    try:
        data = request.get_json()
        current_user = get_jwt_identity()
        user_data = json.loads(current_user)
        customer_email = user_data["email"]

        # Fetch customer_id from the users table based on email
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (customer_email,))
        customer = cursor.fetchone()

        if not customer:
            return jsonify({"error": "Customer not found"}), 404
        # Insert payment record
        sql = """
            INSERT INTO payments (order_id, amount_paid, payment_method, payment_date)
            VALUES (%s, %s, %s, NOW())
        """
        cursor.execute(sql, (data["order_id"], data["amount_paid"], data["payment_method"]))
        db.commit()

        return jsonify({"message": "Payment successful"}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"errorrrrrrrrrrr": str(e)}), 500

# Route for managers to view all payments or by specific customer
@payments_bp.route("/", methods=["GET"])
@role_required(["manager"])
def get_all_payments():
    customer_id = request.args.get("customer_id")  # Get customer_id from query params if provided
    if customer_id:
        sql = """
            SELECT p.payment_id, p.order_id, p.amount_paid, p.payment_method, p.payment_date, o.customer_id
            FROM payments p
            JOIN orders o ON p.order_id = o.order_id
            WHERE o.customer_id = %s
            ORDER BY p.payment_date DESC
        """
        cursor.execute(sql, (customer_id,))
    else:
        sql = """
            SELECT p.payment_id, p.order_id, p.amount_paid, p.payment_method, p.payment_date, o.customer_id
            FROM payments p
            JOIN orders o ON p.order_id = o.order_id
            ORDER BY p.payment_date DESC
        """
        cursor.execute(sql)

    return jsonify(cursor.fetchall()), 200

# Route to get a customer's payment history (for customers only)
@payments_bp.route("/history", methods=["GET"])
@jwt_required()
@role_required(["customer"])
def get_payment_history():
    try:
        # Extract customer details from JWT token
        current_user = get_jwt_identity()
        user_data = json.loads(current_user)
        customer_email = user_data.get("email")

        if not customer_email:
            return jsonify({"error": "Invalid token, email not found"}), 400

        # Fetch customer_id from the users table based on email
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (customer_email,))
        customer = cursor.fetchone()

        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        customer_id = customer[0]

        # Retrieve the customer's payment history
        sql = """
            SELECT p.payment_id, p.order_id, p.amount_paid, p.payment_method, p.payment_date
            FROM payments p
            JOIN orders o ON p.order_id = o.order_id
            WHERE o.customer_id = %s
            ORDER BY p.payment_date DESC
        """
        cursor.execute(sql, (customer_id,))
        payments = cursor.fetchall()

        if not payments:
            return jsonify({"message": "No payment history found"}), 404

        # Convert the array of arrays into an array of dictionaries (objects)
        payments_list = [
            {
                "payment_id": payment[0],
                "order_id": payment[1],
                "amount_paid": float(payment[2]),
                "payment_method": payment[3],
                "payment_date": payment[4]
            }
            for payment in payments
        ]

        return jsonify(payments_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
