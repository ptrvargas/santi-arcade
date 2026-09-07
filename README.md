# Santi Arcade V0.4 — Learning Rewards & Audio Update

**Santi Quest — City Quest** is a mobile-first educational arcade platformer for children ages 7–9. V0.4 builds directly on the published V0.3 game and keeps its ten levels, visual world, controls, progression, checkpoints, fullscreen support, installation flow, and offline PWA behavior.

## What is new in V0.4

- Every level attempt starts with **5 hearts**.
- Every math gate generates a **new level-appropriate question** and avoids an immediate repeat.
- Math challenges stabilize the hero before opening and safely resume play after the answer.
- Every independently correct answer awards **+1 Power Energy (⚡)**.
- Spend **3 ⚡** to activate a shield that absorbs one hit.
- At zero hearts, spend **5 ⚡** to recover one heart and continue from the checkpoint (maximum two rescues per attempt).
- Three correct answers in a row activate a short **Turbo Boost**.
- Incorrect answers use three friendly learning steps: a light hint, a clearer visual hint, then the solved answer. They do not remove hearts.
- Difficulty adjusts lightly within each level while preserving the approved curriculum.
- Original lightweight menu, City Quest, and victory music.
- Expanded arcade sound effects for movement, challenges, rewards, powers, damage, retries, checkpoints, and completion.
- **Settings** for independent Music and Sound Effects switches plus Master Volume.

## Math progression

- Levels 1–2: addition
- Levels 3–4: subtraction
- Levels 5–6: mixed addition and subtraction
- Level 7: multiplication as equal groups
- Level 8: ×2
- Level 9: ×5
- Level 10: mixed ×2, ×5, and ×10

## Controls

- Phone/tablet: LEFT, RIGHT, and JUMP touch controls. Gameplay is optimized for landscape.
- Computer: Arrow keys or A/D to move; Up, W, or Space to jump; Escape to pause.
- During a run, the shield button spends 3 ⚡ when enough energy is available.

## Audio and autoplay

Browsers require a user interaction before audio begins. Music starts safely after PLAY or another valid interaction. Music and sound effects can be enabled independently, and all preferences persist on the device.

## Local progress

The player, avatar, unlocked levels, coins, stars, best scores, Power Energy, recent math questions, and audio settings are stored only in the current browser using `localStorage`. No account, tracking, chat, advertising, or personal-data upload is used.

## Project structure

```text
santi-arcade/
├── index.html
├── css/styles.css
├── js/app.js
├── assets/               # Existing optimized City Quest artwork
├── sounds/               # Original compressed V0.4 music
├── icons/                # PWA icons
├── manifest.json
├── service-worker.js
├── README.md
└── CHANGES-V0.4.md
```

## Run locally

Serve the folder through a static server so the service worker and offline mode can work:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages and PWA

Upload the complete contents of this directory to the repository root. All URLs are relative and remain compatible with:

`https://ptrvargas.github.io/santi-arcade/`

HTTPS is required for PWA installation outside localhost. The manifest uses standalone display, and the V0.4 service worker refreshes the app cache while preserving offline play.

## Mobile-first notes

Menus work in portrait or landscape. On a phone, a rotation message appears before gameplay when the browser is actually in portrait. The game respects safe areas, prevents selection and long-press interference on controls, supports progressive fullscreen where available, and retains the iPhone Add to Home Screen guidance from V0.3.
