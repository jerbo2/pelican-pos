from sqlalchemy.orm import Session, joinedload
from sqlalchemy import cast, func
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.exc import IntegrityError, NoResultFound
import operator, json, datetime, os, time, socket
import tempfile, logging
from io import BytesIO
from PIL import Image
import imgkit
import StarTSPImage
import math
from fastapi import HTTPException
from typing import List, Optional
import models, schemas
from tzlocal import get_localzone
import pytz
from functools import wraps

logger = logging.getLogger('uvicorn.error')

def get_style(font_size):
    res_factor = math.ceil((1 / 25.4) * 203)
    pad_left_per_px = 0.4226
    return f"""
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,200;0,300;0,400;0,500;0,700&display=swap');
            body {{
                width: {80*res_factor}mm;
                font-family: Roboto;
                margin: 0;
            }}
            p, span {{
                margin: {2*res_factor}px 0;
                font-size: {font_size*res_factor}px;
                font-weight: 400;
            }}
            .center {{
                text-align: center;
            }}
            .item {{
                display: flex;
                justify-content: space-between;
            }}
            .item-details {{
                padding-left: {font_size*pad_left_per_px*res_factor}mm;
            }}
            hr {{
                border: none;
                border-top: {res_factor}px solid #000;
            }}
        </style>
        """


# Fetch items
def get_items(db: Session):
    return db.query(models.Item).order_by(models.Item.id.asc()).all()


# Fetch a single item by its ID
def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()


# Fetch categories with optional item inclusion
def get_categories(db: Session, include_items: bool = False):
    query = db.query(models.Category).order_by(models.Category.id.asc())
    if include_items:
        query = query.options(joinedload(models.Category.items))
    return query.all()


# Create a new category
def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


# Create a new item
def create_item(db: Session, item: schemas.ItemCreate):
    db_item = models.Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


# Update an existing item by its ID
def update_item(db: Session, db_item: schemas.Item, item: schemas.ItemUpdate):
    item_data = item.model_dump(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item


# Delete an item by its ID
def delete_item(db: Session, db_item: schemas.Item):
    db.delete(db_item)
    db.commit()
    return db_item

def update_last_interaction(func):
    @wraps(func)
    def wrapper(db: Session, *args, **kwargs):
        # Call the original function
        order = func(db, *args, **kwargs)
        # Update the last_interacted_at timestamp
        order.last_interacted_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()  # Save the updated timestamp to the database
        return order
    return wrapper

def create_order(db: Session):
    db_order = models.Order()
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    db_order_transaction = models.Transaction(order_id=db_order.id)
    db.add(db_order_transaction)
    db.commit()
    db.refresh(db_order_transaction)
    return db_order

@update_last_interaction
def add_to_active_order(
    db: Session, db_order: schemas.Order, db_item: schemas.Item, configurations: list
):

    # Check if the item is already in the order with the same configurations
    matched_order_item = (
        db.query(models.OrderItem)
        .filter(
            models.OrderItem.order_id == db_order.id,
            models.OrderItem.item_id == db_item.id,
            models.OrderItem.configurations == cast(configurations, ARRAY(JSONB)),
        )
        .first()
    )

    if matched_order_item:
        matched_order_item.quantity += 1
    else:
        # If not, create and add new OrderItem
        price, taxed = calculate_prices(
            db_item.form_cfg, configurations, db_item.tax_rate
        )
        new_order_item = models.OrderItem(
            order_id=db_order.id,
            item_id=db_item.id,
            configurations=cast(configurations, ARRAY(JSONB)),
            quantity=1,
            price=price,
            tax=taxed,
        )
        db.add(new_order_item)

    db.commit()
    db.refresh(db_order)

    evaluate_inventory(db, [new_order_item if not matched_order_item else matched_order_item], 'decrement', True)

    return db_order

@update_last_interaction
def update_order(db: Session, order_id: int, order: schemas.Order):
    try:
        # Fetch the order and transaction
        db_order = db.query(models.Order).filter(models.Order.id == order_id).one()
        db_order_transaction = (
            db.query(models.Transaction)
            .filter(models.Transaction.order_id == order_id)
            .one()
        )
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Order or transaction not found")

    # Update order data
    update_order_data = order.model_dump(exclude_unset=True)
    update_transaction_data = update_order_data.pop("transaction", {})

    for key, value in update_order_data.items():
        setattr(db_order, key, value)

    for key, value in update_transaction_data.items():
        setattr(db_order_transaction, key, value)

    # Commit the transaction
    db.commit()

    # Refresh and return the updated order
    db.refresh(db_order)
    return db_order


def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()


def get_orders(db: Session, status: str):
    orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.transaction))
        .filter(models.Order.status == status)
        .all()
    )
    return orders


