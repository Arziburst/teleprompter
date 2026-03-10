"use client";

import { useCallback, useEffect, useState } from "react";
import type { Theme } from "@/types/teleprompter";
import {
  DEFAULT_PLACEHOLDER,
  STORAGE_KEY,
  LEGACY_TEXT_KEY,
  LEGACY_DURATION_KEY,
  DURATION_MIN,
  DURATION_MAX,
  SPEED_MIN,
  SPEED_MAX,
  FONT_MIN,
  FONT_MAX,
  AVERAGE_WORDS_PER_MINUTE
} from "@/lib/constants";

export type TeleprompterSettingsState = {
  text: string;
  targetDurationMinutes: number;
  initialSpeed: number;
  initialFontSize: number;
  durationTouched: boolean;
  theme: Theme;
  bootstrapped: boolean;
};

export function useTeleprompterSettings() {
  const [text, setText] = useState("");
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(3);
  const [initialSpeed, setInitialSpeed] = useState(1);
  const [initialFontSize, setInitialFontSize] = useState(40);
  const [durationTouched, setDurationTouched] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let handledFromSettings = false;
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          text?: string;
          durationMinutes?: number;
          speed?: number;
          fontSize?: number;
          theme?: Theme;
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
          const rounded = Math.round(parsed.durationMinutes * 2) / 2;
          setTargetDurationMinutes(Math.min(DURATION_MAX, Math.max(DURATION_MIN, rounded)));
          setDurationTouched(true);
        }
        if (typeof parsed.speed === "number" && Number.isFinite(parsed.speed)) {
          setInitialSpeed(Math.min(SPEED_MAX, Math.max(SPEED_MIN, parsed.speed)));
        }
        if (typeof parsed.fontSize === "number" && Number.isFinite(parsed.fontSize)) {
          setInitialFontSize(Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(parsed.fontSize))));
        }
        if (parsed.theme === "light" || parsed.theme === "dark") {
          setTheme(parsed.theme);
        }
        handledFromSettings = true;
      } catch {
        // fall through to legacy
      }
    }

    if (!handledFromSettings && typeof window !== "undefined") {
      const legacyText = window.localStorage.getItem(LEGACY_TEXT_KEY);
      const legacyDuration = window.localStorage.getItem(LEGACY_DURATION_KEY);
      if (legacyText && legacyText.length > 0) {
        setText(legacyText);
      } else {
        setText(DEFAULT_PLACEHOLDER);
      }
      if (legacyDuration) {
        const parsed = Number.parseFloat(legacyDuration);
        if (Number.isFinite(parsed)) {
          const rounded = Math.round(parsed * 2) / 2;
          setTargetDurationMinutes(Math.min(DURATION_MAX, Math.max(DURATION_MIN, rounded)));
          setDurationTouched(true);
        }
      }
    }

    setBootstrapped(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        text,
        durationMinutes: targetDurationMinutes,
        speed: initialSpeed,
        fontSize: initialFontSize,
        theme
      })
    );
  }, [text, targetDurationMinutes, initialSpeed, initialFontSize, theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const body = window.document.body;
    body.classList.remove("theme-dark", "theme-light");
    body.classList.add(theme === "light" ? "theme-light" : "theme-dark");
  }, [theme]);

  useEffect(() => {
    if (durationTouched) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const words = trimmed.split(/\s+/).map((w) => w.trim()).filter((w) => w.length > 0);
    if (words.length === 0) return;
    const minutes = words.length / AVERAGE_WORDS_PER_MINUTE;
    const rounded = Math.round(minutes * 2) / 2;
    setTargetDurationMinutes(Math.min(DURATION_MAX, Math.max(DURATION_MIN, rounded)));
  }, [text, durationTouched]);

  const handleClearText = useCallback(() => {
    setText("");
    setDurationTouched(false);
  }, []);

  const handleResetSettings = useCallback(() => {
    setText(DEFAULT_PLACEHOLDER);
    setDurationTouched(false);
    setInitialSpeed(1);
    setInitialFontSize(40);
  }, []);

  return {
    text,
    setText,
    targetDurationMinutes,
    setTargetDurationMinutes,
    initialSpeed,
    setInitialSpeed,
    initialFontSize,
    setInitialFontSize,
    durationTouched,
    setDurationTouched,
    theme,
    setTheme,
    bootstrapped,
    handleClearText,
    handleResetSettings
  };
}
