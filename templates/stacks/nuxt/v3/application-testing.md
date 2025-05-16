---
title: Nuxt 3 Application Testing Guide
description: Comprehensive guide for testing Nuxt 3 applications including unit, integration, and e2e testing
tags: [Nuxt, Testing, Integration, E2E]
globs: ./**/*
always: true
---

# Nuxt 3 Application Testing Guide

## Testing Strategy

### 1. Testing Pyramid Structure

```typescript
// tests/
// ├── unit/           # Unit tests
// ├── integration/    # Integration tests
// ├── e2e/           # End-to-end tests
// └── fixtures/      # Test fixtures

// package.json
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 2. Test Configuration

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
		setupFiles: ['./tests/setup.ts'],
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

// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
		video: 'on-first-retry',
	},
	projects: [
		{
			name: 'chromium',
			use: { browserName: 'chromium' },
		},
	],
});
```

## Unit Testing

### 1. Component Testing

```typescript
// tests/unit/components/ProductCard.test.ts
import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProductCard from '~/components/ProductCard.vue';

describe('ProductCard', () => {
	const product = {
		id: 1,
		name: 'Test Product',
		price: 99.99,
		image: '/test.jpg',
	};

	test('renders product information', () => {
		const wrapper = mount(ProductCard, {
			props: { product },
		});

		expect(wrapper.text()).toContain(product.name);
		expect(wrapper.text()).toContain(product.price.toString());
		expect(wrapper.find('img').attributes('src')).toBe(product.image);
	});

	test('emits add-to-cart event', async () => {
		const wrapper = mount(ProductCard, {
			props: { product },
		});

		await wrapper.find('[data-test="add-to-cart"]').trigger('click');
		expect(wrapper.emitted('add-to-cart')?.[0]).toEqual([product.id]);
	});
});
```

### 2. Composable Testing

```typescript
// tests/unit/composables/useCart.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCart } from '~/composables/useCart';

describe('useCart', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	test('adds item to cart', () => {
		const { cart, addItem } = useCart();
		const item = { id: 1, quantity: 1 };

		expect(cart.value).toHaveLength(0);
		addItem(item);
		expect(cart.value).toHaveLength(1);
		expect(cart.value[0]).toEqual(item);
	});

	test('calculates total correctly', () => {
		const { total, addItem } = useCart();

		addItem({ id: 1, price: 10.0, quantity: 2 });
		addItem({ id: 2, price: 5.0, quantity: 1 });

		expect(total.value).toBe(25.0);
	});
});
```

## Integration Testing

### 1. API Integration

```typescript
// tests/integration/api/products.test.ts
import { describe, test, expect } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

describe('Products API', async () => {
	await setup({
		server: true,
		browser: false,
	});

	test('lists products with pagination', async () => {
		const response = await $fetch('/api/products', {
			params: {
				page: 1,
				limit: 10,
			},
		});

		expect(response.data).toBeInstanceOf(Array);
		expect(response.meta.total).toBeDefined();
		expect(response.meta.currentPage).toBe(1);
	});

	test('filters products by category', async () => {
		const category = 'electronics';
		const response = await $fetch('/api/products', {
			params: { category },
		});

		response.data.forEach((product) => {
			expect(product.category).toBe(category);
		});
	});
});
```

### 2. Store Integration

```typescript
// tests/integration/store/cart.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '~/stores/cart';
import { useProductStore } from '~/stores/product';

describe('Cart Store Integration', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	test('adds product from product store to cart', async () => {
		const cartStore = useCartStore();
		const productStore = useProductStore();

		await productStore.fetchProducts();
		const product = productStore.products[0];

		await cartStore.addToCart({
			productId: product.id,
			quantity: 1,
		});

		const cartItem = cartStore.items.find(
			(item) => item.productId === product.id
		);

		expect(cartItem).toBeDefined();
		expect(cartItem?.quantity).toBe(1);
	});
});
```

## E2E Testing

