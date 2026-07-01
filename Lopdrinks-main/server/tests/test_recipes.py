"""Integration tests for the /recipes/ endpoint."""


def test_get_recipes_unauthenticated(client):
    """Public GET /recipes/ should return 200."""
    res = client.get("/recipes/")
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "data" in data


def test_create_recipe_requires_auth(client):
    """POST /recipes/ without a token should return 401."""
    res = client.post("/recipes/", json={"name": "Espresso", "price": 3.5, "brew_method_id": 1})
    assert res.status_code == 401
