"""Order business logic service."""

import logging
from datetime import datetime

from app.models.order import Order
from app.repositories.order_repository import OrderRepository
from app.repositories.recipe_repository import RecipeRepository
from app.repositories.user_repository import UserRepository
from app.constants.order_status import OrderStatus
from app.constants.roles import Role
from app.exceptions.custom_exceptions import (
    ValidationError,
    NotFoundError,
    ForbiddenError,
    InternalServerError,
)

logger = logging.getLogger(__name__)


def _serialise_order(o: Order) -> dict:
    return {
        "id": o.id,
        "recipe_id": o.recipe_id,
        "recipe_name": o.recipe.name if o.recipe else None,
        "quantity": o.quantity,
        "unit_price": float(o.unit_price),
        "status": o.status,
        "ordered_at": o.ordered_at.isoformat(),
        "user_id": o.user_id,
    }


class OrderService:

    def __init__(
        self,
        order_repo: OrderRepository,
        recipe_repo: RecipeRepository,
        user_repo: UserRepository,
    ) -> None:
        self._order_repo = order_repo
        self._recipe_repo = recipe_repo
        self._user_repo = user_repo

    def get_orders(
        self,
        requesting_user_id: int,
        requesting_user_role: str,
        status: str | None = None,
        limit: int = 5,
    ) -> list[dict]:
        """
        Admins see all orders; regular users see only their own.

        Raises:
            ValidationError: If limit < 1.
            NotFoundError: If the requesting user doesn't exist.
        """
        if limit < 1:
            raise ValidationError("limit must be a positive integer.")

        user = self._user_repo.find_by_id(requesting_user_id)
        if not user:
            raise NotFoundError("User not found.")

        user_id_filter = (
            None if requesting_user_role == Role.ADMIN else requesting_user_id
        )
        orders = self._order_repo.find_all(
            user_id=user_id_filter, status=status, limit=limit
        )
        logger.debug(
            "Fetched %d orders for user_id=%d role=%s",
            len(orders),
            requesting_user_id,
            requesting_user_role,
        )
        return [_serialise_order(o) for o in orders]

    def get_by_id(
        self, order_id: int, requesting_user_id: int, requesting_user_role: str
    ) -> dict:
        """
        Raises:
            NotFoundError: Order or user not found.
            ForbiddenError: Non-admin trying to access another user's order.
        """
        user = self._user_repo.find_by_id(requesting_user_id)
        if not user:
            raise NotFoundError("User not found.")

        order = self._order_repo.find_by_id(order_id)
        if not order:
            raise NotFoundError("Order not found.")

        if requesting_user_role != Role.ADMIN and order.user_id != requesting_user_id:
            raise ForbiddenError()

        return _serialise_order(order)

    def create(self, user_id: int, recipe_id: int, quantity: int) -> dict:
        """
        Place a new order.

        Raises:
            ValidationError: If quantity is invalid.
            NotFoundError: If recipe is not found.
            InternalServerError: On DB failure.
        """
        try:
            quantity = int(quantity)
            if quantity < 1:
                raise ValueError
        except (ValueError, TypeError):
            raise ValidationError("quantity must be a positive integer.")

        recipe = self._recipe_repo.find_by_id(recipe_id)
        if not recipe:
            raise NotFoundError("Recipe not found.")

        order = Order(
            user_id=user_id,
            recipe_id=recipe_id,
            quantity=quantity,
            unit_price=float(recipe.price),
            status=OrderStatus.PENDING,
            ordered_at=datetime.utcnow(),
        )

        try:
            self._order_repo.save(order)
        except Exception as exc:
            self._order_repo.rollback()
            logger.exception("DB error creating order user_id=%d", user_id)
            raise InternalServerError("Failed to place order.") from exc

        logger.info("Order created: id=%d user_id=%d", order.id, user_id)
        return {
            "message": "Order placed successfully.",
            "order_id": order.id,
            "quantity": order.quantity,
            "recipe_id": order.recipe_id,
        }

    def update(
        self,
        order_id: int,
        requesting_user_id: int,
        requesting_user_role: str,
        data: dict,
    ) -> dict:
        """
        Update quantity (owner or admin) or status (admin only).

        Raises:
            NotFoundError, ForbiddenError, ValidationError, InternalServerError.
        """
        order = self._order_repo.find_by_id(order_id)
        if not order:
            raise NotFoundError("Order not found.")

        if order.user_id != requesting_user_id and requesting_user_role != Role.ADMIN:
            raise ForbiddenError()

        updated = False

        if "quantity" in data:
            try:
                qty = int(data["quantity"])
                if qty < 1:
                    raise ValueError
                order.quantity = qty
                updated = True
            except (ValueError, TypeError):
                raise ValidationError("quantity must be a positive integer.")

        if "status" in data:
            if requesting_user_role != Role.ADMIN:
                raise ForbiddenError("Only admins can update order status.")
            if data["status"] not in OrderStatus.ALL:
                raise ValidationError(
                    f"Invalid status. Must be one of: {', '.join(OrderStatus.ALL)}."
                )
            order.status = data["status"]
            updated = True

        if not updated:
            raise ValidationError("No valid fields to update.")

        try:
            self._order_repo.commit()
        except Exception as exc:
            self._order_repo.rollback()
            logger.exception("DB error updating order id=%d", order_id)
            raise InternalServerError("Failed to update order.") from exc

        logger.info("Order updated: id=%d", order_id)
        return {
            "message": "Order updated.",
            "order_id": order.id,
            "quantity": order.quantity,
            "status": order.status,
        }

    def delete(
        self,
        order_id: int,
        requesting_user_id: int,
        requesting_user_role: str,
    ) -> dict:
        """
        Delete an order. Non-admins can only delete their own Pending orders.

        Raises:
            NotFoundError, ForbiddenError, InternalServerError.
        """
        order = self._order_repo.find_by_id(order_id)
        if not order:
            raise NotFoundError("Order not found.")

        if order.user_id != requesting_user_id and requesting_user_role != Role.ADMIN:
            raise ForbiddenError()

        if (
            order.status not in OrderStatus.USER_CANCELLABLE
            and requesting_user_role != Role.ADMIN
        ):
            raise ForbiddenError("Only pending orders can be deleted.")

        try:
            self._order_repo.delete(order)
        except Exception as exc:
            self._order_repo.rollback()
            logger.exception("DB error deleting order id=%d", order_id)
            raise InternalServerError("Failed to delete order.") from exc

        logger.info("Order deleted: id=%d", order_id)
        return {"message": "Order deleted.", "order_id": order_id}
