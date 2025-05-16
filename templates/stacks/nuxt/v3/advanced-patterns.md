---
title: Nuxt 3 Advanced Patterns and Best Practices
description: Advanced implementation patterns and best practices for Nuxt 3 applications
tags: [Nuxt, Vue, Architecture, Patterns]
globs: ./**/*
always: true
---

# Nuxt 3 Advanced Patterns

## Architecture Patterns

### 1. Module-based Architecture

```typescript
// modules/
// ├── auth/
// │   ├── components/
// │   ├── composables/
// │   ├── middleware/
// │   └── types/
// ├── products/
// └── users/

// modules/auth/composables/useAuth.ts
export const useAuth = () => {
	const user = useState('user', () => null);
	const isAuthenticated = computed(() => !!user.value);

	return {
		user: readonly(user),
		isAuthenticated,
	};
};
```

### 2. API Layer Organization

```typescript
// server/api/v1/
// ├── users/
// │   ├── [id].get.ts
// │   ├── [id].patch.ts
// │   └── index.post.ts
// └── products/

// server/utils/api.ts
export const createApiHandler = (handler: EventHandler) => {
	return defineEventHandler(async (event) => {
		try {
			return await handler(event);
		} catch (error) {
			return handleApiError(error);
		}
	});
};
```

## Performance Patterns

### 1. Component Code-splitting

```typescript
// Async Component with Loading
const AsyncComponent = defineAsyncComponent({
	loader: () => import('./HeavyComponent.vue'),
	loadingComponent: LoadingSpinner,
	delay: 200,
	timeout: 3000,
});

// Conditional Loading
const AdminDashboard = defineAsyncComponent(() => {
	if (process.client) {
		return import('./AdminDashboard.vue');
	}
	return Promise.resolve(() => h('div'));
});
```

### 2. State Management Optimization

```typescript
// stores/shopping-cart.ts
export const useShoppingCart = defineStore('cart', () => {
	const items = ref<CartItem[]>([]);

	// Computed properties for derived state
	const total = computed(() =>
		items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);

	// Actions with proper type handling
	function addItem(item: CartItem) {
		const existing = items.value.find((i) => i.id === item.id);
		if (existing) {
			existing.quantity++;
		} else {
			items.value.push({ ...item, quantity: 1 });
		}
	}

	return {
		items: readonly(items),
		total,
		addItem,
	};
});
```

## Data Management Patterns

### 1. Advanced Data Fetching

```typescript
// composables/useResourceQuery.ts
export const useResourceQuery = <T>(
	resource: string,
	options: FetchOptions = {}
) => {
	const config = useRuntimeConfig();
	const queryKey = computed(() => [resource, options]);

	return useAsyncData(
		queryKey.value.join('-'),
		() => $fetch<T>(`${config.public.apiBase}/${resource}`, options),
		{
			watch: [queryKey],
			...options,
		}
	);
};

// Usage
const { data: users, refresh } = await useResourceQuery('users', {
	query: { role: 'admin' },
});
```

### 2. Form Handling

```typescript
// composables/useForm.ts
export const useForm = <T extends Record<string, any>>(
	initialData: T,
	options: {
		onSubmit: (data: T) => Promise<void>;
		validate?: (data: T) => Record<string, string[]>;
	}
) => {
	const form = reactive({ ...initialData });
	const errors = ref<Record<string, string[]>>({});
	const isSubmitting = ref(false);

	const submit = async () => {
		if (options.validate) {
			const validationErrors = options.validate(form);
			if (Object.keys(validationErrors).length) {
				errors.value = validationErrors;
				return;
			}
		}

		isSubmitting.value = true;
		try {
			await options.onSubmit(form);
		} finally {
			isSubmitting.value = false;
		}
	};

	return {
		form,
		errors: readonly(errors),
		isSubmitting: readonly(isSubmitting),
		submit,
	};
};
```

## SEO and Meta Patterns

### 1. Dynamic Meta Tags

```typescript
// composables/useSEO.ts
export const useSEO = (options: {
	title: MaybeRef<string>;
	description?: MaybeRef<string>;
	image?: MaybeRef<string>;
}) => {
	const title = computed(() => unref(options.title));
	const description = computed(() => unref(options.description));

	useHead({
		title,
		meta: [
			{
				name: 'description',
				content: description,
			},
			{
				property: 'og:title',
				content: title,
			},
			{
				property: 'og:description',
				content: description,
			},
			options.image && {
				property: 'og:image',
				content: unref(options.image),
			},
		].filter(Boolean),
	});
};
```

## Testing Patterns

### 1. Component Testing with Composition API

```typescript
// tests/composables/useCounter.test.ts
import { renderComposable } from '@nuxt/test-utils';
import { useCounter } from '~/composables/useCounter';

describe('useCounter', () => {
	test('increments counter', async () => {
		const { result } = renderComposable(() => useCounter());

		expect(result.count.value).toBe(0);
		await result.increment();
		expect(result.count.value).toBe(1);
	});
});
```

### 2. API Mocking

```typescript
// tests/mocks/api.ts
export const mockApi = (path: string, response: any) => {
	return vi.spyOn(global, 'fetch').mockImplementation((url: string) => {
		if (url.includes(path)) {
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve(response),
			});
		}
		return originalFetch(url);
	});
};

// Usage in tests
test('fetches users', async () => {
	const mockUsers = [{ id: 1, name: 'Test' }];
	mockApi('/api/users', mockUsers);

	const { data } = await useResourceQuery('users');
	expect(data.value).toEqual(mockUsers);
});
```

## Error Handling Patterns

### 1. Global Error Boundary

```typescript
// plugins/error-handler.ts
export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
		// Log to monitoring service
		console.error('Global error:', error);

		// Show user-friendly error
		const { showError } = useError();
		showError({
			statusCode: 500,
			statusMessage: 'An unexpected error occurred',
		});
	};
});
```

### 2. API Error Handling

```typescript
// middleware/api-error.ts
export default defineEventHandler((event) => {
	const error = getError(event);

	if (!error) return;

	setResponseStatus(event, error.statusCode || 500);

	return {
		statusCode: error.statusCode,
		message:
			process.env.NODE_ENV === 'production'
				? 'An error occurred'
				: error.message,
		stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
	};
});
```

## Build and Deployment Patterns

### 1. Environment Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	runtimeConfig: {
		apiSecret: '', // server-only
		public: {
			apiBase: '', // client & server
			environment: process.env.NODE_ENV,
		},
	},
	nitro: {
		storage: {
			redis: {
				driver: 'redis',
				/* Redis config */
			},
		},
	},
});
```

### 2. Custom Build Optimizations

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	experimental: {
		payloadExtraction: true,
		renderJsonPayloads: true,
		crossOriginPrefetch: true,
	},
	nitro: {
		compressPublicAssets: true,
		minify: true,
		timing: process.env.NODE_ENV === 'development',
	},
	vite: {
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						group1: [
							'./components/group1/ComponentA.vue',
							'./components/group1/ComponentB.vue',
						],
					},
				},
			},
		},
	},
});
```
