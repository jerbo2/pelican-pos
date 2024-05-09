from sqlalchemy.orm import Session

from . import models, schemas


def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).order_by(models.Item.id.asc()).offset(skip).limit(limit).all()


def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()


def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).order_by(models.Category.id.asc()).offset(skip).limit(limit).all()


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

def add_to_active_order(db: Session, order_id: int, item_id: int, quantity: int = 1):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_order and db_item:
        db_order.items.append(db_item)
        db.commit()
    return db_order
