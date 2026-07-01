"""OTP generation and email dispatch utilities."""

import random
import logging

logger = logging.getLogger(__name__)


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP string of the given length."""
    lower = 10 ** (length - 1)
    upper = (10 ** length) - 1
    return str(random.randint(lower, upper))


def send_verification_email(email: str, code: str) -> None:
    """
    Send the OTP to the user's email address.

    Currently a mock implementation that logs the OTP.
    Replace with a real email provider (SendGrid, AWS SES, etc.) in production.

    Args:
        email: Recipient email address.
        code: The OTP to send.
    """
    logger.info("[Mock Email] OTP %s sent to %s", code, email)
