from pydantic import BaseModel, RootModel
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

class InventoryConfigDependsOn(BaseModel):
    name: str
    amounts: Dict[str, str]

class InventoryConfigDecrementDependsOn(BaseModel):
    names: List[str]
    amounts: Dict[str, Union[str, Dict[str, str]]]

class InventoryConfig(BaseModel):
    dependsOn: InventoryConfigDependsOn
    decrementer: str
    decrementDependsOn: InventoryConfigDecrementDependsOn
    manageItemInventory: bool

# Item schemas
class ItemBase(BaseModel):
    name: str
    form_cfg: List[FormElementConfig]
    category_id: int
    tax_rate: float
    inventory_config: Union[Dict, InventoryConfig]


class ItemCreate(ItemBase):
    pass


class ItemUpdate(ItemBase):
    name: Optional[str] = None
    form_cfg: Optional[List[FormElementConfig]] = None
    category_id: Optional[int] = None
    tax_rate: Optional[float] = None
    inventory_config: Optional[InventoryConfig] = None


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


class Transaction(BaseModel):
    id: Optional[int] = None
    payment_method: Optional[str] = None
    total_non_taxable: Optional[float] = None
    total_taxable: Optional[float] = None
    collected_tax: Optional[float] = None
    total_amount: Optional[float] = None
    cash_paid: Optional[float] = None
    card_paid: Optional[float] = None
    change_given: Optional[float] = None
    transaction_date: Optional[datetime] = None

    class Config:
        from_attributes = True
        exclude = {"order_id"}


class TransactionTotals(BaseModel):
    id: Optional[int] = None
    date: Optional[str] = None
    total_sales: Optional[str] = None
    total_taxable: Optional[str] = None
    total_non_taxable: Optional[str] = None
    total_tax: Optional[str] = None
    total_cash: Optional[str] = None
    total_card: Optional[str] = None



class Order(BaseModel):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    status: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone_number: Optional[str] = None
    complete_at: Optional[datetime] = None
    transaction: Optional[Transaction] = None

    class Config:
        from_attributes = True


# Order item schemas
class OrderItemBase(BaseModel):
    configurations: List[Dict]
    quantity: int
    price: float
    tax: float
    printed: bool

    class Config:
        from_attributes = True


class OrderItem(OrderItemBase):
    id: int
    item_name: str
    item_id: int
    category_name: str


class OrderItemUpdate(BaseModel):
    configurations: Optional[List[Dict]] = None
    quantity: Optional[int] = None
    price: Optional[float] = None
    printed: Optional[bool] = None

class OrderItemConfig(BaseModel):
    configurations: Optional[List[Dict]] = None
    item_id: Optional[int] = None



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


class TicketData(BaseModel):
    order_item_id: int
    eat_in: bool


class Ticket(RootModel[List[TicketData]]):
    pass
