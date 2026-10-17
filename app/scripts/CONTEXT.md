# Application verification scripts

Purpose: Integrity checks and lightweight behavioral tests for the single BE YOU PWA, not another implementation.

Key files: `verify.mjs` validates assets, approved checksum inventory, PWA cache and the fixed portrait-frame contract. `smoke.mjs` verifies routes, mood interactions, and saving with synthetic local data.

Connections: Run from `app/` with `npm test`. Browser-level geometry and real screenshots are in `../tests/`.

Change & verify: Keep the source image inventory, CSS frame rules and browser assertions aligned. Run `npm test` and `npm run test:browser` before publishing, then review genuine mood screenshots.
