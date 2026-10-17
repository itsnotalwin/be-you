# Application folder context

Purpose: Sole installable local-first BE YOU PWA for mobile/desktop, with real mood, journal, guided journey, insight and personal-space flows.

Key files: `index.html` entry; `functional.js` authoritative routing and localStorage persistence; `ui-primitives.js` approved art roles and four-tab mobile nav; `app.css` base and `responsive.css` final 23-screen styling; `sw.js` cache. `assets/approved/` has eight approved illustrations; `screenshots/refined/` is historical.

Connections: Reference targets are in `../references/approved/mockups-2026-10-15/`; `scripts/` tests; GitHub Actions deploys exactly `app/`.

Change and verify: `cd app && npm test`, real Chromium mobile and desktop, verify images and navigation, confirm Pages Actions completion, and capture fresh screenshots after visual changes. Stored user data is unencrypted and device-local; preserve keys and export/import format.

Screen 05 (2026-10-16): `functional.js` uses one reactive mood route and `moodPortraitRoles` for a future approved face set; all five now use separately approved WebP portraits in `assets/approved/moods/`. `responsive.css` holds distinct active-card accents and feedback. Update the screenshot and validate 320/390 px mobile and desktop after this visual change.

Screen 05 image-frame update (2026-10-16): The mood art wrapper in `responsive.css` now takes its height from each approved portrait's natural aspect ratio; this eliminates internal unused margins while showing the entire face, hair, and props, with no image-file changes. At phone widths the image is deliberately portrait-shaped, not square. A genuine updated screenshot and browser/device QA are still outstanding.

Automated real-browser gate (2026-10-17): `playwright.config.mjs` and `tests/browser.spec.mjs` validate 21 direct routes plus populated journal states in Chromium (320/390/1280) and WebKit (393); mood geometry and persistence are asserted and CI uploads actual browser screenshots. Run `npm run test:browser` after `npm install` and browser installation. This does not replace physical-device or approved screenshot reviews.

Mood phone review candidate (2026-10-17): `responsive.css` adds a scoped under-700px layout refinement so the five options become visible without scrolling through the full-height artwork. The five approved WebPs and mood route logic remain unchanged. `tests/capture-mood-review.mjs` records genuine new running-app frames at 320px, 390px, and 1280px and each of the five choices for PR #3 visual review; do not mistake unmerged screenshots for live proof.

Screenshot evidence now exists on PR #3: five real 390×844 selected-state frames plus 390/320 phone and 1280 desktop captures. Keep these filenames and the visual spec synchronized after a substantive mood change. Do not mark a draft capture as a published screenshot.

Desktop candidate (2026-10-17): `functional.js` adds only `mood-v2-body`/`mood-v2-picker` layout wrappers; `responsive.css` places the **same** portrait and interactive picker side-by-side ≥1024px. New `tests/browser.spec.mjs` checks desktop visibility, plus phone card/Continue bounds. Updated desktop screenshot shows the complete selector within 1280×800; subject to PR checks and user approval.

2026-10-17 mood portrait PR #3: Reuse Good's 306:562 fixed portrait frame for every mood, with object-fit cover and a small bounded crop rather than five differing heights. Preserve original artwork and a single reactive route. Refresh real screenshots and rerun tests before publishing.
