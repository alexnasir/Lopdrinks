"""
Centralised HTTP response builder.

All API responses follow the envelope:
    {"success": true/false, "message": "...", "data": {...}}
    {"success": false, "message": "...", "errors": [...]}

Using a single builder ensures the entire API is consistent without
repeating jsonify() calls in every controller.
"""

from typing import Any
from flask import jsonify


def success_response(
    message: str,
    data: Any = None,
    status_code: int = 200,
):
    """Build a successful JSON response.

    Args:
        message: Human-readable success message.
        data: Payload to include under the 'data' key. Omitted if None.
        status_code: HTTP status code. Defaults to 200.

    Returns:
        A Flask (Response, int) tuple.
    """
    body: dict = {"success": True, "message": message}
    if data is not None:
        body["data"] = data
    return jsonify(body), status_code


def error_response(
    message: str,
    errors: list[str] | None = None,
    status_code: int = 400,
):
    """Build an error JSON response.

    Args:
        message: Human-readable error description.
        errors: Optional list of field-level error messages.
        status_code: HTTP status code. Defaults to 400.

    Returns:
        A Flask (Response, int) tuple.
    """
    body: dict = {"success": False, "message": message}
    if errors:
        body["errors"] = errors
    return jsonify(body), status_code
