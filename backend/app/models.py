from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Float, Boolean
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import relationship
from .database import Base
import datetime


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, unique=True, index=True)
    name = Column(String, index=True)
    proper_name = Column(String, index=True)

    items = relationship("Item", back_populates="category", lazy="select")


# item table
class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True)
    form_cfg = Column(JSONB, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    tax_rate = Column(Float, default=0.0)

    category = relationship("Category", back_populates="items")
    orders = relationship("OrderItem", back_populates="item")


# order table
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.now(datetime.timezone.utc))
    status = Column(String, default="pending")
    customer_name = Column(String, index=True, nullable=True)
    customer_phone_number = Column(String, index=True, nullable=True)
    complete_at = Column(DateTime, nullable=True)

    # Relationships
    items = relationship("OrderItem", back_populates="order")
    transaction = relationship("Transaction", back_populates="order", uselist=False)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    payment_method = Column(String, nullable=True)
    total_non_taxable = Column(Float, default=0.0)
    total_taxable = Column(Float, default=0.0)
    collected_tax = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    cash_paid = Column(Float, nullable=True)
    card_paid = Column(Float, nullable=True)
    change_given = Column(Float, nullable=True)
    transaction_date = Column(
        DateTime, nullable=True
    )

    # Relationships
    order = relationship("Order", back_populates="transaction")


# order items table that connects orders and items with item configurations
class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True)  # Add a unique primary key
    order_id = Column(Integer, ForeignKey("orders.id"))
    item_id = Column(Integer, ForeignKey("items.id"))
    configurations = Column(ARRAY(JSONB))
    quantity = Column(Integer, default=1)
    price = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    printed = Column(Boolean, default=False)

    order = relationship("Order", back_populates="items")
    item = relationship("Item", back_populates="orders")


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True)
    address = Column(String, index=True)
    city = Column(String, index=True)
    state = Column(String, index=True)
    zip_code = Column(String, index=True)


class Printer(Base):
    __tablename__ = "printers"

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, index=True)
    port = Column(Integer, index=True)
    name = Column(String, index=True)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)  
