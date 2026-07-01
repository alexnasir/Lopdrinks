"""BrewMethod repository — database operations only."""

import logging
from typing import Optional

from app.extensions import db
from app.models.brew_method import BrewMethod

logger = logging.getLogger(__name__)


class BrewMethodRepository:
    """CRUD operations for the BrewMethod model."""

    def find_all(self) -> list[BrewMethod]:
        return BrewMethod.query.all()

    def find_by_id(self, brew_method_id: int) -> Optional[BrewMethod]:
        return db.session.get(BrewMethod, brew_method_id)

    def save(self, brew_method: BrewMethod) -> BrewMethod:
        db.session.add(brew_method)
        db.session.commit()
        return brew_method

    def rollback(self) -> None:
        db.session.rollback()