def delete_order(db: Session, db_order: schemas.Order):
    db.delete(db_order)
    db_transaction = (
        db.query(models.Transaction)
        .filter(models.Transaction.order_id == db_order.id)
        .first()
    )
    if db_transaction.payment_method: 
        raise HTTPException(status_code=400, detail="Cannot delete an order with a payment")
    db.delete(db_transaction)
    db.commit()
    return db_order


def print_receipt(db: Session, db_order: schemas.Order):
    db_transaction = (
        db.query(models.Transaction)
        .filter(models.Transaction.order_id == db_order.id)
        .first()
    )
    db_order_items = get_order_items(db, db_order.id)
    db_restaurant = db.query(models.Restaurant).first()
    db_printer = db.query(models.Printer).filter(models.Printer.name == "front").first()
    receipt_style = get_style(16)
    if db_order:
        local_tz = get_localzone()
        order_date = datetime.datetime.now(local_tz).strftime("%m/%d/%Y %I:%M:%S %p")
        # scale up to max out print resolution ((80mm width / 25.4 mm per inch) * 203 dpi) / 80mm width
        res_factor = math.ceil((1 / 25.4) * 203)
        html_content = f"""
        <html>
        <head>
        {receipt_style}
        </head>
        <body>
            <div class="center">
                <p>{db_restaurant.name}</p>
                <p>{db_restaurant.address}</p>
                <p>{db_restaurant.city}, {db_restaurant.state} {db_restaurant.zip_code}</p>
            </div>
            <hr />
            <hr />
            <div class="center">
                <p>Order #{db_order.id}, {order_date}</p>
            </div>
            <hr />
            <hr />
        """
        for item in db_order_items:
            html_content += f"""
            <div class="item">
                <span>{item.quantity} × {item.item_name}</span>
                <span>${item.price:.2f}</span>
            </div>
            """
            for config in item.configurations:
                html_content += f"""
                <div class="item-details">
                    <p>{config['label']}: {config['value']}</p>
                </div>
                """
        html_content += f"""
            <hr />
            <hr />
            <div class="item">
                <span>Subtotal:</span>
                <span>${(db_transaction.total_amount-db_transaction.collected_tax):.2f}</span>
            </div>
            <div class="item">
                <span>Tax:</span>
                <span>${db_transaction.collected_tax:.2f}</span>
            </div>
            <div class="item">
                <span>Total:</span>
                <span>${db_transaction.total_amount:.2f}</span>
            </div>
            <hr />
            <hr />
        </body>
        </html>
        """
        html_content += f"""
            <div class="item">
                <span>Payment Method: {db_transaction.payment_method}</span>
            </div>
        """
        if db_transaction.card_paid > 0:
            html_content += f"""
            <div class="item">
                <span>Card Charged:</span>
                <span>${db_transaction.card_paid:.2f}</span>
            </div>
            """
            if not (db_transaction.card_paid == db_transaction.total_amount):
                html_content += f"""
                <div class="item">
                    <span>Remaining:</span>
                    <span>${(db_transaction.total_amount - db_transaction.card_paid):.2f}</span>
                </div>
                """

        if db_transaction.cash_paid > 0:
            html_content += f"""
            <div class="item">
                <span>Cash Paid:</span>
                <span>${db_transaction.cash_paid:.2f}</span>
            </div>
            """
            if not (db_transaction.cash_paid == db_transaction.total_amount):
                if db_transaction.change_given > 0:
                    html_content += f"""
                    <div class="item">
                        <span>Change Due:</span>
                        <span>${db_transaction.change_given:.2f}</span>
                    </div>
                    """
                else:
                    html_content += f"""
                    <div class="item">
                        <span>Card Charged:</span>
                        <span>${(db_transaction.total_amount - db_transaction.cash_paid):.2f}</span>
                    </div>
                    """

        html_content += f"""
            <hr />
            <hr />
            """

        raster_print(html_content, db_printer, res_factor)

    return db_order


