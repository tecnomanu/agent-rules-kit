---
title: Nuxt 3 Migration and Update Guide
description: Best practices for migrating to and updating Nuxt 3 applications
tags: [Nuxt, Migration, Updates, Best Practices]
globs: ./**/*
always: true
---

# Nuxt 3 Migration and Update Guide

## Migration from Nuxt 2

### 1. Project Structure Changes

```
nuxt-app/
├── app.vue          # New in Nuxt 3
├── components/      # Auto-imported
├── composables/     # Auto-imported
├── layouts/         # Optional directory
├── middleware/      # Route middleware
├── pages/           # File-based routing
├── plugins/         # App plugins
├── public/          # Static assets
└── server/          # Server routes & middleware
```

### 2. Configuration Updates

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	// Removed options from Nuxt 2
	mode: 'universal', // Removed
	build: {
		extractCSS: true, // No longer needed
	},

	// New Nuxt 3 options
	experimental: {
		payloadExtraction: true,
	},
	nitro: {
		preset: 'node-server',
	},
});
```

### 3. Component Migration

#### Nuxt 2

```vue
<template>
	<div>
		<client-only>
			<component-name />
		</client-only>
	</div>
</template>

<script>
export default {
	asyncData({ $axios }) {
		return $axios.$get('/api/data');
	},
};
</script>
```

#### Nuxt 3

```vue
<template>
	<div>
		<ClientOnly>
			<ComponentName />
		</ClientOnly>
	</div>
</template>

<script setup>
const { data } = await useFetch('/api/data');
</script>
```

### 4. Store Migration

#### Nuxt 2 (Vuex)

```typescript
// store/index.js
export const state = () => ({
	counter: 0,
});

export const mutations = {
	increment(state) {
		state.counter++;
	},
};
```

#### Nuxt 3 (Pinia)

```typescript
// stores/counter.ts
export const useCounterStore = defineStore('counter', {
	state: () => ({
		count: 0,
	}),
	actions: {
		increment() {
			this.count++;
		},
	},
});
```

## Update Best Practices

### 1. Dependency Management

```typescript
// package.json
{
  "dependencies": {
    "nuxt": "^3.0.0",
    "@nuxt/image": "^1.0.0",
    "@pinia/nuxt": "^0.5.0"
  },
  "devDependencies": {
    "@nuxtjs/eslint-config-typescript": "^12.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 2. TypeScript Migration

```typescript
// types/index.d.ts
declare module '#app' {
	interface PageMeta {
		auth?: boolean;
	}
}

// Strongly typed runtime config
declare module '@nuxt/schema' {
	interface RuntimeConfig {
		apiSecret: string;
		public: {
			apiBase: string;
		};
	}
}
```

### 3. API Updates

#### Old API Routes

```typescript
// api/users.js
export default async (req, res) => {
	return res.json({ users: [] });
};
```

#### New Nitro Routes

```typescript
// server/api/users.ts
export default defineEventHandler(async (event) => {
	return { users: [] };
});
```

### 4. Composable Migration

#### Old Mixins

```javascript
// mixins/auth.js
export default {
	computed: {
		isAuthenticated() {
			return !!this.$store.state.user;
		},
	},
	methods: {
		login() {
			// Implementation
		},
	},
};
```

#### New Composables

```typescript
// composables/useAuth.ts
export const useAuth = () => {
	const user = useState('user', () => null);

	const isAuthenticated = computed(() => !!user.value);

	async function login(credentials: Credentials) {
		// Implementation
	}

	return {
		user: readonly(user),
		isAuthenticated,
		login,
	};
};
```

## Testing Updates

### 1. Migration from Jest to Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	test: {
		environment: 'jsdom',
	},
});
```

### 2. Component Testing Updates

```typescript
// Old Jest Test
import { mount } from '@vue/test-utils';
import MyComponent from './MyComponent.vue';

describe('MyComponent', () => {
	test('renders properly', () => {
		const wrapper = mount(MyComponent);
		expect(wrapper.text()).toContain('Hello');
	});
});

// New Vitest Test with Nuxt Test Utils
import { mountSuspended } from '@nuxt/test-utils/runtime';
import MyComponent from './MyComponent.vue';

describe('MyComponent', async () => {
	test('renders properly', async () => {
		const component = await mountSuspended(MyComponent);
		expect(component.text()).toContain('Hello');
	});
});
```

## Performance Optimization Updates

### 1. Image Optimization

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	image: {
		provider: 'ipx',
		screens: {
			xs: 320,
			sm: 640,
			md: 768,
			lg: 1024,
			xl: 1280,
			xxl: 1536,
			'2xl': 1536,
		},
		presets: {
			avatar: {
				modifiers: {
					format: 'webp',
					fit: 'cover',
					quality: '80',
				},
			},
		},
	},
});
```

### 2. Build Optimization

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	nitro: {
		compressPublicAssets: {
			brotli: true,
		},
		serverAssets: [
			{
				baseName: 'uploads',
				dir: './uploads',
			},
		],
		storage: {
			cache: {
				driver: 'fs',
				base: './.cache/nitro',
			},
		},
	},
	experimental: {
		inlineSSRStyles: false,
		viewTransition: true,
		renderJsonPayloads: true,
	},
});
```

## Error Handling Updates

### 1. Global Error Handling

```typescript
// plugins/error-tracking.ts
export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
		// Modern error tracking
		if (process.client) {
			reportErrorToService(error, {
				component: instance?.$options.name,
				info,
				version: nuxtApp.version,
			});
		}
	};

	// Handle Nuxt specific errors
	nuxtApp.hook('vue:error', (..._args) => {
		console.log('vue:error');
		// Handle error
	});

	// Handle app level errors
	if (process.client) {
		window.onerror = function (msg, source, lineNo, columnNo, error) {
			// Handle error
		};
	}
});
```

### 2. API Error Handling

```typescript
// server/middleware/error-handler.ts
export default defineEventHandler((event) => {
	const error = getError(event);

	if (!error) return;

	// Modern error response structure
	return {
		statusCode: error.statusCode || 500,
		message: error.message,
		data: error.data,
		stack: process.dev ? error.stack : undefined,
		context: {
			path: event.path,
			method: event.method,
		},
	};
});
```

## Security Updates

### 1. Modern Security Headers

```typescript
// server/middleware/security.ts
export default defineEventHandler((event) => {
	const headers = getHeaders(event);

	// Set security headers
	setResponseHeaders(event, {
		'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'SAMEORIGIN',
		'X-XSS-Protection': '1; mode=block',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	});
});
```

### 2. Modern Authentication

```typescript
// composables/useAuth.ts
export const useAuth = () => {
	const user = useState('user', () => null);
	const token = useCookie('auth_token');

	const login = async (credentials: Credentials) => {
		try {
			const { token: newToken, user: userData } = await $fetch(
				'/api/auth/login',
				{
					method: 'POST',
					body: credentials,
				}
			);

			token.value = newToken;
			user.value = userData;

			// Modern security measures
			if (process.client) {
				// Store refresh token in HTTP-only cookie
				document.cookie = `refresh_token=${newToken}; Secure; HttpOnly; SameSite=Strict`;
			}
		} catch (error) {
			handleAuthError(error);
		}
	};

	return {
		user: readonly(user),
		login,
		logout: () => {
			user.value = null;
			token.value = null;
		},
	};
};
```
