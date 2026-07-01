"""
Authorization decorators.

These decorators wrap Flask-JWT-Extended's @jwt_required() with role
enforcement, so controllers stay clean:

    @jwt_required()
    @require_role(Role.ADMIN)
    def my_endpoint():
        ...
"""

import logging
from functools import wraps
from typing import Callable

from flask_jwt_extended import get_jwt_identity

from app.exceptions.custom_exceptions import ForbiddenError

logger = logging.getLogger(__name__)


def require_role(*roles: str) -> Callable:
    """
    Decorator that enforces one or more role restrictions on a route.

    Must be used AFTER @jwt_required() so that get_jwt_identity() is
    available.

    Args:
        *roles: One or more role strings (e.g., Role.ADMIN).

    Raises:
        ForbiddenError: If the current user's role is not in *roles.
    """

    def decorator(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args, **kwargs):
            identity = get_jwt_identity()
            user_role: str = identity.get("role", "")
            if user_role not in roles:
                logger.warning(
                    "Access denied for role=%r to endpoint requiring %r",
                    user_role,
                    roles,
                )
                raise ForbiddenError()
            return fn(*args, **kwargs)

        return wrapper

    return decorator
