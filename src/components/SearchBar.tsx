import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { GeocodingResult } from "../types";
import { searchCities } from "../services/weatherApi";

interface SearchBarProps {
  onSelectCity: (city: GeocodingResult) => void;
  onLocateUser: () => void;
  isLoadingLocation: boolean;
  selectedCityName?: string;
}

const POPULAR_CITIES: GeocodingResult[] = [
  { id: 5128581, name: "New York", latitude: 40.7128, longitude: -74.006, admin1: "New York", country: "United States" },
  { id: 2643743, name: "London", latitude: 51.5085, longitude: -0.1257, admin1: "England", country: "United Kingdom" },
  { id: 1850147, name: "Tokyo", latitude: 35.6895, longitude: 139.6917, admin1: "Tokyo", country: "Japan" },
  { id: 2988507, name: "Paris", latitude: 48.8534, longitude: 2.3488, admin1: "Île-de-France", country: "France" },
  { id: 5391959, name: "San Francisco", latitude: 37.7749, longitude: -122.4194, admin1: "California", country: "United States" },
  { id: 2147714, name: "Sydney", latitude: -33.8678, longitude: 151.2073, admin1: "New South Wales", country: "Australia" },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectCity,
  onLocateUser,
  isLoadingLocation,
  selectedCityName,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const list = await searchCities(query);
        setResults(list);
        setIsOpen(true);
      } catch (err) {
        console.error("Geocoding lookup error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: GeocodingResult) => {
    onSelectCity(city);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div id="weather-search-section" className="w-full relative z-30" ref={dropdownRef}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search input box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="city-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Search any city or region (e.g. Seattle, Berlin, Singapore)..."
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-xs transition"
          />
          {query && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isSearching && (
            <div className="absolute inset-y-0 right-8 pr-2 flex items-center">
              <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
            </div>
          )}
        </div>

        {/* GPS Location Button */}
        <button
          id="locate-me-btn"
          type="button"
          onClick={onLocateUser}
          disabled={isLoadingLocation}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition shadow-xs disabled:opacity-60 cursor-pointer whitespace-nowrap"
          title="Use current location"
        >
          {isLoadingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
          ) : (
            <MapPin className="w-4 h-4 text-sky-500" />
          )}
          <span>Locate Me</span>
        </button>
      </div>

      {/* Dropdown for Geocoding search results */}
      {isOpen && results.length > 0 && (
        <div
          id="search-results-dropdown"
          className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden py-1 z-50 max-h-72 overflow-y-auto"
        >
          <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Search Matches
          </div>
          {results.map((city) => (
            <button
              key={`${city.id}-${city.latitude}-${city.longitude}`}
              id={`city-result-${city.id}`}
              type="button"
              onClick={() => handleSelect(city)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-sky-50 dark:hover:bg-slate-800 flex items-center justify-between transition cursor-pointer border-b border-slate-100 dark:border-slate-800/60 last:border-b-0"
            >
              <div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {city.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
                  {[city.admin1, city.country].filter(Boolean).join(", ")}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Quick City Presets */}
      <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-xs text-slate-500 dark:text-slate-400 scrollbar-none">
        <span className="text-slate-400 text-[11px] uppercase tracking-wider font-medium mr-1 whitespace-nowrap">
          Quick Select:
        </span>
        {POPULAR_CITIES.map((c) => {
          const isSelected = selectedCityName === c.name;
          return (
            <button
              key={c.id}
              id={`quick-city-${c.name.toLowerCase().replace(/\s+/g, "-")}`}
              type="button"
              onClick={() => onSelectCity(c)}
              className={`px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? "bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-medium"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
