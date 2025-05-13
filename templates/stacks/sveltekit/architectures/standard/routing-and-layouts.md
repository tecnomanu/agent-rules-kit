# Routing and Layouts in SvelteKit

This document explains the routing system and layout structure in SvelteKit.

## File-Based Routing

SvelteKit uses a file-based routing system where files in the `src/routes` directory automatically become routes in your application.

### Basic Routes

```
src/routes/
├── +page.svelte         # Home page (/)
├── about/               # /about route
│   └── +page.svelte     # About page
├── blog/                # /blog route
│   ├── +page.svelte     # Blog index
│   └── [slug]/          # Dynamic parameter
│       └── +page.svelte # Individual blog post (/blog/my-post)
└── contact/             # /contact route
    └── +page.svelte     # Contact page
```

## Page Structure

Each route consists of different files that serve specific purposes:

| File                | Purpose                            |
| ------------------- | ---------------------------------- |
| `+page.svelte`      | The page component (UI)            |
| `+page.js`          | Page load function (data fetching) |
| `+page.server.js`   | Server-only page load function     |
| `+layout.svelte`    | Layout component (wraps pages)     |
| `+layout.js`        | Layout load function               |
| `+layout.server.js` | Server-only layout load function   |
| `+error.svelte`     | Error component for the route      |

## Load Functions

Load functions fetch data for pages or layouts:

```javascript
// +page.js
export function load({ params, fetch }) {
	return {
		post: fetch(`/api/posts/${params.slug}`).then((r) => r.json()),
	};
}
```

```svelte
<!-- +page.svelte -->
<script>
  // Data returned from load is available as a prop
  export let data;
  const { post } = data;
</script>

<h1>{post.title}</h1>
<div>{@html post.content}</div>
```

## Layout Hierarchy

Layouts create nested UI structures that wrap pages:

```
src/routes/
├── +layout.svelte           # Root layout (applied to all routes)
├── +page.svelte             # Home page
└── blog/
    ├── +layout.svelte       # Blog layout (wraps all blog routes)
    ├── +page.svelte         # Blog index page
    └── [slug]/
        └── +page.svelte     # Individual blog post
```

## Layout Inheritance

Layouts are inherited down the route tree. A component tree might look like:

```
Root Layout (+layout.svelte)
└── Blog Layout (blog/+layout.svelte)
    └── Blog Post Page (blog/[slug]/+page.svelte)
```

## Layout Groups

You can create layout groups using parentheses, which don't affect URLs:

```
src/routes/
├── (authed)/               # Group for authenticated routes
│   ├── +layout.svelte      # Shared layout for authenticated routes
│   ├── dashboard/
│   │   └── +page.svelte    # /dashboard route
│   └── settings/
│       └── +page.svelte    # /settings route
└── +page.svelte            # Home page (/)
```

## Named Layouts and Slots

Layouts can use named slots for more complex layouts:

```svelte
<!-- +layout.svelte -->
<div class="app">
  <nav>
    <slot name="sidebar" />
  </nav>
  <main>
    <slot />
  </main>
</div>
```

```svelte
<!-- +page.svelte -->
<svelte:fragment slot="sidebar">
  <h3>Navigation</h3>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</svelte:fragment>

<h1>Main Content</h1>
<p>This goes in the default slot</p>
```

## Route Parameters

SvelteKit supports several types of route parameters:

1. **Static routes**: `/about`
2. **Dynamic parameters**: `/blog/[slug]`
3. **Rest parameters**: `/files/[...path]`
4. **Optional parameters**: `/[[lang]]/about`

## Advanced Routing Features

### Route Matchers

```javascript
// src/params/slug.js
export function match(param) {
	return /^[a-z0-9-]+$/.test(param);
}
```

### Server Routes

```javascript
// src/routes/api/posts/+server.js
export function GET() {
	return new Response(JSON.stringify({ posts }), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
```

### Route Hooks

```javascript
// src/hooks.server.js
export async function handle({ event, resolve }) {
	// Before response
	const response = await resolve(event);
	// After response
	return response;
}
```
