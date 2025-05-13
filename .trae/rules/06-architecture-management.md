---
description:
globs:
alwaysApply: true
---

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
