"use client";

import { useCallback, useEffect, useState } from "react";
import { TeleprompterView } from "../components/TeleprompterView";

type Mode = "edit" | "teleprompter";

const DEFAULT_PLACEHOLDER = `Welcome to your minimal teleprompter.

Paste or type your script here.

Use Ctrl+Enter (or Cmd+Enter) to start teleprompter mode.

While reading:
- Space pauses and resumes
- Up / Down arrows adjust speed
- + / - adjust font size
- Esc exits fullscreen or returns to edit mode.`;

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("edit");
  const [text, setText] = useState<string>("");
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(3);
  const [initialSpeed, setInitialSpeed] = useState<number>(1);
  const [initialFontSize, setInitialFontSize] = useState<number>(40);
  const [durationTouched, setDurationTouched] = useState<boolean>(false);

  useEffect(() => {
    const storedSettings = window.localStorage.getItem(
      "teleprompter-settings"
    );

    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings) as {
          text?: string;
          durationMinutes?: number;
          speed?: number;
          fontSize?: number;
        };
        if (parsed.text && parsed.text.length > 0) {
          setText(parsed.text);
        } else {
          setText(DEFAULT_PLACEHOLDER);
        }
        if (
          typeof parsed.durationMinutes === "number" &&
          Number.isFinite(parsed.durationMinutes)
        ) {
          const roundedMinutes =
            Math.round(parsed.durationMinutes * 2) / 2;
          setTargetDurationMinutes(
            Math.min(60, Math.max(0.5, roundedMinutes))
          );
          setDurationTouched(true);
        }
        if (typeof parsed.speed === "number" && Number.isFinite(parsed.speed)) {
          setInitialSpeed(Math.min(5, Math.max(0.1, parsed.speed)));
        }
        if (
          typeof parsed.fontSize === "number" &&
          Number.isFinite(parsed.fontSize)
        ) {
          setInitialFontSize(
            Math.min(96, Math.max(20, Math.round(parsed.fontSize)))
          );
        }
        return;
      } catch {
        // fall through to legacy keys
      }
    }

    const legacyText = window.localStorage.getItem("teleprompter-text");
    const legacyDuration = window.localStorage.getItem(
      "teleprompter-duration-minutes"
    );

    if (legacyText && legacyText.length > 0) {
      setText(legacyText);
    } else {
      setText(DEFAULT_PLACEHOLDER);
    }

    if (legacyDuration) {
      const parsedDuration = Number.parseFloat(legacyDuration);
      if (Number.isFinite(parsedDuration)) {
        const roundedMinutes = Math.round(parsedDuration * 2) / 2;
        setTargetDurationMinutes(
          Math.min(60, Math.max(0.5, roundedMinutes))
        );
        setDurationTouched(true);
      }
    }
  }, []);

  useEffect(() => {
    const settings = {
      text,
      durationMinutes: targetDurationMinutes,
      speed: initialSpeed,
      fontSize: initialFontSize
    };
    window.localStorage.setItem(
      "teleprompter-settings",
      JSON.stringify(settings)
    );
  }, [text, targetDurationMinutes, initialSpeed, initialFontSize]);

  useEffect(() => {
    if (durationTouched) {
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    const words = trimmed
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    if (words.length === 0) {
      return;
    }

    const averageWordsPerMinute = 140;
    const minutes = words.length / averageWordsPerMinute;
    const roundedMinutes = Math.round(minutes * 2) / 2;
    const clampedMinutes = Math.min(60, Math.max(0.5, roundedMinutes));
    setTargetDurationMinutes(clampedMinutes);
  }, [text, durationTouched]);

  const handleStart = useCallback(() => {
    if (!text.trim()) return;
    setMode("teleprompter");
  }, [text]);

  const handleBackToEdit = useCallback(() => {
    setMode("edit");
  }, []);

  const handleResetSettings = useCallback(() => {
    setDurationTouched(false);
    setInitialSpeed(1);
    setInitialFontSize(40);
  }, []);

  if (mode === "teleprompter") {
    return (
      <TeleprompterView
        text={text}
        targetDurationMinutes={targetDurationMinutes}
        initialSpeed={initialSpeed}
        initialFontSize={initialFontSize}
        onBackToEdit={handleBackToEdit}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Minimal Teleprompter
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Paste your script, press Start, and read comfortably.
          </p>
        </header>

        <section className="flex-1">
          <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl shadow-black/40 sm:p-6">
            <label
              htmlFor="script"
              className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Script text
            </label>
            <textarea
              id="script"
              className="min-h-[260px] flex-1 resize-none rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-3 text-sm text-slate-50 shadow-inner shadow-black/60 outline-none ring-0 focus:border-emerald-500 focus:outline-none"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={DEFAULT_PLACEHOLDER}
              onKeyDown={(event) => {
                const isCmdOrCtrl =
                  event.metaKey || event.ctrlKey;
                if (event.key === "Enter" && isCmdOrCtrl) {
                  event.preventDefault();
                  handleStart();
                }
              }}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-xs text-slate-400">
              <label
                htmlFor="duration"
                className="font-medium uppercase tracking-wide"
              >
                Estimated read time
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="duration"
                  type="number"
                  min={0.5}
                  max={60}
                  step={0.5}
                  value={targetDurationMinutes}
                  onChange={(event) => {
                    const value = Number.parseFloat(event.target.value);
                    if (!Number.isFinite(value)) return;
                    setDurationTouched(true);
                    setTargetDurationMinutes(
                      Math.min(60, Math.max(0.5, value))
                    );
                  }}
                  className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-50 outline-none focus:border-emerald-500"
                />
                <span>min</span>
              </div>
              <label
                htmlFor="initial-speed"
                className="font-medium uppercase tracking-wide"
              >
                Initial speed
              </label>
              <input
                id="initial-speed"
                type="number"
                min={0.1}
                max={5}
                step={0.1}
                value={initialSpeed.toFixed(1)}
                onChange={(event) => {
                  const value = Number.parseFloat(event.target.value);
                  if (!Number.isFinite(value)) return;
                  setInitialSpeed(Math.min(5, Math.max(0.1, value)));
                }}
                className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-50 outline-none focus:border-emerald-500"
              />
              <label
                htmlFor="initial-font"
                className="font-medium uppercase tracking-wide"
              >
                Initial font
              </label>
              <input
                id="initial-font"
                type="number"
                min={20}
                max={96}
                step={2}
                value={initialFontSize}
                onChange={(event) => {
                  const value = Number.parseFloat(event.target.value);
                  if (!Number.isFinite(value)) return;
                  setInitialFontSize(
                    Math.min(96, Math.max(20, Math.round(value)))
                  );
                }}
                className="w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-50 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleResetSettings}
                className="ml-auto rounded-full border border-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-slate-900"
              >
                Reset to initial
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Your text is stored locally in this browser.
              </p>
              <button
                type="button"
                onClick={handleStart}
                className="rounded-full bg-emerald-500 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400"
              >
                Start teleprompter
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

