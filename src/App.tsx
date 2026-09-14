/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  CloudSun,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { GeocodingResult, WeatherDataState, UnitSystem } from "./types";
import { fetchWeatherData } from "./services/weatherApi";
import { SearchBar } from "./components/SearchBar";
import { CurrentWeatherCard } from "./components/CurrentWeatherCard";
import { HourlyForecast } from "./components/HourlyForecast";
import { DailyForecast7Days } from "./components/DailyForecast7Days";
import { PlanningInstructions } from "./components/PlanningInstructions";
import { UnitToggle } from "./components/UnitToggle";

const DEFAULT_CITY: GeocodingResult = {
  id: 5128581,
  name: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  admin1: "New York",
  country: "United States",
  country_code: "US",
  timezone: "America/New_York",
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState<GeocodingResult>(DEFAULT_CITY);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [weatherData, setWeatherData] = useState<WeatherDataState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load weather data
  const loadWeather = useCallback(
    async (city: GeocodingResult, units: UnitSystem, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const data = await fetchWeatherData(city, units);
        setWeatherData(data);
      } catch (err: any) {
        console.error("Error fetching weather data:", err);
        setErrorMessage(
          err.message || "Failed to fetch weather data from Open-Meteo. Please check your network and try again."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Initial load or city change
  useEffect(() => {
    loadWeather(selectedCity, unitSystem);
  }, [selectedCity, unitSystem, loadWeather]);

  // Geolocation handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const geoCity: GeocodingResult = {
          id: Date.now(),
          name: "Current Location",
          latitude,
          longitude,
          admin1: "Local Area",
          country: "",
          timezone: "auto",
        };
        setSelectedCity(geoCity);
        setIsLoadingLocation(false);
      },
      (err) => {
        console.warn("Geolocation denied/failed:", err);
        setIsLoadingLocation(false);
        setErrorMessage("Location access was denied or timed out. Please enter a city manually.");
      },
      { timeout: 10000 }
    );
  };

  const handleUnitToggle = (unit: UnitSystem) => {
    setUnitSystem(unit);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-50">
                  Weather Intelligence
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Open-Meteo forecast engine & daily planning directives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UnitToggle unitSystem={unitSystem} onToggle={handleUnitToggle} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* City Search Bar */}
        <SearchBar
          onSelectCity={(city) => setSelectedCity(city)}
          onLocateUser={handleLocateUser}
          isLoadingLocation={isLoadingLocation}
          selectedCityName={selectedCity.name}
        />

        {/* Error Notification */}
        {errorMessage && (
          <div
            id="error-banner"
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => loadWeather(selectedCity, unitSystem)}
              className="text-xs font-semibold underline hover:no-underline text-rose-700 dark:text-rose-300 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && !weatherData && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            <p className="text-sm font-medium">Fetching meteorological data for {selectedCity.name}...</p>
          </div>
        )}

        {/* Weather Dashboard */}
        {weatherData && (
          <div className="space-y-6">
            {/* 1. Current Weather Overview Card */}
            <CurrentWeatherCard
              weather={weatherData}
              onRefresh={() => loadWeather(selectedCity, unitSystem, true)}
              isRefreshing={isRefreshing}
            />

            {/* 2. Planning Instructions & Lifestyle Intelligence */}
            <PlanningInstructions weather={weatherData} />

            {/* 3. 24-Hour Timeline */}
            <HourlyForecast
              hourly={weatherData.hourly}
              tempUnit={weatherData.units.temperature}
            />

            {/* 4. 7-Day Forecast */}
            <DailyForecast7Days
              daily={weatherData.daily}
              tempUnit={weatherData.units.temperature}
              windUnit={weatherData.units.windSpeed}
              precipUnit={weatherData.units.precipitation}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>Weather Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 dark:hover:text-slate-200 inline-flex items-center gap-1 transition"
            >
              <span>Weather data by Open-Meteo (CC BY 4.0)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
