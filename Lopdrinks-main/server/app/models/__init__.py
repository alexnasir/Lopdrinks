"""
Models sub-package.

Importing all model modules here ensures Flask-Migrate (Alembic) can
discover every table when generating migrations.
"""

from app.models.user import User
from app.models.brew_method import BrewMethod
from app.models.ingredient import Ingredient
from app.models.category import Category
from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient
from app.models.order import Order

__all__ = ["User", "BrewMethod", "Ingredient", "Category", "Recipe", "RecipeIngredient", "Order"]
