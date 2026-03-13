"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Theme } from "@/types/teleprompter";
import {
  supabase,
  type TeleprompterSettingsRow
} from "@/lib/supabase";
import {
  DEFAULT_PLACEHOLDER,
  SUPABASE_SETTINGS_ROW_ID,
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

function clampDuration(n: number) {
  const rounded = Math.round(n * 2) / 2;
  return Math.min(DURATION_MAX, Math.max(DURATION_MIN, rounded));
}
function clampSpeed(n: number) {
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, n));
}
function clampFontSize(n: number) {
  return Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(n)));
}

export function useTeleprompterSettings() {
  const [text, setText] = useState("");
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(3);
  const [initialSpeed, setInitialSpeed] = useState(1);
  const [initialFontSize, setInitialFontSize] = useState(40);
  const [durationTouched, setDurationTouched] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [bootstrapped, setBootstrapped] = useState(false);

  const applyingRemoteRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    (patch: Partial<{
      text: string;
      duration_minutes: number;
      speed: number;
      font_size: number;
      theme: Theme;
    }>) => {
      if (!supabase || applyingRemoteRef.current) return;
      void supabase
        .from("teleprompter_settings")
        .upsert(
          {
            id: SUPABASE_SETTINGS_ROW_ID,
            ...patch,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        )
        .then(({ error }) => {
          if (error) console.error("Supabase upsert error:", error);
        });
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!supabase) {
        setText(DEFAULT_PLACEHOLDER);
        setBootstrapped(true);
        return;
      }
      const { data, error } = await supabase
        .from("teleprompter_settings")
        .select("*")
        .eq("id", SUPABASE_SETTINGS_ROW_ID)
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        console.error("Supabase fetch error:", error);
        setText(DEFAULT_PLACEHOLDER);
        setBootstrapped(true);
        return;
      }

      const row = data as TeleprompterSettingsRow | null;
      if (row) {
        applyingRemoteRef.current = true;
        setText(row.text?.length ? row.text : DEFAULT_PLACEHOLDER);
        setTargetDurationMinutes(clampDuration(Number(row.duration_minutes)));
        setDurationTouched(true);
        setInitialSpeed(clampSpeed(Number(row.speed)));
        setInitialFontSize(clampFontSize(Number(row.font_size)));
        if (row.theme === "light" || row.theme === "dark") {
          setTheme(row.theme);
        }
        setTimeout(() => {
          applyingRemoteRef.current = false;
        }, 300);
      } else {
        setText(DEFAULT_PLACEHOLDER);
        persist({
          text: "",
          duration_minutes: 3,
          speed: 1,
          font_size: 40,
          theme: "light"
        });
      }
      setBootstrapped(true);
    })();

    if (!supabase) return;

    const channel = supabase
      .channel("teleprompter-settings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teleprompter_settings",
          filter: `id=eq.${SUPABASE_SETTINGS_ROW_ID}`
        },
        (payload) => {
          if (!mounted) return;
          const row = payload.new as TeleprompterSettingsRow | undefined;
          if (!row) return;
          applyingRemoteRef.current = true;
          setText(row.text?.length ? row.text : DEFAULT_PLACEHOLDER);
          setTargetDurationMinutes(clampDuration(Number(row.duration_minutes)));
          setDurationTouched(true);
          setInitialSpeed(clampSpeed(Number(row.speed)));
          setInitialFontSize(clampFontSize(Number(row.font_size)));
          if (row.theme === "light" || row.theme === "dark") {
            setTheme(row.theme);
          }
          setTimeout(() => {
            applyingRemoteRef.current = false;
          }, 300);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [persist]);

  useEffect(() => {
    if (!bootstrapped || applyingRemoteRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      persist({
        text,
        duration_minutes: targetDurationMinutes,
        speed: initialSpeed,
        font_size: initialFontSize,
        theme
      });
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    bootstrapped,
    text,
    targetDurationMinutes,
    initialSpeed,
    initialFontSize,
    theme,
    persist
  ]);

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
    const words = trimmed
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
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

  const persistPartial = useCallback(
    (patch: { speed?: number; font_size?: number }) => {
      if (!supabase || applyingRemoteRef.current) return;
      void supabase
        .from("teleprompter_settings")
        .update({
          ...patch,
          updated_at: new Date().toISOString()
        })
        .eq("id", SUPABASE_SETTINGS_ROW_ID)
        .then(({ error }) => {
          if (error) console.error("Supabase update error:", error);
        });
    },
    []
  );

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
    handleResetSettings,
    persistPartial
  };
}
