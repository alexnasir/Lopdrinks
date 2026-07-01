"""Ingredient repository — database operations only."""

import logging
from typing import Optional

from app.extensions import db
from app.models.ingredient import Ingredient

logger = logging.getLogger(__name__)


class IngredientRepository:
    """CRUD operations for the Ingredient model."""

    def find_all(self) -> list[Ingredient]:
        return Ingredient.query.all()

    def find_by_id(self, ingredient_id: int) -> Optional[Ingredient]:
        return db.session.get(Ingredient, ingredient_id)

    def save(self, ingredient: Ingredient) -> Ingredient:
        db.session.add(ingredient)
        db.session.commit()
        return ingredient

    def rollback(self) -> None:
        db.session.rollback()
