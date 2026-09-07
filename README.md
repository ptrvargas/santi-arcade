# Santi Arcade V0.2 — Visual Upgrade

Visually upgraded playable build of **Santi Quest — City Quest**, preserving the V0.1 game engine and progression while adding original optimized game art, animated hero sprites, richer scenery and upgraded game feel.

## Play locally

Serve this folder with any static web server. Opening through `http://localhost` (instead of directly as a `file://` URL) enables the service worker and offline mode.

Example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish

Upload every file and folder in this directory to the root of a GitHub Pages repository or another static host. HTTPS is required for PWA installation outside localhost.

## Controls

- Phone/tablet: LEFT, RIGHT, and JUMP touch controls; landscape is recommended during levels.
- Computer: Arrow keys or A/D to move; Up, W, or Space to jump; Escape to pause.

Progress and player settings are stored only in the current browser using `localStorage`.
