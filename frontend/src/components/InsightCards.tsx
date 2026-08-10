"use client";

import React from "react";
import { motion } from "framer-motion";
import { ThermometerSun, ThermometerSnowflake, Activity, AlertTriangle } from "lucide-react";
import { DailyWeatherData } from "../lib/types";

interface InsightCardsProps {
  data: DailyWeatherData;
}

export default function InsightCards({ data }: InsightCardsProps) {
  if (!data || !data.time || data.time.length === 0) return null;

  const maxTemps = data.temperature_2m_max;
  const minTemps = data.temperature_2m_min;

  // Calculate absolute max
  const absoluteMax = Math.max(...maxTemps);
  const maxDayIndex = maxTemps.indexOf(absoluteMax);
  const maxDate = new Date(data.time[maxDayIndex]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Calculate absolute min
  const absoluteMin = Math.min(...minTemps);
  const minDayIndex = minTemps.indexOf(absoluteMin);
  const minDate = new Date(data.time[minDayIndex]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Calculate average variance (avg swing per day)
  let totalVariance = 0;
  for (let i = 0; i < data.time.length; i++) {
    totalVariance += (maxTemps[i] - minTemps[i]);
  }
  const avgVariance = (totalVariance / data.time.length).toFixed(1);

  // Freeze Warning
  const daysBelowFreezing = minTemps.filter(t => t < 0).length;

  const cards = [
    {
      title: "Peak Heat",
      value: `${absoluteMax.toFixed(1)}°`,
      subtitle: `Occurred on ${maxDate}`,
      icon: <ThermometerSun className="w-5 h-5 text-orange-400" />,
      color: "from-orange-500/20 to-red-500/5",
      border: "border-orange-500/20"
    },
    {
      title: "Deepest Cold",
      value: `${absoluteMin.toFixed(1)}°`,
      subtitle: `Occurred on ${minDate}`,
      icon: <ThermometerSnowflake className="w-5 h-5 text-cyan-400" />,
      color: "from-cyan-500/20 to-blue-500/5",
      border: "border-cyan-500/20"
    },
    {
      title: "Avg Daily Swing",
      value: `${avgVariance}°`,
      subtitle: "High vs Low variance",
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-500/5",
      border: "border-emerald-500/20"
    },
    {
      title: "Freeze Risk",
      value: daysBelowFreezing > 0 ? "High" : "Low",
      subtitle: `${daysBelowFreezing} days below 0°C`,
      icon: <AlertTriangle className={`w-5 h-5 ${daysBelowFreezing > 0 ? 'text-rose-400' : 'text-gray-400'}`} />,
      color: daysBelowFreezing > 0 ? "from-rose-500/20 to-pink-500/5" : "from-gray-500/20 to-gray-500/5",
      border: daysBelowFreezing > 0 ? "border-rose-500/20" : "border-gray-500/20"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full"
    >
      {cards.map((card, i) => (
        <motion.div 
          key={i}
          variants={item}
          className={`bg-gradient-to-br ${card.color} bg-black/40 backdrop-blur-xl border ${card.border} rounded-3xl p-5 shadow-xl relative overflow-hidden group`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300">
            {card.icon}
          </div>
          <p className="text-sm font-medium text-gray-400 tracking-wide uppercase">{card.title}</p>
          <p className="text-3xl font-bold text-white mt-2 mb-1">{card.value}</p>
          <p className="text-xs text-gray-500">{card.subtitle}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
