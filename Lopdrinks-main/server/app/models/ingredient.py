"""Ingredient model."""

from app.extensions import db


class Ingredient(db.Model):
    """A single coffee ingredient (e.g., milk, espresso, syrup)."""

    __tablename__ = "ingredient"

    id: int = db.Column(db.Integer, primary_key=True)
    name: str = db.Column(db.String(100), nullable=False)

    # Relationships
    recipe_ingredients = db.relationship(
        "RecipeIngredient", backref="ingredient", lazy=True
    )

    def __repr__(self) -> str:
        return f"<Ingredient id={self.id} name={self.name!r}>"
