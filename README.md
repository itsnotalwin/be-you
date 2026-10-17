# BE YOU

**A beautifully illustrated, local-first wellbeing journal.** Track moods, write privately, and explore guided reflection journeys in a minimalist black-and-ivory manga interface.

> **One application. One approved reference library.** The current runnable app is in [`app/`](app/). Approved image boards and original visual inspiration are in [`references/`](references/). There are no parallel app implementations, experimental art folders, or separate design-preview directories.

## APPROVED DESIGN BASELINE — 23 screens

The complete **23-screen BE YOU mockup collection** was approved for implementation on 2026-10-16. It is the authoritative UI reference for the existing PWA: original black-and-ivory manga illustrations, oversized art-led surfaces, spacious serif typography, quiet rounded controls and four bottom mobile tabs. **These are visual concepts**; the real working screens are implemented in [`app/`](app/).

| 01 · Welcome, Today & Mood | 02 · Journal & Growth | 03 · Tools & You |
|:--:|:--:|:--:|
| [![Approved board 01](references/approved/mockups-2026-10-15/BOARD_01.jpg)](references/approved/mockups-2026-10-15/BOARD_01.jpg) | [![Approved board 02](references/approved/mockups-2026-10-15/BOARD_02.jpg)](references/approved/mockups-2026-10-15/BOARD_02.jpg) | [![Approved board 03](references/approved/mockups-2026-10-15/BOARD_03.jpg)](references/approved/mockups-2026-10-15/BOARD_03.jpg) |

**[Browse all 23 individual approved screens](references/approved/mockups-2026-10-15/README.md)** · [Read visual specification](references/approved/mockups-2026-10-15/DESIGN.md) · [View actual running UI capture](app/SCREENSHOT.png)

**Mood selector and approved portraits (2026-10-16):** Screen 05 stays **one interactive screen**. Tapping Good, Calm, Okay, Anxious or Low immediately updates its selected card, gentle accent, supporting copy, and matching approved illustrated portrait. The five portraits were individually extracted from the user-approved mood board, preserving the full face/hair without using cropped board UI. See [mood decision and source provenance](app/docs/MOOD_SELECTOR_2026-10-16.md).

The concepts guide a **single real application**. Images are not embedded as fake UI; check-ins, entries, choices and navigation remain interactive and private to the device. The original eight approved illustrations remain throughout the other screens; the mood selector adds only the five explicitly approved portraits in `app/assets/approved/moods/`.

## Live application

**[Open BE YOU](https://itsnotalwin.github.io/Be-you/)** · [App source](app/) · [Latest implementation note](app/DESIGN.md)

The app is installed from one folder, `app/`, and deployed by GitHub Actions. Browser data stays locally, unencrypted and not automatically synchronized. Export backups from Settings.

## Real local UI evidence

| Today (390×844) | Journal (390×844) | Grow (390×844) |
|:--:|:--:|:--:|
| ![Today](app/SCREENSHOT.png) | ![Journal](app/SCREENSHOT-MOBILE-JOURNAL.png) | ![Grow](app/SCREENSHOT-MOBILE-GROW.png) |

The images above are captures of the running app in a local Chromium browser, not static design mockups. Older `app/screenshots/refined/` images remain historical. Production pages and physical-device validation are independent quality gates.

## Features and safety

Onboarding, daily mood selection and optional notes, private journal with read/edit/search/delete, four reflection journeys with progress, insights, affirmations, guided breathing, PWA installation/offline, appearance and accessibility settings, export/import. The data is stored **unencrypted in browser localStorage**, without account sync; important writing should be backed up, and shared devices avoided. This is not medical care.

## Development and deployment

Requires Node.js 18+. `cd app && npm start` opens `http://localhost:4173`; `cd app && npm test` checks source integrity and flows. GitHub Actions runs source and smoke tests plus Playwright real-browser checks (Chromium at 320/390/1280px and WebKit at 393px) before deploying the clean `app/` folder to [GitHub Pages](https://itsnotalwin.github.io/Be-you/). Run `cd app && npm install && npx playwright install chromium webkit && npm run test:browser` to execute browser checks locally. See [browser QA protocol](app/docs/BROWSER_TESTING.md) and [deployment workflow](.github/workflows/deploy-pages.yml).

## Repository structure

- `app/`: only runnable PWA, the original eight approved illustrations plus five approved mood portraits, source scripts and real (older) UI screenshots.
- `references/approved/mockups-2026-10-15/`: approved 23-screen design references and overview boards, **not** a second app.
- `references/`: older approved artwork boards and original inspiration.

**Remaining production gates:** physical iOS/Android installation and layout checks, deployed Pages inspection, accessibility review, and security/privacy audit.

**Mood chooser review (2026-10-17):** [Review proposed compact phone layout and genuine browser screenshots](https://github.com/itsnotalwin/Be-you/pull/3). The five approved mood portraits have not changed. This review branch shows the choice controls without scrolling past a full-height portrait; the live app is unchanged until the reviewed PR is merged and deployed. The historical `SCREENSHOT-MOBILE-MOOD.png` on `main` will be replaced with this genuine updated capture only after release approval.
