import React from "react";
import { UnitSystem } from "../types";

interface UnitToggleProps {
  unitSystem: UnitSystem;
  onToggle: (unit: UnitSystem) => void;
}

export const UnitToggle: React.FC<UnitToggleProps> = ({ unitSystem, onToggle }) => {
  return (
    <div
      id="unit-toggle-group"
      className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold"
    >
      <button
        type="button"
        id="unit-toggle-metric"
        onClick={() => onToggle("metric")}
        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
          unitSystem === "metric"
            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-2xs"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        }`}
      >
        °C, km/h
      </button>
      <button
        type="button"
        id="unit-toggle-imperial"
        onClick={() => onToggle("imperial")}
        className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
          unitSystem === "imperial"
            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-2xs"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        }`}
      >
        °F, mph
      </button>
    </div>
  );
};
