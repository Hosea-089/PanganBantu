import json
import math
import os
from datetime import date, datetime, timedelta, timezone
from typing import Literal
from secrets import token_urlsafe

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, EmailStr, Field, StrictBool, StrictStr, field_validator, model_validator
from sqlalchemy import create_engine, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from .models import Ingredient, Kitchen, Recipe, RecipeIngredient, User

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./panganbantu.db')
APP_ENV = os.getenv('APP_ENV', 'development').lower()
JWT_SECRET = os.getenv('JWT_SECRET') or ('' if APP_ENV == 'production' else token_urlsafe(48))
if not JWT_SECRET or (
    APP_ENV == 'production'
    and (len(JWT_SECRET) < 32 or JWT_SECRET.lower().startswith('replace-this-'))
):
    raise RuntimeError('Production requires a non-placeholder JWT_SECRET with at least 32 characters.')
engine = create_engine(
    DATABASE_URL,
    **({'connect_args': {'check_same_thread': False}} if DATABASE_URL.startswith('sqlite') else {}),
)
Sessions = sessionmaker(engine, expire_on_commit=False)
app = FastAPI(title='PanganBantu API')
bearer = HTTPBearer(auto_error=False)

SLOT_NAMES = ('breakfast', 'lunch', 'dinner')
FIELDS = ('energy', 'protein', 'carbohydrate', 'fat', 'fiber')
SUPPORTED_UNITS = frozenset({'g', 'ml', 'butir'})
DEFAULT_PREFS = {'liked': [], 'avoided': [], 'allergies': [], 'diet': 'Bebas'}


def db():
    with Sessions() as session:
        yield session


def auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    session: Session = Depends(db),
) -> User:
    if not credentials:
        raise HTTPException(401, 'Authentication required', headers={'WWW-Authenticate': 'Bearer'})
    try:
        user_id = int(jwt.decode(credentials.credentials, JWT_SECRET, algorithms=['HS256'])['sub'])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        raise HTTPException(401, 'Invalid or expired token', headers={'WWW-Authenticate': 'Bearer'})
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(401, 'Invalid token', headers={'WWW-Authenticate': 'Bearer'})
    return user


class Payload(BaseModel):
    model_config = ConfigDict(extra='forbid')


