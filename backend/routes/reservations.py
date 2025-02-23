from flask import Blueprint, request, jsonify
from db import cursor, db
from utils import role_required

reservations_bp = Blueprint("reservations", __name__)

@reservations_bp.route("/", methods=["POST"])
@role_required(["customer"])
def make_reservation():
    data = request.get_json()
    sql = "INSERT INTO reservations (customer_id, table_id, reservation_time, status) VALUES (%s, %s, %s, %s)"
    cursor.execute(sql, (data["customer_id"], data["table_id"], data["reservation_time"], "Pending"))
    db.commit()
    return jsonify({"message": "Reservation made"}), 201

@reservations_bp.route("/<int:reservation_id>/status", methods=["PUT"])
@role_required(["manager"])
def update_reservation_status(reservation_id):
    data = request.get_json()
    sql = "UPDATE reservations SET status=%s WHERE reservation_id=%s"
    cursor.execute(sql, (data["status"], reservation_id))
    db.commit()
    return jsonify({"message": "Reservation status updated"}), 200
