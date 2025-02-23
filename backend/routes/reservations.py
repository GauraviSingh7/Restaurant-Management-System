from flask import Blueprint, request, jsonify
from db import cursor, db
from utils import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity
import json

reservations_bp = Blueprint("reservations", __name__)

@reservations_bp.route("/", methods=["POST"])
@jwt_required()
@role_required(["customer"])
def make_reservation():
    try:
        data = request.get_json()
        capacity = data.get("capacity")
        reservation_time = data.get("reservation_time")

        if not all([capacity, reservation_time]):
            return jsonify({"error": "Missing required fields"}), 400

        # Extract email from JWT token
        current_user = get_jwt_identity()
        user_data = json.loads(current_user)
        customer_email = user_data["email"]

        # Fetch customer_id from users table using email
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (customer_email,))
        customer = cursor.fetchone()

        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        customer_id = customer[0]

        # Create a new table dynamically for the reservation
        cursor.execute(
            "INSERT INTO tables (capacity, status) VALUES (%s, 'reserved')",
            (capacity,)
        )
        db.commit()

        # Get the newly created table_id
        cursor.execute("SELECT LAST_INSERT_ID()")
        table_id = cursor.fetchone()[0]

        # Insert reservation into the reservations table
        cursor.execute(
            """
            INSERT INTO reservations (customer_id, table_id, reservation_time, capacity, status)
            VALUES (%s, %s, %s, %s, 'confirmed')
            """,
            (customer_id, table_id, reservation_time, capacity)
        )
        db.commit()

        return jsonify({"message": "Reservation made", "table_id": table_id}), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


@reservations_bp.route("/<int:reservation_id>/status", methods=["PUT"])
@jwt_required()
@role_required(["manager"])
def update_reservation_status(reservation_id):
    try:
        data = request.get_json()
        new_status = data.get("status")

        if not new_status:
            return jsonify({"error": "Missing status field"}), 400

        cursor.execute("UPDATE reservations SET status=%s WHERE reservation_id=%s", (new_status, reservation_id))
        db.commit()

        return jsonify({"message": "Reservation status updated"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
