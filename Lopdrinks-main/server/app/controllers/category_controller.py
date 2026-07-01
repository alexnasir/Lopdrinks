"""Category controller — HTTP in, HTTP out. No business logic."""

import logging
from flask import request

from app.api.dependencies import get_category_service
from app.utils.response import success_response

logger = logging.getLogger(__name__)


def get_categories():
    """GET /categories/"""
    service = get_category_service()
    data = service.get_all()
    return success_response("Categories fetched.", data=data)


def get_category(category_id: int):
    """GET /categories/<category_id>"""
    service = get_category_service()
    data = service.get_by_id(category_id=category_id)
    return success_response("Category fetched.", data=data)


def create_category():
    """POST /categories/"""
    body = request.get_json(silent=True) or {}
    service = get_category_service()
    result = service.create(data=body)
    return success_response(result["message"], status_code=201)


def update_category(category_id: int):
    """PUT /categories/<category_id>"""
    body = request.get_json(silent=True) or {}
    service = get_category_service()
    result = service.update(category_id=category_id, data=body)
    return success_response(result["message"])


def delete_category(category_id: int):
    """DELETE /categories/<category_id>"""
    service = get_category_service()
    result = service.delete(category_id=category_id)
    return success_response(result["message"])
