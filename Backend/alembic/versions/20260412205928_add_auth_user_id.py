"""add auth_user_id to households

Revision ID: add_auth_user_id
Revises: 8e3d27626eea
Create Date: 2026-04-12 15:28:55

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_auth_user_id'
down_revision = '8e3d27626eea'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add auth_user_id column
    op.add_column('households', sa.Column('auth_user_id', sa.String(), nullable=True))
    
    # Add index for faster lookups
    op.create_index('ix_households_auth_user_id', 'households', ['auth_user_id'])


def downgrade() -> None:
    op.drop_index('ix_households_auth_user_id', table_name='households')
    op.drop_column('households', 'auth_user_id')
