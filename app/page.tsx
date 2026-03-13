"use client";

import { useCallback, useState } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useTeleprompterSettings } from "@/hooks/useTeleprompterSettings";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { EditorView } from "@/components/editor/EditorView";
import { TeleprompterView } from "@/components/teleprompter/TeleprompterView";

type Mode = "edit" | "teleprompter";

export default function HomePage() {
  const [mode, setMode] = useState<Mode>("edit");
  const {
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
  } = useTeleprompterSettings();

  const handleStart = useCallback(() => {
    if (!text.trim()) return;
    setMode("teleprompter");
  }, [text]);

  const handleBackToEdit = useCallback(() => {
    setMode("edit");
  }, []);

  useHotkey(
    "Enter",
    (e) => {
      e.preventDefault();
      handleStart();
    },
    { enabled: mode === "edit" }
  );
  useHotkey(
    "Mod+Enter",
    (e) => {
      e.preventDefault();
      handleStart();
    },
    { enabled: mode === "edit" }
  );

  if (!bootstrapped) {
    return <LoadingScreen />;
  }

  if (mode === "teleprompter") {
    return (
      <TeleprompterView
        text={text}
        targetDurationMinutes={targetDurationMinutes}
        initialSpeed={initialSpeed}
        initialFontSize={initialFontSize}
        theme={theme}
        onBackToEdit={handleBackToEdit}
        onPersistPartial={persistPartial}
      />
    );
  }

  return (
    <EditorView
      theme={theme}
      onThemeChange={setTheme}
      text={text}
      onTextChange={setText}
      onClearText={handleClearText}
      targetDurationMinutes={targetDurationMinutes}
      onDurationChange={setTargetDurationMinutes}
      onDurationTouch={() => setDurationTouched(true)}
      initialSpeed={initialSpeed}
      onSpeedChange={setInitialSpeed}
      initialFontSize={initialFontSize}
      onFontSizeChange={setInitialFontSize}
      onResetSettings={handleResetSettings}
      onStart={handleStart}
    />
  );
}
