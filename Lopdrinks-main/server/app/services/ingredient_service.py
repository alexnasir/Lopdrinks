"""Ingredient business logic service."""

import logging

from app.models.ingredient import Ingredient
from app.repositories.ingredient_repository import IngredientRepository
from app.exceptions.custom_exceptions import ValidationError, InternalServerError

logger = logging.getLogger(__name__)


class IngredientService:

    def __init__(self, repo: IngredientRepository) -> None:
        self._repo = repo

    def get_all(self) -> list[dict]:
        ingredients = self._repo.find_all()
        return [{"id": ing.id, "name": ing.name} for ing in ingredients]

    def create(self, name: str) -> dict:
        """
        Raises:
            ValidationError: If name is missing.
            InternalServerError: On DB failure.
        """
        if not name:
            raise ValidationError("name is required.")

        ingredient = Ingredient(name=name)
        try:
            self._repo.save(ingredient)
        except Exception as exc:
            self._repo.rollback()
            logger.exception("DB error creating ingredient name=%s", name)
            raise InternalServerError("Failed to create ingredient.") from exc

        logger.info("Ingredient created: %s", name)
        return {"message": "Ingredient created."}
