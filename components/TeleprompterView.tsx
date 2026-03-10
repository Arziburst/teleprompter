"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type RefObject
} from "react";
import { TeleprompterControls } from "./TeleprompterControls";

const MIN_SPEED = 0.1;
const MAX_SPEED = 5;
const SPEED_STEP = 0.1;

const MIN_FONT = 28;
const MAX_FONT = 80;
const FONT_STEP = 4;

type TeleprompterViewProps = {
  text: string;
  targetDurationMinutes: number;
  initialSpeed: number;
  initialFontSize: number;
  theme: "dark" | "light";
  onBackToEdit: () => void;
};

function useFullscreen(containerRef: RefObject<HTMLDivElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    const element = containerRef.current;
    if (!element) return;

    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  }, [containerRef]);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, []);

  return { isFullscreen, toggleFullscreen };
}

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
    Number.isFinite(initialFontSize) && initialFontSize > 0
      ? initialFontSize
      : 40
  );
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  const targetDurationSeconds = Math.max(30, targetDurationMinutes * 60);
  const effectiveTotalSeconds = targetDurationSeconds / Math.max(speedMultiplier, 0.05);
  const elapsedSeconds = (progress / 100) * effectiveTotalSeconds;
  const remainingSeconds = Math.max(0, effectiveTotalSeconds - elapsedSeconds);

  const getBasePixelsPerSecond = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return 0;
    const totalScrollable = scroller.scrollHeight - scroller.clientHeight;
    if (totalScrollable <= 0) return 0;
    return totalScrollable / targetDurationSeconds;
  }, [targetDurationSeconds]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem("teleprompter-settings");
      const parsed = raw ? JSON.parse(raw) : {};
      const next = {
        ...parsed,
        speed: speedMultiplier,
        fontSize
      };
      window.localStorage.setItem(
        "teleprompter-settings",
        JSON.stringify(next)
      );
    } catch {
      // ignore storage errors
    }
  }, [speedMultiplier, fontSize]);

  const updateProgress = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) {
      setProgress(0);
      return;
    }

    const totalScrollable = scroller.scrollHeight - scroller.clientHeight;
    if (totalScrollable <= 0) {
      setProgress(0);
      return;
    }

    const ratio = scroller.scrollTop / totalScrollable;
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
      const maxScrollTop =
        scroller.scrollHeight - scroller.clientHeight;

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
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [step]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleFaster = useCallback(() => {
    setSpeedMultiplier((prev) =>
      Math.min(MAX_SPEED, parseFloat((prev + SPEED_STEP).toFixed(2)))
    );
  }, []);

  const handleSlower = useCallback(() => {
    setSpeedMultiplier((prev) =>
      Math.max(MIN_SPEED, parseFloat((prev - SPEED_STEP).toFixed(2)))
    );
  }, []);

  const handleIncreaseFont = useCallback(() => {
    setFontSize((prev) => Math.min(MAX_FONT, prev + FONT_STEP));
  }, []);

  const handleDecreaseFont = useCallback(() => {
    setFontSize((prev) => Math.max(MIN_FONT, prev - FONT_STEP));
  }, []);

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

      const totalScrollable = scroller.scrollHeight - scroller.clientHeight;
      if (totalScrollable <= 0) return;

      const clampedPercent = Math.min(100, Math.max(0, percent));
      const targetScrollTop = (totalScrollable * clampedPercent) / 100;

      scroller.scrollTop = targetScrollTop;
      carryPixelsRef.current = 0;
      updateProgress();
    },
    [updateProgress]
  );

  const handleNudgeBySeconds = useCallback(
    (deltaSeconds: number) => {
      const total = effectiveTotalSeconds;
      if (total <= 0) return;
      const current = (progress / 100) * total;
      const next = Math.min(total, Math.max(0, current + deltaSeconds));
      const percent = (next / total) * 100;
      handleSeekByPercent(percent);
    },
    [effectiveTotalSeconds, progress, handleSeekByPercent]
  );

  const handleResetAndStart = useCallback(() => {
    handleResetPosition();
    setIsPlaying(true);
  }, [handleResetPosition]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => {
      window.removeEventListener("resize", updateIsMobile);
    };
  }, []);

  const handleSeekStart = useCallback(() => {
    if (wasPlayingBeforeSeekRef.current) {
      return;
    }
    wasPlayingBeforeSeekRef.current = isPlaying;
    setIsPlaying(false);
  }, [isPlaying]);

  const handleSeekEnd = useCallback(() => {
    if (wasPlayingBeforeSeekRef.current) {
      setIsPlaying(true);
    }
    wasPlayingBeforeSeekRef.current = false;
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        handleTogglePlay();
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        handleFaster();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        handleSlower();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleNudgeBySeconds(-1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNudgeBySeconds(1);
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        handleIncreaseFont();
        return;
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        handleDecreaseFont();
        return;
      }

      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        handleResetAndStart();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        } else {
          onBackToEdit();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [
    handleTogglePlay,
    handleFaster,
    handleSlower,
    handleIncreaseFont,
    handleDecreaseFont,
    handleResetAndStart,
    handleNudgeBySeconds,
    onBackToEdit
  ]);

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
        <div
          ref={scrollRef}
          className={`teleprompter-scrollbar relative mx-auto flex h-screen max-w-5xl flex-col overflow-y-scroll px-6 pt-24 pb-40 ${
            isDark ? "bg-black" : "bg-white"
          }`}
          onClick={() => {
            setIsPlaying((prev) => !prev);
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
            onToggleFullscreen={toggleFullscreen}
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

