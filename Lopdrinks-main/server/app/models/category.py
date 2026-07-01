"""Category model."""

from app.extensions import db


class Category(db.Model):
    """Represents a recipe category (e.g., Hot, Cold, Seasonal)."""

    __tablename__ = "category"

    id: int = db.Column(db.Integer, primary_key=True)
    name: str = db.Column(db.String(100), nullable=False, unique=True)

    # Relationships
    recipes = db.relationship("Recipe", backref="category", lazy=True)

    def __repr__(self) -> str:
        return f"<Category id={self.id} name={self.name!r}>"
