"""
Auth controller.

Receives HTTP requests, extracts data, delegates to AuthService,
and returns HTTP responses. No SQL. No business logic.
"""

import logging
from flask import request

from app.api.dependencies import get_auth_service
from app.utils.response import success_response, error_response

logger = logging.getLogger(__name__)


def register():
    """POST /register"""
    data = request.get_json(silent=True) or {}
    service = get_auth_service()
    result = service.register(
        username=data.get("username", ""),
        email=data.get("email", ""),
        password=data.get("password", ""),
        role=data.get("role", "User"),
    )
    return success_response(result["message"], status_code=201)


def verify():
    """POST /verify"""
    data = request.get_json(silent=True) or {}
    service = get_auth_service()
    result = service.verify_email(
        email=data.get("email", ""),
        otp=data.get("otp", ""),
    )
    return success_response(result["message"])


def login():
    """POST /login"""
    data = request.get_json(silent=True) or {}
    service = get_auth_service()
    result = service.login(
        email=data.get("email", ""),
        password=data.get("password", ""),
    )
    return success_response(
        result["message"],
        data={"token": result["token"], "role": result["role"]},
    )
