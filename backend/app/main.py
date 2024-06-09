from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
import logging, json
from typing import List, Dict, Union

import crud, models, schemas, auth
from database import engine, get_db
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

# Database setup
models.Base.metadata.create_all(bind=engine)

# Logger setup
logger = logging.getLogger(__name__)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: str, sender: WebSocket = None):
        for connection in self.active_connections:
            if connection != sender:
                await connection.send_text(data)

manager = ConnectionManager()

# FastAPI app initialization
app = FastAPI(root_path="/api/v1")
protected_router = APIRouter(dependencies=[Depends(auth.get_current_active_user)])

# WebSocket endpoint
@app.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data, sender=websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(json.dumps({"message": "Device disconnected"}))

@protected_router.get("/items/", response_model=List[schemas.Item])
def read_items(db: Session = Depends(get_db)):
    items = crud.get_items(db)
    if not items:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No items found")
    return items

@protected_router.post("/items/create/", response_model=schemas.Item)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    existing_item = db.query(models.Item).filter(models.Item.name == item.name).first()
    if existing_item:
        raise HTTPException(status_code=400, detail="Item with this name already exists")
    return crud.create_item(db=db, item=item)

@protected_router.patch("/items/update/{item_id}", response_model=schemas.Item)
def update_item(item_id: int, item: schemas.ItemUpdate, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return crud.update_item(db=db, db_item=db_item, item=item)

@protected_router.delete("/items/delete/{item_id}", response_model=schemas.Item)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return crud.delete_item(db=db, db_item=db_item)

@protected_router.post("/items/{item_id}/check_price", response_model=float)
def check_price(item_id: int, configurations: List[Dict], db: Session = Depends(get_db)):
    price = crud.check_item_price(db, item_id=item_id, configurations=configurations)
    if price is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return price

# CRUD endpoints for orders
@protected_router.post("/orders/create/", response_model=schemas.Order)
def create_order(db: Session = Depends(get_db)):
    return crud.create_order(db=db)

@protected_router.put("/orders/{order_id}/add/{item_id}", response_model=schemas.Order)
def add_to_active_order(order_id: int, item_id: int, configurations: List[Dict], db: Session = Depends(get_db)):
    order = crud.get_order(db, order_id=order_id)
    item = crud.get_item(db, item_id=item_id)
    if any([not order, not item]):
        raise HTTPException(status_code=404, detail="Order or item not found")
    return crud.add_to_active_order(db=db, db_order=order, db_item=item, configurations=configurations)

@protected_router.patch("/orders/{order_id}/update", response_model=schemas.Order)
def update_order(order_id: int, order: schemas.Order, db: Session = Depends(get_db)):
    return crud.update_order(db=db, order_id=order_id, order=order)

@protected_router.get("/orders/{order_id}", response_model=schemas.Order)
def get_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@protected_router.get("/orders", response_model=List[schemas.Order])
def get_orders(status: str = "submitted", db: Session = Depends(get_db)):
    db_orders = crud.get_orders(db, status=status)
    if not db_orders:
        raise HTTPException(status_code=404, detail="No orders found")
    return db_orders

@protected_router.post("/orders/{order_id}/print_receipt", response_model=schemas.Order)
def print_receipt(order_id: int, db: Session = Depends(get_db)):
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return crud.print_receipt(db, db_order=db_order)

@protected_router.post("/orders/{order_id}/print_tickets", response_model=List[schemas.Ticket])
def print_tickets(order_id: int, tickets: List[schemas.Ticket], db: Session = Depends(get_db)):
    return crud.print_tickets(db, order_id, tickets)

@protected_router.delete("/orders/{order_id}/delete", response_model=schemas.Order)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return crud.delete_order(db, db_order)

@protected_router.get("/orders-items/items/{order_id}", response_model=List[schemas.OrderItem])
def get_order_items(order_id: int, db: Session = Depends(get_db)):
    return crud.get_order_items(db, order_id=order_id)

@protected_router.get("/orders-items/item/{order_item_id}", response_model=schemas.OrderItem)
def get_order_item(order_item_id: int, db: Session = Depends(get_db)):
    db_order_item = crud.get_order_item(db, order_item_id=order_item_id)
    if db_order_item is None:
        raise HTTPException(status_code=404, detail="Order item not found")
    return db_order_item

@protected_router.patch("/orders-items/{order_item_id}/update", response_model=schemas.OrderItemUpdate)
def update_order_item(order_item_id: int, order_item_update: schemas.OrderItemUpdate, db: Session = Depends(get_db)):
    db_order_item = crud.update_order_item(db=db, order_item_id=order_item_id, order_item_update=order_item_update)
    if not db_order_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    return db_order_item

@protected_router.delete("/orders-items/{order_item_id}/delete", response_model=schemas.OrderItemDelete)
def delete_order_item(order_item_id: int, db: Session = Depends(get_db)):
    db_order_item = crud.get_order_item(db, order_item_id=order_item_id)
    if db_order_item is None:
        raise HTTPException(status_code=404, detail="Order item not found")
    return crud.delete_order_item(db, db_order_item)

# CRUD endpoints for categories
@protected_router.get("/categories/", response_model=Union[List[schemas.Category], List[schemas.CategoryWithItems]])
def read_categories(include_items: bool = Query(False, description="Include items in response"), db: Session = Depends(get_db)):
    categories = crud.get_categories(db, include_items=include_items)
    if not categories:
        raise HTTPException(status_code=404, detail="No categories found")
    if include_items:
        return [schemas.CategoryWithItems.model_validate(category) for category in categories]
    else:
        return [schemas.Category.model_validate(category) for category in categories]

@protected_router.post("/categories/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db=db, category=category)

@protected_router.post("/open-drawer")
def open_drawer(db: Session = Depends(get_db)):
    return crud.open_cash_drawer(db)


# Auth endpoints
@app.post("/token", response_model=auth.Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@protected_router.post("/users/", response_model=auth.UserBase)
def create_user(user: auth.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_admin_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        disabled=False,
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[auth.UserBase])
def read_users(db: Session = Depends(get_db)):
    users = auth.get_users(db)
    return users

@protected_router.get("/users/me/", response_model=auth.UserBase)
async def read_users_me(
    current_user: models.User = Depends(auth.get_current_active_user),
):
    return current_user

# misc
@protected_router.get("/reports/", response_model=List[schemas.TransactionTotals])
def get_reports(db: Session = Depends(get_db)):
    return crud.get_reports(db)

app.include_router(protected_router)

