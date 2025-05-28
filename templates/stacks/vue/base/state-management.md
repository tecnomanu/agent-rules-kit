---
description: Overview of state management strategies in Vue.js, including Pinia, Vuex (legacy), and Composition API utilities.
globs: <root>/src/**/*.{vue,js,ts},<root>/src/store/**/*.js,<root>/src/stores/**/*.js
alwaysApply: true
---

# State Management in Vue.js Applications

Effective state management is crucial for building scalable and maintainable Vue.js applications in {projectPath}. Vue provides several ways to manage state, from local component state to sophisticated global solutions.

## When to Use Local vs. Global State

-   **Local Component State**:
    -   Use for data that is only relevant to a single component and its direct children (passed via props).
    -   Managed using `ref()` or `reactive()` within the component's `<script setup>` or `data()` option in Options API.
    -   **Example**: UI state like "is this dropdown open?", current input value of a form field before submission.

-   **Global State**:
    -   Needed when multiple components across different parts of your application tree need to share or react to the same data.
    -   Avoids excessive prop drilling (passing props through many intermediate components).
    -   Provides a single source of truth for shared application data.
    -   **Example**: Authenticated user information, shopping cart contents, application-wide theme or settings.

## 1. Pinia (Recommended for Vue 3)

Pinia is the current officially recommended state management library for Vue 3. It's lightweight, type-safe, and offers a simple API that integrates well with the Composition API.

-   **Stores**: State is organized into "stores." Each store holds a piece of the global state.
-   **State**: Defined as a function that returns an initial state object (similar to `data()` in components).
-   **Getters**: Equivalent to computed properties for stores. They derive state based on store state.
-   **Actions**: Equivalent to methods in components. They can be asynchronous and are used to mutate the state. Direct mutation of state (e.g., `store.count++`) is also possible and reactive.

```typescript
// src/stores/counterStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue'; // Can also use ref/computed directly in setup stores

// Option 1: Options Store (similar to Options API in components)
export const useCounterStoreWithOptions = defineStore('counterOptions', {
  state: () => ({
    count: 0,
    name: 'My Counter',
  }),
  getters: {
    doubleCount(state) {
      return state.count * 2;
    },
    doublePlusOne(): number { // Type can be explicitly defined
        return this.doubleCount + 1; // Access other getters via `this`
    }
  },
  actions: {
    increment(amount = 1) {
      this.count += amount; // Direct mutation
    },
    async fetchAndUpdate() {
      // const response = await fetch('/api/count');
      // const data = await response.json();
      // this.count = data.newCount;
    }
  }
});

// Option 2: Setup Store (using Composition API syntax)
export const useCounterStoreWithSetup = defineStore('counterSetup', () => {
  const count = ref(0);
  const name = ref('My Setup Counter');

  const doubleCount = computed(() => count.value * 2);
  const doublePlusOne = computed(() => doubleCount.value + 1);

  function increment(amount = 1) {
    count.value += amount;
  }

  async function fetchAndUpdate() {
    // ... async logic ...
  }

  return { count, name, doubleCount, doublePlusOne, increment, fetchAndUpdate };
});
```

**Using a Pinia Store in a Component:**
```vue
<template>
  <div>
    <p>{{ counter.name }}: {{ counter.count }} (Doubled: {{ counter.doubleCount }})</p>
    <button @click="counter.increment()">Increment</button>
  </div>
</template>

<script setup>
import { useCounterStoreWithOptions as useCounterStore } from '@/stores/counterStore'; // Or useCounterStoreWithSetup

const counter = useCounterStore();
</script>
```

## 2. Vuex (Legacy - Primarily for Vue 2 or Existing Vue 3 Projects)

Vuex was the official state management library for Vue 2. While it works with Vue 3, Pinia is now recommended for new projects. Vuex is more structured and opinionated, following the Flux pattern.

