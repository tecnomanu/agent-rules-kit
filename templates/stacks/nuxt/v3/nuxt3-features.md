---
tAbtitle: Nuxt 3 Features and Best Practices
description: Comprehensive guide for Nuxt 3 features and implementation patterns
tags: [Nuxt, Vue, SSR, TypeScript]
globs: ./**/*
always: true
---

# Nuxt 3 Features Guide

## Core Features

### 1. Composition API Integration

```typescript
// composables/useCounter.ts
export const useCounter = () => {
	const count = ref(0);
	const increment = () => count.value++;
	const decrement = () => count.value--;

	return {
		count: readonly(count),
		increment,
		decrement,
	};
};
```

### 2. Auto-imports

-   Components in `components/` directory
-   Composables in `composables/` directory
-   Utils in `utils/` directory
-   Server routes in `server/api/` directory

```typescript
// No imports needed
const { count, increment } = useCounter();
const { data } = await useFetch('/api/users');
```

### 3. Hybrid Rendering Modes

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	routeRules: {
		'/': { prerender: true },
		'/blog/**': { swr: 3600 },
		'/admin/**': { ssr: false },
	},
});
```

### 4. Server Components and Utils

```typescript
// server/utils/auth.ts
export const verifyToken = (token: string) => {
	// Implementation
};

// server/api/auth.ts
export default defineEventHandler(async (event) => {
	const { token } = await readBody(event);
	return verifyToken(token);
});
```

## Data Management

### 1. State Management

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', {
	state: () => ({
		user: null,
		isAuthenticated: false,
	}),
	actions: {
		async login(credentials) {
			// Implementation
		},
	},
});
```

### 2. Data Fetching

```typescript
// pages/posts/[id].vue
const route = useRoute();
const { data: post } = await useFetch(`/api/posts/${route.params.id}`, {
	transform: (post) => ({
		...post,
		createdAt: new Date(post.createdAt),
	}),
});
```

## Performance Optimization

### 1. Asset Handling

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	image: {
		provider: 'cloudinary',
		cloudinary: {
			baseURL: 'https://res.cloudinary.com/my-account',
		},
	},
});
```

### 2. Lazy Loading

```vue
<template>
	<NuxtPage />
	<LazyHeavyComponent v-if="shouldLoad" />
</template>
```

## Security Features

### 1. Runtime Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	runtimeConfig: {
		apiSecret: '', // server-only
		public: {
			apiBase: '', // client & server
		},
	},
});
```

### 2. Authentication Handling

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
	const user = useUser(); // custom composable
	if (!user.value && to.path !== '/login') {
		return navigateTo('/login');
	}
});
```

## Development Tools

### 1. DevTools Integration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	devtools: {
		enabled: true,
		timeline: true,
	},
});
```

### 2. TypeScript Support

```typescript
// types/index.d.ts
declare module '#app' {
	interface PageMeta {
		requiresAuth?: boolean;
	}
}
```

## Testing Integration

### 1. Component Testing

```typescript
// tests/MyComponent.test.ts
import { mount } from '@vue/test-utils';
import MyComponent from '~/components/MyComponent.vue';

describe('MyComponent', () => {
	test('renders properly', () => {
		const wrapper = mount(MyComponent);
		expect(wrapper.text()).toContain('Expected Text');
	});
});
```

### 2. API Testing

```typescript
// tests/api/users.test.ts
import { describe, test, expect } from 'vitest';
import { $fetch } from '@nuxt/test-utils';

describe('/api/users', () => {
	test('returns users list', async () => {
		const users = await $fetch('/api/users');
		expect(users).toBeInstanceOf(Array);
	});
});
```

## Error Handling

### 1. Error Pages

```vue
<!-- error.vue -->
<template>
	<div>
		<h1>{{ error.statusCode }}</h1>
		<p>{{ error.message }}</p>
		<button @click="handleError">Try Again</button>
	</div>
</template>

<script setup>
const error = useError();
const handleError = () => clearError({ redirect: '/' });
</script>
```

### 2. API Error Handling

```typescript
// server/middleware/error.ts
export default defineEventHandler((event) => {
	const error = getError(event);
	if (error) {
		setResponseStatus(event, error.statusCode || 500);
		return {
			statusCode: error.statusCode,
			message: error.message,
		};
	}
});
```

## Build Optimization

### 1. Nitro Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	nitro: {
		preset: 'vercel',
		minify: true,
		compressPublicAssets: true,
	},
});
```

### 2. Module Integration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/image'],
	tailwindcss: {
		cssPath: '~/assets/css/tailwind.css',
		configPath: 'tailwind.config.js',
	},
});
```
