---
description: Guide to SvelteKit 2.0, focusing on new features like middleware, streaming, and enhanced type safety.
globs: <root>/src/**/*.{svelte,js,ts},<root>/svelte.config.js
alwaysApply: true # Applies if v2 is detected
---

# SvelteKit 2.0 Implementation Guide

This guide provides implementation details specific to SvelteKit 2.0, focusing on the new features and changes from SvelteKit 1.0.

## Project Setup

Create a new SvelteKit 2.0 project:

```bash
# Create a new project with the latest version
npm create svelte@latest my-app

# Install dependencies
cd my-app
npm install

# Start development server
npm run dev
```

To upgrade an existing SvelteKit project to 2.0:

```bash
# Update dependencies
npm install @sveltejs/kit@latest svelte@latest vite@latest
```

## Key Changes in SvelteKit 2.0

### New Middleware API

SvelteKit 2.0 introduces a new middleware approach via server hooks:

```javascript
// src/hooks.server.js
export function middleware({ event, resolve }) {
	// Run code before response
	console.log(
		`Handling ${event.request.method} request to ${event.url.pathname}`
	);

	// Continue with the response
	return resolve(event);
}
```

Middleware is more versatile and can be applied hierarchically in your routes using `+middleware.server.js` files.

### New Route Organization

In SvelteKit 2.0, you can organize routes using directories with special naming conventions:

```
src/routes/
├── (authenticated)/           # Group that doesn't affect URL structure
│   ├── +middleware.server.js  # Middleware for this group
│   ├── dashboard/
│   │   └── +page.svelte       # /dashboard
│   └── settings/
│       └── +page.svelte       # /settings
├── [[lang=locale]]/           # Optional parameter with type constraint
│   └── +page.svelte           # / or /en or /es etc.
└── +page.svelte               # Home page (/)
```

### Enhanced Type Safety

SvelteKit 2.0 provides better TypeScript integration:

```typescript
// src/app.d.ts
declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				role: 'admin' | 'user';
			} | null;
		}

		interface PageData {
			user?: {
				name: string;
				avatar: string;
			};
		}
		// interface Error {} // You can also define a type for expected errors
		// interface Platform {} // For platform-specific context from adapter
	}
}

export {};
```

### Server-Only Modules

SvelteKit 2.0 strengthens the boundary between server and client code:

```javascript
// $lib/server/database.js - Never sent to the browser
// import { DB } from 'some-database'; // Replace with your actual DB client
// export const db = new DB(process.env.DB_URL);

// In +page.server.js
// import { db } from '$lib/server/database';

// export async function load() {
// 	const data = await db.query('SELECT * FROM posts');
// 	return { posts: data };
// }
```

### Streaming Support

SvelteKit 2.0 adds support for streaming with the new `deferred` function:

```javascript
// +page.server.js
import { deferred } from '@sveltejs/kit';

export function load() {
	return {
		// Available immediately
		title: 'My Blog',

		// Streams in later, without blocking initial render
		posts: deferred(async () => {
			// Simulate a slow fetch
			await new Promise(resolve => setTimeout(resolve, 2000));
			const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5'); // Example API
			return res.json();
		}),
	};
}
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  export let data;

  // data.posts is a promise when using deferred
  const { title, posts } = data;
</script>

<h1>{title}</h1>

{#await posts}
  <p>Loading posts...</p>
{:then loadedPosts}
  <ul>
    {#each loadedPosts as post}
      <li>{post.title}</li>
    {/each}
  </ul>
{:catch error}
  <p style="color: red;">Error loading posts: {error.message}</p>
{/await}
```

### Universal Load Functions

SvelteKit 2.0 simplifies universal (client + server) data loading:

```javascript
// +page.js
export async function load({ fetch, depends }) {
	// This runs on server for SSR, then again on client for hydration (unless data is already there)
	depends('app:posts'); // Cache dependency label for invalidation

	const response = await fetch('/api/posts'); // Assumes an API route at /api/posts
	return { posts: await response.json() };
}
```

### Advanced Form Actions

Enhanced form handling with `fail` for validation errors and `redirect` for navigation.

```javascript
// +page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	createPost: async ({ request, locals }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		const content = formData.get('content');

		// Validation
		if (!title || title.length < 3) {
			return fail(400, { title, content, error: 'Title must be at least 3 characters' });
		}
		if (!content) {
			return fail(400, { title, content, error: 'Content cannot be empty' });
		}

		// Create post (example, replace with your DB logic)
		// const post = await locals.db.posts.create({ title, content });
        const post = { slug: 'new-post-slug' }; // Placeholder

		// Redirect after successful action
		throw redirect(303, `/posts/${post.slug}`);
	},
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  export let form; // ActionData
</script>

<form
  method="POST"
  action="?/createPost"
  use:enhance
>
  <div>
    <label for="title">Title</label>
    <input name="title" id="title" value={form?.title ?? ''}>
    {#if form?.error && form?.title === undefined /* crude check, refine based on error structure */}
      <p class="error">{form.error}</p>
    {/if}
  </div>

  <div>
    <label for="content">Content</label>
    <textarea name="content" id="content">{form?.content ?? ''}</textarea>
    {#if form?.error && form?.content === undefined}
        <p class="error">{form.error}</p>
    {/if}
  </div>
  <button>Create Post</button>

  {#if form?.error && form?.title !== undefined && form?.content !== undefined}
    <p class="error">{form.error}</p>
  {/if}
</form>
```
*Note: The `use:enhance` and `form` prop interaction provides progressive enhancement.*

## Data Fetching Strategies

SvelteKit 2.0 continues to offer flexible data fetching strategies:

### 1. Server-side Rendering (SSR)
   - Default behavior. `load` functions run on the server.

### 2. Static Site Generation (SSG)
   - Use `export const prerender = true;` in `+page.js` or `+page.server.js`.
   - `entries` export can specify dynamic routes to prerender.

### 3. Client-side Rendering (CSR)
   - `export const ssr = false;` in `+page.js` or `+layout.js`. The page/layout will be client-rendered.

### 4. Incremental Static Regeneration (ISR)
   - SvelteKit doesn't have a direct "ISR" flag like Next.js. You achieve similar effects by:
     - Prerendering pages (`prerender = true`).
     - Using serverless functions (e.g., on Vercel, Netlify) for API routes or server `load` functions that re-fetch data and can be cached by the platform's CDN with stale-while-revalidate (SWR) cache headers.

## Best Practices for SvelteKit 2.0

1. **Embrace Server-Side Logic**: Utilize `+page.server.js` and `$lib/server/` for secure and efficient data handling.
2. **Type Safety**: Fully leverage TypeScript with SvelteKit's generated types for `PageData`, `ActionData`, `Locals`, etc. (`./$types`).
3. **Progressive Enhancement**: Build forms and interactions that work without JavaScript first, then enhance with `use:enhance`.
4. **Streaming with `deferred`**: Use for non-critical data to improve perceived performance.
5. **Effective Caching**: Use `depends` for cache invalidation and understand how `fetch` caching works in `load` functions.
6. **Error Handling**: Utilize `+error.svelte` boundaries and the `handleError` hook for robust error management.
7. **Security**: Be mindful of XSS (use `{@html}` cautiously), CSRF (form actions help), and properly managing secrets in server-only code.
8. **Modular Code**: Organize reusable logic and components in `$lib`.
9. **Adapters**: Choose the correct adapter for your deployment target and understand its capabilities (e.g., support for dynamic environment variables).
10. **Stay Updated**: Follow SvelteKit releases for new features and performance improvements.

SvelteKit 2.0 continues to refine the developer experience, making it a powerful choice for building modern web applications.
