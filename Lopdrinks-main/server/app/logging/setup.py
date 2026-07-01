"""
Structured logging configuration.

Sets up a consistent log format for the Flask app and its gunicorn
worker in production. Logs include timestamp, level, module, and message
so they are machine-parseable (e.g., by Datadog / CloudWatch).
"""

import logging
import sys
from flask import Flask


LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s — %(message)s"
DATE_FORMAT = "%Y-%m-%dT%H:%M:%S"


def configure_logging(app: Flask) -> None:
    """
    Attach a stream handler to the root logger and set the log level
    based on whether the app is in debug mode.

    Args:
        app: The Flask application instance.
    """
    level = logging.DEBUG if app.debug else logging.INFO

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))

    # Configure root logger — Flask's app.logger inherits from it.
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Avoid adding duplicate handlers on reload (e.g., Flask debug reloader).
    if not root_logger.handlers:
        root_logger.addHandler(handler)

    app.logger.setLevel(level)
    app.logger.info("Logging configured. Level=%s", logging.getLevelName(level))
