import { DailyWeatherData } from "./types";

export function downloadAsCSV(data: DailyWeatherData, filename: string) {
  if (!data || !data.time) return;

  const headers = ["Date", "Max Temp (C)", "Min Temp (C)", "Apparent Max (C)", "Apparent Min (C)"];
  const rows = data.time.map((time, index) => [
    time,
    data.temperature_2m_max[index],
    data.temperature_2m_min[index],
    data.apparent_temperature_max[index],
    data.apparent_temperature_min[index]
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(e => e.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export function downloadAsJSON(data: unknown, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  downloadBlob(blob, `${filename}.json`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
