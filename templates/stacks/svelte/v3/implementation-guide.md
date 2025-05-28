---
description: Implementation details and key features specific to Svelte 3.
globs: <root>/src/**/*.{svelte,js,ts}
alwaysApply: true # Applies if v3 is detected
---

# Svelte 3 Implementation Guide

This document provides implementation details specific to Svelte 3.

## Project Setup

To create a new Svelte 3 project, use the official template:

```bash
npx degit sveltejs/template my-svelte-project
cd my-svelte-project
npm install
npm run dev
```

## Key Features in Svelte 3

### Reactive Declarations

Svelte 3 introduced the reactive `$:` syntax:

```svelte
<script>
  let count = 0;

  // This will re-run whenever count changes
  $: doubled = count * 2;

  // You can also run statements reactively
  $: if (count > 10) {
    console.log('Count is getting high!');
  }

  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>
  Increment: {count} (doubled: {doubled})
</button>
```

### Component Lifecycle

Svelte 3 provides the following lifecycle methods:

```svelte
<script>
  import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte';

  onMount(() => {
    console.log('Component mounted');
    return () => console.log('onMount cleanup');
  });

  onDestroy(() => {
    console.log('Component will be destroyed');
  });

  beforeUpdate(() => {
    console.log('Component will update');
  });

  afterUpdate(() => {
    console.log('Component updated');
  });
</script>
```

### Stores

Svelte 3 introduced a powerful store system:

```javascript
// store.js
import { writable, readable, derived } from 'svelte/store';

// Writable store (can be updated from anywhere)
export const count = writable(0);

// Readable store (can only be updated internally)
export const time = readable(new Date(), (set) => {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return () => clearInterval(interval);
});

// Derived store (derived from other stores)
export const elapsed = derived(time, ($time) => {
	return Math.round(($time - start) / 1000);
});
```

Using stores in components:

```svelte
<script>
  import { count } from './store.js';

  function increment() {
    $count += 1;
  }

  function reset() {
    count.set(0);
  }

  function decrement() {
    count.update(n => n - 1);
  }
</script>

<button on:click={decrement}>-</button>
<span>{$count}</span>
<button on:click={increment}>+</button>
<button on:click={reset}>Reset</button>
```

### Actions

Actions are a way to add functionality to elements:

```svelte
<script>
  function longpress(node, duration = 500) {
    let timer;

    function handleMousedown() {
      timer = setTimeout(() => {
        node.dispatchEvent(new CustomEvent('longpress'));
      }, duration);
    }

    function handleMouseup() {
      clearTimeout(timer);
    }

    node.addEventListener('mousedown', handleMousedown);
    node.addEventListener('mouseup', handleMouseup);

    return {
      update(newDuration) {
        duration = newDuration;
      },
      destroy() {
        node.removeEventListener('mousedown', handleMousedown);
        node.removeEventListener('mouseup', handleMouseup);
      }
    };
  }
</script>

<button use:longpress={1000} on:longpress={() => alert('Long pressed!')}>
  Press and hold
</button>
```

## Compatibility Notes

-   Svelte 3 dropped support for IE11
-   Requires a build step (usually handled by Rollup or Webpack)
-   Works with TypeScript via `svelte-preprocess`

## Migration from Svelte 2

Key changes if upgrading from Svelte 2:

1. Complete rewrite of the component API
2. New reactive declaration syntax with `$:`
3. New store implementation using `$` prefix
4. Component methods replaced with exported functions
5. Two-way binding with `bind:` directive
```
