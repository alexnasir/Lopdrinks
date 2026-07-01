"""Ingredient routes — URL binding only. No logic."""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.controllers.ingredient_controller import (
    get_ingredients,
    create_ingredient,
)
from app.middleware.auth import require_role
from app.constants.roles import Role

ingredient_bp = Blueprint("ingredients", __name__)

ingredient_bp.get("/ingredients/")(get_ingredients)

ingredient_bp.post("/ingredients/")(
    jwt_required()(require_role(Role.ADMIN)(create_ingredient))
)
