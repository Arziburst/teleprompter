"use client";

import { type FC } from "react";
import type { Theme } from "@/types/teleprompter";
import {
  DURATION_MIN,
  DURATION_MAX,
  SPEED_MIN,
  SPEED_MAX,
  FONT_MIN,
  FONT_MAX,
  FONT_STEP_EDITOR
} from "@/lib/constants";

type EditorSettingsProps = {
  theme: Theme;
  targetDurationMinutes: number;
  onDurationChange: (value: number) => void;
  onDurationTouch: () => void;
  initialSpeed: number;
  onSpeedChange: (value: number) => void;
  initialFontSize: number;
  onFontSizeChange: (value: number) => void;
  onReset: () => void;
};

export const EditorSettings: FC<EditorSettingsProps> = ({
  theme,
  targetDurationMinutes,
  onDurationChange,
  onDurationTouch,
  initialSpeed,
  onSpeedChange,
  initialFontSize,
  onFontSizeChange,
  onReset
}) => {
  const isDark = theme === "dark";
  const containerClass = isDark
    ? "border-slate-800 bg-slate-950/70 text-slate-400"
    : "border-slate-200 bg-slate-100 text-slate-600";
  const inputClass = isDark
    ? "border-slate-700 bg-slate-900 text-slate-50"
    : "border-slate-300 bg-white text-slate-900";
  const resetBtnClass = isDark
    ? "border-slate-700 text-slate-200 hover:bg-slate-900"
    : "border-slate-300 text-slate-900 hover:text-emerald-600 hover:bg-emerald-50/80";

  const clampDuration = (v: number) =>
    Math.min(DURATION_MAX, Math.max(DURATION_MIN, v));
  const clampSpeed = (v: number) => Math.min(SPEED_MAX, Math.max(SPEED_MIN, v));
  const clampFont = (v: number) =>
    Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(v)));

  return (
    <div
      className={`mt-3 flex flex-col gap-3 rounded-xl border px-3 py-3 text-xs sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 ${containerClass}`}
    >
      <div className="flex items-center gap-2">
        <label
          htmlFor="duration"
          className="w-32 shrink-0 font-medium uppercase tracking-wide sm:w-auto"
        >
          Estimated read time
        </label>
        <div className="flex items-center gap-2">
          <input
            id="duration"
            type="number"
            min={DURATION_MIN}
            max={DURATION_MAX}
            step={0.5}
            value={targetDurationMinutes}
            onChange={(e) => {
              const v = Number.parseFloat(e.target.value);
              if (!Number.isFinite(v)) return;
              onDurationTouch();
              onDurationChange(clampDuration(v));
            }}
            className={`w-16 rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-emerald-500 sm:w-20 ${inputClass}`}
          />
          <span>min</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label
          htmlFor="initial-speed"
          className="w-32 shrink-0 font-medium uppercase tracking-wide sm:w-auto"
        >
          Initial speed
        </label>
        <input
          id="initial-speed"
          type="number"
          min={SPEED_MIN}
          max={SPEED_MAX}
          step={0.1}
          value={initialSpeed.toFixed(1)}
          onChange={(e) => {
            const v = Number.parseFloat(e.target.value);
            if (!Number.isFinite(v)) return;
            onSpeedChange(clampSpeed(v));
          }}
          className={`w-16 rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-emerald-500 sm:w-20 ${inputClass}`}
        />
      </div>
      <div className="flex items-center gap-2">
        <label
          htmlFor="initial-font"
          className="w-32 shrink-0 font-medium uppercase tracking-wide sm:w-auto"
        >
          Initial font
        </label>
        <input
          id="initial-font"
          type="number"
          min={FONT_MIN}
          max={FONT_MAX}
          step={FONT_STEP_EDITOR}
          value={initialFontSize}
          onChange={(e) => {
            const v = Number.parseFloat(e.target.value);
            if (!Number.isFinite(v)) return;
            onFontSizeChange(clampFont(v));
          }}
          className={`w-16 rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-emerald-500 sm:w-20 ${inputClass}`}
        />
      </div>
      <button
        type="button"
        onClick={onReset}
        className={`w-full rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors sm:ml-auto sm:w-auto ${resetBtnClass}`}
      >
        Reset to initial
      </button>
    </div>
  );
};
