# Browser tests context

Purpose: Real end-to-end browser and visual-geometry verification for the single BE YOU PWA. No second UI lives here.

Key file: `browser.spec.mjs` checks route rendering, art loading, interactive five-state mood portraits, persistence, responsive navigation and optional production smoke. Real viewport screenshots are CI artifacts, not edited or mock artwork.

Connections: `../playwright.config.mjs`, `../functional.js`, `../responsive.css`, `../assets/approved/` and `../../.github/workflows/deploy-pages.yml`.

Change and verify: From `app/`, run `npm run test:browser` with Chromium and WebKit installed. Screenshots and reports under `test-results/` and `playwright-report/` are generated and ignored; review captures before approving visual baselines. Tests use only isolated synthetic localStorage.
Phone-specific regression (2026-10-17): `browser.spec.mjs` now checks all five mood cards' bounding boxes fit the initial mobile viewport at 320px/390px/393px and portrait proportions are preserved. `capture-mood-review.mjs` creates actual browser screenshots for review using a fresh synthetic localStorage state and approved artwork only. It is a capture helper, not a second app implementation.

2026-10-17 mood portrait-fill tests assert one constant 306:562 frame, full image coverage, <6% crop and responsive visibility across all five moods. Regenerate real screenshots with the review workflow and inspect them before visual approval.
