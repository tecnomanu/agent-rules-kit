# Agent Rules Kit - Process Todo

## Tasks

-   [x] Review current rule structure and organization
-   [x] Create a modular structure for Laravel version-specific rules
-   [x] Make Laravel rules version-aware (detect and display version)
-   [x] Separate core Laravel rules from version-specific overlays
-   [x] Review examples rules and categorize them as global or framework-specific
-   [x] Enhance global rules for project-wide best practices
-   [x] Create additional Laravel version-specific rules
-   [x] Update rule assignment patterns in kit-config.json
-   [x] Ensure all rules are in English
-   [x] Add README updates about the new modular structure
-   [x] Create example rule templates for new Laravel versions
-   [x] Document the rule organization methodology
-   [x] Translate all rules to English
-   [x] Reorganize project structure documentation to be architecture-specific
-   [x] Implement consistent testing guidelines across all frameworks
-   [x] Improve repository pattern documentation with architecture-specific namespaces
-   [x] Create proper best practices documentation for NestJS and NextJS

## Completed Work

1. Translated all global rules to English
2. Created a new global `code-standards.md` rule
3. Updated Laravel base rules to be more modular
4. Added version-specific Laravel rules:
    - Providers for Laravel 8-11 vs Laravel 12
    - Model casting for Laravel 8-9 vs Laravel 10-11
    - Routing for Laravel 8-11 vs Laravel 12
5. Made Laravel base rules version-aware with a note about version-specific rules
6. Updated kit-config.json with pattern-based rule assignments
7. Created a comprehensive README explaining the modular rule system
8. Created a rule_organization.md document explaining the methodology
9. Added proper file structure for version-specific rules
10. Made documentation more framework-agnostic with examples from various frameworks
11. Implemented better version detection system with version ranges
12. Created architecture-specific rules for Laravel (Standard, DDD, Hexagonal)
13. Added rules for Next.js (App Router and Pages Router)
14. Added rules for Angular (base and Signals for v16-17)
15. Made version ranges configurable in kit-config.json
16. Enhanced CLI to prompt for framework-specific options (architecture, router type)
17. Moved project structure documentation to respective architecture directories
18. Created conceptual architecture documentation in base directory
19. Implemented consistent testing guidelines for Laravel, NestJS, and Angular
20. Updated repository pattern documentation with architecture-specific namespaces
21. Created proper best practices documentation for NestJS and NextJS

## Next Steps

1. Implement similar version-specific rules for other frameworks (React, NestJS)
2. Add test cases to validate rule application
3. Enhance the CLI to support the new modular structure
4. Prepare for multilingual support in the future
5. Create architecture/pattern variations for additional frameworks
6. Implement rules for specialized patterns (CQRS, Event Sourcing)
7. Add configuration UI for easier rule customization
8. Create testing guidelines for other frameworks (Vue, Nuxt, Svelte)
9. Add domain-driven design patterns for all supported frameworks
10. Implement microservices architecture patterns
11. Create database-specific best practices (MySQL, PostgreSQL, MongoDB)
12. Add deployment and CI/CD best practices for each framework
13. Create documentation for API design patterns and standards

## CLI Version Detection Enhancement

-   [x] Modify CLI to support version ranges (e.g., v8-9, v10-11) instead of exact version matching
-   [x] Add mapping logic to determine appropriate version directory based on detected version
-   [x] Add tests for version detection and mapping

## Laravel Architecture Options

-   [x] Create rules for standard Laravel architecture (current structure)
-   [x] Create rules for Domain-Driven Design (DDD) architecture
-   [x] Create rules for Hexagonal architecture
-   [ ] Create rules for other common architectures (CQRS, etc.)
-   [x] Update CLI to prompt for architecture preference
-   [x] Add configuration in kit-config.json to support architecture-specific rules
-   [x] Create architecture-specific directory structure in templates
-   [x] Document the different architecture options and their rule sets

## Testing Documentation

-   [x] Create base testing guidelines for Laravel
-   [x] Create version-specific testing guidelines for Laravel (v10-11, v12)
-   [x] Create testing guidelines for NestJS
-   [x] Create testing guidelines for Angular
-   [ ] Create testing guidelines for Vue
-   [ ] Create testing guidelines for Nuxt
-   [ ] Create testing guidelines for React
-   [ ] Create testing guidelines for NextJS
-   [ ] Create testing guidelines for Svelte
-   [ ] Create testing guidelines for SvelteKit

## Project Structure Documentation

-   [x] Move project structure documentation to architecture-specific directories
-   [x] Create conceptual architecture documentation for Laravel
-   [ ] Create conceptual architecture documentation for NestJS
-   [ ] Create conceptual architecture documentation for Angular
-   [ ] Create conceptual architecture documentation for React/NextJS
-   [ ] Create conceptual architecture documentation for Vue/Nuxt
-   [ ] Create conceptual architecture documentation for Svelte/SvelteKit
