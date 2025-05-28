---
description: Best practices for developing robust, performant, and maintainable Vue.js applications.
globs: <root>/src/**/*.{vue,js,ts}
alwaysApply: true
---

# Vue.js Best Practices

This guide outlines best practices for developing robust, performant, and maintainable Vue.js applications in {projectPath}.

## Reactivity Best Practices

Understanding Vue's reactivity system is fundamental.

-   **`ref` vs. `reactive` (Composition API)**:
    -   Use `ref()` for primitive values (string, number, boolean) and for single object/array references where you might replace the entire object/array.
        ```typescript
        import { ref } from 'vue';
        const count = ref(0);
        const user = ref({ name: 'Alice' });
        user.value = { name: 'Bob' }; // Replace entire object
        ```
    -   Use `reactive()` for objects where you intend to reactively mutate its properties. `reactive()` returns a proxy of the object.
        ```typescript
        import { reactive } from 'vue';
        const state = reactive({
          isLoading: false,
          data: [],
          user: { name: 'Charlie' }
        });
        state.user.name = 'David'; // Mutate property
        ```
    -   Be consistent. Generally, `ref` is more versatile as it can hold any value type and its `.value` reassignment is clear.
-   **Computed Properties (`computed`)**:
    -   Use for deriving state based on other reactive data. They are cached based on their reactive dependencies.
    -   Prefer computed properties over complex expressions in templates for readability and performance.
    ```vue
    <script setup>
    import { ref, computed } from 'vue';
    const firstName = ref('John');
    const lastName = ref('Doe');
    const fullName = computed(() => `${firstName.value} ${lastName.value}`);
    </script>
    ```
-   **Watchers (`watch`, `watchEffect`)**:
    -   Use `watch` to perform side effects in response to specific data changes. You can watch one or more reactive sources.
        ```typescript
        watch(searchTerm, async (newTerm) => {
          if (newTerm.length > 2) await fetchData(newTerm);
        });
        ```
    -   Use `watchEffect` when you want to reactively run a side effect that depends on multiple reactive sources, without explicitly listing them. It runs immediately and re-runs when any dependency changes.
        ```typescript
        watchEffect(() => {
          console.log(`User ID: ${userId.value}, Page: ${currentPage.value}`);
          // This effect re-runs if userId or currentPage changes
        });
        ```
    -   Clean up watchers automatically in `<script setup>`. If using `setup()` function, ensure cleanup if the watcher is created conditionally or within `onMounted`.

## Component Communication

-   **Props Down, Events Up (Unidirectional Data Flow)**: This is the standard.
    -   Parents pass data to children via `props`.
    -   Children communicate with parents by emitting `events`.
    -   Props should generally be treated as immutable within the child component. If a child needs to modify a prop's value, it should emit an event to the parent to request the change.
-   **`defineProps` and `defineEmits` (`<script setup>`)**:
    ```vue
    <script setup lang="ts">
    interface Props { name: string; age?: number; }
    const props = defineProps<Props>();

    const emit = defineEmits(['profileUpdated', 'userDeleted']);

    function handleUpdate() {
      emit('profileUpdated', { ...props.name, status: 'active' });
    }
    </script>
    ```
-   **`provide` / `inject` (Composition API)**:
    -   Use for passing data through a deep component hierarchy without prop drilling.
    -   `provide` makes data available to all descendant components.
    -   `inject` allows a descendant component to access data provided by an ancestor.
    -   Useful for theming, user authentication status, or global configuration.
    -   Can provide reactive data (e.g., a `ref` or `computed` property).
    ```vue
    // AncestorComponent.vue
    <script setup>
    import { provide, ref } from 'vue';
    const theme = ref('light');
    provide('app-theme', theme);
    </script>

    // DescendantComponent.vue
    <script setup>
    import { inject } from 'vue';
    const theme = inject('app-theme', 'default-theme'); // Second arg is default value
    </script>
    ```

## Slots for Content Distribution

Slots allow you to create flexible and reusable components by passing markup from the parent into designated areas of the child component.
-   **Default Slot**:
    ```vue
    <!-- ChildComponent.vue -->
    <template>
      <div><slot>Default content if nothing is passed</slot></div>
    </template>
    ```
-   **Named Slots**: For multiple content injection points.
    ```vue
    <!-- CardLayout.vue -->
    <template>
      <header><slot name="header"></slot></header>
      <main><slot></slot></main> <!-- Default slot -->
      <footer><slot name="footer"></slot></footer>
    </template>
    ```
