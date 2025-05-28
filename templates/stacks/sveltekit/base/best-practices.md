---
description: Best practices for developing robust SvelteKit applications.
globs: <root>/src/**/*.{svelte,js,ts}
alwaysApply: true
---

# SvelteKit Best Practices

This guide outlines best practices for developing robust, maintainable, and performant SvelteKit applications in {projectPath}.

## Effective Use of `load` Functions

`load` functions are central to SvelteKit's data loading mechanism.

-   **Universal vs. Server `load`**:
    -   Use universal `load` functions (in `+page.js` or `+layout.js`) for data fetching that can run on both server and client. This is suitable for public APIs or data that doesn't involve sensitive operations.
    -   Use server `load` functions (in `+page.server.js` or `+layout.server.js`) for:
        -   Direct database access.
        -   Using private API keys or environment variables not exposed to the client.
        -   Operations requiring server-only modules.
    -   Data returned from server `load` is serialized and sent to the client. Be mindful of what you return.

-   **`fetch` in `load`**:
    -   In universal `load` functions, SvelteKit's `fetch` is patched to make relative requests directly to your app's API routes or server `load` functions during SSR, avoiding an HTTP round trip. On the client, it behaves like normal `fetch`.
    -   In server `load` functions, use global `fetch` or a custom HTTP client to fetch data from external APIs.

-   **`depends` for Reactivity**: Use `depends('app:someidentifier')` in universal or server `load` functions to declare dependencies on custom identifiers. Call `invalidate('app:someidentifier')` to re-run these `load` functions. This is useful for data that changes based on non-URL factors.

-   **Error Handling in `load`**:
    -   Use the `error(status, message)` helper from `@sveltejs/kit` to throw HTTP errors. SvelteKit will render the nearest `+error.svelte` boundary.
    -   Handle expected errors gracefully (e.g., item not found).

-   **Streaming Data**: For long-running data fetches, you can return promises for parts of your data from server `load` functions. SvelteKit will stream this data to the client, allowing for faster initial page loads.
    ```typescript
    // +page.server.ts
    export async function load() {
      const slowData = new Promise(resolve => setTimeout(() => resolve({ content: "Slow content ready!" }), 2000));
      return {
        fast: { message: "Fast content available immediately!" },
        streamed: {
          slow: slowData,
        }
      };
    }

    // +page.svelte
    // <script> export let data; </script>
    // <p>{data.fast.message}</p>
    // {#await data.streamed.slow}
    //   <p>Loading slow content...</p>
    // {:then result}
    //   <p>{result.content}</p>
    // {:catch error}
    //   <p>Error: {error.message}</p>
    // {/await}
    ```

## Progressive Enhancement with Form Actions

SvelteKit's form actions are designed for progressive enhancement.

-   **Use Standard HTML Forms**: Start with standard `<form method="POST">`. Actions defined in `+page.server.js` will handle these submissions.
-   **`use:enhance`**: Apply `use:enhance` to a form for client-side enhancement. This prevents full-page reloads, provides callbacks for pending/result states, and allows for custom logic on submission.
-   **Return Values from Actions**: Actions can return data (e.g., validation errors, success messages) which becomes available as the `form` prop in the corresponding `+page.svelte`.
-   **Security**: Form actions provide built-in CSRF protection when `event.cookies.set` is used after a `POST` (typically via `redirect`). SvelteKit also helps mitigate XSS by default with its templating.

## Error Handling

-   **`error` Helper**: Use `import { error } from '@sveltejs/kit'; throw error(404, 'Not found');` in `load` functions or actions to trigger error pages.
-   **`+error.svelte`**: Create custom error pages at different levels of your route hierarchy. The `$page.error` store provides access to the error details.
-   **Server-Side Errors**: Server `load` and actions should handle their own errors. Unhandled exceptions will result in a generic 500 error.
-   **Client-Side Errors**: Use `handleError` in `hooks.client.js` for global client-side error handling.

## Managing Environment Variables

SvelteKit provides modules for accessing environment variables:

