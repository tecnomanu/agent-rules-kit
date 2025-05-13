# SvelteKit 1.0 Implementation Guide

This guide provides implementation details specific to SvelteKit 1.0, including project setup, key features, and best practices.

## Project Setup

Create a new SvelteKit project:

```bash
# Create a new project
npm create svelte@latest my-app

# Install dependencies
cd my-app
npm install

# Start development server
npm run dev
```

During setup, you'll be asked about:

-   TypeScript support
-   ESLint/Prettier/Playwright support
-   Whether to use SvelteKit's built-in forms helper

## Adapter Configuration

SvelteKit uses adapters to build for different environments. The default is `@sveltejs/adapter-auto` which detects your deployment platform.

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
	},
};

export default config;
```

Common adapters:

-   `adapter-node` - for Node.js servers
-   `adapter-static` - for static site generation
-   `adapter-vercel`, `adapter-netlify` - for specific platforms

## Project Structure

Standard SvelteKit 1.0 project structure:

```
my-app/
├── src/
│   ├── app.html                  # HTML template
│   ├── hooks.client.js           # Client hooks
│   ├── hooks.server.js           # Server hooks
│   ├── params/                   # Parameter matchers
│   │   └── ...
│   ├── routes/                   # Routes
│   │   ├── +layout.svelte        # Root layout
│   │   ├── +layout.server.js     # Server-side layout data
│   │   ├── +page.svelte          # Home page
│   │   └── ...
│   └── lib/                      # Library code
│       ├── components/           # Shared components
│       ├── server/               # Server-only code
│       └── ...
├── static/                       # Static assets
├── vite.config.js                # Vite config
├── svelte.config.js              # SvelteKit config
└── package.json
```

## Server vs. Client Code

SvelteKit allows explicitly marking server-only code:

```
src/
├── routes/
│   ├── +page.js         # Runs on client & server
│   ├── +page.server.js  # Runs on server ONLY
│   └── +page.svelte     # Component - compiled to client JS
└── lib/
    ├── utils.js         # Shared between client & server
    └── server/          # Server-only modules
        └── db.js
```

Import server-only modules with a `$lib/server` prefix:

```javascript
import { db } from '$lib/server/db';
```

## Page Options

Control universal vs. server rendering:

```javascript
// +page.js
export const prerender = true; // Generate static HTML at build time
// or
export const ssr = false; // Client-side rendering only
// or
export const csr = false; // No JS shipped to the client (HTML only)
```

## Form Actions

SvelteKit 1.0 has built-in form handling:

```javascript
// +page.server.js
export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');

		// Process form data
		await saveToDatabase(name);

		return { success: true };
	},
};
```

```svelte
<!-- +page.svelte -->
<script>
  export let form;
</script>

<form method="POST">
  <input name="name">
  <button>Submit</button>

  {#if form?.success}
    <p>Form submitted successfully!</p>
  {/if}
</form>
```

## Loading Data

SvelteKit 1.0 uses the `load` function for data fetching:

```javascript
// +page.server.js
export async function load({ params, fetch, cookies, locals }) {
	const response = await fetch(`/api/posts/${params.slug}`);

	if (response.ok) {
		return {
			post: await response.json(),
		};
	}

	throw error(404, 'Post not found');
}
```

## Environment Variables

Access environment variables safely:

```javascript
// +page.server.js (server-side)
import { env } from '$env/dynamic/private';
const secret = env.SECRET_KEY;

// +page.js (shared)
import { env } from '$env/dynamic/public';
const publicKey = env.PUBLIC_API_KEY;
```

## Authentication

Basic authentication pattern:

```javascript
// src/hooks.server.js
export async function handle({ event, resolve }) {
	const session = event.cookies.get('session');

	if (session) {
		const user = await getUser(session);
		if (user) {
			event.locals.user = user;
		}
	}

	return resolve(event);
}
```

## Error Handling

Custom error pages:

```svelte
<!-- +error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error.message}</h1>
```

## Best Practices for SvelteKit 1.0

1. **Use TypeScript** for better type safety and editor support
2. **Server-side render by default** for better SEO and performance
3. **Put shared logic in `$lib`** to reuse across your application
4. **Use `+page.server.js` for sensitive operations** to keep them server-side
5. **Leverage form actions** for form handling instead of custom event handlers
6. **Use layout groups** to share layouts without affecting URLs
7. **Implement proper error boundaries** with `+error.svelte` files
8. **Keep API routes in their own directory** (`/api` or similar)
9. **Use path aliases** like `$lib` instead of relative paths
10. **Leverage SvelteKit's built-in hooks** for global middleware
