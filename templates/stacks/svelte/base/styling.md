---
description: Styling concepts and approaches in Svelte applications.
globs: <root>/src/**/*.{svelte,css,scss,less}
alwaysApply: true
---

# Styling in Svelte Applications

Svelte provides a powerful and intuitive approach to styling components, emphasizing scoped styles by default while offering flexibility for global styling and integration with various CSS tools.

## Scoped Styles (`<style>` tag)

By default, styles defined within a Svelte component's `<style>` tag are scoped to that component. This means they won't leak out and affect other components, preventing common CSS conflicts. Svelte achieves this by adding a unique class to elements in your component and modifying your CSS selectors accordingly.

```svelte
<!-- MyComponent.svelte -->
<script>
  let isActive = true;
</script>

<div class="container" class:active={isActive}>
  <p>This is a styled paragraph.</p>
</div>

<style>
  .container {
    padding: 1em;
    border: 1px solid #ccc;
  }
  .active {
    border-color: blue;
  }
  p {
    color: purple;
    font-family: 'Arial', sans-serif;
  }
  /* This 'p' selector will be transformed to something like p.svelte-uniquehash */
</style>
```

-   **Benefits**:
    -   No style conflicts between components.
    -   Easier to reason about styles as they are co-located with the component markup and logic.
    -   Reduces the need for complex naming conventions like BEM.

## Global Styles (`:global()`)

Sometimes you need to define global styles or style elements that are not part of the component's template (e.g., elements created by a third-party library, or styling `<body>`). You can use the `:global()` modifier for this.

```svelte
<style>
  /* Apply to all <h1> elements in the application */
  :global(h1) {
    font-size: 2.5rem;
    color: #333;
  }

  /* Style a third-party component's class */
  :global(.external-library-class) {
    background-color: lightblue;
  }

  /* Define a global CSS variable */
  :global(:root) {
    --main-font-size: 16px;
  }

  /* Can also be used for a specific child within a scoped parent */
  .my-wrapper :global(ul) {
    list-style-type: square;
  }
</style>
```
Use `:global()` sparingly to maintain the benefits of scoped styles. It's often best to place truly global styles (like resets, typography, theme variables) in a dedicated global CSS file imported into your main application entry point or layout component.

## CSS Custom Properties (Variables)

CSS Custom Properties (variables) work seamlessly with Svelte and are an excellent way to manage theming and dynamic styling.

```svelte
<script>
  let themeColor = 'darkblue';
</script>

<div style="--theme-color: {themeColor}; --header-font-size: 1.5rem;">
  <p class="themed-text">This text uses theme color.</p>
</div>

<style>
  .themed-text {
    color: var(--theme-color, black); /* Fallback to black if --theme-color is not set */
    font-size: var(--header-font-size);
  }

  /* Global theme variables (can be set in :global(:root) or a global CSS file) */
  :global(:root) {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
  }
</style>
```
You can dynamically update CSS custom properties from your Svelte component's script block, allowing for reactive styling changes.

## Using Preprocessors (Sass/Less with `svelte-preprocess`)

Svelte can work with CSS preprocessors like Sass, Less, or Stylus through `svelte-preprocess`.

1.  **Installation**:
    ```bash
    npm install -D svelte-preprocess sass # or less, stylus
    ```
2.  **Configuration**: Update your `svelte.config.js` (or `vite.config.js` if using Vite with Svelte plugin directly):
    ```javascript
    // svelte.config.js
    import sveltePreprocess from 'svelte-preprocess';

    const config = {
      preprocess: sveltePreprocess({
        scss: {
          prependData: `@import 'src/styles/variables.scss';`, // Optional: global SCSS variables
        },
        // less: { ... }
      }),
      // ... other Svelte options
    };

    export default config;
    ```
3.  **Usage**: Add `lang="scss"` (or `lang="less"`) to your `<style>` tags:
    ```svelte
    <style lang="scss">
      $primary-color: blue; // Local SCSS variable

      .my-element {
        color: $primary-color; // Uses local or globally prepended variable
        background-color: var(--global-var-from-scss-file); // If variables.scss defines it as CSS var

        &:hover {
          color: darken($primary-color, 10%);
        }
      }
    </style>
    ```

## Integrating Utility CSS Frameworks (e.g., Tailwind CSS)

Utility-first CSS frameworks like Tailwind CSS can be integrated with Svelte.

1.  **Installation & Setup**: Follow the framework's specific installation guide for Svelte/Vite projects (e.g., for Tailwind CSS, this involves installing `tailwindcss`, `postcss`, `autoprefixer`, and configuring `tailwind.config.js` and `postcss.config.js`).
2.  **Import Global Styles**: Import the framework's base styles into your main app component or a global CSS file.
    ```svelte
    <!-- App.svelte or a global layout component -->
    <script>
      import "../app.css"; // This file would import Tailwind's base styles
    </script>

    <!-- Your component -->
    <div class="bg-blue-500 text-white p-4 rounded-lg shadow-md">
      Hello Tailwind!
    </div>
    ```
3.  **Preprocessing**: Ensure your Svelte preprocessor (if any) and PostCSS setup (for Tailwind) are correctly configured to process the styles. For Tailwind, Svelte components need to be included in the `content` array of `tailwind.config.js`.

Svelte's built-in scoped styling combined with these other techniques offers a flexible and powerful system for styling your applications in {projectPath}.
```
