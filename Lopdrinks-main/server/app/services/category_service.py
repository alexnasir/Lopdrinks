"""Category business logic service."""

import logging

from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.exceptions.custom_exceptions import (
    ValidationError,
    NotFoundError,
    ConflictError,
    InternalServerError,
)

logger = logging.getLogger(__name__)


def _serialise_category(c: Category) -> dict:
    return {"id": c.id, "name": c.name}


class CategoryService:

    def __init__(self, repo: CategoryRepository) -> None:
        self._repo = repo

    def get_all(self) -> list[dict]:
        categories = self._repo.find_all()
        logger.debug("Fetched %d categories", len(categories))
        return [_serialise_category(c) for c in categories]

    def get_by_id(self, category_id: int) -> dict:
        """
        Raises:
            NotFoundError: Category not found.
        """
        category = self._repo.find_by_id(category_id)
        if not category:
            raise NotFoundError(f"Category {category_id} not found.")
        return _serialise_category(category)

    def create(self, data: dict) -> dict:
        """
        Raises:
            ValidationError: Missing or blank name.
            ConflictError: Name already exists.
            InternalServerError: DB failure.
        """
        name = (data.get("name") or "").strip()
        if not name:
            raise ValidationError("name is required.")

        if self._repo.find_by_name(name):
            raise ConflictError(f"Category '{name}' already exists.")

        category = Category(name=name)
        try:
            self._repo.save(category)
        except Exception as exc:
            self._repo.rollback()
            logger.exception("DB error creating category name=%s", name)
            raise InternalServerError("Failed to create category.") from exc

        logger.info("Category created: id=%d name=%s", category.id, name)
        return {"message": "Category created."}

    def update(self, category_id: int, data: dict) -> dict:
        """
        Raises:
            NotFoundError: Category not found.
            ValidationError: Missing or blank name.
            ConflictError: Name already taken by another category.
            InternalServerError: DB failure.
        """
        category = self._repo.find_by_id(category_id)
        if not category:
            raise NotFoundError(f"Category {category_id} not found.")

        name = (data.get("name") or "").strip()
        if not name:
            raise ValidationError("name is required.")

        existing = self._repo.find_by_name(name)
        if existing and existing.id != category_id:
            raise ConflictError(f"Category '{name}' already exists.")

        category.name = name
        try:
            self._repo.commit()
        except Exception as exc:
            self._repo.rollback()
            logger.exception("DB error updating category id=%d", category_id)
            raise InternalServerError("Failed to update category.") from exc

        logger.info("Category updated: id=%d", category_id)
        return {"message": "Category updated."}

    def delete(self, category_id: int) -> dict:
        """
        Raises:
            NotFoundError: Category not found.
            InternalServerError: DB failure.
        """
        category = self._repo.find_by_id(category_id)
        if not category:
            raise NotFoundError(f"Category {category_id} not found.")

        try:
            self._repo.delete(category)
        except Exception as exc:
            self._repo.rollback()
            logger.exception("DB error deleting category id=%d", category_id)
            raise InternalServerError("Failed to delete category.") from exc

        logger.info("Category deleted: id=%d", category_id)
        return {"message": "Category deleted."}
