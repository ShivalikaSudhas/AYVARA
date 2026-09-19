from pydantic import BaseModel, ConfigDict, Field
class BloodInventoryCreate(BaseModel):
    hospital_id: str
    blood_type: str = Field(min_length=1, max_length=10)
    available_units: int = Field(default=0, ge=0)
    minimum_units: int = Field(default=0, ge=0)


class BloodInventoryUpdate(BaseModel):
    available_units: int | None = Field(default=None, ge=0)
    minimum_units: int | None = Field(default=None, ge=0)


class BloodInventoryResponse(BaseModel):
    id: str
    hospital_id: str
    blood_type: str
    available_units: int
    minimum_units: int

    model_config = ConfigDict(from_attributes=True)
