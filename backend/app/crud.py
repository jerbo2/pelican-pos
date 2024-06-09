from sqlalchemy.orm import Session, joinedload
from sqlalchemy import cast, func
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.exc import IntegrityError, NoResultFound
import operator, json, datetime, os, time, socket
import tempfile
from io import BytesIO
from PIL import Image
import imgkit
import StarTSPImage
import math
from fastapi import HTTPException
from typing import List
import models, schemas
from tzlocal import get_localzone
import pytz


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
    print("item data", item_data)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    print("db_item", db_item)
    return db_item


# Delete an item by its ID
def delete_item(db: Session, db_item: schemas.Item):
    db.delete(db_item)
    db.commit()
    return db_item


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
    return db_order


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
        print("Data sent to printer successfully.")
    except Exception as e:
        print(f"Failed to send data to printer: {e}")


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
        print(ticket)
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
        db_order_item.configurations = cast(
            order_item_update.configurations, ARRAY(JSONB)
        )
        price, taxed = calculate_prices(
            db_item.form_cfg, order_item_update.configurations, db_item.tax_rate
        )
        db_order_item.price = price
        db_order_item.tax = taxed

    # Update other fields, if provided
    for field in ["quantity", "printed"]:
        if getattr(order_item_update, field) is not None:
            setattr(db_order_item, field, getattr(order_item_update, field))

    db.commit()
    db.refresh(db_order_item)
    return db_order_item


def delete_order_item(db: Session, db_order_item: schemas.OrderItem):
    db.delete(db_order_item)
    db.commit()
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


def calculate_prices(item_config, order_item_config, tax_rate):
    base_price = 0
    multipliers = []
    adders = []
    selected_values = {}  # To keep track of selected values for dependencies
    tax_rate = tax_rate / 100
    print("ITEM CONFIG", item_config)
    print("ORDER ITEM CONFIG", order_item_config)
    # Pair each item configuration with its corresponding form configuration
    configs = list(zip(item_config, order_item_config))
    print("CONFIGS", configs)

    # Sort configurations so that multipliers are processed last
    configs.sort(
        key=lambda x: (
            x[0].get("pricing_config", {}).get("priceBy") == "Option Value",
            x[0].get("pricing_config", {}).get("priceBy")
            in ("Scaled Option Value", "Dependency"),
        )
    )

    for form_config, item_config in configs:
        pricing_config = form_config.get("pricing_config", {})
        price_by = pricing_config.get("priceBy")
        is_base_price = pricing_config.get("isBasePrice", False)
        operator = pricing_config.get(
            "priceFactor", "+"
        )  # Defaulting to addition if not specified

        item_value = item_config.get("value", 0)
        selected_values[form_config.get("label")] = item_value

        if price_by in ("Constant", "Input"):
            value = float(pricing_config.get("constantValue", 0))
            if is_base_price:
                base_price = apply_operator(operator, value, base_price)
            else:
                if operator == "+":
                    adders.append(value)
                else:
                    multipliers.append(value)
        elif price_by == "Per Option":
            value = float(pricing_config.get("perOptionMapping", {}).get(item_value, 0))
            if is_base_price:
                base_price = apply_operator(operator, value, base_price)
            else:
                adders.append(value)
        elif price_by == "Option Value":
            value = float(item_value)
            multipliers.append(value)
        elif price_by == "Scaled Option Value":
            value = float(pricing_config.get("constantValue", 0)) * float(item_value)
            multipliers.append(value)
        elif price_by == "Dependency":
            value = get_dependency_value(
                pricing_config["dependsOn"], item_value, configs
            )
            if operator == "+":
                adders.append(value)
            else:
                multipliers.append(value)

    # Sum all additions first
    final_price = base_price

    # Apply all multipliers sequentially
    for multiplier in multipliers:
        final_price *= multiplier

    final_price += sum(adders)
    final_price += final_price * tax_rate

    print(multipliers, adders, final_price, base_price)

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
