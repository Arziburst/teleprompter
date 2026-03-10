"use client";

import { type FC } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Type
} from "lucide-react";
import type { FlashType } from "@/types/teleprompter";

type FlashOverlayProps = {
  type: FlashType;
  value: string | null;
  isDark: boolean;
};

export const FlashOverlay: FC<FlashOverlayProps> = ({
  type,
  value,
  isDark
}) => {
  if (!type) return null;

  const bgClass = isDark
    ? "bg-slate-900/55 shadow-black/30"
    : "bg-white/60 shadow-slate-400/40";

  return (
    <div
      key={`${type}-${value ?? ""}`}
      className={`teleprompter-flash-icon pointer-events-none fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 rounded-xl text-emerald-500 ${bgClass} px-3 py-2.5 shadow-xl backdrop-blur-sm`}
      aria-hidden
    >
      {type === "pause" && (
        <Pause className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2} />
      )}
      {type === "play" && (
        <Play className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2} />
      )}
      {type === "faster" && (
        <>
          <ChevronUp className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" strokeWidth={2} />
          {value && (
            <span className="text-sm font-semibold tabular-nums sm:text-base">
              {value}
            </span>
          )}
        </>
      )}
      {type === "slower" && (
        <>
          <ChevronDown className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" strokeWidth={2} />
          {value && (
            <span className="text-sm font-semibold tabular-nums sm:text-base">
              {value}
            </span>
          )}
        </>
      )}
      {(type === "font-up" || type === "font-down") && (
        <>
          <Type className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" strokeWidth={2} />
          {value && (
            <span className="text-sm font-semibold tabular-nums sm:text-base">
              {value}
            </span>
          )}
        </>
      )}
      {(type === "forward" || type === "back") && (
        <>
          {type === "forward" && (
            <ChevronRight className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" strokeWidth={2} />
          )}
          {type === "back" && (
            <ChevronLeft className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" strokeWidth={2} />
          )}
          {value && (
            <span className="text-sm font-semibold tabular-nums sm:text-base">
              {value}
            </span>
          )}
        </>
      )}
      {type === "reset" && (
        <RotateCcw className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2} />
      )}
      {type === "fullscreen" && (
        <Maximize2 className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2} />
      )}
      {type === "fullscreen-exit" && (
        <Minimize2 className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2} />
      )}
    </div>
  );
};
