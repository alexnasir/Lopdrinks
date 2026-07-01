"""Recipe business logic service."""

import logging
from typing import Any

from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient
from app.repositories.recipe_repository import RecipeRepository
from app.repositories.brew_method_repository import BrewMethodRepository
from app.repositories.ingredient_repository import IngredientRepository
from app.repositories.category_repository import CategoryRepository
from app.exceptions.custom_exceptions import (
    ValidationError,
    NotFoundError,
    InternalServerError,
)

logger = logging.getLogger(__name__)


def _serialise_recipe(r: Recipe) -> dict:
    """Convert a Recipe ORM object to a plain dict (used internally)."""
    return {
        "id": r.id,
        "name": r.name,
        "description": r.description,
        "price": float(r.price),
        "takeaway": r.takeaway,
        "image_url": r.image_url,
        "category": (
            {"id": r.category.id, "name": r.category.name}
            if r.category
            else None
        ),
        "brew_method": (
            {
                "id": r.brew_method.id,
                "name": r.brew_method.name,
                "details": r.brew_method.details,
            }
            if r.brew_method
            else None
        ),
        "ingredients": [
            {
                "id": ri.ingredient.id,
                "name": ri.ingredient.name,
                "quantity": ri.quantity,
            }
            for ri in r.ingredients
        ],
    }


class RecipeService:

    def __init__(
        self,
        recipe_repo: RecipeRepository,
        brew_method_repo: BrewMethodRepository,
        ingredient_repo: IngredientRepository,
        category_repo: CategoryRepository,
    ) -> None:
        self._recipe_repo = recipe_repo
        self._brew_method_repo = brew_method_repo
        self._ingredient_repo = ingredient_repo
        self._category_repo = category_repo

    def get_all(self) -> list[dict]:
        recipes = self._recipe_repo.find_all()
        logger.debug("Fetched %d recipes", len(recipes))
        return [_serialise_recipe(r) for r in recipes]

    def get_by_id(self, recipe_id: int) -> dict:
        """
        Raises:
            NotFoundError: Recipe not found.
        """
        recipe = self._recipe_repo.find_by_id(recipe_id)
        if not recipe:
            raise NotFoundError(f"Recipe {recipe_id} not found.")
        return _serialise_recipe(recipe)

    def get_by_category(self, category_id: int) -> list[dict]:
        """
        Raises:
            NotFoundError: Category not found (no recipes is still valid — returns []).
        """
        recipes = self._recipe_repo.find_by_category_id(category_id)
        logger.debug("Fetched %d recipes for category_id=%d", len(recipes), category_id)
        return [_serialise_recipe(r) for r in recipes]

    def create(self, data: dict[str, Any], created_by: int) -> dict:
        """
        Create a new recipe with its ingredients.

        Raises:
            ValidationError: Missing required fields or invalid references.
            InternalServerError: DB failure.
        """
        name = data.get("name")
        price = data.get("price")
        brew_method_id = data.get("brew_method_id")
        category_id = data.get("category_id")

        if not all([name, price, brew_method_id, category_id]):
            raise ValidationError("name, price, brew_method_id, and category_id are required.")

        category = self._category_repo.find_by_id(category_id)
        if not category:
            raise ValidationError(f"Category {category_id} not found.")

        brew_method = self._brew_method_repo.find_by_id(brew_method_id)
        if not brew_method:
            raise ValidationError(f"Brew method {brew_method_id} not found.")

        # Validate ingredient references before touching the DB
        for ing in data.get("ingredients", []):
            if not self._ingredient_repo.find_by_id(ing.get("ingredient_id")):
                raise ValidationError(
                    f"Ingredient {ing.get('ingredient_id')} not found."
                )

        recipe = Recipe(
            name=name,
            description=data.get("description"),
            price=float(price),
            takeaway=data.get("takeaway", False),
            image_url=data.get("image_url"),
            brew_method_id=brew_method_id,
            category_id=category_id,
            created_by=created_by,
        )

        try:
            self._recipe_repo.save(recipe)
            for ing in data.get("ingredients", []):
                self._recipe_repo.add_ingredient(
                    RecipeIngredient(
                        recipe_id=recipe.id,
                        ingredient_id=ing["ingredient_id"],
                        quantity=ing["quantity"],
                    )
                )
            self._recipe_repo.commit()
        except Exception as exc:
            self._recipe_repo.rollback()
            logger.exception("DB error creating recipe name=%s", name)
            raise InternalServerError("Failed to create recipe.") from exc

        logger.info("Recipe created: id=%d name=%s", recipe.id, name)
        return {"message": "Recipe created."}

    def update(self, recipe_id: int, data: dict[str, Any]) -> dict:
        """
        Update an existing recipe.

        Raises:
            NotFoundError: Recipe not found.
            ValidationError: Invalid references.
            InternalServerError: DB failure.
        """
        recipe = self._recipe_repo.find_by_id(recipe_id)
        if not recipe:
            raise NotFoundError(f"Recipe {recipe_id} not found.")

        recipe.name = data.get("name", recipe.name)
        recipe.description = data.get("description", recipe.description)
        recipe.price = float(data.get("price", recipe.price))
        recipe.takeaway = data.get("takeaway", recipe.takeaway)
        recipe.image_url = data.get("image_url", recipe.image_url)

        if "category_id" in data:
            cat = self._category_repo.find_by_id(data["category_id"])
            if not cat:
                raise ValidationError(f"Category {data['category_id']} not found.")
            recipe.category_id = data["category_id"]

        if "brew_method_id" in data:
            bm = self._brew_method_repo.find_by_id(data["brew_method_id"])
            if not bm:
                raise ValidationError(
                    f"Brew method {data['brew_method_id']} not found."
                )
            recipe.brew_method_id = data["brew_method_id"]

        if "ingredients" in data:
            for ing in data["ingredients"]:
                if not self._ingredient_repo.find_by_id(ing.get("ingredient_id")):
                    raise ValidationError(
                        f"Ingredient {ing.get('ingredient_id')} not found."
                    )
            self._recipe_repo.delete_ingredients(recipe_id)
            for ing in data["ingredients"]:
                self._recipe_repo.add_ingredient(
                    RecipeIngredient(
                        recipe_id=recipe.id,
                        ingredient_id=ing["ingredient_id"],
                        quantity=ing["quantity"],
                    )
                )

        try:
            self._recipe_repo.commit()
        except Exception as exc:
            self._recipe_repo.rollback()
            logger.exception("DB error updating recipe id=%d", recipe_id)
            raise InternalServerError("Failed to update recipe.") from exc

        logger.info("Recipe updated: id=%d", recipe_id)
        return {"message": "Recipe updated."}

    def delete(self, recipe_id: int) -> dict:
        """
        Raises:
            NotFoundError: Recipe not found.
            InternalServerError: DB failure.
        """
        recipe = self._recipe_repo.find_by_id(recipe_id)
        if not recipe:
            raise NotFoundError(f"Recipe {recipe_id} not found.")

        try:
            self._recipe_repo.delete(recipe)
            self._recipe_repo.commit()
        except Exception as exc:
            self._recipe_repo.rollback()
            logger.exception("DB error deleting recipe id=%d", recipe_id)
            raise InternalServerError("Failed to delete recipe.") from exc

        logger.info("Recipe deleted: id=%d", recipe_id)
        return {"message": "Recipe deleted."}
