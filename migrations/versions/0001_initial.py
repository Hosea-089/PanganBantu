from alembic import op
import sqlalchemy as sa

revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(30), nullable=False),
        sa.Column('name_key', sa.String(30), nullable=False),
        sa.Column('email', sa.String(320), nullable=False),
        sa.Column('password_hash', sa.String(60), nullable=False),
    )
    op.create_index('ix_users_name_key', 'users', ['name_key'], unique=True)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_table(
        'ingredients',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('unit', sa.String(20), nullable=False),
        sa.Column('category', sa.String(40), nullable=False),
        sa.Column('allergens', sa.Text, nullable=False),
        sa.Column('animal', sa.Boolean, nullable=False),
        sa.Column('price_min', sa.Float, nullable=False),
        sa.Column('price_max', sa.Float, nullable=False),
        sa.Column('price_raw_unit', sa.String(20), nullable=False),
        sa.Column('price_reference_quantity', sa.Float, nullable=False),
        sa.Column('price_to_unit_factor', sa.Float, nullable=False),
        sa.Column('price_source', sa.String(200), nullable=False),
        sa.Column('price_source_url', sa.String(500), nullable=False),
        sa.Column('price_region', sa.String(80), nullable=False),
        sa.Column('price_from', sa.String(10), nullable=False),
        sa.Column('price_to', sa.String(10), nullable=False),
        sa.Column('price_updated', sa.String(10), nullable=False),
        sa.Column('nutrition_source', sa.String(100), nullable=False),
        sa.Column('nutrition_source_url', sa.String(500), nullable=False),
        sa.Column('nutrition_record', sa.String(30), nullable=False),
        sa.Column('serving_size_g', sa.Float, nullable=False),
        sa.Column('bdd_percent', sa.Float, nullable=False),
        sa.Column('energy', sa.Float, nullable=False),
        sa.Column('protein', sa.Float, nullable=False),
        sa.Column('carbohydrate', sa.Float, nullable=False),
        sa.Column('fat', sa.Float, nullable=False),
        sa.Column('fiber', sa.Float, nullable=False),
    )
    op.create_table(
        'recipes',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(120), nullable=False),
        sa.Column('slot', sa.String(20), nullable=False),
        sa.Column('servings', sa.Integer, nullable=False),
        sa.Column('image', sa.String(255), nullable=False),
        sa.Column('time', sa.Integer, nullable=False),
        sa.Column('instructions', sa.Text, nullable=False),
    )
    op.create_table(
        'recipe_ingredients',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('recipe_id', sa.Integer, sa.ForeignKey('recipes.id'), nullable=False),
        sa.Column('ingredient_id', sa.Integer, sa.ForeignKey('ingredients.id'), nullable=False),
        sa.Column('quantity', sa.Float, nullable=False),
        sa.Column('unit', sa.String(20), nullable=False),
        sa.Column('grams', sa.Float, nullable=False),
    )
    op.create_index('ix_recipe_ingredients_recipe_id', 'recipe_ingredients', ['recipe_id'])
    op.create_table(
        'kitchens',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False, unique=True),
        sa.Column('stock', sa.Text, nullable=False),
        sa.Column('prefs', sa.Text, nullable=False),
        sa.Column('plan', sa.Text, nullable=False),
        sa.Column('checked', sa.Text, nullable=False),
    )
    op.create_index('ix_kitchens_user_id', 'kitchens', ['user_id'])


def downgrade():
    op.drop_table('kitchens')
    op.drop_index('ix_recipe_ingredients_recipe_id', table_name='recipe_ingredients')
    op.drop_table('recipe_ingredients')
    op.drop_table('recipes')
    op.drop_table('ingredients')
    op.drop_index('ix_users_name_key', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