### 1. User Flows

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
	test('completes purchase successfully', async ({ page }) => {
		// Login
		await page.goto('/login');
		await page.fill('[data-test="email"]', 'test@example.com');
		await page.fill('[data-test="password"]', 'password');
		await page.click('[data-test="login-submit"]');

		// Add items to cart
		await page.goto('/products');
		await page.click('[data-test="add-to-cart"]');
		await page.click('[data-test="cart-icon"]');

		// Checkout process
		await page.click('[data-test="checkout"]');

		// Shipping information
		await page.fill('[data-test="address"]', '123 Test St');
		await page.fill('[data-test="city"]', 'Test City');
		await page.fill('[data-test="zip"]', '12345');
		await page.click('[data-test="continue-shipping"]');

		// Payment
		await page.fill('[data-test="card-number"]', '4242424242424242');
		await page.fill('[data-test="card-expiry"]', '12/25');
		await page.fill('[data-test="card-cvc"]', '123');
		await page.click('[data-test="submit-payment"]');

		// Confirmation
		await expect(page.locator('.order-confirmation')).toContainText(
			'Thank you for your order'
		);

		// Verify order in account
		await page.goto('/account/orders');
		await expect(page.locator('.order-list')).toContainText('Processing');
	});
});
```

### 2. Performance Testing

```typescript
// tests/e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Metrics', () => {
	test('loads critical pages within budget', async ({ page }) => {
		// Homepage
		const homeStart = Date.now();
		await page.goto('/');
		const homeLoad = Date.now() - homeStart;
		expect(homeLoad).toBeLessThan(2000);

		// Product listing
		const listStart = Date.now();
		await page.goto('/products');
		const listLoad = Date.now() - listStart;
		expect(listLoad).toBeLessThan(3000);

		// Product detail
		const productStart = Date.now();
		await page.goto('/products/1');
		const productLoad = Date.now() - productStart;
		expect(productLoad).toBeLessThan(2500);
	});

	test('handles server-side operations efficiently', async ({ request }) => {
		const start = Date.now();
		const response = await request.get('/api/products');
		const duration = Date.now() - start;

		expect(response.ok()).toBeTruthy();
		expect(duration).toBeLessThan(300);
	});
});
```

## Testing Utilities

### 1. Test Helpers

```typescript
// tests/utils/test-helpers.ts
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

export function createTestUser(overrides = {}) {
	return {
		id: 1,
		name: 'Test User',
		email: 'test@example.com',
		...overrides,
	};
}

export function mountWithPlugins(component, options = {}) {
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
			mocks: {
				$config: {
					public: {
						apiBase: 'http://localhost:3000',
					},
				},
			},
			...options.global,
		},
		...options,
	});
}
```

### 2. Mocking Utilities

```typescript
// tests/utils/mock-fetch.ts
export function mockFetch(data: any) {
	return vi.spyOn(global, 'fetch').mockImplementation(() =>
		Promise.resolve({
			ok: true,
			json: () => Promise.resolve(data),
		})
	);
}

// tests/utils/mock-api.ts
export function mockApi(path: string, response: any) {
	return vi.spyOn(global, 'fetch').mockImplementation((url: string) => {
		if (url.includes(path)) {
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve(response),
			});
		}
		return originalFetch(url);
	});
}
```

## CI/CD Integration

### 1. GitHub Actions Configuration

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

            - name: Run unit and integration tests
              run: pnpm test

            - name: Install Playwright
              run: pnpm playwright install --with-deps

            - name: Build application
              run: pnpm build

            - name: Run E2E tests
              run: pnpm test:e2e

            - name: Upload test results
              if: always()
              uses: actions/upload-artifact@v3
              with:
                  name: test-results
                  path: |
                      playwright-report/
                      coverage/
```

### 2. Test Reporting

```typescript
// tests/reporters/custom-reporter.ts
import { Reporter } from 'vitest';

export default class CustomReporter implements Reporter {
	onTestComplete(test, results) {
		// Report test results to monitoring service
		reportTestResult({
			name: test.name,
			duration: results.duration,
			status: results.state,
			error: results.error,
		});
	}

	onFinished(files, errors) {
		// Generate test report
		generateTestReport({
			files,
			errors,
			coverage: global.__coverage__,
		});
	}
}
```
