from pydantic import BaseModel
from typing import List, Union, Optional
from datetime import datetime


class SelectConfig(BaseModel):
    type: str = "select"
    options: Optional[List[str]]
    label: Optional[str]


class TextConfig(BaseModel):
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
    items: List[Item] = []

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    items: list[Item] = []

    class Config:
        from_attributes = True

    
