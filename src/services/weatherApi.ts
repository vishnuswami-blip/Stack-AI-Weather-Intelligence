import {
  GeocodingResult,
  WeatherDataState,
  UnitSystem,
  HourlyForecastItem,
  DailyForecastItem,
  CurrentWeatherData,
} from "../types";
import { getWeatherCodeInfo } from "../utils/weatherCodes";
import { generateWeatherIntelligence } from "../utils/weatherIntelligence";

const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_BASE_URL = "https://api.open-meteo.com/v1/forecast";

export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(
    query.trim()
  )}&count=6&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding search failed with status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map((item: any) => ({
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country,
    country_code: item.country_code,
    admin1: item.admin1,
    timezone: item.timezone,
  }));
}

export async function fetchWeatherData(
  city: GeocodingResult,
  unitSystem: UnitSystem = "metric"
): Promise<WeatherDataState> {
  const isMetric = unitSystem === "metric";
  const tempUnitParam = isMetric ? "celsius" : "fahrenheit";
  const windUnitParam = isMetric ? "kmh" : "mph";
  const precipUnitParam = isMetric ? "mm" : "inch";

  const url = new URL(FORECAST_BASE_URL);
  url.searchParams.set("latitude", city.latitude.toString());
  url.searchParams.set("longitude", city.longitude.toString());
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m"
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,uv_index"
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max"
  );
  url.searchParams.set("timezone", city.timezone || "auto");
  url.searchParams.set("temperature_unit", tempUnitParam);
  url.searchParams.set("wind_speed_unit", windUnitParam);
  url.searchParams.set("precipitation_unit", precipUnitParam);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather fetch failed: ${response.statusText}`);
  }

  const raw = await response.json();

  // Parse current weather
  const cur = raw.current || {};
  const isDay = cur.is_day === 1;
  const weatherCode = cur.weather_code ?? 0;
  const weatherInfo = getWeatherCodeInfo(weatherCode, isDay);

  // Hourly array parse (find current hour index)
  const hourlyTimes: string[] = raw.hourly?.time || [];
  const hourlyTemps: number[] = raw.hourly?.temperature_2m || [];
  const hourlyCodes: number[] = raw.hourly?.weather_code || [];
  const hourlyRainProb: number[] = raw.hourly?.precipitation_probability || [];
  const hourlyHumid: number[] = raw.hourly?.relative_humidity_2m || [];
  const hourlyWinds: number[] = raw.hourly?.wind_speed_10m || [];
  const hourlyUv: number[] = raw.hourly?.uv_index || [];

  // Match current or next upcoming hour
  const nowIso = new Date().toISOString().slice(0, 13);
  let startIndex = hourlyTimes.findIndex((t) => t.startsWith(nowIso));
  if (startIndex === -1) startIndex = 0;

  const parsedHourly: HourlyForecastItem[] = [];
  for (let i = startIndex; i < Math.min(startIndex + 24, hourlyTimes.length); i++) {
    const timeStr = hourlyTimes[i];
    const dateObj = new Date(timeStr);
    const hourDisplay = dateObj.toLocaleTimeString([], { hour: "numeric", hour12: true });

    parsedHourly.push({
      time: timeStr,
      hourDisplay,
      temperature: Math.round(hourlyTemps[i] ?? 0),
      weatherCode: hourlyCodes[i] ?? 0,
      precipitationProb: hourlyRainProb[i] ?? 0,
      relativeHumidity: hourlyHumid[i] ?? 0,
      windSpeed: Math.round(hourlyWinds[i] ?? 0),
      uvIndex: hourlyUv[i] ?? 0,
    });
  }

  // Daily 7-day parse
  const dailyTimes: string[] = raw.daily?.time || [];
  const dailyCodes: number[] = raw.daily?.weather_code || [];
  const dailyMax: number[] = raw.daily?.temperature_2m_max || [];
  const dailyMin: number[] = raw.daily?.temperature_2m_min || [];
  const dailyAppMax: number[] = raw.daily?.apparent_temperature_max || [];
  const dailyAppMin: number[] = raw.daily?.apparent_temperature_min || [];
  const dailySunrise: string[] = raw.daily?.sunrise || [];
  const dailySunset: string[] = raw.daily?.sunset || [];
  const dailyUvMax: number[] = raw.daily?.uv_index_max || [];
  const dailyPrecipSum: number[] = raw.daily?.precipitation_sum || [];
  const dailyRainProbMax: number[] = raw.daily?.precipitation_probability_max || [];
  const dailyWindMax: number[] = raw.daily?.wind_speed_10m_max || [];

  const parsedDaily: DailyForecastItem[] = [];
  const daysCount = Math.min(7, dailyTimes.length);

  for (let i = 0; i < daysCount; i++) {
    const dateStr = dailyTimes[i];
    const d = new Date(dateStr + "T12:00:00");
    const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const code = dailyCodes[i] ?? 0;
    const info = getWeatherCodeInfo(code, true);

    parsedDaily.push({
      date: dateStr,
      dayName,
      formattedDate,
      weatherCode: code,
      weatherDescription: info.label,
      tempMax: Math.round(dailyMax[i] ?? 0),
      tempMin: Math.round(dailyMin[i] ?? 0),
      apparentTempMax: Math.round(dailyAppMax[i] ?? 0),
      apparentTempMin: Math.round(dailyAppMin[i] ?? 0),
      sunrise: dailySunrise[i] ? new Date(dailySunrise[i]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      sunset: dailySunset[i] ? new Date(dailySunset[i]).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      uvIndexMax: dailyUvMax[i] ?? 0,
      precipitationSum: dailyPrecipSum[i] ?? 0,
      precipitationProbabilityMax: dailyRainProbMax[i] ?? 0,
      windSpeedMax: Math.round(dailyWindMax[i] ?? 0),
      planningTag: "",
      planningDirective: "",
    });
  }

  // Current weather structured
  const parsedCurrent: CurrentWeatherData = {
    time: cur.time || new Date().toISOString(),
    temperature: Math.round(cur.temperature_2m ?? 0),
    apparentTemperature: Math.round(cur.apparent_temperature ?? 0),
    relativeHumidity: Math.round(cur.relative_humidity_2m ?? 0),
    isDay,
    precipitation: cur.precipitation ?? 0,
    rain: cur.rain ?? 0,
    snowfall: cur.snowfall ?? 0,
    weatherCode,
    weatherDescription: weatherInfo.label,
    cloudCover: cur.cloud_cover ?? 0,
    pressureMsl: Math.round(cur.pressure_msl ?? 1013),
    windSpeed: Math.round(cur.wind_speed_10m ?? 0),
    windDirection: cur.wind_direction_10m ?? 0,
    windGusts: Math.round(cur.wind_gusts_10m ?? 0),
    uvIndex: parsedHourly[0]?.uvIndex ?? parsedDaily[0]?.uvIndexMax ?? 0,
    precipitationProb: parsedHourly[0]?.precipitationProb ?? parsedDaily[0]?.precipitationProbabilityMax ?? 0,
  };

  // Generate rule-based weather intelligence and planning instructions
  const intelligence = generateWeatherIntelligence(parsedCurrent, parsedHourly, parsedDaily, unitSystem);

  return {
    city,
    current: parsedCurrent,
    hourly: parsedHourly,
    daily: parsedDaily,
    intelligence,
    units: {
      temperature: isMetric ? "°C" : "°F",
      windSpeed: isMetric ? "km/h" : "mph",
      precipitation: isMetric ? "mm" : "in",
    },
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

// Request AI Planning Instructions from server
export async function requestAiPlanningInstructions(
  state: WeatherDataState,
  focus: string = "general",
  customQuestion?: string
): Promise<any> {
  const response = await fetch("/api/planning", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      city: `${state.city.name}${state.city.admin1 ? ", " + state.city.admin1 : ""}, ${state.city.country || ""}`,
      currentWeather: {
        temperature: state.current.temperature,
        tempUnit: state.units.temperature,
        weatherDescription: state.current.weatherDescription,
        apparentTemperature: state.current.apparentTemperature,
        windSpeed: state.current.windSpeed,
        windUnit: state.units.windSpeed,
        humidity: state.current.relativeHumidity,
        uvIndex: state.current.uvIndex,
        precipitationProb: state.current.precipitationProb,
      },
      dailyForecast: state.daily,
      focus,
      customQuestion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to request AI planning: ${response.status}`);
  }

  return response.json();
}
