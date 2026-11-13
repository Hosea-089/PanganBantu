from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    name_key: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(60))


class Ingredient(Base):
    __tablename__ = 'ingredients'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    unit: Mapped[str] = mapped_column(String(20))
    category: Mapped[str] = mapped_column(String(40))
    allergens: Mapped[str] = mapped_column(Text, default='[]')
    animal: Mapped[bool] = mapped_column(Boolean, default=False)
    price_min: Mapped[float] = mapped_column(Float)
    price_max: Mapped[float] = mapped_column(Float)
    price_raw_unit: Mapped[str] = mapped_column(String(20))
    price_reference_quantity: Mapped[float] = mapped_column(Float)
    price_to_unit_factor: Mapped[float] = mapped_column(Float, default=1)
    price_conversion_source: Mapped[str] = mapped_column(String(200))
    price_conversion_source_url: Mapped[str] = mapped_column(String(500))
    price_source: Mapped[str] = mapped_column(String(200))
    price_source_url: Mapped[str] = mapped_column(String(500))
    price_region: Mapped[str] = mapped_column(String(80))
    price_from: Mapped[str] = mapped_column(String(10))
    price_to: Mapped[str] = mapped_column(String(10))
    price_updated: Mapped[str] = mapped_column(String(10))
    nutrition_source: Mapped[str] = mapped_column(String(100))
    nutrition_source_url: Mapped[str] = mapped_column(String(500))
    nutrition_record: Mapped[str] = mapped_column(String(30))
    serving_size_g: Mapped[float] = mapped_column(Float)
    bdd_percent: Mapped[float] = mapped_column(Float)
    energy: Mapped[float] = mapped_column(Float)
    protein: Mapped[float] = mapped_column(Float)
    carbohydrate: Mapped[float] = mapped_column(Float)
    fat: Mapped[float] = mapped_column(Float)
    fiber: Mapped[float] = mapped_column(Float)


class Recipe(Base):
    __tablename__ = 'recipes'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    slot: Mapped[str] = mapped_column(String(20))
    servings: Mapped[int] = mapped_column(Integer)
    image: Mapped[str] = mapped_column(String(255))
    time: Mapped[int] = mapped_column(Integer)
    instructions: Mapped[str] = mapped_column(Text)


class RecipeIngredient(Base):
    __tablename__ = 'recipe_ingredients'

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey('recipes.id'), index=True)
    ingredient_id: Mapped[int] = mapped_column(ForeignKey('ingredients.id'))
    quantity: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(20))
    grams: Mapped[float] = mapped_column(Float)


class Kitchen(Base):
    __tablename__ = 'kitchens'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), unique=True, index=True)
    stock: Mapped[str] = mapped_column(Text, default='{}')
    prefs: Mapped[str] = mapped_column(Text, default='{}')
    plan: Mapped[str] = mapped_column(Text, default='null')
    checked: Mapped[str] = mapped_column(Text, default='{}')
