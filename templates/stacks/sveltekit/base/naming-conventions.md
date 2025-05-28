---
description: Naming conventions for files and code within SvelteKit applications.
globs: <root>/src/**/*.{svelte,js,ts}
alwaysApply: true
---

# SvelteKit Naming Conventions

Consistent naming conventions are vital for maintaining a readable, scalable, and collaborative codebase in your SvelteKit project at {projectPath}. This guide outlines recommended conventions, many of which are enforced or encouraged by SvelteKit's file-system router.

## 1. Route Files (within `src/routes/...`)

SvelteKit's routing is directory-based, with special file names for defining route components and logic.

-   **Page Component**: `+page.svelte`
    -   Defines the UI for a specific route segment.
-   **Layout Component**: `+layout.svelte`
    -   Defines a layout that wraps `+page.svelte` and child layouts.
-   **Error Component**: `+error.svelte`
    -   Defines a custom error page for a route segment.
-   **Universal `load` Function File**: `+page.js` or `+page.ts`
    -   Exports a `load` function that runs on server and client for a page.
-   **Universal Layout `load` Function File**: `+layout.js` or `+layout.ts`
    -   Exports a `load` function for a layout, running on server and client.
-   **Server-Only `load` Function File**: `+page.server.js` or `+page.server.ts`
    -   Exports a server-only `load` function and/or `actions` for a page.
-   **Server-Only Layout `load` Function File**: `+layout.server.js` or `+layout.server.ts`
    -   Exports a server-only `load` function for a layout.
-   **API Route / Endpoint File**: `+server.js` or `+server.ts`
    -   Exports functions for HTTP methods (e.g., `GET`, `POST`, `PATCH`, `DELETE`) to create API endpoints.

## 2. Route Directory Naming

-   **Static Segments**: `lowercase` and `kebab-case` (though lowercase single words are common).
    -   Example: `src/routes/about-us/`, `src/routes/contact/`
-   **Parameterized Routes (Dynamic Segments)**: Enclose folder names in square brackets `[]`.
    -   Example: `src/routes/blog/[slug]/` (parameter is `slug`)
    -   `src/routes/products/[id]/` (parameter is `id`)
-   **Rest Parameters (Catch-all Routes)**: Use three dots `...` inside square brackets.
    -   Example: `src/routes/docs/[...path]/` (parameter `path` captures all segments)
-   **Layout Groups**: Enclose folder names in parentheses `()`. These affect routing hierarchy for layouts but *do not* add segments to the URL path.
    -   Example: `src/routes/(app)/dashboard/+page.svelte` (URL is `/dashboard`)
    -   `src/routes/(marketing)/home/+page.svelte` (URL is `/home`)
-   **Optional Parameters**: Use double square brackets `[[]]` for optional parameters.
    -   Example: `src/routes/lang/[[lang]]/+page.svelte` (matches `/lang` and `/lang/en`)
-   **Route Modifiers**:
    - `@matcher`: `src/routes/user/[id=integer]/+page.svelte` (uses a custom matcher named `integer`)

## 3. Svelte Component Files (outside `src/routes/`)

-   **Filename**: `PascalCase.svelte`
    -   Typically located in `src/lib/components/` or feature-specific directories within `src/lib/`.
    -   Example: `src/lib/components/ui/Button.svelte`, `src/lib/components/shared/Header.svelte`
-   **Component Name (in `<script>`)**: Implicitly `PascalCase` based on the filename.

## 4. JavaScript/TypeScript Files (in `src/lib/` or other non-route directories)

-   **Utility Modules/Helper Functions**: `camelCase.js` or `camelCase.ts`
    -   Example: `src/lib/utils/formatDate.ts`, `src/lib/helpers/apiClient.js`
-   **Service Files / Server-Side Logic**: `camelCase.ts` or `kebab-case.ts`. Files intended only for server-side use are often placed in `src/lib/server/`.
    -   Example: `src/lib/server/database.ts`, `src/lib/server/authService.ts`
-   **Class Files (if applicable)**: `PascalCase.js` or `PascalCase.ts`
    -   Example: `src/lib/models/UserModel.ts`
-   **Store Files**: `camelCaseStore.js` or `camelCaseStores.js`, or simply `stores.js` / `stores.ts` if multiple stores are defined in one file. Individual store names should be `camelCase`.
    -   Example: `src/lib/stores/userStore.ts`, `src/lib/stores/cart.ts`

## 5. Hooks Files

-   **Server Hooks**: `hooks.server.js` or `hooks.server.ts` (located in `src/`)
-   **Client Hooks**: `hooks.client.js` or `hooks.client.ts` (located in `src/`)

## 6. Service Worker Files

-   **Service Worker**: `service-worker.js` or `service-worker.ts` (located in `src/`)

## 7. Parameter Matcher Files

-   **Matcher File**: `[name].js` or `[name].ts` (located in `src/params/`)
    -   Example: `src/params/integer.ts` (defines a matcher named `integer`)

## Variable and Function Naming (within JS/TS/Svelte scripts)

Follow standard JavaScript/TypeScript conventions:
-   **General Variables & Functions**: `camelCase`
-   **Constants**: `UPPER_SNAKE_CASE` or `PascalCase` (if exported and part of a specific structure like an enum).
-   **Classes & Interfaces & Types**: `PascalCase`
-   **Props (in Svelte components)**: `camelCase`
-   **Event Names (dispatched from Svelte components)**: `lowercase` or `camelCase`.
-   **Store Names (exported from store modules)**: `camelCase`.

## CSS Classes and IDs

-   **CSS Classes**: `kebab-case` is common, but `camelCase` or BEM can also be used depending on team preference. Svelte's scoped styles reduce the need for complex global naming schemes.
-   **CSS IDs**: `kebab-case` or `camelCase`. Use sparingly.

Adherence to these naming conventions, especially for route files, is crucial for SvelteKit to correctly interpret your project structure and define routes. For other code, consistency within {projectPath} is key.
```
