"use client";

import { type FC } from "react";
import { EditorHeader } from "./EditorHeader";
import { ScriptEditor } from "./ScriptEditor";
import { EditorSettings } from "./EditorSettings";
import type { Theme } from "@/types/teleprompter";
import { DEFAULT_PLACEHOLDER } from "@/lib/constants";

type EditorViewProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  text: string;
  onTextChange: (value: string) => void;
  onClearText: () => void;
  targetDurationMinutes: number;
  onDurationChange: (value: number) => void;
  onDurationTouch: () => void;
  initialSpeed: number;
  onSpeedChange: (value: number) => void;
  initialFontSize: number;
  onFontSizeChange: (value: number) => void;
  onResetSettings: () => void;
  onStart: () => void;
};

export const EditorView: FC<EditorViewProps> = ({
  theme,
  onThemeChange,
  text,
  onTextChange,
  onClearText,
  targetDurationMinutes,
  onDurationChange,
  onDurationTouch,
  initialSpeed,
  onSpeedChange,
  initialFontSize,
  onFontSizeChange,
  onResetSettings,
  onStart
}) => {
  const cardClass =
    theme === "dark"
      ? "border-slate-800 bg-slate-900/60 shadow-black/40"
      : "border-slate-200 bg-white shadow-slate-200/80";

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-4 sm:py-6 md:py-10 min-h-0">
        <EditorHeader theme={theme} onThemeChange={onThemeChange} />
        <section className="flex min-h-0 flex-1 flex-col">
          <div
            className={`flex min-h-0 flex-1 flex-col rounded-2xl border p-3 shadow-xl sm:p-6 ${cardClass}`}
          >
            <ScriptEditor
              value={text}
              onChange={onTextChange}
              onClear={onClearText}
              placeholder={DEFAULT_PLACEHOLDER}
              theme={theme}
            />
            <EditorSettings
              theme={theme}
              targetDurationMinutes={targetDurationMinutes}
              onDurationChange={onDurationChange}
              onDurationTouch={onDurationTouch}
              initialSpeed={initialSpeed}
              onSpeedChange={onSpeedChange}
              initialFontSize={initialFontSize}
              onFontSizeChange={onFontSizeChange}
              onReset={onResetSettings}
            />
            <div className="mt-3 flex flex-wrap items-center justify-end gap-3 sm:mt-4">
              <button
                type="button"
                onClick={onStart}
                title="Press Enter (when not typing in script) or Ctrl+Enter to start"
                className="w-full rounded-full bg-emerald-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-black shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 sm:w-auto sm:py-2"
              >
                Start teleprompter (Enter)
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
