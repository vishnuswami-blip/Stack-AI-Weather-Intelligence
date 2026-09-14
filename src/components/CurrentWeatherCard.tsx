import React from "react";
import {
  Wind,
  Droplets,
  SunMedium,
  Gauge,
  CloudRain,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { WeatherDataState } from "../types";
import { WeatherIcon } from "./WeatherIcon";
import { getWeatherCodeInfo } from "../utils/weatherCodes";

interface CurrentWeatherCardProps {
  weather: WeatherDataState;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  onRefresh,
  isRefreshing,
}) => {
  const { current, daily, city, units, intelligence, lastUpdated } = weather;
  const todayDaily = daily[0];
  const weatherInfo = getWeatherCodeInfo(current.weatherCode, current.isDay);

  // UV index classification
  const uvVal = current.uvIndex ?? todayDaily?.uvIndexMax ?? 0;
  const getUvLevel = (uv: number) => {
    if (uv < 3) return { label: "Low", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" };
    if (uv < 6) return { label: "Moderate", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200" };
    if (uv < 8) return { label: "High", color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200" };
    return { label: "Very High", color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200" };
  };
  const uvLevel = getUvLevel(uvVal);

  return (
    <div
      id="current-weather-card"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs"
    >
      {/* Top Header: Location + Refresh */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              {city.name}
            </h2>
            {city.country_code && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                {city.country_code}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {[city.admin1, city.country].filter(Boolean).join(", ")} • Updated {lastUpdated}
          </p>
        </div>

        <button
          id="refresh-weather-btn"
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          title="Refresh weather data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-sky-500" : ""}`} />
        </button>
      </div>

      {/* Main Temperature & Primary Condition */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="md:col-span-7 flex items-center gap-5">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center shrink-0">
            <WeatherIcon
              name={weatherInfo.iconName}
              className={`w-10 h-10 md:w-12 md:h-12 ${weatherInfo.accentColor}`}
            />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {current.temperature}
              </span>
              <span className="text-2xl md:text-3xl font-medium text-slate-400 dark:text-slate-500">
                {units.temperature}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-base font-semibold text-slate-800 dark:text-slate-200">
                {weatherInfo.label}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Feels like {current.apparentTemperature}{units.temperature}
              </span>
            </div>
          </div>
        </div>

        {/* High / Low & Today's Headline Badge */}
        <div className="md:col-span-5 flex flex-col justify-center space-y-2.5">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/40">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>High {todayDaily?.tempMax ?? current.temperature}{units.temperature}</span>
            </div>
            <div className="flex items-center gap-1 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-900/40">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Low {todayDaily?.tempMin ?? current.temperature}{units.temperature}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Planning Outlook: </span>
            <span className="text-slate-600 dark:text-slate-400">
              {intelligence.headline}
            </span>
          </div>
        </div>
      </div>

      {/* Atmospheric Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
        {/* Wind */}
        <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-sky-500" />
            <span>Wind</span>
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {current.windSpeed} <span className="text-xs font-normal text-slate-500">{units.windSpeed}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <Compass className="w-3 h-3" />
            <span>Gusts {current.windGusts} {units.windSpeed}</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Humidity</span>
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {current.relativeHumidity}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {current.relativeHumidity > 70 ? "Humid" : current.relativeHumidity < 30 ? "Dry" : "Comfortable"}
          </div>
        </div>

        {/* Rain Probability */}
        <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
            <span>Rain Chance</span>
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {current.precipitationProb ?? todayDaily?.precipitationProbabilityMax ?? 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {todayDaily?.precipitationSum ? `${todayDaily.precipitationSum} ${units.precipitation}` : "No accumulation"}
          </div>
        </div>

        {/* UV Index */}
        <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <SunMedium className="w-3.5 h-3.5 text-amber-500" />
            <span>UV Index</span>
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span>{uvVal.toFixed(1)}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.2 border rounded-sm ${uvLevel.color}`}>
              {uvLevel.label}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Peak at solar noon
          </div>
        </div>

        {/* Pressure */}
        <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-emerald-500" />
            <span>Pressure</span>
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {current.pressureMsl} <span className="text-xs font-normal text-slate-500">hPa</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {current.pressureMsl > 1013 ? "High pressure" : "Normal pressure"}
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <SunMedium className="w-3.5 h-3.5 text-slate-400" />
            <span>Cloud Cover</span>
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {current.cloudCover}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {current.cloudCover < 20 ? "Clear skies" : current.cloudCover > 80 ? "Overcast" : "Scattered clouds"}
          </div>
        </div>
      </div>
    </div>
  );
};
