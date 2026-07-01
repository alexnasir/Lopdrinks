"""Category repository — database operations only."""

import logging
from typing import Optional

from app.extensions import db
from app.models.category import Category

logger = logging.getLogger(__name__)


class CategoryRepository:
    """CRUD operations for the Category model."""

    def find_all(self) -> list[Category]:
        return Category.query.all()

    def find_by_id(self, category_id: int) -> Optional[Category]:
        return db.session.get(Category, category_id)

    def find_by_name(self, name: str) -> Optional[Category]:
        return Category.query.filter_by(name=name).first()

    def save(self, category: Category) -> Category:
        db.session.add(category)
        db.session.commit()
        return category

    def delete(self, category: Category) -> None:
        db.session.delete(category)
        db.session.commit()

    def commit(self) -> None:
        db.session.commit()

    def rollback(self) -> None:
        db.session.rollback()
