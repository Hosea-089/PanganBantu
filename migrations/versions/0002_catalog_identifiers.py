import re
import unicodedata

from alembic import op
import sqlalchemy as sa

revision = '0002_catalog_identifiers'
down_revision = '0001_initial'
branch_labels = None
depends_on = None

LEGACY_SLUGS = {
    'Beras': 'beras',
    'Telur': 'telur',
    'Tahu': 'tahu',
    'Tempe': 'tempe',
    'Wortel': 'wortel',
    'Bayam': 'bayam',
    'Kubis': 'kol',
    'Kentang': 'kentang',
}
SI_SOURCE = 'SI conversion: 1 kg = 1000 g'
SI_URL = 'https://www.nist.gov/pml/owm/si-units'
EGG_SOURCE = 'USDA FoodData Central: 50 g edible egg; TKPI 2020 BDD: 89%'
EGG_URL = 'https://fdc.nal.usda.gov/food-search/?query=egg%20whole%20raw&type=SR%20Legacy'


def slugify(name: str, ingredient_id: int) -> str:
    plain = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', plain).strip('-') or f'ingredient-{ingredient_id}'


def upgrade():
    op.add_column('ingredients', sa.Column('slug', sa.String(100), nullable=True))
    op.add_column('ingredients', sa.Column('price_conversion_source', sa.String(200), nullable=True))
    op.add_column('ingredients', sa.Column('price_conversion_source_url', sa.String(500), nullable=True))

    connection = op.get_bind()
    rows = connection.execute(
        sa.text(
            'SELECT id, name, unit, price_raw_unit, price_reference_quantity, '
            'price_to_unit_factor FROM ingredients'
        )
    ).mappings()
    used_slugs = set()
    for row in rows:
        ingredient_id = row['id']
        name = row['name']
        slug = LEGACY_SLUGS.get(name) or slugify(name, ingredient_id)
        if slug in used_slugs:
            slug = f'{slug}-{ingredient_id}'
        used_slugs.add(slug)

        reference_quantity = row['price_reference_quantity']
        factor = row['price_to_unit_factor']
        conversion_source = 'Unverified legacy conversion; validate before use'
        conversion_url = ''
        if row['price_raw_unit'] == 'kg' and reference_quantity == 1000:
            reference_quantity = 1
            if row['unit'] == 'g':
                factor /= 1000
                conversion_source = SI_SOURCE
                conversion_url = SI_URL
            elif row['unit'] == 'butir' and name == 'Telur':
                factor /= 1000
                conversion_source = EGG_SOURCE
                conversion_url = EGG_URL

        connection.execute(
            sa.text(
                'UPDATE ingredients SET slug = :slug, price_reference_quantity = :reference, '
                'price_to_unit_factor = :factor, price_conversion_source = :source, '
                'price_conversion_source_url = :url WHERE id = :id'
            ),
            {
                'slug': slug,
                'reference': reference_quantity,
                'factor': factor,
                'source': conversion_source,
                'url': conversion_url,
                'id': ingredient_id,
            },
        )
    for old, new in {'staple': 'Bahan Pokok', 'protein': 'Protein', 'vegetable': 'Sayuran'}.items():
        connection.execute(
            sa.text('UPDATE ingredients SET category = :new WHERE category = :old'),
            {'old': old, 'new': new},
        )
    op.create_index('ix_ingredients_slug', 'ingredients', ['slug'], unique=True)


def downgrade():
    op.drop_index('ix_ingredients_slug', table_name='ingredients')
    op.drop_column('ingredients', 'price_conversion_source_url')
    op.drop_column('ingredients', 'price_conversion_source')
    op.drop_column('ingredients', 'slug')
