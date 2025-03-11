from flask import Blueprint, request, jsonify
from db import cursor, db
from utils import role_required

payments_bp = Blueprint("payments", __name__)

@payments_bp.route("/", methods=["POST"])
@role_required(["customer"])
def make_payment():
    data = request.get_json()
    sql = "INSERT INTO payments (order_id, amount_paid, payment_method, payment_date) VALUES (%s, %s, %s, NOW())"
    cursor.execute(sql, (data["order_id"], data["amount_paid"], data["payment_method"]))
    db.commit()
    return jsonify({"message": "Payment successful"}), 201

@payments_bp.route("/", methods=["GET"])
@role_required(["manager"])
def get_all_payments():
    customer_id = request.args.get("customer_id")  # Get customer_id from query params
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


@payments_bp.route("/history", methods=["GET"])
@role_required(["customer"])
def get_payment_history():
    customer_id = request.user["id"]  # Extracted from JWT token
    
    sql = """
        SELECT p.payment_id, p.order_id, p.amount_paid, p.payment_method, p.payment_date
        FROM payments p
        JOIN orders o ON p.order_id = o.order_id
        WHERE o.customer_id = %s
        ORDER BY p.payment_date DESC
    """
    cursor.execute(sql, (customer_id,))
    payments = cursor.fetchall()
    
    return jsonify(payments), 200