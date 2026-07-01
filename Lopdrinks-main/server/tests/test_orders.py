"""Integration tests for the /orders/ endpoint."""


def test_get_orders_requires_auth(client):
    """GET /orders/ without a token should return 401."""
    res = client.get("/orders/")
    assert res.status_code == 401


def test_create_order_requires_auth(client):
    """POST /orders/ without a token should return 401."""
    res = client.post("/orders/", json={"recipe_id": 1, "quantity": 2})
    assert res.status_code == 401
