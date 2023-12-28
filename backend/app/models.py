from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class SteamedOrder(Base):
    __tablename__ = "steamed_orders"

    id = Column(Integer, primary_key=True, index=True)

    #items = relationship("Other class", back_populates="order")