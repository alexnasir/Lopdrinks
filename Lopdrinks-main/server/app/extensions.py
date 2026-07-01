"""
Flask extension singletons.

Extensions are instantiated here without being bound to any application.
They are initialised inside create_app() via the init_app() pattern,
which keeps the module importable without a running application context.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db: SQLAlchemy = SQLAlchemy()
migrate: Migrate = Migrate()
jwt: JWTManager = JWTManager()
cors: CORS = CORS()
