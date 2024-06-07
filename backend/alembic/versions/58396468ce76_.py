"""empty message

Revision ID: 58396468ce76
Revises: d5200cda0232
Create Date: 2024-05-27 15:52:11.072132

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '58396468ce76'
down_revision: Union[str, None] = 'd5200cda0232'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('order_items', sa.Column('printed', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('order_items', 'printed')
    # ### end Alembic commands ###
