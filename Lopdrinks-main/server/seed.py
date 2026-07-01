"""
Full database seed script.

Creates:
  - 1 Admin user  (admin@lopdrinks.com / Admin1234!)
  - 1 Regular user (user@lopdrinks.com  / User1234!)
  - 4 Brew methods
  - 8 Ingredients
  - 48 Recipes (4 profiles × 4 inspirations × 3 flavors) with images

Idempotent — safe to run multiple times. Skips records that already exist.

Usage:
    python seed.py                        # local
    flask --app run:app shell < seed.py   # inside flask shell
"""

import os
from werkzeug.security import generate_password_hash
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.brew_method import BrewMethod
from app.models.ingredient import Ingredient
from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient

# ---------------------------------------------------------------------------
# Image map: (profile, inspiration, flavor) → Unsplash URL
# ---------------------------------------------------------------------------
IMAGE_MAP: dict[tuple[str, str, str], str] = {
    ("aromatic", "coastal vibes",   "caramel"): "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=500&auto=format&fit=crop&q=60",
    ("aromatic", "coastal vibes",   "spice"):   "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=500&auto=format&fit=crop&q=60",
    ("aromatic", "highland farms",  "berry"):   "https://images.unsplash.com/photo-1518831970272-6b43f5e7b1f6?w=500&auto=format&fit=crop&q=60",
    ("aromatic", "highland farms",  "caramel"): "https://images.unsplash.com/photo-1494314671908-399b18174975?w=500&auto=format&fit=crop&q=60",
    ("aromatic", "highland farms",  "citrus"):  "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=60",
    ("aromatic", "highland farms",  "spice"):   "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60",
    ("aromatic", "lively markets",  "berry"):   "https://images.unsplash.com/photo-1534687992762-bf7085a4ab23?w=500&auto=format&fit=crop&q=60",
    ("aromatic", "lively markets",  "caramel"): "https://images.unsplash.com/photo-1524350876685-2740ff866b43?w=500&auto=format&fit=crop&q=60",
    ("aromatic", "lively markets",  "citrus"):  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&auto=format&fit=crop&q=60",
    ("aromatic", "lively markets",  "spice"):   "https://images.unsplash.com/photo-1510882272208-7082f0b8e2c6?w=500&auto=format&fit=crop&q=60",
    ("aromatic", "urban cafes",     "berry"):   "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=500&auto=format&fit=crop&q=60",
    ("aromatic", "urban cafes",     "citrus"):  "https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=500&auto=format&fit=crop&q=60",
    ("bold",     "coastal vibes",   "caramel"): "https://images.unsplash.com/photo-1504630083234-14187a9aa972?w=500&auto=format&fit=crop&q=60",
    ("bold",     "coastal vibes",   "citrus"):  "https://images.unsplash.com/photo-1515281780071-6e2af4d6eb93?w=500&auto=format&fit=crop&q=60",
    ("bold",     "highland farms",  "caramel"): "https://images.unsplash.com/photo-1515444664136-3ce4f68a6f8d?w=500&auto=format&fit=crop&q=60",
    ("bold",     "highland farms",  "citrus"):  "https://images.unsplash.com/photo-1521302080334-4b8f8a0fb1fd?w=500&auto=format&fit=crop&q=60",
    ("bold",     "lively markets",  "berry"):   "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=500&auto=format&fit=crop&q=60",
    ("bold",     "lively markets",  "citrus"):  "https://images.unsplash.com/photo-1517935706611-09a8703d6764?w=500&auto=format&fit=crop&q=60",
    ("bold",     "lively markets",  "spice"):   "https://images.unsplash.com/photo-1518972559570-7cc94e7b5059?w=500&auto=format&fit=crop&q=60",
    ("bold",     "urban cafes",     "berry"):   "https://images.unsplash.com/photo-1518057111178-664705b719c8?w=500&auto=format&fit=crop&q=60",
    ("bold",     "urban cafes",     "caramel"): "https://images.unsplash.com/photo-1518425094428-3a56f2ae5e02?w=500&auto=format&fit=crop&q=60",
    ("bold",     "urban cafes",     "citrus"):  "https://images.unsplash.com/photo-1519655836141-48e8b7f02a3d?w=500&auto=format&fit=crop&q=60",
    ("bold",     "urban cafes",     "spice"):   "https://images.unsplash.com/photo-1519985176271-2b2b60887387?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "coastal vibes",   "berry"):   "https://images.unsplash.com/photo-1521017432405-2d95966f6d6d?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "coastal vibes",   "citrus"):  "https://images.unsplash.com/photo-1522039557180-a7226728a515?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "coastal vibes",   "spice"):   "https://images.unsplash.com/photo-1523301464347-3c0e8d2d3009?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "highland farms",  "caramel"): "https://images.unsplash.com/photo-1524781121596-2d740d40a66f?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "highland farms",  "citrus"):  "https://images.unsplash.com/photo-1525619967554-16d4c8f2e9cc?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "highland farms",  "spice"):   "https://images.unsplash.com/photo-1525738761268-0e30ed3e06f8?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "lively markets",  "berry"):   "https://images.unsplash.com/photo-1525968390085-9e87e7b3d83d?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "lively markets",  "caramel"): "https://images.unsplash.com/photo-1527515545081-5db01a295b4b?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "lively markets",  "citrus"):  "https://images.unsplash.com/photo-1528711514960-1b7feda2e236?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "lively markets",  "spice"):   "https://images.unsplash.com/photo-1530047139084-8babc4f458a1?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "urban cafes",     "berry"):   "https://images.unsplash.com/photo-1530595546156-8d362e5e6d37?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "urban cafes",     "caramel"): "https://images.unsplash.com/photo-1530637843609-7e9ae91e0d27?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "urban cafes",     "citrus"):  "https://images.unsplash.com/photo-1531948022917-7b7f8e0c7b94?w=500&auto=format&fit=crop&q=60",
    ("smooth",   "urban cafes",     "spice"):   "https://images.unsplash.com/photo-1531951397688-9e8f3c3c7e1b?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "coastal vibes",   "berry"):   "https://images.unsplash.com/photo-1532499016263-fb2d7e5346eb?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "coastal vibes",   "caramel"): "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "coastal vibes",   "citrus"):  "https://images.unsplash.com/photo-1534099008685-02b54df81f77?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "highland farms",  "berry"):   "https://images.unsplash.com/photo-1534329539061-64b56c47a5e8?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "highland farms",  "caramel"): "https://images.unsplash.com/photo-1534432182912-342209973b9f?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "highland farms",  "spice"):   "https://images.unsplash.com/photo-1535916707405-7e2f6abcab66?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "lively markets",  "berry"):   "https://images.unsplash.com/photo-1537147441880-8b0f543039b7?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "lively markets",  "caramel"): "https://images.unsplash.com/photo-1539616945140-e3968bf6666f?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "lively markets",  "citrus"):  "https://images.unsplash.com/photo-1541167760492-006b07b3cbec?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "lively markets",  "spice"):   "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "urban cafes",     "berry"):   "https://images.unsplash.com/photo-1542894702-c5e1926df4aa?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "urban cafes",     "caramel"): "https://images.unsplash.com/photo-1542995470-870e4e9f84d0?w=500&auto=format&fit=crop&q=60",
    ("zesty",    "urban cafes",     "citrus"):  "https://images.unsplash.com/photo-1543335781-9a3c90f9a70c?w=500&auto=format&fit=crop&q=60",
}

