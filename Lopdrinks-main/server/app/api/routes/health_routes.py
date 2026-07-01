"""Health check route — used by Render (and load balancers) to verify liveness."""

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    """Return 200 OK so Render knows the service is alive."""
    return jsonify({"status": "ok"}), 200
