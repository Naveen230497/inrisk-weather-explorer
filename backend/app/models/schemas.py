from pydantic import BaseModel, Field, model_validator
from datetime import date
from typing import List

class WeatherRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude between -90 and 90")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude between -180 and 180")
    start_date: date = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: date = Field(..., description="End date in YYYY-MM-DD format")

    @model_validator(mode='after')
    def validate_dates(self) -> 'WeatherRequest':
        if self.start_date > self.end_date:
            raise ValueError('end_date must be greater than or equal to start_date')
        
        if (self.end_date - self.start_date).days > 31:
            raise ValueError('Date range must not exceed 31 days')
            
        if self.end_date > date.today():
            raise ValueError('Dates cannot be in the future')
            
        return self

class WeatherFileInfo(BaseModel):
    name: str
    size: int
    created_at: str

class StoreResponse(BaseModel):
    status: str
    file: str

class FileListResponse(BaseModel):
    files: List[WeatherFileInfo]

class ErrorResponse(BaseModel):
    status: str
    message: str
