---
description: Implementation guide for Vue 3 applications, highlighting Composition API, Pinia, <script setup>, Teleport, Suspense, and other v3 features.
globs: <root>/src/**/*.{vue,js,ts} # General glob
alwaysApply: true # Applies if v3 is detected
---

# Vue 3 Implementation Guide

This guide provides implementation details and common patterns specific to Vue 3 applications, relevant for {projectPath}. Vue 3 introduces the **Composition API** as a flexible way to organize component logic, alongside significant performance improvements and new features.

## Core Concepts of Vue 3

### Composition API

The Composition API is a set of APIs that allows the authoring of Vue components using imported functions instead of declaring options. It offers:
-   Better logic organization and reuse (through "Composables").
-   Improved TypeScript support.
-   More flexible code structure.

-   **`setup()` function**: The entry point for using the Composition API within a component (when not using `<script setup>`). It's executed before the component instance is created.
    ```javascript
    // Options API component with setup() method
    export default {
      props: { /* ... */ },
      setup(props, context) { // context exposes { attrs, slots, emit, expose }
        // reactive state, computed properties, watchers, lifecycle hooks
        const count = ref(0);
        const increment = () => count.value++;
        onMounted(() => console.log('Component mounted from setup!'));
        return { count, increment }; // Expose to template
      }
    }
    ```

-   **`<script setup>`**: A compile-time syntactic sugar for using Composition API in Single File Components (SFCs). It's more concise and is the recommended way for new Vue 3 projects.
    ```vue
    <script setup lang="ts"> // lang="ts" for TypeScript
    import { ref, computed, onMounted } from 'vue';

    // Props
    interface Props { message?: string; }
    const props = defineProps<Props>();

    // Emits
    const emit = defineEmits(['response']);

    // Reactive state
    const count = ref(0);
    const messageToDisplay = ref(props.message || 'Default message');

    // Computed property
    const doubledCount = computed(() => count.value * 2);

    // Method
    function increment() {
      count.value++;
      emit('response', `Count is now ${count.value}`);
    }

    // Lifecycle hook
    onMounted(() => {
      console.log('Component mounted with script setup!');
    });
    </script>
    ```
    Variables and functions declared in `<script setup>` are directly available in the template. Components imported are also directly usable.

-   **Reactivity Primitives**:
    -   `ref()`: Creates a reactive reference for any value type (primitives, objects, arrays). Access/modify value via `.value`.
    -   `reactive()`: Creates a reactive proxy for objects (including arrays and Maps/Sets).
    -   `computed()`: Creates a reactive computed property that tracks its dependencies.
    -   `watch()`: Watches one or more reactive sources and runs a callback function when sources change.
    -   `watchEffect()`: Runs a function immediately and re-runs it reactively whenever its dependencies change.

-   **Lifecycle Hooks (Composition API)**: Imported directly.
    -   `onMounted`, `onUpdated`, `onUnmounted`
    -   `onBeforeMount`, `onBeforeUpdate`, `onBeforeUnmount`
    -   `onErrorCaptured`, `onRenderTracked`, `onRenderTriggered`, `onActivated`, `onDeactivated` (for `<KeepAlive>`)
    -   `onServerPrefetch` (SSR only)

### Composables
Reusable stateful logic encapsulated in functions.
```typescript
// src/composables/useMouseTracker.ts
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouseTracker() {
  const x = ref(0);
  const y = ref(0);

  function update(event: MouseEvent) {
    x.value = event.pageX;
    y.value = event.pageY;
  }

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}

// Using in a component:
// import { useMouseTracker } from '@/composables/useMouseTracker';
// const { x, y } = useMouseTracker();
```

## State Management with Pinia

Pinia is the official state management library for Vue 3, offering a simple, type-safe, and extensible store. (See `state-management.md` for a general overview).

**Defining a Pinia Store:**
```typescript
// src/stores/userStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref(null);
  const isLoading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!currentUser.value);

  // Actions
  async function login(credentials: {email: string, pass: string}) {
    isLoading.value = true;
    try {
      // const user = await api.login(credentials);
      // currentUser.value = user;
    } catch (error) {
      // console.error(error);
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    currentUser.value = null;
  }

  return { currentUser, isLoading, isAuthenticated, login, logout };
});
```

## New Components and Features

### `<Teleport>`
Teleports a part of a component's template to a DOM node that exists outside the DOM hierarchy of this component. Useful for modals, notifications, or popovers that need to break out of their parent's styling or positioning context.
```vue
<template>
  <button @click="showModal = true">Show Modal</button>
  <Teleport to="body"> <!-- Teleports to the end of <body> -->
    <div v-if="showModal" class="modal">
      <p>I'm a modal!</p>
      <button @click="showModal = false">Close</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';
const showModal = ref(false);
</script>

<style scoped>
.modal { /* ... styles ... */ }
</style>
```