-   **`$env/static/private`**: For private environment variables available only on the server (e.g., API keys, database credentials). These are baked in at build time.
-   **`$env/static/public`**: For public environment variables available on both server and client, also baked in at build time. Must be prefixed with `PUBLIC_` (e.g., `PUBLIC_ANALYTICS_ID`).
-   **`$env/dynamic/private`**: (Less common) For private environment variables read at runtime on the server. Requires adapter support.
-   **`$env/dynamic/public`**: (Less common) For public environment variables read at runtime. Requires adapter support and careful consideration of when/how they are loaded on the client.

Use `.env` files for local development. Refer to SvelteKit documentation for specifics on Vite's env handling.

## SSR/CSR and Prerendering Strategies

-   **SSR (Server-Side Rendering)**: Default. Good for SEO and perceived performance.
-   **CSR (Client-Side Rendering)**: `export const ssr = false;` in a `+page.js` or `+layout.js`. Turns the page/layout into a client-rendered SPA section. Useful for highly interactive sections or when server rendering is problematic.
-   **Prerendering**: `export const prerender = true;` in `+page.js` or `+layout.js`. Renders the page to HTML at build time. Suitable for static content like marketing pages, blog posts, documentation.
    -   Can be combined with `ssr = false` for a fully static, client-rendered page after initial load from prerendered HTML.
-   **SPA Mode**: Using `adapter-static` with a fallback page (e.g., `index.html` or `200.html`) can configure the entire app as an SPA.

Choose strategies based on content dynamism, SEO needs, and interactivity requirements.

## Security Considerations

-   **XSS (Cross-Site Scripting)**: Svelte templates escape dynamic text by default, mitigating XSS. Be cautious when using `{@html ...}`. Sanitize user-generated HTML if you must render it.
-   **CSRF (Cross-Site Request Forgery)**: SvelteKit's form actions, when used correctly (especially with `POST`, `PUT`, `DELETE`, `PATCH` requests), have built-in origin checking to help prevent CSRF. Ensure that any server-side state change is done via form actions or API routes that validate origin/session.
-   **Secrets**: Never expose private keys or sensitive credentials in client-side code. Use server `load` functions or server API routes (`+server.js`) and `$env/static/private` for such data.
-   **Data Validation**: Always validate data on the server-side (in actions or API routes), even if client-side validation is present.
-   **Content Security Policy (CSP)**: Implement a CSP via `hooks.server.js` to restrict sources of scripts, styles, etc., enhancing security.

## Performance Optimization

-   **Code Splitting**: SvelteKit automatically code-splits by route.
-   **`fetch` Optimizations**: Data from `load` functions is efficiently passed to components. Server `load` calls on the same server avoid network hops during SSR.
-   **Caching**:
    -   Use `Cache-Control` headers in `+server.js` API routes or server hooks for API responses.
    -   For page data, SvelteKit's `load` functions can leverage `fetch` caching or custom caching strategies on the server.
    -   Service workers can cache assets and API responses.
-   **Image Optimization**: Use responsive images and consider tools like `vite-imagetools` or cloud-based image services.
-   **Bundle Size**: Regularly analyze your bundle (e.g., using `vite-plugin-inspect` or `rollup-plugin-visualizer`) and optimize large dependencies.
-   **Component Performance**: Follow Svelte best practices for component performance (keyed each blocks, minimizing reactive updates where possible).

## Using `$lib` Effectively

-   **Organization**: Structure your `$lib` directory logically (e.g., `$lib/components`, `$lib/utils`, `$lib/stores`, `$lib/server` for server-only code).
-   **Reusability**: Place reusable components, utility functions, and stores in `$lib`.
-   **Server Code**: Code in `$lib/server/` is guaranteed to be server-only. Use this for database clients, authentication helpers that use private env vars, etc.
-   **Avoid Circular Dependencies**: Be mindful of import paths to prevent circular dependencies between modules in `$lib`.

By adhering to these best practices, you can build scalable, secure, and high-performing SvelteKit applications in {projectPath}.
```