FALLBACK_IMAGE = "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=500&auto=format&fit=crop&q=60"

# ---------------------------------------------------------------------------
# Seed data definitions
# ---------------------------------------------------------------------------

USERS = [
    {
        "username": "admin",
        "email": "admin@lopdrinks.com",
        "password": "Admin1234!",
        "role": "Admin",
        "is_verified": True,
    },
    {
        "username": "demouser",
        "email": "user@lopdrinks.com",
        "password": "User1234!",
        "role": "User",
        "is_verified": True,
    },
]

BREW_METHODS = [
    {
        "name": "Pour Over",
        "details": "A manual brewing technique where hot water is poured slowly over coffee grounds in a filter, producing a clean, bright cup.",
    },
    {
        "name": "French Press",
        "details": "Ground coffee is steeped in hot water and separated by pressing down a metal plunger, yielding a rich, full-bodied brew.",
    },
    {
        "name": "Espresso",
        "details": "Pressurised hot water is forced through finely-ground coffee, producing a concentrated shot with a thick crema.",
    },
    {
        "name": "Cold Brew",
        "details": "Coarsely-ground coffee steeps in cold water for 12–24 hours, resulting in a smooth, low-acid concentrate.",
    },
]

INGREDIENTS = [
    "Espresso",
    "Whole Milk",
    "Oat Milk",
    "Caramel Syrup",
    "Vanilla Syrup",
    "Cinnamon",
    "Orange Zest",
    "Mixed Berry Compote",
]

# Recipe matrix: profile × inspiration × flavor
PROFILES      = ["Aromatic", "Bold", "Smooth", "Zesty"]
INSPIRATIONS  = ["Coastal Vibes", "Highland Farms", "Lively Markets", "Urban Cafes"]
FLAVORS       = ["Berry", "Caramel", "Citrus", "Spice"]

# Price map by profile
PRICE_MAP = {"Aromatic": 4.50, "Bold": 5.00, "Smooth": 4.75, "Zesty": 5.25}

# Takeaway: Coastal/Urban = True, others = False
TAKEAWAY_MAP = {"Coastal Vibes": True, "Highland Farms": False,
                "Lively Markets": False, "Urban Cafes": True}

