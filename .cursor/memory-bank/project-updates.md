# Project Updates

## 2026-03-13

- Replaced localStorage with Supabase for teleprompter settings (text, duration, speed, font size, theme). Single row in `public.teleprompter_settings` with `id = 'default'`.
- Added Supabase Realtime: changes on one device propagate to other open instances (postgres_changes on `teleprompter_settings`).
- New: `lib/supabase.ts` (client), `supabase/migrations/..._create_teleprompter_settings.sql` (table, RLS, Realtime publication). Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.local.example`). If env is missing, app runs with default state and no sync.
- Hook `useTeleprompterSettings`: loads from Supabase on mount, debounced upsert on state change, Realtime subscription for remote updates; exposes `persistPartial` for saving only speed/font from TeleprompterView (debounced 800ms).
- Removed all localStorage usage from hooks and TeleprompterView.

## 2026-03-10

- Added editable estimated read time in the editor screen.
- Connected teleprompter base scroll speed to target duration (1.0x matches selected time).
- Fixed low-speed stalling by accumulating fractional scroll distance between animation frames.
- Persisted estimated read time in localStorage.
- Verified with successful production build.
- Persisted initial speed and font size in teleprompter settings, with inputs on the editor screen and initialization in teleprompter view.
- Light theme: simple buttons (nudge, speed, font, Reset, Fullscreen, Back to Edit) use black text (text-slate-900), hover green (emerald-600) and light borders/bg; progress time labels and bar track theme-aware; theme toggle inactive option black in light theme with green hover.
- Editor: \"Reset to initial\" button uses theme-aware styling, in light theme black text with emerald-600 hover and light border/background.
- Added client-side bootstrap loader: while settings are read from localStorage, show a full-screen white loading screen with centered spinner and neutral text, independent of theme.
- Updated default placeholder script to a ~1 minute English description of the app features; added \"Clear text\" button in the editor header that wipes the textarea with outlined styling similar to Reset, and made \"Reset to initial\" restore the original placeholder text and base settings; removed the local-storage helper text under the controls row.
- Teleprompter fullscreen view now applies theme-aware backgrounds directly: dark theme uses black background, light theme uses white, so fullscreen in light theme no longer appears dark.
- All keyboard bindings refactored from window addEventListener to @tanstack/react-hotkeys: HotkeysProvider in layout; page.tsx uses useHotkey for Enter and Mod+Enter to start; TeleprompterView uses useHotkey for Space, arrows, +/=, -/_, r/R, f/F, Escape (play/pause, speed, nudge, font, reset, fullscreen, back).
- Global refactor: strict Next.js App Router hierarchy. app/page.tsx is the only route; it is a client component that uses useTeleprompterSettings and useHotkey, and renders LoadingScreen, EditorView, or TeleprompterView. Reusable pieces: lib/constants.ts, lib/format.ts; types/teleprompter.ts; hooks/useTeleprompterSettings.ts, hooks/useFullscreen.ts; components/ui (Spinner, ThemeToggle, LoadingScreen); components/editor (EditorHeader, ScriptEditor, EditorSettings, EditorView); components/teleprompter (FlashOverlay, TeleprompterControls, TeleprompterView). Old flat components/TeleprompterView.tsx and TeleprompterControls.tsx removed in favor of components/teleprompter/*. Imports use @/ alias. Production build verified.
