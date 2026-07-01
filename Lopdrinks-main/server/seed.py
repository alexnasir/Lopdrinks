"""
Full database seed — v2 (with Categories).

Creates:
  - 1 Admin user      (admin@lopdrinks.com  / Admin1234!)
  - 3 Regular users   (jane / brian / sophie)
  - 6 Categories      (Hot Classics, Cold Brews, Specialty Lattes,
                        Seasonal Specials, Herbal & Wellness, Blended Frappes)
  - 4 Brew methods
  - 15 Ingredients
  - 48 Recipes spread across categories, each with ingredients
  - 20 Sample orders across users & recipes

Idempotent — safe to re-run against the same DB (skips existing rows).
Works locally (SQLite) and on Render (PostgreSQL via DATABASE_URL).

Usage:
    python seed.py                    # local or Render one-off job
"""

import os
import sys
import random
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

# ---------------------------------------------------------------------------
# Bootstrap — support running as a plain script outside flask CLI
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.brew_method import BrewMethod
from app.models.ingredient import Ingredient
from app.models.category import Category
from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient
from app.models.order import Order


# ---------------------------------------------------------------------------
# USERS
# ---------------------------------------------------------------------------
USERS = [
    {"username": "admin",  "email": "admin@lopdrinks.com", "password": "Admin1234!", "role": "Admin", "is_verified": True},
    {"username": "jane",   "email": "jane@lopdrinks.com",  "password": "User1234!",  "role": "User",  "is_verified": True},
    {"username": "brian",  "email": "brian@lopdrinks.com", "password": "User1234!",  "role": "User",  "is_verified": True},
    {"username": "sophie", "email": "sophie@lopdrinks.com","password": "User1234!",  "role": "User",  "is_verified": True},
]

# ---------------------------------------------------------------------------
# CATEGORIES
# ---------------------------------------------------------------------------
CATEGORIES = [
    "Hot Classics",
    "Cold Brews",
    "Specialty Lattes",
    "Seasonal Specials",
    "Herbal & Wellness",
    "Blended Frappes",
]

# ---------------------------------------------------------------------------
# BREW METHODS
# ---------------------------------------------------------------------------
BREW_METHODS = [
    {"name": "Pour Over",   "details": "Hot water poured slowly over grounds in a filter — clean, bright cup."},
    {"name": "French Press","details": "Steep & press — rich, full-bodied brew with natural oils intact."},
    {"name": "Espresso",    "details": "Pressurised water through fine grounds — concentrated shot with crema."},
    {"name": "Cold Brew",   "details": "Coarse grounds steeped cold 12-24 h — smooth, low-acid concentrate."},
]

# ---------------------------------------------------------------------------
# INGREDIENTS
# ---------------------------------------------------------------------------
INGREDIENTS = [
    "Espresso Shot",
    "Whole Milk",
    "Oat Milk",
    "Almond Milk",
    "Coconut Milk",
    "Caramel Syrup",
    "Vanilla Syrup",
    "Hazelnut Syrup",
    "Brown Sugar Syrup",
    "Cinnamon",
    "Orange Zest",
    "Mixed Berry Compote",
    "Matcha Powder",
    "Cocoa Powder",
    "Whipped Cream",
]


