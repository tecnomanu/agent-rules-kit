# Nuxt.js Architecture Concepts

This document outlines the core architectural concepts and patterns used in Nuxt.js applications in {projectPath}.

## Nuxt Framework Overview

Nuxt is a meta-framework built on top of Vue.js that provides:

-   Server-side rendering (SSR)
-   Static site generation (SSG)
-   Client-side rendering (CSR)
-   File-based routing
-   Auto-imports
-   Server API routes
-   Optimized build process

## Rendering Modes

Nuxt supports multiple rendering strategies:

### Universal Rendering (Default)

-   **Server-side rendering + hydration**: Pages first render on the server, then hydrate on the client
-   Provides the best SEO and initial load performance
-   Works in most scenarios

### Static Site Generation

-   Pre-renders all pages at build time
-   Creates static HTML files for deployment to CDNs
-   Configured via `nuxt.config.ts`:
    ```js
    export default defineNuxtConfig({
    	nitro: {
    		prerender: {
    			routes: ['/about', '/blog/article-1'],
    		},
    	},
    });
    ```

### Client-Side Rendering

-   For SPA-like behavior
-   Render components exclusively on the client
-   Less optimal for SEO
-   Use with `<ClientOnly>` component or in the Composition API:
    ```js
    // Only render on client
    if (process.client) {
    	// Client-only code
    }
    ```

## Directory Structure

Nuxt follows a conventional directory structure:

```
project/
├── .nuxt/                  # Build directory (auto-generated)
├── assets/                 # Static assets that will be processed
├── components/             # Vue components (auto-imported)
│   ├── ui/                 # UI components
│   └── feature/            # Feature-specific components
├── composables/            # Composable functions (auto-imported)
├── content/                # Markdown/JSON content for Nuxt Content
├── layouts/                # Layout components
├── middleware/             # Route middleware
├── pages/                  # Application pages (file-based routing)
├── plugins/                # Nuxt plugins
├── public/                 # Static assets served as-is
├── server/                 # Server-side logic
│   ├── api/                # API endpoints
│   └── middleware/         # Server middleware
├── stores/                 # Pinia stores
├── app.vue                 # The main application component
├── error.vue               # Error page
├── nuxt.config.ts          # Nuxt configuration
└── package.json            # Project dependencies
```

## Auto-Imports

One of Nuxt's key features is automatic imports:

-   **Components**: All files in `/components` are auto-imported
-   **Composables**: All files in `/composables` are auto-imported
-   **Plugins**: All files in `/plugins` are auto-loaded
-   **Nuxt APIs**: Built-in functions like `useState`, `useRoute`, etc.

Example of auto-imports in action:

```vue
<template>
	<div>
		<h1>{{ title }}</h1>
		<AppButton @click="increment">Count: {{ count }}</AppButton>
	</div>
</template>

<script setup>
// No imports needed for these:
const count = useState('count', () => 0);
const route = useRoute();
const title = computed(() => `Page ${route.path}`);

const { increment } = useCounter(); // Auto-imports from /composables
</script>
```

## Routing Architecture

Nuxt uses file-based routing in the `/pages` directory:

```
pages/
├── index.vue              # / route
├── about.vue              # /about route
├── users/
│   ├── index.vue          # /users route
│   ├── [id].vue           # /users/:id dynamic route
│   └── profile.vue        # /users/profile route
└── blog-[slug].vue        # /blog-:slug route
```

### Route Middleware

Middleware runs before navigating to a route:

```js
// middleware/auth.js - Named middleware
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useState('user');

  if (!user.value && to.path !== '/login') {
    return navigateTo('/login');
  }
});

// In a page component
definePageMeta({
  middleware: ['auth']
});

// Global middleware applies to all routes
// middleware/global.global.js
export default defineNuxtRouteMiddleware((to, from) => {
  console.log(`Navigating from ${from.path} to ${to.path}`);
});
```

## State Management

### Local Component State

For simple state within a component:

```vue
<script setup>
const count = ref(0);
const increment = () => count.value++;
</script>
```

### Shared State with useState

Nuxt provides `useState` for shared state across components:

```js
// composables/useCounter.js
export const useCounter = () => {
	const count = useState('counter', () => 0);

	function increment() {
		count.value++;
	}

	return {
		count,
		increment,
	};
};
```

### Pinia Stores (Recommended for Complex State)

For larger applications, use Pinia:

```js
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
	state: () => ({
		count: 0,
		todos: [],
	}),

	actions: {
		increment() {
			this.count++;
		},

		async fetchTodos() {
			this.todos = await $fetch('/api/todos');
		},
	},

	getters: {
		doubleCount: (state) => state.count * 2,
	},
});
```

## Data Fetching

Nuxt provides several ways to fetch data:

### useAsyncData

Fetch data before a component renders:

