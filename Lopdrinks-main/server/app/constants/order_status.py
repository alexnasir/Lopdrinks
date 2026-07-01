"""Order lifecycle status constants."""


class OrderStatus:
    PENDING: str = "Pending"
    CONFIRMED: str = "Confirmed"
    SHIPPED: str = "Shipped"
    DELIVERED: str = "Delivered"
    CANCELLED: str = "Cancelled"

    ALL: tuple[str, ...] = (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)

    # Only pending orders may be cancelled/deleted by the owning user
    USER_CANCELLABLE: tuple[str, ...] = (PENDING,)
