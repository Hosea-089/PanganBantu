import os

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

from backend.models import Base

load_dotenv()
config = context.config
target_metadata = Base.metadata


def run_migrations_offline():
    url = os.getenv('DATABASE_URL', config.get_main_option('sqlalchemy.url'))
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    section = config.get_section(config.config_ini_section)
    section['sqlalchemy.url'] = os.getenv('DATABASE_URL', section['sqlalchemy.url'])
    connectable = engine_from_config(
        section,
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
