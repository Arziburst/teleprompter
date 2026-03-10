export type Theme = "dark" | "light";

export type TeleprompterStoredSettings = {
  text?: string;
  durationMinutes?: number;
  speed?: number;
  fontSize?: number;
  theme?: Theme;
};

export type FlashType =
  | "pause"
  | "play"
  | "faster"
  | "slower"
  | "font-up"
  | "font-down"
  | "forward"
  | "back"
  | "reset"
  | "fullscreen"
  | "fullscreen-exit"
  | null;
