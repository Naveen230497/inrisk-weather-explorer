from fastapi import APIRouter, HTTPException, status
from typing import Optional
from datetime import datetime
import urllib.parse
import re

from app.models.schemas import (
    WeatherRequest, 
    StoreResponse, 
    FileListResponse, 
    ErrorResponse
)
from app.services.open_meteo import fetch_historical_weather, WeatherAPIError
from app.services import storage

router = APIRouter()

def generate_filename(lat: float, lon: float, start: str, end: str) -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    return f"weather_{lat}_{lon}_{start}_{end}_{timestamp}.json"

@router.post(
    "/store-weather-data", 
    response_model=StoreResponse,
    responses={
        400: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def store_weather_data(request: WeatherRequest):
    try:
        # Fetch from Open-Meteo
        weather_data = await fetch_historical_weather(
            lat=request.latitude,
            lon=request.longitude,
            start_date=request.start_date.isoformat(),
            end_date=request.end_date.isoformat()
        )
        
        # Generate filename
        filename = generate_filename(
            lat=request.latitude,
            lon=request.longitude,
            start=request.start_date.isoformat(),
            end=request.end_date.isoformat()
        )
        
        # Store in S3/Local
        storage.storage.upload_json(filename, weather_data)
        
        return StoreResponse(status="ok", file=filename)
        
    except WeatherAPIError as e:
        status_code = status.HTTP_502_BAD_GATEWAY
        if "status 429" in str(e):
            status_code = status.HTTP_429_TOO_MANY_REQUESTS
        raise HTTPException(
            status_code=status_code,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Storage service error: {str(e)}"
        )

@router.get(
    "/list-weather-files",
    response_model=FileListResponse
)
async def list_weather_files():
    try:
        files = storage.storage.list_files()
        return FileListResponse(files=files)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list files: {str(e)}"
        )

@router.get(
    "/weather-file-content/{file_name:path}",
    responses={
        404: {"model": ErrorResponse},
        400: {"model": ErrorResponse}
    }
)
async def get_weather_file_content(file_name: str):
    # Decode URL-encoded filename
    decoded_name = urllib.parse.unquote(file_name)
    
    # Strict validation to prevent path traversal
    # Format: weather_{lat}_{lon}_{start}_{end}_{timestamp}.json
    pattern = r"^weather_[-0-9\.]+_{1}[-0-9\.]+_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}_\d{8}T\d{6}Z\.json$"
    
    if not re.match(pattern, decoded_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename format"
        )
        
    try:
        content = storage.storage.get_file(decoded_name)
        if content is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        return content
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve file: {str(e)}"
        )
