"""Order controller — HTTP in, HTTP out. No business logic."""

import logging
from flask import request
from flask_jwt_extended import get_jwt_identity

from app.api.dependencies import get_order_service
from app.utils.response import success_response

logger = logging.getLogger(__name__)


def _identity() -> tuple[int, str]:
    """Return (user_id, user_role) from the JWT identity."""
    ident = get_jwt_identity()
    return ident["id"], ident["role"]


def get_all_orders():
    """GET /orders/"""
    user_id, user_role = _identity()
    limit = request.args.get("limit", default=5, type=int)
    status = request.args.get("status", default=None, type=str)
    service = get_order_service()
    data = service.get_orders(
        requesting_user_id=user_id,
        requesting_user_role=user_role,
        status=status,
        limit=limit,
    )
    return success_response("Orders fetched.", data=data)


def get_order_by_id(order_id: int):
    """GET /orders/<order_id>"""
    user_id, user_role = _identity()
    service = get_order_service()
    data = service.get_by_id(
        order_id=order_id,
        requesting_user_id=user_id,
        requesting_user_role=user_role,
    )
    return success_response("Order fetched.", data=data)


def create_order():
    """POST /orders/"""
    user_id, _ = _identity()
    body = request.get_json(silent=True) or {}
    service = get_order_service()
    result = service.create(
        user_id=user_id,
        recipe_id=body.get("recipe_id"),
        quantity=body.get("quantity", 1),
    )
    return success_response(result["message"], data=result, status_code=201)


def update_order(order_id: int):
    """PATCH /orders/<order_id>"""
    user_id, user_role = _identity()
    body = request.get_json(silent=True) or {}
    service = get_order_service()
    result = service.update(
        order_id=order_id,
        requesting_user_id=user_id,
        requesting_user_role=user_role,
        data=body,
    )
    return success_response(result["message"], data=result)


def delete_order(order_id: int):
    """DELETE /orders/<order_id>"""
    user_id, user_role = _identity()
    service = get_order_service()
    result = service.delete(
        order_id=order_id,
        requesting_user_id=user_id,
        requesting_user_role=user_role,
    )
    return success_response(result["message"], data=result)
