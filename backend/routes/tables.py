from flask import Blueprint, request, jsonify
from db import cursor, db
from utils import role_required

tables_bp = Blueprint("tables", __name__)

# Get all tables (Accessible to all)
@tables_bp.route("/", methods=["GET"])
def get_tables():
    cursor.execute("SELECT * FROM tables")
    return jsonify(cursor.fetchall()), 200

# Add a new table (Manager only)
@tables_bp.route("/", methods=["POST"])
@role_required(["manager"])
def add_table():
    data = request.get_json()
    sql = "INSERT INTO tables (capacity, status) VALUES (%s, %s)"
    cursor.execute(sql, (data["capacity"], data["status"]))
    db.commit()
    return jsonify({"message": "Table added"}), 201

# Update table status (Managers only)
@tables_bp.route("/<int:table_id>", methods=["PUT"])
@role_required(["manager"])
def update_table_status(table_id):
    data = request.get_json()
    sql = "UPDATE tables SET status=%s WHERE table_id=%s"
    cursor.execute(sql, (data["status"], table_id))
    db.commit()
    return jsonify({"message": "Table status updated"}), 200
