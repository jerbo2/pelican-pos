from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import JSONB
import operator

from . import models, schemas


def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).order_by(models.Item.id.asc()).offset(skip).limit(limit).all()


def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()


def get_categories(db: Session, skip: int = 0, limit: int = 100, include_items: bool = False):
    query = db.query(models.Category).order_by(models.Category.id.asc())
    if include_items:
        query = query.options(joinedload(models.Category.items))
    return query.offset(skip).limit(limit).all()


def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def create_item(db: Session, item: schemas.ItemCreate):
    db_item = models.Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_item(db: Session, item_id: int, item: schemas.ItemUpdate):
    db_item = get_item(db, item_id)
    print(db_item, item.form_cfg)
    if db_item:
        db_item.name = item.name
        db_item.form_cfg = [config.model_dump() for config in item.form_cfg]
        db_item.category_id = item.category_id
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_item(db: Session, item_id: int):
    db_item = get_item(db, item_id)
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item

def create_order(db: Session, order: schemas.OrderCreate):
    db_order = models.Order()
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def add_to_active_order(db: Session, order_id: int, item_id: int, configurations: list):
    # Retrieve the existing Order and Item from the database
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()

    if db_order and db_item:
        # Check if the item is already in the order with the same configurations
        order_item = db.query(models.OrderItem).filter(
            models.OrderItem.order_id == order_id,
            models.OrderItem.item_id == item_id,
            models.OrderItem.configurations.op('@>')(
                func.cast(configurations, JSONB)  # Casting the list to JSONB
            )
        ).first()

        if order_item:
            order_item.quantity += 1
        else:
            # If not, create and add new OrderItem
            prices = calculate_prices(db_item.form_cfg, configurations)
            new_order_item = models.OrderItem(order=db_order, item=db_item, configurations=func.cast(configurations, JSONB))
            new_order_item.price = prices
            db.add(new_order_item)
        
        db.commit()
        db.refresh(db_order)
    return db_order

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_order_items(db: Session, order_id: int):
    # Join OrderItem with Item and filter by order_id, for this i really only care about item name and configurations
    order_items = db.query(models.OrderItem, models.Item.name.label("item_name")).\
        join(models.Item, models.OrderItem.item_id == models.Item.id).\
        filter(models.OrderItem.order_id == order_id).\
        all()
    
    result = [schemas.OrderItem(item_name=item_name, configurations=order_item.configurations, quantity=order_item.quantity, price=order_item.price) 
              for order_item, item_name in order_items]

    return result


operators = {
    '+': operator.add,
    '*': operator.mul,
}

def apply_operator(op, value, operand):
    operation = operators[op]
    return operation(value, operand)

def calculate_prices(item_config, order_item_config):
    price = 0

    for form_config, item_config in zip(item_config, order_item_config): 
        pricing_config = form_config.get("pricing_config")
        op = pricing_config['priceFactor']
        print(pricing_config, item_config)
        if pricing_config['priceBy'] == "Constant":
            price = apply_operator(op, float(pricing_config['constantValue']), price)
        elif pricing_config['priceBy'] == "Per Option":
            price = apply_operator(op, float(pricing_config['perOptionMapping'][item_config['value']]), price)
        elif pricing_config['priceBy'] == "Option Value":
            price = apply_operator(op, float(item_config['value']), price)
    
    return price

def get_order_item_price(db: Session, order_id: int, order_item_id: int):
    # Get the order item and item from the database
    order_item = db.query(models.OrderItem).filter(models.OrderItem.id == order_item_id).first()
    item = db.query(models.Item).filter(models.Item.id == order_item.item_id).first()

    price = 0

    # iterate over the configurations and calculate the price
    for form_config, item_config in zip(item.form_cfg, order_item.configurations): 
        pricing_config = form_config.get("pricing_config")
        op = pricing_config['priceFactor']
        if pricing_config['priceBy'] == "Constant":
            price = apply_operator(op, float(pricing_config['constantValue']), price)
        elif pricing_config['priceBy'] == "Per Option":
            price = apply_operator(op, float(pricing_config['perOptionMapping'][item_config['value']]), price)
        elif pricing_config['priceBy'] == "Option Value":
            price = apply_operator(op, float(item_config['value']), price)
    
    return price
    
