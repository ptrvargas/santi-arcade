# Santi Arcade V0.4 — Change Log

## Modified files

| File | Reason |
| --- | --- |
| `index.html` | Updates the version title; adds Power Energy, stars, and five-heart HUD values; adds the shield control, learning-reward feedback, energy rescue dialog, Settings access, and audio controls. |
| `css/styles.css` | Adds compact responsive styling and animations for Power Energy, shield, rescue, learning feedback, Settings, and small landscape displays. Existing V0.2/V0.3 visual styling remains intact. |
| `js/app.js` | Adds five-heart attempts, dynamic curriculum-safe questions, immediate-repeat prevention, safe math positioning, gentle three-step mistake support, light adaptive difficulty, persistent Power Energy, shield/rescue/Turbo rewards, expanded audio control, Settings persistence, and updated HUD behavior. |
| `manifest.json` | Updates the app description to V0.4 while preserving relative GitHub Pages paths, standalone display, scope, orientation behavior, and icons. |
| `service-worker.js` | Changes the cache identifier to `santi-arcade-v0.4.0`, pre-caches the new audio and README, removes older caches during activation, and preserves offline navigation. |
| `README.md` | Fully documents V0.4 features, math progression, controls, audio, persistence, PWA behavior, project structure, and GitHub Pages compatibility. |

## New files

| File | Purpose |
| --- | --- |
| `sounds/menu-theme.mp3` | Original lightweight looping music for the start, home, and map screens. |
| `sounds/city-quest-theme.mp3` | Original lightweight looping gameplay music for City Quest. |
| `sounds/victory-theme.mp3` | Original short level-complete melody. |
| `CHANGES-V0.4.md` | This exact V0.4 update record and deployment guide. |

## Removed files

None.

## Update GitHub from V0.3

1. Back up the currently published V0.3 repository or create a Git tag.
2. Extract `santi-arcade-v0.4-changed-files.zip`.
3. Copy its contents into the root of the existing `santi-arcade` repository, preserving the included folder structure.
4. Allow the modified files to replace their V0.3 counterparts.
5. Confirm the three new MP3 files exist under `sounds/`.
6. Commit and push the changes to the branch used by GitHub Pages.
7. Open the published app online once so the V0.4 service worker can activate. If an existing installed PWA remains open, fully close and reopen it to receive the new cache.

`README.md` is included in `santi-arcade-v0.4-changed-files.zip`; no manual README edit is required.
