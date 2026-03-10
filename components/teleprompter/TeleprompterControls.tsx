"use client";

import { type FC, useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/format";

type TeleprompterControlsProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onFaster: () => void;
  onSlower: () => void;
  onIncreaseFont: () => void;
  onDecreaseFont: () => void;
  onResetPosition: () => void;
  onToggleFullscreen: () => void;
  onBackToEdit: () => void;
  onSeekByPercent: (percent: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
  onNudgeBySeconds: (deltaSeconds: number) => void;
  elapsedSeconds: number;
  remainingSeconds: number;
  speed: number;
  fontSize: number;
  progressPercent: number;
  isFullscreen: boolean;
  isMobile: boolean;
  theme: "dark" | "light";
};

export const TeleprompterControls: FC<TeleprompterControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onFaster,
  onSlower,
  onIncreaseFont,
  onDecreaseFont,
  onResetPosition,
  onToggleFullscreen,
  onBackToEdit,
  onSeekByPercent,
  onSeekStart,
  onSeekEnd,
  onNudgeBySeconds,
  elapsedSeconds,
  remainingSeconds,
  speed,
  fontSize,
  progressPercent,
  isFullscreen,
  isMobile,
  theme
}) => {
  const totalSeconds = elapsedSeconds + remainingSeconds;
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const nudgeSeconds = 1;

  const displayLeftLabel = formatTime(elapsedSeconds);
  const totalLabel = formatTime(totalSeconds);

  const handleSeekFromClientX = (
    clientX: number,
    target: HTMLDivElement,
    commit: boolean
  ) => {
    const rect = target.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, x / rect.width));
    const percent = ratio * 100;
    setHoverPercent(percent);
    if (commit) onSeekByPercent(percent);
  };

  useEffect(() => {
    if (!isSeeking || !barRef.current) return;
    const target = barRef.current;
    const handleMove = (e: MouseEvent) =>
      handleSeekFromClientX(e.clientX, target, true);
    const handleUp = (e: MouseEvent) => {
      handleSeekFromClientX(e.clientX, target, true);
      setIsSeeking(false);
      onSeekEnd();
      setHoverPercent(null);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isSeeking, onSeekEnd]);

  useEffect(() => {
    if (!isSeeking || !barRef.current) return;
    const target = barRef.current;
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      handleSeekFromClientX(touch.clientX, target, true);
    };
    const handleTouchEnd = () => {
      setIsSeeking(false);
      onSeekEnd();
      setHoverPercent(null);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isSeeking, onSeekEnd]);

  const rootBgClass =
    theme === "dark"
      ? "bg-black/80 text-slate-50"
      : "bg-white/95 text-slate-900 shadow-slate-300/70";
  const isLight = theme === "light";
  const timeClass = isLight ? "text-slate-700" : "text-slate-300";
  const barTrackClass = isLight ? "bg-slate-300" : "bg-slate-800";
  const borderClass = isLight ? "border-slate-300" : "border-slate-600";
  const btnSecondaryClass = isLight
    ? "text-slate-900 hover:text-emerald-600 hover:bg-emerald-50/80"
    : "text-slate-200 hover:bg-slate-800";
  const labelClass = isLight ? "text-slate-700" : "text-slate-200";

  return (
    <div
      className={`pointer-events-auto w-full max-w-5xl rounded-xl px-2 py-3 text-sm shadow-2xl backdrop-blur ${rootBgClass}`}
    >
      <div className="mb-3 flex h-3 w-full items-center gap-2">
        <div className={`text-[11px] text-right ${timeClass}`}>
          <span className="font-semibold">{displayLeftLabel}</span>
        </div>
        <div className="relative flex h-3 flex-1 items-center">
          <div
            ref={barRef}
            className={`h-1.5 w-full cursor-pointer overflow-hidden rounded-full ${barTrackClass}`}
            onMouseDown={(e) => {
              setIsSeeking(true);
              onSeekStart();
              handleSeekFromClientX(e.clientX, e.currentTarget, true);
            }}
            onMouseMove={(e) => {
              if (!isSeeking) {
                handleSeekFromClientX(e.clientX, e.currentTarget, false);
                return;
              }
              handleSeekFromClientX(e.clientX, e.currentTarget, true);
            }}
            onMouseUp={(e) => {
              if (isSeeking) {
                handleSeekFromClientX(e.clientX, e.currentTarget, true);
              }
              setIsSeeking(false);
              onSeekEnd();
              setHoverPercent(null);
            }}
            onMouseLeave={() => {
              if (!isSeeking) setHoverPercent(null);
            }}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              if (!touch) return;
              setIsSeeking(true);
              onSeekStart();
              handleSeekFromClientX(touch.clientX, e.currentTarget, true);
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              if (!touch) return;
              handleSeekFromClientX(touch.clientX, e.currentTarget, true);
            }}
            onTouchEnd={() => {
              setIsSeeking(false);
              onSeekEnd();
              setHoverPercent(null);
            }}
          >
            <div
              className="h-full rounded-full bg-emerald-400 transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {hoverPercent != null && (
            <div
              className={`pointer-events-none absolute -top-4 text-[10px] ${isLight ? "text-slate-800" : "text-slate-100"}`}
              style={{
                left: `${Math.min(100, Math.max(0, hoverPercent))}%`,
                transform: "translateX(-50%)"
              }}
            >
              {formatTime(
                Math.min(
                  totalSeconds,
                  Math.max(0, (hoverPercent / 100) * totalSeconds)
                )
              )}
            </div>
          )}
        </div>
        <div className={`text-[11px] ${timeClass}`}>
          <span className="font-semibold">{totalLabel}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={onTogglePlay}
          className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-black hover:bg-emerald-400"
        >
          {isMobile
            ? isPlaying
              ? "Pause"
              : "Start"
            : isPlaying
              ? "Pause (Space)"
              : "Start (Space)"}
        </button>
        <div
          className={`flex items-center overflow-hidden rounded-full border ${borderClass}`}
        >
          <button
            type="button"
            onClick={() => onNudgeBySeconds(-nudgeSeconds)}
            className={`border-r ${borderClass} px-2.5 py-1.5 text-xs font-medium transition-colors ${btnSecondaryClass}`}
          >
            ← 1s
          </button>
          <button
            type="button"
            onClick={() => onNudgeBySeconds(nudgeSeconds)}
            className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${btnSecondaryClass}`}
          >
            → 1s
          </button>
        </div>
        <div
          className={`flex items-center overflow-hidden rounded-full border ${borderClass}`}
        >
          <button
            type="button"
            onClick={onSlower}
            className={`border-r ${borderClass} px-2.5 py-1.5 text-xs font-medium transition-colors ${btnSecondaryClass}`}
          >
            {isMobile ? "Slower" : "Slower (↓)"}
          </button>
          <span
            className={`min-w-[2.75rem] px-2 text-center text-[11px] font-semibold ${labelClass}`}
          >
            {speed.toFixed(1)}x
          </span>
          <button
            type="button"
            onClick={onFaster}
            className={`border-l ${borderClass} px-2.5 py-1.5 text-xs font-medium transition-colors ${btnSecondaryClass}`}
          >
            {isMobile ? "Faster" : "Faster (↑)"}
          </button>
        </div>
        <div
          className={`flex items-center overflow-hidden rounded-full border ${borderClass}`}
        >
          <button
            type="button"
            onClick={onDecreaseFont}
            className={`border-r ${borderClass} px-2.5 py-1.5 text-xs font-medium transition-colors ${btnSecondaryClass}`}
          >
            {isMobile ? "A-" : "A- (-)"}
          </button>
          <span
            className={`min-w-[2rem] px-2 text-center text-[11px] font-semibold ${labelClass}`}
          >
            {Math.round(fontSize)}
          </span>
          <button
            type="button"
            onClick={onIncreaseFont}
            className={`border-l ${borderClass} px-2.5 py-1.5 text-xs font-medium transition-colors ${btnSecondaryClass}`}
          >
            {isMobile ? "A+" : "A+ (+)"}
          </button>
        </div>
        <button
          type="button"
          onClick={onResetPosition}
          className={`rounded-full border ${borderClass} px-3 py-1.5 text-xs font-medium transition-colors ${btnSecondaryClass}`}
        >
          {isMobile ? "Reset" : "Reset (R)"}
        </button>
        {!isMobile && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
            className={`rounded-full border ${borderClass} px-3 py-1.5 text-xs font-medium transition-colors ${btnSecondaryClass}`}
          >
            {isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
          </button>
        )}
        <button
          type="button"
          onClick={onBackToEdit}
          className={`ml-auto rounded-full border ${borderClass} px-3 py-1.5 text-xs font-medium transition-colors ${btnSecondaryClass}`}
        >
          {isMobile ? "Back to Edit" : "Back to Edit (Esc)"}
        </button>
      </div>
    </div>
  );
};
