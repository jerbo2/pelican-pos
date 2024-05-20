from pydantic import BaseModel
from typing import List, Dict, Union, Optional
from datetime import datetime


# Configurations for form elements
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


FormElementConfig = Union[
    SelectConfig, TextConfig
]  # Additional types can be added later


# Item schemas
class ItemBase(BaseModel):
    name: str
    form_cfg: List[FormElementConfig]
    category_id: int
    tax_rate: float


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    name: Optional[str] = None
    form_cfg: Optional[List[FormElementConfig]] = None
    category_id: Optional[int] = None
    tax_rate: Optional[float] = None


class ItemDelete(ItemBase):
    pass


class Item(ItemBase):
    id: int

    class Config:
        from_attributes = True


class UpdateItemField(BaseModel):
    field: str
    value: Union[str, int, float]

    class Config:
        from_attributes = True


# Tax rate update schema
class TaxRateUpdate(BaseModel):
    tax_rate: float

    class Config:
        from_attributes = True


# Order schemas
class OrderCreate(BaseModel):
    pass


class OrderDelete(BaseModel):
    pass


class OrderUpdate(BaseModel):
    status: Optional[str]
    customer_name: Optional[str]
    customer_phone_number: Optional[str]
    complete_at: Optional[datetime]


class Order(OrderUpdate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Order item schemas
class OrderItemBase(BaseModel):
    configurations: List[Dict]
    quantity: int
    price: float

    class Config:
        from_attributes = True


class OrderItem(OrderItemBase):
    id: int
    item_name: str
    category_name: str


class OrderItemUpdate(BaseModel):
    configurations: Optional[List[Dict]] = None
    quantity: Optional[int] = None
    price: Optional[float] = None  # Include price if it might be updated


class OrderItemDelete(OrderItemBase):
    id: int


# Category schemas
class CategoryCreate(BaseModel):
    pass


class Category(BaseModel):
    id: int
    name: str
    proper_name: str

    class Config:
        from_attributes = True


class CategoryWithItems(Category):
    items: List[Item]
