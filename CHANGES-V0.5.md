# Santi Arcade V0.5 — Change Log

## Modified files

| File | Reason |
| --- | --- |
| `index.html` | Updates the version; adds Edit Player, How to Play, Share, QR, in-game Help, contextual tutorial, and multi-accessory interfaces while preserving existing screens and controls. |
| `css/styles.css` | Adds responsive styling for the new Home actions, accessory categories, tutorials, help, sharing, QR, course labels, and compact landscape layouts without redesigning the established V0.4 visual identity. |
| `js/app.js` | Adds the ten-level course progression model, easier early gameplay, fair scaling, more checkpoints, bridge/hazard math rewards, reward quality by attempt, editable player flow, compatible simultaneous accessories, one-time tutorials, contextual help, Web Share, Copy Link fallback, local profile extensibility, and new lightweight sound cues. All V0.4 rewards and systems remain. |
| `manifest.json` | Updates the description to V0.5 while retaining relative scope/start paths, standalone display, orientation behavior, colors, and icons. |
| `service-worker.js` | Updates the cache to `santi-arcade-v0.5.0`, pre-caches the new QR asset, and retains old-cache cleanup, offline navigation, and relative GitHub Pages compatibility. |
| `README.md` | Fully documents V0.5 gameplay progression, learning rewards, customization, help, tutorials, safe sharing, QR, extensibility, privacy, PWA behavior, and deployment. |

## New files

| File | Purpose |
| --- | --- |
| `assets/santi-arcade-qr.png` | Offline QR code for `https://ptrvargas.github.io/santi-arcade/`. |
| `CHANGES-V0.5.md` | Exact V0.5 file inventory and update instructions. |

## Removed files

None.

## Exact GitHub update steps from V0.4

1. Back up or tag the published V0.4 repository.
2. Extract `santi-arcade-v0.5-changed-files.zip`.
3. Copy all extracted files into the existing repository root, preserving the included `css/`, `js/`, and `assets/` paths.
4. Replace the V0.4 versions of `index.html`, `css/styles.css`, `js/app.js`, `manifest.json`, `service-worker.js`, and `README.md`.
5. Confirm `assets/santi-arcade-qr.png` and `CHANGES-V0.5.md` are present.
6. Commit and push to the branch used by GitHub Pages.
7. Open the published app online once. Fully close and reopen an installed PWA so service worker cache `santi-arcade-v0.5.0` can activate.

`README.md` is included in `santi-arcade-v0.5-changed-files.zip`; no manual README edit is required.

Cache confirmation: **`santi-arcade-v0.5.0`**.
