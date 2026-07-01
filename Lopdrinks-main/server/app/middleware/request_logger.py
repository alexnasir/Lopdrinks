"""
Request / response lifecycle hooks.

Registers before_request and after_request hooks on the Flask app to
provide structured access logging. Sensitive headers (Authorization,
Cookie) are scrubbed before logging.
"""

import logging
from flask import Flask, request

logger = logging.getLogger(__name__)

# Headers to redact from logs
_SENSITIVE_HEADERS = frozenset({"authorization", "cookie"})


def register_request_hooks(app: Flask) -> None:
    """Attach before/after request logging hooks."""

    @app.before_request
    def log_incoming_request() -> None:
        safe_headers = {
            k: v
            for k, v in request.headers.items()
            if k.lower() not in _SENSITIVE_HEADERS
        }
        # Limit body preview to 200 chars to avoid flooding logs
        body_preview = request.get_data(as_text=True)[:200]
        logger.debug(
            "→ %s %s | headers=%s | body=%r",
            request.method,
            request.path,
            safe_headers,
            body_preview,
        )

    @app.after_request
    def log_outgoing_response(response):
        origin = response.headers.get("Access-Control-Allow-Origin", "—")
        logger.debug(
            "← %s %s [%d] | CORS-Origin=%s",
            request.method,
            request.path,
            response.status_code,
            origin,
        )
        return response
