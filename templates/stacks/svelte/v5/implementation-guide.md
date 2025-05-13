# Svelte 5 Implementation Guide

This document provides implementation details specific to Svelte 5, which introduces a complete rethinking of reactivity with the "runes" API.

## Project Setup

For Svelte 5, create a new project using the latest template:

```bash
# Create a Svelte 5 project
npm create svelte@latest my-svelte-app

# Select "Try the Svelte 5 preview" when prompted
```

## Key New Feature: Runes

Svelte 5 introduces "runes" as a new way to handle reactivity. Runes are marked with special characters like `$:`, `$state()`, `$derived()`, etc.

### State Rune

The `$state()` rune replaces the need for `let` variables when you want reactivity:

```svelte
<script>
  // Svelte 4 way:
  let count = 0;

  // Svelte 5 way:
  let count = $state(0);

  function increment() {
    count++;
  }
</script>

<button on:click={increment}>
  Count: {count}
</button>
```

### Derived Rune

The `$derived()` rune replaces reactive declarations:

```svelte
<script>
  let count = $state(0);

  // Svelte 4 way:
  // $: doubled = count * 2;

  // Svelte 5 way:
  let doubled = $derived(count * 2);

  function increment() {
    count++;
  }
</script>

<button on:click={increment}>
  Count: {count} (doubled: {doubled})
</button>
```

### Effect Rune

The `$effect()` rune runs code whenever dependencies change:

```svelte
<script>
  let count = $state(0);

  // Runs whenever count changes
  $effect(() => {
    console.log(`Count changed to ${count}`);
  });

  function increment() {
    count++;
  }
</script>
```

### Props Rune

The `$props()` rune simplifies how props are defined:

```svelte
<script>
  // Svelte 4 way:
  // export let name = 'world';
  // export let count = 0;

  // Svelte 5 way:
  const { name = 'world', count = 0 } = $props();
</script>
```

## Component Architecture Changes

### Component Definition

Svelte 5 allows defining components as functions:

```svelte
<script>
  // Traditional component definition still works
</script>

<h1>Hello World</h1>
```

Or as a JavaScript function:

```js
// Component.js
export function Component(props) {
	const { name = 'world' } = $props();
	const count = $state(0);

	function increment() {
		count++;
	}

	return `
    <h1>Hello {name}!</h1>
    <button on:click={increment}>
      Count: {count}
    </button>
  `;
}
```

### Snippets

Svelte 5 introduces snippets, which are reusable pieces of UI:

```svelte
<script>
  const count = $state(0);

  // Define a snippet
  function Counter() {
    return `
      <div>
        <button on:click={() => count--}>-</button>
        <span>{count}</span>
        <button on:click={() => count++}>+</button>
      </div>
    `;
  }
</script>

<h1>My App</h1>

<!-- Use the snippet -->
{@render Counter()}

<!-- Use it again -->
{@render Counter()}
```

## Universal Reactivity

With Svelte 5, reactivity works outside components too:

```js
// store.js
import { state, derived } from 'svelte';

// Create reactive state
export const count = state(0);
export const doubled = derived(() => count() * 2);

// Functions to update state
export function increment() {
	count.set(count() + 1);
}

export function decrement() {
	count.set(count() - 1);
}
```

```svelte
<!-- Component.svelte -->
<script>
  import { count, doubled, increment, decrement } from './store.js';
</script>

<button on:click={decrement}>-</button>
<span>{$count}</span>
<button on:click={increment}>+</button>
<div>Doubled: {$doubled}</div>
```

## Backward Compatibility

Svelte 5 maintains backward compatibility with Svelte 4 syntax:

-   Reactive declarations with `$:` still work
-   Exporting props with `export let` still works
-   Stores still work with the `$` prefix

## Performance Improvements

Svelte 5 includes significant performance improvements:

-   Smaller runtime
-   Faster reactivity system
-   More efficient updates
-   Better tree-shaking

## Migration from Svelte 4

When migrating from Svelte 4:

1. Update dependencies to Svelte 5
2. Convert reactive variables to use `$state()` (optional)
3. Convert reactive declarations to use `$derived()` (optional)
4. Convert lifecycle callbacks to use `$effect()` (optional)
5. Test thoroughly as some edge cases may behave differently

Svelte 5 provides a migration tool:

```bash
npx svelte-migrate@latest svelte-5
```