def raster_print(content, db_printer, res_factor):
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmpfile:
        tmpfile_path = tmpfile.name
        imgkit.from_string(
            content,
            tmpfile_path,
            options={"format": "png", "width": res_factor * 80},
        )

    with open(tmpfile_path, "rb") as f:
        img = Image.open(BytesIO(f.read()))

    os.remove(tmpfile_path)

    raster = StarTSPImage.imageToRaster(img, True)

    try:
        # Create a socket connection to the printer
        with socket.create_connection(
            (db_printer.ip, db_printer.port), timeout=10
        ) as sock:
            # Send raw data in chunks
            chunk_size = 16384
            for i in range(0, len(raster), chunk_size):
                sock.sendall(raster[i : i + chunk_size])
                time.sleep(0.01)
        logger.info("Data sent to printer successfully.")
    except Exception as e:
        logger.error(f"Failed to send data to printer: {e}")


def open_cash_drawer(db: Session):
    db_printer = db.query(models.Printer).filter(models.Printer.name == "front").first()
    # ESC/POS command to open the cash drawer (ASCII BEL <07h>)
    drawer_command = b"\x07"
    try:
        # Create a socket connection to the printer
        printer_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        printer_socket.connect((db_printer.ip, db_printer.port))

        # Send the command to open the cash drawer
        printer_socket.sendall(drawer_command)

        # Close the connection
        printer_socket.close()
        return {"message": "Cash drawer opened successfully"}
    except Exception as e:
        return {"error": f"Failed to open cash drawer: {e}"}


def print_tickets(db: Session, order_id: int, tickets: List[schemas.Ticket]):
    db_printer = db.query(models.Printer).filter(models.Printer.name == "front").first()
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    local_tz = get_localzone()
    localized_order_datetime = pytz.utc.localize(db_order.complete_at).astimezone(
        local_tz
    )
    print_date = datetime.datetime.now(local_tz).strftime("%m/%d/%Y %I:%M %p")
    ticket_style = get_style(24)
    for ticket in tickets:
        res_factor = math.ceil((1 / 25.4) * 203)
        html_content = f"""
        <html>
        <head>
        {ticket_style}
        </head>
        <body>
        <div class="center" style="margin-top: 400px">
        """
        if len(tickets) > 1:
            html_content += f"""
            <p>Part of Order #{order_id}, (1/{len(tickets)})</p>
            """
        else:
            html_content += f"""
            <p>Order #{order_id}</p>
            """

        html_content += f"""
            <p style="font-size: {18*res_factor}px">Printed on {print_date}</p>
        </div>
        """

        html_content += f"<hr /> <hr />"
        for data in ticket.root:
            item_name = (
                db.query(models.Item.name)
                .join(models.OrderItem, models.Item.id == models.OrderItem.item_id)
                .filter(models.OrderItem.id == data.order_item_id)
                .first()[0]
            )
            db_order_item = (
                db.query(models.OrderItem)
                .filter(models.OrderItem.id == data.order_item_id)
                .first()
            )
            html_content += f"""
            <div class="item">
                <span>{db_order_item.quantity} × {item_name}
            """
            if data.eat_in:
                html_content += f"★EAT IN★"
            html_content += f"</span></div>"
            for config in db_order_item.configurations:
                if config["value"]:
                    html_content += f"""
                    <div class="item-details">
                        <p>{config['label']}: {config['value']}</p>
                    </div>
                    """
            html_content += f"<hr /> <hr />"

        html_content += f"""
        <div class="item">
            <span>{db_order.customer_name}</span>
            <span>{localized_order_datetime.strftime("%m/%d/%Y")}</span>
        </div>
        <div class="item">
            <span>{db_order.customer_phone_number}</span>
            <span>{localized_order_datetime.strftime("%I:%M %p")}</span>
        </div>
        """

        raster_print(html_content, db_printer, res_factor)

    return tickets


