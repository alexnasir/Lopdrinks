"""Ingredient controller — HTTP in, HTTP out. No business logic."""

import logging
from flask import request

from app.api.dependencies import get_ingredient_service
from app.utils.response import success_response

logger = logging.getLogger(__name__)


def get_ingredients():
    """GET /ingredients/"""
    service = get_ingredient_service()
    data = service.get_all()
    return success_response("Ingredients fetched.", data=data)


def create_ingredient():
    """POST /ingredients/"""
    body = request.get_json(silent=True) or {}
    service = get_ingredient_service()
    result = service.create(name=body.get("name", ""))
    return success_response(result["message"], status_code=201)
