from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, Query
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session
import logging, json
from typing import List, Dict, Union

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

logger = logging.getLogger(__name__)


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

app = FastAPI(root_path="/api/v1")


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


@app.get("/yescus")
async def root(request: Request):
    return {
        "message": "Yescus is very very very very smart",
        "root_path": request.scope.get("root_path"),
    }


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/items/", response_model=list[schemas.Item])
def read_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = crud.get_items(db, skip=skip, limit=limit)
    return items


@app.post("/items/create/", response_model=schemas.Item)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    # Check if item with the same name already exists
    existing_item = db.query(models.Item).filter(models.Item.name == item.name).first()
    if existing_item:
        raise HTTPException(
            status_code=400, detail="Item with this name already exists"
        )

    # Create a new item if it doesn't exist
    db_item = crud.create_item(db=db, item=item)
    return db_item


@app.put("/items/update/{item_id}", response_model=schemas.Item)
def update_item(item_id: int, item: schemas.ItemUpdate, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return crud.update_item(db=db, item_id=item_id, item=item)


@app.delete("/items/delete/{item_id}", response_model=schemas.Item)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = crud.get_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return crud.delete_item(db=db, item_id=item_id)


@app.post("/orders/create/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_order = crud.create_order(db=db, order=order)
    return db_order


@app.put("/orders/{order_id}/add/{item_id}", response_model=schemas.Order)
def add_to_active_order(
    order_id: int, item_id: int, configurations: List[Dict], db: Session = Depends(get_db)
):
    print(order_id, item_id, configurations)
    db_order = crud.add_to_active_order(
        db=db, order_id=order_id, item_id=item_id, configurations=configurations
    )
    return db_order


@app.get("/orders/{order_id}", response_model=schemas.Order)
def get_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order


@app.get("/orders-items/{order_id}", response_model=list[schemas.OrderItem])
def get_order_items(order_id: int, db: Session = Depends(get_db)):
    db_order_items = crud.get_order_items(db, order_id=order_id)
    return db_order_items


@app.get(
    "/categories/",
    response_model=Union[List[schemas.Category], List[schemas.CategoryWithItems]],
)
def read_categories(
    skip: int = 0,
    limit: int = 100,
    include_items: bool = Query(False, description="Include items in response"),
    db: Session = Depends(get_db),
):
    categories = crud.get_categories(
        db, skip=skip, limit=limit, include_items=include_items
    )
    if include_items:
        return [schemas.CategoryWithItems.model_validate(category) for category in categories]
    else:
        return [schemas.Category.model_validate(category) for category in categories]


@app.post("/categories/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = crud.create_category(db=db, category=category)
    return db_category


@app.get("/order-items/{order_id}/price/{order_item_id}", response_model=float)
def get_order_item_price(
    order_id: int, order_item_id: int, db: Session = Depends(get_db)
):
    price = crud.get_order_item_price(db, order_id=order_id, order_item_id=order_item_id)
    return price
