# GitHub automation context

Purpose: Repository-level build, browser QA and GitHub Pages release wiring.

Key folder: `workflows/` contains production publishing and temporary review-only capture pipelines.

Connections: The application lives in `../app/`; all production changes pass its tests. Do not confuse branch-specific review screenshots with published screenshots.

Change & verify: Prefer small branch-scoped updates, preserve permissions least-privilege, and inspect GitHub Actions success before asserting deployment.