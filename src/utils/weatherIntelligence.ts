import {
  CurrentWeatherData,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherIntelligenceData,
  ActivityRecommendation,
  UnitSystem,
} from "../types";

export function generateWeatherIntelligence(
  current: CurrentWeatherData,
  hourly: HourlyForecastItem[],
  daily: DailyForecastItem[],
  unitSystem: UnitSystem
): WeatherIntelligenceData {
  // Normalize temp to Celsius internally for logic thresholds
  const isMetric = unitSystem === "metric";
  const tempC = isMetric ? current.temperature : ((current.temperature - 32) * 5) / 9;
  const windKmh = isMetric ? current.windSpeed : current.windSpeed * 1.60934;
  const isRaining = current.rain > 0 || current.precipitation > 0 || [51,53,55,61,63,65,80,81,82,95,96,99].includes(current.weatherCode);
  const isSnowing = current.snowfall > 0 || [71,73,75,77,85,86].includes(current.weatherCode);
  const uv = current.uvIndex ?? 0;

  // 1. Attire recommendations
  let layers = "Light short-sleeve shirt or breathable cotton top.";
  let footwear = "Comfortable everyday sneakers or walking shoes.";
  const accessories: string[] = [];
  let attireSummary = "Mild and comfortable for general attire.";

  if (tempC < 0) {
    layers = "Thermal base layers, heavy insulated down parka, and fleece mid-layer.";
    footwear = "Insulated waterproof winter boots with high-traction soles.";
    accessories.push("Thermal beanie", "Insulated gloves", "Fleece scarf");
    attireSummary = "Sub-zero temperatures: prioritize heavy insulation and wind protection.";
  } else if (tempC < 8) {
    layers = "Warm sweater or fleece over long-sleeve tee, topped with a warm winter jacket.";
    footwear = "Warm closed-toe boots or sturdy leather shoes.";
    accessories.push("Light gloves", "Knit beanie");
    attireSummary = "Chilly conditions: bundle up in warm mid-weight layers.";
  } else if (tempC < 16) {
    layers = "Long-sleeve tee or shirt with a light jacket, hoodie, or cardigan.";
    footwear = "Standard sneakers or casual loafers.";
    attireSummary = "Cool and fresh: a light jacket or versatile sweater is ideal.";
  } else if (tempC < 24) {
    layers = "Light, breathable t-shirt or linen button-down with comfortable trousers or shorts.";
    footwear = "Light sneakers, slip-ons, or casual sandals.";
    attireSummary = "Pleasantly comfortable: standard mild-weather clothing.";
  } else if (tempC < 31) {
    layers = "Airy, moisture-wicking fabrics, shorts, and light linen or cotton top.";
    footwear = "Breathable mesh sneakers or open sandals.";
    accessories.push("Sunglasses", "Breathable sun cap");
    attireSummary = "Warm weather: wear airy, light-colored fabrics.";
  } else {
    layers = "Ultra-lightweight loose clothing; stay cool and avoid dark colors.";
    footwear = "Airy footwear or open sandals.";
    accessories.push("UV-blocking sunglasses", "Wide-brim sun hat", "Water bottle");
    attireSummary = "Intense heat: dress minimally in light, breathable fabrics and hydrate.";
  }

  if (isRaining || (current.precipitationProb && current.precipitationProb > 40)) {
    accessories.push("Compact umbrella", "Water-resistant outer shell");
    footwear = "Waterproof or water-resistant shoes";
  }

  if (uv >= 6) {
    accessories.push("Broad-spectrum SPF 30+ sunscreen");
  }

  // 2. Safety Alerts
  const alerts: string[] = [];
  if (current.weatherCode >= 95) {
    alerts.push("Thunderstorm warning: Seek indoor shelter if lightning or thunder is present.");
  }
  if (windKmh > 40) {
    alerts.push(`High wind gusts (${Math.round(current.windGusts)} ${isMetric ? "km/h" : "mph"}): Secure loose outdoor objects.`);
  }
  if (uv >= 8) {
    alerts.push(`Very High UV Index (${uv.toFixed(1)}): Minimize midday sun exposure between 11 AM and 4 PM.`);
  } else if (uv >= 6) {
    alerts.push(`Moderate to High UV (${uv.toFixed(1)}): Sun protection recommended outdoors.`);
  }
  if (tempC <= 1 && (isRaining || current.relativeHumidity > 85)) {
    alerts.push("Icy road advisory: Watch for black ice on elevated roads and bridges.");
  }
  if (tempC >= 33) {
    alerts.push("Heat caution: Stay hydrated and take frequent breaks in shade or AC.");
  }

  // 3. Best outdoor time window for today (analyzing next 12 hours)
  const next12Hours = hourly.slice(0, 14);
  let bestWindow = {
    time: "10:00 AM – 3:00 PM",
    reason: "Consistent temperatures and minimal chance of precipitation.",
  };

  if (next12Hours.length > 0) {
    // Find hours with rain prob < 30% and pleasant temp
    const goodHours = next12Hours.filter(
      (h) => h.precipitationProb < 35 && h.windSpeed < (isMetric ? 30 : 18)
    );
    if (goodHours.length > 0) {
      const start = goodHours[0].hourDisplay;
      const end = goodHours[Math.min(goodHours.length - 1, 4)].hourDisplay;
      bestWindow = {
        time: start === end ? `${start} – 2 hours later` : `${start} – ${end}`,
        reason: `Lowest rain probability (${goodHours[0].precipitationProb}%) and favorable ambient conditions.`,
      };
    } else {
      bestWindow = {
        time: "Midday brief break",
        reason: "Expect sporadic precipitation throughout today; carry rain gear.",
      };
    }
  }

  // 4. Activity Suitability Ratings (0 to 100)
  const activities: ActivityRecommendation[] = [];

  // Running / Jogging
  let runScore = 85;
  if (tempC < 2 || tempC > 28) runScore -= 30;
  if (tempC < -5 || tempC > 33) runScore -= 30;
  if (isRaining) runScore -= 35;
  if (windKmh > 30) runScore -= 20;
  runScore = Math.max(10, Math.min(100, runScore));
  activities.push({
    name: "Running & Jogging",
    category: "fitness",
    score: runScore,
    rating: runScore >= 80 ? "Ideal" : runScore >= 60 ? "Good" : runScore >= 40 ? "Fair" : "Poor",
    icon: "Footprints",
    commentary:
      runScore >= 75
        ? "Great conditions for cardiovascular training. Optimal airway comfort."
        : isRaining
        ? "Wet surfaces and slick corners. Choose indoor treadmill or wear traction trail shoes."
        : tempC > 28
        ? "Elevated heat index; schedule runs early morning or after sunset."
        : "Chilly air; perform thorough indoor warm-up stretches before heading out.",
  });

  // Cycling
  let bikeScore = 80;
  if (windKmh > 30) bikeScore -= 35;
  if (isRaining) bikeScore -= 40;
  if (tempC < 5) bikeScore -= 25;
  bikeScore = Math.max(10, Math.min(100, bikeScore));
  activities.push({
    name: "Cycling / Commuting",
    category: "fitness",
    score: bikeScore,
    rating: bikeScore >= 80 ? "Ideal" : bikeScore >= 60 ? "Good" : bikeScore >= 40 ? "Fair" : "Poor",
    icon: "Bike",
    commentary:
      bikeScore >= 75
        ? "Safe winds and clean road surface. Excellent visibility for road riding."
        : windKmh > 30
        ? "Gusty crosswinds can destabilize balance. Exercise heightened vigilance."
        : "Wet asphalt reduces braking responsiveness. Double following distance.",
  });

  // Outdoor Dining / Patio
  let diningScore = 85;
  if (isRaining) diningScore -= 55;
  if (tempC < 14 || tempC > 29) diningScore -= 35;
  if (windKmh > 25) diningScore -= 25;
  diningScore = Math.max(10, Math.min(100, diningScore));
  activities.push({
    name: "Outdoor Dining & Cafe",
    category: "leisure",
    score: diningScore,
    rating: diningScore >= 80 ? "Ideal" : diningScore >= 60 ? "Good" : diningScore >= 40 ? "Fair" : "Poor",
    icon: "Coffee",
    commentary:
      diningScore >= 75
        ? "Pleasant ambient breeze and temperature make patio dining thoroughly enjoyable."
        : isRaining
        ? "Precipitation risk makes covered terraces or indoor dining preferable."
        : "Noticeable chill or wind; opt for heated outdoor patios or indoor seating.",
  });

  // Car Wash / Yard Work
  let carWashScore = 75;
  const willRainSoon = daily.slice(0, 3).some((d) => d.precipitationProbabilityMax > 40);
  if (isRaining || willRainSoon) carWashScore -= 45;
  if (tempC < 4) carWashScore -= 20;
  carWashScore = Math.max(10, Math.min(100, carWashScore));
  activities.push({
    name: "Car Wash & Exterior Care",
    category: "daily",
    score: carWashScore,
    rating: carWashScore >= 75 ? "Ideal" : carWashScore >= 55 ? "Good" : "Poor",
    icon: "Sparkles",
    commentary:
      carWashScore >= 75
        ? "Clear skies ahead with low rain risk over the next 48 hours."
        : "Rain or showers forecasted within 48-72 hours; postpone detailing.",
  });

  // 5. Seven Day Directives
  const sevenDayDirectives = daily.slice(0, 7).map((d, index) => {
    let tag = "Clear & Stable";
    let instruction = "Smooth conditions for travel, errands, and outdoor plans.";
    const dayRain = d.precipitationProbabilityMax ?? 0;
    const maxC = isMetric ? d.tempMax : ((d.tempMax - 32) * 5) / 9;

    if (d.weatherCode >= 95) {
      tag = "Storm Warning";
      instruction = "High lightning and thunderstorm probability. Plan indoor tasks.";
    } else if (dayRain > 65 || d.precipitationSum > 5) {
      tag = "Rain Gear Needed";
      instruction = `Significant rain risk (${dayRain}%). Carry a sturdy umbrella and plan for wet commutes.`;
    } else if (dayRain > 35) {
      tag = "Scattered Showers";
      instruction = "Sporadic rain likely. Keep flexible outdoor plans with quick indoor alternatives.";
    } else if (maxC > 30) {
      tag = "Warm & Sunny";
      instruction = "High UV and heat. Schedule outdoor activities for early morning and hydrate.";
    } else if (maxC < 5) {
      tag = "Cold Weather";
      instruction = "Freezing breeze expected. Dress in insulated thermal outerwear.";
    } else if (d.windSpeedMax > (isMetric ? 35 : 22)) {
      tag = "Breezy & Gusty";
      instruction = "Gusty winds forecasted. Secure outdoor patio sets and drive with care.";
    } else {
      tag = index === 0 ? "Favorable Today" : "Ideal Outdoor Day";
      instruction = "Pleasant temperature balance and low rain probability. Great for leisure or transit.";
    }

    return {
      day: d.dayName,
      date: d.formattedDate,
      tag,
      instruction,
      weatherCode: d.weatherCode,
      tempMax: d.tempMax,
      tempMin: d.tempMin,
      rainProb: dayRain,
    };
  });

  // Headline
  let headline = "Mild and comfortable overall";
  if (isRaining) headline = "Wet conditions — keep rain protection ready";
  else if (tempC < 4) headline = "Crisp and cold — bundle up in layers";
  else if (tempC > 28) headline = "Warm and sunny — sun protection advisable";
  else if (windKmh > 35) headline = "Breezy conditions with gusty winds";

  return {
    headline,
    summary: `Current temperature is ${Math.round(current.temperature)}°${isMetric ? "C" : "F"} (feels like ${Math.round(current.apparentTemperature)}°), with ${current.weatherDescription.toLowerCase()} and ${current.relativeHumidity}% humidity.`,
    comfortLevel: tempC > 27 ? "Warm" : tempC < 10 ? "Chilly" : "Comfortable",
    attire: {
      layers,
      footwear,
      accessories,
      summary: attireSummary,
    },
    alerts,
    bestOutdoorWindow: bestWindow,
    activities,
    sevenDayDirectives,
  };
}
