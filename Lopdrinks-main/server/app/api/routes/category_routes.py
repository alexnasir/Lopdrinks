"""Category routes — URL binding only. No logic."""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.controllers.category_controller import (
    get_categories,
    get_category,
    create_category,
    update_category,
    delete_category,
)
from app.middleware.auth import require_role
from app.constants.roles import Role

category_bp = Blueprint("categories", __name__)

# Public — anyone can browse categories
category_bp.get("/categories/")(get_categories)
category_bp.get("/categories/<int:category_id>")(get_category)

# Admin-only — mutating operations
category_bp.post("/categories/")(
    jwt_required()(require_role(Role.ADMIN)(create_category))
)

category_bp.put("/categories/<int:category_id>")(
    jwt_required()(require_role(Role.ADMIN)(update_category))
)

category_bp.delete("/categories/<int:category_id>")(
    jwt_required()(require_role(Role.ADMIN)(delete_category))
)