def get_order_items(db: Session, order_id: int):
    # Join OrderItem with Item and filter by order_id, for this i really only care about item name and configurations
    order_items = (
        db.query(
            models.OrderItem,
            models.Item.name.label("item_name"),
            models.Category.name.label("category_name"),
        )
        .join(models.Item, models.OrderItem.item_id == models.Item.id)
        .join(models.Category, models.Item.category_id == models.Category.id)
        .filter(models.OrderItem.order_id == order_id)
        .order_by(models.OrderItem.id.asc())
        .all()
    )

    if not order_items:
        return []

    result = [
        schemas.OrderItem(
            id=order_item.id,
            item_name=item_name,
            item_id=order_item.item_id,
            category_name=category_name,
            configurations=order_item.configurations,
            quantity=order_item.quantity,
            price=order_item.price,
            tax=order_item.tax,
            printed=order_item.printed,
        )
        for order_item, item_name, category_name in order_items
    ]

    return result


def get_order_item(db: Session, order_item_id: int):
    order_item = (
        db.query(models.OrderItem).filter(models.OrderItem.id == order_item_id).first()
    )
    return order_item


def update_order_item(
    db: Session, order_item_id: int, order_item_update: schemas.OrderItemUpdate
):

    db_order_item = get_order_item(db, order_item_id)
    db_item = get_item(db, db_order_item.item_id)

    if any([db_order_item is None, db_item is None]):
        return None

    # Update configurations, if provided
    if order_item_update.configurations is not None:
        # reimburse inventory for the item
        logger.info(f"Reimbursing inventory for order item {db_order_item.id}")
        evaluate_inventory(db, [db_order_item], 'increment', True)
        logger.info(f"Old configurations: {db_order_item.configurations}")
        db_order_item.configurations = order_item_update.configurations
        logger.info(f"Reimbursed inventory for order item {db_order_item.id}")
        logger.info(f"Updating inventory for order item {db_order_item.id}")
        logger.info(f"New configurations: {order_item_update.configurations}")
        # re-decrement inventory for the item
        evaluate_inventory(db, [db_order_item], 'decrement', True)
        logger.info(f"Updated inventory for order item {db_order_item.id}")
        db_order_item.configurations = cast(db_order_item.configurations, ARRAY(JSONB))
        price, taxed = calculate_prices(
            db_item.form_cfg, order_item_update.configurations, db_item.tax_rate
        )
        db_order_item.price = price
        db_order_item.tax = taxed

    # Update other fields, if provided
    for field in ["quantity", "printed"]:
        if getattr(order_item_update, field) is None: continue
        if field == "quantity":
            op = "decrement" if order_item_update.quantity > db_order_item.quantity else "increment"
            for _ in range(abs(order_item_update.quantity - db_order_item.quantity)):
                evaluate_inventory(db, [db_order_item], op, True)
        setattr(db_order_item, field, getattr(order_item_update, field))

    db.commit()
    db.refresh(db_order_item)
    return db_order_item


def delete_order_item(db: Session, db_order_item: schemas.OrderItem):
    evaluate_inventory(db, [db_order_item], 'increment', True)
    db.delete(db_order_item)
    db.commit()

    return db_order_item


operators = {
    "+": operator.add,
    "×": operator.mul,
}


def apply_operator(op, value, base):
    if op == "+" or op == "increment":
        return base + value
    elif op == "-" or op == "decrement":
        return base - value
    elif op == "×" or op == "multiply":
        return base * value
    else:
        raise ValueError(f"Unsupported operation {op}")


def get_dependency_value(depends_on, item_value, configs):
    # Find the configuration that the current one depends on
    for _, item_config in configs:
        if item_config.get("label") == depends_on.get("name"):
            dependency_options = depends_on.get("values").get(item_value)
            logger.info(f"Dependency Options: {dependency_options}")
            for k, v in dependency_options.items():
                if k == item_config.get("value"):
                    return float(v)
    return -1

