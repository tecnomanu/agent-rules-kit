---
description: Overview of state management strategies in Svelte.
globs: <root>/src/**/*.{svelte,js,ts}
alwaysApply: true
---

# State Management in Svelte Applications

Svelte offers a simple yet powerful approach to state management, deeply integrated into its reactive system. This guide covers the primary methods for managing state in your Svelte applications at {projectPath}.

## 1. Component State (Reactive `let` Declarations)

The most fundamental way to manage state in Svelte is within components using reactive `let` declarations. Any top-level variable in a component's `<script>` block is automatically reactive. When its value changes, Svelte efficiently updates the DOM.

```svelte
<!-- MyComponent.svelte -->
<script>
  let count = 0; // Reactive variable
  let name = 'World';

  function increment() {
    count += 1;
  }

  function updateName(event) {
    name = event.target.value;
  }

  // $: (reactive statements) can be used for computed properties based on state
  $: greeting = `Hello, ${name}!`;
  $: doubledCount = count * 2;
</script>

<input type="text" value={name} on:input={updateName} />
<button on:click={increment}>
  Clicked {count} {count === 1 ? 'time' : 'times'}
</button>
<p>{greeting}</p>
<p>Doubled count: {doubledCount}</p>
```
- **Simplicity**: No special functions or hooks are needed to declare state.
- **Reactivity**: Assignments to these variables automatically trigger updates.
- **Computed Properties**: Use `$: label` syntax for values that depend on other reactive variables.

**Svelte 5 Note**: In Svelte 5, state management evolves with "Runes". The equivalent of `let` for reactive state is `$state()`:
```svelte
<!-- MyComponent.svelte (Svelte 5 with Runes) -->
<script>
  let count = $state(0); // Using $state for reactive state
  let name = $state('World');

  function increment() {
    count += 1;
  }
  // ... rest of the component ...
</script>
```

## 2. Svelte Stores

For state that needs to be shared across multiple components or isn't tied to a specific component lifecycle, Svelte provides **stores**. Stores are simply objects with a `subscribe` method that allows components to be notified of value changes.

Svelte provides built-in store types: `writable`, `readable`, and `derived`.

### a. Writable Stores
These are stores whose values can be updated from "outside" by calling their `set` or `update` methods.

```javascript
// stores.js
import { writable } from 'svelte/store';

export const count = writable(0); // Initial value is 0
export const user = writable(null); // Can store objects, null, etc.

// To update:
// count.set(10);
// count.update(currentValue => currentValue + 1);
// user.set({ name: 'Jane Doe', email: 'jane@example.com' });
```

### b. Readable Stores
These stores cannot be updated from the outside; their values are set internally when they are created. Useful for representing values that change over time but shouldn't be directly modified by consumers (e.g., sensor data, timers).

```javascript
// stores.js
import { readable } from 'svelte/store';

export const time = readable(new Date(), function start(set) {
  const interval = setInterval(() => {
    set(new Date());
  }, 1000);

  return function stop() { // Cleanup function when no more subscribers
    clearInterval(interval);
  };
});
```

### c. Derived Stores
These stores derive their value from one or more other stores. They update automatically whenever their dependencies change.

```javascript
// stores.js
import { writable, derived } from 'svelte/store';

export const name = writable('World');
export const greeting = derived(name, $name => `Hello ${$name}!`); // $name is the value of the name store

export const a = writable(1);
export const b = writable(2);
export const sum = derived([a, b], ([$a, $b]) => $a + $b);
```

### Using Stores in Components (Auto-Subscription)
Svelte makes using stores in components very ergonomic with the `$` prefix (auto-subscription). If you reference a store with `$` in a component's markup or script, Svelte automatically subscribes to it on component mount and unsubscribes on destroy.

```svelte
<!-- MyComponent.svelte -->
<script>
  import { count, greeting } from './stores.js'; // Assuming stores.js is in the same directory

  function incrementCount() {
    count.update(n => n + 1); // Update the store's value
  }
</script>

<h1>{$greeting}</h1> <!-- Auto-subscribes to the greeting store -->
<p>Count: {$count}</p> <!-- Auto-subscribes to the count store -->
<button on:click={incrementCount}>Increment Count</button>

<p>Current store value in script: {JSON.stringify($count)}</p>
```
- **No Manual Unsubscribe**: The `$` syntax handles subscription and unsubscription automatically.
- **Readability**: Clean and concise way to access store values.

## 3. Context API (`getContext`, `setContext`)

Svelte's Context API is used for passing data down through the component hierarchy without prop drilling. It's useful for "global" data that many components might need, but where stores might be overkill or less direct.

-   `setContext(key, contextValue)`: Associates a value with a key. Typically called in a parent component.
-   `getContext(key)`: Retrieves the value associated with a key. Called in child components.

```svelte
<!-- ParentComponent.svelte -->
<script>
  import { setContext } from 'svelte';
  import ChildComponent from './ChildComponent.svelte';

  const userInfo = {
    name: 'Alice',
    loggedIn: true,
  };

  setContext('userData', userInfo); // Set context with key 'userData'
</script>

<ChildComponent />

<!-- ChildComponent.svelte -->
<script>
  import { getContext, onMount } from 'svelte';

  // It's common to get context during onMount or in the top-level script
  // If context might not be set, provide a default or check
  const userData = getContext('userData');

  onMount(() => {
    console.log('User data from context:', userData);
  });
</script>

{#if userData}
  <p>User: {userData.name}, Logged In: {userData.loggedIn}</p>
{:else}
  <p>No user data in context.</p>
{/if}
```
- **Hierarchy-Dependent**: `getContext` only works if `setContext` was called by an ancestor component.
- **Not Reactive**: Unlike stores, the Context API itself isn't reactive. If the `contextValue` object passed to `setContext` changes, components that have already called `getContext` will *not* automatically update unless the `contextValue` itself is a reactive object (like a store). For this reason, it's common to pass stores via context.

## 4. Module Context (`<script context="module">`)

Code inside `<script context="module">` runs once when the module is first evaluated, not for each component instance. Variables declared here are shared across all instances of that component. This can be used for state that is truly static to the component class, or for exporting things like constants or utility functions related to the component.

```svelte
<!-- MySharedCounter.svelte -->
<script context="module">
  import { writable } from 'svelte/store';
  // This store is created once and shared by all instances of MySharedCounter
  export const sharedCount = writable(0);
  console.log('Module script executed');
</script>

<script>
  // Instance script
  function incrementShared() {
    sharedCount.update(n => n + 1);
  }
</script>

<button on:click={incrementShared}>
  Increment Shared Count: {$sharedCount}
</button>
```
- **Shared State**: Can be a simple way to achieve state shared among instances of the same component type.
- **Careful with Mutability**: If you export mutable objects from module context directly (not stores), changes might not be tracked reactively by Svelte unless properly managed.

Choosing the right state management strategy in {projectPath} depends on the scope and complexity of the state you need to manage. Svelte's built-in tools cover a wide range of use cases effectively.
```
