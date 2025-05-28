---
description: Naming conventions for Svelte applications.
globs: <root>/src/**/*.{svelte,js,ts}
alwaysApply: true
---

# Svelte Naming Conventions

Consistent naming conventions are essential for maintaining a readable, scalable, and collaborative codebase in your Svelte project at {projectPath}. This guide outlines recommended conventions.

## 1. Component Files and Names

-   **Filename**: `PascalCase.svelte`
    -   Example: `MyButton.svelte`, `UserProfileCard.svelte`, `ModalDialog.svelte`
-   **Component Name (in `<script>` if explicitly named, though often implicit from filename)**: `PascalCase`
    -   When importing, use PascalCase: `import MyButton from './MyButton.svelte';`

## 2. JavaScript/TypeScript Files

-   **Utility Modules/Helper Functions**: `camelCase.js` or `camelCase.ts`
    -   Example: `utils/formatDate.ts`, `lib/apiClient.js`
-   **Service Files**: `camelCase.service.js` or `camelCase.service.ts` (optional suffix)
    -   Example: `authService.ts`, `notificationService.js`
-   **Class Files (if applicable)**: `PascalCase.js` or `PascalCase.ts`
    -   Example: `models/UserModel.ts`, `services/AnalyticsTracker.js`
-   **Store Files**: `camelCaseStore.js` or `camelCaseStores.js` or simply `stores.js` (if multiple stores are defined in one file). Individual store names should be `camelCase`.
    -   Example: `userStore.ts`, `cartStores.js`

## 3. Variables

-   **General Variables**: `camelCase`
    -   Example: `let userName = 'Alice';`, `const MAX_RETRIES = 3;`
-   **Reactive State Variables (Svelte < 5)**: `camelCase` (these are just `let` declarations)
    -   Example: `let count = 0;`, `let isActive = false;`
-   **Reactive State Variables (Svelte 5 with Runes)**: `camelCase`
    -   Example: `let count = $state(0);`, `let currentUser = $state(null);`
-   **Constants (module-level or exported)**: `UPPER_SNAKE_CASE`
    -   Example: `export const API_ENDPOINT = '/api/v1';`, `const DEFAULT_TIMEOUT_MS = 5000;`

## 4. Functions and Methods

-   **General Functions/Methods**: `camelCase`
    -   Example: `function calculateTotal(items) { ... }`, `async function fetchData() { ... }`
-   **Lifecycle Functions**: (Svelte specific, names are fixed)
    -   `onMount`, `onDestroy`, `beforeUpdate`, `afterUpdate`
-   **Event Handlers (defined in `<script>`)**: `handleEventName` or `onEventName` (if it directly corresponds to a DOM event for clarity)
    -   Example: `function handleClick() { ... }`, `function handleInputChange(event) { ... }`, `function onFormSubmit() { ... }`

## 5. Component Props

-   **Prop Names**: `camelCase`
    -   When defining props: `export let userName;`, `export let items = [];`
    -   When passing props: `<MyComponent userId={currentUser.id} isActive={true} />`
-   **Boolean Props**: Often prefixed with `is`, `has`, `should`, `can` for clarity.
    -   Example: `export let isOpen;`, `export let hasError = false;`

## 6. Component Events

-   **Event Names (in `dispatch('eventName')`)**: `lowercase` or `camelCase` (lowercase is common for DOM-like events, camelCase for more descriptive custom events). Consistency is key.
    -   Example: `dispatch('click')`, `dispatch('notify')`, `dispatch('itemSelected', { item })`
-   **Event Handler Props (on parent component)**: `on:eventName` (Svelte directive)
    -   Example: `<ChildComponent on:notify={handleNotification} />`

## 7. Store Names

-   **Store Variables**: `camelCase`
    -   Example:
        ```javascript
        // stores.js
        import { writable } from 'svelte/store';
        export const currentUser = writable(null);
        export const notificationMessage = writable('');
        ```
    -   When using auto-subscription in components: `$currentUser`, `$notificationMessage`.

## 8. CSS Classes and IDs

-   **CSS Classes (within `<style>` tags or global CSS)**: `kebab-case` (lowercase, hyphen-separated) is a common convention, but `camelCase` is also seen, especially if tightly coupled with JS. Svelte's scoping often reduces the need for complex BEM-like naming.
    -   Example: `.user-profile`, `.button-primary`, `.error-message`
-   **CSS IDs**: `kebab-case` or `camelCase`. Use sparingly; prefer classes for styling.
    -   Example: `#main-navigation`, `#billingForm`

## 9. Folder Names (within `src`)

-   **Components Folder**: `components` (lowercase)
-   **Routes Folder (SvelteKit)**: `routes` (lowercase)
-   **Library/Utilities Folder**: `lib` (common in SvelteKit), or `utils`, `helpers` (lowercase)
-   **Stores Folder**: `stores` (lowercase)
-   **Static Assets Folder**: `assets` (for images, fonts etc. processed by Vite) or `static` (for files copied as-is in SvelteKit).

Adherence to these naming conventions will significantly improve the development experience, readability, and maintainability of the {projectPath} Svelte application.
```
