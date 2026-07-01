"""BrewMethod controller — HTTP in, HTTP out. No business logic."""

import logging
from flask import request

from app.api.dependencies import get_brew_method_service
from app.utils.response import success_response

logger = logging.getLogger(__name__)


def get_brew_methods():
    """GET /brew_methods/"""
    service = get_brew_method_service()
    data = service.get_all()
    return success_response("Brew methods fetched.", data=data)


def create_brew_method():
    """POST /brew_methods/"""
    body = request.get_json(silent=True) or {}
    service = get_brew_method_service()
    result = service.create(
        name=body.get("name", ""),
        details=body.get("details"),
    )
    return success_response(result["message"], status_code=201)
