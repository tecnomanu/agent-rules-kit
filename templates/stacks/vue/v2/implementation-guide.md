---
description: Implementation guide for Vue 2 applications, focusing on Options API, Vuex, event bus, mixins, and filters.
globs: <root>/src/**/*.{vue,js,ts} # General glob
alwaysApply: true # Applies if v2 is detected
---

# Vue 2 Implementation Guide

This guide provides implementation details and common patterns specific to Vue 2 applications, relevant for projects like {projectPath} if using this version. Vue 2 primarily uses the **Options API**.

## Core Concepts of Vue 2

### Options API

Components in Vue 2 are constructed using an object of options:

-   **`data()`**: A function that returns an object containing the component's reactive state.
    ```javascript
    export default {
      data() {
        return {
          message: 'Hello Vue 2!',
          count: 0
        };
      }
    }
    ```
-   **`props`**: Defines properties passed from parent components.
    ```javascript
    export default {
      props: {
        title: String,
        items: {
          type: Array,
          default: () => []
        }
      }
    }
    ```
-   **`methods`**: Functions that mutate state or perform actions. `this` inside methods refers to the component instance.
    ```javascript
    export default {
      data() { return { count: 0 }; },
      methods: {
        increment() {
          this.count++;
        }
      }
    }
    ```
-   **`computed`**: Derived state based on other reactive data. Computed properties are cached and only re-evaluate when their dependencies change.
    ```javascript
    export default {
      data() { return { firstName: 'John', lastName: 'Doe' }; },
      computed: {
        fullName() {
          return `${this.firstName} ${this.lastName}`;
        }
      }
    }
    ```
-   **`watch`**: Observe changes in data properties and perform actions in response.
    ```javascript
    export default {
      data() { return { query: '' }; },
      watch: {
        query(newQuery, oldQuery) {
          console.log(`Query changed from ${oldQuery} to ${newQuery}`);
          this.search();
        }
      },
      methods: { search() { /* ... */ } }
    }
    ```
-   **Lifecycle Hooks**: Functions that execute at specific stages of a component's lifecycle.
    -   `beforeCreate()`
    -   `created()`: Component instance created, data observation set up. Good for initial data fetching that doesn't rely on DOM.
    -   `beforeMount()`
    -   `mounted()`: Component is inserted into the DOM. Good for DOM manipulations or integrating third-party libraries.
    -   `beforeUpdate()`
    -   `updated()`: Component re-rendered due to data changes.
    -   `beforeDestroy()` (renamed to `beforeUnmount` in Vue 3): Cleanup tasks (e.g., remove event listeners, clear timers).
    -   `destroyed()` (renamed to `unmounted` in Vue 3).
    ```javascript
    export default {
      mounted() {
        console.log('Component has been mounted!');
        // window.addEventListener('resize', this.handleResize);
      },
      beforeDestroy() {
        console.log('Component will be destroyed.');
        // window.removeEventListener('resize', this.handleResize);
      }
    }
    ```

### Directives

Vue 2 uses directives to apply special reactive behavior to the DOM.
-   **`v-if`, `v-else-if`, `v-else`**: Conditional rendering.
-   **`v-for`**: List rendering. Requires a `:key`.
    ```html
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
    ```
-   **`v-bind` (or `:`)**: Dynamically bind one or more attributes, or a component prop to an expression.
    ```html
    <img :src="imageUrl" :alt="imageAltText">
    <MyComponent :user-data="user" />
    ```
-   **`v-on` (or `@`)**: Attach event listeners that invoke methods on the component instance.
    ```html
    <button @click="incrementCount">Increment</button>
    ```
-   **`v-model`**: Create two-way data bindings on form inputs, components.
    ```html
    <input type="text" v-model="message">
    ```
-   **`v-show`**: Conditional display (toggles `display: none` CSS property).
-   **`v-text`**, **`v-html`**: For binding text content or raw HTML (use `v-html` with caution due to XSS risks).

## State Management with Vuex

Vuex is the official state management library for Vue 2. It serves as a centralized store for all the components in an application.

