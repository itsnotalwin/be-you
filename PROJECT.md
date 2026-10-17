# BE YOU — Project

**Source:** `itsnotalwin/Be-you` (`main`) · **App:** `app/` · **Live:** https://itsnotalwin.github.io/Be-you/

**Current user-approved design baseline (2026-10-16):** All 23 phone screen mockups at [`references/approved/mockups-2026-10-15/README.md`](references/approved/mockups-2026-10-15/README.md), based exclusively on eight original approved manga art assets. Earlier narrower screen approvals remain in git history, superseded as a whole by this explicitly approved collection.

**One app, no forks:** Local-first, installable PWA. Routes and persistence in `app/functional.js`, art registry/nav in `app/ui-primitives.js`, visual styling in `app/app.css` + `app/responsive.css`. Four mobile tabs: Today, Journal, Grow, You. Desktop has its existing sidebar. `README.md` shows the design references and separately labels real local browser captures.

**Flows:** Onboarding; Today; mood selection, details and saved confirmation; journal empty/populated, new/view/edit/delete/search; four guided journeys; dynamic insights; affirmations and breathing; You and settings; offline/install. Records stored in unencrypted localStorage; no sync/account. Export/import remains functional.

**Build standards:** `AGENTS.md`, nearest `CONTEXT.md` and `DESIGN.md` accompany maintained visual folders. `app/SCREENSHOT.png` and mobile/desktop variants are genuine test-browser evidence, **not** mockup images. Update after visual changes.

**Run:** `cd app && npm start` · **Test:** `cd app && npm test` · **Publish:** GitHub Actions; check run status before declaring deployment done. Native device, accessibility and privacy/security review still required.

**Mood screen decision (2026-10-16):** The newly approved five-card control is implemented as state changes within one `mood` route. The five portraits from the approved 2026-10-16 mood board now ship from `app/assets/approved/moods/` and update in place when the user taps a mood. Other screens retain the original eight approved illustrations. See `app/docs/MOOD_SELECTOR_2026-10-16.md`. Real updated UI screenshots remain outstanding.

**Mood art frame adjustment (2026-10-16):** The reactive five-portrait mood selector now uses a natural-aspect portrait frame in `app/responsive.css` instead of a forced square/wide art box. Each already-approved WebP fills its own frame edge-to-edge, without clipping or stretching. See `app/docs/MOOD_SELECTOR_2026-10-16.md`. Fresh running-app mobile/desktop screenshots, device checks and CI confirmation remain outstanding for this latest change.

**Real-browser CI gate (2026-10-17):** Playwright tests live in `app/tests/` and run with the existing `npm test` before Pages publishing: 21 screen routes plus populated-journal states, five mood image fit/interaction assertions, isolated persistence checks and 320/390/1280 Chromium + 393 WebKit layouts. Workflow uploads genuine browser captures, verifies a release SHA after deploy and does not deploy on failed pre-release gates. Physical devices, pixel-diff baselines and reviewed refreshed `SCREENSHOT*.png` remain outstanding. See `app/docs/BROWSER_TESTING.md`.

**Mood chooser mobile candidate, 2026-10-17 (unmerged):** [PR #3](https://github.com/itsnotalwin/Be-you/pull/3) proposes improved above-the-fold choice visibility based on real screenshot inspection. Preserve all five approved original mood portraits, single reactive route, and native image aspect ratio. The screenshot capture workflow generates real review frames from the branch. Do not label these improvements live until Playwright CI, visual review and production deploy are complete. [PR #2](https://github.com/itsnotalwin/Be-you/pull/2) pixel baselines remain pending and must be reconciled to any approved visual changes.

**Review evidence (2026-10-17):** PR #3 now includes authentic Chromium capture files `app/SCREENSHOT-MOBILE-MOOD*.png`, `app/SCREENSHOT-DESKTOP-MOOD.png`, and `app/SCREENSHOT-MOOD-*.png` (five states). All show the unmodified approved mood portraits with discoverable mobile options. Review branch is not yet a live Pages deployment; approval/CI is required before merge.

**Desktop improvement added to PR #3:** The genuine 1280×800 review capture now displays the complete picker and portrait side by side, without altering any approved portrait or the one-route mood logic. The phone layout remains vertically arranged with visible mood choices. PR #3 is the visual review gate; main/live remains unchanged.

**2026-10-17 pending PR #3 portrait-fill fix:** The one mood screen now displays all five approved illustrations in a stable 306:562 portrait panel that fills edge-to-edge. Good is unchanged; narrower original artworks get only a small centered crop (<6%), not stretching or square thumbnails. The previous natural-aspect descriptions refer to earlier implementation. No change to approved files or save behavior. Updated running-browser screenshot review and passing CI are needed before publication.