-   **Scoped Slots**: Allow child components to pass data back to the parent for the slot content.
    ```vue
    <!-- ItemList.vue (Child) -->
    <template>
      <ul>
        <li v-for="item in items" :key="item.id">
          <slot name="item" :item-data="item" :index="item.id">
            <!-- Fallback content -->
            {{ item.text }}
          </slot>
        </li>
      </ul>
    </template>
    <script setup> defineProps(['items']); </script>

    <!-- Parent.vue -->
    <ItemList :items="myItems">
      <template #item="{ itemData, index }"> <!-- Destructure slot props -->
        <strong>{{ index }}:</strong> {{ itemData.name.toUpperCase() }}
      </template>
    </ItemList>
    ```

## Lifecycle Hooks

Understand and use lifecycle hooks for performing actions at specific stages of a component's life.
-   **Composition API (`<script setup>`)**: `onMounted`, `onUpdated`, `onUnmounted`, `onBeforeMount`, `onBeforeUpdate`, `onBeforeUnmount`, `onErrorCaptured`, `onRenderTracked`, `onRenderTriggered`.
    ```vue
    <script setup>
    import { onMounted, onUnmounted } from 'vue';
    let intervalId;
    onMounted(() => {
      console.log('Component is mounted!');
      // intervalId = setInterval(...);
    });
    onUnmounted(() => {
      console.log('Component is about to be unmounted!');
      // clearInterval(intervalId);
    });
    </script>
    ```
-   **Options API Equivalents**: `created`, `mounted`, `updated`, `unmounted` (Vue 3) or `beforeDestroy`/`destroyed` (Vue 2), `errorCaptured`.

## Performance Optimization

-   **`v-memo`**: Memoize parts of your template. It will only re-render if the specified reactive dependencies change.
    ```vue
    <div v-memo="[item.id, isSelected]">
      <p>{{ item.name }}</p>
      <!-- Complex rendering based on item and isSelected -->
    </div>
    ```
-   **`v-once`**: Render an element and its children once. Subsequent updates are skipped. Useful for purely static content.
-   **Virtual Scrolling**: For long lists, use libraries like `vue-virtual-scroller` or `tanstack-virtual` to render only visible items, significantly improving performance.
-   **Lazy Loading Components (Async Components)**: Load components only when they are needed, typically for routes or conditional rendering.
    ```typescript
    // In router configuration or component script
    import { defineAsyncComponent } from 'vue';
    const AdminDashboard = defineAsyncComponent(() => import('./components/AdminDashboard.vue'));
    ```
-   **Optimize `v-for`**: Always use a unique `:key` attribute. Avoid using `v-if` on the same element as `v-for` if possible; filter the source data instead.
-   **Computed Properties for Performance**: Vue caches computed properties based on their reactive dependencies. Use them for expensive calculations.
-   **Keep Components Small**: Break down large components into smaller, more manageable ones.

## Security Considerations

-   **XSS Prevention**: Vue escapes text content by default (e.g., `{{ myData }}`). Be extremely cautious when using `v-html`.
    -   **Never use `v-html` with user-provided content directly.**
    -   If you must use `v-html`, ensure the HTML is sanitized on the server-side using a robust library like DOMPurify before sending it to the client, or that it comes from a fully trusted source.
-   **Dynamic `v-bind:href`**: When binding URLs, ensure they are sanitized or come from trusted sources to prevent XSS via `javascript:` URLs.
-   **Server-Side Validation**: Always validate data on the server, even if client-side validation is present.
-   **Avoid Global Event Bus for Sensitive Data**: While Vue 2 used event buses, be careful with this pattern for sensitive data as it can be hard to track. Prefer `provide`/`inject` or stores for cross-component communication.

## Code Organization within Components

-   **`<script setup>` for Simplicity**: Prefer `<script setup>` for Composition API for more concise and readable component logic.
-   **Composables**: Extract reusable stateful logic into composable functions (`src/composables/`).
    ```typescript
    // src/composables/useMousePosition.ts
    import { ref, onMounted, onUnmounted } from 'vue';
    export function useMousePosition() {
      const x = ref(0);
      const y = ref(0);
      function update(event) { x.value = event.pageX; y.value = event.pageY; }
      onMounted(() => window.addEventListener('mousemove', update));
      onUnmounted(() => window.removeEventListener('mousemove', update));
      return { x, y };
    }
    ```
-   **Keep Templates Clean**: Avoid overly complex expressions in templates. Move logic into computed properties or methods/functions.
-   **Single File Components (`.vue` files)**: Leverage SFCs to co-locate template, script, and styles for a component.

By following these best practices, your Vue.js applications in {projectPath} will be more robust, performant, and easier for your team to work with.
```
