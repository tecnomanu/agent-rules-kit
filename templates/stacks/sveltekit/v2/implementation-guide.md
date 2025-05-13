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
	}
}

export {};
```

### Server-Only Modules

SvelteKit 2.0 strengthens the boundary between server and client code:

```javascript
// $lib/server/database.js - Never sent to the browser
import { DB } from 'some-database';
export const db = new DB(process.env.DB_URL);

// In +page.server.js
import { db } from '$lib/server/database';

export async function load() {
	const data = await db.query('SELECT * FROM posts');
	return { posts: data };
}
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
			const res = await fetch('https://api.example.com/posts');
			return res.json();
		}),
	};
}
```

```svelte
<!-- +page.svelte -->
<script>
  export let data;

  // data.posts is a promise
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
{/await}
```

### Universal Load Functions

SvelteKit 2.0 simplifies universal (client + server) data loading:

```javascript
// +page.js
export async function load({ fetch, depends }) {
	// This runs on server for SSR, then again on client for hydration
	depends('posts'); // Cache dependency label

	const response = await fetch('/api/posts');
	return { posts: await response.json() };
}
```

### Advanced Form Actions

Enhanced form handling:

```javascript
// +page.server.js
export const actions = {
	createPost: async ({ request, locals }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		const content = formData.get('content');

		// Validation
		if (!title || title.length < 3) {
			return fail(400, { title, missing: true });
		}

		// Create post
		const post = await locals.db.posts.create({ title, content });

		// Redirect after successful action
		throw redirect(303, `/posts/${post.slug}`);
	},
};
```

```svelte
<!-- +page.svelte -->
<script>
  export let form;
</script>

<form method="POST" action="?/createPost">
  <input name="title" value={form?.title ?? ''}>
  {#if form?.missing}
    <p class="error">Title must be at least 3 characters</p>
  {/if}

  <textarea name="content"></textarea>
  <button>Create Post</button>
</form>
```

### Progressive Enhancement

SvelteKit 2.0 makes progressive enhancement easier:

```svelte
<!-- +page.svelte -->
<script>
  import { enhance } from '$app/forms';
  export let form;
</script>

<form
  method="POST"
  action="?/createPost"
  use:enhance={() => {
    return {
      result({ form, update }) {
        update(); // Update form state
      }
    };
  }}
>
  <!-- Form fields -->
</form>
```

## Data Fetching Strategies

SvelteKit 2.0 offers multiple data fetching strategies:

### 1. Server-side Rendering (SSR)

```javascript
// +page.server.js
export const load = async ({ fetch }) => {
	const posts = await fetch('/api/posts').then((r) => r.json());
	return { posts };
};
```

### 2. Static Site Generation (SSG)

```javascript
// +page.server.js
export const prerender = true;

export const load = async ({ fetch }) => {
	const posts = await fetch('/api/posts').then((r) => r.json());
	return { posts };
};
```

### 3. Client-side Rendering (CSR)

```javascript
// +page.js
export const ssr = false;

export const load = async ({ fetch }) => {
	const posts = await fetch('/api/posts').then((r) => r.json());
	return { posts };
};
```

### 4. Incremental Static Regeneration (ISR)

```javascript
// +page.server.js
export const prerender = true;
export const entries = () => [{ slug: 'first-post' }, { slug: 'second-post' }];

export const load = async ({ params, fetch }) => {
	const post = await fetch(`/api/posts/${params.slug}`).then((r) => r.json());
	return { post };
};
```

## Best Practices for SvelteKit 2.0

1. **Use the new middleware pattern** instead of the legacy hooks approach
2. **Leverage route groups** for logical organization without affecting URLs
3. **Keep sensitive code in server-only modules** in `$lib/server`
4. **Use type-safe forms and actions** for better developer experience
5. **Implement progressive enhancement** with `use:enhance`
6. **Use streaming with `deferred`** for improved UX with slow data sources
7. **Properly type your application** using the App namespace
8. **Use `@error` and `@catch` blocks** in components for fine-grained error handling
9. **Take advantage of page options** like `export const prerender = true` for optimal deployment
10. **Implement proper invalidation strategies** with `depends()` for client-side updates
