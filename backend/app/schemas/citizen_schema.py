from pydantic import BaseModel, Field
# pyrefly: ignore [missing-import]
from bson import ObjectId

class CitizenModel(BaseModel):
    id: str = Field(..., alias="_id", description="MongoDB ObjectId as string")
    role: str = Field(default="citizen", description="User role, always 'citizen'")

    class Config:
        allow_population_by_field_name = True
        orm_mode = True
