"""empty message

Revision ID: ce6fe4dfa94c
Revises: aa1a5fc90e74
Create Date: 2024-08-20 19:07:28.231580

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce6fe4dfa94c'
down_revision: Union[str, None] = 'aa1a5fc90e74'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('orders', sa.Column('lastInteraction', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('orders', 'lastInteraction')
    # ### end Alembic commands ###
