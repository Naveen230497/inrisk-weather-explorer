import pytest
from pydantic import ValidationError
from datetime import date, timedelta
from app.models.schemas import WeatherRequest

def test_valid_weather_request():
    req = WeatherRequest(
        latitude=52.52,
        longitude=13.41,
        start_date=date(2023, 1, 1),
        end_date=date(2023, 1, 7)
    )
    assert req.latitude == 52.52
    assert req.longitude == 13.41

def test_invalid_latitude():
    with pytest.raises(ValidationError):
        WeatherRequest(
            latitude=91.0,
            longitude=0.0,
            start_date=date(2023, 1, 1),
            end_date=date(2023, 1, 7)
        )

def test_invalid_longitude():
    with pytest.raises(ValidationError):
        WeatherRequest(
            latitude=0.0,
            longitude=-181.0,
            start_date=date(2023, 1, 1),
            end_date=date(2023, 1, 7)
        )

def test_end_date_before_start_date():
    with pytest.raises(ValidationError) as exc:
        WeatherRequest(
            latitude=0.0,
            longitude=0.0,
            start_date=date(2023, 1, 7),
            end_date=date(2023, 1, 1)
        )
    assert "end_date must be greater than or equal to start_date" in str(exc.value)

def test_date_range_too_large():
    with pytest.raises(ValidationError) as exc:
        WeatherRequest(
            latitude=0.0,
            longitude=0.0,
            start_date=date(2023, 1, 1),
            end_date=date(2023, 2, 5) # 35 days
        )
    assert "Date range must not exceed 31 days" in str(exc.value)

def test_future_date_rejected():
    future_date = date.today() + timedelta(days=1)
    with pytest.raises(ValidationError) as exc:
        WeatherRequest(
            latitude=0.0,
            longitude=0.0,
            start_date=date.today(),
            end_date=future_date
        )
    assert "Dates cannot be in the future" in str(exc.value)
