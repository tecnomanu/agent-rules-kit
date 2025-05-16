# Project Overview & Guidelines

This repository contains **agent‑rules‑kit**, a CLI tool and template set that bootstraps Cursor rules for multiple stacks.
The rules in this folder _govern the maintenance of this very project_.

| Topic       | Quick rule                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI changes | Update code in `cli/services/` modules and `cli/index.js`; add unit and integration tests.                                                              |
| Templates   | Follow folder layout: `templates/global/`, `templates/stacks/<stack>/base/`, `templates/stacks/<stack>/architectures/`, `templates/stacks/<stack>/v*/`. |
| Config      | Keep `templates/kit-config.json` as single source of truth for globs, version ranges & default architectures.                                           |
| Releases    | Bump `package.json` + CHANGELOG. Tag using `vx.y.z`.                                                                                                    |
| Language    | **All code, documentation, and files must be written in English**, even if communicating with the agent in another language.                            |

## Language Policy

While you may interact with the agent in any language, all project files, code, comments, documentation, and rules must be written in English. This ensures consistency and maintainability across the project. When working with the Agent Rules Kit:

-   Write all code, comments, and docstrings in English
-   Create documentation files in English
-   Use English for variable names, function names, and other identifiers
-   Use English for commit messages and pull requests
-   Keep configuration files in English

For example, if you're communicating with the agent in Spanish, the agent should respond in Spanish, but any generated or modified code must still be in English.

# Global Coding Standards

These apply to **all code** in this repository (TypeScript, PHP, Markdown, JSON):

-   Use **ESLint + Prettier** for all JavaScript/TypeScript files; run `npm run lint` before committing.
-   PHP code must pass **PHP‑Stan level 8** and **Pint** auto‑format (run `composer pint`).
-   Markdown follows the GitHub Markdown style guide; wrap lines at 120 chars.
-   JSON files must be pretty‑printed with 2‑space indent.

> Any new template file must follow the same style conventions.

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

# File Operations Guidelines

These guidelines apply to all file operations in the Agent Rules Kit project.
!Important: Al the system and files most be in english

 <!-- In the future: or using the translations system -->

## File Creation and Modification

-   Before creating a file, check if it already exists to avoid duplication
-   When modifying existing files, preserve the original formatting and style
-   If a file exists and there is no explicit instruction to overwrite, merge content instead of replacing
-   Ensure all new files have appropriate permissions
-   Add file headers with description and copyright information where applicable

## Template Files

-   Template files in the `templates/` directory should:
    -   Use clear, descriptive names
    -   Include meaningful comments
    -   Provide examples for customization
    -   Follow the established naming patterns
    -   Use proper file extensions

## Rule Files Structure

-   All rule files should follow a consistent structure:
    -   Title at the top
    -   Brief description of purpose
    -   Sections with clear headings
    -   Code examples where appropriate
    -   Version compatibility information if relevant

## Path Handling

-   Use path manipulation utilities (like Node.js `path` module) instead of string concatenation
-   Handle both relative and absolute paths correctly
-   Use platform-appropriate path separators
-   Normalize paths when comparing or storing them
-   Validate paths before file operations

## File I/O

-   Use asynchronous file operations when possible
-   Properly handle file operation errors
-   Close file handles after use
-   Use appropriate encoding for text files (UTF-8 preferred)
-   Implement proper error recovery for file operations

## Configuration Files

-   Keep configuration files in standard formats (JSON, YAML, etc.)
-   Validate configuration files against schemas
-   Provide sensible defaults
-   Document all configuration options
-   Use environment variables for sensitive information

## Version Control Considerations

-   Don't track generated files in version control
-   Add appropriate entries to .gitignore
-   Consider using .gitattributes for handling line endings
-   Backup important files before destructive operations
-   Ensure file timestamps are preserved when appropriate

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

# Template Processing & Variables

This document explains how templates are processed and variables are substituted in Agent Rules Kit.

## Template Variables

The following variables are available for use in template files:

| Variable            | Description                       | Example            |
| ------------------- | --------------------------------- | ------------------ |
| `{projectPath}`     | Path to the project               | `/path/to/project` |
| `{detectedVersion}` | Detected version of the framework | `10`               |
| `{versionRange}`    | Compatible version range          | `v10-11`           |
| `{stack}`           | Selected stack                    | `laravel`          |

