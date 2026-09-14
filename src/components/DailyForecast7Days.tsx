import React, { useState } from "react";
import {
  CalendarDays,
  Droplets,
  Sunrise,
  Sunset,
  Wind,
  SunMedium,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DailyForecastItem } from "../types";
import { WeatherIcon } from "./WeatherIcon";
import { getWeatherCodeInfo } from "../utils/weatherCodes";

interface DailyForecast7DaysProps {
  daily: DailyForecastItem[];
  tempUnit: string;
  windUnit: string;
  precipUnit: string;
}

export const DailyForecast7Days: React.FC<DailyForecast7DaysProps> = ({
  daily,
  tempUnit,
  windUnit,
  precipUnit,
}) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  if (!daily || daily.length === 0) return null;

  // Calculate global min and max across the 7 days for proper visual scale
  const allMins = daily.map((d) => d.tempMin);
  const allMaxs = daily.map((d) => d.tempMax);
  const weekMin = Math.min(...allMins);
  const weekMax = Math.max(...allMaxs);
  const weekRange = Math.max(1, weekMax - weekMin);

  const toggleExpand = (date: string) => {
    setExpandedDay((prev) => (prev === date ? null : date));
  };

  return (
    <div
      id="seven-day-forecast-card"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-sky-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            7-Day Weather Forecast
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Click any day for detailed metrics
        </span>
      </div>

      {/* List of 7 Days */}
      <div className="space-y-2">
        {daily.slice(0, 7).map((day, index) => {
          const isToday = index === 0;
          const isExpanded = expandedDay === day.date;
          const info = getWeatherCodeInfo(day.weatherCode, true);

          // Calculate left offset and width for the temperature bar
          const leftPercent = ((day.tempMin - weekMin) / weekRange) * 100;
          const widthPercent = Math.max(8, ((day.tempMax - day.tempMin) / weekRange) * 100);

          return (
            <div
              key={day.date}
              id={`forecast-day-${day.dayName.toLowerCase()}`}
              className={`rounded-xl border transition overflow-hidden ${
                isToday
                  ? "border-sky-200 dark:border-sky-900/60 bg-sky-50/20 dark:bg-sky-950/20"
                  : "border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20 hover:bg-slate-100/40 dark:hover:bg-slate-800/40"
              }`}
            >
              {/* Main Row */}
              <div
                onClick={() => toggleExpand(day.date)}
                className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                {/* Day name & date */}
                <div className="flex items-center gap-3 sm:w-44">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-2xs">
                    <WeatherIcon
                      name={info.iconName}
                      className={`w-5 h-5 ${info.accentColor}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {day.dayName}
                      </span>
                      {isToday && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-md bg-sky-500 text-white">
                          Now
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {day.formattedDate}
                    </span>
                  </div>
                </div>

                {/* Weather Condition & Rain Probability */}
                <div className="flex items-center gap-4 sm:w-48">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {day.weatherDescription}
                  </span>
                  {day.precipitationProbabilityMax > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full shrink-0">
                      <Droplets className="w-3 h-3" />
                      {day.precipitationProbabilityMax}%
                    </span>
                  )}
                </div>

                {/* Min / Max Temperature with graphical range bar */}
                <div className="flex items-center gap-3 flex-1 max-w-xs justify-end">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-8 text-right font-mono">
                    {day.tempMin}{tempUnit}
                  </span>

                  {/* Temperature slider bar */}
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-hidden min-w-[70px]">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-bold text-slate-900 dark:text-slate-50 w-8 text-left font-mono">
                    {day.tempMax}{tempUnit}
                  </span>

                  <div className="text-slate-400 pl-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Day Details Drawer */}
              {isExpanded && (
                <div className="px-4 py-3 bg-white dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
                    {/* Sunrise / Sunset */}
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                        <div className="text-[10px] text-slate-400">Sunrise</div>
                        <div className="font-semibold">{day.sunrise || "--:--"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Sunset className="w-3.5 h-3.5 text-orange-500" />
                      <div>
                        <div className="text-[10px] text-slate-400">Sunset</div>
                        <div className="font-semibold">{day.sunset || "--:--"}</div>
                      </div>
                    </div>

                    {/* Peak Wind */}
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Wind className="w-3.5 h-3.5 text-sky-500" />
                      <div>
                        <div className="text-[10px] text-slate-400">Max Wind</div>
                        <div className="font-semibold">{day.windSpeedMax} {windUnit}</div>
                      </div>
                    </div>

                    {/* UV Index */}
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                        <div className="text-[10px] text-slate-400">Max UV Index</div>
                        <div className="font-semibold">{day.uvIndexMax.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>

                  {day.precipitationSum > 0 && (
                    <div className="mt-2 text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span>Expected total rain accumulation: <strong>{day.precipitationSum} {precipUnit}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
