"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC
} from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useFullscreen } from "@/hooks/useFullscreen";
import { formatFlashTime } from "@/lib/format";
import {
  TELEPROMPTER_FONT_MIN,
  TELEPROMPTER_FONT_MAX,
  FONT_STEP_TELEPROMPTER,
  SPEED_MIN,
  SPEED_MAX,
  SPEED_STEP,
  STORAGE_KEY
} from "@/lib/constants";
import type { FlashType } from "@/types/teleprompter";
import { FlashOverlay } from "./FlashOverlay";
import { TeleprompterControls } from "./TeleprompterControls";

type TeleprompterViewProps = {
  text: string;
  targetDurationMinutes: number;
  initialSpeed: number;
  initialFontSize: number;
  theme: "dark" | "light";
  onBackToEdit: () => void;
};

export const TeleprompterView: FC<TeleprompterViewProps> = ({
  text,
  targetDurationMinutes,
  initialSpeed,
  initialFontSize,
  theme,
  onBackToEdit
}) => {
  const isDark = theme === "dark";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const carryPixelsRef = useRef(0);
  const wasPlayingBeforeSeekRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(
    Number.isFinite(initialSpeed) && initialSpeed > 0 ? initialSpeed : 1
  );
  const [fontSize, setFontSize] = useState(
    Number.isFinite(initialFontSize) && initialFontSize > 0 ? initialFontSize : 40
  );
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [flashType, setFlashType] = useState<FlashType>(null);
  const [flashValue, setFlashValue] = useState<string | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  const showFlash = useCallback(
    (type: NonNullable<FlashType>, value?: string) => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      setFlashType(type);
      setFlashValue(value ?? null);
      flashTimeoutRef.current = setTimeout(() => {
        setFlashType(null);
        setFlashValue(null);
        flashTimeoutRef.current = null;
      }, 380);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  const targetDurationSeconds = Math.max(30, targetDurationMinutes * 60);
  const effectiveTotalSeconds =
    targetDurationSeconds / Math.max(speedMultiplier, 0.05);
  const elapsedSeconds = (progress / 100) * effectiveTotalSeconds;
  const remainingSeconds = Math.max(0, effectiveTotalSeconds - elapsedSeconds);

  const getBasePixelsPerSecond = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return 0;
    const total = scroller.scrollHeight - scroller.clientHeight;
    if (total <= 0) return 0;
    return total / targetDurationSeconds;
  }, [targetDurationSeconds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...parsed, speed: speedMultiplier, fontSize })
      );
    } catch {
      // ignore
    }
  }, [speedMultiplier, fontSize]);

  const updateProgress = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) {
      setProgress(0);
      return;
    }
    const total = scroller.scrollHeight - scroller.clientHeight;
    if (total <= 0) {
      setProgress(0);
      return;
    }
    const ratio = scroller.scrollTop / total;
    setProgress(Math.min(100, Math.max(0, ratio * 100)));
  }, []);

  const step = useCallback(
    (timestamp: number) => {
      if (!isPlaying) {
        lastTimestampRef.current = timestamp;
        frameRef.current = requestAnimationFrame(step);
        return;
      }
      const scroller = scrollRef.current;
      if (!scroller) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }
      if (lastTimestampRef.current == null) {
        lastTimestampRef.current = timestamp;
        frameRef.current = requestAnimationFrame(step);
        return;
      }
      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;
      const deltaSeconds = deltaMs / 1000;
      const distance =
        getBasePixelsPerSecond() * speedMultiplier * deltaSeconds;
      carryPixelsRef.current += distance;
      const deltaPixels = Math.floor(carryPixelsRef.current);
      if (deltaPixels <= 0) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }
      carryPixelsRef.current -= deltaPixels;
      const nextScrollTop = scroller.scrollTop + deltaPixels;
      const maxScrollTop = scroller.scrollHeight - scroller.clientHeight;
      if (nextScrollTop >= maxScrollTop) {
        scroller.scrollTop = maxScrollTop;
        setIsPlaying(false);
        updateProgress();
        frameRef.current = requestAnimationFrame(step);
        return;
      }
      scroller.scrollTop = nextScrollTop;
      updateProgress();
      frameRef.current = requestAnimationFrame(step);
    },
    [getBasePixelsPerSecond, isPlaying, speedMultiplier, updateProgress]
  );

  useEffect(() => {
    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, [step]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      showFlash(next ? "play" : "pause");
      return next;
    });
  }, [showFlash]);

  const handleFaster = useCallback(() => {
    const next = Math.min(
      SPEED_MAX,
      parseFloat((speedMultiplier + SPEED_STEP).toFixed(2))
    );
    setSpeedMultiplier(next);
    showFlash("faster", `${next.toFixed(1)}x`);
  }, [showFlash, speedMultiplier]);

  const handleSlower = useCallback(() => {
    const next = Math.max(
      SPEED_MIN,
      parseFloat((speedMultiplier - SPEED_STEP).toFixed(2))
    );
    setSpeedMultiplier(next);
    showFlash("slower", `${next.toFixed(1)}x`);
  }, [showFlash, speedMultiplier]);

  const handleIncreaseFont = useCallback(() => {
    const next = Math.min(TELEPROMPTER_FONT_MAX, fontSize + FONT_STEP_TELEPROMPTER);
    setFontSize(next);
    showFlash("font-up", String(next));
  }, [showFlash, fontSize]);

  const handleDecreaseFont = useCallback(() => {
    const next = Math.max(TELEPROMPTER_FONT_MIN, fontSize - FONT_STEP_TELEPROMPTER);
    setFontSize(next);
    showFlash("font-down", String(next));
  }, [showFlash, fontSize]);

  const handleResetPosition = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scroller.scrollTop = 0;
    carryPixelsRef.current = 0;
    updateProgress();
  }, [updateProgress]);

  const handleSeekByPercent = useCallback(
    (percent: number) => {
      const scroller = scrollRef.current;
      if (!scroller) return;
      const total = scroller.scrollHeight - scroller.clientHeight;
      if (total <= 0) return;
      const clamped = Math.min(100, Math.max(0, percent));
      scroller.scrollTop = (total * clamped) / 100;
      carryPixelsRef.current = 0;
      updateProgress();
    },
    [updateProgress]
  );

  const handleNudgeBySeconds = useCallback(
    (deltaSeconds: number) => {
      if (effectiveTotalSeconds <= 0) return;
      const current = (progress / 100) * effectiveTotalSeconds;
      const next = Math.min(
        effectiveTotalSeconds,
        Math.max(0, current + deltaSeconds)
      );
      const percent = (next / effectiveTotalSeconds) * 100;
      handleSeekByPercent(percent);
      showFlash(deltaSeconds > 0 ? "forward" : "back", formatFlashTime(next));
    },
    [effectiveTotalSeconds, progress, handleSeekByPercent, showFlash]
  );

  const handleResetAndStart = useCallback(() => {
    handleResetPosition();
    setIsPlaying(true);
    showFlash("reset");
  }, [handleResetPosition, showFlash]);

  const handleFullscreen = useCallback(async () => {
    await toggleFullscreen();
    showFlash(document.fullscreenElement ? "fullscreen" : "fullscreen-exit");
  }, [toggleFullscreen, showFlash]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateIsMobile = () => setIsMobile(window.innerWidth < 1024);
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  const handleSeekStart = useCallback(() => {
    if (wasPlayingBeforeSeekRef.current) return;
    wasPlayingBeforeSeekRef.current = isPlaying;
    setIsPlaying(false);
  }, [isPlaying]);

  const handleSeekEnd = useCallback(() => {
    if (wasPlayingBeforeSeekRef.current) setIsPlaying(true);
    wasPlayingBeforeSeekRef.current = false;
  }, []);

  useHotkey({ key: "Space" }, (e) => {
    e.preventDefault();
    handleTogglePlay();
  });
  useHotkey("ArrowUp", (e) => {
    e.preventDefault();
    handleFaster();
  });
  useHotkey("ArrowDown", (e) => {
    e.preventDefault();
    handleSlower();
  });
  useHotkey("ArrowLeft", (e) => {
    e.preventDefault();
    handleNudgeBySeconds(-1);
  });
  useHotkey("ArrowRight", (e) => {
    e.preventDefault();
    handleNudgeBySeconds(1);
  });
  useHotkey({ key: "+" }, (e) => {
    e.preventDefault();
    handleIncreaseFont();
  });
  useHotkey("=", (e) => {
    e.preventDefault();
    handleIncreaseFont();
  });
  useHotkey("-", (e) => {
    e.preventDefault();
    handleDecreaseFont();
  });
  useHotkey({ key: "_" }, (e) => {
    e.preventDefault();
    handleDecreaseFont();
  });
  useHotkey({ key: "r" }, (e) => {
    e.preventDefault();
    handleResetAndStart();
  });
  useHotkey("R", (e) => {
    e.preventDefault();
    handleResetAndStart();
  });
  useHotkey({ key: "f" }, (e) => {
    e.preventDefault();
    void handleFullscreen();
  });
  useHotkey("F", (e) => {
    e.preventDefault();
    void handleFullscreen();
  });
  useHotkey("Escape", (e) => {
    e.preventDefault();
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => showFlash("fullscreen-exit"));
    } else {
      onBackToEdit();
    }
  });

  useEffect(() => {
    handleResetPosition();
  }, [text, handleResetPosition]);

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return (
    <div
      ref={containerRef}
      className={`flex min-h-screen flex-col ${
        isDark ? "bg-black text-slate-100" : "bg-white text-slate-900"
      }`}
    >
      <main className="relative flex-1">
        {flashType && (
          <FlashOverlay
            type={flashType}
            value={flashValue}
            isDark={isDark}
          />
        )}
        <div
          ref={scrollRef}
          className={`teleprompter-scrollbar relative mx-auto flex h-screen max-w-5xl flex-col overflow-y-scroll px-6 pt-24 pb-40 ${
            isDark ? "bg-black" : "bg-white"
          }`}
          onClick={() => {
            setIsPlaying((prev) => {
              const next = !prev;
              showFlash(next ? "play" : "pause");
              return next;
            });
          }}
        >
          <div
            className="mx-auto w-full max-w-3xl leading-relaxed"
            style={{
              fontSize: `${fontSize}px`,
              transformOrigin: "center"
            }}
          >
            {lines.length === 0 ? (
              <p className="text-center text-slate-500">
                No text. Press Back to Edit to add a script.
              </p>
            ) : (
              <div className="space-y-6 text-center">
                {lines.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center px-4 pb-4">
          <TeleprompterControls
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onFaster={handleFaster}
            onSlower={handleSlower}
            onIncreaseFont={handleIncreaseFont}
            onDecreaseFont={handleDecreaseFont}
            onResetPosition={handleResetAndStart}
            onToggleFullscreen={handleFullscreen}
            onBackToEdit={onBackToEdit}
            onSeekByPercent={handleSeekByPercent}
            onSeekStart={handleSeekStart}
            onSeekEnd={handleSeekEnd}
            onNudgeBySeconds={handleNudgeBySeconds}
            elapsedSeconds={elapsedSeconds}
            remainingSeconds={remainingSeconds}
            speed={speedMultiplier}
            fontSize={fontSize}
            progressPercent={progress}
            isFullscreen={isFullscreen}
            isMobile={isMobile}
            theme={theme}
          />
        </div>
      </main>
    </div>
  );
};
