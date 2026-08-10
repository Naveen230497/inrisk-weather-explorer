"use client";

import React from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { DailyWeatherData } from "../lib/types";
import { downloadAsCSV, downloadAsJSON } from "../lib/export";
import { toast } from "sonner";

interface TemperatureChartProps {
  data: DailyWeatherData;
  filename: string;
}

export default function TemperatureChart({ data, filename }: TemperatureChartProps) {
  
  const chartData = data.time.map((timeStr, index) => {
    const date = new Date(timeStr);
    return {
      date: format(date, "MMM dd"),
      fullDate: format(date, "MMM dd, yyyy"),
      maxTemp: data.temperature_2m_max[index],
      minTemp: data.temperature_2m_min[index],
    };
  });

  const handleExportCSV = () => {
    downloadAsCSV(data, filename.replace('.json', ''));
    toast.success("CSV Downloaded!");
  };

  const handleExportJSON = () => {
    downloadAsJSON(data, filename.replace('.json', ''));
    toast.success("JSON Downloaded!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl w-full"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Temperature Trends</h2>
          <p className="text-sm text-gray-400 font-mono mt-1">{filename}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/10"
          >
            <Download className="w-3 h-3" /> JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors border border-blue-500/30"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-10}
              unit="°"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(5, 5, 16, 0.9)', 
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
              itemStyle={{ fontSize: '13px', fontWeight: 600 }}
              labelStyle={{ color: '#9ca3af', marginBottom: '8px', fontSize: '12px' }}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
            />
            
            <Area 
              type="monotone" 
              dataKey="maxTemp" 
              name="Max Temp"
              stroke="#f43f5e" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMax)" 
            />
            <Area 
              type="monotone" 
              dataKey="minTemp" 
              name="Min Temp"
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMin)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
