"""Order model."""

from datetime import datetime

from app.extensions import db


class Order(db.Model):
    """
    A customer's order for a specific Recipe.

    Status lifecycle: Pending → Confirmed → Shipped → Delivered | Cancelled
    """

    __tablename__ = "order"

    id: int = db.Column(db.Integer, primary_key=True)
    user_id: int = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=False
    )
    recipe_id: int = db.Column(
        db.Integer, db.ForeignKey("recipe.id"), nullable=False
    )
    quantity: int = db.Column(db.Integer, nullable=False)
    unit_price: float = db.Column(db.Float, nullable=False)
    status: str = db.Column(db.String(20), default="Pending", nullable=False)
    ordered_at: datetime = db.Column(
        db.DateTime, default=datetime.utcnow, nullable=False
    )

    def __repr__(self) -> str:
        return (
            f"<Order id={self.id} user={self.user_id} "
            f"recipe={self.recipe_id} status={self.status!r}>"
        )