# ---------------------------------------------------------------------------
# RECIPES
# Each entry: (name, description, price, takeaway, category, brew_method,
#              image_url, [(ingredient_name, quantity), ...])
# ---------------------------------------------------------------------------
RECIPES = [

    # ── Hot Classics ────────────────────────────────────────────────────────
    ("Signature Espresso",
     "Double shot of our house blend espresso with rich crema and notes of dark chocolate and toasted nuts.",
     3.75, False, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots")]),

    ("Velvet Flat White",
     "Ristretto espresso topped with microfoamed whole milk for a silky, balanced texture.",
     4.50, True, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "130ml")]),

    ("Classic Cappuccino",
     "Traditional Italian cappuccino with equal parts espresso, steamed milk, and luxurious foam.",
     4.25, True, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1534687992762-bf7085a4ab23?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "90ml"), ("Whipped Cream", "dollop")]),

    ("Bold Americano",
     "Double espresso gently diluted with hot filtered water for a bright, full-flavored cup.",
     3.95, True, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1551030173-122aabc4489c?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots")]),

    ("Single Origin Pour Over",
     "Hand-poured Ethiopian beans delivering floral and berry notes with exceptional clarity.",
     4.75, False, "Hot Classics", "Pour Over",
     "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot")]),

    ("French Press Reserve",
     "Coarse-ground Colombian beans steeped and pressed for a robust, oily body.",
     4.50, False, "Hot Classics", "French Press",
     "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Brown Sugar Syrup", "10ml")]),

    ("Cortado Balance",
     "Equal parts espresso and steamed milk — smooth and perfectly rounded acidity.",
     4.25, True, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "70ml")]),

    ("Espresso Macchiato",
     "Bold espresso marked with a touch of dense steamed milk foam.",
     3.95, True, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1560674360-0b2e4a57d6b6?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "25ml")]),


    # ── Cold Brews ──────────────────────────────────────────────────────────
    ("Signature Cold Brew",
     "24-hour steeped Honduran beans — smooth, low-acid with cocoa and caramel undertones.",
     5.25, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Brown Sugar Syrup", "15ml")]),

    ("Vanilla Sweet Cream Nitro",
     "Nitrogen-infused cold brew crowned with house vanilla sweet cream foam.",
     5.95, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1575443348576-5b54e9a51b2a?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Vanilla Syrup", "20ml"), ("Whole Milk", "60ml")]),

    ("Espresso Tonic Spark",
     "Bold espresso poured over tonic water with fresh orange zest for bright refreshment.",
     5.75, True, "Cold Brews", "Espresso",
     "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Orange Zest", "1 tsp")]),

    ("Tropical Coconut Cold Brew",
     "Cold brew blended with creamy coconut milk and a hint of caramel.",
     5.95, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1554058446-3b10d5ebfb00?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Coconut Milk", "160ml"), ("Caramel Syrup", "15ml")]),

    ("Berry Lemon Cold Brew",
     "Cold brew shaken with mixed berry compote, fresh lemon, and a splash of oat milk.",
     5.75, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Mixed Berry Compote", "30ml"), ("Oat Milk", "80ml")]),

    ("Iced Oat Americano",
     "Double espresso over ice with oat milk and a touch of vanilla.",
     4.75, True, "Cold Brews", "Espresso",
     "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Oat Milk", "100ml"), ("Vanilla Syrup", "10ml")]),

    ("Hazelnut Cold Brew",
     "Smooth cold brew with toasted hazelnut syrup and almond milk.",
     5.85, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Almond Milk", "120ml"), ("Hazelnut Syrup", "20ml")]),


    # ── Specialty Lattes ────────────────────────────────────────────────────
    ("Salted Caramel Latte",
     "Rich espresso, steamed whole milk, house caramel, and sea salt flakes.",
     5.50, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "200ml"), ("Caramel Syrup", "25ml"), ("Cinnamon", "pinch")]),

    ("Toasted Hazelnut Oat Latte",
     "Espresso with toasted hazelnut and velvety oat milk.",
     5.45, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Oat Milk", "210ml"), ("Hazelnut Syrup", "25ml")]),

    ("Madagascar Vanilla Latte",
     "Classic espresso latte sweetened with pure vanilla bean syrup.",
     5.25, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "200ml"), ("Vanilla Syrup", "20ml")]),

    ("Brown Sugar Cinnamon Latte",
     "Warm espresso with brown sugar syrup and a generous cinnamon dusting.",
     5.60, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Oat Milk", "190ml"), ("Brown Sugar Syrup", "25ml"), ("Cinnamon", "½ tsp")]),

    ("Coconut Almond Mocha",
     "Espresso, dark cocoa, coconut and almond milk blend.",
     5.75, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1524781121596-2d740d40a66f?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Coconut Milk", "100ml"), ("Almond Milk", "100ml"), ("Cocoa Powder", "1 tsp")]),

    ("Dark Chocolate Mocha",
     "Intense espresso and dark cocoa with steamed milk and whipped cream.",
     5.65, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1534432182912-342209973b9f?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "180ml"), ("Cocoa Powder", "2 tsp")]),


    # ── Seasonal Specials ───────────────────────────────────────────────────
    ("Pumpkin Spice Harvest Latte",
     "Espresso, pumpkin spice blend, steamed milk and whipped cream.",
     5.95, True, "Seasonal Specials", "Espresso",
     "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "200ml"), ("Cinnamon", "1 tsp"), ("Brown Sugar Syrup", "20ml"), ("Whipped Cream", "dollop")]),

    ("Citrus Blossom Pour Over",
     "Bright pour over with orange zest and floral honey notes.",
     5.75, False, "Seasonal Specials", "Pour Over",
     "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Orange Zest", "2 tsp"), ("Vanilla Syrup", "10ml")]),

    ("Summer Berry Cold Brew",
     "Cold brew infused with fresh mixed berry compote and oat milk.",
     5.85, True, "Seasonal Specials", "Cold Brew",
     "https://images.unsplash.com/photo-1525968390085-9e87e7b3d83d?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Mixed Berry Compote", "40ml"), ("Oat Milk", "100ml")]),

    ("Winter Spiced Mocha",
     "Espresso, cocoa, cinnamon, and brown sugar with whipped cream.",
     6.25, True, "Seasonal Specials", "Espresso",
     "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "180ml"), ("Cocoa Powder", "2 tsp"), ("Cinnamon", "1 tsp"), ("Brown Sugar Syrup", "20ml"), ("Whipped Cream", "dollop")]),


    # ── Herbal & Wellness ───────────────────────────────────────────────────
    ("Ceremonial Matcha Latte",
     "High-grade matcha whisked with steamed oat milk and vanilla.",
     5.75, True, "Herbal & Wellness", "Pour Over",
     "https://images.unsplash.com/photo-1571657028108-c3d4fc4de5e7?w=500&auto=format&fit=crop&q=60",
     [("Matcha Powder", "2 tsp"), ("Oat Milk", "220ml"), ("Vanilla Syrup", "10ml")]),

    ("Golden Turmeric Latte",
     "Warming blend of turmeric, cinnamon, and almond milk (caffeine-free).",
     5.50, True, "Herbal & Wellness", "Pour Over",
     "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500&auto=format&fit=crop&q=60",
     [("Cinnamon", "1 tsp"), ("Almond Milk", "250ml"), ("Vanilla Syrup", "15ml")]),

    ("Cocoa Wellness Elixir",
     "Antioxidant-rich dark cocoa with oat milk and subtle spices.",
     5.25, True, "Herbal & Wellness", "French Press",
     "https://images.unsplash.com/photo-1504630083234-14187a9aa972?w=500&auto=format&fit=crop&q=60",
     [("Cocoa Powder", "3 tsp"), ("Oat Milk", "220ml"), ("Brown Sugar Syrup", "15ml"), ("Cinnamon", "¼ tsp")]),

    ("Berry Matcha Reviver",
     "Matcha, mixed berry compote, and almond milk for vibrant energy.",
     5.85, True, "Herbal & Wellness", "Pour Over",
     "https://images.unsplash.com/photo-1518831970272-6b43f5e7b1f6?w=500&auto=format&fit=crop&q=60",
     [("Matcha Powder", "2 tsp"), ("Almond Milk", "180ml"), ("Mixed Berry Compote", "30ml")]),


    # ── Blended Frappes ─────────────────────────────────────────────────────
    ("Classic Coffee Frappe",
     "Blended espresso, ice, milk and vanilla with whipped cream.",
     6.25, True, "Blended Frappes", "Espresso",
     "https://images.unsplash.com/photo-1539614474468-f423a2d2270c?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "150ml"), ("Vanilla Syrup", "20ml"), ("Whipped Cream", "dollop")]),

    ("Salted Caramel Frappe",
     "Blended caramel espresso with sea salt and whipped cream.",
     6.50, True, "Blended Frappes", "Espresso",
     "https://images.unsplash.com/photo-1542895470-a3b31e2c7a1a?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "150ml"), ("Caramel Syrup", "35ml"), ("Whipped Cream", "dollop")]),

    ("Chocolate Hazelnut Frappe",
     "Rich mocha and hazelnut blended with ice and oat milk.",
     6.45, True, "Blended Frappes", "Espresso",
     "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Oat Milk", "160ml"), ("Hazelnut Syrup", "25ml"), ("Cocoa Powder", "1 tsp"), ("Whipped Cream", "dollop")]),

    ("Strawberry Matcha Frappe",
     "Blended matcha, berry compote, coconut milk and ice.",
     6.35, True, "Blended Frappes", "Pour Over",
     "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60",
     [("Matcha Powder", "3 tsp"), ("Coconut Milk", "180ml"), ("Mixed Berry Compote", "30ml"), ("Whipped Cream", "dollop")]),
]


