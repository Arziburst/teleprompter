# Project Updates

## 2026-03-10

- Added editable estimated read time in the editor screen.
- Connected teleprompter base scroll speed to target duration (1.0x matches selected time).
- Fixed low-speed stalling by accumulating fractional scroll distance between animation frames.
- Persisted estimated read time in localStorage.
- Verified with successful production build.
- Persisted initial speed and font size in teleprompter settings, with inputs on the editor screen and initialization in teleprompter view.
- Light theme: simple buttons (nudge, speed, font, Reset, Fullscreen, Back to Edit) use black text (text-slate-900), hover green (emerald-600) and light borders/bg; progress time labels and bar track theme-aware; theme toggle inactive option black in light theme with green hover.
- Editor: \"Reset to initial\" button uses theme-aware styling, in light theme black text with emerald-600 hover and light border/background.

