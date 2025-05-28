---
description: Core architectural concepts for Svelte applications.
globs: <root>/src/**/*.{svelte,js,ts}
alwaysApply: true
---

# Svelte Architectural Concepts

Svelte is a modern JavaScript framework that takes a novel approach to building user interfaces. Instead of doing the bulk of its work in the browser (like traditional frameworks such as React or Vue), Svelte shifts that work into a compile step. Understanding these core concepts is key to effectively developing applications in {projectPath}.

## Svelte as a Compiler

The most fundamental concept is that Svelte is a **compiler**. You write declarative components, and Svelte compiles them into highly efficient, imperative JavaScript code that directly manipulates the DOM.

-   **No Virtual DOM**: Unlike many frameworks, Svelte does not use a Virtual DOM. Because the compiler knows at build time how things could change, it can generate precise code to update only the parts of the DOM that need to.
-   **Smaller Bundles**: Svelte components don't need to ship with a bulky framework runtime. The compiled output is often smaller and faster.
-   **Truly Reactive**: Svelte's reactivity is built into the language itself at the compiler level, leading to more idiomatic and often simpler code.

## Single-File Components (`.svelte` files)

Svelte applications are built from `.svelte` files. Each `.svelte` file represents a reusable component and encapsulates its structure, styling, and logic.

A typical `.svelte` file has three main sections:

1.  **`<script>` block**: Contains JavaScript or TypeScript code that defines the component's logic, state, and props.
    ```svelte
    <script lang="ts">
      // Props
      export let name: string = 'World';

      // Internal state
      let count: number = 0;

      function handleClick() {
        count += 1;
      }

      // Reactive declarations (computed properties)
      $: doubled = count * 2;
      $: if (count >= 10) {
        console.log('Count is 10 or more');
      }

      // Lifecycle functions (e.g., onMount)
      import { onMount } from 'svelte';
      onMount(() => {
        console.log('Component has mounted');
      });
    </script>
    ```

2.  **`<style>` block**: Contains CSS for the component. These styles are **scoped by default**, meaning they only apply to the current component and don't leak out.
    ```svelte
    <style>
      p {
        color: blue;
        font-family: 'Comic Sans MS', cursive;
      }
      /* This will be transformed to something like p.svelte-uniquehash */
    </style>
    ```

3.  **Markup (template)**: The HTML structure of the component, which can include standard HTML, other Svelte components, and Svelte-specific template syntax (like `{#if}`, `{#each}`, event handlers `on:event`).
    ```svelte
    <!-- Markup section -->
    <h1>Hello, {name}!</h1>
    <p>You clicked the button {count} {count === 1 ? 'time' : 'times'}. Doubled: {doubled}</p>
    <button on:click={handleClick}>Click me</button>
    ```

## Project Structure

The project structure can vary depending on whether you're using SvelteKit (a full-fledged application framework for Svelte) or Svelte with a simpler build tool like Vite.

### SvelteKit Project Structure (Common)
SvelteKit provides a more opinionated and feature-rich structure:
```
{projectPath}/
├── src/
│   ├── app.html            # Main HTML template
│   ├── hooks.server.ts     # Server-side hooks
│   ├── hooks.client.ts     # Client-side hooks
│   ├── lib/                # Libraries, utilities, shared code
│   │   ├── client/         # Client-specific utilities
│   │   ├── server/         # Server-specific utilities (e.g., database clients)
│   │   └── shared/         # Utilities usable on both client and server
│   ├── params/             # Parameter matchers for routing
│   ├── routes/             # File-system based routing
│   │   ├── +page.svelte    # Page component for '/'
│   │   ├── about/
│   │   │   └── +page.svelte # Page for '/about'
│   │   └── api/
│   │       └── data/
│   │           └── +server.ts # API endpoint for '/api/data'
│   ├── service-worker.ts   # Service worker logic
│   └── vite-env.d.ts       # Vite environment types
├── static/                 # Static assets (images, fonts)
├── svelte.config.js        # Svelte and SvelteKit configuration
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

### Svelte with Vite (Simpler Structure)
A more minimal Svelte project (e.g., for embedding components or smaller SPAs) might look like this:
```
{projectPath}/
├── public/                 # Static assets
│   └── index.html          # Main HTML file (Vite injects scripts here)
├── src/
│   ├── assets/             # Static assets like images, fonts
│   ├── components/         # Reusable Svelte components
│   │   └── MyButton.svelte
│   ├── App.svelte          # Root Svelte component
│   └── main.ts             # Entry point, mounts the root component
├── index.html              # Alternative location for main HTML with Vite
├── svelte.config.js        # Svelte configuration (e.g., for svelte-preprocess)
├── vite.config.ts          # Vite configuration
├── tsconfig.json
└── package.json
```
Regardless of the setup, the core idea of `.svelte` files as the building blocks remains the same.

## Reactivity in Svelte

Svelte's reactivity is at its core. When you assign a new value to a top-level variable in a component's `<script>` block, Svelte automatically knows it needs to update the DOM where that variable is used.

```svelte
<script>
  let count = 0;
  function increment() {
    count += 1; // Svelte detects this assignment and schedules an update
  }
</script>

<button on:click={increment}>
  Clicked {count} times
</button>
```
-   **Assignments trigger updates**: The `=` operator is the key to Svelte's reactivity.
-   **Reactive statements `$: `**: For variables that depend on other reactive variables (computed properties) or for running code whenever a value changes.
    ```svelte
    $: doubled = count * 2; // Recalculates when 'count' changes
    $: console.log(`The count is now ${count}`); // Logs when 'count' changes
    ```
-   **No special functions needed for updates**: You don't call `setState` or similar functions. Just assign.

**Svelte 5 Note**: Svelte 5 introduces "Runes" as a new way to manage reactivity, making it more explicit and granular, especially for complex scenarios.
- `$state()`: Declares reactive state. `let count = $state(0);`
- `$derived()`: Creates a computed value. `let doubled = $derived(count * 2);`
- `$effect()`: Runs side effects when dependencies change. `$effect(() => { console.log(count); });`
While the syntax changes with Runes, the core principle of the compiler optimizing updates based on detected changes remains.

Understanding these architectural concepts will help you write efficient, idiomatic Svelte code in {projectPath}.
```
