"""empty message

Revision ID: d814e32d35bb
Revises: 9d4b4d63ff83
Create Date: 2024-05-09 18:48:12.126935

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd814e32d35bb'
down_revision: Union[str, None] = '9d4b4d63ff83'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
