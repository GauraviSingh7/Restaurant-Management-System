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
    cursor.execute("SELECT * FROM payments")
    return jsonify(cursor.fetchall()), 200
