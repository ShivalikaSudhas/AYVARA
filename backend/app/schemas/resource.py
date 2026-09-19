from pydantic import BaseModel, ConfigDict, Field


class ResourceCreate(BaseModel):
    department_id: str
    resource_type: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=100)
    total_quantity: int = Field(default=0, ge=0)
    available_quantity: int = Field(default=0, ge=0)
    status: str = "available"


class ResourceUpdate(BaseModel):
    resource_type: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=100)
    total_quantity: int | None = Field(default=None, ge=0)
    available_quantity: int | None = Field(default=None, ge=0)
    status: str | None = None


class ResourceResponse(BaseModel):
    id: str
    department_id: str
    resource_type: str
    name: str
    total_quantity: int
    available_quantity: int
    status: str

    model_config = ConfigDict(from_attributes=True)
