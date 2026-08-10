import { WeatherRequest, StoreResponse, FileListResponse, WeatherFileContent } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function storeWeatherData(payload: WeatherRequest): Promise<StoreResponse> {
  const res = await fetch(`${API_BASE}/store-weather-data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new ApiError(res.status, error.message || "Failed to store data");
  }
  
  return res.json();
}

export async function listWeatherFiles(): Promise<FileListResponse> {
  const res = await fetch(`${API_BASE}/list-weather-files`);
  if (!res.ok) {
    throw new ApiError(res.status, "Failed to list files");
  }
  return res.json();
}

export async function getWeatherFileContent(filename: string): Promise<WeatherFileContent> {
  const res = await fetch(`${API_BASE}/weather-file-content/${encodeURIComponent(filename)}`);
  
  if (res.status === 404) {
    throw new ApiError(404, "File not found");
  }
  if (!res.ok) {
    throw new ApiError(res.status, "Failed to fetch file content");
  }
  
  return res.json();
}
