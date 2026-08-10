import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)

@patch("app.routes.weather.fetch_historical_weather")
@patch("app.routes.weather.storage.storage")
def test_store_weather_data_success(mock_storage, mock_fetch):
    mock_fetch.return_value = {"mock": "data"}
    mock_storage.upload_json.return_value = "mock_file.json"
    
    response = client.post("/store-weather-data", json={
        "latitude": 52.52,
        "longitude": 13.41,
        "start_date": "2023-01-01",
        "end_date": "2023-01-07"
    })
    
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["file"].startswith("weather_52.52_13.41")

def test_store_weather_data_validation_error():
    response = client.post("/store-weather-data", json={
        "latitude": 95.0, # invalid
        "longitude": 13.41,
        "start_date": "2023-01-01",
        "end_date": "2023-01-07"
    })
    
    assert response.status_code == 400
    assert "status" in response.json()
    assert response.json()["status"] == "error"

@patch("app.routes.weather.storage.storage")
def test_list_weather_files(mock_storage):
    mock_storage.list_files.return_value = [
        {"name": "test1.json", "size": 100, "created_at": "2023-01-01T00:00:00Z"}
    ]
    
    response = client.get("/list-weather-files")
    
    assert response.status_code == 200
    data = response.json()
    assert "files" in data
    assert len(data["files"]) == 1
    assert data["files"][0]["name"] == "test1.json"

@patch("app.routes.weather.storage.storage")
def test_get_weather_file_content_success(mock_storage):
    mock_storage.get_file.return_value = {"mock": "data"}
    
    # Valid filename format
    filename = "weather_52.52_13.41_2023-01-01_2023-01-07_20240101T000000Z.json"
    response = client.get(f"/weather-file-content/{filename}")
    
    assert response.status_code == 200
    assert response.json() == {"mock": "data"}
    
@patch("app.routes.weather.storage.storage")
def test_get_weather_file_content_not_found(mock_storage):
    mock_storage.get_file.return_value = None
    
    filename = "weather_52.52_13.41_2023-01-01_2023-01-07_20240101T000000Z.json"
    response = client.get(f"/weather-file-content/{filename}")
    
    assert response.status_code == 404
