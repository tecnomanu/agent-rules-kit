# Rule Organization Methodology

This document explains how the rules in Agent Rules Kit are organized to ensure modularity, version compatibility, and ease of maintenance across different frameworks and technologies.

## Rule Types

### 1. Global Rules

Located in `templates/global/`, these rules apply to all projects regardless of framework or technology:

-   **best-practices.md**: General best practices for code quality
-   **code-standards.md**: Universal code style and formatting standards
-   **file-guard.md**: Guidelines for safe file modifications
-   **log-process.md**: Documentation requirements for processes

Global rules are automatically applied to all files in a project.

### 2. Framework-Specific Base Rules

Located in `templates/stacks/<framework>/base/`, these rules contain the core conventions for a specific framework that apply to all versions:

-   Example: `templates/stacks/laravel/base/laravel-best.md`
-   Example: `templates/stacks/nextjs/base/nextjs-components.md`
-   Example: `templates/stacks/angular/base/angular-modules.md`

These rules establish the foundation for working with a particular framework.

### 3. Version-Specific Rules

Located in `templates/stacks/<framework>/v<version>/`, these rules apply to specific versions of a framework:

-   Examples for different frameworks:
    -   Laravel: `templates/stacks/laravel/v12/providers.md`
    -   Next.js: `templates/stacks/nextjs/v14/app-router.md`
    -   Angular: `templates/stacks/angular/v17/signals.md`
    -   React: `templates/stacks/react/v18/concurrent-features.md`

Version-specific rules override or extend base rules with version-specific information.

## Framework Versioning Structure

The system currently supports individual version directories (e.g., `v12`). Future enhancements will include support for version ranges (e.g., `v8-9`, `v10-11`) with a mapping system to determine the appropriate rule set based on the detected framework version.

## Rule Assignment

Rules are assigned to files using patterns defined in `kit-config.json`:

```json
"nextjs": {
  "globs": ["<root>/app/**/*.{ts,tsx}"],
  "pattern_rules": {
    "<root>/app/api/**/*.ts": [
      "stacks/nextjs/base/api-routes.md",
      "stacks/nextjs/v13/api-routes.md"
    ],
    "<root>/app/components/**/*.tsx": [
      "stacks/nextjs/base/components.md",
      "stacks/nextjs/v14/server-components.md"
    ]
  }
}
```

## Rule Content Structure

Each rule file follows a consistent structure:

1. **Title**: Clear indication of what the rule covers
2. **Overview**: Brief explanation of why the rule exists
3. **Guidelines**: Specific instructions or best practices
4. **Examples**: Code examples showing proper implementation
5. **Version Note** (if applicable): Information about version compatibility

## Extending the Rule System

To add new rules:

1. Determine if the rule is global or framework-specific
2. Create the rule in the appropriate directory
3. Update `kit-config.json` with patterns for file assignment
4. Run tests to ensure proper integration
5. Update documentation to reflect the new rule

## Version Detection

The system automatically detects framework versions from project files:

-   Laravel: Reads `composer.json` for Laravel version
-   Next.js: Reads `package.json` for Next.js version
-   Angular: Reads `package.json` for Angular version
-   React: Reads `package.json` for React version
-   NestJS: Reads `package.json` for NestJS version

This allows for applying the correct version-specific rules, though future updates will improve the version range mapping.

## Architecture Options

In addition to version-specific rules, the system will support architecture-specific rule sets:

-   Standard architecture (e.g., Laravel MVC, Next.js Pages)
-   Domain-Driven Design (DDD)
-   Hexagonal Architecture
-   CQRS
-   Other common patterns

Users will be able to select their preferred architecture during setup, and the system will apply the appropriate rule set.
