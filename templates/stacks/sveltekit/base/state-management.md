---
description: Overview of state management strategies in SvelteKit.
globs: <root>/src/**/*.{svelte,js,ts}
alwaysApply: true
---

# State Management in SvelteKit Applications

SvelteKit builds upon Svelte's native state management capabilities (stores, component state) and introduces patterns that leverage its full-stack nature. Choosing the right strategy for {projectPath} depends on where the state lives, who needs it, and its lifecycle.

## 1. Svelte Stores (`writable`, `readable`, `derived`)

Svelte stores are the cornerstone of reactive state management in Svelte and SvelteKit. They are suitable for:
-   **App-wide UI state**: Theme (dark/light mode), user preferences, mobile navigation open/closed.
-   **Shared client-side data**: Data fetched on the client that needs to be accessible by multiple components.
-   **Caching client-side data**: Storing results from API calls made from the browser.

```javascript
// src/lib/stores/cartStore.ts
import { writable, derived } from 'svelte/store';

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export const cartItems = writable<CartItem[]>([]);

export const cartTotal = derived(cartItems, ($items) => {
  return $items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

export function addToCart(item: Omit<CartItem, 'quantity'>) {
  cartItems.update(items => {
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
      return [...items];
    }
    return [...items, { ...item, quantity: 1 }];
  });
}
```
-   **Usage**: Import and use with `$` auto-subscription in `.svelte` files.
-   **Scope**: Stores are typically defined in `src/lib` to be easily importable.
-   **Server vs. Client**: Standard Svelte stores are primarily client-side. If initialized with data from the server, this data needs to be passed from `load` functions. Be cautious about creating singleton stores on the server that might inadvertently share state between requests; stores used on the server should typically be request-scoped or managed carefully.

## 2. Page and Layout Data (`load` functions)

SvelteKit's `load` functions (in `+page.js`, `+layout.js`, `+page.server.js`, `+layout.server.js`) are the primary way to fetch data for pages and layouts. The data returned from `load` is automatically made available to the corresponding component via the `data` prop.

-   **Server-Side Data**: Data fetched in `+page.server.js` or `+layout.server.js` runs only on the server. Ideal for sensitive data operations or direct database access.
-   **Universal (Shared) Data**: Data fetched in `+page.js` or `+layout.js` can run on both server (during SSR) and client (during client-side navigation).
-   **Reactivity**: The `data` prop is reactive. If `invalidate` or `depends` are used correctly, `load` functions can re-run, and the component will update.

```typescript
// src/routes/products/[id]/+page.server.ts
import type { PageServerLoad } from './$types';
import db from '$lib/server/db'; // Example database client

export const load: PageServerLoad = async ({ params }) => {
  const product = await db.getProduct(params.id);
  if (!product) {
    throw error(404, 'Product not found');
  }
  return { product }; // This becomes `data.product` in +page.svelte
};

// src/routes/products/[id]/+page.svelte
<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData; // Data from load function
</script>

<h1>{data.product.name}</h1>
<p>{data.product.description}</p>
```
- **State Nature**: This is primarily "props-driven" state for components. It's excellent for data that defines the content of a page or layout.

## 3. `$app/stores`

SvelteKit provides built-in stores for app-level concerns:

-   **`page` store**:
    -   Provides reactive access to information about the current page: `url`, `params`, `route.id`, `status`, `error`, and `data` (from all active `load` functions).
    -   Automatically updated by SvelteKit during navigation.
    -   Crucial for components that need to react to route changes or access page data.
    ```svelte
    <script lang="ts">
      import { page } from '$app/stores';
    </script>

    <p>Current path: {$page.url.pathname}</p>
    <p>Product ID: {$page.params.id}</p> <!-- If on a route like /products/[id] -->
    <p>Page title from load: {$page.data.pageTitle}</p> <!-- If pageTitle is returned from a load function -->
    ```
