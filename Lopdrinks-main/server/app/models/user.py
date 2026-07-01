"""User model."""

from app.extensions import db


class User(db.Model):
    """
    Represents an application user.

    Roles: 'Admin' | 'User'
    Email verification is enforced via OTP before login is permitted.
    """

    __tablename__ = "user"

    id: int = db.Column(db.Integer, primary_key=True)
    username: str = db.Column(db.String(80), unique=True, nullable=False)
    email: str = db.Column(db.String(120), unique=True, nullable=False)
    password: str = db.Column(db.String(256), nullable=False)
    role: str = db.Column(db.String(20), default="User", nullable=False)
    is_verified: bool = db.Column(db.Boolean, default=False, nullable=False)
    otp_code: str | None = db.Column(db.String(6), nullable=True)

    # Relationships
    orders = db.relationship("Order", backref="user", lazy=True)
    recipes = db.relationship("Recipe", backref="creator", lazy=True)

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role!r}>"
