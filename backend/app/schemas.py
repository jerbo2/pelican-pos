from pydantic import BaseModel, Json
from typing import List, Dict, Union, Optional
from datetime import datetime


class ConfigBase(BaseModel):
    pricing_config: Dict
    order: int


class SelectConfig(ConfigBase):
    type: str = "select"
    options: Optional[List[str]]
    label: Optional[str]


class TextConfig(ConfigBase):
    type: str = "textfield"
    placeholder: Optional[str]
    label: Optional[str]


FormElementConfig = Union[SelectConfig, TextConfig]  # will add more types later


class ItemBase(BaseModel):
    name: str
    form_cfg: List[FormElementConfig]
    category_id: int


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    pass


class ItemDelete(ItemBase):
    pass


class Item(ItemBase):
    id: int

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    pass


class OrderDelete(BaseModel):
    pass


class Order(BaseModel):
    id: int
    created_at: datetime
    status: str
    customer_name: Optional[str]
    customer_phone_number: Optional[str]
    complete_at: Optional[datetime]

    class Config:
        from_attributes = True


# OrderItem model has order & item ids, but item name and configs are most important to return
class OrderItem(BaseModel):
    id: int
    item_name: str
    category_name: str
    configurations: List[Dict]
    quantity: int
    price: float

    class Config:
        from_attributes = True


class OrderItemUpdate(BaseModel):
    configurations: List[Dict]
    price: float

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    pass


class Category(BaseModel):
    id: int
    name: str
    proper_name: str

    class Config:
        from_attributes = True


class CategoryWithItems(Category):
    items: list[Item]
