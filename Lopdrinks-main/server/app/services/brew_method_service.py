"""BrewMethod business logic service."""

import logging

from app.models.brew_method import BrewMethod
from app.repositories.brew_method_repository import BrewMethodRepository
from app.exceptions.custom_exceptions import ValidationError, InternalServerError

logger = logging.getLogger(__name__)


class BrewMethodService:

    def __init__(self, repo: BrewMethodRepository) -> None:
        self._repo = repo

    def get_all(self) -> list[dict]:
        """Return all brew methods serialised as plain dicts."""
        methods = self._repo.find_all()
        return [
            {"id": bm.id, "name": bm.name, "details": bm.details}
            for bm in methods
        ]

    def create(self, name: str, details: str | None) -> dict:
        """
        Create a new brew method.

        Raises:
            ValidationError: If name is missing.
            InternalServerError: On DB failure.
        """
        if not name:
            raise ValidationError("name is required.")

        brew_method = BrewMethod(name=name, details=details)
        try:
            self._repo.save(brew_method)
        except Exception as exc:
            self._repo.rollback()
            logger.exception("DB error creating brew method name=%s", name)
            raise InternalServerError("Failed to create brew method.") from exc

        logger.info("BrewMethod created: %s", name)
        return {"message": "Brew method created."}
