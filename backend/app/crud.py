from sqlalchemy.orm import Session, joinedload
from sqlalchemy import cast
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
import operator, json

from . import models, schemas


def get_items(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Item)
        .order_by(models.Item.id.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()


def get_categories(
    db: Session, skip: int = 0, limit: int = 100, include_items: bool = False
):
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
        order_item = (
            db.query(models.OrderItem)
            .filter(
                models.OrderItem.order_id == order_id,
                models.OrderItem.item_id == item_id,
                models.OrderItem.configurations == cast(configurations, ARRAY(JSONB)),
            )
            .first()
        )

        if order_item:
            order_item.quantity += 1
        else:
            # If not, create and add new OrderItem
            prices = calculate_prices(db_item.form_cfg, configurations)
            new_order_item = models.OrderItem(
                order_id=db_order.id,
                item_id=db_item.id,
                configurations=cast(configurations, ARRAY(JSONB)),
                quantity=1,
                price=prices,
            )
            db.add(new_order_item)

        db.commit()
        db.refresh(db_order)
    return db_order


def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()


def get_order_items(db: Session, order_id: int):
    # Join OrderItem with Item and filter by order_id, for this i really only care about item name and configurations
    order_items = (
        db.query(
            models.OrderItem,
            models.Item.name.label("item_name"),
            models.Category.name.label(
                "category_name"
            ),  # Assuming 'name' is a field in the Category model
        )
        .join(models.Item, models.OrderItem.item_id == models.Item.id)
        .join(models.Category, models.Item.category_id == models.Category.id)
        .filter(models.OrderItem.order_id == order_id)
        .all()
    )

    result = [
        schemas.OrderItem(
            id=order_item.id,
            item_name=item_name,
            category_name=category_name,
            configurations=order_item.configurations,
            quantity=order_item.quantity,
            price=order_item.price,
        )
        for order_item, item_name, category_name in order_items
    ]

    return result

def update_order_item(db: Session, order_item_id: int, configurations: list):
    db_order_item = db.query(models.OrderItem).filter(models.OrderItem.id == order_item_id).first()
    db_item = db.query(models.Item).filter(models.Item.id == db_order_item.item_id).first()
    if db_order_item:
        db_order_item.configurations = cast(configurations, ARRAY(JSONB))
        db_order_item.price = calculate_prices(db_item.form_cfg, configurations)
        db.commit()
        db.refresh(db_order_item)
    return db_order_item


operators = {
    "+": operator.add,
    "×": operator.mul,
}


def apply_operator(op, value, base):
    if op == "+":
        return base + value
    elif op == "×":
        return base * value
    else:
        raise ValueError(f"Unsupported operation {op}")


def get_dependency_value(depends_on, item_value, configs):
    # Find the configuration that the current one depends on
    for _, item_config in configs:
        if item_config.get("label") == depends_on.get("name"):
            dependency_options = depends_on.get("values").get(item_value)
            print(dependency_options)
            for k, v in dependency_options.items():
                if k == item_config.get("value"):
                    return float(v)
    return -1


def calculate_prices(item_config, order_item_config):
    base_price = 0
    multipliers = []
    adders = []
    selected_values = {}  # To keep track of selected values for dependencies

    # Pair each item configuration with its corresponding form configuration
    configs = list(zip(item_config, order_item_config))

    # Sort configurations so that multipliers are processed last
    configs.sort(
        key=lambda x: (
            x[0].get("pricing_config", {}).get("priceBy") == "Option Value",
            x[0].get("pricing_config", {}).get("priceBy") in ("Scaled Option Value", "Dependency"),
        )
    )

    for form_config, item_config in configs:
        pricing_config = form_config.get("pricing_config", {})
        price_by = pricing_config.get("priceBy")
        operator = pricing_config.get("priceFactor", "+")  # Defaulting to addition if not specified

        item_value = item_config.get("value", 0)
        selected_values[form_config.get("label")] = item_value

        if price_by == "Constant":
            value = float(pricing_config.get("constantValue", 0))
            base_price = apply_operator(operator, value, base_price)
        elif price_by == "Per Option":
            value = float(pricing_config.get("perOptionMapping", {}).get(item_value, 0))
            base_price = apply_operator(operator, value, base_price)
        elif price_by == "Option Value":
            value = float(item_value)
            multipliers.append(value)
        elif price_by == "Scaled Option Value":
            value = float(pricing_config.get("constantValue", 0)) * float(item_value)
            multipliers.append(value)
        elif price_by == "Dependency":
            value = get_dependency_value(pricing_config["dependsOn"], item_value, configs)
            if operator == "+":
                adders.append(value)
            else:
                multipliers.append(value)

    # Sum all additions first
    final_price = base_price

    # Apply all multipliers sequentially
    for multiplier in multipliers:
        final_price *= multiplier

    print(multipliers, adders, final_price, base_price)

    return round(max(0, final_price + sum(adders)), 2)


def check_item_price(db: Session, item_id: int, configurations: list):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item:
        return calculate_prices(db_item.form_cfg, configurations)
    return 0
