# Weather Intelligence App

A modern, responsive weather intelligence and lifestyle planning web application powered by **Open-Meteo APIs** and **Google Gemini AI**.

Users can search for any global city or locate themselves via GPS to view real-time atmospheric metrics, a 24-hour hourly trend, a comprehensive 7-day forecast, and actionable day-by-day lifestyle planning instructions (attire guidance, outdoor activity ratings, and custom AI meteorological consultation).

---

## 🌟 Key Features

- **Global City Search & Geolocation**:
  - Instant city geocoding search powered by Open-Meteo Geocoding API (`/v1/search`).
  - Pre-configured quick select for major international hubs (New York, London, Tokyo, Paris, San Francisco, Sydney).
  - One-click browser geolocation to load hyper-local weather.

- **Real-Time Weather Metrics**:
  - Live temperature, "feels-like" temperature, and condition indicators.
  - Comprehensive atmospheric data: humidity, wind speed, gust velocity, UV index with danger classifications, air pressure (hPa), cloud cover percentage, and rain probability.

- **7-Day Meteorological Forecast**:
  - Daily highs and lows with visual temperature range indicators.
  - Detailed daily expandable panels showing sunrise/sunset times, maximum wind gusts, UV index, and total expected precipitation.
  - 24-hour horizontal scrolling hourly forecast timeline.

- **Actionable Planning Instructions**:
  - **Today's Attire & Gear**: Smart suggestions for clothing layers, recommended footwear, and necessary accessories (umbrellas, UV sunglasses, thermal beanies, etc.).
  - **Optimal Outdoor Time Window**: Analyzes hourly rain chances and temperatures to suggest the best times for outdoor activities.
  - **7-Day Planning Guide**: Clear, strategic daily tags (e.g., *Rain Gear Needed*, *Ideal Outdoor Day*, *Storm Warning*) to organize errands and outdoor events.
  - **Activity & Sports Suitability**: Dynamic 0–100 suitability scores with tips for running/jogging, cycling, patio dining, and car washing.
  - **AI Planning Advisor**: An integrated conversational advisor powered by Gemini (`gemini-3.8-flash`) to answer personalized questions regarding travel packing, commuting, or weekend events.

- **Unit Switching**:
  - Seamless toggle between **Metric** (°C, km/h, mm) and **Imperial** (°F, mph, in) units.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Motion
- **Backend / Proxy**: Node.js, Express, tsx, esbuild
- **AI Integration**: `@google/genai` TypeScript SDK (`gemini-3.8-flash`)
- **Weather & Geocoding Data**: [Open-Meteo APIs](https://open-meteo.com/) (Free for non-commercial and open data, licensed under CC BY 4.0)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd weather-intelligence
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Provide your Gemini API key (optional for basic weather, required for AI Advisor):
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📦 How to Push to GitHub

### Option A: Direct Git CLI (Recommended)

If you haven't initialized a Git repository yet:

```bash
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Commit changes
git commit -m "Initial commit: Weather Intelligence with Open-Meteo and Gemini"

# 4. Set default branch to main
git branch -M main

# 5. Link your GitHub remote repository
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 6. Push to GitHub
git push -u origin main
```

### Option B: Export via Google AI Studio

You can also export this project directly to GitHub or download a complete ZIP archive from the **AI Studio Settings / Export** menu in the top-right corner of the application interface.

---

## 📄 Data Attribution & License

- Weather forecasts and geocoding courtesy of [Open-Meteo.com](https://open-meteo.com/) under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license.
- Released under the Apache 2.0 License.
