---
description:
globs: cli/**/*,templates/**/*,kit-config.json,README.md
alwaysApply: false
---

# CLI development & Rule generation

When you modify the CLI or add new stack templates:

1. **CLI**

    - Update prompts in `cli/index.js`.
    - Organize services in appropriate files in `cli/services/`:
        - `base-service.js` - Base functionality shared across all services
        - `file-service.js` - File operations and template processing
        - `config-service.js` - Configuration and constants management
        - `stack-service.js` - Common stack functionality
        - Stack-specific services (e.g., `nextjs-service.js`, `laravel-service.js`)
    - Respect `templates/kit-config.json` for configuration.
    - Add/adjust helper scripts in `version-detector.js`.

2. **New stacks or architectures**

    - Create `templates/stacks/<stack>/base/` with generic rules.
    - Create `templates/stacks/<stack>/architectures/<arch_name>/` with architecture-specific rules.
    - Add overlay folders `v<major>/` for breaking changes only.
    - Update `kit-config.json`:
        - `globs`
        - `version_ranges`
        - `default_architecture`
        - `architectures` for stack-specific architectures
        - `pattern_rules` if needed.

3. **Template variables**

    - Use placeholders like `{projectPath}`, `{detectedVersion}`, `{versionRange}`, `{stack}` in templates.
    - These will be automatically replaced when generating rules.

4. **Docs**
    - Document new behaviour in `README.md` & `/docs/cli.md`.
    - Change `Implementation Status` block with percent progress of current implementations and add new if is a new implementation.

After changes, run:

```bash
pnpm run lint
pnpm run test
pnpx agent-rules-kit --update
```
