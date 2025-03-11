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

        # Extract user ID from JWT token
        current_user = get_jwt_identity()
        user_data = json.loads(current_user)
        customer_email = user_data["email"]

        # Get customer_id
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (customer_email,))
        customer = cursor.fetchone()
        if not customer:
            return jsonify({"error": "Customer not found"}), 404
        customer_id = customer[0]

        # Check if the user already has a reservation at the same time
        cursor.execute(
            "SELECT * FROM reservations WHERE customer_id = %s AND reservation_time = %s",
            (customer_id, reservation_time)
        )
        existing_reservation = cursor.fetchone()
        if existing_reservation:
            return jsonify({"error": "You already have a reservation at this time"}), 400

        # Find the best available table (smallest suitable capacity)
        cursor.execute(
            """
            SELECT table_id FROM tables 
            WHERE capacity >= %s AND status = 'available' 
            ORDER BY ASC LIMIT 1
            """,
            (capacity,)
        )
        table = cursor.fetchone()

        if not table:
            return jsonify({"error": "No available tables matching your capacity"}), 400

        table_id = table[0]

        # Mark table as reserved
        cursor.execute(
            "UPDATE tables SET status = 'reserved' WHERE table_id = %s",
            (table_id,)
        )
        db.commit()

        # Insert reservation
        cursor.execute(
            """
            INSERT INTO reservations (customer_id, table_id, reservation_time, capacity, status)
            VALUES (%s, %s, %s, %s, 'confirmed')
            """,
            (customer_id, table_id, reservation_time, capacity)
        )
        db.commit()

        return jsonify({"message": "Reservation successful", "table_id": table_id}), 201

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500


@reservations_bp.route("/cancel/<int:reservation_id>", methods=["DELETE"])
@jwt_required()
@role_required(["customer"])
def cancel_reservation(reservation_id):
    try:
        # Get the reservation details
        cursor.execute("SELECT table_id FROM reservations WHERE reservation_id = %s", (reservation_id,))
        reservation = cursor.fetchone()

        if not reservation:
            return jsonify({"error": "Reservation not found"}), 404

        table_id = reservation[0]

        # Delete the reservation
        cursor.execute("DELETE FROM reservations WHERE reservation_id = %s", (reservation_id,))
        db.commit()

        # Update table status to available
        cursor.execute("UPDATE tables SET status = 'available' WHERE table_id = %s", (table_id,))
        db.commit()

        return jsonify({"message": "Reservation deleted and table is now available"}), 200

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

@reservations_bp.route("/", methods=["GET"])
@jwt_required()
@role_required(["customer"])
def get_user_reservations():
    try:
        print("Fetching user reservations...")  # Debug print

        # Extract user ID from JWT token
        current_user = get_jwt_identity()
        user_data = json.loads(current_user)
        customer_email = user_data["email"]

        # Get customer_id
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (customer_email,))
        customer = cursor.fetchone()
        if not customer:
            print("Customer not found!")  # Debug print
            return jsonify({"error": "Customer not found"}), 404
        customer_id = customer[0]

        # Fetch reservations along with table number
        cursor.execute(
            """
            SELECT r.reservation_id, r.table_id, t.capacity, r.reservation_time, r.status
            FROM reservations r
            JOIN tables t ON r.table_id = t.table_id
            WHERE r.customer_id = %s
            ORDER BY r.reservation_time DESC
            """,
            (customer_id,)
        )
        reservations = cursor.fetchall()

        # Convert result tuples to JSON objects
        reservations_list = []
        for res in reservations:
            reservations_list.append({
                "reservation_id": res[0],
                "table_id": res[1],
                "capacity": res[2],
                "reservation_time": res[3],
                "status": res[4]
            })

        print("Reservations Fetched:", reservations_list)  # Debug print

        return jsonify(reservations_list), 200

    except Exception as e:
        print("Error:", str(e))  # Debug print
        return jsonify({"error": str(e)}), 500
