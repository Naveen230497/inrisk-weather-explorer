"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DailyWeatherData } from "../lib/types";

interface WeatherDataTableProps {
  data: DailyWeatherData;
}

export default function WeatherDataTable({ data }: WeatherDataTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Combine columns into rows
  const rows = data.time.map((timeStr, index) => {
    return {
      date: format(new Date(timeStr), "MMM dd, yyyy"),
      maxTemp: data.temperature_2m_max[index],
      minTemp: data.temperature_2m_min[index],
      appMaxTemp: data.apparent_temperature_max[index],
      appMinTemp: data.apparent_temperature_min[index],
    };
  });
  
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / pageSize);
  
  // Prevent page out of bounds when page size changes
  const safePage = Math.min(page, totalPages);
  if (page !== safePage) setPage(safePage);
  
  const startIndex = (safePage - 1) * pageSize;
  const visibleRows = rows.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl w-full flex flex-col overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs uppercase bg-white/5 text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium tracking-wider">Date</th>
              <th scope="col" className="px-6 py-4 font-medium tracking-wider">Max Temp (°C)</th>
              <th scope="col" className="px-6 py-4 font-medium tracking-wider">Min Temp (°C)</th>
              <th scope="col" className="px-6 py-4 font-medium tracking-wider">App. Max (°C)</th>
              <th scope="col" className="px-6 py-4 font-medium tracking-wider">App. Min (°C)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {visibleRows.map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{row.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-red-300">{row.maxTemp?.toFixed(1) ?? '--'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-blue-300">{row.minTemp?.toFixed(1) ?? '--'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-red-200/70">{row.appMaxTemp?.toFixed(1) ?? '--'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-blue-200/70">{row.appMinTemp?.toFixed(1) ?? '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Rows per page:</span>
          <select 
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-black/50 border border-white/10 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">{startIndex + 1}</span> to <span className="font-medium text-white">{Math.min(startIndex + pageSize, totalRows)}</span> of <span className="font-medium text-white">{totalRows}</span>
          </span>
          
          <div className="flex gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
