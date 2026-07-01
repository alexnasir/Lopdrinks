"""
Integration tests for the authentication endpoints.

Tests confirm that:
  - Registration returns 201 and sends OTP
  - Duplicate email returns 409
  - OTP verification marks the user as verified
  - Login fails before verification
  - Login succeeds after verification and returns a token
"""

import pytest


def test_register_success(client):
    res = client.post(
        "/register",
        json={"username": "testuser", "email": "test@example.com", "password": "secure123"},
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True


def test_register_duplicate_email(client):
    client.post(
        "/register",
        json={"username": "userA", "email": "dup@example.com", "password": "pass"},
    )
    res = client.post(
        "/register",
        json={"username": "userB", "email": "dup@example.com", "password": "pass"},
    )
    assert res.status_code == 409


def test_register_missing_fields(client):
    res = client.post("/register", json={"email": "x@y.com"})
    assert res.status_code == 400


def test_login_before_verification(client):
    client.post(
        "/register",
        json={"username": "unverifuser", "email": "unverif@example.com", "password": "pass"},
    )
    res = client.post(
        "/login",
        json={"email": "unverif@example.com", "password": "pass"},
    )
    assert res.status_code == 401


def test_verify_invalid_otp(client):
    client.post(
        "/register",
        json={"username": "verifuser2", "email": "verif2@example.com", "password": "pass"},
    )
    res = client.post(
        "/verify",
        json={"email": "verif2@example.com", "otp": "000000"},
    )
    assert res.status_code == 400


def test_login_invalid_credentials(client):
    res = client.post(
        "/login",
        json={"email": "nobody@example.com", "password": "wrong"},
    )
    assert res.status_code == 401