```js
const { data, pending, refresh } = await useAsyncData(
	'users', // Unique key
	() => $fetch('/api/users')
);
```

### useFetch

Simplified API for common fetch scenarios:

```js
const { data, pending, error, refresh } = await useFetch('/api/users', {
	// Options
	method: 'POST',
	body: { name: 'John' },
	query: { limit: 10 },
	headers: { 'Content-Type': 'application/json' },
});
```

### Server-Only Data Fetching

For improved security and performance:

```js
// server/utils/db.js
export const getUsers = () => {
	// This code only runs on the server
	return db.query('SELECT * FROM users');
};

// pages/users.vue
const { data } = await useAsyncData('users', () => {
	return $fetch('/api/users');
});
```

## Server Routes

Define API endpoints in the `server/api` directory:

```js
// server/api/users/index.get.js
export default defineEventHandler(async (event) => {
  // This only runs on the server
  const users = await db.query('SELECT * FROM users');
  return users;
});

// server/api/users/[id].get.js
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return user;
});
```

## Layouts and Page Structure

Nuxt provides a layered approach to page structure:

```vue
<!-- layouts/default.vue -->
<template>
	<div>
		<AppHeader />
		<main>
			<slot />
			<!-- Page content goes here -->
		</main>
		<AppFooter />
	</div>
</template>

<!-- pages/index.vue -->
<template>
	<div>
		<h1>Home Page</h1>
		<p>Welcome to my Nuxt app</p>
	</div>
</template>

<script setup>
// Use a specific layout
definePageMeta({
	layout: 'custom',
});
</script>
```

## Modularity and Organization

For large Nuxt applications, consider organizing by feature:

```
src/
├── components/
│   ├── ui/                # Design system components
│   └── common/            # Shared components
├── features/
│   ├── auth/
│   │   ├── components/    # Auth-specific components
│   │   ├── composables/   # Auth-specific composables
│   │   └── stores/        # Auth-specific stores
│   └── products/
│       ├── components/
│       ├── composables/
│       └── stores/
├── layouts/
├── pages/
└── server/
    ├── api/
    │   ├── auth/
    │   └── products/
    └── utils/
```

## Plugins

Use plugins to add global functionality:

```js
// plugins/api.js
export default defineNuxtPlugin((nuxtApp) => {
	const apiClient = {
		async get(url) {
			return $fetch(url);
		},
		async post(url, data) {
			return $fetch(url, {
				method: 'POST',
				body: data,
			});
		},
	};

	// Make available throughout the app
	return {
		provide: {
			api: apiClient,
		},
	};
});

// Use in components
<script setup>
	const {$api} = useNuxtApp(); const data = await $api.get('/users');
</script>;
```

## Composables

Create reusable logic with composables:

```js
// composables/useAuth.js
export function useAuth() {
	const user = useState('user', () => null);
	const isAuthenticated = computed(() => !!user.value);

	async function login(credentials) {
		const response = await $fetch('/api/auth/login', {
			method: 'POST',
			body: credentials,
		});

		user.value = response.user;
		return response;
	}

	function logout() {
		user.value = null;
		return navigateTo('/login');
	}

	return {
		user,
		isAuthenticated,
		login,
		logout,
	};
}
```

## SEO and Meta Tags

Manage SEO with the `useHead` composable:

```vue
<script setup>
useHead({
	title: 'My Nuxt App',
	meta: [
		{ name: 'description', content: 'Welcome to my Nuxt application' },
		{ property: 'og:title', content: 'My Nuxt App' },
		{
			property: 'og:description',
			content: 'Welcome to my Nuxt application',
		},
		{ property: 'og:image', content: '/social-image.jpg' },
	],
	link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
});
</script>
```

## Error Handling

Nuxt provides built-in error handling:

-   Create `error.vue` in the root directory for a custom error page
-   Use `createError` to create standardized errors:

```js
if (!user) {
	throw createError({
		statusCode: 404,
		statusMessage: 'User not found',
		fatal: true,
	});
}
```

## Performance Patterns

Key patterns for Nuxt performance:

1. **Code Splitting**: Automatic route-based code splitting
2. **Lazy Loading**: Import components with `defineAsyncComponent`
3. **Prefetching and Preloading**: Automatic for linked pages
4. **Image Optimization**: Using Nuxt Image module
5. **Caching Strategy**: Use appropriate headers for API responses

## Architecture Decision Framework

Consider these factors when making architecture decisions:

1. **Rendering Strategy**: Choose based on content type and update frequency
2. **State Management**: Use built-in Nuxt state for simple cases, Pinia for complex
3. **API Strategy**: Decide between server routes, server functions or external APIs
4. **SEO Requirements**: Influence rendering choices and meta tag strategy
5. **Performance Goals**: Guide choices for lazy loading, caching, etc.
