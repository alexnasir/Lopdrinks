"""
Authentication service.

Contains ALL business logic for registration, OTP verification, and login.
This module has zero Flask dependencies — no request/response objects.
"""

import logging
from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.utils.otp import generate_otp, send_verification_email
from app.exceptions.custom_exceptions import (
    ValidationError,
    ConflictError,
    UnauthorizedError,
    NotFoundError,
    InternalServerError,
)

logger = logging.getLogger(__name__)


class AuthService:
    """Handles user registration, email verification, and JWT login."""

    def __init__(self, user_repo: UserRepository) -> None:
        self._user_repo = user_repo

    # ------------------------------------------------------------------
    # Registration
    # ------------------------------------------------------------------
    def register(self, username: str, email: str, password: str, role: str = "User") -> dict:
        """
        Create a new user account.

        Steps:
          1. Validate that required fields are present.
          2. Check for duplicate email / username.
          3. Hash password, generate OTP.
          4. Persist user and dispatch OTP email.

        Returns:
            A dict with a confirmation message.

        Raises:
            ValidationError: If required fields are missing.
            ConflictError: If email or username is already taken.
            InternalServerError: On unexpected DB failure.
        """
        if not all([username, email, password]):
            raise ValidationError("username, email, and password are required.")

        if self._user_repo.find_by_email(email):
            raise ConflictError("An account with this email already exists.")

        if self._user_repo.find_by_username(username):
            raise ConflictError("This username is already taken.")

        hashed_pw = generate_password_hash(password)
        otp = generate_otp()

        user = User(
            username=username,
            email=email,
            password=hashed_pw,
            otp_code=otp,
            role=role,
        )

        try:
            self._user_repo.save(user)
        except Exception as exc:
            self._user_repo.rollback()
            logger.exception("DB error during registration for email=%s", email)
            raise InternalServerError("Registration failed. Please try again.") from exc

        send_verification_email(email, otp)
        logger.info("User registered: email=%s", email)
        return {"message": "Registered. OTP sent to email."}

    # ------------------------------------------------------------------
    # OTP Verification
    # ------------------------------------------------------------------
    def verify_email(self, email: str, otp: str) -> dict:
        """
        Verify a user's email address using the OTP.

        Raises:
            ValidationError: If email or OTP is missing, or OTP is incorrect.
            InternalServerError: On unexpected DB failure.
        """
        if not all([email, otp]):
            raise ValidationError("email and otp are required.")

        user = self._user_repo.find_by_email(email)
        if not user or user.otp_code != otp:
            raise ValidationError("Invalid OTP.")

        user.is_verified = True
        user.otp_code = None

        try:
            self._user_repo.save(user)
        except Exception as exc:
            self._user_repo.rollback()
            logger.exception("DB error during OTP verification for email=%s", email)
            raise InternalServerError("Verification failed. Please try again.") from exc

        logger.info("Email verified: %s", email)
        return {"message": "Email verified."}

    # ------------------------------------------------------------------
    # Login
    # ------------------------------------------------------------------
    def login(self, email: str, password: str) -> dict:
        """
        Authenticate a user and return a JWT access token.

        Raises:
            ValidationError: If email or password is missing.
            UnauthorizedError: If credentials are wrong or email is unverified.
        """
        if not all([email, password]):
            raise ValidationError("email and password are required.")

        user = self._user_repo.find_by_email(email)
        if not user or not check_password_hash(user.password, password):
            raise UnauthorizedError("Invalid credentials.")

        if not user.is_verified:
            raise UnauthorizedError("Please verify your email before logging in.")

        # expires_delta=False keeps existing non-expiring behaviour
        token = create_access_token(
            identity={"id": user.id, "role": user.role},
            expires_delta=False,
        )
        logger.info("User logged in: email=%s role=%s", email, user.role)
        return {
            "message": "Login successful.",
            "token": token,
            "role": user.role,
        }
