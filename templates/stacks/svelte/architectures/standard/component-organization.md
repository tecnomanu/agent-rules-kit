---
description: Recommended component organization for standard Svelte applications.
globs: <root>/src/**/*.{svelte,js,ts}
alwaysApply: false # As it's an architectural choice
---

# Component Organization in Svelte

This document outlines the recommended organization for components in a standard Svelte application.

## Folder Structure

```
src/
├── components/         # Reusable UI components
│   ├── common/         # Shared components used across features
│   ├── layout/         # Layout components (headers, footers, etc.)
│   └── [feature]/      # Feature-specific components
├── routes/             # SvelteKit route components (if applicable)
├── lib/                # Utility functions, helpers, and shared logic
├── stores/             # Svelte stores for state management
├── assets/             # Static assets (images, fonts, etc.)
└── styles/             # Global styles and CSS variables
```

## Component File Structure

Each component should follow a consistent structure:

```svelte
<script>
  // Imports
  import { onMount } from 'svelte';

  // Props (exported variables)
  export let propName = defaultValue;

  // Local state
  let localVar = initialValue;

  // Reactive statements
  $: computedValue = someCalculation(propName);

  // Lifecycle methods
  onMount(() => {
    // Component initialization
  });

  // Event handlers
  function handleEvent() {
    // Handle the event
  }
</script>

<!-- Markup -->
<div class="component-name">
  <h1>{propName}</h1>
</div>

<!-- Styles (scoped to this component) -->
<style>
  .component-name {
    /* Component-specific styles */
  }
</style>
```

## Best Practices

1. Keep components small and focused on a single responsibility
2. Use props for passing data down to child components
3. Use events for communicating upward to parent components
4. Extract complex logic into separate functions in `lib/`
5. Use Svelte stores for shared state that spans multiple components
6. Leverage Svelte's reactivity system with `$:` statements
7. Use slots for flexible component composition

## State Management

For local component state, use regular Svelte variables. For shared state, use Svelte stores:

```javascript
// stores/counter.js
import { writable } from 'svelte/store';

export const count = writable(0);
```

```svelte
<!-- Component.svelte -->
<script>
  import { count } from './stores/counter';

  function increment() {
    $count += 1;
  }
</script>

<button on:click={increment}>
  Count: {$count}
</button>
```