-   **State**: A single object containing the application's state.
-   **Getters**: Functions to compute derived state from store state (similar to computed properties).
-   **Mutations**: The *only* way to change state in Vuex. Mutations must be synchronous. They receive the state as the first argument.
-   **Actions**: Can contain asynchronous operations. They commit mutations to change state. Actions receive a context object with `commit`, `dispatch`, `state`, `getters`.
-   **Modules**: Allow splitting the store into smaller, namespaced modules.

```typescript
// src/store/index.ts (Vuex example)
import { createStore } from 'vuex';

// Mutation Types (optional but good practice)
const INCREMENT_COUNT = 'INCREMENT_COUNT';
const SET_USER = 'SET_USER';

export default createStore({
  state: {
    count: 0,
    user: null
  },
  getters: {
    doubleCount: state => state.count * 2,
    isAuthenticated: state => !!state.user
  },
  mutations: {
    [INCREMENT_COUNT](state, payload = 1) {
      state.count += payload;
    },
    [SET_USER](state, userPayload) {
      state.user = userPayload;
    }
  },
  actions: {
    incrementCount({ commit }, amount) {
      commit(INCREMENT_COUNT, amount);
    },
    async loginUser({ commit }, credentials) {
      // const user = await api.login(credentials); // Example API call
      // commit(SET_USER, user);
    },
    logoutUser({ commit }) {
      commit(SET_USER, null);
    }
  },
  modules: {
    // cart: cartModule, // Example of a separate module
  }
});
```

## 3. Composition API Utilities for State Sharing

For simpler state sharing scenarios, especially between a few related components or within a specific feature, Vue 3's Composition API provides utilities that can manage shared state without a full-blown state management library.

-   **`ref` / `reactive` in Composables**:
    You can create a reactive state within a composable function and export it. Components using this composable will share the same reactive instance if the composable is implemented as a singleton (i.e., created once and imported).
    ```typescript
    // src/composables/useSharedCounter.ts
    import { ref, readonly } from 'vue';

    // This state is created once when the module is first imported
    const count = ref(0);
    const increment = () => count.value++;

    export function useSharedCounter() {
      return {
        count: readonly(count), // Expose as readonly to prevent direct mutation from components
        increment
      };
    }
    ```
    This pattern is good for simple shared state but lacks the devtools and structure of Pinia/Vuex.

-   **`provide` / `inject`**:
    -   Allows an ancestor component to provide data/state that can be injected by any of its descendant components, regardless of how deeply nested they are.
    -   Can be used to provide reactive state (e.g., a `ref` or `computed` property).
    ```vue
    <!-- AncestorComponent.vue -->
    <script setup>
    import { provide, ref, readonly } from 'vue';
    const globalMessage = ref('This is a shared message');
    provide('globalMsg', readonly(globalMessage)); // Provide as readonly
    provide('updateGlobalMsg', (newMessage) => { globalMessage.value = newMessage; });
    </script>

    <!-- DescendantComponent.vue -->
    <script setup>
    import { inject } from 'vue';
    const message = inject('globalMsg');
    const updateMessage = inject('updateGlobalMsg');
    </script>
    <template>
      <p>{{ message }}</p>
      <button @click="updateMessage('Updated!')">Update Message</button>
    </template>
    ```
    -   While flexible, `provide`/`inject` can make it harder to trace where data comes from in very large applications compared to a centralized store.

## Choosing the Right Approach

-   **Local State (`ref`, `reactive` in component)**: For state strictly contained within one component.
-   **Composables with `ref`/`reactive`**: For sharing simple state logic between a few components.
-   **`provide`/`inject`**: For passing data down a component tree without prop drilling, especially for plugin-like functionalities or theming.
-   **Pinia**: Recommended for most applications needing global state management in Vue 3. Offers a good balance of simplicity, power, and excellent TypeScript support with Vue Devtools integration.
-   **Vuex**: If working on a Vue 2 project or a Vue 3 project already heavily invested in Vuex. For new Vue 3 projects, Pinia is preferred.

Consider the complexity, scale, and team familiarity when choosing a state management strategy for {projectPath}. Often, a combination might be used (e.g., Pinia for global state, local state for UI elements).
```
