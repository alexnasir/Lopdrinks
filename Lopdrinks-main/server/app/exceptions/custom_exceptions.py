"""
Domain-specific exception hierarchy.

All custom exceptions inherit from AppError so callers can catch the
entire hierarchy with a single except clause when needed.

Each exception carries:
  - message  : human-readable description
  - status_code : HTTP status code to use in the response
  - errors   : optional list of field-level validation messages
"""


class AppError(Exception):
    """Base application error. Never raise this directly."""

    status_code: int = 500
    message: str = "An unexpected error occurred."

    def __init__(
        self,
        message: str | None = None,
        errors: list[str] | None = None,
    ) -> None:
        super().__init__(message or self.message)
        self.message = message or self.message
        self.errors = errors or []

    def to_dict(self) -> dict:
        payload: dict = {"success": False, "message": self.message}
        if self.errors:
            payload["errors"] = self.errors
        return payload


class NotFoundError(AppError):
    """Raised when a requested resource does not exist."""

    status_code = 404
    message = "Resource not found."


class UnauthorizedError(AppError):
    """Raised when authentication is missing or invalid."""

    status_code = 401
    message = "Authentication required."


class ForbiddenError(AppError):
    """Raised when an authenticated user lacks permission."""

    status_code = 403
    message = "You do not have permission to perform this action."


class ValidationError(AppError):
    """Raised when request data fails validation."""

    status_code = 400
    message = "Validation failed."


class ConflictError(AppError):
    """Raised when a resource already exists (e.g., duplicate email)."""

    status_code = 409
    message = "A conflict occurred with the current state of the resource."


class InternalServerError(AppError):
    """Raised for unexpected server-side failures."""

    status_code = 500
    message = "An internal server error occurred."
