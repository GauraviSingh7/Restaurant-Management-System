from flask import request, jsonify, session
from functools import wraps

def role_required(allowed_roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if "user_role" not in session or session["user_role"] not in allowed_roles:
                return jsonify({"error": "Forbidden. You don't have permission."}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator
