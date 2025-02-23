from flask import Blueprint, request, jsonify
from db import cursor, db
from utils import role_required

menu_bp = Blueprint("menu", __name__)

# Get all menu items (Accessible to all)
# Get menu items (filtered by category if provided)
@menu_bp.route("/", methods=["GET"])
def get_menu():
    try:
        category_id = request.args.get("category_id")  # Get category_id from URL params
        if category_id:
            cursor.execute("""
                SELECT m.menu_id, m.name, m.description, m.price, c.name AS category, m.availability 
                FROM menu m
                LEFT JOIN categories c ON m.category_id = c.category_id
                WHERE m.category_id = %s
            """, (category_id,))
        else:
            cursor.execute("""
                SELECT m.menu_id, m.name, m.description, m.price, c.name AS category, m.availability 
                FROM menu m
                LEFT JOIN categories c ON m.category_id = c.category_id
            """)

        menu_items = cursor.fetchall()

        # Convert list of tuples to list of dicts
        menu_list = [{
            "menu_id": item[0],
            "name": item[1],
            "description": item[2],
            "price": float(item[3]),  # Convert Decimal to float
            "category": item[4] if item[4] else "Uncategorized",
            "availability": bool(item[5])  # Convert to boolean
        } for item in menu_items]

        return jsonify(menu_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@menu_bp.route("/categories", methods=["GET"])
def get_categories():
    try:
        cursor.execute("SELECT category_id, name FROM categories ORDER BY category_id")
        categories = cursor.fetchall()
        
        category_list = [{"category_id": cat[0], "name": cat[1]} for cat in categories]
        return jsonify(category_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Add a new menu item (Manager only)
@menu_bp.route("/", methods=["POST"])
@role_required(["manager"])
def add_menu():
    try:
        data = request.get_json()
        sql = """
            INSERT INTO menu (name, description, price, category_id, availability)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (data["name"], data["description"], data["price"], data["category_id"], data["availability"]))
        db.commit()
        return jsonify({"message": "Menu item added"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Update a menu item (Manager only)
@menu_bp.route("/<int:menu_id>", methods=["PUT"])
@role_required(["manager"])
def update_menu(menu_id):
    try:
        data = request.get_json()
        cursor.execute("SELECT * FROM menu WHERE menu_id = %s", (menu_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Menu item not found"}), 404

        sql = """
            UPDATE menu 
            SET name=%s, description=%s, price=%s, category_id=%s, availability=%s
            WHERE menu_id=%s
        """
        cursor.execute(sql, (data["name"], data["description"], data["price"], data["category_id"], data["availability"], menu_id))
        db.commit()
        return jsonify({"message": "Menu item updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete a menu item (Manager only)
@menu_bp.route("/<int:menu_id>", methods=["DELETE"])
@role_required(["manager"])
def delete_menu(menu_id):
    try:
        cursor.execute("SELECT * FROM menu WHERE menu_id = %s", (menu_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Menu item not found"}), 404

        sql = "DELETE FROM menu WHERE menu_id=%s"
        cursor.execute(sql, (menu_id,))
        db.commit()
        return jsonify({"message": "Menu item deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
