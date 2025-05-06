# Agent Rules Kit

A modular rules system for Cursor AI to follow best practices in your projects across multiple frameworks and architectures.

## Overview

Agent Rules Kit provides a collection of rules organized by:

-   **Global rules**: Best practices that apply to any project
-   **Framework-specific rules**: Patterns, conventions and best practices for specific frameworks
-   **Version-specific rules**: Guidelines that apply to specific versions of a framework
-   **Architecture-specific rules**: Rules tailored to different architectural patterns (coming soon)

## Installation

```bash
# Install the rule set
npx agent-rules-kit

# Select your frameworks and preferences through the CLI wizard
```

## Structure

```
.cursor/rules/
├── global/                  # Global best practices for any project
│   ├── best-practices.md    # General best practices
│   ├── code-standards.md    # Code style standards
│   ├── file-guard.md        # File modification guidelines
│   └── log-process.md       # Process documentation guidelines
│
├── laravel/                 # Laravel-specific rules
│   ├── laravel-best.md      # Core Laravel best practices
│   ├── model-casting.md     # Laravel model casting guidelines
│   ├── providers.md         # Service provider registration guidelines
│   └── routes.md            # Routing best practices
│
├── nextjs/                  # Next.js-specific rules
│   └── ...                  # Next.js rules files
│
├── angular/                 # Angular-specific rules
│   └── ...                  # Angular rules files
│
└── ...                      # Other framework rules
```

## Version Detection

The system automatically detects your project's framework version:

-   **Laravel**: Reads `composer.json` for Laravel version
-   **Next.js**: Reads `package.json` for Next.js version
-   **Angular**: Reads `package.json` for Angular version
-   **React**: Reads `package.json` for React version

Based on the detected version, appropriate rules are applied:

-   **Laravel 8-9**: Uses the v8-9 specific rules
-   **Laravel 10-11**: Uses the v10-11 specific rules
-   **Laravel 12**: Uses the v12 specific rules
-   **Next.js 13**: Uses the v13 specific rules
-   **Next.js 14**: Uses the v14 specific rules
-   **Angular 16+**: Uses modern Angular rules

The version detection system is being enhanced to better support version ranges and specific rule selection.

## Rule Assignment

Rules are assigned to files using patterns in `kit-config.json`:

```json
"laravel": {
  "pattern_rules": {
    "<root>/app/Models/**/*.php": [
      "stacks/laravel/base/laravel-best.md",
      "stacks/laravel/v8-9/model-casting.md",
      "stacks/laravel/v10-11/model-casting.md"
    ]
  }
}
```

Only the appropriate version-specific rules will be applied based on detected version.

## Extending

You can add your own rules by creating additional markdown files in the `.cursor/rules` directory, following the standard format.

## Available Frameworks

-   Laravel (versions 8-12)
-   Next.js (versions 12-14)
-   NestJS (latest versions)
-   React (versions 17-18)
-   Angular (versions 14-17)
-   Astro (latest versions)
-   Generic (for any other project type)

## Coming Soon

-   Architecture-specific rules (DDD, Hexagonal, CQRS, etc.)
-   More framework supports
-   Multilingual rule sets
-   Custom rule creation wizard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