# example of item form config
# [
#     {
#         "type": "single_select",
#         "label": "Size",
#         "order": 0,
#         "options": [
#             "#1",
#             "#2"
#         ],
#         "pricing_config": {
#             "priceBy": "Per Option",
#             "dependsOn": {
#                 "name": "",
#                 "values": {}
#             },
#             "isBasePrice": true,
#             "priceFactor": "+",
#             "affectsPrice": true,
#             "constantValue": "0",
#             "perOptionMapping": {
#                 "1": "44",
#                 "2": "25",
#                 "#1": "40",
#                 "#2": "32"
#             }
#         }
#     },
#     {
#         "type": "single_select",
#         "label": "Amount Type",
#         "order": 1,
#         "options": [
#             "Bushel",
#             "Dz",
#             "Half bushel"
#         ],
#         "pricing_config": {
#             "priceBy": "Dependency",
#             "dependsOn": {
#                 "name": "Size",
#                 "values": {
#                     "Dz": {
#                         "#1": "1",
#                         "#2": "1"
#                     },
#                     "Bushel": {
#                         "#1": "3.18",
#                         "#2": "0"
#                     },
#                     "Half bushel": {
#                         "#1": "0",
#                         "#2": "0"
#                     }
#                 }
#             },
#             "isBasePrice": false,
#             "priceFactor": "×",
#             "affectsPrice": true,
#             "constantValue": "0",
#             "perOptionMapping": {}
#         }
#     },
#     {
#         "type": "number",
#         "label": "Amount",
#         "order": 2,
#         "options": [],
#         "pricing_config": {
#             "priceBy": "Input",
#             "dependsOn": {
#                 "name": "",
#                 "values": {}
#             },
#             "isBasePrice": false,
#             "priceFactor": "×",
#             "affectsPrice": true,
#             "constantValue": "1",
#             "perOptionMapping": {}
#         }
#     },
#     {
#         "type": "single_select",
#         "label": "Spice",
#         "order": 3,
#         "options": [
#             "gar",
#             "hot",
#             "reg"
#         ],
#         "pricing_config": {
#             "priceBy": "",
#             "dependsOn": {
#                 "name": "",
#                 "values": {}
#             },
#             "isBasePrice": false,
#             "priceFactor": "",
#             "affectsPrice": false,
#             "constantValue": "0",
#             "perOptionMapping": {}
#         }
#     }
# ]

def calculate_prices(item_config, order_item_config, tax_rate):
    base_price = 0
    multipliers = []
    adders = []
    selected_values = {}  # To keep track of selected values for dependencies
    tax_rate = tax_rate / 100
    # Pair each item configuration with its corresponding form configuration
    configs = list(zip(item_config, order_item_config))

    # Sort configurations so that multipliers are processed last
    configs.sort(
        key=lambda x: (
            x[0].get("pricing_config", {}).get("priceBy") == "Option Value",
            x[0].get("pricing_config", {}).get("priceBy")
            in ("Scaled Option Value", "Dependency"),
        )
    )

    for form_config, item_config in configs:
        logger.info("*" * 50)
        pricing_config = form_config.get("pricing_config", {})
        logger.info(f"Processing {form_config.get('label')}")
        price_by = pricing_config.get("priceBy")
        is_base_price = pricing_config.get("isBasePrice", False)
        operator = pricing_config.get(
            "priceFactor", "+"
        )  # Defaulting to addition if not specified

        item_value = item_config.get("value", 0)
        selected_values[form_config.get("label")] = item_value
        logger.info(f"Item value is {item_value}")

        if price_by in ("Constant", "Input"):
            value = float(pricing_config.get("constantValue", 0))
            logger.info(f"'Price by' is constant or input with value {value}")
            if is_base_price:
                base_price = apply_operator(operator, value, base_price)
                logger.info(f"Base price is now {base_price}")
            else:
                logger.info("Item is not base price")
                if operator == "+":
                    adders.append(value)
                    logger.info("Operator is +, adding to adders")
                else:
                    multipliers.append(value)
                    logger.info("Operator is x, adding to multipliers")
        elif price_by == "Per Option":
            logger.info("'Price by' is per option")
            value = float(pricing_config.get("perOptionMapping", {}).get(item_value, 0))
            logger.info(f"Item value {item_value} maps to {value}")
            if is_base_price:
                base_price = apply_operator(operator, value, base_price)
                logger.info(f"Item is base price, base price is now {base_price}")
            else:
                logger.info(f"Item is not base price, adding {value} to adders")
                adders.append(value)
        elif price_by == "Option Value":
            value = float(item_value)
            multipliers.append(value)
            logger.info(f"'Price by' is option value, adding {value} to multipliers")
        elif price_by == "Scaled Option Value":
            value = float(pricing_config.get("constantValue", 0)) * float(item_value)
            multipliers.append(value)
            logger.info(f"'Price by' is scaled option value, adding {value} to multipliers")
        elif price_by == "Dependency":
            value = get_dependency_value(
                pricing_config["dependsOn"], item_value, configs
            )
            logger.info(f"'Price by' is dependency")
            if operator == "+":
                logger.info(f"Operator is +, adding {value} to adders")
                adders.append(value)
            else:
                logger.info(f"Operator is x, adding {value} to multipliers")
                multipliers.append(value)

    logger.info("*" * 50)
    # Sum all additions first
    final_price = base_price
    logger.info(f"Base price before modifiers: {base_price}")

    # Apply all multipliers sequentially
    for multiplier in multipliers:
        final_price *= multiplier
        logger.info(f"Applying multiplier {multiplier}, final price is now {final_price}")

    final_price += sum(adders)
    logger.info(f"Adding all adders ({sum(adders)} in total), final price is now {final_price}")
    final_price += final_price * tax_rate
    logger.info(f"Adding tax ({final_price * tax_rate}), final price is now {final_price}")

    # return total price w/ tax & tax amount
    return (round(max(0, final_price), 2), round(final_price * tax_rate, 2))



