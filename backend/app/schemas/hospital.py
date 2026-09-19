from pydantic import BaseModel, ConfigDict, Field
class HospitalCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
class HospitalUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
class HospitalResponse(BaseModel):
    id: str
    name: str
    address: str | None
    latitude: float | None
    longitude: float | None

    model_config = ConfigDict(from_attributes=True)
