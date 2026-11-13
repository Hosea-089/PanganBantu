import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend import main
from backend.models import Base, Ingredient, Recipe, RecipeIngredient
from backend.seed import seed


DEFAULT_PREFS = {'liked': [], 'avoided': [], 'allergies': [], 'diet': 'Bebas'}


@pytest.fixture
def client(monkeypatch):
    engine = create_engine(
        'sqlite://',
        connect_args={'check_same_thread': False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(engine, expire_on_commit=False)

    def override_db():
        with session_factory() as session:
            yield session

    monkeypatch.setitem(main.app.dependency_overrides, main.db, override_db)
    seed(session_factory)
    with TestClient(main.app) as test_client:
        yield test_client, session_factory
    engine.dispose()


def register(client, name, email):
    response = client.post(
        '/api/auth/register',
        json={'name': name, 'email': email, 'password': 'correct-horse-1'},
    )
    assert response.status_code == 201
    return response.json()


def auth(token):
    return {'Authorization': f'Bearer {token}'}


def valid_kitchen():
    return {'stock': {'beras': 100}, 'prefs': DEFAULT_PREFS, 'plan': None, 'checked': {}}


def test_registration_login_and_owner_scoped_kitchen(client):
    api, _ = client
    alice = register(api, 'Alice', 'alice@example.com')
    bob = register(api, 'Bob', 'bob@example.com')
    alice_headers = auth(alice['access_token'])
    bob_headers = auth(bob['access_token'])

    assert api.get('/api/v1/catalog').status_code == 200
    assert api.get('/api/auth/me').status_code == 401
    assert api.get('/api/v1/me/kitchen').status_code == 401
    assert api.get('/api/auth/me', headers=alice_headers).json() == {
        'name': 'Alice',
        'email': 'alice@example.com',
    }
    assert api.get('/api/v1/me/kitchen', headers=alice_headers).json() == {
        'stock': {},
        'prefs': DEFAULT_PREFS,
        'plan': None,
        'checked': {},
    }

    kitchen = valid_kitchen()
    assert api.put('/api/v1/me/kitchen', headers=alice_headers, json=kitchen).json() == kitchen
    assert api.get('/api/v1/me/kitchen', headers=alice_headers).json() == kitchen
    plan = {
        'mode': 'Individu',
        'people': 1,
        'days': 1,
        'start': '2026-10-29',
        'budget': 150000,
        'menu': [['1', '3', '5']],
        'prefs': DEFAULT_PREFS,
    }
    with_plan = {**kitchen, 'plan': plan}
    assert api.put('/api/v1/me/kitchen', headers=alice_headers, json=with_plan).json()['plan'] == plan
    assert api.get('/api/v1/me/kitchen', headers=alice_headers).json()['plan'] == plan
    assert api.get('/api/v1/me/kitchen', headers=bob_headers).json()['stock'] == {}
    assert api.post(
        '/api/auth/login',
        json={'identifier': 'ALICE', 'password': 'correct-horse-1'},
    ).status_code == 200
    assert api.post(
        '/api/auth/login',
        json={'identifier': 'alice@example.com', 'password': 'incorrect-password'},
    ).status_code == 401


def test_registration_rejects_duplicate_identity_and_invalid_password(client):
    api, _ = client
    register(api, 'Alice', 'alice@example.com')
    assert api.post(
        '/api/auth/register',
        json={'name': 'Alice 2', 'email': 'alice@example.com', 'password': 'correct-horse-1'},
    ).status_code == 409
    assert api.post(
        '/api/auth/register',
        json={'name': 'aLiCe', 'email': 'other@example.com', 'password': 'correct-horse-1'},
    ).status_code == 409
    assert api.post(
        '/api/auth/register',
        json={'name': 'Bob', 'email': 'bob@example.com', 'password': 'short'},
    ).status_code == 422
    assert api.post(
        '/api/auth/register',
        json={'name': 'Bob', 'email': 'bob@example.com', 'password': 'é' * 40},
    ).status_code == 422


def test_kitchen_rejects_invalid_stock_preferences_checks_and_plan(client):
    api, _ = client
    account = register(api, 'Alice', 'alice@example.com')
    headers = auth(account['access_token'])
    base = valid_kitchen()

    for stock in ({'unknown': 1}, {'beras': -1}, {'telur': 0.5}, {'beras': float('nan')}):
        response = api.put(
            '/api/v1/me/kitchen',
            headers=headers,
            json={**base, 'stock': stock},
        )
        assert response.status_code == 422

    response = api.put(
        '/api/v1/me/kitchen',
        headers=headers,
        json={**base, 'prefs': {**DEFAULT_PREFS, 'avoided': ['unknown']}},
    )
    assert response.status_code == 422
    response = api.put(
        '/api/v1/me/kitchen',
        headers=headers,
        json={**base, 'checked': {'unknown': True}},
    )
    assert response.status_code == 422
    invalid_plan = {
        'mode': 'Individu',
        'people': 1,
        'days': 1,
        'start': '2026-10-29',
        'budget': 150000,
        'menu': [['3', '3', '5']],
        'prefs': DEFAULT_PREFS,
    }
    assert api.put(
        '/api/v1/me/kitchen',
        headers=headers,
        json={**base, 'plan': invalid_plan},
    ).status_code == 422


def test_profile_rename_is_owner_scoped_and_unique(client):
    api, _ = client
    alice = register(api, 'Alice', 'alice@example.com')
    bob = register(api, 'Bob', 'bob@example.com')
    assert api.patch(
        '/api/auth/me',
        headers=auth(alice['access_token']),
        json={'name': 'Alice Baru'},
    ).json()['name'] == 'Alice Baru'
    assert api.patch(
        '/api/auth/me',
        headers=auth(bob['access_token']),
        json={'name': 'alice baru'},
    ).status_code == 409
    assert api.get('/api/auth/me', headers=auth(bob['access_token'])).json()['name'] == 'Bob'


def test_seed_catalog_provenance_prices_and_per_serving_nutrition(client):
    api, session_factory = client
    first = api.get('/api/v1/catalog').json()
    assert len(first['ingredients']) == 8
    assert len(first['recipes']) == 6

    egg = first['ingredients']['telur']
    assert egg['price'][0] == pytest.approx(33732 * 56.18 / 1000, abs=0.005)
    assert 'bps.go.id/id/publication/' in egg['priceSource']['sourceUrl']
    assert egg['priceSource']['referenceQuantity'] == 1
    assert egg['priceSource']['referenceUnit'] == 'kg'
    assert egg['priceSource']['unitConversionFactor'] == pytest.approx(0.05618)
    assert 'FoodData Central' in egg['priceSource']['unitConversion']
    assert egg['priceSource']['unitConversionSourceUrl'].startswith('https://fdc.nal.usda.gov/')
    assert egg['nutritionSource']['sourceRecord'] == 'ER002'
    assert egg['nutritionSource']['ediblePortionPercent'] == 89
    assert first['recipes'][0]['nutrition'][0] > 0

    original_nutrition = first['recipes'][0]['nutrition'][0]
    with session_factory() as session:
        rice = session.scalar(select(Ingredient).where(Ingredient.name == 'Beras'))
        rice.price_min = 20000
        rice.price_max = 22000
        rice.energy = 400
        session.commit()
    seed(session_factory)
    second = api.get('/api/v1/catalog').json()
    assert second['ingredients']['beras']['price'] == [20, 22]
    assert second['ingredients']['beras']['nutrition']['energy'] == 400
    assert any('beras' in recipe['items'] for recipe in second['recipes'])
    assert second['recipes'][0]['nutrition'][0] != original_nutrition

def test_database_added_ingredient_is_used_without_static_mapping(client):
    api, session_factory = client
    with session_factory() as session:
        labu = Ingredient(
            slug='labu', name='Labu', unit='g', category='Sayuran', allergens='[]', animal=False,
            price_min=10000, price_max=12000, price_raw_unit='kg', price_reference_quantity=1,
            price_to_unit_factor=0.001, price_conversion_source='SI conversion: 1 kg = 1000 g',
            price_conversion_source_url='https://www.nist.gov/pml/owm/si-units',
            price_source='BPS test', price_source_url='https://www.bps.go.id/', price_region='Nasional',
            price_from='2025-01-01', price_to='2025-12-31', price_updated='2026-04-24',
            nutrition_source='TKPI test', nutrition_source_url='https://repository.kemkes.go.id/book/668',
            nutrition_record='DR-LABU', serving_size_g=100, bdd_percent=100,
            energy=26, protein=1, carbohydrate=6, fat=0.1, fiber=0.5,
        )
        session.add(labu)
        session.flush()
        session.add(Recipe(id=7, name='Sup Labu', slot='lunch', servings=1,
                           image='/assets/sup-sayur.jpg', time=20,
                           instructions='Cuci labu. Masak hingga empuk.'))
        session.add(RecipeIngredient(recipe_id=7, ingredient_id=labu.id,
                                     quantity=100, unit='g', grams=100))
        session.commit()
    seed(session_factory)

    catalog_data = api.get('/api/v1/catalog').json()
    assert 'labu' in catalog_data['ingredients']
    recipe = next(recipe for recipe in catalog_data['recipes'] if recipe['id'] == '7')
    assert recipe['items'] == {'labu': 100}
    alice = register(api, 'Alice', 'alice@example.com')
    kitchen = {
        **valid_kitchen(),
        'stock': {'labu': 20},
        'prefs': {**DEFAULT_PREFS, 'liked': ['labu']},
        'checked': {'labu': True},
    }
    assert api.put('/api/v1/me/kitchen', headers=auth(alice['access_token']), json=kitchen).json() == kitchen


def test_catalog_excludes_unpriced_ingredients_and_dependent_recipes(client):
    api, session_factory = client
    with session_factory() as session:
        rice = session.scalar(select(Ingredient).where(Ingredient.name == 'Beras'))
        rice.price_min = 0
        session.commit()
    catalog_data = api.get('/api/v1/catalog').json()
    assert 'beras' not in catalog_data['ingredients']
    assert all('beras' not in recipe['items'] for recipe in catalog_data['recipes'])




def test_seed_is_idempotent(client):
    _, session_factory = client
    seed(session_factory)
    seed(session_factory)
    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(Ingredient)) == 8
        assert session.scalar(select(func.count()).select_from(Recipe)) == 6
        assert session.scalar(select(func.count()).select_from(RecipeIngredient)) == 22
