export interface WeatherCodeInfo {
  code: number;
  label: string;
  iconName: string;
  category: "clear" | "clouds" | "fog" | "rain" | "snow" | "thunderstorm";
  accentColor: string;
}

export const WMO_WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { code: 0, label: "Clear sky", iconName: "Sun", category: "clear", accentColor: "text-amber-500" },
  1: { code: 1, label: "Mainly clear", iconName: "SunDim", category: "clear", accentColor: "text-amber-500" },
  2: { code: 2, label: "Partly cloudy", iconName: "CloudSun", category: "clouds", accentColor: "text-sky-500" },
  3: { code: 3, label: "Overcast", iconName: "Cloud", category: "clouds", accentColor: "text-slate-500" },
  45: { code: 45, label: "Foggy", iconName: "CloudFog", category: "fog", accentColor: "text-slate-400" },
  48: { code: 48, label: "Icy fog", iconName: "CloudFog", category: "fog", accentColor: "text-slate-400" },
  51: { code: 51, label: "Light drizzle", iconName: "CloudDrizzle", category: "rain", accentColor: "text-blue-400" },
  53: { code: 53, label: "Moderate drizzle", iconName: "CloudDrizzle", category: "rain", accentColor: "text-blue-500" },
  55: { code: 55, label: "Dense drizzle", iconName: "CloudDrizzle", category: "rain", accentColor: "text-blue-600" },
  56: { code: 56, label: "Freezing drizzle", iconName: "CloudSnow", category: "rain", accentColor: "text-teal-400" },
  57: { code: 57, label: "Dense freezing drizzle", iconName: "CloudSnow", category: "rain", accentColor: "text-teal-500" },
  61: { code: 61, label: "Slight rain", iconName: "CloudRain", category: "rain", accentColor: "text-blue-500" },
  63: { code: 63, label: "Moderate rain", iconName: "CloudRain", category: "rain", accentColor: "text-blue-600" },
  65: { code: 65, label: "Heavy rain", iconName: "CloudRainWind", category: "rain", accentColor: "text-indigo-600" },
  66: { code: 66, label: "Light freezing rain", iconName: "CloudHail", category: "rain", accentColor: "text-cyan-600" },
  67: { code: 67, label: "Heavy freezing rain", iconName: "CloudHail", category: "rain", accentColor: "text-cyan-700" },
  71: { code: 71, label: "Slight snowfall", iconName: "Snowflake", category: "snow", accentColor: "text-cyan-400" },
  73: { code: 73, label: "Moderate snowfall", iconName: "Snowflake", category: "snow", accentColor: "text-cyan-500" },
  75: { code: 75, label: "Heavy snowfall", iconName: "Snowflake", category: "snow", accentColor: "text-blue-200" },
  77: { code: 77, label: "Snow grains", iconName: "Snowflake", category: "snow", accentColor: "text-cyan-400" },
  80: { code: 80, label: "Light rain showers", iconName: "CloudSunRain", category: "rain", accentColor: "text-blue-500" },
  81: { code: 81, label: "Moderate showers", iconName: "CloudRain", category: "rain", accentColor: "text-blue-600" },
  82: { code: 82, label: "Violent rain showers", iconName: "CloudRainWind", category: "rain", accentColor: "text-indigo-700" },
  85: { code: 85, label: "Slight snow showers", iconName: "CloudSnow", category: "snow", accentColor: "text-cyan-500" },
  86: { code: 86, label: "Heavy snow showers", iconName: "CloudSnow", category: "snow", accentColor: "text-cyan-600" },
  95: { code: 95, label: "Thunderstorm", iconName: "CloudLightning", category: "thunderstorm", accentColor: "text-amber-600" },
  96: { code: 96, label: "Thunderstorm with hail", iconName: "CloudHail", category: "thunderstorm", accentColor: "text-purple-600" },
  99: { code: 99, label: "Severe thunderstorm", iconName: "CloudLightning", category: "thunderstorm", accentColor: "text-red-600" },
};

export function getWeatherCodeInfo(code: number, isDay = true): WeatherCodeInfo {
  const info = WMO_WEATHER_CODES[code] || {
    code,
    label: "Variable conditions",
    iconName: isDay ? "Sun" : "Moon",
    category: "clear",
    accentColor: "text-sky-500",
  };

  if (!isDay && (code === 0 || code === 1)) {
    return {
      ...info,
      iconName: "Moon",
      label: code === 0 ? "Clear night" : "Mainly clear night",
    };
  }

  if (!isDay && code === 2) {
    return {
      ...info,
      iconName: "CloudMoon",
    };
  }

  return info;
}
