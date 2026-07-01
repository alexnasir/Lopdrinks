"""
Application entry point.

Usage (local):
    python run.py

Usage (production via gunicorn):
    gunicorn "run:app"

The module-level `app` variable is kept for gunicorn compatibility.
"""

import os
from app import create_app

app = create_app(os.getenv("APP_ENV", "development"))

if __name__ == "__main__":
    app.run(
        debug=app.debug,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
    )
