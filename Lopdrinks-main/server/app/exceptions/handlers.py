"""
Global error handler registration.

All unhandled exceptions and JWT errors are caught here and converted
into the consistent JSON envelope:

    Success:  {"success": true,  "message": "...", "data": {...}}
    Error:    {"success": false, "message": "...", "errors": [...]}

Keeping handlers centralised means individual routes/controllers never
need to worry about error response formatting.
"""

import logging
from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

from app.exceptions.custom_exceptions import AppError

logger = logging.getLogger(__name__)


def register_error_handlers(app: Flask) -> None:
    """Attach all error handlers to the Flask app."""

    # -- Custom application errors (our hierarchy) ----------------------------
    @app.errorhandler(AppError)
    def handle_app_error(error: AppError):
        logger.warning("AppError [%d]: %s", error.status_code, error.message)
        return jsonify(error.to_dict()), error.status_code

    # -- Werkzeug / Flask HTTP errors (404, 405, etc.) -----------------------
    @app.errorhandler(HTTPException)
    def handle_http_exception(error: HTTPException):
        logger.warning("HTTPException [%d]: %s", error.code, error.description)
        return (
            jsonify({"success": False, "message": error.description}),
            error.code,
        )

    # -- JWT errors -----------------------------------------------------------
    @app.errorhandler(401)
    def handle_401(error):
        return (
            jsonify({"success": False, "message": "Authentication required."}),
            401,
        )

    # -- Generic catch-all (should never reach production with real errors) ---
    @app.errorhandler(Exception)
    def handle_unhandled_exception(error: Exception):
        logger.exception("Unhandled exception: %s", str(error))
        return (
            jsonify(
                {
                    "success": False,
                    "message": "An internal server error occurred.",
                }
            ),
            500,
        )

    # -- JWT-Extended specific callbacks --------------------------------------
    from app.extensions import jwt

    @jwt.unauthorized_loader
    def unauthorized_callback(reason: str):
        logger.warning("JWT unauthorized: %s", reason)
        return jsonify({"success": False, "message": "Missing or invalid token."}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason: str):
        logger.warning("JWT invalid token: %s", reason)
        return jsonify({"success": False, "message": "Invalid token."}), 401

    @jwt.expired_token_loader
    def expired_token_callback(_jwt_header, _jwt_payload):
        return jsonify({"success": False, "message": "Token has expired."}), 401
