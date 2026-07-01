"""Recipe controller — HTTP in, HTTP out. No business logic."""

import logging
from flask import request
from flask_jwt_extended import get_jwt_identity

from app.api.dependencies import get_recipe_service
from app.utils.response import success_response

logger = logging.getLogger(__name__)


def get_recipes():
    """GET /recipes/"""
    service = get_recipe_service()
    data = service.get_all()
    return success_response("Recipes fetched.", data=data)


def get_recipe_by_id(recipe_id: int):
    """GET /recipes/<recipe_id>"""
    service = get_recipe_service()
    data = service.get_by_id(recipe_id=recipe_id)
    return success_response("Recipe fetched.", data=data)


def get_recipes_by_category(category_id: int):
    """GET /recipes/category/<category_id>"""
    service = get_recipe_service()
    data = service.get_by_category(category_id=category_id)
    return success_response("Recipes fetched.", data=data)


def create_recipe():
    """POST /recipes/"""
    identity = get_jwt_identity()
    body = request.get_json(silent=True) or {}
    service = get_recipe_service()
    result = service.create(data=body, created_by=identity["id"])
    return success_response(result["message"], status_code=201)


def update_recipe(recipe_id: int):
    """PUT /recipes/<recipe_id>"""
    body = request.get_json(silent=True) or {}
    service = get_recipe_service()
    result = service.update(recipe_id=recipe_id, data=body)
    return success_response(result["message"])


def delete_recipe(recipe_id: int):
    """DELETE /recipes/<recipe_id>"""
    service = get_recipe_service()
    result = service.delete(recipe_id=recipe_id)
    return success_response(result["message"])
