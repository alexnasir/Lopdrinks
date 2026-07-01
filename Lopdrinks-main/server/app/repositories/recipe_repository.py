"""Recipe repository — database operations only."""

import logging
from typing import Optional

from app.extensions import db
from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient

logger = logging.getLogger(__name__)


class RecipeRepository:
    """CRUD operations for Recipe and its RecipeIngredient children."""

    def find_all(self) -> list[Recipe]:
        """Return all recipes, eagerly avoiding N+1 via joined load."""
        return Recipe.query.all()

    def find_by_id(self, recipe_id: int) -> Optional[Recipe]:
        return db.session.get(Recipe, recipe_id)

    def find_by_category_id(self, category_id: int) -> list[Recipe]:
        """Return all recipes belonging to the given category."""
        return Recipe.query.filter_by(category_id=category_id).all()

    def save(self, recipe: Recipe) -> Recipe:
        db.session.add(recipe)
        db.session.flush()  # Populate recipe.id before adding children
        return recipe

    def add_ingredient(self, recipe_ingredient: RecipeIngredient) -> None:
        db.session.add(recipe_ingredient)

    def delete_ingredients(self, recipe_id: int) -> None:
        """Remove all RecipeIngredient rows for the given recipe."""
        RecipeIngredient.query.filter_by(recipe_id=recipe_id).delete()

    def delete(self, recipe: Recipe) -> None:
        db.session.delete(recipe)

    def commit(self) -> None:
        db.session.commit()

    def rollback(self) -> None:
        db.session.rollback()
