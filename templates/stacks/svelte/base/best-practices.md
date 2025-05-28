---
description: Best practices for developing Svelte applications.
globs: <root>/src/**/*.{svelte,js,ts}
alwaysApply: true
---

# Svelte Best Practices

This guide outlines best practices for developing robust, maintainable, and performant Svelte applications in {projectPath}.

## Effective Use of Reactivity

Svelte's reactivity system is powerful and intuitive. Leverage it effectively:

-   **Assignments for Reactivity**: Remember that assignments (`=`) are what trigger reactivity for top-level component variables. Mutating objects or arrays directly (e.g., `myArray.push(item)`) won't trigger updates unless you reassign the variable (e.g., `myArray = myArray`).
    ```svelte
    <script>
      let items = [];
      function addItem() {
        // items.push({ id: Date.now(), text: 'New Item' }); // This won't trigger update alone
        items = [...items, { id: Date.now(), text: 'New Item' }]; // Correct way
      }
    </script>
    ```
-   **Reactive Statements (`$:`)**: Use `$: label` for:
    -   **Computed Properties**: Values that depend on other reactive variables.
        ```svelte
        <script>
          let count = 0;
          $: doubled = count * 2;
        </script>
        <p>{count} * 2 = {doubled}</p>
        ```
    -   **Side Effects**: Running code when specific variables change.
        ```svelte
        <script>
          export let title;
          $: if (typeof document !== 'undefined') { // Ensure document exists (client-side)
            document.title = title;
          }
        </script>
        ```
    -   Be mindful of the dependencies of reactive statements. They re-run whenever any variable they reference changes.

-   **Svelte 5 Runes (`$state`, `$derived`, `$effect`)**: If using Svelte 5, embrace Runes for more explicit state management:
    -   `$state()`: For declaring reactive state.
        `let count = $state(0);`
    -   `$derived()`: For creating computed values.
        `let doubled = $derived(count * 2);`
    -   `$effect()`: For running side effects when dependencies change. This is the preferred way to handle side effects over `$:` for better control and clarity, especially regarding cleanup.
        ```svelte
        <script>
          let count = $state(0);
          $effect(() => {
            console.log(`The count is: ${count}`);
            // Optional cleanup function
            return () => {
              console.log('Effect cleanup for count');
            };
          });
        </script>
        ```

## Passing Props

-   **Clarity**: Pass data down from parent to child components via props.
-   **Default Values**: Provide default values for props if they are optional.
    ```svelte
    <script lang="ts">
      export let name: string = 'Guest';
      export let score: number = 0;
    </script>
    ```
-   **Spread Props (`{...$$props}` or specific spreads)**: Use sparingly. While `$$props` can pass all current props to a child, it can make data flow less explicit. Spreading specific objects is usually fine.
    ```svelte
    <!-- Child.svelte -->
    <script>
      export let id;
      export let text;
    </script>
    <p>{id}: {text}</p>

    <!-- Parent.svelte -->
    <script>
      import Child from './Child.svelte';
      const item = { id: 1, text: 'Hello' };
    </script>
    <Child {...item} />
    ```

## Component Events (`createEventDispatcher`)

Components should communicate upwards to parents using events.

-   **Dispatch Events**: Use `createEventDispatcher` to send messages or data to parent components.
    ```svelte
    <!-- ChildButton.svelte -->
    <script>
      import { createEventDispatcher } from 'svelte';
      const dispatch = createEventDispatcher();

      function handleClick() {
        dispatch('notify', { message: 'Button was clicked!' }); // 'notify' is the event name
      }
    </script>
    <button on:click={handleClick}>Notify Parent</button>

    <!-- Parent.svelte -->
    <script>
      import ChildButton from './ChildButton.svelte';
      function handleNotification(event) {
        console.log(event.detail.message); // Logs "Button was clicked!"
      }
    </script>
    <ChildButton on:notify={handleNotification} />
    ```
-   **Event Naming**: Use lowercase event names.

## Using Slots for Composition

Slots allow you to create flexible and reusable components by passing markup from the parent into the child.

-   **Default Slot**:
    ```svelte
    <!-- Wrapper.svelte -->
    <div>
      <slot>Default content if nothing is passed</slot>
    </div>

    <!-- Parent.svelte -->
    <Wrapper>
      <p>This content goes into the default slot.</p>
    </Wrapper>
    ```
-   **Named Slots**: For more complex components with multiple areas for content injection.
    ```svelte
    <!-- Card.svelte -->
    <div>
      <header><slot name="header">Default Header</slot></header>
      <main><slot>Default Main Content</slot></main>
      <footer><slot name="footer"></slot></footer>
    </div>

    <!-- Parent.svelte -->
    <Card>
      <h1 slot="header">My Card Title</h1>
      <p>This is the main content of the card.</p>
      <small slot="footer">Card footer text</small>
    </Card>
    ```
-   **Props for Slots (`let:propName`)**: Allow slots to receive props from the child component.

## Lifecycle Functions

Understand and use Svelte's lifecycle functions appropriately.

-   **`onMount(() => cleanupFn)`**: Code runs after the component is first rendered to the DOM. Useful for data fetching, setting up third-party libraries, or subscriptions. Can return a cleanup function that runs when the component is destroyed.
-   **`onDestroy(() => {})`**: Code runs before the component is unmounted. Essential for cleaning up subscriptions, timers, or other resources to prevent memory leaks.
-   **`beforeUpdate(() => {})`**: Code runs just before the component's DOM is updated.
-   **`afterUpdate(() => {})`**: Code runs immediately after the component's DOM is updated.
-   **Svelte 5 `$effect`**: In Svelte 5, `$effect` is the primary way to manage side effects tied to the component lifecycle and state changes. It runs after the DOM has been updated. Its cleanup function is crucial for preventing memory leaks.
    ```svelte
    <script>
      // Svelte 5
      let data = $state(null);
      $effect(() => {
        console.log('Component updated or data changed');
        const subscription = someService.subscribe(data, () => {});
        return () => subscription.unsubscribe(); // Cleanup
      });
    </script>
    ```

## Accessibility (`a11y`)

Svelte helps with accessibility by providing compile-time warnings for common a11y issues (e.g., missing `alt` text on images, incorrect ARIA attribute usage).

-   Pay attention to these warnings and address them.
-   Use semantic HTML.
-   Ensure keyboard navigability and focus management.
-   Test with screen readers if possible.

## Performance Tips

-   **Keyed `{#each}` Blocks**: When rendering lists of items that can change order or be added/removed, always use a unique key for each item within an `{#each}` block. This helps Svelte efficiently update the DOM.
    ```svelte
    {#each items as item (item.id)}
      <div>{item.name}</div>
    {/each}
    ```
-   **Avoid Unnecessary Computations**:
    -   If a computation is expensive, ensure it only re-runs when its direct dependencies change. Svelte's reactivity is generally efficient, but complex functions in reactive statements (`$:`) should be reviewed.
    -   In Svelte 5, `$derived` helps memoize computations automatically.
-   **Minimize DOM Updates**: Svelte is good at this, but be aware that large, frequent state changes can still impact performance. Batch updates to stores or state if possible.
-   **Use `bind:group` efficiently**: For radio buttons or checkboxes, `bind:group` is convenient, but ensure the bound variable updates don't cause excessive re-renders if the group is very large.
-   **Code Splitting (SvelteKit)**: If using SvelteKit, leverage its routing and code-splitting capabilities to load only necessary code for each page.

By following these best practices, you can build high-quality, maintainable, and performant Svelte applications in {projectPath}.
```