-   **State**: A single object containing the application's global reactive data.
-   **Getters**: Compute derived state from store state (like computed properties for components).
    `getters: { doubleCount: state => state.count * 2 }`
-   **Mutations**: Synchronous functions that are the *only* way to actually change state in Vuex.
    `mutations: { INCREMENT(state, payload = 1) { state.count += payload; } }`
-   **Actions**: Can contain asynchronous operations. They commit mutations to change state.
    `actions: { async fetchData({ commit }) { const data = await api.fetch(); commit('SET_DATA', data); } }`
-   **Modules**: Allow splitting the store into smaller, namespaced modules for better organization.

**Example Vuex Store Setup:**
```javascript
// src/store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    todos: []
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    ADD_TODO(state, todo) {
      state.todos.push(todo);
    }
  },
  actions: {
    async login({ commit }, credentials) {
      // const user = await authApi.login(credentials);
      // commit('SET_USER', user);
    },
    addTodoItem({ commit }, todoText) {
      const newTodo = { id: Date.now(), text: todoText, completed: false };
      commit('ADD_TODO', newTodo);
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    pendingTodos: state => state.todos.filter(todo => !todo.completed)
  }
});
```

## Event Bus for Non-Parent-Child Communication

For communication between components that do not have a direct parent-child relationship (and where Vuex might be overkill), a simple event bus can be used. This is typically a new Vue instance.

```javascript
// src/event-bus.js
import Vue from 'vue';
export const EventBus = new Vue();

// Emitting an event
// EventBus.$emit('custom-event', payload);

// Listening to an event
// EventBus.$on('custom-event', (payload) => { /* handle event */ });

// Important: Remember to clean up listeners in beforeDestroy
// EventBus.$off('custom-event', this.myEventHandler);
```
While simple, event buses can make data flow harder to track in larger applications. Vuex or Pinia (if migrating parts to Vue 3 patterns) are generally preferred for more complex state sharing.

## Mixins

Mixins are a flexible way to distribute reusable functionalities for Vue components. A mixin object can contain any component options. When a component uses a mixin, all options in the mixin will be "mixed" into the component's own options.

```javascript
// src/mixins/myMixin.js
export const myMixin = {
  data() {
    return {
      mixinMessage: 'Hello from mixin!'
    };
  },
  created() {
    console.log('Mixin created hook called');
  },
  methods: {
    logMixinMessage() {
      console.log(this.mixinMessage);
    }
  }
};

// Using the mixin in a component
// import { myMixin } from './myMixin';
// export default {
//   mixins: [myMixin],
//   mounted() {
//     this.logMixinMessage(); // Access mixin method
//   }
// }
```
**Drawbacks of Mixins**:
-   Can lead to property name collisions if multiple mixins define the same property.
-   Source of data can be unclear (is this property from the component or a mixin?).
-   Makes components harder to reason about and refactor.
The Composition API in Vue 3 was introduced partly to address these drawbacks by providing a more explicit and flexible way to reuse logic (composables).

## Filters

Filters are used for common text formatting. They can be used in two places: mustache interpolations and `v-bind` expressions. Filters should be appended to the end of the JavaScript expression, denoted by the "pipe" symbol.

```javascript
// src/filters.js
Vue.filter('capitalize', function (value) {
  if (!value) return '';
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
});

// In main.js
// import './filters'; // To register global filters

// In a template
// <p>{{ message | capitalize }}</p>
```
Filters were removed in Vue 3. The recommended alternative is to use methods or computed properties.

## Vue Router (for Vue 2)

Vue Router is the official router for Vue.js.

```javascript
// src/router/index.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
// import About from '../views/About.vue'; // Example

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // Lazy load component
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
];

const router = new VueRouter({
  mode: 'history', // Or 'hash'
  base: process.env.BASE_URL,
  routes
});

export default router;
```
Navigation guards (`beforeEach`, `beforeResolve`, `afterEach`, and per-route guards) are used for controlling navigation, e.g., for authentication checks.

This guide covers the foundational aspects of Vue 2 development. For new projects, Vue 3 with Composition API and Pinia is the recommended path.
```
