"""Add verification columns to health_events

Revision ID: add_verification_cols
Revises:
Create Date: 2026-04-12

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'add_verification_cols'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add verification columns to health_events table
    op.execute("""
        ALTER TABLE health_events
        ADD COLUMN IF NOT EXISTS verification_status VARCHAR,
        ADD COLUMN IF NOT EXISTS verified_by VARCHAR,
        ADD COLUMN IF NOT EXISTS verification_document_url VARCHAR,
        ADD COLUMN IF NOT EXISTS verification_notes TEXT,
        ADD COLUMN IF NOT EXISTS marked_given_at TIMESTAMP;
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE health_events
        DROP COLUMN IF EXISTS verification_status,
        DROP COLUMN IF EXISTS verified_by,
        DROP COLUMN IF EXISTS verification_document_url,
        DROP COLUMN IF EXISTS verification_notes,
        DROP COLUMN IF EXISTS marked_given_at;
    """)
