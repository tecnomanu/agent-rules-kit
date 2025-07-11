---
description: Styling concepts and approaches in Astro projects.
globs: <root>/src/**/*.astro,<root>/src/**/*.css,<root>/src/**/*.scss,<root>/src/**/*.less,<root>/src/styles/**/*.css
alwaysApply: true
---

# Styling in Astro Projects

Astro offers a flexible approach to styling, allowing you to use familiar CSS techniques while providing powerful features like scoped styles and easy integration with modern tools.

## 1. Scoped Styles (`<style>` tag in `.astro` files)

Styles defined within a `<style>` tag in an Astro component are **scoped by default**. This means they only apply to the HTML elements within that component's template, preventing CSS conflicts and making it easier to reason about your styles.

```astro
---
// src/components/MyComponent.astro
---
<div class="card">
  <p>This is a card component.</p>
  <a href="#">Click me</a>
</div>

<style>
  /* These styles are scoped to MyComponent.astro */
  .card {
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 4px;
  }
  p {
    color: navy;
    margin-bottom: 0.5rem;
  }
  a {
    color: blue;
  }
</style>
```

Astro achieves scoping by adding a unique hash attribute to the elements (e.g., `data-astro-cid-XXXX`) and modifying selectors.

## 2. Global Styles

You have several options for applying global styles across your Astro project:

### a. Global CSS Files

-   Create one or more CSS files (e.g., `src/styles/global.css`).
-   Import them into a common layout component or directly into individual pages/components where global styling is needed.
    ```astro
    ---
    // src/layouts/BaseLayout.astro
    import '../styles/global.css'; // Import the global stylesheet
    ---
    <html>
      <head>...</head>
      <body>
        <slot />
      </body>
    </html>
    ```
    This is the most common method for global styles like CSS resets, typography, and global theme variables.

### b. `<style is:global>`

-   You can use a `<style is:global>` tag within an Astro component to define styles that will apply globally. Use this sparingly.
    ```astro
    <style is:global>
      body {
        font-family: sans-serif;
        margin: 0;
      }
      h1, h2, h3 {
        color: #333;
      }
    </style>
    ```
    This is useful for quick global overrides or for styles that must target elements outside of Astro components (e.g., elements injected by third-party scripts).

## 3. CSS Variables (Custom Properties) for Theming

CSS variables are excellent for theming and dynamic styling in Astro.

-   **Define globally**: Typically in your global CSS file or a root layout.

    ```css
    /* src/styles/global.css */
    :root {
    	--primary-color: #007bff;
    	--secondary-color: #6c757d;
    	--text-color: #212529;
    	--font-family-base: 'Arial', sans-serif;
    }

    [data-theme='dark'] {
    	--primary-color: #0056b3;
    	--text-color: #e0e0e0;
    	/* ... other dark theme variables */
    }
    ```

-   **Use in components**:
    ```astro
    <div class="themed-box">Hello Theming!</div>
    <style>
      .themed-box {
        background-color: var(--primary-color);
        color: var(--text-color);
        font-family: var(--font-family-base);
        padding: 1em;
      }
    </style>
    ```
    You can switch themes by changing the `data-theme` attribute on the `<html>` or `<body>` element.

## 4. Sass/SCSS Integration

Astro has built-in support for Sass/SCSS.

1.  **Installation**:
    ```bash
    npm install -D sass
    ```
2.  **Usage**:

    -   Use `.scss` or `.sass` file extensions for your stylesheets.
    -   Import them directly into Astro components or layouts.
    -   Use `lang="scss"` in `<style>` tags within `.astro` files for scoped SCSS.

    ```astro
    ---
    // src/components/Card.astro
    import '../styles/variables.scss'; // If you have global SCSS variables
    ---
    <div class="card">...</div>

    <style lang="scss">
      // Scoped SCSS
      $card-padding: 1.5rem; // Local SCSS variable
      .card {
        padding: $card-padding;
        border: 1px solid var(--primary-color); // Can use CSS vars too

        &:hover {
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
      }
    </style>
    ```

    No additional Vite configuration is usually needed for basic Sass usage.

## 5. PostCSS

Astro uses Vite, which has built-in PostCSS support.

1.  **Installation**: Install PostCSS and any plugins (e.g., Autoprefixer).
    ```bash
    npm install -D postcss autoprefixer
    ```
2.  **Configuration**: Create a `postcss.config.cjs` (or `.js`) file in your project root.
    ```javascript
    // postcss.config.cjs
    module.exports = {
    	plugins: {
    		autoprefixer: {},
    		// other PostCSS plugins...
    	},
    };
    ```
    Astro/Vite will automatically apply these PostCSS transformations.

## 6. Tailwind CSS Integration

Tailwind CSS is a popular choice for Astro projects.

1.  **Installation & Setup**:
    -   Run `npx astro add tailwind` for guided setup, or manually install `tailwindcss`, `postcss`, `autoprefixer`.
    -   This will create `tailwind.config.cjs` and update `postcss.config.cjs`.
    -   Configure `tailwind.config.cjs` (especially the `content` array to include your Astro and UI framework component files).
        ```javascript
        // tailwind.config.cjs
        module.exports = {
        	content: [
        		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        	],
        	// ...
        };
        ```
    -   Ensure Tailwind's directives are in a global CSS file (e.g., `src/styles/tailwind.css`) imported into your main layout.
        ```css
        /* src/styles/tailwind.css */
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```
2.  **Usage**: Use Tailwind utility classes directly in your Astro components or any UI framework components.
    ```astro
    <h1 class="text-3xl font-bold underline text-purple-600 hover:text-orange-500">
      Hello Tailwind in Astro!
    </h1>
    ```

## Styling UI Framework Components

When using UI frameworks (React, Svelte, Vue, etc.) within Astro:

-   Styles defined in the UI framework component itself (e.g., a Svelte component's `<style>` tag) are handled by that framework's compiler and are typically scoped.
-   You can also style these components from the parent Astro component using global CSS classes or by passing down style-related props.
-   Astro's scoped styles will not directly target elements inside a UI framework component's shadow DOM (if applicable) or its own scoped styling system. Use global styles or CSS parts/custom properties if the framework component exposes them.

Astro's flexible styling options allow you to choose the methods that best suit your project's needs and your team's preferences in {projectPath}.

```

```
