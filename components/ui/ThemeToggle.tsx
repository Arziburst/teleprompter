"use client";

import { type FC } from "react";
import type { Theme } from "@/types/teleprompter";

type ThemeToggleProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export const ThemeToggle: FC<ThemeToggleProps> = ({ theme, onThemeChange }) => (
  <div
    className={`flex w-fit items-center overflow-hidden rounded-full border text-xs transition-colors ${
      theme === "dark" ? "border-slate-700" : "border-slate-300"
    }`}
  >
    <button
      type="button"
      onClick={() => onThemeChange("dark")}
      className={`px-3 py-1.5 font-medium transition-colors ${
        theme === "dark"
          ? "bg-slate-900 text-slate-100"
          : "bg-transparent text-slate-900 hover:text-emerald-600"
      }`}
    >
      Dark
    </button>
    <button
      type="button"
      onClick={() => onThemeChange("light")}
      className={`border-l px-3 py-1.5 font-medium transition-colors ${
        theme === "dark" ? "border-slate-700" : "border-slate-300"
      } ${
        theme === "light"
          ? "bg-slate-200 text-slate-900"
          : "bg-transparent text-slate-400 hover:text-emerald-500"
      }`}
    >
      Light
    </button>
  </div>
);
