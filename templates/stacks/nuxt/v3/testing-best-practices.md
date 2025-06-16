---
description: Testing implementation examples for Nuxt 3
globs: <root>/tests/**/*.spec.ts,<root>/tests/**/*.spec.js,<root>/tests/**/*.test.ts,<root>/tests/**/*.test.js
alwaysApply: false
---

# Nuxt 3 Testing Implementation

This document provides specific code examples for implementing tests in Nuxt 3 applications in {projectPath}.

## Setting Up Testing Environment

### Vitest with Nuxt 3

Configure Vitest in your Nuxt 3 project:

```js
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	plugins: [vue()],
	test: {
		environment: 'jsdom',
		globals: true,
		root: fileURLToPath(new URL('./', import.meta.url)),
	},
	resolve: {
		alias: {
			'~': fileURLToPath(new URL('./', import.meta.url)),
			'@': fileURLToPath(new URL('./', import.meta.url)),
		},
	},
});
```

Add necessary scripts to your package.json:

```json
{
	"scripts": {
		"test": "vitest run",
		"test:watch": "vitest",
		"test:coverage": "vitest run --coverage"
	}
}
```

## Component Testing

### Testing Vue Components in Nuxt 3

Here's how to test components in Nuxt 3:

```js
// components/Counter.vue
<template>
  <div>
    <p data-test="count">Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);
const increment = () => count.value++;
</script>

// tests/components/Counter.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Counter from '~/components/Counter.vue';

describe('Counter Component', () => {
  it('renders and increments count when button is clicked', async () => {
    const wrapper = mount(Counter);

    // Initial state
    expect(wrapper.find('[data-test="count"]').text()).toContain('Count: 0');

    // Interact with component
    await wrapper.find('button').trigger('click');

    // Check updated state
    expect(wrapper.find('[data-test="count"]').text()).toContain('Count: 1');
  });
});
```

### Testing Nuxt-Specific Features

For Nuxt 3-specific features:

```js
// tests/pages/index.test.js
import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import IndexPage from '~/pages/index.vue';

describe('Index Page', () => {
	it('renders the welcome message', async () => {
		const page = await mountSuspended(IndexPage);

		expect(page.text()).toContain('Welcome to Nuxt');
	});
});
```

## Testing Composables

Test custom composables in Nuxt 3:

```js
// composables/useCounter.js
import { ref } from 'vue';

export function useCounter(initialValue = 0) {
	const count = ref(initialValue);

	function increment() {
		count.value++;
	}

	return {
		count,
		increment,
	};
}

// tests/composables/useCounter.test.js
import { describe, it, expect } from 'vitest';
import { useCounter } from '~/composables/useCounter';

describe('useCounter', () => {
	it('initializes with default value', () => {
		const { count } = useCounter();
		expect(count.value).toBe(0);
	});

	it('initializes with provided value', () => {
		const { count } = useCounter(10);
		expect(count.value).toBe(10);
	});

	it('increments the count', () => {
		const { count, increment } = useCounter();
		increment();
		expect(count.value).toBe(1);
	});
});
```

### Testing Nuxt-Specific Composables

For Nuxt 3 composables that use Nuxt's runtime context:

```js
// tests/composables/useNuxtComposable.test.js
import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

// Mock useNuxtApp, useState, etc.
mockNuxtImport('useNuxtApp', () => {
	return () => ({
		$config: {
			public: {
				apiUrl: 'https://api.example.com',
			},
		},
	});
});

mockNuxtImport('useState', () => {
	return (key, init) => {
		return ref(init ? init() : null);
	};
});

// Import the composable AFTER mocking
const { useMyComposable } = await import('~/composables/useMyComposable');

describe('useMyComposable', () => {
	it('uses Nuxt API URL from config', () => {
		const { apiBaseUrl } = useMyComposable();
		expect(apiBaseUrl.value).toBe('https://api.example.com');
	});
});
```

