from pydantic import BaseModel, ConfigDict, Field


class DepartmentCreate(BaseModel):
    hospital_id: str
    name: str = Field(min_length=1, max_length=100)
    status: str = "operational"


class DepartmentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    status: str | None = None


class DepartmentResponse(BaseModel):
    id: str
    hospital_id: str
    name: str
    status: str

    model_config = ConfigDict(from_attributes=True)
