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
- Added client-side bootstrap loader: while settings are read from localStorage, show a full-screen white loading screen with centered spinner and neutral text, independent of theme.
- Updated default placeholder script to a ~1 minute English description of the app features; added \"Clear text\" button in the editor header that wipes the textarea with outlined styling similar to Reset, and made \"Reset to initial\" restore the original placeholder text and base settings; removed the local-storage helper text under the controls row.

