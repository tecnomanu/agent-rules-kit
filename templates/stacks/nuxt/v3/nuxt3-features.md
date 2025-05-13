---
description: Nuxt 3 specific features and best practices
globs: <root>/app.vue,<root>/components/**/*.{vue,ts,js},<root>/nuxt.config.{js,ts}
alwaysApply: false
---

# Nuxt 3 Specific Features

This document outlines features and best practices specific to Nuxt 3 applications in {projectPath}.

## Key Nuxt 3 Features

### Composition API by Default

Nuxt 3 fully embraces Vue 3's Composition API as the recommended approach:

```vue
<script setup>
const count = ref(0);
const doubleCount = computed(() => count.value * 2);

function increment() {
	count.value++;
}
</script>

<template>
	<div>
		<p>Count: {{ count }}</p>
		<p>Double: {{ doubleCount }}</p>
		<button @click="increment">Increment</button>
	</div>
</template>
```

### TypeScript Support

Nuxt 3 is built with TypeScript and provides excellent type support:

```ts
// types/index.ts
export interface User {
	id: string;
	name: string;
	email: string;
}

// In your component
const user = ref<User | null>(null);

// Type-safe props
const props = defineProps<{
	id: string;
	required: boolean;
	optional?: string;
}>();
```

### Nitro Server Engine

Nuxt 3 uses Nitro, a powerful server engine:

```ts
// server/api/hello.ts
export default defineEventHandler((event) => {
	return {
		message: 'Hello World',
	};
});

// server/api/data.post.ts
export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	return { received: body };
});
```

### Improved File-based Routing

Nuxt 3 enhances its file-based routing system:

```
pages/
├── index.vue               # /
├── about.vue               # /about
├── posts/
│   ├── index.vue           # /posts
│   ├── [id].vue            # /posts/:id
│   └── [...slug].vue       # /posts/** (catch-all)
└── user-[group]/[id].vue   # /user-admin/123, /user-mod/456
```

### New Composables

Nuxt 3 provides powerful built-in composables:

```ts
// Navigation
const router = useRouter();
const route = useRoute();
await navigateTo('/dashboard');

// Data fetching
const { data: users } = await useFetch('/api/users');
const { data: user } = await useFetch(() => `/api/users/${id.value}`);

// Runtime config
const config = useRuntimeConfig();
console.log(config.public.apiBase);

// Error handling
throw createError({
	statusCode: 404,
	statusMessage: 'Page Not Found',
});
```

### Server Components & Islands Architecture

Nuxt 3 supports server-only components and islands:

```vue
<!-- components/ServerOnly.server.vue -->
<script setup>
// This code only runs on the server
import { sensitiveOperation } from '~/server/utils';
const result = sensitiveOperation();
</script>

<template>
	<div>Result: {{ result }}</div>
</template>
```

### Nuxt DevTools

Nuxt 3 includes built-in DevTools:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
	devtools: {
		enabled: true,
		timeline: true,
		// other options
	},
});
```

## State Management in Nuxt 3

### Shared State with useState

```ts
// Simple shared state
const counter = useState('counter', () => 0);

// More complex state
const user = useState('user', () => ({
	name: '',
	loggedIn: false,
	preferences: {},
}));
```

### Pinia Integration

```ts
// stores/counter.ts
export const useCounterStore = defineStore('counter', () => {
	// State
	const count = ref(0);

	// Getters
	const doubleCount = computed(() => count.value * 2);

	// Actions
	function increment() {
		count.value++;
	}

	return { count, doubleCount, increment };
});
```

## API and Data Fetching

### Handle API Requests

```ts
// With useFetch (recommended)
const { data, pending, error, refresh } = await useFetch('/api/users', {
	method: 'POST',
	body: { name: 'John' },
	pick: ['id', 'name'], // Pick specific properties
	transform: (users) =>
		users.map((user) => ({
			...user,
			fullName: `${user.firstName} ${user.lastName}`,
		})),
});

// With useAsyncData for more control
const { data, pending } = await useAsyncData('users', () =>
	$fetch('/api/users', {
		method: 'GET',
		params: { limit: 10 },
	})
);
```

### Server-Only Data Operations

```ts
// server/utils/db.js
export async function getUsers() {
	// This runs only on the server
	// Can safely connect to DB, use API keys, etc.
	return await db.users.findMany();
}

// In your page
const { data } = await useAsyncData('users', () => {
	return $fetch('/api/users'); // This calls a server route
});
```

## Modules and Configuration

### Common Nuxt 3 Modules

```ts
// nuxt.config.ts
export default defineNuxtConfig({
	modules: [
		'@pinia/nuxt',
		'@nuxtjs/tailwindcss',
		'@nuxtjs/color-mode',
		'nuxt-icon',
		'@nuxt/content',
	],

	// Module configuration
	tailwindcss: {
		cssPath: '~/assets/css/tailwind.css',
		configPath: 'tailwind.config.js',
	},

	colorMode: {
		classSuffix: '',
	},

	// Runtime config
	runtimeConfig: {
		// Server-only keys
		apiSecret: process.env.API_SECRET,

		// Public keys
		public: {
			apiBase: process.env.API_BASE || '/api',
		},
	},
});
```

## Performance Best Practices for Nuxt 3

1. **Use Nuxt Image** for optimized images

    ```vue
    <nuxt-img src="/image.jpg" width="200" height="150" format="webp" />
    ```

2. **Implement Component Lazy Loading** for non-critical components

    ```vue
    <LazyMyHeavyComponent v-if="isVisible" />
    ```

3. **Leverage Edge-Side Rendering** when applicable

    ```ts
    export default defineNuxtConfig({
    	nitro: {
    		preset: 'vercel-edge',
    	},
    });
    ```

4. **Use Suspense for Loading States**

    ```vue
    <Suspense>
      <template #default>
        <AsyncComponent />
      </template>
      <template #fallback>
        <LoadingSpinner />
      </template>
    </Suspense>
    ```

5. **Implement Proper Caching Strategies**
    ```ts
    const { data } = await useFetch('/api/data', {
    	key: 'unique-key',
    	getCachedData: (key) => sessionStorage.getItem(key),
    });
    ```
