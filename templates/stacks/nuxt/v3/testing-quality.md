---
title: Nuxt 3 Testing and Code Quality Guide
description: Comprehensive guide for testing and maintaining code quality in Nuxt 3
tags: [Nuxt, Testing, Quality, Best Practices]
globs: ./**/*
always: true
---

# Nuxt 3 Testing and Code Quality Guide

## Testing Setup

### 1. Basic Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	plugins: [vue()],
	test: {
		environment: 'jsdom',
		globals: true,
		coverage: {
			provider: 'c8',
			reporter: ['text', 'json', 'html'],
			exclude: ['coverage/**', 'dist/**', '**/*.d.ts', 'test/**'],
		},
	},
	resolve: {
		alias: {
			'~': fileURLToPath(new URL('./src', import.meta.url)),
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
```

### 2. Testing Utilities

```typescript
// test/utils/test-utils.ts
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import type { Config } from '@nuxt/schema';

export function createTestConfig(config: Partial<Config> = {}) {
	return {
		runtimeConfig: {
			public: {
				apiBase: 'http://localhost:3000',
				...config,
			},
		},
	};
}

export function mountWithPlugins(component: any, options = {}) {
	return mount(component, {
		global: {
			plugins: [
				createTestingPinia({
					createSpy: vi.fn,
				}),
			],
			stubs: {
				NuxtLink: true,
				ClientOnly: true,
			},
			...options.global,
		},
		...options,
	});
}
```

## Component Testing

### 1. Component Unit Tests

```typescript
// components/UserCard.test.ts
import { describe, test, expect } from 'vitest';
import { mountWithPlugins } from '~/test/utils/test-utils';
import UserCard from './UserCard.vue';

describe('UserCard', () => {
	test('renders user information', () => {
		const user = {
			name: 'John Doe',
			email: 'john@example.com',
		};

		const wrapper = mountWithPlugins(UserCard, {
			props: { user },
		});

		expect(wrapper.text()).toContain(user.name);
		expect(wrapper.text()).toContain(user.email);
	});

	test('emits update event', async () => {
		const wrapper = mountWithPlugins(UserCard);

		await wrapper.find('[data-test="update-button"]').trigger('click');

		expect(wrapper.emitted('update')).toHaveLength(1);
	});
});
```

### 2. Composable Testing

```typescript
// composables/useUsers.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUsers } from './useUsers';

describe('useUsers', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	test('fetches users', async () => {
		const { users, fetchUsers } = useUsers();

		expect(users.value).toHaveLength(0);

		await fetchUsers();

		expect(users.value).toHaveLength(2);
		expect(users.value[0]).toHaveProperty('name');
	});
});
```

## Integration Testing

### 1. API Integration Tests

```typescript
// server/api/users.test.ts
import { describe, test, expect } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

describe('Users API', async () => {
	await setup({
		server: true,
		browser: false,
	});

	test('creates a user', async () => {
		const user = {
			name: 'John Doe',
			email: 'john@example.com',
		};

		const response = await $fetch('/api/users', {
			method: 'POST',
			body: user,
		});

		expect(response).toHaveProperty('id');
		expect(response.name).toBe(user.name);
	});

	test('handles validation errors', async () => {
		try {
			await $fetch('/api/users', {
				method: 'POST',
				body: { name: '' },
			});
		} catch (error) {
			expect(error.response.status).toBe(400);
			expect(error.response._data.message).toContain('name');
		}
	});
});
```

### 2. Page Testing

```typescript
// pages/users/[id].test.ts
import { describe, test, expect } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';
import { createPage, url } from '~/test/utils/page';

describe('User Detail Page', async () => {
	await setup({
		server: true,
		browser: true,
	});

	test('displays user details', async () => {
		const page = await createPage();

		await page.goto(url('/users/1'));

		await expect(page.locator('[data-test="user-name"]')).toContainText(
			'John Doe'
		);

		await expect(page.locator('[data-test="user-email"]')).toContainText(
			'john@example.com'
		);
	});
});
```

## E2E Testing

### 1. User Flow Testing

```typescript
// e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
	test('allows creating and editing users', async ({ page }) => {
		// Login
		await page.goto('/login');
		await page.fill('[data-test="email"]', 'admin@example.com');
		await page.fill('[data-test="password"]', 'password');
		await page.click('[data-test="submit"]');

		// Create user
		await page.goto('/users/new');
		await page.fill('[data-test="name"]', 'New User');
		await page.fill('[data-test="email"]', 'new@example.com');
		await page.click('[data-test="save"]');

		// Verify creation
		await expect(page.locator('.success-message')).toContainText(
			'User created'
		);

		// Edit user
		await page.click('[data-test="edit"]');
		await page.fill('[data-test="name"]', 'Updated Name');
		await page.click('[data-test="save"]');

		// Verify update
		await expect(page.locator('.success-message')).toContainText(
			'User updated'
		);
	});
});
```

### 2. API Performance Testing

```typescript
// e2e/api-performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('API Performance', () => {
	test('loads user list within performance budget', async ({ page }) => {
		const [response] = await Promise.all([
			page.waitForResponse('**/api/users'),
			page.goto('/users'),
		]);

		expect(response.status()).toBe(200);

		const timing = response.request().timing();
		expect(timing.responseEnd - timing.requestStart).toBeLessThan(300);
	});
});
```

## Code Quality Tools

### 1. ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
	root: true,
	extends: [
		'@nuxtjs/eslint-config-typescript',
		'plugin:nuxt/recommended',
		'plugin:vue/vue3-recommended',
	],
	rules: {
		'vue/multi-word-component-names': 'off',
		'vue/no-multiple-template-root': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			},
		],
		'import/order': [
			'error',
			{
				groups: [
					'builtin',
					'external',
					'internal',
					'parent',
					'sibling',
					'index',
				],
				'newlines-between': 'always',
			},
		],
	},
};
```

### 2. TypeScript Configuration

```typescript
// tsconfig.json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "types": [
      "@nuxt/types",
      "@nuxtjs/i18n",
      "@pinia/nuxt",
      "vitest/globals"
    ],
    "paths": {
      "~/*": ["./*"],
      "@/*": ["./*"]
    }
  },
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 3. Git Hooks

```typescript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged

// package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "vitest related --run"
    ],
    "*.{css,vue}": [
      "stylelint --fix"
    ]
  }
}
```

## Test Coverage and Reporting

### 1. Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
	test: {
		coverage: {
			provider: 'c8',
			reporter: ['text', 'json', 'html', 'lcov'],
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80,
		},
	},
});
```

### 2. CI Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: pnpm/action-setup@v2
            - uses: actions/setup-node@v3
              with:
                  node-version: '18'
                  cache: 'pnpm'

            - name: Install dependencies
              run: pnpm install

            - name: Run linter
              run: pnpm lint

            - name: Run type check
              run: pnpm type-check

            - name: Run tests
              run: pnpm test

            - name: Upload coverage
              uses: codecov/codecov-action@v3
              with:
                  file: ./coverage/lcov.info
```
