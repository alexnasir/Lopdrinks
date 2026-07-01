"""Recipe model."""

from datetime import datetime

from app.extensions import db


class Recipe(db.Model):
    """
    A coffee recipe with pricing, brewing method, and ingredient list.

    Only Admin users can create/update/delete recipes.
    """

    __tablename__ = "recipe"

    id: int = db.Column(db.Integer, primary_key=True)
    name: str = db.Column(db.String(100), nullable=False)
    description: str | None = db.Column(db.Text, nullable=True)
    price: float = db.Column(db.Float, nullable=False)
    takeaway: bool = db.Column(db.Boolean, default=False, nullable=False)
    image_url: str | None = db.Column(db.String(256), nullable=True)
    brew_method_id: int | None = db.Column(
        db.Integer, db.ForeignKey("brew_method.id"), nullable=True
    )
    created_by: int | None = db.Column(
        db.Integer, db.ForeignKey("user.id"), nullable=True
    )
    created_at: datetime = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    orders = db.relationship("Order", backref="recipe", lazy=True)
    ingredients = db.relationship("RecipeIngredient", backref="recipe", lazy=True)

    def __repr__(self) -> str:
        return f"<Recipe id={self.id} name={self.name!r} price={self.price}>"
