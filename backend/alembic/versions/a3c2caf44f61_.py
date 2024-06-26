"""empty message

Revision ID: a3c2caf44f61
Revises: 37ab21def950
Create Date: 2024-05-10 18:25:12.232134

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3c2caf44f61'
down_revision: Union[str, None] = '37ab21def950'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('categories', sa.Column('proper_name', sa.String(), nullable=True))
    op.create_index(op.f('ix_categories_proper_name'), 'categories', ['proper_name'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_categories_proper_name'), table_name='categories')
    op.drop_column('categories', 'proper_name')
    # ### end Alembic commands ###