class Register(Payload):
    name: str = Field(min_length=1, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator('name')
    @classmethod
    def trim_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError('Username cannot be blank.')
        return value

    @field_validator('password')
    @classmethod
    def bcrypt_limit(cls, value: str) -> str:
        if len(value.encode('utf-8')) > 72:
            raise ValueError('Password exceeds bcrypt 72-byte limit.')
        return value


class Login(Payload):
    identifier: str = Field(min_length=1, max_length=320)
    password: str = Field(min_length=1)

    @field_validator('identifier')
    @classmethod
    def trim_identifier(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError('Username or email cannot be blank.')
        return value

    @field_validator('password')
    @classmethod
    def bcrypt_limit(cls, value: str) -> str:
        if len(value.encode('utf-8')) > 72:
            raise ValueError('Password exceeds bcrypt 72-byte limit.')
        return value


class Patch(Payload):
    name: str | None = Field(default=None, min_length=1, max_length=30)

    @field_validator('name')
    @classmethod
    def trim_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError('Username cannot be blank.')
        return value


class PreferencesBody(Payload):
    liked: list[StrictStr]
    avoided: list[StrictStr]
    allergies: list[Literal['Telur', 'Kedelai', 'Gluten', 'Susu', 'Kacang tanah', 'Ikan', 'Kerang']]
    diet: Literal['Bebas', 'Vegetarian', 'Vegan']

class PlanBody(Payload):
    mode: Literal['Individu', 'Keluarga']
    people: int = Field(ge=1, le=100)
    days: int = Field(ge=1, le=7)
    start: date
    budget: float = Field(gt=0, le=9007199254740991)
    menu: list[list[StrictStr]]
    prefs: PreferencesBody
    alternative: bool | None = None

    @field_validator('budget')
    @classmethod
    def finite_budget(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError('Budget must be finite.')
        return value

    @model_validator(mode='after')
    def validate_plan_shape(self):
        if self.mode == 'Individu' and self.people != 1:
            raise ValueError('Individual plans must have exactly one person.')
        if len(self.menu) != self.days or any(len(day) != 3 for day in self.menu):
            raise ValueError('Plan menu must contain three meals for every day.')
        return self


class KitchenBody(Payload):
    stock: dict[StrictStr, float]
    prefs: PreferencesBody
    plan: PlanBody | None
    checked: dict[StrictStr, StrictBool]

    @field_validator('stock', mode='before')
    @classmethod
    def reject_non_numeric_stock(cls, value):
        if isinstance(value, dict) and any(
            isinstance(quantity, bool) or not isinstance(quantity, (int, float))
            for quantity in value.values()
        ):
            raise ValueError('Stock quantities must be numbers.')
        return value

    @field_validator('stock')
    @classmethod
    def valid_stock(cls, value: dict[str, float]) -> dict[str, float]:
        if any(not math.isfinite(quantity) or quantity < 0 for quantity in value.values()):
            raise ValueError('Stock quantities must be finite and nonnegative.')
        return value


def token_for(user: User) -> str:
    expires = datetime.now(timezone.utc) + timedelta(hours=12)
    return jwt.encode({'sub': str(user.id), 'exp': expires}, JWT_SECRET, algorithm='HS256')


def output_user(user: User) -> dict[str, str]:
    return {'name': user.name, 'email': user.email}


def auth_reply(user: User) -> dict[str, object]:
    return {'access_token': token_for(user), 'token_type': 'bearer', 'user': output_user(user)}


@app.post('/api/auth/register', status_code=201)
def register(payload: Register, session: Session = Depends(db)):
    email = str(payload.email).lower()
    name_key = payload.name.casefold()
    if session.scalar(select(User.id).where(or_(User.email == email, User.name_key == name_key))):
        raise HTTPException(409, 'Username or email already registered.')
    user = User(
        name=payload.name,
        name_key=name_key,
        email=email,
        password_hash=bcrypt.hashpw(payload.password.encode('utf-8'), bcrypt.gensalt()).decode('ascii'),
    )
    session.add(user)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(409, 'Username or email already registered.')
    session.refresh(user)
    return auth_reply(user)


@app.post('/api/auth/login')
def login(payload: Login, session: Session = Depends(db)):
    identifier = payload.identifier
    user = session.scalar(
        select(User).where(
            or_(User.email == identifier.lower(), User.name_key == identifier.casefold())
        )
    )
    if not user or not bcrypt.checkpw(
        payload.password.encode('utf-8'), user.password_hash.encode('ascii')
    ):
        raise HTTPException(401, 'Invalid username/email or password.')
    return auth_reply(user)


@app.get('/api/auth/me')
def me(user: User = Depends(auth)):
    return output_user(user)


@app.patch('/api/auth/me')
def patch_profile(payload: Patch, user: User = Depends(auth), session: Session = Depends(db)):
    if payload.name is None:
        return output_user(user)
    name_key = payload.name.casefold()
    if session.scalar(
        select(User.id).where(User.name_key == name_key, User.id != user.id)
    ):
        raise HTTPException(409, 'Username already registered.')
    user.name = payload.name
    user.name_key = name_key
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(409, 'Username already registered.')
    session.refresh(user)
    return output_user(user)


def valid_catalog_ingredient(item: Ingredient) -> bool:
    numbers = [
        item.price_min,
        item.price_max,
        item.price_reference_quantity,
        item.price_to_unit_factor,
        item.serving_size_g,
        item.bdd_percent,
        *(getattr(item, field) for field in FIELDS),
    ]
    provenance = [
        item.slug,
        item.name,
        item.category,
        item.price_raw_unit,
        item.price_source,
        item.price_source_url,
        item.price_region,
        item.price_from,
        item.price_to,
        item.price_updated,
        item.price_conversion_source,
        item.price_conversion_source_url,
        item.nutrition_source,
        item.nutrition_source_url,
        item.nutrition_record,
    ]
    try:
        allergens = json.loads(item.allergens)
        observed_from = date.fromisoformat(item.price_from)
        observed_to = date.fromisoformat(item.price_to)
        date.fromisoformat(item.price_updated)
    except (TypeError, ValueError, json.JSONDecodeError):
        return False
    return (
        bool(item.slug)
        and item.unit in SUPPORTED_UNITS
        and all(isinstance(value, str) and value.strip() for value in provenance)
        and all(isinstance(value, (int, float)) and math.isfinite(value) for value in numbers)
        and item.price_min > 0
        and item.price_max >= item.price_min
        and item.price_reference_quantity > 0
        and item.price_to_unit_factor > 0
        and item.serving_size_g > 0
        and 0 < item.bdd_percent <= 100
        and observed_from <= observed_to
        and item.price_source_url.startswith('https://')
        and item.price_conversion_source_url.startswith('https://')
        and item.nutrition_source_url.startswith('https://')
        and isinstance(allergens, list)
        and all(isinstance(allergen, str) for allergen in allergens)
        and all(getattr(item, field) >= 0 for field in FIELDS)
    )


def optimizer_ingredients(session: Session):
    records = {}
    for item in session.scalars(select(Ingredient).order_by(Ingredient.name)):
        if not valid_catalog_ingredient(item) or not isinstance(item.animal, bool):
            continue
        price_min = item.price_min * item.price_to_unit_factor / item.price_reference_quantity
        price_max = item.price_max * item.price_to_unit_factor / item.price_reference_quantity
        if not all(math.isfinite(value) and value > 0 for value in (price_min, price_max)):
            continue
        price = (round(price_min, 2), round(price_max, 2))
        if not all(value > 0 for value in price):
            continue
        records[item.slug] = (item, price)
    return records


def optimizer_recipes(session: Session, ingredient_ids: set[str]):
    records = []
    for recipe in session.scalars(select(Recipe).order_by(Recipe.id)):
        if (
            recipe.slot not in SLOT_NAMES
            or not isinstance(recipe.servings, int)
            or recipe.servings < 1
            or not isinstance(recipe.time, int)
            or recipe.time < 0
            or not isinstance(recipe.name, str)
            or not recipe.name.strip()
            or not isinstance(recipe.image, str)
            or not recipe.image.strip()
            or not isinstance(recipe.instructions, str)
            or not recipe.instructions.strip()
        ):
            continue
        rows = session.execute(
            select(RecipeIngredient, Ingredient)
            .join(Ingredient)
            .where(RecipeIngredient.recipe_id == recipe.id)
        ).all()
        if not rows or any(
            item.slug not in ingredient_ids
            or row.unit != item.unit
            or not isinstance(row.quantity, (int, float))
            or not isinstance(row.grams, (int, float))
            or not math.isfinite(row.quantity)
            or not math.isfinite(row.grams)
            or row.quantity <= 0
            or row.grams <= 0
            for row, item in rows
        ):
            continue
        records.append((recipe, rows))
    return records

@app.get('/api/v1/catalog')
def catalog(session: Session = Depends(db)):
    ingredient_records = optimizer_ingredients(session)
    ingredients = {}
    for ingredient_id, (item, price) in ingredient_records.items():
        ingredients[ingredient_id] = {
            'name': item.name,
            'unit': item.unit,
            'category': item.category,
            'price': list(price),
            'icon': '',
            'allergens': json.loads(item.allergens),
            'animal': item.animal,
            'nutrition': {field: getattr(item, field) for field in FIELDS},
            'priceSource': {
                'source': item.price_source,
                'sourceUrl': item.price_source_url,
                'region': item.price_region,
                'referenceQuantity': item.price_reference_quantity,
                'referenceUnit': item.price_raw_unit,
                'observedFrom': item.price_from,
                'observedTo': item.price_to,
                'updatedAt': item.price_updated,
                'unitConversionFactor': item.price_to_unit_factor,
                'unitConversion': item.price_conversion_source,
                'unitConversionSourceUrl': item.price_conversion_source_url,
            },
            'nutritionSource': {
                'source': item.nutrition_source,
                'sourceUrl': item.nutrition_source_url,
                'sourceRecord': item.nutrition_record,
                'servingSize': item.serving_size_g,
                'servingUnit': 'g',
                'ediblePortionPercent': item.bdd_percent,
            },
        }

    recipes = []
    for recipe, rows in optimizer_recipes(session, set(ingredient_records)):
        nutrition = {
            field: sum(
                row.grams
                * (item.bdd_percent / 100)
                * getattr(item, field)
                / item.serving_size_g
                for row, item in rows
            )
            / recipe.servings
            for field in FIELDS
        }
        if not all(math.isfinite(value) and value >= 0 for value in nutrition.values()):
            continue
        recipes.append(
            {
                'id': str(recipe.id),
                'name': recipe.name,
                'slot': SLOT_NAMES.index(recipe.slot),
                'image': recipe.image,
                'time': recipe.time,
                'servings': recipe.servings,
                'items': {item.slug: row.quantity for row, item in rows},
                'nutrition': [nutrition[field] for field in FIELDS],
                'steps': recipe.instructions.split('. '),
            }
        )
    return {'ingredients': ingredients, 'recipes': recipes, 'slots': ['Sarapan', 'Makan Siang', 'Makan Malam']}


@app.get('/api/v1/me/kitchen')
def get_kitchen(user: User = Depends(auth), session: Session = Depends(db)):
    kitchen = session.scalar(select(Kitchen).where(Kitchen.user_id == user.id))
    if not kitchen:
        return {'stock': {}, 'prefs': DEFAULT_PREFS, 'plan': None, 'checked': {}}
    return {key: json.loads(getattr(kitchen, key)) for key in ('stock', 'prefs', 'plan', 'checked')}


@app.put('/api/v1/me/kitchen')
def put_kitchen(payload: KitchenBody, user: User = Depends(auth), session: Session = Depends(db)):
    data = payload.model_dump(mode='json')
    ingredient_records = optimizer_ingredients(session)
    ingredient_ids = set(ingredient_records)
    preference_bodies = [payload.prefs]
    if payload.plan is not None:
        preference_bodies.append(payload.plan.prefs)
    referenced_ids = set(data['stock']) | set(data['checked'])
    for prefs in preference_bodies:
        referenced_ids.update(prefs.liked)
        referenced_ids.update(prefs.avoided)
    if not referenced_ids.issubset(ingredient_ids):
        raise HTTPException(422, 'Kitchen data must use valid catalog ingredient IDs.')
    if any(
        ingredient_records[ingredient_id][0].unit == 'butir' and quantity % 1 != 0
        for ingredient_id, quantity in data['stock'].items()
    ):
        raise HTTPException(422, 'Egg stock must use whole eggs.')

    plan = data['plan']
    if plan is not None:
        recipe_slots = {
            str(recipe.id): recipe.slot
            for recipe, _ in optimizer_recipes(session, ingredient_ids)
        }
        for day in plan['menu']:
            if any(
                recipe_slots.get(recipe_id) != SLOT_NAMES[slot]
                for slot, recipe_id in enumerate(day)
            ):
                raise HTTPException(422, 'Plan recipes must match their meal slots.')
        if plan.get('alternative') is None:
            plan.pop('alternative', None)
    kitchen = session.scalar(select(Kitchen).where(Kitchen.user_id == user.id))
    values = {
        key: json.dumps(data[key], separators=(',', ':'))
        for key in ('stock', 'prefs', 'plan', 'checked')
    }
    if kitchen is None:
        kitchen = Kitchen(user_id=user.id, **values)
        session.add(kitchen)
    else:
        for key, value in values.items():
            setattr(kitchen, key, value)
    session.commit()
    return data
