---
name: verify
description: Build/launch/drive recipe for the SAN grades app (Vite + React, wrapped by Electron/Capacitor)
---

# SAN app verify recipe

Root is a Vite React app (`src/App.jsx`, `src/main.jsx`) also wrapped for
Electron (`electron/main.js`) and Capacitor/Android (`android/`,
`capacitor.config.ts`). The web surface is the one that matters for most
changes — a single-page grade tracker for a school ("Sistema de Notas -
Ciudadela Desepaz"), state persisted to `localStorage` under key
`ciudadela_desepaz_notas_3_4_v5_dark`.

## Build & launch

```bash
npm install                # ~486 packages, no postinstall needed for verify
npm run dev                 # vite dev server on :5173
npm run build && npm run preview -- --port 4173   # prod build, served on :4173
```

`npm run build` output must match the committed `dist/` hashes if `dist/`
is checked in (it is, as of the Capacitor/Vite migration commit) — a
mismatch means the build config or source drifted from what's shipped.

## Drive it (no browser MCP available in this sandbox)

System Chromium lives at `/snap/bin/chromium` but is snap-confined: it can
only write output files under `$HOME` (not `/tmp` or the scratchpad — snap
denies that mount). For anything beyond a single static screenshot, use
Playwright driving that same binary (Playwright's own bundled browsers
can't install here — no passwordless sudo for `--with-deps`):

```bash
mkdir -p /tmp/.../scratchpad/pw && cd $_
npm init -y && npm install playwright@1.62.1
# then a script with:
chromium.launch({ executablePath: '/snap/bin/chromium', headless: true, args: ['--no-sandbox'] })
```
Screenshots must be written under `$HOME` (e.g. `~/verify_shots/`), not
the scratchpad — same snap confinement issue.

## Flows worth driving

- Enter a grade in a cell (0–5 scale, clamped — see `src/App.jsx` ~line
  130-132: `parseFloat` + range check `0 <= x <= 5`, so junk/out-of-range
  input is silently rejected, not an error state to look for).
- Switch subject tabs, confirm the grade persists per-subject.
- Open "Resumen" (summary) and confirm group/subject/student averages
  match what was entered.
- Reload the page and confirm localStorage round-trips the state.

## Gotchas

- First cold page load sometimes logs one console 404 — a Chromium
  `/favicon.ico` auto-request, not an app resource; the app declares no
  favicon. Reproduce twice before treating a 404 as a real regression.
- Kill dev/preview servers when done: `pkill -f "vite$"` /
  `pkill -f "vite preview"` — no dedicated stop script.