## Processing Flow

1. **Read Template**: Templates are read from `templates/` directory
2. **Process Variables**: All variables in `{placeholder}` format are replaced
3. **Add Front Matter**: Metadata is added as front matter to MDC files
4. **Output Generation**: Processed content is written to destination

## Implementation

The main processing happens in `cli/utils/file-helpers.js`:

```javascript
// Process template variables (simplified example)
const processTemplateVariables = (content, meta = {}) => {
	let processedContent = content;

	// Replace all template variables with their values
	const templateVariables = [
		{ value: meta.detectedVersion, replace: 'detectedVersion' },
		{ value: meta.versionRange, replace: 'versionRange' },
		{ value: meta.projectPath, replace: 'projectPath' },
		{ value: meta.stack, replace: 'stack' },
	];

	templateVariables.forEach(({ value, replace }) => {
		if (value) {
			const regex = new RegExp(`\\{${replace}\\}`, 'g');
			processedContent = processedContent.replace(regex, value);
		}
	});

	return processedContent;
};
```

## Example

Template file:

```markdown
# {stack} Documentation

This project is using {stack} version {detectedVersion}.
It is located at {projectPath}.
```

After processing (if stack=laravel, detectedVersion=10, projectPath=/app):

```markdown
# laravel Documentation

This project is using laravel version 10.
It is located at /app.
```

# Template Structure Guidelines

This document explains the organization pattern for all stack documentation in Agent Rules Kit.

## Core Organization Pattern

All documentation for stacks follows this three-tier structure:

### 1. Base Documentation (Conceptual)

Files in `templates/stacks/<stack>/base/` contain **ONLY** conceptual information with no implementation-specific code. These files:

-   Explain general concepts
-   Provide architectural guidelines
-   Outline best practices
-   Avoid version-specific implementation details

Example: `templates/stacks/<stack>/base/architecture-concepts.md`

### 2. Version-Specific Implementation

Files in `templates/stacks/<stack>/v<number>/` contain concrete implementation examples specific to that version:

-   Code examples showing actual implementation
-   Version-specific APIs and patterns
-   Testing implementations with exact syntax
-   Configuration examples

Example: `templates/stacks/<stack>/v3/testing-best-practices.md`

### 3. Shared Version Implementations

When implementations are identical across adjacent versions, use a shared folder:

-   `templates/stacks/<stack>/v2-3/` for code shared between versions 2 and 3
-   Avoids duplication while maintaining version specificity
-   Should still be implementation-focused

## Naming Conventions

1. Use consistent file names across versions
2. Same base filename should refer to the same concept
3. Keep extensions as `.md` (they will be converted to `.mdc` by the CLI)

## When Editing Templates

-   If adding new concepts: add to `/base` without implementation details
-   If adding version-specific code: add to the appropriate `/v<number>` folder
-   If updating shared code: ensure it's compatible with all versions in the range

This structure maintains clear separation between concepts and implementation, preventing future maintenance issues and ensuring clear guidance for all supported versions.

# Architecture Management

This document explains how different architecture styles are managed for each stack in Agent Rules Kit.

## Package Management

Always use `pnpm` to install new packages or to run commands.

## Architecture Structure

Each stack can have multiple architecture styles organized in the following way:

```
templates/
└── stacks/
    ├── laravel/
    │   ├── base/              # Common rules for all Laravel projects
    │   ├── architectures/     # Architecture-specific rules
    │   │   ├── standard/      # Standard MVC architecture
    │   │   ├── ddd/           # Domain-Driven Design architecture
    │   │   └── hexagonal/     # Hexagonal (Ports & Adapters) architecture
    │   └── v10-11/            # Version-specific overlays
    │
    └── nextjs/
        ├── base/              # Common rules for all Next.js projects
        ├── architectures/     # Architecture-specific rules
        │   ├── app/           # App Router architecture (Next.js 13+)
        │   └── pages/         # Pages Router architecture
        └── v13/               # Version-specific overlays
```

## Configuration

Architectures are configured in `templates/kit-config.json`:

