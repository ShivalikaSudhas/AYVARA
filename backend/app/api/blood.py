from uuid import uuid4
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from app.database.session import get_db
from app.models.blood_inventory import BloodInventory
from app.models.hospital import Hospital
from app.schemas.blood_inventory import (
    BloodInventoryCreate,
    BloodInventoryResponse,
    BloodInventoryUpdate,
)


router = APIRouter(
    prefix="/blood",
    tags=["Blood Inventory"],
)


@router.post(
    "",
    response_model=BloodInventoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_blood_inventory(
    blood_data: BloodInventoryCreate,
    db: Any = Depends(get_db),
):
    hospital = db.get(
        Hospital,
        blood_data.hospital_id,
    )

    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found",
        )

    existing = (
        db.query(BloodInventory)
        .filter(
            BloodInventory.hospital_id == blood_data.hospital_id,
            BloodInventory.blood_type == blood_data.blood_type,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Blood inventory already exists for this blood type",
        )

    inventory = BloodInventory(
        id=f"blood_{uuid4().hex[:8]}",
        hospital_id=blood_data.hospital_id,
        blood_type=blood_data.blood_type,
        available_units=blood_data.available_units,
        minimum_units=blood_data.minimum_units,
    )

    db.add(inventory)
    db.commit()
    db.refresh(inventory)

    return inventory


@router.get(
    "",
    response_model=list[BloodInventoryResponse],
)
def get_blood_inventory(
    hospital_id: str | None = None,
    blood_type: str | None = None,
    db: Any = Depends(get_db),
):
    query = db.query(BloodInventory).order_by(
        BloodInventory.blood_type
    )

    if hospital_id:
        query = query.filter(
            BloodInventory.hospital_id == hospital_id
        )

    if blood_type:
        query = query.filter(
            BloodInventory.blood_type == blood_type
        )

    return query.all()


@router.get(
    "/{inventory_id}",
    response_model=BloodInventoryResponse,
)
def get_blood_inventory_item(
    inventory_id: str,
    db: Any = Depends(get_db),
):
    inventory = db.get(
        BloodInventory,
        inventory_id,
    )

    if inventory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blood inventory not found",
        )

    return inventory


@router.put(
    "/{inventory_id}",
    response_model=BloodInventoryResponse,
)
def update_blood_inventory(
    inventory_id: str,
    blood_data: BloodInventoryUpdate,
    db: Any = Depends(get_db),
):
    inventory = db.get(
        BloodInventory,
        inventory_id,
    )

    if inventory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blood inventory not found",
        )

    update_data = blood_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(inventory, field, value)

    db.commit()
    db.refresh(inventory)

    return inventory


@router.delete(
    "/{inventory_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_blood_inventory(
    inventory_id: str,
    db: Any = Depends(get_db),
):
    inventory = db.get(
        BloodInventory,
        inventory_id,
    )

    if inventory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blood inventory not found",
        )

    db.delete(inventory)
    db.commit()
