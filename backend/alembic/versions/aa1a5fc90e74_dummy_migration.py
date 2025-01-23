"""dummy migration

Revision ID: aa1a5fc90e74
Revises: ed25dcfc7748
Create Date: 2024-08-18 21:16:32.180439

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aa1a5fc90e74'
down_revision: Union[str, None] = 'ed25dcfc7748'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