### `<Suspense>`
Allows orchestrating asynchronous dependencies in a component tree. It can render fallback content until all async dependencies in its default slot are resolved.
- **Default Slot**: For the main content that might depend on async setup.
- **Fallback Slot**: Content to show while the default slot is resolving.

```vue
<template>
  <Suspense>
    <!-- Component with async setup -->
    <template #default>
      <UserProfile />
    </template>
    <!-- Loading state -->
    <template #fallback>
      <div>Loading profile...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
// UserProfile component might have an async setup() or use top-level await in <script setup>
const UserProfile = defineAsyncComponent(() => import('./UserProfile.vue'));
</script>
```
`Suspense` is particularly useful with components that use `async setup()` or top-level `await` in `<script setup>`.

### Fragments
Vue 3 components can now have multiple root nodes (fragments). You no longer need a single root `<div>` in your component templates.
```vue
<template>
  <h2>Fragment Title</h2>
  <p>Fragment paragraph one.</p>
  <p>Fragment paragraph two.</p>
</template>
<!-- This is valid in Vue 3 -->
```

### Emitting Multiple Events (`defineEmits`)
Components can declare the events they emit, providing better explicitness and type safety with TypeScript.
```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update', value: string): void;
  (e: 'submit', payload: { data: any }): void;
}>();

emit('update', 'new value');
</script>
```

## Custom Directives API Changes
The API for custom directives changed slightly from Vue 2 to align with the component lifecycle.
```javascript
// src/directives/vHighlight.ts
import type { Directive, DirectiveBinding } from 'vue';

interface HighlightBinding extends DirectiveBinding {
  value: string; // Color
  arg?: 'background' | 'text'; // e.g., v-highlight:background="'yellow'"
  modifiers?: { blink: boolean }; // e.g., v-highlight.blink
}

export const vHighlight: Directive<HTMLElement, HighlightBinding['value']> = {
  // Called before the element's parent component is mounted
  beforeMount(el, binding: HighlightBinding) {
    el.style.backgroundColor = binding.value || 'yellow'; // Default to yellow
    if (binding.arg === 'text') {
        el.style.color = binding.value;
        el.style.backgroundColor = 'transparent';
    }
  },
  // Called when the bound value changes
  updated(el, binding: HighlightBinding) {
    el.style.backgroundColor = binding.value || 'yellow';
     if (binding.arg === 'text') {
        el.style.color = binding.value;
        el.style.backgroundColor = 'transparent';
    }
  },
  // Called after the element’s parent component and all of its children have been unmounted
  unmounted(el) {
    // Cleanup logic if needed
  }
};

// Registering globally in main.ts
// import { vHighlight } from './directives/vHighlight';
// const app = createApp(App);
// app.directive('highlight', vHighlight);
// app.mount('#app');

// Usage in template: <p v-highlight="'lightblue'">Highlight me!</p>
// <p v-highlight:text="'red'">Red text</p>
```

## Vue Router v4 (for Vue 3)
Vue Router for Vue 3 (version 4) has some API changes compared to Vue Router for Vue 2.
- **History Mode**: `createWebHistory()` (for HTML5 history mode), `createWebHashHistory()`, `createMemoryHistory()`.
- **Router Instance**: Created with `createRouter`.
- **Dynamic Route Matching**: Syntax remains similar (e.g., `/users/:id`).
- **Navigation Guards**: API is largely similar but uses Promise-based returns or `next(false)` / `next({ path: '/login' })` more consistently.
- **Composition API Integration**: Provides composables like `useRouter()`, `useRoute()`.

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Home', component: HomeView },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  // ... other routes
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Vite specific base URL
  routes
});

// Example navigation guard
router.beforeEach((to, from, next) => {
  // const authStore = useAuthStore(); // If using Pinia
  // if (to.meta.requiresAuth && !authStore.isAuthenticated) {
  //   next({ name: 'Login' });
  // } else {
  //   next();
  // }
  next(); // Proceed by default
});

export default router;
```

## Performance Improvements
Vue 3 is significantly more performant than Vue 2 due to:
-   **Faster Virtual DOM**: Rewritten VDOM for more efficient updates.
-   **Optimized Compiler**: Generates more optimized render functions.
-   **Tree-shaking**: More parts of Vue are tree-shakable, leading to smaller bundle sizes if features are not used.
-   **Composition API Benefits**: Can lead to more efficient code organization and less overhead than mixins or some Options API patterns.

This guide covers key implementation aspects of Vue 3. For {projectPath}, leveraging `<script setup>`, Pinia, and the Composition API is generally recommended for a modern and efficient development experience.
```