## Testing Pinia Stores

For Nuxt 3 applications using Pinia:

```js
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
	state: () => ({
		count: 0,
		loading: false,
	}),
	actions: {
		increment() {
			this.count++;
		},
		async fetchCount() {
			this.loading = true;
			try {
				const response = await fetch('/api/count');
				const data = await response.json();
				this.count = data.count;
			} finally {
				this.loading = false;
			}
		},
	},
	getters: {
		doubleCount: (state) => state.count * 2,
	},
});

// tests/stores/counter.test.js
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCounterStore } from '~/stores/counter';

describe('Counter Store', () => {
	beforeEach(() => {
		// Create a fresh pinia for each test
		setActivePinia(createPinia());
	});

	it('increments the count', () => {
		const store = useCounterStore();
		expect(store.count).toBe(0);

		store.increment();
		expect(store.count).toBe(1);
	});

	it('fetches the count from API', async () => {
		const store = useCounterStore();

		// Mock global fetch
		global.fetch = vi.fn().mockResolvedValue({
			json: () => Promise.resolve({ count: 42 }),
		});

		await store.fetchCount();

		expect(store.loading).toBe(false);
		expect(store.count).toBe(42);
		expect(global.fetch).toHaveBeenCalledWith('/api/count');
	});

	it('computes double count correctly', () => {
		const store = useCounterStore();
		store.count = 5;
		expect(store.doubleCount).toBe(10);
	});
});
```

## Testing API Routes

Testing Nuxt 3 server API routes:

```js
// server/api/users.get.js
export default defineEventHandler(async (event) => {
	// In a real app, you would query a database
	return [
		{ id: 1, name: 'John Doe' },
		{ id: 2, name: 'Jane Smith' },
	];
});

// tests/server/api/users.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { setup, createMockEventHandler } from '@nuxt/test-utils/runtime';

describe('Users API', () => {
	beforeEach(async () => {
		await setup({
			server: true,
		});
	});

	it('returns list of users', async () => {
		const handler = await import('~/server/api/users.get');
		const mockEvent = createMockEventHandler();

		const result = await handler.default(mockEvent);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBeGreaterThan(0);
		expect(result[0]).toHaveProperty('id');
		expect(result[0]).toHaveProperty('name');
	});
});
```

## Testing Pages with Dynamic Routes

```js
// tests/pages/user.test.js
import { describe, it, expect } from 'vitest';
import { renderSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';
import UserPage from '~/pages/user/[id].vue';

// Mock useAsyncData
mockNuxtImport('useAsyncData', () => {
	return () => ({
		data: ref({ id: 1, name: 'John Doe' }),
		pending: ref(false),
		error: ref(null),
	});
});

// Mock useRoute
mockNuxtImport('useRoute', () => {
	return () => ({
		params: {
			id: '1',
		},
	});
});

describe('User Page', () => {
	it('renders user profile', async () => {
		const page = await renderSuspended(UserPage);

		expect(page.html()).toContain('John Doe');
	});
});
```

## End-to-End Testing with Playwright

```js
// tests/e2e/navigation.spec.js
import { test, expect } from '@playwright/test';

test('navigates from home page to about page', async ({ page }) => {
	// Go to home page
	await page.goto('/');

	// Click the About link
	await page.click('nav >> text=About');

	// Verify we're on the about page
	expect(page.url()).toContain('/about');
	await expect(page.locator('h1')).toContainText('About');
});

test('login flow works correctly', async ({ page }) => {
	// Go to login page
	await page.goto('/login');

	// Fill in the form
	await page.fill('input[name="email"]', 'test@example.com');
	await page.fill('input[name="password"]', 'password123');

	// Submit form
	await page.click('button[type="submit"]');

	// Check that we're redirected to dashboard
	await page.waitForURL('/dashboard');

	// Verify user is logged in
	await expect(page.locator('.user-info')).toContainText('test@example.com');
});
```

