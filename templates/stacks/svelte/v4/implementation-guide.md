---
description: Implementation details, key changes, and new features in Svelte 4.
globs: <root>/src/**/*.{svelte,js,ts}
alwaysApply: true # Applies if v4 is detected
---

# Svelte 4 Implementation Guide

This document provides implementation details specific to Svelte 4.

## Project Setup

For Svelte 4, the recommended way to create a new project is using SvelteKit or Vite:

```bash
# Using SvelteKit (recommended)
npm create svelte@latest my-svelte-app

# Using Vite directly
npm create vite@latest my-app -- --template svelte
```

## Key Changes in Svelte 4

Svelte 4 maintains most of the API from Svelte 3 with some important improvements:

### Smaller Runtime

The Svelte 4 runtime is significantly smaller than Svelte 3, resulting in smaller bundle sizes and faster load times.

### Updated Compiler

Svelte 4 uses a completely rewritten compiler based on an AST (Abstract Syntax Tree) instead of regex. This enables better error messages and more efficient output.

### TypeScript Improvements

Native TypeScript support has been improved:

```svelte
<script lang="ts">
  // TypeScript is now better supported
  export let name: string;
  export let count: number = 0;

  interface Item {
    id: number;
    text: string;
  }

  let items: Item[] = [];
</script>
```

### Component Events with TypeScript

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Typed event dispatcher
  const dispatch = createEventDispatcher<{
    click: { id: number };
    hover: { id: number, position: { x: number, y: number } };
  }>();

  function handleClick(id: number) {
    dispatch('click', { id });
  }
</script>
```

### Improved Error Messages

Svelte 4 provides clearer error messages when something goes wrong during compilation or at runtime.

### Accessibility Improvements

Svelte 4 includes more a11y warnings to help developers build more accessible applications.

## New/Updated Features in Svelte 4

### Prop Fallbacks

You can now provide default values even for required props:

```svelte
<script>
  // Will receive either the passed value or 'fallback'
  export let required = 'fallback';
</script>
```

### Multiple Event Listeners

```svelte
<button on:click={(e) => console.log('First handler')}
        on:click={(e) => console.log('Second handler')}>
  Multiple handlers
</button>
```

### Slots with Fallbacks

```svelte
<div>
  <slot name="header">
    <h2>Default Header</h2>
  </slot>

  <slot>
    <p>Default content</p>
  </slot>
</div>
```

## Breaking Changes from Svelte 3

1. **Custom Elements:** The way custom elements are created has changed

    ```js
    // Svelte 3
    import App from './App.svelte';
    const app = new App({
    	target: document.body,
    	props: { name: 'world' },
    });

    // Svelte 4
    import App from './App.svelte';
    new App({
    	target: document.body,
    	props: { name: 'world' },
    });
    ```

2. **CSS Changes:** Removed the `global:` modifier, use `:global()` instead

    ```css
    /* Svelte 3 */
    global:p {
    	color: red;
    }

    /* Svelte 4 */
    :global(p) {
    	color: red;
    }
    ```

3. **TypeScript Imports:** Changed import path for TypeScript users

    ```ts
    // Svelte 3
    import { SvelteComponent } from 'svelte';

    // Svelte 4
    import type { SvelteComponent } from 'svelte';
    ```

## Compatibility and Migration

-   Most Svelte 3 code will work in Svelte 4 without changes
-   For a smooth migration, follow the [official migration guide](https://svelte.dev/docs/migration)
-   Use the migration tool for automated updates:
    ```bash
    npx svelte-migrate@latest svelte-4
    ```

## Development Tools

-   Svelte 4 integrates with Vite for faster development
-   The official VS Code extension provides better syntax highlighting and intellisense
-   SvelteKit is the recommended meta-framework for building full applications with Svelte 4
```
