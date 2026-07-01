"""RecipeIngredient join model."""

from app.extensions import db


class RecipeIngredient(db.Model):
    """Association table linking a Recipe to its Ingredients with quantities."""

    __tablename__ = "recipe_ingredient"

    id: int = db.Column(db.Integer, primary_key=True)
    recipe_id: int = db.Column(
        db.Integer, db.ForeignKey("recipe.id"), nullable=False
    )
    ingredient_id: int = db.Column(
        db.Integer, db.ForeignKey("ingredient.id"), nullable=False
    )
    quantity: str | None = db.Column(db.String(50), nullable=True)

    def __repr__(self) -> str:
        return (
            f"<RecipeIngredient recipe={self.recipe_id} "
            f"ingredient={self.ingredient_id} qty={self.quantity!r}>"
        )
