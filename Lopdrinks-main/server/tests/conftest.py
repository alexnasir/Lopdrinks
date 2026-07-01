"""
Pytest configuration and shared fixtures.

Uses an in-memory SQLite database so tests never touch production data.
"""

import pytest
from app import create_app
from app.extensions import db as _db


@pytest.fixture(scope="session")
def app():
    """Create a test application with an in-memory database."""
    flask_app = create_app("testing")
    with flask_app.app_context():
        _db.create_all()
        yield flask_app
        _db.drop_all()


@pytest.fixture(scope="session")
def client(app):
    """Provide a test client for the application."""
    return app.test_client()


@pytest.fixture(autouse=True)
def clean_db(app):
    """Roll back each test's DB changes to keep tests isolated."""
    with app.app_context():
        yield
        _db.session.rollback()
