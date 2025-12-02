# models/rima/inventory_routes.py

import io
import time
from datetime import datetime, timedelta
from typing import List

import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from PIL import Image

# Relative imports inside the `models` package
from ..laraib.multi_model_detection import detect_best_conf
from .ocr_mistral import ocr_bill_mistral

router = APIRouter()

class InventoryItem(BaseModel):
    id: int
    name: str
    category: str
    quantity: int
    expiryDate: str
    status: str
    daysLeft: int


# In-memory inventory (resets when server restarts)
inventory: List[InventoryItem] = []


def compute_status(days_left: int) -> str:
    if days_left <= 0:
        return "expired"
    if days_left <= 2:
        return "expiring"
    return "fresh"


@router.get("/inventory")
def get_inventory():
    """Return inventory with updated daysLeft + status."""
    today = datetime.now()
    for item in inventory:
        exp = datetime.strptime(item.expiryDate, "%Y-%m-%d")
        item.daysLeft = (exp - today).days
        item.status = compute_status(item.daysLeft)
    return inventory


@router.post("/inventory")
def add_item(item: InventoryItem):
    """Add an item manually (used if you post from frontend)."""
    inventory.append(item)
    return {"message": "Item added", "item": item}


@router.delete("/inventory/{item_id}")
def delete_item(item_id: int):
    global inventory
    inventory = [i for i in inventory if i.id != item_id]
    return {"message": "Deleted"}


@router.post("/inventory/scan-item")
async def scan_item(file: UploadFile = File(...)):
    """
    Scan a single ingredient photo with YOLO and add it to inventory.
    """
    img = Image.open(io.BytesIO(await file.read()))
    arr = np.array(img)

    labels, _, _ = detect_best_conf(arr, "auto")

    if not labels:
        raise HTTPException(status_code=400, detail="No ingredient detected")

    name = labels[0].title()
    days = 5  # default shelf-life guess

    item = InventoryItem(
        id=int(time.time() * 1000),
        name=name,
        category="Unknown",
        quantity=1,
        expiryDate=(datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d"),
        status=compute_status(days),
        daysLeft=days,
    )

    inventory.append(item)
    return item


@router.post("/inventory/scan-bill")
async def scan_bill(file: UploadFile = File(...)):
    """
    Scan a grocery bill using Mistral OCR and add detected items to inventory.
    """
    img = Image.open(io.BytesIO(await file.read()))
    names = ocr_bill_mistral(img)

    if not names:
        raise HTTPException(status_code=400, detail="No grocery items found")

    new_items: List[InventoryItem] = []

    for name in names:
        days = 7  # default for packaged groceries
        item = InventoryItem(
            id=int(time.time() * 1000),
            name=name.capitalize(),
            category="Unknown",
            quantity=1,
            expiryDate=(datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d"),
            status=compute_status(days),
            daysLeft=days,
        )
        inventory.append(item)
        new_items.append(item)

        # tiny sleep to avoid duplicate IDs on fast loops
        time.sleep(0.001)

    return {"added": new_items}


@router.post("/inventory/barcode")
async def scan_barcode(file: UploadFile = File(...)):
    """
    Placeholder for barcode recognition. Currently unimplemented.
    """
    raise HTTPException(status_code=501, detail="Barcode support coming soon")