# Check item price based on its configurations
def check_item_price(db: Session, item_id: int, configurations: list):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item:
        return calculate_prices(db_item.form_cfg, configurations, db_item.tax_rate)[0]
    return 0


def get_reports(db: Session):
    # Perform aggregation in the database query
    query = (
        db.query(
            func.date(models.Transaction.transaction_date).label("date"),
            func.sum(models.Transaction.total_amount).label("total_sales"),
            func.sum(models.Transaction.total_taxable).label("total_taxable"),
            func.sum(models.Transaction.total_non_taxable).label("total_non_taxable"),
            func.sum(models.Transaction.collected_tax).label("total_tax"),
            func.sum(models.Transaction.cash_paid).label("total_cash"),
            func.sum(models.Transaction.card_paid).label("total_card"),
        )
        .group_by(func.date(models.Transaction.transaction_date))
        .order_by(func.date(models.Transaction.transaction_date).desc())
    )

    reports = []
    for i, transaction in enumerate(query.all()):
        if not transaction.date:
            continue
        date_string = transaction.date.strftime("%m/%d/%Y")
        report = {
            "id": i + 1,
            "date": date_string,
            "total_sales": f"${transaction.total_sales or 0:.2f}",
            "total_taxable": f"${transaction.total_taxable or 0:.2f}",
            "total_non_taxable": f"${transaction.total_non_taxable or 0:.2f}",
            "total_tax": f"${transaction.total_tax or 0:.2f}",
            "total_cash": f"${transaction.total_cash or 0:.2f}",
            "total_card": f"${transaction.total_card or 0:.2f}",
        }
        reports.append(report)

    return reports

# inventory config that depends on a form component with special decrementer and decrement dependency
# {
#     "dependsOn": {
#         "name": "Size",
#         "amounts": {
#             "#1": "5",
#             "#2": "10"
#         }
#     },
#     "decrementer": "Amount",
#     "decrementDependsOn": {
#         "names": [
#             "Size",
#             "Amount Type"
#         ],
#         "amounts": {
#             "#1": {
#                 "Dz": "1",
#                 "Bushel": "6.666666666666667",
#                 "Half bushel": "3.3333333333333335"
#             },
#             "#2": {
#                 "Dz": "1",
#                 "Bushel": "9.166666666666666",
#                 "Half bushel": "4.583333333333333"
#             }
#         }
#     },
#     "manageItemInventory": true
# }

from pydantic import TypeAdapter
inventory_config_adapter = TypeAdapter(schemas.InventoryConfig)

