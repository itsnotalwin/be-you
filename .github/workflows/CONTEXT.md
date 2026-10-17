# Workflow folder context

Purpose: Real browser quality gates, production Pages deploy and temporary branch-scoped mood visual evidence.

Key files: `deploy-pages.yml` verifies + deploys the production app; `mood-review.yml` captures actual Chromium screenshots from the one UI review branch only.

Connections: `../../app/tests/capture-mood-review.mjs` generates synthetic-data screenshots, `../../app/SCREENSHOT-*.png` stores actual rendered evidence.

Change & verify: Review workflow logs and artifacts; do not push bypassed tests to main. The branch capture job may write only to its review branch and requires no secrets. Remove the review-only workflow after approved evidence is preserved.