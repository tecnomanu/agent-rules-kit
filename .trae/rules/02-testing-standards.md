---
description:
globs:
alwaysApply: true
---

# Testing & CI

-   All CLI logic is covered by **Vitest** unit tests:
    -   `tests/cli/file-helpers.test.js` - Tests for file operations
    -   `tests/cli/config.test.js` - Tests for configuration handling
    -   `tests/cli/stack-helpers.test.js` - Tests for common stack functionality
    -   `tests/cli/nextjs-helpers.test.js` - Tests for Next.js specific functionality
-   Template‑generation is validated by snapshot tests (`tests/templates/`).
-   CI (GitHub Actions) runs `npm run test` and checks formatting.
-   Before publishing a new version, run `npm run test -- --update` to refresh snapshots if necessary.
-   Pre-commit and pre-push hooks run tests automatically using Husky.
