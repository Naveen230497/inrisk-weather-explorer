import httpx
from typing import Dict, Any
from asyncache import cached
from cachetools import TTLCache

class WeatherAPIError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

@cached(cache=TTLCache(maxsize=200, ttl=3600))
async def _fetch_historical_weather_cached(lat: float, lon: float, start_date: str, end_date: str) -> Dict[str, Any]:
    url = "https://archive-api.open-meteo.com/v1/archive"
    
    daily_vars = [
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min"
    ]
    
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": ",".join(daily_vars),
        "timezone": "auto"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Type ignore because httpx params dict typing is overly strict in older versions
            response = await client.get(url, params=params) # type: ignore
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise WeatherAPIError(f"Weather API returned status {e.response.status_code}: {e.response.text}")
        except httpx.RequestError as e:
            raise WeatherAPIError(f"Failed to connect to Weather API: {str(e)}")

async def fetch_historical_weather(lat: float, lon: float, start_date: str, end_date: str) -> Dict[str, Any]:
    """Wraps the cached function to round lat/lon, preventing memory bloat and improving cache hits."""
    return await _fetch_historical_weather_cached(
        lat=round(lat, 2),
        lon=round(lon, 2),
        start_date=start_date,
        end_date=end_date
    )
