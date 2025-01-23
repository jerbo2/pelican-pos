"""empty message

Revision ID: 7c75456ec158
Revises: 895e223f803e
Create Date: 2024-08-20 20:45:34.815533

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7c75456ec158'
down_revision: Union[str, None] = '895e223f803e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('order_items_order_id_fkey', 'order_items', type_='foreignkey')
    op.create_foreign_key(None, 'order_items', 'orders', ['order_id'], ['id'], ondelete='CASCADE')
    op.drop_constraint('transactions_order_id_fkey', 'transactions', type_='foreignkey')
    op.create_foreign_key(None, 'transactions', 'orders', ['order_id'], ['id'], ondelete='CASCADE')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'transactions', type_='foreignkey')
    op.create_foreign_key('transactions_order_id_fkey', 'transactions', 'orders', ['order_id'], ['id'])
    op.drop_constraint(None, 'order_items', type_='foreignkey')
    op.create_foreign_key('order_items_order_id_fkey', 'order_items', 'orders', ['order_id'], ['id'])
    # ### end Alembic commands ###
