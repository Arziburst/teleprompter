"use client";

import { type FC } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { Theme } from "@/types/teleprompter";

type EditorHeaderProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export const EditorHeader: FC<EditorHeaderProps> = ({ theme, onThemeChange }) => (
  <header className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between md:mb-8">
    <div>
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
        Minimal Teleprompter
      </h1>
      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
        Paste your script, press Start, and read comfortably.
      </p>
    </div>
    <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
  </header>
);
