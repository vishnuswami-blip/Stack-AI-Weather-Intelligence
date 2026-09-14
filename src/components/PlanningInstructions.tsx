import React, { useState } from "react";
import {
  Compass,
  Shirt,
  ShieldAlert,
  Clock,
  CalendarCheck,
  Activity,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Umbrella,
  Sun,
  Flame,
  HelpCircle,
} from "lucide-react";
import { WeatherDataState } from "../types";
import { requestAiPlanningInstructions } from "../services/weatherApi";

interface PlanningInstructionsProps {
  weather: WeatherDataState;
}

type TabType = "directives" | "weekGuide" | "activities" | "aiAdvisor";

const QUICK_PROMPTS = [
  "What is the best time for outdoor running today?",
  "Should I plan an outdoor event this weekend?",
  "What should I pack for a 3-day trip here?",
  "Is tomorrow a good day to wash my car?",
];

export const PlanningInstructions: React.FC<PlanningInstructionsProps> = ({ weather }) => {
  const { intelligence, units, city } = weather;
  const [activeTab, setActiveTab] = useState<TabType>("directives");
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedFocus, setSelectedFocus] = useState("general");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAskAi = async (customQuestion?: string) => {
    const questionToAsk = customQuestion || userPrompt;
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const res = await requestAiPlanningInstructions(weather, selectedFocus, questionToAsk);
      if (res.available && res.data) {
        setAiResult(res.data);
      } else {
        setAiError(res.message || "AI service is currently operating in standard rule-based mode.");
      }
    } catch (err: any) {
      console.error("AI Planning request error:", err);
      setAiError("Unable to reach AI assistant. Rule-based intelligence remains fully available.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div
      id="planning-instructions-card"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-xs"
    >
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Weather Intelligence & Planning Instructions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Actionable lifestyle, attire, and scheduling guidance for {city.name}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs overflow-x-auto">
          <button
            type="button"
            id="tab-today-directives"
            onClick={() => setActiveTab("directives")}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === "directives"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Today's Directives
          </button>
          <button
            type="button"
            id="tab-7day-guide"
            onClick={() => setActiveTab("weekGuide")}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === "weekGuide"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            7-Day Planning Guide
          </button>
          <button
            type="button"
            id="tab-activities"
            onClick={() => setActiveTab("activities")}
            className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === "activities"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Activities & Sports
          </button>
          <button
            type="button"
            id="tab-ai-advisor"
            onClick={() => setActiveTab("aiAdvisor")}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap cursor-pointer ${
              activeTab === "aiAdvisor"
                ? "bg-sky-500 text-white shadow-2xs font-semibold"
                : "text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Advisor</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Today's Directives */}
      {activeTab === "directives" && (
        <div id="directives-content" className="space-y-4">
          {/* Optimal Window Banner */}
          <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500 text-white shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-sky-700 dark:text-sky-300">
                  Best Outdoor Window Today
                </span>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {intelligence.bestOutdoorWindow.time}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {intelligence.bestOutdoorWindow.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Safety / Weather Alerts */}
          {intelligence.alerts.length > 0 && (
            <div className="space-y-2">
              {intelligence.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          )}

          {/* Attire & Gear Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Shirt className="w-4 h-4 text-indigo-500" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Recommended Attire & Gear
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Layers & Clothing
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {intelligence.attire.layers}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Footwear
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {intelligence.attire.footwear}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Suggested Gear & Items
                </span>
                {intelligence.attire.accessories.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {intelligence.attire.accessories.map((acc, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                      >
                        {acc}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">Standard everyday accessories sufficient.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 7-Day Planning Guide */}
      {activeTab === "weekGuide" && (
        <div id="week-guide-content" className="space-y-2.5">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Strategic scheduling recommendations for each day of the upcoming 7-day cycle:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {intelligence.sevenDayDirectives.map((d, index) => (
              <div
                key={d.date}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {d.day}
                    </span>
                    <span className="text-[11px] text-slate-400">({d.date})</span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      d.tag.includes("Rain") || d.tag.includes("Storm")
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                        : d.tag.includes("Warm")
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    }`}
                  >
                    {d.tag}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {d.instruction}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 pt-2 mt-2">
                  <span>
                    Temp: {d.tempMin}° – {d.tempMax}{units.temperature}
                  </span>
                  <span>Rain chance: {d.rainProb}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Activities Suitability */}
      {activeTab === "activities" && (
        <div id="activities-content" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {intelligence.activities.map((act) => {
            const isGood = act.score >= 70;
            const isFair = act.score >= 50 && act.score < 70;
            return (
              <div
                key={act.name}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {act.name}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        isGood
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : isFair
                          ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      }`}
                    >
                      {act.rating} ({act.score}/100)
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {act.commentary}
                  </p>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${
                      isGood ? "bg-emerald-500" : isFair ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${act.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: AI Advisor Powered by Gemini */}
      {activeTab === "aiAdvisor" && (
        <div id="ai-advisor-content" className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50/40 dark:from-sky-950/20 dark:to-indigo-950/20 border border-sky-100 dark:border-sky-900/40">
            <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini Meteorological Intelligence Advisor</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Ask any specific question regarding your plans in {city.name}, or click quick prompts below to generate deep weather planning insights.
            </p>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setUserPrompt(prompt);
                    handleAskAi(prompt);
                  }}
                  disabled={isLoadingAi}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-sky-400 dark:hover:border-sky-700 transition cursor-pointer shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 mt-3.5">
              <input
                id="ai-planning-input"
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoadingAi && userPrompt.trim()) {
                    handleAskAi();
                  }
                }}
                placeholder="Ask about commuting, outdoor gear, events, or travel..."
                className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                id="ai-planning-submit-btn"
                type="button"
                onClick={() => handleAskAi()}
                disabled={isLoadingAi || !userPrompt.trim()}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isLoadingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Ask Advisor</span>
              </button>
            </div>
          </div>

          {/* AI Response Display */}
          {aiResult && (
            <div
              id="ai-planning-result-box"
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-2xs"
            >
              {aiResult.customAnswer && (
                <div className="p-3 bg-sky-50/60 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900/60 text-xs">
                  <span className="font-bold text-sky-800 dark:text-sky-300 block mb-1">
                    Direct Planning Answer:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {aiResult.customAnswer}
                  </p>
                </div>
              )}

              {aiResult.executiveSummary && (
                <div>
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Executive Meteorology Brief
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {aiResult.executiveSummary}
                  </p>
                </div>
              )}

              {aiResult.todayAdvice && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="font-semibold text-slate-500 text-[11px] block">Clothing & Fabrics</span>
                    <span className="text-slate-800 dark:text-slate-200">{aiResult.todayAdvice.clothing}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="font-semibold text-slate-500 text-[11px] block">Best Time Window</span>
                    <span className="text-slate-800 dark:text-slate-200">{aiResult.todayAdvice.bestTimeWindow}</span>
                  </div>
                </div>
              )}

              {aiResult.weekDirectives && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    7-Day Action Directives
                  </h5>
                  <div className="space-y-1.5 text-xs">
                    {aiResult.weekDirectives.map((wd: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 min-w-[70px]">
                          {wd.day}:
                        </span>
                        <span>{wd.recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {aiError && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
              {aiError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
