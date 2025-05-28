---
description: Core architectural concepts for Vue.js applications, including component design, state management, routing, Options API vs. Composition API, and project structure.
globs: <root>/src/**/*.{vue,js,ts},<root>/{vite,vue}.config.{js,ts}
alwaysApply: true
---

# Vue.js Architecture Concepts

This document outlines the core architectural concepts and patterns used in Vue.js applications in {projectPath}.

## Component Architecture

Vue.js applications are built as a tree of reusable components.

### Vue Component Types

1.  **Base/UI Components (Presentational Components)**
    -   Lowest level reusable components focusing on presentation.
    -   Examples: Custom buttons (`BaseButton.vue`), form inputs (`BaseInput.vue`), cards, modals.
    -   Should be highly reusable, stateless (or with minimal UI state), and receive data via props, emitting events for interactions.
    -   Often found in a UI library or a dedicated `src/components/base/` or `src/components/ui/` directory.

2.  **Composite Components (Smart/Container Components - partial)**
    -   Composed of multiple base components and/or other composite components.
    -   Implement specific features or parts of features (e.g., `UserCard.vue`, `ProductList.vue`, `NavigationBar.vue`).
    -   May have internal state and logic related to their specific responsibility.
    -   Can emit events to parent components or interact with state management stores.

3.  **Page/View Components (Route-Level Components)**
    -   Top-level components typically rendered by Vue Router for a specific route.
    -   Organize the layout of a page by composing various composite and base components.
    -   Often responsible for fetching page-specific data and passing it down to child components.
    -   Handle page-level logic and state. Usually found in `src/views/` or `src/pages/`.

4.  **Layout Components**
    -   Define the overall structure of the application or sections of it (e.g., main layout with header, sidebar, footer).
    -   Often contain `<slot />` (default or named) for content projection from page components.
    -   Examples: `AppLayout.vue`, `DashboardLayout.vue`.

### Props Down, Events Up Pattern

This is the core data flow pattern in Vue, ensuring unidirectional data flow:

-   **Props Down**: Parent components pass data to child components via props. Props are one-way reactive bindings from parent to child.
-   **Events Up**: Child components communicate changes or actions back to their parent components by emitting custom events.

```vue
<!-- ParentComponent.vue -->
<template>
  <ChildComponent :message="parentMessage" @update-message="handleMessageUpdate" />
  <p>Message in parent: {{ parentMessage }}</p>
</template>

<script setup>
import { ref } from 'vue';
import ChildComponent from './ChildComponent.vue';

const parentMessage = ref('Hello from parent');

function handleMessageUpdate(newMessage) {
  parentMessage.value = newMessage;
}
</script>

<!-- ChildComponent.vue -->
<template>
  <div>
    <p>Received: {{ message }}</p>
    <button @click="sendMessageToParent">Update Parent's Message</button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  message: String
});

const emit = defineEmits(['update-message']);

function sendMessageToParent() {
  emit('update-message', 'Hello from child!');
}
</script>
```
This pattern makes component relationships explicit and data flow easier to trace.

## Options API vs. Composition API

Vue offers two main styles for writing component logic:

### Options API (Vue 2 and still available in Vue 3)
- Organizes component logic by options: `data()`, `methods`, `computed`, `watch`, `created`, `mounted`, etc.
- Logic related to a single feature can be spread across multiple options, which can be challenging in large components.
- Example structure:
  ```vue
  <script>
  export default {
    name: 'MyComponent', // Component name
    props: { /* ... */ },
    data() {
      return {
        message: 'Hello',
        count: 0
      };
    },
    computed: {
      doubledCount() {
        return this.count * 2;
      }
    },
    watch: {
      count(newVal, oldVal) { /* ... */ }
    },
    methods: {
      increment() {
        this.count++;
      },
      async fetchData() { /* ... */ }
    },
    mounted() {
      this.fetchData();
    }
    // ... other lifecycle hooks like created, updated, unmounted
  }
  </script>
  ```

### Composition API (Introduced in Vue 3)
- Allows organizing component logic by logical concern/feature rather than by option type.
- Uses reactive functions like `ref()`, `reactive()`, `computed()`, `watch()`, and lifecycle hooks directly within a `setup()` function (or the more concise `<script setup>`).
- Promotes reusability through "Composables" (standalone reactive functions).
- Offers better TypeScript inference and integration.
- Can be used alongside the Options API in Vue 3, but `<script setup>` encourages a full Composition API approach.

**Why Composition API?**
- **Better Logic Organization**: Code related to the same logical concern can be grouped together, making components easier to read and maintain, especially as they grow.
- **Improved Reusability**: Logic can be extracted into composable functions and reused across multiple components without mixins (which have drawbacks like namespace collisions and unclear origins of properties).
- **Enhanced Type Inference**: More robust and easier to type with TypeScript.
- **Smaller Production Bundles**: More tree-shakable, as only the imported functions are bundled.

