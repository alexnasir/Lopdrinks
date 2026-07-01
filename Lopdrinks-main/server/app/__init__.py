"""
Application factory module.

Uses the Application Factory pattern to allow multiple app instances
(e.g., testing, production) without global state.
"""

from flask import Flask

from app.config import get_config
from app.extensions import db, migrate, jwt, cors
from app.logging.setup import configure_logging
from app.exceptions.handlers import register_error_handlers
from app.middleware.request_logger import register_request_hooks
from app.api import register_routes


def create_app(config_name: str | None = None) -> Flask:
    """
    Create and configure the Flask application.

    Args:
        config_name: One of 'development', 'testing', 'production'.
                     Falls back to the APP_ENV environment variable,
                     then to 'development'.

    Returns:
        A fully configured Flask application instance.
    """
    app = Flask(__name__, static_folder="static", static_url_path="/")

    # -- Configuration ---------------------------------------------------------
    app.config.from_object(get_config(config_name))

    # -- Logging ---------------------------------------------------------------
    configure_logging(app)

    # -- Extensions ------------------------------------------------------------
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={
            r"/*": {
                "origins": app.config["ALLOWED_ORIGINS"],
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "expose_headers": ["Content-Type", "Authorization"],
                "supports_credentials": False,
            }
        },
    )

    # -- Ensure required directories exist ------------------------------------
    import os
    os.makedirs(app.instance_path, exist_ok=True)
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # -- Import models so Flask-Migrate can detect them -----------------------
    from app.models import user, recipe, order, brew_method, ingredient, recipe_ingredient  # noqa: F401

    # NOTE: db.create_all() is intentionally omitted here.
    # Schema is managed exclusively by Alembic migrations (flask db upgrade).
    # Using db.create_all() alongside Alembic causes DuplicateTable errors
    # on PostgreSQL in production. For SQLite local dev, migrations handle it.

    # -- Middleware / request hooks -------------------------------------------
    register_request_hooks(app)

    # -- Exception handlers ---------------------------------------------------
    register_error_handlers(app)

    # -- Routes ---------------------------------------------------------------
    register_routes(app)

    app.logger.info("Application started successfully.")
    return app
