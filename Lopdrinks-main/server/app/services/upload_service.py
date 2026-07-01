"""File upload business logic service."""

import logging
import os
from datetime import datetime

from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from flask import current_app

from app.utils.file_helpers import is_allowed_file
from app.exceptions.custom_exceptions import ValidationError, InternalServerError

logger = logging.getLogger(__name__)


class UploadService:
    """Handles file upload validation and persistence."""

    def save_file(self, file: FileStorage) -> dict:
        """
        Validate and save an uploaded file.

        Args:
            file: The FileStorage object from the request.

        Returns:
            A dict containing the public image_url.

        Raises:
            ValidationError: If file is missing, empty, or has a disallowed type.
            InternalServerError: If the file cannot be saved.
        """
        if not file or file.filename == "":
            raise ValidationError("No file provided.")

        if not is_allowed_file(file.filename):
            raise ValidationError(
                "Invalid file type. Allowed types: png, jpg, jpeg, gif."
            )

        filename = secure_filename(file.filename)
        unique_filename = f"{datetime.utcnow().timestamp()}_{filename}"
        upload_folder: str = current_app.config["UPLOAD_FOLDER"]

        try:
            file.save(os.path.join(upload_folder, unique_filename))
        except OSError as exc:
            logger.exception("Failed to save file: %s", unique_filename)
            raise InternalServerError("Failed to save file.") from exc

        image_url = f"/uploads/{unique_filename}"
        logger.info("File uploaded: %s", image_url)
        return {"message": "File uploaded successfully.", "image_url": image_url}
