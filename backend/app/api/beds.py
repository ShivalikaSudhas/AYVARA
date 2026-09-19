from uuid import uuid4
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.database.session import get_db
from app.models.bed import Bed
from app.models.department import Department
from app.schemas.bed import (
    BedCreate,
    BedResponse,
    BedUpdate,
)


router = APIRouter(
    prefix="/beds",
    tags=["Beds"],
)


@router.post(
    "",
    response_model=BedResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_bed(
    bed_data: BedCreate,
    db: Any = Depends(get_db),
):
    department = db.get(
        Department,
        bed_data.department_id,
    )

    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    existing_bed = db.execute(
        select(Bed).where(
            Bed.department_id == bed_data.department_id,
            Bed.bed_number == bed_data.bed_number,
        )
    ).scalar_one_or_none()

    if existing_bed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bed number already exists in this department",
        )

    bed = Bed(
        id=f"bed_{uuid4().hex[:8]}",
        department_id=bed_data.department_id,
        bed_number=bed_data.bed_number,
        bed_type=bed_data.bed_type,
        status=bed_data.status,
    )

    db.add(bed)
    db.commit()
    db.refresh(bed)

    return bed


@router.get(
    "",
    response_model=list[BedResponse],
)
def get_beds(
    department_id: str | None = None,
    bed_type: str | None = None,
    status_filter: str | None = None,
    db: Any = Depends(get_db),
):
    query = select(Bed).order_by(Bed.bed_number)

    if department_id:
        query = query.where(
            Bed.department_id == department_id
        )

    if bed_type:
        query = query.where(
            Bed.bed_type == bed_type
        )

    if status_filter:
        query = query.where(
            Bed.status == status_filter
        )

    result = db.execute(query)

    return result.scalars().all()


@router.get(
    "/{bed_id}",
    response_model=BedResponse,
)
def get_bed(
    bed_id: str,
    db: Any = Depends(get_db),
):
    bed = db.get(Bed, bed_id)

    if bed is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bed not found",
        )

    return bed


@router.put(
    "/{bed_id}",
    response_model=BedResponse,
)
def update_bed(
    bed_id: str,
    bed_data: BedUpdate,
    db: Any = Depends(get_db),
):
    bed = db.get(Bed, bed_id)

    if bed is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bed not found",
        )

    update_data = bed_data.model_dump(exclude_unset=True)

    if "bed_number" in update_data:
        existing_bed = db.execute(
            select(Bed).where(
                Bed.department_id == bed.department_id,
                Bed.bed_number == update_data["bed_number"],
                Bed.id != bed.id,
            )
        ).scalar_one_or_none()

        if existing_bed:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bed number already exists in this department",
            )

    for field, value in update_data.items():
        setattr(bed, field, value)

    db.commit()
    db.refresh(bed)

    return bed


@router.delete(
    "/{bed_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_bed(
    bed_id: str,
    db: Any = Depends(get_db),
):
    bed = db.get(Bed, bed_id)

    if bed is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bed not found",
        )

    db.delete(bed)
    db.commit()
