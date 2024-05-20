from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, Query, Depends, HTTPException
from sqlalchemy.orm import Session
import logging, json
from typing import List, Dict, Union

from . import crud, models, schemas
from .database import SessionLocal, engine

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

# Root endpoint
@app.get("/yescus")
async def root(request: Request):
    return {
        "message": "Yescus is very very very very smart",
        "root_path": request.scope.get("root_path"),
    }

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CRUD endpoints for items
@app.get("/items/", response_model=List[schemas.Item])
def read_items(db: Session = Depends(get_db)):
    return crud.get_items(db)

@app.post("/items/create/", response_model=schemas.Item)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    existing_item = db.query(models.Item).filter(models.Item.name == item.name).first()
    if existing_item:
        raise HTTPException(status_code=400, detail="Item with this name already exists")
    return crud.create_item(db=db, item=item)

@app.put("/items/update/{item_id}", response_model=schemas.Item)
def update_item(item_id: int, item: schemas.ItemUpdate, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return crud.update_item(db=db, item_id=item_id, item=item)

@app.patch("/items/update/{item_id}/field", response_model=schemas.Item)
def update_item_field(item_id: int, payload: schemas.UpdateItemField, db: Session = Depends(get_db)):
    db_item = crud.update_item_field(db, item_id=item_id, field=payload.field, value=payload.value)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.delete("/items/delete/{item_id}", response_model=schemas.Item)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return crud.delete_item(db=db, item_id=item_id)

@app.post("/items/{item_id}/check_price", response_model=float)
def check_price(item_id: int, configurations: List[Dict], db: Session = Depends(get_db)):
    price = crud.check_item_price(db, item_id=item_id, configurations=configurations)
    if price is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return price

# CRUD endpoints for orders
@app.post("/orders/create/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    return crud.create_order(db=db, order=order)

@app.put("/orders/{order_id}/add/{item_id}", response_model=schemas.Order)
def add_to_active_order(order_id: int, item_id: int, configurations: List[Dict], db: Session = Depends(get_db)):
    return crud.add_to_active_order(db=db, order_id=order_id, item_id=item_id, configurations=configurations)

@app.patch("/orders/{order_id}/update", response_model=schemas.Order)
def update_order(order_id: int, order: schemas.OrderUpdate, db: Session = Depends(get_db)):
    return crud.update_order(db=db, order_id=order_id, order=order)

@app.get("/orders/{order_id}", response_model=schemas.Order)
def get_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@app.get("/orders", response_model=List[schemas.Order])
def get_orders(status: str = "submitted", db: Session = Depends(get_db)):
    db_orders = crud.get_orders(db, status=status)
    if not db_orders:
        raise HTTPException(status_code=404, detail="No orders found")
    return db_orders

@app.delete("/orders/{order_id}/delete", response_model=schemas.Order)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud.delete_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@app.get("/orders-items/{order_id}", response_model=List[schemas.OrderItem])
def get_order_items(order_id: int, db: Session = Depends(get_db)):
    return crud.get_order_items(db, order_id=order_id)

@app.patch("/orders-items/{order_item_id}/update", response_model=schemas.OrderItemUpdate)
def update_order_item(order_item_id: int, order_item_update: schemas.OrderItemUpdate, db: Session = Depends(get_db)):
    db_order_item = crud.update_order_item(db=db, order_item_id=order_item_id, order_item_update=order_item_update)
    if not db_order_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    return db_order_item

@app.delete("/orders-items/{order_item_id}/delete", response_model=schemas.OrderItemDelete)
def delete_order_item(order_item_id: int, db: Session = Depends(get_db)):
    db_order_item = crud.delete_order_item(db, order_item_id)
    if db_order_item is None:
        raise HTTPException(status_code=404, detail="Order item not found")
    return db_order_item

# CRUD endpoints for categories
@app.get("/categories/", response_model=Union[List[schemas.Category], List[schemas.CategoryWithItems]])
def read_categories(include_items: bool = Query(False, description="Include items in response"), db: Session = Depends(get_db)):
    categories = crud.get_categories(db, include_items=include_items)
    if include_items:
        return [schemas.CategoryWithItems.model_validate(category) for category in categories]
    else:
        return [schemas.Category.model_validate(category) for category in categories]

@app.post("/categories/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db=db, category=category)
