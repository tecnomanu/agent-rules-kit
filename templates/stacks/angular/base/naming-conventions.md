---
description: Official Angular style guide naming conventions for files, classes, selectors, and members.
globs: <root>/src/app/**/*.ts
alwaysApply: true
---

# Angular Naming Conventions

Adhering to consistent naming conventions is a cornerstone of the Angular Style Guide. It improves readability, maintainability, and collaboration within {projectPath}. These conventions apply to files, classes, selectors, variables, and more.

## General Principles

-   **Clarity and Descriptiveness**: Names should clearly convey the item's purpose.
-   **Consistency**: Apply conventions uniformly across the project.
-   **Dot Notation for File Names**: Use dots to separate the name, type, and extension of a file (e.g., `hero.component.ts`).
-   **Hyphenated for Selectors and File Names (non-class)**: Use kebab-case for selectors and for filenames of non-class files (like stylesheets or templates if separate).

## File Naming

Angular style guide recommends naming files according to what they contain, followed by their type (e.g., `.component`, `.service`, `.module`, `.pipe`, `.directive`), and then the extension.

-   **Components**: `feature-name.component.ts` (e.g., `user-profile.component.ts`)
    -   Template: `user-profile.component.html`
    -   Styles: `user-profile.component.scss`
-   **Services**: `feature-name.service.ts` (e.g., `auth.service.ts`, `logger.service.ts`)
-   **Modules**: `feature-name.module.ts` (e.g., `customers.module.ts`, `shared.module.ts`)
-   **Pipes**: `pipe-name.pipe.ts` (e.g., `ellipsis.pipe.ts`, `filter-array.pipe.ts`)
-   **Directives**: `directive-name.directive.ts` (e.g., `highlight.directive.ts`, `draggable.directive.ts`)
-   **Routing Modules**: `feature-name-routing.module.ts` (e.g., `app-routing.module.ts`, `customers-routing.module.ts`)
-   **Guard Files**: `guard-name.guard.ts` (e.g., `auth.guard.ts`)
-   **Resolver Files**: `resolver-name.resolver.ts` (e.g., `user-data.resolver.ts`)
-   **Models/Interfaces**: `model-name.model.ts` or just `model-name.ts` (e.g., `user.model.ts`, `product.ts`)
-   **Enums**: `enum-name.enum.ts` or `enum-name.ts` (e.g., `order-status.enum.ts`)

## Class Naming

-   **Convention**: `PascalCase` (UpperCamelCase).
-   **Suffix**: Append the conventional type suffix (e.g., `Component`, `Service`, `Module`, `Pipe`, `Directive`, `Guard`).
-   **Examples**:
    -   `HeroComponent`
    -   `DataService`
    -   `AppModule`
    -   `InitialsPipe`
    -   `HighlightDirective`
    -   `AuthGuard`
    -   `UserResolver`

## Component Selectors

-   **Convention**: `kebab-case`.
-   **Prefix**: Use a consistent prefix, typically `app-` for application-level components or a feature-specific prefix (e.g., `admin-` for admin section components). This helps prevent naming collisions with standard HTML elements or third-party components.
-   **Examples**:
    -   `app-hero-list`
    -   `app-user-profile`
    -   `admin-user-editor`

## Directive Selectors

-   **Convention**: `camelCase` attribute selectors, enclosed in square brackets `[]`.
-   **Prefix**: Use a consistent prefix (e.g., `app` or a feature-specific prefix).
-   **Examples**:
    -   `[appHighlight]`
    -   `[appDraggable]`
    -   `[adminAccessControl]`

## Pipe Names

-   **Convention**: `camelCase`. This is the name used in templates when applying the pipe.
-   **Pipe Class Name**: `PascalCasePipe` (e.g., `FilterArrayPipe` class for `filterArray` pipe).
-   **Examples (in template)**:
    -   `{{ myValue | currency }}` (Angular built-in)
    -   `{{ longText | ellipsis:100 }}` (Custom pipe named `ellipsis`)
    -   `{{ creationDate | timeAgo }}` (Custom pipe named `timeAgo`)

## Module Names (Class Names)

-   **Convention**: `PascalCase` with `Module` suffix.
-   **Examples**:
    -   `AppModule`
    -   `HeroesModule`
    -   `SharedModule`

## Variable and Function Naming

-   **Convention**: `camelCase`.
-   **Private Members**: Consider prefixing private properties and methods with an underscore `_` (e.g., `_internalValue`, `_calculateTotal()`). While TypeScript has `private` keyword, underscore prefix is a common convention for quick visual distinction.
-   **Observable Variables**: Often suffixed with a `$` (e.g., `users$`, `products$`).

    ```typescript
    // my.component.ts
    export class MyComponent {
    	userName: string = 'Alice'; // camelCase for properties
    	private _defaultRole: string = 'guest'; // _ for private (conventional)

    	users$: Observable<User[]>; // $ suffix for Observables

    	constructor(private userService: UserService) {} // camelCase for parameters

    	getUserDetails(): void {
    		// camelCase for methods
    		// ...
    	}

    	private _logActivity(message: string): void {
    		// _ for private methods
    		// ...
    	}
    }
    ```

## Constant Naming

-   **Convention**: `UPPER_SNAKE_CASE` for traditional constants whose values are fixed and known at compile time.
    ```typescript
    export const DEFAULT_TIMEOUT_MS = 5000;
    export const API_BASE_URL = '/api/v1';
    ```
-   For configuration objects or other "constants" that are objects or arrays, `camelCase` (if internal) or `PascalCase` (if exported and part of a public API structure) might be used, often with `as const` for type safety.
    ```typescript
    export const appConfiguration = {
    	maxUsers: 100,
    	defaultTheme: 'dark',
    } as const;
    ```

## Enum Naming

-   **Enum Type Name**: `PascalCase` (e.g., `OrderStatus`).
-   **Enum Members**: `PascalCase` or `UPPER_SNAKE_CASE`. `PascalCase` is more common in modern TypeScript.

    ```typescript
    // Using PascalCase for members (common)
    export enum UserRole {
    	Admin,
    	Editor,
    	Viewer,
    }

    // Using UPPER_SNAKE_CASE for members (also acceptable)
    export enum LogLevel {
    	DEBUG_LEVEL,
    	INFO_LEVEL,
    	ERROR_LEVEL,
    }
    ```

By consistently applying these Angular Style Guide naming conventions throughout {projectPath}, your codebase will be more approachable, readable, and easier to manage for all team members.

```

```
