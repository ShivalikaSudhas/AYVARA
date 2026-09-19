from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status
from app.database.session import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import (
    HospitalCreate,
    HospitalResponse,
    HospitalUpdate,
)


router = APIRouter(
    prefix="/hospitals",
    tags=["Hospitals"],
)


@router.post(
    "",
    response_model=HospitalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_hospital(
    hospital_data: HospitalCreate,
    db=Depends(get_db),
):
    hospital = Hospital(
        id=f"hosp_{uuid4().hex[:8]}",
        name=hospital_data.name,
        address=hospital_data.address,
        latitude=hospital_data.latitude,
        longitude=hospital_data.longitude,
    )

    db.add(hospital)
    db.commit()
    db.refresh(hospital)

    return hospital


@router.get(
    "",
    response_model=list[HospitalResponse],
)
def get_hospitals(
    db=Depends(get_db),
):
    return db.query(Hospital).order_by(Hospital.name).all()


@router.get(
    "/{hospital_id}",
    response_model=HospitalResponse,
)
def get_hospital(
    hospital_id: str,
    db=Depends(get_db),
):
    hospital = db.get(Hospital, hospital_id)

    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found",
        )

    return hospital


@router.put(
    "/{hospital_id}",
    response_model=HospitalResponse,
)
def update_hospital(
    hospital_id: str,
    hospital_data: HospitalUpdate,
    db=Depends(get_db),
):
    hospital = db.get(Hospital, hospital_id)

    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found",
        )

    update_data = hospital_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(hospital, field, value)

    db.commit()
    db.refresh(hospital)

    return hospital


@router.delete(
    "/{hospital_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_hospital(
    hospital_id: str,
    db=Depends(get_db),
):
    hospital = db.get(Hospital, hospital_id)

    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found",
        )

    db.delete(hospital)
    db.commit()
