"use client";

import { HotkeysProvider } from "@tanstack/react-hotkeys";

export function Providers({ children }: { children: React.ReactNode }) {
  return <HotkeysProvider>{children}</HotkeysProvider>;
}
