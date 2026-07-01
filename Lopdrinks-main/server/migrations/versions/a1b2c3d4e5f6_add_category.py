"""Add category table and category_id to recipe

Revision ID: a1b2c3d4e5f6
Revises: 99a8e53f67cb
Create Date: 2025-07-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = 'a1b2c3d4e5f6'
down_revision = '99a8e53f67cb'
branch_labels = None
depends_on = None


def _table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def _column_exists(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = inspect(bind)
    return any(
        col["name"] == column_name
        for col in inspector.get_columns(table_name)
    )


def upgrade():
    # 1. Create the category table
    if not _table_exists('category'):
        op.create_table(
            'category',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(length=100), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('name')
        )

    # 2. Add category_id to recipe
    # Use batch mode so SQLite handles this via copy-and-move instead of ALTER.
    # nullable=True because SQLite cannot add NOT NULL without a default value;
    # the seed script assigns a category to every recipe immediately after.
    if not _column_exists('recipe', 'category_id'):
        with op.batch_alter_table('recipe') as batch_op:
            batch_op.add_column(
                sa.Column('category_id', sa.Integer(), nullable=True)
            )


def downgrade():
    with op.batch_alter_table('recipe') as batch_op:
        batch_op.drop_column('category_id')
    op.drop_table('category')
