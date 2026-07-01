"""
User repository.

Responsible ONLY for user-related database operations.
No business logic lives here — validation and decisions belong in services.
"""

import logging
from typing import Optional

from app.extensions import db
from app.models.user import User

logger = logging.getLogger(__name__)


class UserRepository:
    """CRUD operations for the User model."""

    def find_by_id(self, user_id: int) -> Optional[User]:
        """Fetch a user by primary key."""
        return db.session.get(User, user_id)

    def find_by_email(self, email: str) -> Optional[User]:
        """Fetch a user by email address."""
        return User.query.filter_by(email=email).first()

    def find_by_username(self, username: str) -> Optional[User]:
        """Fetch a user by username."""
        return User.query.filter_by(username=username).first()

    def save(self, user: User) -> User:
        """Persist a new or updated user."""
        db.session.add(user)
        db.session.commit()
        return user

    def rollback(self) -> None:
        """Roll back the current transaction."""
        db.session.rollback()
