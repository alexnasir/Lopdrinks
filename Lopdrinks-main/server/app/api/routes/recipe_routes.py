"""Recipe routes — URL binding only. No logic."""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.controllers.recipe_controller import (
    get_recipes,
    get_recipe_by_id,
    get_recipes_by_category,
    create_recipe,
    update_recipe,
    delete_recipe,
)
from app.middleware.auth import require_role
from app.constants.roles import Role

recipe_bp = Blueprint("recipes", __name__)

recipe_bp.get("/recipes/")(get_recipes)
recipe_bp.get("/recipes/<int:recipe_id>")(get_recipe_by_id)
recipe_bp.get("/recipes/category/<int:category_id>")(get_recipes_by_category)

recipe_bp.post("/recipes/")(
    jwt_required()(require_role(Role.ADMIN)(create_recipe))
)

recipe_bp.put("/recipes/<int:recipe_id>")(
    jwt_required()(require_role(Role.ADMIN)(update_recipe))
)

recipe_bp.delete("/recipes/<int:recipe_id>")(
    jwt_required()(require_role(Role.ADMIN)(delete_recipe))
)
