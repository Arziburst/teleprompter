import { type FC, useEffect, useRef, useState } from "react";

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
  isMobile
}) => {
  const formatTime = (seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

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
    if (commit) {
      onSeekByPercent(percent);
    }
  };

  useEffect(() => {
    if (!isSeeking || !barRef.current) {
      return;
    }

    const target = barRef.current;

    const handleMove = (event: MouseEvent) => {
      handleSeekFromClientX(event.clientX, target, true);
    };

    const handleUp = (event: MouseEvent) => {
      handleSeekFromClientX(event.clientX, target, true);
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
    if (!isSeeking || !barRef.current) {
      return;
    }

    const target = barRef.current;

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
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

  return (
    <div className="pointer-events-auto w-full max-w-5xl rounded-t-xl bg-black/70 px-2 py-3 text-sm text-slate-50 shadow-2xl backdrop-blur">
      <div className="mb-3 flex h-3 w-full items-center gap-2">
        <div className="text-[11px] text-slate-300 text-right">
          <span className="font-semibold">{displayLeftLabel}</span>
        </div>
        <div className="relative flex h-3 flex-1 items-center">
          <div
            ref={barRef}
            className="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-slate-800"
          onMouseDown={(event) => {
            setIsSeeking(true);
            onSeekStart();
            handleSeekFromClientX(
              event.clientX,
              event.currentTarget,
              true
            );
          }}
          onMouseMove={(event) => {
            if (!isSeeking) {
              handleSeekFromClientX(
                event.clientX,
                event.currentTarget,
                false
              );
              return;
            }
            handleSeekFromClientX(
              event.clientX,
              event.currentTarget,
              true
            );
          }}
          onMouseUp={(event) => {
            if (isSeeking) {
              handleSeekFromClientX(
                event.clientX,
                event.currentTarget,
                true
              );
            }
            setIsSeeking(false);
            onSeekEnd();
            setHoverPercent(null);
          }}
          onMouseLeave={() => {
            if (!isSeeking) {
              setHoverPercent(null);
            }
          }}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            setIsSeeking(true);
            onSeekStart();
            handleSeekFromClientX(
              touch.clientX,
              event.currentTarget,
              true
            );
          }}
          onTouchMove={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            handleSeekFromClientX(
              touch.clientX,
              event.currentTarget,
              true
            );
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
              className="pointer-events-none absolute -top-4 text-[10px] text-slate-100"
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
        <div className="text-[11px] text-slate-300">
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
        <div className="flex items-center overflow-hidden rounded-full border border-slate-600">
          <button
            type="button"
            onClick={() => onNudgeBySeconds(-nudgeSeconds)}
            className="border-r border-slate-600 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-800"
          >
            ← 1s
          </button>
          <button
            type="button"
            onClick={() => onNudgeBySeconds(nudgeSeconds)}
            className="px-2.5 py-1.5 text-xs font-medium hover:bg-slate-800"
          >
            → 1s
          </button>
        </div>
        <div className="flex items-center overflow-hidden rounded-full border border-slate-600">
          <button
            type="button"
            onClick={onSlower}
            className="border-r border-slate-600 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-800"
          >
            {isMobile ? "Slower" : "Slower (↓)"}
          </button>
          <span className="min-w-[2.75rem] px-2 text-center text-[11px] font-semibold text-slate-200">
            {speed.toFixed(1)}x
          </span>
          <button
            type="button"
            onClick={onFaster}
            className="border-l border-slate-600 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-800"
          >
            {isMobile ? "Faster" : "Faster (↑)"}
          </button>
        </div>
        <div className="flex items-center overflow-hidden rounded-full border border-slate-600">
          <button
            type="button"
            onClick={onDecreaseFont}
            className="border-r border-slate-600 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-800"
          >
            {isMobile ? "A-" : "A- (-)"}
          </button>
          <span className="min-w-[2rem] px-2 text-center text-[11px] font-semibold text-slate-200">
            {Math.round(fontSize)}
          </span>
          <button
            type="button"
            onClick={onIncreaseFont}
            className="border-l border-slate-600 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-800"
          >
            {isMobile ? "A+" : "A+ (+)"}
          </button>
        </div>
        <button
          type="button"
          onClick={onResetPosition}
          className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium hover:bg-slate-800"
        >
          {isMobile ? "Reset" : "Reset (R)"}
        </button>
        {!isMobile && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium hover:bg-slate-800"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        )}
        <button
          type="button"
          onClick={onBackToEdit}
          className="ml-auto rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium hover:bg-slate-800"
        >
          {isMobile ? "Back to Edit" : "Back to Edit (Esc)"}
        </button>
      </div>
    </div>
  );
};