## Mocking HTTP Requests with MSW

```js
// tests/components/UserList.test.js
import { mount } from '@vue/test-utils';
import {
	describe,
	it,
	expect,
	vi,
	beforeAll,
	afterEach,
	afterAll,
} from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { flushPromises } from '@vue/test-utils';
import UserList from '~/components/UserList.vue';

// Setup MSW server
const server = setupServer(
	rest.get('/api/users', (req, res, ctx) => {
		return res(
			ctx.json([
				{ id: 1, name: 'John Doe' },
				{ id: 2, name: 'Jane Smith' },
			])
		);
	})
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserList', () => {
	it('fetches and displays users', async () => {
		// Mock useFetch since we're using MSW
		vi.mock('#app', async (importOriginal) => {
			const original = await importOriginal();
			return {
				...original,
				useFetch: vi.fn().mockResolvedValue({
					data: ref([
						{ id: 1, name: 'John Doe' },
						{ id: 2, name: 'Jane Smith' },
					]),
					pending: ref(false),
					error: ref(null),
				}),
			};
		});

		const wrapper = mount(UserList);

		// Wait for API call to resolve
		await flushPromises();

		// Check if users are displayed
		expect(wrapper.text()).toContain('John Doe');
		expect(wrapper.text()).toContain('Jane Smith');
	});
});
```

## Testing Universal Components

```js
// tests/components/universal.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import UniversalComponent from '~/components/UniversalComponent.vue';

describe('UniversalComponent', () => {
	let originalProcess;

	beforeEach(() => {
		originalProcess = global.process;
	});

	afterEach(() => {
		global.process = originalProcess;
	});

	it('behaves correctly on the client side', () => {
		// Mock process.client to true
		vi.stubGlobal('process', { client: true, server: false });

		const wrapper = mount(UniversalComponent);
		expect(wrapper.text()).toContain('Client Side Content');
	});

	it('behaves correctly on the server side', () => {
		// Mock process.server to true
		vi.stubGlobal('process', { client: false, server: true });

		const wrapper = mount(UniversalComponent);
		expect(wrapper.text()).toContain('Server Side Content');
	});
});
```

## Testing Middleware

```js
// middleware/auth.js
export default defineNuxtRouteMiddleware((to) => {
	const user = useState('user');

	if (!user.value && to.path !== '/login') {
		return navigateTo('/login');
	}
});

// tests/middleware/auth.test.js
import { describe, it, expect, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { ref } from 'vue';

describe('Auth Middleware', () => {
	it('redirects to login when user is not authenticated', async () => {
		// Mock useState
		mockNuxtImport('useState', () => {
			return (key) => {
				if (key === 'user') {
					return ref(null); // Unauthenticated
				}
				return ref(null);
			};
		});

		// Mock navigateTo
		const navigateTo = vi.fn();
		mockNuxtImport('navigateTo', () => navigateTo);

		// Import middleware after mocking
		const { default: authMiddleware } = await import('~/middleware/auth');

		// Call middleware with a route that requires auth
		authMiddleware({
			path: '/dashboard',
		});

		// Check that it redirected to login
		expect(navigateTo).toHaveBeenCalledWith('/login');
	});

	it('allows access to protected routes when authenticated', async () => {
		// Mock useState with authenticated user
		mockNuxtImport('useState', () => {
			return (key) => {
				if (key === 'user') {
					return ref({ id: 1, name: 'Test User' }); // Authenticated
				}
				return ref(null);
			};
		});

		// Mock navigateTo
		const navigateTo = vi.fn();
		mockNuxtImport('navigateTo', () => navigateTo);

		// Import middleware after mocking
		const { default: authMiddleware } = await import('~/middleware/auth');

		// Call middleware with a route that requires auth
		authMiddleware({
			path: '/dashboard',
		});

		// Check that it did not redirect
		expect(navigateTo).not.toHaveBeenCalled();
	});
});
```
