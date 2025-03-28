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
            ORDER BY capacity ASC LIMIT 1
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
        new_table_id = data.get("table_id")

        if not new_status:
            return jsonify({"error": "Missing status field"}), 400

        # If a new table is specified, update the table
        if new_table_id:
            cursor.execute(
                "UPDATE reservations SET status=%s, table_id=%s WHERE reservation_id=%s", 
                (new_status, new_table_id, reservation_id)
            )
        else:
            cursor.execute(
                "UPDATE reservations SET status=%s WHERE reservation_id=%s", 
                (new_status, reservation_id)
            )
        db.commit()

        return jsonify({"message": "Reservation status updated"}), 200

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

@reservations_bp.route("/", methods=["GET"])
@jwt_required()
def get_reservations():
    try:
        # Extract user role and identity from JWT token
        current_user = get_jwt_identity()
        user_data = json.loads(current_user)
        user_role = user_data["role"]
        user_email = user_data["email"]

        # Get user_id
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (user_email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        user_id = user[0]

        # **Update past reservations to "completed"**
        cursor.execute("""
            UPDATE reservations 
            SET status = 'completed' 
            WHERE status = 'confirmed' AND reservation_time < NOW()
        """)
        db.commit()

        # Fetch reservations based on role
        if user_role == "manager":
            # For managers, fetch all reservations with user details
            cursor.execute(
                """
                SELECT 
                    r.reservation_id, 
                    r.table_id, 
                    t.capacity, 
                    r.reservation_time, 
                    r.status,
                    u.email AS customer_email
                FROM 
                    reservations r
                JOIN 
                    users u ON r.customer_id = u.user_id
                JOIN 
                    tables t ON r.table_id = t.table_id
                ORDER BY 
                    r.reservation_time DESC
                """
            )
        else:
            # For customers, fetch their own reservations
            cursor.execute(
                """
                SELECT 
                    r.reservation_id, 
                    r.table_id, 
                    t.capacity, 
                    r.reservation_time, 
                    r.status
                FROM 
                    reservations r
                JOIN 
                    tables t ON r.table_id = t.table_id
                WHERE 
                    r.customer_id = %s
                ORDER BY 
                    r.reservation_time DESC
                """,
                (user_id,)
            )

        reservations = cursor.fetchall()

        # Convert result tuples to JSON objects
        reservations_list = []
        if user_role == "manager":
            for res in reservations:
                reservations_list.append({
                    "reservation_id": res[0],
                    "table_id": res[1],
                    "capacity": res[2],
                    "reservation_time": res[3],
                    "status": res[4],
                    "customer_email": res[5]
                })
        else:
            for res in reservations:
                reservations_list.append({
                    "reservation_id": res[0],
                    "table_id": res[1],
                    "capacity": res[2],
                    "reservation_time": res[3],
                    "status": res[4]
                })

        return jsonify(reservations_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