def get_available_inventory(db: Session, item_id: int):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item: return None
    inventory_config = inventory_config_adapter.validate_python(item.inventory_config)
    if not inventory_config.manageItemInventory: return None
    return inventory_config.dependsOn.amounts

def edit_inventory(db: Session, order_id: Optional[int] = None, order_item_id: Optional[int] = None, operation: str = 'decrement', commit: bool = False):
    assert operation in ['decrement', 'increment'], 'Operation must be either decrement or increment'
    assert order_id or order_item_id, 'Either order_id or order_item_id must be provided'
    assert not (order_id and order_item_id), 'Only one of order_id or order_item_id can be provided'

    # Get all items in the order or just the one item
    order_items = get_order_items(db, order_id) if order_id else [get_order_item(db, order_item_id)]

    # Decrement or increment the inventory item(s) based on the operation
    return evaluate_inventory(db, order_items, operation, commit)

def check_inventory_impact(db: Session, order_item_config: schemas.OrderItemConfig):
    # since this isn't a real order item & we have not provided a fake order item id, the results will be returned with a key of -1
    return evaluate_inventory(db, [order_item_config], 'decrement', False)[-1]

def evaluate_inventory(db, order_items, operation, commit):
    updated_configs = {}
    for order_item in order_items:
        item = db.query(models.Item).filter(models.Item.id == order_item.item_id).first()
        inventory_config = inventory_config_adapter.validate_python(item.inventory_config)

        if not inventory_config.manageItemInventory: continue

        if inventory_config.dependsOn == 'none' and inventory_config.decrementer == '1_per_order': 
            inventory_config.dependsOn.amounts[''] = apply_operator(operation, 1, inventory_config.dependsOn.amounts[''])
        
        else:
            amount = 1
            dependsOn = ''
            decrementDependsOnValues = [None, None]

            logger.info(f"OLD INVENTORY AMOUNTS: {inventory_config.dependsOn.amounts}")

            for comp in order_item.configurations:
                logger.info(f'this comp was fine {comp}')
                if comp["label"] == inventory_config.decrementer:
                    amount = float(comp["value"])
                    logger.info(f"Found decrementer of {amount} from {comp['label']}")
                if comp["label"] == inventory_config.dependsOn.name:
                    dependsOn = comp["value"]
                    logger.info(f"Inventory depends on {comp['label']} with user-selected value of {comp['value']}")
                if comp["label"] in inventory_config.decrementDependsOn.names:
                    index = inventory_config.decrementDependsOn.names.index(comp["label"])
                    decrementDependsOnValues.insert(index, comp["value"])
                    logger.info(f"Found decrement dependency value {comp['value']} from {comp['label']}")
            logger.info('i made it here')
            available = float(inventory_config.dependsOn.amounts[dependsOn])

            if decrementDependsOnValues[0]:
                decrementMultipler = inventory_config.decrementDependsOn.amounts[decrementDependsOnValues[0]]
                    
                if decrementDependsOnValues[1]:
                    decrementMultipler = decrementMultipler[decrementDependsOnValues[1]]
                
                logger.info(f"Adjusted decrement multiplier to {decrementMultipler} based on decrement dependencies")

                amount *= float(decrementMultipler)
            
        inventory_config.dependsOn.amounts[dependsOn] = str(round(apply_operator(operation, amount, available),2))
        updated_configs[getattr(order_item, 'id', -1)] = inventory_config.dependsOn.amounts

        if commit:
            item.inventory_config = inventory_config.model_dump()
            db.commit()
            db.refresh(item)
        
        logger.info(f'{operation} {dependsOn} by: {amount}')
        logger.info(f'NEW INVENTORY AMOUNTS: {inventory_config.dependsOn.amounts}')

    return updated_configs                

def cleanup_orders(db: Session):
    ten_minutes_ago = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=10)
    # Get all orders that have been pending for more than 10 minutes
    orders = db.query(models.Order).filter(models.Order.status == "pending", models.Order.last_interacted_at < ten_minutes_ago).all()
    logger.info(f"Purging {len(orders)} pending orders that have not been interacted with in 10 minutes. . .")
    for order in orders:
        db.delete(order)
    db.commit()

