import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "1mb" }));

// Lazy Google GenAI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
  });
});

// Weather Planning Intelligence API
app.post("/api/planning", async (req, res) => {
  try {
    const { city, currentWeather, dailyForecast, focus = "general", customQuestion } = req.body;

    if (!city || !currentWeather || !dailyForecast) {
      res.status(400).json({ error: "Missing required weather context (city, currentWeather, dailyForecast)" });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response if Gemini key is not set
      res.json({
        available: false,
        message: "Gemini API key not configured. Using rule-based weather intelligence.",
      });
      return;
    }

    const prompt = `You are an expert meteorological intelligence and lifestyle planning advisor.
Analyze the following weather data for ${city}:

Current Weather:
- Temperature: ${currentWeather.temperature}° (${currentWeather.tempUnit || "C"})
- Condition: ${currentWeather.weatherDescription}
- Feels Like: ${currentWeather.apparentTemperature}°
- Wind Speed: ${currentWeather.windSpeed} ${currentWeather.windUnit || "km/h"}
- Humidity: ${currentWeather.humidity}%
- UV Index: ${currentWeather.uvIndex ?? "N/A"}
- Precipitation probability: ${currentWeather.precipitationProb ?? 0}%

7-Day Forecast Summary:
${dailyForecast
  .slice(0, 7)
  .map(
    (d: any) =>
      `- ${d.dayName} (${d.date}): ${d.weatherDescription}, High ${d.tempMax}°, Low ${d.tempMin}°, Rain prob ${d.precipitationProbabilityMax ?? 0}%`
  )
  .join("\n")}

Focus Area: ${focus}
${customQuestion ? `Specific User Question: "${customQuestion}"` : ""}

Provide crisp, highly practical planning advice in JSON format.
Format your response as valid JSON with this exact structure:
{
  "executiveSummary": "1-2 sentences summarizing weather impact on lifestyle for the week",
  "todayAdvice": {
    "clothing": "Specific attire instructions (layers, footwear, fabrics)",
    "gear": ["Umbrella or sunglasses", "Water bottle", etc.],
    "bestTimeWindow": "Optimal time window for outdoor activities today and why",
    "caution": "Any hazards like UV, wind gusts, slippery roads, or cold"
  },
  "weekDirectives": [
    {
      "day": "Day name",
      "planningTag": "e.g., Best for Errands, Rain Warning, Great Weekend Outlook",
      "recommendation": "1 clear sentence with what to plan on this day"
    }
  ],
  "activityRatings": [
    { "activity": "Outdoor Running / Jogging", "score": "8/10", "tip": "Brief advice" },
    { "activity": "Outdoor Dining / Patio", "score": "7/10", "tip": "Brief advice" },
    { "activity": "Car Wash", "score": "5/10", "tip": "Brief advice" },
    { "activity": "Travel / Commute", "score": "9/10", "tip": "Brief advice" }
  ],
  "customAnswer": ${customQuestion ? '"Direct, friendly answer to the user question"' : "null"}
}
Only return the JSON object, no Markdown backticks or commentary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const text = response.text?.trim() || "{}";
    let parsedData = null;
    try {
      parsedData = JSON.parse(text);
    } catch {
      // Clean possible fences
      const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
      parsedData = JSON.parse(cleaned);
    }

    res.json({
      available: true,
      data: parsedData,
    });
  } catch (err: any) {
    console.error("Error in /api/planning:", err);
    res.status(500).json({
      available: false,
      error: err.message || "Failed to generate AI planning instructions",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Weather Intelligence server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
