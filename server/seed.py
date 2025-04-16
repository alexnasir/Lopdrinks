from flask import Flask
from extensions import db
from model import Recipe
import re

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///coffee.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Dictionary mapping recipe descriptions to new Unsplash URLs
recipe_image_urls = {
    ('aromatic', 'coastal vibes', 'caramel'): 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('aromatic', 'coastal vibes', 'spice'): 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('aromatic', 'highland farms', 'berry'): 'https://images.unsplash.com/photo-1518831970272-6b43f5e7b1f6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('aromatic', 'highland farms', 'caramel'): 'https://images.unsplash.com/photo-1494314671908-399b18174975?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('aromatic', 'highland farms', 'citrus'): 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('aromatic', 'highland farms', 'spice'): 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('aromatic', 'lively markets', 'berry'): 'https://images.unsplash.com/photo-1534687992762-bf7085a4ab23?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('aromatic', 'lively markets', 'caramel'): 'https://images.unsplash.com/photo-1524350876685-2740ff866b43?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('aromatic', 'lively markets', 'citrus'): 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('aromatic', 'lively markets', 'spice'): 'https://images.unsplash.com/photo-1510882272208-7082f0b8e2c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('aromatic', 'urban cafes', 'berry'): 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('aromatic', 'urban cafes', 'citrus'): 'https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('bold', 'coastal vibes', 'caramel'): 'https://images.unsplash.com/photo-1504630083234-14187a9aa972?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('bold', 'coastal vibes', 'citrus'): 'https://images.unsplash.com/photo-1515281780071-6e2af4d6eb93?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('bold', 'highland farms', 'caramel'): 'https://images.unsplash.com/photo-1515444664136-3ce4f68a6f8d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('bold', 'highland farms', 'citrus'): 'https://images.unsplash.com/photo-1521302080334-4b8f8a0fb1fd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('bold', 'lively markets', 'berry'): 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('bold', 'lively markets', 'citrus'): 'https://images.unsplash.com/photo-1517935706611-09a8703d6764?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('bold', 'lively markets', 'spice'): 'https://images.unsplash.com/photo-1518972559570-7cc94e7b5059?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('bold', 'urban cafes', 'berry'): 'https://images.unsplash.com/photo-1518057111178-664705b719c8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('bold', 'urban cafes', 'caramel'): 'https://images.unsplash.com/photo-1518425094428-3a56f2ae5e02?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('bold', 'urban cafes', 'citrus'): 'https://images.unsplash.com/photo-1519655836141-48e8b7f02a3d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('bold', 'urban cafes', 'spice'): 'https://images.unsplash.com/photo-1519985176271-2b2b60887387?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'coastal vibes', 'berry'): 'https://images.unsplash.com/photo-1521017432405-2d95966f6d6d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'coastal vibes', 'citrus'): 'https://images.unsplash.com/photo-1522039557180-a7226728a515?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'coastal vibes', 'spice'): 'https://images.unsplash.com/photo-1523301464347-3c0e8d2d3009?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'highland farms', 'caramel'): 'https://images.unsplash.com/photo-1524781121596-2d740d40a66f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'highland farms', 'citrus'): 'https://images.unsplash.com/photo-1525619967554-16d4c8f2e9cc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'highland farms', 'spice'): 'https://images.unsplash.com/photo-1525738761268-0e30ed3e06f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'lively markets', 'berry'): 'https://images.unsplash.com/photo-1525968390085-9e87e7b3d83d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'lively markets', 'caramel'): 'https://images.unsplash.com/photo-1527515545081-5db01a295b4b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'lively markets', 'citrus'): 'https://images.unsplash.com/photo-1528711514960-1b7feda2e236?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'lively markets', 'spice'): 'https://images.unsplash.com/photo-1530047139084-8babc4f458a1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'urban cafes', 'berry'): 'https://images.unsplash.com/photo-1530595546156-8d362e5e6d37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'urban cafes', 'caramel'): 'https://images.unsplash.com/photo-1530637843609-7e9ae91e0d27?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'urban cafes', 'citrus'): 'https://images.unsplash.com/photo-1531948022917-7b7f8e0c7b94?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('smooth', 'urban cafes', 'spice'): 'https://images.unsplash.com/photo-1531951397688-9e8f3c3c7e1b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'coastal vibes', 'berry'): 'https://images.unsplash.com/photo-1532499016263-fb2d7e5346eb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'coastal vibes', 'caramel'): 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'coastal vibes', 'citrus'): 'https://images.unsplash.com/photo-1534099008685-02b54df81f77?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'highland farms', 'berry'): 'https://images.unsplash.com/photo-1534329539061-64b56c47a5e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'highland farms', 'caramel'): 'https://images.unsplash.com/photo-1534432182912-342209973b9f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'highland farms', 'spice'): 'https://images.unsplash.com/photo-1535916707405-7e2f6abcab66?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'lively markets', 'berry'): 'https://images.unsplash.com/photo-1537147441880-8b0f543039b7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'lively markets', 'caramel'): 'https://images.unsplash.com/photo-1539616945140-e3968bf6666f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'lively markets', 'citrus'): 'https://images.unsplash.com/photo-1541167760492-006b07b3cbec?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'lively markets', 'spice'): 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'urban cafes', 'berry'): 'https://images.unsplash.com/photo-1542894702-c5e1926df4aa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'urban cafes', 'caramel'): 'https://images.unsplash.com/photo-1542995470-870e4e9f84d0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ('zesty', 'urban cafes', 'citrus'): 'https://images.unsplash.com/photo-1543335781-9a3c90f9a70c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
}

def update_recipe_image_urls():
    with app.app_context():
        recipes = Recipe.query.all()
        if not recipes:
            print("No recipes found to update.")
            return
        
        updated_count = 0
        for recipe in recipes:
            # Parse description to extract profile, inspiration, flavor
            match = re.match(
                r"A (\w+) coffee inspired by Kenya’s ([\w\s]+)\. Features notes of (\w+)\.",
                recipe.description
            )
            if match:
                profile, inspiration, flavor = match.groups()
                # Get new image URL from dictionary
                new_image_url = recipe_image_urls.get(
                    (profile.lower(), inspiration.lower(), flavor.lower()),
                    'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
                )
                if recipe.image_url != new_image_url:
                    recipe.image_url = new_image_url
                    updated_count += 1
        
        db.session.commit()
        print(f"Updated image URLs for {updated_count} recipes")

if __name__ == '__main__':
    update_recipe_image_urls()