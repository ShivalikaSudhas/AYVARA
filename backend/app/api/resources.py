from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select  # type: ignore[import-not-found]
from sqlalchemy.orm import Session  # type: ignore[import-not-found]

from app.database.session import get_db
from app.models.department import Department
from app.models.resource import Resource
from app.schemas.resource import (
    ResourceCreate,
    ResourceResponse,
    ResourceUpdate,
)


router = APIRouter(
    prefix="/resources",
    tags=["Resources"],
)


@router.post(
    "",
    response_model=ResourceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_resource(
    resource_data: ResourceCreate,
    db: Session = Depends(get_db),
):
    department = db.get(
        Department,
        resource_data.department_id,
    )

    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    if resource_data.available_quantity > resource_data.total_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Available quantity cannot exceed total quantity",
        )

    resource = Resource(
        id=f"res_{uuid4().hex[:8]}",
        department_id=resource_data.department_id,
        resource_type=resource_data.resource_type,
        name=resource_data.name,
        total_quantity=resource_data.total_quantity,
        available_quantity=resource_data.available_quantity,
        status=resource_data.status,
    )

    db.add(resource)
    db.commit()
    db.refresh(resource)

    return resource


@router.get(
    "",
    response_model=list[ResourceResponse],
)
def get_resources(
    department_id: str | None = None,
    resource_type: str | None = None,
    db: Session = Depends(get_db),
):
    query = select(Resource).order_by(Resource.name)

    if department_id:
        query = query.where(
            Resource.department_id == department_id
        )

    if resource_type:
        query = query.where(
            Resource.resource_type == resource_type
        )

    result = db.execute(query)

    return result.scalars().all()


@router.get(
    "/{resource_id}",
    response_model=ResourceResponse,
)
def get_resource(
    resource_id: str,
    db: Session = Depends(get_db),
):
    resource = db.get(Resource, resource_id)

    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )

    return resource


@router.put(
    "/{resource_id}",
    response_model=ResourceResponse,
)
def update_resource(
    resource_id: str,
    resource_data: ResourceUpdate,
    db: Session = Depends(get_db),
):
    resource = db.get(Resource, resource_id)

    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )

    update_data = resource_data.model_dump(exclude_unset=True)

    new_total = update_data.get(
        "total_quantity",
        resource.total_quantity,
    )

    new_available = update_data.get(
        "available_quantity",
        resource.available_quantity,
    )

    if new_available > new_total:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Available quantity cannot exceed total quantity",
        )

    for field, value in update_data.items():
        setattr(resource, field, value)

    db.commit()
    db.refresh(resource)

    return resource


@router.delete(
    "/{resource_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_resource(
    resource_id: str,
    db: Session = Depends(get_db),
):
    resource = db.get(Resource, resource_id)

    if resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found",
        )

    db.delete(resource)
    db.commit()
