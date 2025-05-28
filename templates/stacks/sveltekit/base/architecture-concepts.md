---
description: Core architectural concepts of SvelteKit applications.
globs: <root>/src/**/*.{svelte,js,ts},<root>/svelte.config.js,<root>/vite.config.js
alwaysApply: true
---

# SvelteKit Architectural Concepts

SvelteKit is a full-stack application framework powered by Svelte. It provides a structured approach to building web applications of all sizes, from static sites to complex dynamic apps. Understanding its core architecture is key to leveraging its capabilities in {projectPath}.

## SvelteKit as a Full-Stack Framework

Unlike Svelte (which is a component compiler), SvelteKit handles the entire application structure:
-   **Routing**: File-system based routing for pages and API endpoints.
-   **Server-Side Rendering (SSR)**: Pages are rendered on the server by default, improving performance and SEO.
-   **Client-Side Hydration**: Server-rendered HTML is enhanced with client-side interactivity.
-   **Build Process**: Optimized builds for production, including code splitting, adapter-based deployments, etc.
-   **Data Loading**: Integrated `load` functions for fetching data for pages and layouts.
-   **Form Handling**: Progressively enhanced form actions.

## Core Project Structure

A typical SvelteKit project has the following key directories:

-   **`src/`**: Contains all your application code.
    -   **`app.html`**: The HTML template for all pages. SvelteKit injects content, scripts, and styles here.
    -   **`hooks.server.js` / `hooks.server.ts`**: Server-side hooks allow you to intercept and modify requests and responses (e.g., for authentication, logging).
    -   **`hooks.client.js` / `hooks.client.ts`**: Client-side hooks (less common, e.g., for error handling).
    -   **`lib/`**: Your application's internal library. Used for Svelte components, utility functions, modules, stores, server-side code (e.g., `$lib/server/db.ts`), etc.
        -   Code in `$lib` can be imported using the `$lib` alias: `import MyComponent from '$lib/components/MyComponent.svelte';`.
        -   Code intended only for the server should be in `$lib/server/` or have names ending in `.server.js/ts`.
    -   **`params/`**: Optional directory for parameter matchers, allowing custom validation or transformation of route parameters.
    -   **`routes/`**: Defines the structure of your application using file-system routing.
    -   **`service-worker.js` / `service-worker.ts`**: Optional service worker for PWA features.
-   **`static/`**: Contains static assets that are served as-is (e.g., `favicon.png`, `robots.txt`).
-   **`svelte.config.js`**: Configuration for SvelteKit, including adapters, preprocessors, and Vite plugin options.
-   **`vite.config.js` / `vite.config.ts`**: Vite build tool configuration.

## File-System Routing (`src/routes/`)

SvelteKit uses the file system to define routes. Each directory inside `src/routes/` creates a new URL segment. Special file names define what is served for a route:

-   **`+page.svelte`**: Defines a page component. This is the UI for a specific route.
    -   Example: `src/routes/about/+page.svelte` maps to the `/about` URL.
-   **`+layout.svelte`**: Defines a layout component that wraps `+page.svelte` files and nested layouts. Layouts are hierarchical and persist during navigation within their segment.
    -   Example: `src/routes/products/+layout.svelte` would apply to all pages under `/products/*`.
    -   The root layout is `src/routes/+layout.svelte`.
-   **`+error.svelte`**: Defines a custom error page for rendering errors that occur during `load` functions or server-side rendering for that route segment and its children.
    -   The root error page is `src/routes/+error.svelte`.
-   **`+page.js` / `+page.ts`**: Contains a `load` function that runs on both server (during SSR) and client (during client-side navigation). Used for fetching data that doesn't require direct server access or secrets. Can also export page options like `ssr`, `csr`, `prerender`.
-   **`+layout.js` / `+layout.ts`**: Similar to `+page.js` but for layouts. Its `load` function data is available to the layout and all its child pages.
-   **`+page.server.js` / `+page.server.ts`**: Contains a `load` function that *only* runs on the server. Used for fetching data that requires direct database access, private API keys, or other server-only operations. Can also export server-side `actions` for form handling.
-   **`+layout.server.js` / `+layout.server.ts`**: Similar to `+page.server.js` but for layouts. Its `load` function data is available to the layout and all its child pages, fetched only on the server.
-   **`+server.js` / `+server.ts` (API Routes)**: Defines request handlers for specific HTTP methods (e.g., `GET`, `POST`, `PUT`, `DELETE`). This allows you to create API endpoints.
    -   Example: `src/routes/api/items/+server.ts` can handle requests to `/api/items`.

## Server-Side Logic

SvelteKit clearly delineates server-side code:
-   Files ending in `.server.js` or `.server.ts` (like `+page.server.js`, `hooks.server.js`) *only* run on the server.
-   Modules imported *only* by these server files are also server-only and won't be bundled for the client.
-   Code inside `src/lib/server/` is guaranteed to only be available on the server.
This allows safe access to databases, private environment variables, and other server-side resources.

## Hooks

Hooks allow you to run code in response to SvelteKit's lifecycle events:
-   **`hooks.server.js` / `hooks.server.ts`**:
    -   `handle({ event, resolve })`: Intercepts every request made to the SvelteKit server (SSR page requests, API requests, form submissions). Useful for authentication, logging, setting response headers, or modifying the event object.
    -   `handleFetch({ request, event, fetch })`: Intercepts `fetch` calls made within `load` functions or server-side actions on the server.
    -   `handleError({ error, event })`: Called when an unexpected error occurs on the server.
-   **`hooks.client.js` / `hooks.client.ts`**:
    -   `handleError({ error, event, status, message })`: Called when an unexpected error occurs during client-side rendering or navigation.

## Rendering Strategies

SvelteKit supports various rendering strategies, configurable per-page or globally:
-   **Server-Side Rendering (SSR)**: (Default) Pages are rendered to HTML on the server and sent to the client, which then hydrates the page for interactivity. Good for SEO and perceived performance. `export const ssr = true;` (default).
-   **Client-Side Rendering (CSR)**: The page is rendered entirely in the browser. The server sends a minimal HTML shell. `export const ssr = false;`. This makes the page behave like a traditional SPA for that route.
-   **Prerendering**: Pages are rendered to HTML files at build time. Ideal for static content that doesn't change often. `export const prerender = true;`.
-   **SPA Mode (Adapter-Specific)**: Some adapters (like `adapter-static` with `fallback: 'index.html' or '200.html'`) can configure the entire application to behave like a Single Page Application, where all rendering is client-side after the initial load.

## Adapters

Adapters are plugins that take the output of SvelteKit's build process and adapt it for deployment to a specific platform.
-   Examples: `adapter-node` (for Node.js servers), `adapter-vercel`, `adapter-netlify`, `adapter-static` (for static site generation).
-   Configuration is done in `svelte.config.js`.

By understanding these architectural components, developers can effectively structure and build applications with SvelteKit, taking full advantage of its full-stack capabilities, flexible rendering, and developer-friendly features in {projectPath}.
```
