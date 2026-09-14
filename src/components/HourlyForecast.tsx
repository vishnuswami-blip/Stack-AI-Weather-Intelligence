import React, { useRef } from "react";
import { Clock, Droplets, ChevronLeft, ChevronRight } from "lucide-react";
import { HourlyForecastItem } from "../types";
import { WeatherIcon } from "./WeatherIcon";
import { getWeatherCodeInfo } from "../utils/weatherCodes";

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  tempUnit: string;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, tempUnit }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!hourly || hourly.length === 0) return null;

  // Compute min and max for svg trend
  const temps = hourly.map((h) => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);

  return (
    <div
      id="hourly-forecast-card"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            24-Hour Hourly Timeline
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hourly Scroll List */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
      >
        {hourly.map((item, index) => {
          const isCurrent = index === 0;
          const info = getWeatherCodeInfo(item.weatherCode, true);
          // Visual height relative to range for subtle bar indicator
          const heightPercent = 25 + ((item.temperature - minTemp) / tempRange) * 50;

          return (
            <div
              key={item.time}
              className={`flex flex-col items-center justify-between min-w-[76px] py-3 px-2 rounded-xl border transition shrink-0 ${
                isCurrent
                  ? "bg-sky-50/70 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/80 shadow-xs"
                  : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/60 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
              }`}
            >
              {/* Hour time */}
              <span
                className={`text-xs font-medium mb-2 ${
                  isCurrent ? "text-sky-700 dark:text-sky-300 font-semibold" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {isCurrent ? "Now" : item.hourDisplay}
              </span>

              {/* Weather icon */}
              <div className="my-1">
                <WeatherIcon
                  name={info.iconName}
                  className={`w-6 h-6 ${info.accentColor}`}
                />
              </div>

              {/* Temperature */}
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                {item.temperature}{tempUnit}
              </div>

              {/* Rain chance pill */}
              <div className="mt-2 min-h-[18px]">
                {item.precipitationProb > 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded-full">
                    <Droplets className="w-2.5 h-2.5" />
                    {item.precipitationProb}%
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">-</span>
                )}
              </div>

              {/* Mini temperature relative bar */}
              <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${heightPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
