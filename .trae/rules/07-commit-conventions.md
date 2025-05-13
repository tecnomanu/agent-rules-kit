---
description:
globs:
alwaysApply: true
---

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