-   **`navigating` store**:
    -   Indicates whether a client-side navigation is in progress. Contains `from` and `to` route information or `null`.
    -   Useful for showing global loading indicators.
-   **`updated` store**:
    -   A boolean store that becomes `true` if a new version of the app is detected, then `false` again. Useful for prompting users to refresh.

## 4. Form Action State (`enhance` and `HTMLFormElement.requestSubmit()`)

SvelteKit's form actions manage form submission state. When using progressive enhancement with `use:enhance`:
- The `enhance` function provides an `applyAction` callback which receives an `ActionResult`. This result contains `status`, `type`, and `data`.
- You can use this `ActionResult` to update local component state, display success/error messages, or reset the form.

```svelte
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import type { ActionData } from './$types';
  import { enhance } from '$app/forms';

  export let form: ActionData; // Data returned from the form action
  let isLoading = false;
</script>

<form method="POST" action="?/login" use:enhance={() => {
  isLoading = true;
  return async ({ result, update }) => {
    // `result` contains status, type, data from action
    // `form` prop will be updated automatically if action returns data
    // await update(); // Manually trigger reset and update; often not needed for `form`
    isLoading = false;
  };
}}>
  <!-- form inputs -->
  <button type="submit" disabled={isLoading}>
    {#if isLoading}Logging in...{:else}Login{/if}
  </button>

  {#if form?.error}
    <p style="color: red;">{form.error}</p>
  {/if}
  {#if form?.successMessage}
    <p style="color: green;">{form.successMessage}</p>
  {/if}
</form>
```
- The `form` prop, when exported from a `+page.svelte`, is automatically populated with the data returned from a form action. This is a key way SvelteKit manages state related to form submissions.

## 5. URL as State

The URL itself can be a powerful way to manage state, especially for:
-   Filters and sort orders (query parameters: `?sort=price&order=asc`).
-   Pagination (`?page=2`).
-   UI state that should be bookmarkable and shareable.
SvelteKit's `goto` function from `$app/navigation` can be used to update URL parameters, and the `page` store or `load` functions can react to these changes.

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let searchTerm = $page.url.searchParams.get('q') || '';

  function applySearch() {
    const newUrl = new URL($page.url);
    newUrl.searchParams.set('q', searchTerm);
    goto(newUrl.toString(), { keepFocus: true, replaceState: true });
  }
</script>

<input type="search" bind:value={searchTerm} />
<button on:click={applySearch}>Search</button>
```

## Conceptual Differences from Client-Side Svelte State

-   **Server Interaction**: SvelteKit is full-stack. State can originate from the server via `load` functions. This is different from client-only Svelte where all initial state is either hardcoded or fetched client-side.
-   **Data Flow**: The `load` function and `data` prop create a clear data flow from server/shared code to components.
-   **Form Handling**: Form actions provide a robust, progressively enhanced way to manage form state and server communication, reducing the need for manual client-side `fetch` calls for simple mutations.
-   **Scope of Stores**: While Svelte stores work the same, in SvelteKit, you must be mindful of where they are instantiated and used. A store created in a `.server.js` file is typically a new instance per request, whereas a store in `$lib` imported into client-side code behaves like a client-side singleton.

## When to Choose Which Approach

-   **Local Component UI State**: Svelte's reactive `let` and `$: ` (or Runes in Svelte 5).
-   **Data Defining a Page/Layout**: `load` functions.
-   **Global Client-Side UI State (Theme, Modals, etc.)**: Svelte stores in `$lib`.
-   **Reacting to Route/URL Changes**: `$app/stores` (especially the `page` store).
-   **Form Submission Feedback/Errors**: `form` prop and `enhance` with `ActionResult`.
-   **Shareable/Bookmarkable UI State**: URL query parameters.
-   **Cross-Cutting Client-Side Data**: Svelte stores, potentially initialized or updated via data from `load` or API calls.

By understanding these different mechanisms, you can manage state effectively and idiomatically in your SvelteKit applications at {projectPath}.
```
