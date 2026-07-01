"""File upload helper utilities."""

from flask import current_app


def is_allowed_file(filename: str) -> bool:
    """
    Return True if the file extension is in the ALLOWED_EXTENSIONS config set.

    Args:
        filename: The original filename from the upload.
    """
    allowed: set[str] = current_app.config.get("ALLOWED_EXTENSIONS", set())
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed
