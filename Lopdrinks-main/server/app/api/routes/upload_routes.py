"""Upload routes — URL binding only. No logic."""

from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.controllers.upload_controller import upload_file, serve_uploaded_file
from app.middleware.auth import require_role
from app.constants.roles import Role

upload_bp = Blueprint("uploads", __name__)

upload_bp.post("/upload")(
    jwt_required()(require_role(Role.ADMIN)(upload_file))
)

upload_bp.get("/uploads/<filename>")(serve_uploaded_file)