While Vue 3 supports both, the **Composition API with `<script setup>` is the recommended approach for new Vue 3 projects** due to its benefits in organization, reusability, and type safety. The Options API remains available for existing Vue 2 codebases and simpler components if preferred.

```vue
<!-- Component using Composition API with <script setup> -->
<template>
  <p>Count: {{ count }}</p>
  <p>Doubled: {{ doubledCount }}</p>
  <button @click="increment">Increment</button>
</template>

<script setup lang="ts"> // lang="ts" for TypeScript
import { ref, computed, onMounted, watch } from 'vue';

// Props (if any)
// interface Props { title?: string }
// const props = defineProps<Props>();

// Reactive state
const count = ref(0);

// Computed property
const doubledCount = computed(() => count.value * 2);

// Methods
function increment() {
  count.value++;
}

async function fetchData() {
  // const response = await fetch('/api/data');
  // data.value = await response.json();
}

// Watcher
watch(count, (newVal, oldVal) => {
  console.log(`Count changed from ${oldVal} to ${newVal}`);
});

// Lifecycle hook
onMounted(() => {
  fetchData();
  console.log('Component mounted!');
});
</script>
```

## State Management Patterns

(Covered in detail in `state-management.md`. This section provides a brief overview.)

-   **Component Local State**: Using `ref()` or `reactive()` for state confined to a single component or a small component subtree (passed via props).
-   **Composition API for Cross-Component State (`provide`/`inject`)**: Suitable for sharing state within a component subtree without prop drilling.
-   **Global State Management (Pinia)**: The officially recommended library for centralized state management in Vue 3. Provides stores, state, getters, actions, and excellent TypeScript support.
-   **Vuex (Legacy)**: The state management solution for Vue 2, still usable in Vue 3 but Pinia is preferred for new projects.

## Project Organization

(Covered in detail in `naming-conventions.md` for file names, and here for structure.)

A common structure for Vue projects (especially with Vite):

```
{projectPath}/
├── public/                 # Static assets that are copied directly to the build root
├── src/
│   ├── assets/             # Static assets processed by Vite (e.g., images, fonts)
│   ├── components/         # Reusable global/UI components
│   │   ├── base/           # Base UI components (BaseButton.vue)
│   │   └── common/         # More complex shared components (UserAvatar.vue)
│   ├── views/              # Route-level components (pages) (e.g., HomeView.vue, AboutView.vue)
│   │   └── HomeView.vue
│   ├── layouts/            # Layout components (e.g., AppLayout.vue, AuthLayout.vue)
│   ├── router/             # Vue Router configuration (index.ts)
│   ├── stores/             # Pinia stores (e.g., userStore.ts)
│   ├── composables/        # Reusable Composition API functions (e.g., useCounter.ts)
│   ├── services/           # API service clients, other external services
│   │   └── apiService.ts
│   ├── styles/             # Global styles, variables, mixins (e.g., main.scss)
│   ├── App.vue             # Root Vue component
│   └── main.ts             # Application entry point (initializes Vue app, router, Pinia)
├── index.html              # Main HTML file
├── vite.config.ts          # Vite configuration
├── vue.config.js           # Vue CLI configuration (if using Vue CLI)
├── tsconfig.json           # TypeScript configuration
└── package.json
```
Organizing by feature (e.g., `src/features/auth/components/`, `src/features/auth/stores/`) is also a popular and scalable approach, especially for larger applications.

## Routing Architecture

(Covered by Vue Router, typically configured in `src/router/index.ts` or a similar file.)
-   **Vue Router**: The official library for client-side routing in Vue applications.
-   **Routes Definition**: Define paths, corresponding components, nested routes, and dynamic segments.
-   **Navigation Guards**: Implement global, per-route, or in-component guards for controlling access to routes (e.g., for authentication).
-   **Lazy Loading**: Import route components dynamically (`component: () => import('@/views/AboutView.vue')`) to split code into smaller chunks and improve initial load time.

## API Integration Patterns

-   **Dedicated API Service Modules**: Centralize API calls in dedicated files (e.g., `src/services/userService.ts`). These modules can use `axios`, `fetch`, or other HTTP clients.
-   **Composables for API Calls**: Wrap API calls and related state (loading, error, data) within composable functions for easy reuse in components.
    ```typescript
    // src/composables/useFetchData.ts
    import { ref } from 'vue';

    export function useFetchData<T>(url: string) {
      const data = ref<T | null>(null);
      const error = ref<Error | null>(null);
      const isLoading = ref(false);

      const fetchData = async () => {
        isLoading.value = true;
        error.value = null;
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          data.value = await response.json();
        } catch (e: any) {
          error.value = e;
        } finally {
          isLoading.value = false;
        }
      };
      return { data, error, isLoading, fetchData };
    }
    ```

Understanding these architectural concepts will help in building well-structured, maintainable, and scalable Vue.js applications in {projectPath}.
```
