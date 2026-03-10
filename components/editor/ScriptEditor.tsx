"use client";

import { type FC } from "react";
import type { Theme } from "@/types/teleprompter";

type ScriptEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  theme: Theme;
};

export const ScriptEditor: FC<ScriptEditorProps> = ({
  value,
  onChange,
  onClear,
  placeholder,
  theme
}) => {
  const isDark = theme === "dark";
  const inputClass = isDark
    ? "border-slate-800 bg-slate-950/80 text-slate-50 shadow-black/60"
    : "border-slate-300 bg-slate-50 text-slate-900 shadow-slate-200";
  const clearBtnClass = isDark
    ? "border-slate-700 text-slate-200 hover:bg-slate-900"
    : "border-slate-300 text-slate-900 hover:text-emerald-600 hover:bg-emerald-50/80";

  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label
          htmlFor="script"
          className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400"
        >
          Script text
        </label>
        <button
          type="button"
          onClick={onClear}
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors sm:px-3 ${clearBtnClass}`}
        >
          Clear text
        </button>
      </div>
      <textarea
        id="script"
        className={`min-h-[180px] flex-1 resize-none rounded-xl border px-3 py-3 text-sm shadow-inner outline-none ring-0 focus:border-emerald-500 focus:outline-none sm:min-h-[260px] ${inputClass}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </>
  );
};
