export interface WeatherRequest {
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
}

export interface StoreResponse {
  status: string;
  file: string;
}

export interface WeatherFileInfo {
  name: string;
  size: number;
  created_at: string;
}

export interface FileListResponse {
  files: WeatherFileInfo[];
}

export interface DailyWeatherData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
}

export interface WeatherFileContent {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  daily_units: Record<string, string>;
  daily: DailyWeatherData;
}
