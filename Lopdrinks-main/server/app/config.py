"""
Environment-specific configuration classes.

Secrets and environment-specific values are NEVER hardcoded here.
They are loaded exclusively from the .env file / environment variables.

Usage:
    app.config.from_object(get_config())
"""

import os
from dotenv import load_dotenv

load_dotenv()


class BaseConfig:
    """Shared configuration inherited by all environments."""

    # -- Security --------------------------------------------------------------
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me-jwt-secret")
    # Non-expiring tokens keep existing frontend behaviour. Set a real delta
    # in production via JWT_ACCESS_TOKEN_EXPIRES env var.
    JWT_ACCESS_TOKEN_EXPIRES: bool = False

    # -- Database --------------------------------------------------------------
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False

    # -- File uploads ----------------------------------------------------------
    UPLOAD_FOLDER: str = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "static", "Uploads"
    )
    ALLOWED_EXTENSIONS: set[str] = {"png", "jpg", "jpeg", "gif"}
    MAX_CONTENT_LENGTH: int = 16 * 1024 * 1024  # 16 MB

    # -- CORS ------------------------------------------------------------------
    ALLOWED_ORIGINS: list[str] = os.getenv(
        "ALLOWED_ORIGINS",
        (
            "http://localhost:3000,http://localhost:3001,http://localhost:5173,"
            "http://127.0.0.1:3000,"
            "https://lopdrinks-blwa.vercel.app,"
            "https://lopdrinks-blwa-5ky8hytoj-alexs-projects-7f85cd3e.vercel.app"
        ),
    ).split(",")

    # -- Pagination ------------------------------------------------------------
    DEFAULT_PAGE_LIMIT: int = 5


class DevelopmentConfig(BaseConfig):
    """Local development — SQLite, debug on."""

    DEBUG: bool = True
    SQLALCHEMY_DATABASE_URI: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///coffee.db",
    )


class TestingConfig(BaseConfig):
    """Test suite — in-memory SQLite, CSRF & auth disabled."""

    TESTING: bool = True
    DEBUG: bool = True
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///:memory:"
    JWT_SECRET_KEY: str = "test-jwt-secret"
    WTF_CSRF_ENABLED: bool = False


class ProductionConfig(BaseConfig):
    """Production — requires real DATABASE_URL and secrets in the environment."""

    DEBUG: bool = False
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL", "sqlite:///coffee.db")

    def __init_subclass__(cls, **kwargs: object) -> None:
        # Fail loudly at startup if DATABASE_URL is not set in production.
        if not os.getenv("DATABASE_URL"):
            import warnings
            warnings.warn(
                "DATABASE_URL is not set. Running production with SQLite fallback.",
                RuntimeWarning,
                stacklevel=2,
            )
        super().__init_subclass__(**kwargs)


_CONFIG_MAP: dict[str, type[BaseConfig]] = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(config_name: str | None = None) -> type[BaseConfig]:
    """
    Return the appropriate config class.

    Args:
        config_name: 'development' | 'testing' | 'production'.
                     Falls back to APP_ENV env var, then 'development'.
    """
    name = config_name or os.getenv("APP_ENV", "development")
    return _CONFIG_MAP.get(name, DevelopmentConfig)
