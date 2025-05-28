---
description: Naming conventions for Vue.js projects, following the official Vue Style Guide for components, props, events, and state management.
globs: <root>/src/**/*.{vue,js,ts}
alwaysApply: true
---

# Vue.js Naming Conventions

Following consistent naming conventions is crucial for maintainability, readability, and collaboration in Vue.js projects developed in {projectPath}. The Vue Style Guide provides official recommendations, which are summarized and expanded upon here.

## Component Names

Vue components should adhere to these naming conventions:

-   **Multi-word Component Names**: Component names should always be multi-word, except for root `App.vue` components, and components built into Vue, like `<transition>` or `<component>`. This prevents conflicts with existing and future HTML elements.
    -   **Good**: `MyComponent.vue`, `UserAvatar.vue`
    -   **Bad**: `Button.vue` (too generic, could conflict with HTML `<button>`), `Todo.vue`

-   **Casing in Templates**:
    -   **PascalCase**: Recommended in templates for better readability and consistency with JSX/TSX if used. Self-closing if they have no slot content.
        ```html
        <MyComponent />
        <UserProfileCard />
        ```
    -   **kebab-case**: Also supported in DOM templates (HTML files). Required if using in-DOM templates directly.
        ```html
        <my-component></my-component>
        <user-profile-card></user-profile-card>
        ```
    The Style Guide strongly recommends **PascalCase** for SFCs and string templates.

-   **Casing in JavaScript/TypeScript (Imports)**:
    -   Always use **PascalCase** when importing components.
    ```javascript
    import UserProfileCard from './components/UserProfileCard.vue';
    ```

-   **File Names**:
    -   **PascalCase.vue**: (e.g., `UserProfileCard.vue`) - Strongly recommended for consistency with import casing.
    -   **kebab-case.vue**: (e.g., `user-profile-card.vue`) - Also acceptable, especially if your file system is case-insensitive, but PascalCase is generally preferred.
    -   Be consistent within your project.

-   **Order of Words in Names**: Components with a narrow, specific scope should often be prefixed.
    -   Example: `SearchWidgetInput.vue`, `SearchWidgetResultsList.vue` (components specific to `SearchWidget`)

-   **Full-Word Names**: Component names should prefer full words over abbreviations.
    -   **Good**: `UserProfile.vue`
    -   **Bad**: `UProf.vue`

## Prop Names

-   **Declaration (JavaScript/TypeScript)**: Always use **camelCase**.
    ```typescript
    // <script setup lang="ts">
    defineProps({
      greetingText: String,
      isVisible: { type: Boolean, default: false }
    });
    // </script>

    // Options API
    // export default {
    //   props: {
    //     greetingText: String,
    //     isVisible: { type: Boolean, default: false }
    //   }
    // }
    ```

-   **Usage in Templates (HTML)**: Always use **kebab-case** when passing props in templates. Vue automatically converts kebab-case attributes to camelCase props.
    ```html
    <MyComponent greeting-text="Hello" :is-visible="true" />
    ```

## Event Names

-   **Emitting Events (JavaScript/TypeScript)**: Use **camelCase** for event names when emitting with `emit()`. However, Vue automatically converts camelCase event names to kebab-case for listeners in the template. The official recommendation is to use kebab-case directly for event names for consistency with native HTML events.
    ```typescript
    // <script setup>
    // const emit = defineEmits(['update:modelValue', 'formSubmitted']); // Kebab-case for listeners
    const emit = defineEmits(['update:modelValue', 'form-submitted']); // Preferred: directly use kebab-case

    // emit('formSubmitted', payload); // Emitting (Vue handles conversion if needed)
    emit('form-submitted', payload); // Emitting with kebab-case
    // </script>
    ```

-   **Listening to Events (Templates)**: Always use **kebab-case** for event names in templates (`v-on` or `@`).
    ```html
    <MyComponent @form-submitted="handleSubmit" @update:model-value="handleInput" />
    ```

## Variables and Functions (JavaScript/TypeScript)

-   **Convention**: `camelCase`.
    -   Local variables: `const itemCount = ref(0);`
    -   Function names: `function fetchData() { ... }`
    -   Methods (Options API): `incrementCount() { this.count++; }`
-   **Private Properties (Options API)**: While JavaScript doesn't have true private properties (pre-ES private fields), a common convention is to prefix "private" properties or methods with an underscore `_` if they are not meant to be part of the public API of the component (e.g., `_internalHelper()`). This is less relevant with `<script setup>` where everything is closed by default.

## Constants

-   **Convention**: `UPPER_SNAKE_CASE` for true constants whose values are fixed and known at compile time.
    ```javascript
    const MAX_USERS = 100;
    const API_BASE_URL = '/api/v1';
    ```
-   For configuration objects or other "constants" that are objects or arrays, `camelCase` (if internal) or `PascalCase` (if exported and part of a public API structure) might be used, often with `as const` in TypeScript for type safety.

## Store Modules, State, Getters, Actions, Mutations

### Pinia (Recommended for Vue 3)
-   **Store Definition (`defineStore`)**:
    -   ID (first argument): Unique string, often `camelCase` or `kebab-case`. The style guide suggests `camelCase` for the ID that gets used in `useMyStore()` hook.
        ```typescript
        // stores/userStore.ts
        import { defineStore } from 'pinia';
        export const useUserStore = defineStore('user', { /* ... */ }); // ID 'user'
        // or
        export const useCartStore = defineStore('cartStore', { /* ... */ }); // ID 'cartStore'
        ```
    -   Store variable name (from `useMyStore()`): `camelCase`.
        `const userStore = useUserStore();`
-   **State Properties**: `camelCase`.
    `state: () => ({ currentUser: null, itemsInCart: [] })`
-   **Getters**: `camelCase`.
    `getters: { isAuthenticated: (state) => !!state.currentUser }`
-   **Actions**: `camelCase`.
    `actions: { async loginUser(credentials) { /* ... */ } }`

### Vuex (Legacy, for Vue 2 or existing Vue 3 projects)
-   **State Properties**: `camelCase`.
-   **Getters**: `camelCase`.
-   **Mutations (type constants)**: `UPPER_SNAKE_CASE`.
    `export const SET_USER = 'SET_USER';`
-   **Mutations (handler functions)**: `camelCase` (often matching the type constant in lowercase or camelCase).
    `[SET_USER](state, user) { state.user = user; }`
-   **Actions (handler functions)**: `camelCase`.
-   **Module Names (if namespaced)**: `camelCase`.

## File and Directory Structure

-   **Single File Components**: `PascalCase.vue` or `kebab-case.vue` (PascalCase preferred).
-   **Composables**: `useFeatureName.js` or `useFeatureName.ts` (e.g., `useCounter.ts`, `useFetchData.ts`).
-   **Stores (Pinia)**: `featureNameStore.js` or `featureNameStore.ts` (e.g., `userStore.ts`, `cartStore.ts`) often in a `src/stores/` directory.
-   **Router**: `src/router/index.js` or `src/router/index.ts`.
-   **Views/Pages**: `PascalCaseView.vue` or `PascalCasePage.vue` (e.g., `HomeView.vue`, `UserProfilePage.vue`) often in `src/views/` or `src/pages/`.
-   **Layouts**: `PascalCaseLayout.vue` (e.g., `AppLayout.vue`, `DashboardLayout.vue`) often in `src/layouts/`.

By consistently applying these naming conventions, your Vue.js codebase in {projectPath} will be more organized, easier to understand, and more aligned with the broader Vue ecosystem.
```
