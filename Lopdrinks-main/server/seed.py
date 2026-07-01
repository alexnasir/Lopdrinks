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
    ("Classic Espresso",
     "Pure, unadulterated espresso — intense and velvety with a golden crema.",
     3.50, False, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots")]),

    ("Flat White",
     "A ristretto-based flat white with silky steamed whole milk.",
     4.25, True, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "120ml")]),

    ("Cappuccino",
     "Equal parts espresso, steamed milk, and thick foam — a timeless Italian classic.",
     4.00, True, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1534687992762-bf7085a4ab23?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "100ml"), ("Whipped Cream", "dollop")]),

    ("Americano",
     "Espresso diluted with hot water — bold flavour, lighter body.",
     3.75, True, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1551030173-122aabc4489c?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots")]),

    ("Pour Over Black",
     "Single-origin beans hand-poured for a bright, aromatic black coffee.",
     4.50, False, "Hot Classics", "Pour Over",
     "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot")]),

    ("French Press Classic",
     "Full-immersion brew yielding a bold, earthy cup with natural oils.",
     4.25, False, "Hot Classics", "French Press",
     "https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Brown Sugar Syrup", "15ml")]),

    ("Cortado",
     "Equal shots of espresso and warm milk — cuts the acidity, keeps the strength.",
     4.00, True, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "60ml")]),

    ("Macchiato",
     "Espresso 'stained' with a spoonful of dense microfoam.",
     3.75, True, "Hot Classics", "Espresso",
     "https://images.unsplash.com/photo-1560674360-0b2e4a57d6b6?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "30ml")]),


    # ── Cold Brews ──────────────────────────────────────────────────────────
    ("Original Cold Brew",
     "18-hour cold-steeped concentrate — smooth, chocolatey, and ice-cold.",
     5.00, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Brown Sugar Syrup", "10ml")]),

    ("Vanilla Sweet Cream Cold Brew",
     "Cold brew topped with house-made vanilla sweet cream.",
     5.50, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1575443348576-5b54e9a51b2a?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Vanilla Syrup", "20ml"), ("Whole Milk", "60ml")]),

    ("Cold Brew Tonic",
     "Cold brew over sparkling tonic water — effervescent and refreshing.",
     5.75, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Orange Zest", "1 tsp")]),

    ("Coconut Cold Brew",
     "Silky cold brew blended with coconut milk and a touch of caramel.",
     5.75, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1554058446-3b10d5ebfb00?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Coconut Milk", "150ml"), ("Caramel Syrup", "15ml")]),

    ("Cold Brew Lemonade",
     "Cold brew meets fresh lemon — tart, sweet, and caffeinated.",
     5.50, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Orange Zest", "2 tsp"), ("Vanilla Syrup", "10ml")]),

    ("Nitro Cold Brew",
     "Nitrogen-infused cold brew — cascading pour, creamy stout-like texture.",
     6.00, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Brown Sugar Syrup", "5ml")]),

    ("Iced Americano",
     "Double espresso over ice, topped with chilled water.",
     4.25, True, "Cold Brews", "Espresso",
     "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots")]),

    ("Cold Brew Berry Splash",
     "Cold brew shaken with mixed berry compote and oat milk.",
     5.75, True, "Cold Brews", "Cold Brew",
     "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Oat Milk", "100ml"), ("Mixed Berry Compote", "30ml")]),


    # ── Specialty Lattes ────────────────────────────────────────────────────
    ("Caramel Latte",
     "Espresso with steamed milk and rich house caramel syrup.",
     5.25, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "200ml"), ("Caramel Syrup", "25ml")]),

    ("Hazelnut Latte",
     "Warm espresso latte with toasted hazelnut and velvety oat milk.",
     5.25, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Oat Milk", "200ml"), ("Hazelnut Syrup", "25ml")]),

    ("Vanilla Oat Latte",
     "Smooth oat milk latte sweetened with pure Madagascan vanilla.",
     5.00, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Oat Milk", "200ml"), ("Vanilla Syrup", "20ml")]),

    ("Cinnamon Brown Sugar Latte",
     "Espresso, steamed milk, brown sugar syrup, and a cinnamon dusting.",
     5.50, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "180ml"), ("Brown Sugar Syrup", "20ml"), ("Cinnamon", "½ tsp")]),

    ("Coconut Almond Latte",
     "Dairy-free latte with half coconut, half almond milk and vanilla.",
     5.50, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1524781121596-2d740d40a66f?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Coconut Milk", "100ml"), ("Almond Milk", "100ml"), ("Vanilla Syrup", "15ml")]),

    ("Mocha Latte",
     "Rich espresso, steamed milk, and dark cocoa — dessert in a cup.",
     5.50, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1534432182912-342209973b9f?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "180ml"), ("Cocoa Powder", "2 tsp"), ("Caramel Syrup", "10ml")]),

    ("Rose Water Latte",
     "Delicate floral latte with oat milk and a hint of vanilla.",
     5.75, False, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Oat Milk", "200ml"), ("Vanilla Syrup", "15ml"), ("Whipped Cream", "dollop")]),

    ("Salted Caramel Latte",
     "Sweet-salty balance of espresso, caramel syrup, and steamed milk.",
     5.50, True, "Specialty Lattes", "Espresso",
     "https://images.unsplash.com/photo-1519985176271-2b2b60887387?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "200ml"), ("Caramel Syrup", "30ml"), ("Cinnamon", "pinch")]),


    # ── Seasonal Specials ───────────────────────────────────────────────────
    ("Pumpkin Spice Latte",
     "Autumn in a cup — espresso, pumpkin spice, and steamed whole milk.",
     5.75, True, "Seasonal Specials", "Espresso",
     "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "200ml"), ("Cinnamon", "1 tsp"), ("Brown Sugar Syrup", "20ml"), ("Whipped Cream", "dollop")]),

    ("Orange Blossom Pour Over",
     "Spring pour-over with bright citrus aroma and floral finish.",
     5.50, False, "Seasonal Specials", "Pour Over",
     "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Orange Zest", "2 tsp"), ("Vanilla Syrup", "10ml")]),

    ("Berry Summer Cold Brew",
     "Refreshing summer cold brew bursting with seasonal berries.",
     5.75, True, "Seasonal Specials", "Cold Brew",
     "https://images.unsplash.com/photo-1525968390085-9e87e7b3d83d?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Mixed Berry Compote", "40ml"), ("Oat Milk", "100ml")]),

    ("Holiday Spiced Mocha",
     "Winter warmer with espresso, cocoa, cinnamon, and brown sugar.",
     6.00, True, "Seasonal Specials", "Espresso",
     "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "180ml"), ("Cocoa Powder", "2 tsp"), ("Cinnamon", "1 tsp"), ("Brown Sugar Syrup", "20ml"), ("Whipped Cream", "dollop")]),

    ("Iced Citrus Espresso Tonic",
     "A bubbly summer special — espresso over tonic with orange zest.",
     5.50, True, "Seasonal Specials", "Espresso",
     "https://images.unsplash.com/photo-1543335781-9a3c90f9a70c?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Orange Zest", "1 tsp"), ("Vanilla Syrup", "10ml")]),

    ("Hazelnut Harvest Latte",
     "Autumn hazelnut latte with brown sugar and cinnamon warmth.",
     5.75, True, "Seasonal Specials", "Espresso",
     "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "180ml"), ("Hazelnut Syrup", "25ml"), ("Cinnamon", "½ tsp"), ("Brown Sugar Syrup", "15ml")]),

    ("Coconut Summer Frappe",
     "Blended iced coconut milk espresso drink for hot-season refreshment.",
     6.25, True, "Seasonal Specials", "Cold Brew",
     "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Coconut Milk", "200ml"), ("Caramel Syrup", "20ml"), ("Whipped Cream", "dollop")]),

    ("Valentine Berry Latte",
     "Valentine's special — rose-tinted berry latte with almond milk.",
     6.00, True, "Seasonal Specials", "Espresso",
     "https://images.unsplash.com/photo-1532499016263-fb2d7e5346eb?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Almond Milk", "180ml"), ("Mixed Berry Compote", "30ml"), ("Vanilla Syrup", "10ml")]),


    # ── Herbal & Wellness ───────────────────────────────────────────────────
    ("Matcha Oat Latte",
     "Ceremonial-grade matcha whisked with steamed oat milk and vanilla.",
     5.50, True, "Herbal & Wellness", "Pour Over",
     "https://images.unsplash.com/photo-1571657028108-c3d4fc4de5e7?w=500&auto=format&fit=crop&q=60",
     [("Matcha Powder", "2 tsp"), ("Oat Milk", "220ml"), ("Vanilla Syrup", "10ml")]),

    ("Matcha Coconut Latte",
     "Earthy matcha meets tropical coconut milk for a dairy-free wellness boost.",
     5.75, True, "Herbal & Wellness", "Pour Over",
     "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=60",
     [("Matcha Powder", "2 tsp"), ("Coconut Milk", "220ml"), ("Brown Sugar Syrup", "15ml")]),

    ("Golden Cinnamon Latte",
     "Caffeine-free warming blend of cinnamon, vanilla, and almond milk.",
     5.25, False, "Herbal & Wellness", "Pour Over",
     "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500&auto=format&fit=crop&q=60",
     [("Cinnamon", "1 tsp"), ("Almond Milk", "250ml"), ("Vanilla Syrup", "15ml"), ("Brown Sugar Syrup", "10ml")]),

    ("Cocoa Wellness Brew",
     "Dark cocoa steeped with oat milk and brown sugar — antioxidant rich.",
     5.00, True, "Herbal & Wellness", "French Press",
     "https://images.unsplash.com/photo-1504630083234-14187a9aa972?w=500&auto=format&fit=crop&q=60",
     [("Cocoa Powder", "3 tsp"), ("Oat Milk", "220ml"), ("Brown Sugar Syrup", "15ml"), ("Cinnamon", "¼ tsp")]),

    ("Berry Matcha Energiser",
     "Matcha blended with berry compote and almond milk — vibrant and energising.",
     5.75, True, "Herbal & Wellness", "Pour Over",
     "https://images.unsplash.com/photo-1518831970272-6b43f5e7b1f6?w=500&auto=format&fit=crop&q=60",
     [("Matcha Powder", "2 tsp"), ("Almond Milk", "180ml"), ("Mixed Berry Compote", "25ml")]),

    ("Spiced Almond Brew",
     "Cold almond milk brew with cinnamon and hazelnut — nutty and warming.",
     5.25, True, "Herbal & Wellness", "Cold Brew",
     "https://images.unsplash.com/photo-1534329539061-64b56c47a5e8?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Almond Milk", "200ml"), ("Hazelnut Syrup", "15ml"), ("Cinnamon", "½ tsp")]),

    ("Matcha Honey Latte",
     "Matcha latte sweetened naturally with honey-like vanilla and oat milk.",
     5.50, True, "Herbal & Wellness", "Pour Over",
     "https://images.unsplash.com/photo-1525619967554-16d4c8f2e9cc?w=500&auto=format&fit=crop&q=60",
     [("Matcha Powder", "2 tsp"), ("Oat Milk", "200ml"), ("Vanilla Syrup", "20ml"), ("Brown Sugar Syrup", "10ml")]),

    ("Citrus Matcha Refresh",
     "Iced matcha with orange zest for a zingy, revitalising afternoon drink.",
     5.75, True, "Herbal & Wellness", "Pour Over",
     "https://images.unsplash.com/photo-1537147441880-8b0f543039b7?w=500&auto=format&fit=crop&q=60",
     [("Matcha Powder", "2 tsp"), ("Oat Milk", "180ml"), ("Orange Zest", "1 tsp"), ("Vanilla Syrup", "10ml")]),


    # ── Blended Frappes ─────────────────────────────────────────────────────
    ("Classic Coffee Frappe",
     "Blended espresso, ice, whole milk, and vanilla — café-style frappe.",
     6.00, True, "Blended Frappes", "Espresso",
     "https://images.unsplash.com/photo-1539614474468-f423a2d2270c?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "150ml"), ("Vanilla Syrup", "20ml"), ("Whipped Cream", "dollop")]),

    ("Caramel Frappe",
     "Icy-smooth blended caramel frappe with whipped cream on top.",
     6.25, True, "Blended Frappes", "Espresso",
     "https://images.unsplash.com/photo-1542895470-a3b31e2c7a1a?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "150ml"), ("Caramel Syrup", "35ml"), ("Whipped Cream", "dollop")]),

    ("Mocha Frappe",
     "Espresso, cocoa, and milk blended over ice — indulgent chocolate coffee.",
     6.25, True, "Blended Frappes", "Espresso",
     "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "150ml"), ("Cocoa Powder", "2 tsp"), ("Caramel Syrup", "15ml"), ("Whipped Cream", "dollop")]),

    ("Berry Oat Frappe",
     "Dairy-free oat milk frappe blended with berry compote and vanilla.",
     6.25, True, "Blended Frappes", "Cold Brew",
     "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Oat Milk", "180ml"), ("Mixed Berry Compote", "35ml"), ("Vanilla Syrup", "15ml"), ("Whipped Cream", "dollop")]),

    ("Hazelnut Frappe",
     "Blended hazelnut and espresso frappe — nutty, creamy, and perfectly sweet.",
     6.25, True, "Blended Frappes", "Espresso",
     "https://images.unsplash.com/photo-1504630083234-14187a9aa972?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Whole Milk", "150ml"), ("Hazelnut Syrup", "35ml"), ("Whipped Cream", "dollop")]),

    ("Matcha Frappe",
     "Ceremonial matcha blended with coconut milk and ice — a green goddess.",
     6.00, True, "Blended Frappes", "Pour Over",
     "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60",
     [("Matcha Powder", "3 tsp"), ("Coconut Milk", "180ml"), ("Brown Sugar Syrup", "20ml"), ("Whipped Cream", "dollop")]),

    ("Cinnamon Spice Frappe",
     "Spiced cinnamon-caramel blended frappe with almond milk.",
     6.00, True, "Blended Frappes", "Cold Brew",
     "https://images.unsplash.com/photo-1527515545081-5db01a295b4b?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "1 shot"), ("Almond Milk", "180ml"), ("Caramel Syrup", "20ml"), ("Cinnamon", "1 tsp"), ("Whipped Cream", "dollop")]),

    ("Vanilla Cloud Frappe",
     "Dreamy blended vanilla frappe with oat milk and a cloud of whipped cream.",
     6.00, True, "Blended Frappes", "Espresso",
     "https://images.unsplash.com/photo-1530047139084-8babc4f458a1?w=500&auto=format&fit=crop&q=60",
     [("Espresso Shot", "2 shots"), ("Oat Milk", "150ml"), ("Vanilla Syrup", "30ml"), ("Whipped Cream", "generous dollop")]),
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
        r_skipped = 0
        recipe_objects: list[Recipe] = []

        for (
            name, description, price, takeaway,
            cat_name, brew_name, image_url, ingredients
        ) in RECIPES:
            if Recipe.query.filter_by(name=name).first():
                r_skipped += 1
                # Still collect for orders seeding
                recipe_objects.append(Recipe.query.filter_by(name=name).first())
                continue

            category   = category_map[cat_name]
            brew_method = brew_map[brew_name]

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
        print(f"  Recipes        : {r_created} created, {r_skipped} skipped")

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