# Ingredient pairings by flavor
FLAVOR_INGREDIENTS: dict[str, list[tuple[str, str]]] = {
    "Berry":   [("Espresso", "2 shots"), ("Oat Milk", "150ml"), ("Mixed Berry Compote", "30ml")],
    "Caramel": [("Espresso", "2 shots"), ("Whole Milk", "150ml"), ("Caramel Syrup", "25ml"), ("Vanilla Syrup", "10ml")],
    "Citrus":  [("Espresso", "1 shot"),  ("Orange Zest", "1 tsp"), ("Oat Milk", "100ml")],
    "Spice":   [("Espresso", "2 shots"), ("Whole Milk", "120ml"), ("Cinnamon", "½ tsp"), ("Caramel Syrup", "15ml")],
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_or_create_user(data: dict) -> tuple[User, bool]:
    existing = User.query.filter_by(email=data["email"]).first()
    if existing:
        return existing, False
    user = User(
        username=data["username"],
        email=data["email"],
        password=generate_password_hash(data["password"]),
        role=data["role"],
        is_verified=data["is_verified"],
    )
    db.session.add(user)
    return user, True


def _get_or_create_brew_method(data: dict) -> tuple[BrewMethod, bool]:
    existing = BrewMethod.query.filter_by(name=data["name"]).first()
    if existing:
        return existing, False
    bm = BrewMethod(name=data["name"], details=data["details"])
    db.session.add(bm)
    return bm, True


def _get_or_create_ingredient(name: str) -> tuple[Ingredient, bool]:
    existing = Ingredient.query.filter_by(name=name).first()
    if existing:
        return existing, False
    ing = Ingredient(name=name)
    db.session.add(ing)
    return ing, True


# ---------------------------------------------------------------------------
# Main seed function
# ---------------------------------------------------------------------------

def seed() -> None:
    flask_app = create_app()
    with flask_app.app_context():

        print("\n=== Seeding database ===\n")

        # -- Users ------------------------------------------------------------
        user_created = 0
        admin_user = None
        for u in USERS:
            obj, created = _get_or_create_user(u)
            if created:
                user_created += 1
            if u["role"] == "Admin":
                admin_user = obj
        db.session.flush()
        print(f"  Users:        {user_created} created (skipped {len(USERS) - user_created} existing)")

        # -- Brew Methods -----------------------------------------------------
        bm_created = 0
        brew_method_map: dict[str, BrewMethod] = {}
        for bm_data in BREW_METHODS:
            obj, created = _get_or_create_brew_method(bm_data)
            if created:
                bm_created += 1
            brew_method_map[bm_data["name"]] = obj
        db.session.flush()
        print(f"  Brew Methods: {bm_created} created (skipped {len(BREW_METHODS) - bm_created} existing)")

        # -- Ingredients ------------------------------------------------------
        ing_created = 0
        ingredient_map: dict[str, Ingredient] = {}
        for ing_name in INGREDIENTS:
            obj, created = _get_or_create_ingredient(ing_name)
            if created:
                ing_created += 1
            ingredient_map[ing_name] = obj
        db.session.flush()
        print(f"  Ingredients:  {ing_created} created (skipped {len(INGREDIENTS) - ing_created} existing)")

        # -- Recipes ----------------------------------------------------------
        # Assign brew methods to profiles deterministically
        profile_brew_map = {
            "Aromatic": brew_method_map["Pour Over"],
            "Bold":     brew_method_map["Espresso"],
            "Smooth":   brew_method_map["French Press"],
            "Zesty":    brew_method_map["Cold Brew"],
        }

        recipe_created = 0
        recipe_skipped = 0

        for profile in PROFILES:
            for inspiration in INSPIRATIONS:
                for flavor in FLAVORS:
                    recipe_name = f"{profile} {flavor} — {inspiration}"
                    description = (
                        f"A {profile.lower()} coffee inspired by Kenya's "
                        f"{inspiration.lower()}. Features notes of {flavor.lower()}."
                    )

                    # Skip if already exists
                    if Recipe.query.filter_by(name=recipe_name).first():
                        recipe_skipped += 1
                        continue

                    image_url = IMAGE_MAP.get(
                        (profile.lower(), inspiration.lower(), flavor.lower()),
                        FALLBACK_IMAGE,
                    )

                    recipe = Recipe(
                        name=recipe_name,
                        description=description,
                        price=PRICE_MAP[profile],
                        takeaway=TAKEAWAY_MAP[inspiration],
                        image_url=image_url,
                        brew_method_id=profile_brew_map[profile].id,
                        created_by=admin_user.id if admin_user else None,
                    )
                    db.session.add(recipe)
                    db.session.flush()  # get recipe.id

                    # Attach ingredients
                    for ing_name, qty in FLAVOR_INGREDIENTS.get(flavor, []):
                        ing = ingredient_map.get(ing_name)
                        if ing:
                            db.session.add(RecipeIngredient(
                                recipe_id=recipe.id,
                                ingredient_id=ing.id,
                                quantity=qty,
                            ))
                    recipe_created += 1

        db.session.commit()
        total_possible = len(PROFILES) * len(INSPIRATIONS) * len(FLAVORS)
        print(f"  Recipes:      {recipe_created} created (skipped {recipe_skipped} existing, {total_possible} total possible)")

        print("\n=== Seed complete ===")
        print(f"\n  Admin login:  admin@lopdrinks.com  /  Admin1234!")
        print(f"  User login:   user@lopdrinks.com   /  User1234!\n")


if __name__ == "__main__":
    seed()
