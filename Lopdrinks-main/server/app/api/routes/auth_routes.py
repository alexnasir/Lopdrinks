"""Auth routes — URL binding only. No logic."""

from flask import Blueprint
from app.controllers.auth_controller import register, verify, login

auth_bp = Blueprint("auth", __name__)

auth_bp.post("/register")(register)
auth_bp.post("/verify")(verify)
auth_bp.post("/login")(login)
