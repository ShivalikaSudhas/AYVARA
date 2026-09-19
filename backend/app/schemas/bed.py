from pydantic import BaseModel, ConfigDict, Field


class BedCreate(BaseModel):
    department_id: str
    bed_number: str = Field(min_length=1, max_length=50)
    bed_type: str = Field(min_length=1, max_length=50)
    status: str = "available"


class BedUpdate(BaseModel):
    bed_number: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    bed_type: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    status: str | None = None
class BedResponse(BaseModel):
    id: str
    department_id: str
    bed_number: str
    bed_type: str
    status: str

    model_config = ConfigDict(from_attributes=True)