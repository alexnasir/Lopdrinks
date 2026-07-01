"""
API sub-package — blueprint registration.

All blueprints are imported and registered here via register_routes(),
which is called from the application factory. This keeps create_app()
clean and avoids circular imports.
"""

from flask import Flask


def register_routes(app: Flask) -> None:
    """Register all API blueprints onto the Flask application."""
    from app.api.routes.auth_routes import auth_bp
    from app.api.routes.brew_method_routes import brew_method_bp
    from app.api.routes.ingredient_routes import ingredient_bp
    from app.api.routes.recipe_routes import recipe_bp
    from app.api.routes.order_routes import order_bp
    from app.api.routes.upload_routes import upload_bp
    from app.api.routes.health_routes import health_bp
    from app.api.routes.category_routes import category_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(brew_method_bp)
    app.register_blueprint(ingredient_bp)
    app.register_blueprint(recipe_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(category_bp)

    app.logger.info("All blueprints registered.")
