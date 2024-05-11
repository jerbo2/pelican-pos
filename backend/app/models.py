from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import relationship

from .database import Base
from datetime import datetime
from zoneinfo import ZoneInfo


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, unique=True, index=True)
    name = Column(String, index=True)
    proper_name = Column(String, index=True)

    items = relationship("Item", back_populates="category", lazy='select')

# item table
class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True)
    form_cfg = Column(JSONB, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))

    category = relationship("Category", back_populates="items")
    orders = relationship("OrderItem", back_populates="item")

# order table
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.now(ZoneInfo("America/New_York")))
    status = Column(
        String, default="pending"
    )  

    # Relationships
    items = relationship("OrderItem", back_populates="order")

# order items table that connects orders and items with item configurations
class OrderItem(Base):
    __tablename__ = 'order_items'
    id = Column(Integer, primary_key=True)  # Add a unique primary key
    order_id = Column(Integer, ForeignKey('orders.id'))
    item_id = Column(Integer, ForeignKey('items.id'))
    configurations = Column(ARRAY(JSONB))
    quantity = Column(Integer, default=1)
    order = relationship("Order", back_populates="items")
    item = relationship("Item", back_populates="orders")
