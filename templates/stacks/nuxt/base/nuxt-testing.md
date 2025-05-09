# Nuxt.js Testing Guide

This guide outlines the recommended approach to testing Nuxt.js applications in {projectPath}.

## Testing Stack

For Nuxt.js applications, we recommend these testing tools:

-   **Vitest**: Primary testing framework for unit and component tests
-   **@nuxt/test-utils**: Nuxt-specific testing utilities
-   **Vue Test Utils**: For component testing
-   **Cypress/Playwright**: For end-to-end testing
-   **MSW (Mock Service Worker)**: For API mocking

## Setting Up Testing Environment

### Vitest with Nuxt

Configure Vitest in your Nuxt project:

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

### Testing Vue Components in Nuxt

Nuxt components can be tested like Vue components, with additional Nuxt-specific features:

```js
// components/Counter.vue
<template>
  <div>
    <p>Count: {{ count }}</p>
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
    expect(wrapper.text()).toContain('Count: 0');

    // Interact with component
    await wrapper.find('button').trigger('click');

    // Check updated state
    expect(wrapper.text()).toContain('Count: 1');
  });
});
```

### Testing Nuxt-Specific Features

For Nuxt-specific features like pages, layouts, and plugins, use `@nuxt/test-utils`:

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

Test custom composables with proper Vue and Nuxt context:

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
import { ref } from 'vue';
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

### Testing Nuxt Composables

For Nuxt-specific composables that use Nuxt's runtime context:

```js
// tests/composables/useNuxtComposable.test.js
import { describe, it, expect, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
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

// Import the composable AFTER mocking
// (This needs to be dynamic to pick up the mocks)
const { useMyComposable } = await import('~/composables/useMyComposable');

describe('useMyComposable', () => {
	it('uses Nuxt API URL from config', () => {
		const { apiBaseUrl } = useMyComposable();
		expect(apiBaseUrl.value).toBe('https://api.example.com');
	});
});
```

## Testing Pinia Stores

For Nuxt applications using Pinia stores:

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
});
```

## Testing API Routes (Server Routes)

For testing Nuxt server API routes:

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

## Testing Pages and Layouts

Test full Nuxt pages with routing context:

```js
// tests/pages/user.test.js
import { describe, it, expect } from 'vitest';
import { renderSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';
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

## End-to-End Testing

Use Cypress or Playwright for E2E testing:

```js
// cypress/e2e/navigation.cy.js
describe('Navigation', () => {
	it('navigates from home page to about page', () => {
		// Visit the home page
		cy.visit('/');

		// Find the link to the about page and click it
		cy.get('nav').contains('About').click();

		// Verify we're on the about page
		cy.url().should('include', '/about');
		cy.get('h1').should('contain', 'About');
	});
});
```

With Playwright:

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
```

## Mocking HTTP Requests

Mock API calls in component tests:

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

For components that behave differently in client vs. server environments:

```js
// tests/components/universal.test.js
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UniversalComponent from '~/components/UniversalComponent.vue';

describe('UniversalComponent', () => {
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

For testing Nuxt middleware:

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

// Mock Nuxt functions
mockNuxtImport('useState', () => {
	return (key) => {
		if (key === 'user') {
			return ref(null); // Unauthenticated
		}
		return ref(null);
	};
});

const navigateTo = vi.fn();
mockNuxtImport('navigateTo', () => navigateTo);

describe('Auth Middleware', () => {
	it('redirects to login when user is not authenticated', async () => {
		const middleware = await import('~/middleware/auth');

		// Call middleware with a route that requires auth
		middleware.default({
			path: '/dashboard',
		});

		// Check that it redirected to login
		expect(navigateTo).toHaveBeenCalledWith('/login');
	});
});
```

## Best Practices for Nuxt Testing

1. **Isolation**: Test components and functionalities in isolation
2. **Mocking**: Use mocks for external dependencies and APIs
3. **E2E for Flows**: Use E2E tests for critical user journeys
4. **CI Integration**: Run tests in CI pipelines before deployment
5. **Coverage Tracking**: Track test coverage to identify untested code

## Testing Coverage Goals

Aim for these coverage targets:

-   **Components**: 80%+ coverage
-   **Composables**: 90%+ coverage
-   **Stores**: 90%+ coverage
-   **Server Routes**: 90%+ coverage
-   **E2E**: Cover all critical user paths
