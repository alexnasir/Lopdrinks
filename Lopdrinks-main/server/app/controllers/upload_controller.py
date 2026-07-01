"""Upload controller — HTTP in, HTTP out. No business logic."""

import logging
from flask import request, send_from_directory, current_app

from app.api.dependencies import get_upload_service
from app.utils.response import success_response

logger = logging.getLogger(__name__)


def upload_file():
    """POST /upload"""
    file = request.files.get("file")
    service = get_upload_service()
    result = service.save_file(file)
    return success_response(result["message"], data={"image_url": result["image_url"]})


def serve_uploaded_file(filename: str):
    """GET /uploads/<filename>"""
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)
