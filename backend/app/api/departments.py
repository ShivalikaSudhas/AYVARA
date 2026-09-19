from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select  # type: ignore[import-not-found]
from sqlalchemy.orm import Session  # type: ignore[import-not-found]

from app.database.session import get_db
from app.models.department import Department
from app.models.hospital import Hospital
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
)


router = APIRouter(
    prefix="/departments",
    tags=["Departments"],
)


@router.post(
    "",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
):
    hospital = db.get(Hospital, department_data.hospital_id)

    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found",
        )

    department = Department(
        id=f"dept_{uuid4().hex[:8]}",
        hospital_id=department_data.hospital_id,
        name=department_data.name,
        status=department_data.status,
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return department


@router.get(
    "",
    response_model=list[DepartmentResponse],
)
def get_departments(
    hospital_id: str | None = None,
    db: Session = Depends(get_db),
):
    query = select(Department).order_by(Department.name)

    if hospital_id:
        query = query.where(
            Department.hospital_id == hospital_id
        )

    result = db.execute(query)

    return result.scalars().all()


@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def get_department(
    department_id: str,
    db: Session = Depends(get_db),
):
    department = db.get(Department, department_id)

    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    return department


@router.put(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def update_department(
    department_id: str,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
):
    department = db.get(Department, department_id)

    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    update_data = department_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(department, field, value)

    db.commit()
    db.refresh(department)

    return department


@router.delete(
    "/{department_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_department(
    department_id: str,
    db: Session = Depends(get_db),
):
    department = db.get(Department, department_id)

    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    db.delete(department)
    db.commit()