```json
{
  "[stack_name]": {
    "default_architecture": "standard",
    "version_ranges": {
      "8": {
        "name": "Laravel 8-9",
        "range_name": "v8-9"
      },
      "9": {
        "name": "Laravel 8-9",
        "range_name": "v8-9"
      },
      "10": {
        "name": "Laravel 10-11",
        "range_name": "v10-11"
      }
    },
    "globs": [
      "<root>/app/**/*.php",
      "<root>/routes/**/*.php"
    ],
    "architectures": {
      "standard": {
        "name": "Standard Architecture",
        "globs": [...],
        "pattern_rules": {...}
      },
      "ddd": {
        "name": "Domain-Driven Design",
        "globs": [...],
        "pattern_rules": {...}
      }
    }
  }
}
```

Key configuration properties:

-   `default_architecture`: The default architecture to use if none is specified
-   `version_ranges`: Maps major versions to version range information
    -   `name`: Human-readable name for the version range
    -   `range_name`: Identifier used for version-specific directories
-   `globs`: File patterns to apply rules to
-   `architectures`: Available architecture styles for the stack
    -   Each architecture can have its own `globs` and `pattern_rules`

## Architecture Selection

During CLI execution, users are prompted to select an architecture for their stack:

```
? Select Laravel architecture style: (Use arrow keys)
❯ Standard Laravel (MVC with Repositories)
  Domain-Driven Design (DDD)
  Hexagonal Architecture (Ports and Adapters)
```

The default architecture (set in `kit-config.json`) is pre-selected.

## Implementation

Architecture rules are applied in the following order:

1. Base rules for the stack
2. Version-specific overlays
3. Architecture-specific rules

This enables having common rules across all architectures while providing specialized guidance for each architecture style.

# Commit Conventions

This document outlines the commit conventions used in the Agent Rules Kit project. We use **semantic-release** for automated versioning and CHANGELOG generation.

## Language

**All commits must be written in English**, regardless of your native language. This ensures consistency throughout the project, as all code, documentation, and rules are maintained in English.

## Commit Format

We follow the [Conventional Commits](mdc:https:/www.conventionalcommits.org) specification with emojis:

```
<type>[(scope)]: <emoji> <description>

[optional body]

[optional footer(s)]
```

## Emojis and Types

Always include an appropriate emoji at the first of your commit message description, before the type and description.

### Versioning Commits (affect semver)

When your changes affect the semantic versioning of the package, use these types:

| Emoji | Type        | Description                                   | Versioning Impact |
| ----- | ----------- | --------------------------------------------- | ----------------- |
| ✨    | feat        | New feature                                   | MINOR             |
| 🐛    | fix         | Bug fix                                       | PATCH             |
| 🎉    | feat or fix | Breaking change (with BREAKING CHANGE footer) | MAJOR             |

For major version bumps (BREAKING CHANGES), you MUST:

1. Use a normal type (like `feat` or `fix` without exclamation mark)
2. Include a `BREAKING CHANGE:` section in the footer

Example:

```
feat:  🎉 redesign user authentication system

Complete overhaul of authentication flow and API

BREAKING CHANGE: The auth token format has changed and all clients will need to be updated
```

> Important: Based on our testing, using exclamation marks (!) in the type can cause issues with our semantic-release setup. The footer `BREAKING CHANGE:` is sufficient to trigger a major version bump.

### Non-versioning Commits

For changes that don't affect the version number:

| Emoji | Type     | Description                                         |
| ----- | -------- | --------------------------------------------------- |
| 📝    | docs     | Documentation changes                               |
| 🔧    | chore    | Maintenance tasks                                   |
| ♻️    | refactor | Code changes that neither fix bugs nor add features |
| 🎨    | style    | Code style/formatting changes                       |
| ⚡️   | perf     | Performance improvements                            |
| ✅    | test     | Adding or correcting tests                          |
| 🔨    | build    | Build system changes                                |
| 🚀    | ci       | CI configuration changes                            |

Example:

```
docs: 📝 update README with new architecture documentation
```

## Best Practices

1. Keep the first line (subject) under 72 characters
2. Use the imperative mood ("add" not "added" or "adds")
3. Don't capitalize the first letter after the type
4. No period at the end of the subject line
5. Separate subject from body with a blank line
6. Use the body to explain what and why vs. how

## Branch Naming

Follow a similar convention for branch names:

-   `feature/short-description` - For new features
-   `fix/issue-description` - For bug fixes
-   `docs/update-area` - For documentation updates
-   `refactor/component-name` - For refactoring
