export type UnitSystem = "metric" | "imperial";

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
}

export interface CurrentWeatherData {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  snowfall: number;
  weatherCode: number;
  weatherDescription: string;
  cloudCover: number;
  pressureMsl: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex?: number;
  precipitationProb?: number;
}

export interface HourlyForecastItem {
  time: string;
  hourDisplay: string;
  temperature: number;
  weatherCode: number;
  precipitationProb: number;
  relativeHumidity: number;
  windSpeed: number;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  formattedDate: string;
  weatherCode: number;
  weatherDescription: string;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  planningTag: string;
  planningDirective: string;
}

export interface ActivityRecommendation {
  name: string;
  category: "fitness" | "leisure" | "daily" | "travel";
  score: number; // 0 - 100
  rating: "Ideal" | "Good" | "Fair" | "Poor";
  icon: string;
  commentary: string;
}

export interface WeatherIntelligenceData {
  headline: string;
  summary: string;
  comfortLevel: string;
  attire: {
    layers: string;
    footwear: string;
    accessories: string[];
    summary: string;
  };
  alerts: string[];
  bestOutdoorWindow: {
    time: string;
    reason: string;
  };
  activities: ActivityRecommendation[];
  sevenDayDirectives: {
    day: string;
    date: string;
    tag: string;
    instruction: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
    rainProb: number;
  }[];
  aiPlanning?: {
    executiveSummary: string;
    todayAdvice: {
      clothing: string;
      gear: string[];
      bestTimeWindow: string;
      caution: string;
    };
    weekDirectives: {
      day: string;
      planningTag: string;
      recommendation: string;
    }[];
    activityRatings: {
      activity: string;
      score: string;
      tip: string;
    }[];
    customAnswer?: string | null;
  };
}

export interface WeatherDataState {
  city: GeocodingResult;
  current: CurrentWeatherData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  intelligence: WeatherIntelligenceData;
  units: {
    temperature: string;
    windSpeed: string;
    precipitation: string;
  };
  lastUpdated: string;
}
