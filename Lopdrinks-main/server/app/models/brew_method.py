"""BrewMethod model."""

from app.extensions import db


class BrewMethod(db.Model):
    """Represents a coffee brewing technique (e.g., Pour Over, French Press)."""

    __tablename__ = "brew_method"

    id: int = db.Column(db.Integer, primary_key=True)
    name: str = db.Column(db.String(100), nullable=False)
    details: str | None = db.Column(db.Text, nullable=True)

    # Relationships
    recipes = db.relationship("Recipe", backref="brew_method", lazy=True)

    def __repr__(self) -> str:
        return f"<BrewMethod id={self.id} name={self.name!r}>"
