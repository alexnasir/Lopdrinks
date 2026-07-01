"""Order repository — database operations only."""

import logging
from typing import Optional

from app.extensions import db
from app.models.order import Order

logger = logging.getLogger(__name__)


class OrderRepository:
    """CRUD and query operations for the Order model."""

    def find_by_id(self, order_id: int) -> Optional[Order]:
        return db.session.get(Order, order_id)

    def find_all(
        self,
        user_id: Optional[int] = None,
        status: Optional[str] = None,
        limit: int = 5,
    ) -> list[Order]:
        """
        Fetch orders with optional filters.

        Args:
            user_id: If provided, restrict to this user's orders.
            status: If provided, filter by order status.
            limit: Maximum number of results (default 5).
        """
        query = Order.query
        if user_id is not None:
            query = query.filter_by(user_id=user_id)
        if status is not None:
            query = query.filter_by(status=status)
        return query.order_by(Order.ordered_at.desc()).limit(limit).all()

    def save(self, order: Order) -> Order:
        db.session.add(order)
        db.session.commit()
        return order

    def delete(self, order: Order) -> None:
        db.session.delete(order)
        db.session.commit()

    def commit(self) -> None:
        db.session.commit()

    def rollback(self) -> None:
        db.session.rollback()
