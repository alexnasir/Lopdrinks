"""
Dependency factory functions.

These functions wire repositories into services, keeping controllers
decoupled from concrete implementations. Swap out a repository for a
mock here and every controller using that service gets the mock — no
changes required elsewhere (Dependency Inversion Principle).
"""

from app.repositories.user_repository import UserRepository
from app.repositories.brew_method_repository import BrewMethodRepository
from app.repositories.ingredient_repository import IngredientRepository
from app.repositories.recipe_repository import RecipeRepository
from app.repositories.order_repository import OrderRepository

from app.services.auth_service import AuthService
from app.services.brew_method_service import BrewMethodService
from app.services.ingredient_service import IngredientService
from app.services.recipe_service import RecipeService
from app.services.order_service import OrderService
from app.services.upload_service import UploadService


def get_auth_service() -> AuthService:
    return AuthService(user_repo=UserRepository())


def get_brew_method_service() -> BrewMethodService:
    return BrewMethodService(repo=BrewMethodRepository())


def get_ingredient_service() -> IngredientService:
    return IngredientService(repo=IngredientRepository())


def get_recipe_service() -> RecipeService:
    return RecipeService(
        recipe_repo=RecipeRepository(),
        brew_method_repo=BrewMethodRepository(),
        ingredient_repo=IngredientRepository(),
    )


def get_order_service() -> OrderService:
    return OrderService(
        order_repo=OrderRepository(),
        recipe_repo=RecipeRepository(),
        user_repo=UserRepository(),
    )


def get_upload_service() -> UploadService:
    return UploadService()
