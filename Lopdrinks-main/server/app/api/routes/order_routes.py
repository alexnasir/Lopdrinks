"""Order routes — URL binding only. No logic."""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.controllers.order_controller import (
    get_all_orders,
    get_order_by_id,
    create_order,
    update_order,
    delete_order,
)

order_bp = Blueprint("orders", __name__)

order_bp.get("/orders/")(jwt_required()(get_all_orders))
order_bp.get("/orders/<int:order_id>")(jwt_required()(get_order_by_id))
order_bp.post("/orders/")(jwt_required()(create_order))
order_bp.patch("/orders/<int:order_id>")(jwt_required()(update_order))
order_bp.delete("/orders/<int:order_id>")(jwt_required()(delete_order))