# ---------------------------------------------------------------------------
# HELPER — get-or-create pattern
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


def _get_or_create_category(name: str) -> tuple[Category, bool]:
    existing = Category.query.filter_by(name=name).first()
    if existing:
        return existing, False
    cat = Category(name=name)
    db.session.add(cat)
    return cat, True


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
# MAIN SEED
# ---------------------------------------------------------------------------

def seed() -> None:
    flask_app = create_app()
    with flask_app.app_context():

        print("\n=== Lopdrinks DB Seed v2 ===\n")

        # ── Users ────────────────────────────────────────────────────────────
        user_objects: dict[str, User] = {}
        u_created = 0
        for u in USERS:
            obj, created = _get_or_create_user(u)
            if created:
                u_created += 1
            user_objects[u["email"]] = obj
        db.session.flush()
        print(f"  Users          : {u_created} created, {len(USERS) - u_created} skipped")

        admin_user = user_objects["admin@lopdrinks.com"]
        regular_users = [
            user_objects["jane@lopdrinks.com"],
            user_objects["brian@lopdrinks.com"],
            user_objects["sophie@lopdrinks.com"],
        ]

        # ── Categories ───────────────────────────────────────────────────────
        category_map: dict[str, Category] = {}
        c_created = 0
        for cat_name in CATEGORIES:
            obj, created = _get_or_create_category(cat_name)
            if created:
                c_created += 1
            category_map[cat_name] = obj
        db.session.flush()
        print(f"  Categories     : {c_created} created, {len(CATEGORIES) - c_created} skipped")

        # ── Brew Methods ─────────────────────────────────────────────────────
        brew_map: dict[str, BrewMethod] = {}
        bm_created = 0
        for bm_data in BREW_METHODS:
            obj, created = _get_or_create_brew_method(bm_data)
            if created:
                bm_created += 1
            brew_map[bm_data["name"]] = obj
        db.session.flush()
        print(f"  Brew Methods   : {bm_created} created, {len(BREW_METHODS) - bm_created} skipped")

        # ── Ingredients ──────────────────────────────────────────────────────
        ing_map: dict[str, Ingredient] = {}
        ing_created = 0
        for ing_name in INGREDIENTS:
            obj, created = _get_or_create_ingredient(ing_name)
            if created:
                ing_created += 1
            ing_map[ing_name] = obj
        db.session.flush()
        print(f"  Ingredients    : {ing_created} created, {len(INGREDIENTS) - ing_created} skipped")


        # ── Recipes ──────────────────────────────────────────────────────────
        r_created = 0
        r_updated = 0
        recipe_objects: list[Recipe] = []

        for (
            name, description, price, takeaway,
            cat_name, brew_name, image_url, ingredients
        ) in RECIPES:
            category    = category_map[cat_name]
            brew_method = brew_map[brew_name]

            existing = Recipe.query.filter_by(name=name).first()

            if existing:
                # Update all fields so existing records stay in sync
                existing.description   = description
                existing.price         = float(price)
                existing.takeaway      = takeaway
                existing.image_url     = image_url
                existing.brew_method_id = brew_method.id
                existing.category_id   = category.id
                db.session.flush()

                # Re-sync ingredients: wipe and re-add
                RecipeIngredient.query.filter_by(recipe_id=existing.id).delete()
                for ing_name, quantity in ingredients:
                    ingredient = ing_map.get(ing_name)
                    if ingredient:
                        db.session.add(RecipeIngredient(
                            recipe_id=existing.id,
                            ingredient_id=ingredient.id,
                            quantity=quantity,
                        ))

                recipe_objects.append(existing)
                r_updated += 1
                continue

            recipe = Recipe(
                name=name,
                description=description,
                price=float(price),
                takeaway=takeaway,
                image_url=image_url,
                brew_method_id=brew_method.id,
                category_id=category.id,
                created_by=admin_user.id,
            )
            db.session.add(recipe)
            db.session.flush()  # populate recipe.id before adding children

            for ing_name, quantity in ingredients:
                ingredient = ing_map.get(ing_name)
                if ingredient:
                    db.session.add(RecipeIngredient(
                        recipe_id=recipe.id,
                        ingredient_id=ingredient.id,
                        quantity=quantity,
                    ))

            recipe_objects.append(recipe)
            r_created += 1

        db.session.flush()
        print(f"  Recipes        : {r_created} created, {r_updated} updated")

        # ── Sample Orders ────────────────────────────────────────────────────
        ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]

        o_created = 0
        existing_orders = Order.query.count()

        if existing_orders == 0 and recipe_objects:
            random.seed(42)  # deterministic for repeatability
            for i in range(20):
                user    = random.choice(regular_users)
                recipe  = random.choice(recipe_objects)
                qty     = random.randint(1, 4)
                status  = random.choice(ORDER_STATUSES)
                days_ago = random.randint(0, 60)

                db.session.add(Order(
                    user_id=user.id,
                    recipe_id=recipe.id,
                    quantity=qty,
                    unit_price=recipe.price,
                    status=status,
                    ordered_at=datetime.utcnow() - timedelta(days=days_ago),
                ))
                o_created += 1
            print(f"  Orders         : {o_created} created")
        else:
            print(f"  Orders         : skipped ({existing_orders} already exist)")

        # ── Commit everything ─────────────────────────────────────────────────
        db.session.commit()

        print("\n=== Seed complete ===")
        print(f"\n  Recipes by category:")
        for cat_name in CATEGORIES:
            count = sum(1 for r in RECIPES if r[4] == cat_name)
            print(f"    {cat_name:<25} {count} recipes")
        print(f"\n  Admin  : admin@lopdrinks.com  /  Admin1234!")
        print(f"  Users  : jane / brian / sophie  @lopdrinks.com  /  User1234!\n")


if __name__ == "__main__":
    seed()
