---
description: Styling concepts and approaches in SvelteKit applications.
globs: <root>/src/**/*.{svelte,css,scss,less},<root>/src/app.html
alwaysApply: true
---

# Styling in SvelteKit Applications

SvelteKit, building on Svelte and Vite, offers a flexible and robust system for styling your applications. It supports scoped component styles, global styles, CSS preprocessors, PostCSS, and easy integration with utility CSS frameworks.

## 1. Svelte Component Styles (`<style>` tag)

This is the most common way to style components in SvelteKit, inherited directly from Svelte.

-   **Scoped by Default**: Styles defined within a Svelte component's `<style>` tag are scoped to that component. Svelte achieves this by adding a unique class to elements (e.g., `p.svelte-uniquehash`).
    ```svelte
    <!-- src/components/MyButton.svelte -->
    <button class="cool-button">Click Me</button>

    <style>
      .cool-button {
        background-color: blue;
        color: white;
        padding: 0.5em 1em;
        border-radius: 4px;
      }
      /* This will not affect buttons outside this component */
    </style>
    ```
-   **Global Styles within Components**: Use the `:global()` modifier if you need to apply styles more broadly from within a component, though this should be used judiciously.
    ```svelte
    <style>
      /* Affects all <a> tags rendered by this component or its children if not further scoped */
      :global(a) {
        text-decoration: none;
      }
      /* More specific global styling */
      .content :global(p) {
        margin-bottom: 1em;
      }
    </style>
    ```

## 2. Global Styles

For styles that need to apply across the entire application (e.g., CSS resets, typography, global theme variables).

-   **Via `app.html`**: You can link traditional CSS stylesheets directly in your `src/app.html` file.
    ```html
    <!-- src/app.html -->
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-f" />
        <link rel="icon" href="%sveltekit.assets%/favicon.png" />
        <link rel="stylesheet" href="%sveltekit.assets%/css/global.css"> <!-- Example -->
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        %sveltekit.head%
      </head>
      <body>
        <div>%sveltekit.body%</div>
      </body>
    </html>
    ```
    Place your global CSS file (e.g., `global.css`) in the `static` directory.

-   **Imported into a Root Layout**: A common practice is to import your main stylesheet into the root layout component (`src/routes/+layout.svelte`).
    ```svelte
    <!-- src/routes/+layout.svelte -->
    <script>
      import '../app.css'; // Or any other path to your global CSS file
    </script>

    <slot />
    ```
    This `app.css` file can be a plain CSS file or use preprocessors if configured.

## 3. CSS Preprocessors (Sass, Less)

SvelteKit uses Vite as its build tool, which has built-in support for CSS preprocessors.

1.  **Installation**: Install the preprocessor:
    ```bash
    npm install -D sass  # For SCSS/Sass
    # or
    npm install -D less # For Less
    ```
2.  **Usage**: Simply use the `lang` attribute in your Svelte component's `<style>` tag or name your files with the appropriate extension (e.g., `.scss`, `.less`) for global stylesheets imported into layouts/components.
    ```svelte
    <!-- src/components/MyCard.svelte -->
    <div class="card">
      <slot />
    </div>

    <style lang="scss">
      $primary-color: #3498db;
      .card {
        border: 1px solid $primary-color;
        padding: 1rem;
        &:hover {
          box-shadow: 0 0 5px rgba($primary-color, 0.5);
        }
      }
    </style>
    ```
    You might also want to configure `vite.config.js` for options like `prependData` for SCSS:
    ```javascript
    // vite.config.js
    import { sveltekit } from '@sveltejs/kit/vite';
    import { defineConfig } from 'vite';

    export default defineConfig({
      plugins: [sveltekit()],
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `@import "src/styles/_variables.scss";`, // Example
          },
        },
      },
    });
    ```

## 4. PostCSS

PostCSS is often used for transforming CSS with JavaScript plugins (e.g., Autoprefixer). Vite has built-in PostCSS support.

1.  **Installation**: Install PostCSS and any plugins:
    ```bash
    npm install -D postcss autoprefixer
    ```
2.  **Configuration**: Create a `postcss.config.cjs` (or `.js` depending on your project type) file in your project root.
    ```javascript
    // postcss.config.cjs
    module.exports = {
      plugins: {
        autoprefixer: {},
        // other plugins...
      },
    };
    ```
    Vite will automatically pick up this configuration.

## 5. Utility CSS Frameworks (e.g., Tailwind CSS)

Tailwind CSS is a popular choice for SvelteKit projects.

1.  **Installation & Setup**:
    -   Install Tailwind CSS and its peer dependencies:
        ```bash
        npm install -D tailwindcss postcss autoprefixer
        npx tailwindcss init -p
        ```
    -   Configure `tailwind.config.js` to include your Svelte files in the `content` array:
        ```javascript
        // tailwind.config.js
        /** @type {import('tailwindcss').Config} */
        export default {
          content: ['./src/**/*.{html,js,svelte,ts}'], // Key line
          theme: {
            extend: {},
          },
          plugins: [],
        };
        ```
    -   Create a global CSS file (e.g., `src/app.css`) and import Tailwind's directives:
        ```css
        /* src/app.css */
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```
    -   Import this global CSS file into your root layout (`src/routes/+layout.svelte`).
        ```svelte
        <!-- src/routes/+layout.svelte -->
        <script>
          import '../app.css';
        </script>

        <slot />
        ```
2.  **Usage**: Use Tailwind utility classes directly in your Svelte components.
    ```svelte
    <h1 class="text-3xl font-bold underline text-blue-600 hover:text-red-500">
      Hello Tailwind in SvelteKit!
    </h1>
    ```

## Managing Themes

-   **CSS Custom Properties (Variables)**: The most common and flexible way to manage themes. Define variables in a global scope (e.g., in your `app.css` or within `:root` in a layout's style block) and use them throughout your components.
    ```css
    /* src/app.css or a theme.css imported in root layout */
    :root {
      --primary-color: #007bff;
      --secondary-color: #6c757d;
      --background-color: #ffffff;
      --text-color: #212529;
    }

    [data-theme="dark"] { /* Example for dark mode */
      --primary-color: #0056b3;
      --background-color: #121212;
      --text-color: #e0e0e0;
    }
    ```
    You can then switch themes by changing the `data-theme` attribute on `<html>` or `<body>` element, typically managed via a Svelte store and client-side JavaScript.
-   **Svelte Stores for Dynamic Theming**: Use a Svelte store to hold the current theme state (e.g., 'light' or 'dark') and apply classes or update CSS variables dynamically.
-   **Preprocessor Variables**: If using Sass/Less, their variables can define themes, but these are compile-time. For dynamic runtime theming, CSS custom properties are preferred.

SvelteKit's integration with Vite makes it straightforward to adopt modern styling techniques, providing a good developer experience and efficient, optimized CSS output.
```
