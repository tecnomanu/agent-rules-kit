---
description: Conventions for Git commit messages
globs: **/*
alwaysApply: true
---

# Git Commit Guidelines

Adopt **Conventional Commits** with emojis for quick context:

| Type     | Emoji | Example                                 |
| -------- | ----- | --------------------------------------- |
| feat     | ✨    | `feat(api): ✨ add user authentication` |
| fix      | 🐛    | `fix(payment): 🐛 handle timeout error` |
| docs     | 📝    | `docs(readme): 📝 clarify setup`        |
| refactor | ♻️    | `refactor(core): ♻️ extract helper`     |
| test     | ✅    | `test(utils): ✅ edge cases for parser` |
| chore    | 🔧    | `chore(ci): 🔧 bump node version`       |

**Versioning**

-   **MAJOR**: breaking changes (v2.0.0)
-   **MINOR**: new features, backward‑compatible (v1.1.0)
-   **PATCH**: bug fixes, backward‑compatible (v1.0.1)
