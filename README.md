# Santi Arcade V0.5 — Gameplay Progression, Player Customization & Sharing Update

**Santi Quest — City Quest** is a mobile-first educational arcade platformer for children ages 7–9. V0.5 builds directly on the published V0.4 and preserves its game engine, ten levels, math curriculum, rewards, audio, controls, local progress, fullscreen support, and installable offline PWA.

## Core principles

- **The better you learn, the better you play.** Math mastery creates real gameplay advantages.
- **Easy to start, challenging to master.** Early levels teach movement; later levels test it fairly.
- **Easy to share, safe to play.** Sharing opens the device's standard share sheet or copies a public URL. The game never accesses contacts or sends messages itself.
- **The game grows with the child.** V0.5 introduces a small education profile boundary for future grades, languages, subjects, skills, and worlds.

## What is new in V0.5

- Redesigned platforming progression across all ten levels.
- Level 1 is now a forgiving tutorial with wide platforms, a single tiny gap, isolated hazards, and three checkpoints.
- Gap size and frequency, platform width, obstacle spacing, moving hazards, and checkpoint spacing progress gradually through Level 10.
- Every solved math gate creates a glowing bridge, disables a hazard, or activates a safer checkpoint.
- First-attempt answers earn full Power Energy and streak credit. A correct answer after one hint still earns energy but does not advance the streak. Assisted solutions remain non-punitive and allow progress without an energy reward.
- The existing five hearts, Power Energy, Shield, two-rescue limit, Turbo, adaptive math, and three-step mistake support remain active.
- The player nickname and avatar can be edited at any time without resetting progress.
- Compatible accessory categories allow combinations such as **glasses + headphones**, with optional cap and wrist band.
- A visual **How to Play** guide explains controls, powers, hearts, checkpoints, hazards, coins, stars, and goals.
- One-time contextual tutorials introduce movement, jumping, math power, Power Energy, and checkpoints. Seen tutorials are remembered locally.
- A contextual **?** button pauses safely and gives a short tip without immediately solving math.
- **Share Santi Arcade** uses the Web Share API where supported and provides a Copy Link fallback.
- A bundled offline QR code opens `https://ptrvargas.github.io/santi-arcade/` on another device.
- New light sound cues accompany tutorials, player saving, sharing, and path unlocking while preserving all V0.4 music and audio settings.

## Ten-level gameplay progression

| Levels | Course focus |
| --- | --- |
| 1 | Very Easy — learn walking and jumping with generous recovery. |
| 2 | Easy — small gaps and wide platforms. |
| 3 | Easy+ — isolated simple hazards. |
| 4 | Moderate — combine movement and jumping. |
| 5 | Moderate — medium gaps and short jump sequences. |
| 6 | Moderate+ — more precision without unfair traps. |
| 7 | Challenging — multi-jump sequences and momentum. |
| 8 | Challenging+ — narrower platforms and smaller margins. |
| 9 | Hard — consecutive fair obstacles and useful powers. |
| 10 | Hard but Fair — a final test of learned skills. |

## Grade 3 math progression

- Levels 1–2: addition
- Levels 3–4: subtraction
- Levels 5–6: mixed addition and subtraction
- Level 7: multiplication as equal groups
- Level 8: ×2
- Level 9: ×5
- Level 10: mixed ×2, ×5, and ×10

Dynamic questions avoid immediate repeats and adapt lightly inside each level without moving outside its approved skill.

## Player customization

Choose **Edit Player** from Home to change the nickname, skin tone, hair, shirt, pants, glasses, headphones, cap, or wrist band. Changes save in `localStorage` and do not reset unlocked levels, coins, stars, best scores, Power Energy, tutorials, or audio preferences.

## Sharing and privacy

The shared destination is:

`https://ptrvargas.github.io/santi-arcade/`

Each child receives the same public game and creates an independent local player. V0.5 has no accounts, chat, friends, multiplayer, online leaderboard, public profile, contact access, location, photos, advertising, or analytics.

## Controls

- Phone/tablet: LEFT, RIGHT, and JUMP. Landscape is recommended during gameplay.
- Computer: Arrow keys or A/D to move; Up, W, or Space to jump; Escape to pause.
- Tap 🛡️ to spend 3 ⚡ on a one-hit Shield.
- Tap ? during a level for contextual help.

## Audio

V0.5 preserves the original compressed menu, City Quest, and victory music from V0.4. Settings retain independent Music and Sound Effects switches plus Master Volume. Playback starts only after a valid user interaction to respect mobile autoplay policies.

## Local architecture and future growth

The current education profile defaults to Grade 3, English, and Math. Curriculum data and City Quest course difficulty are separated so future versions can add Kindergarten–Grade 5, Spanish, other subjects, mastery tracking, and non-platformer games without forcing every world into the City Quest engine.

Player data, unlocked levels, coins, stars, best scores, Power Energy, recent math questions, tutorial history, education profile, and settings stay in the current browser through `localStorage`.

## Project structure

```text
santi-arcade/
├── index.html
├── css/styles.css
├── js/app.js
├── assets/
│   ├── city-panorama.webp
│   ├── hero-0.webp … hero-7.webp
│   └── santi-arcade-qr.png
├── sounds/
├── icons/
├── manifest.json
├── service-worker.js
├── README.md
└── CHANGES-V0.5.md
```

## Run locally

Serve the folder through a static server so the service worker and offline mode can work:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages and PWA

Upload the complete directory contents to the repository root. All runtime paths remain relative and compatible with:

`https://ptrvargas.github.io/santi-arcade/`

The manifest retains standalone display and mobile orientation support. The service worker uses cache `santi-arcade-v0.5.0`, pre-caches the QR and all runtime assets, removes previous caches at activation, and preserves offline play. HTTPS is required for PWA installation outside localhost.
