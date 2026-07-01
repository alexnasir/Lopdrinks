"""BrewMethod routes — URL binding only. No logic."""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.controllers.brew_method_controller import (
    get_brew_methods,
    create_brew_method,
)
from app.middleware.auth import require_role
from app.constants.roles import Role

brew_method_bp = Blueprint("brew_methods", __name__)

brew_method_bp.get("/brew_methods/")(get_brew_methods)

brew_method_bp.post("/brew_methods/")(
    jwt_required()(require_role(Role.ADMIN)(create_brew_method))
)
