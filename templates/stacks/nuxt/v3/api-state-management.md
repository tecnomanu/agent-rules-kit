---
title: Nuxt 3 API Integration and State Management Guide
description: Best practices for API integration and state management in Nuxt 3 applications
tags: [Nuxt, API, State Management, Pinia]
globs: ./**/*
always: true
---

# Nuxt 3 API Integration and State Management Guide

## API Integration

### 1. API Client Setup

```typescript
// utils/api/client.ts
export class ApiClient {
	constructor(private baseURL: string, private options: ApiOptions = {}) {}

	private async request<T>(config: RequestConfig): Promise<T> {
		const { method, endpoint, body, params } = config;

		const response = await $fetch<T>(`${this.baseURL}${endpoint}`, {
			method,
			body,
			params,
			headers: await this.getHeaders(),
			onRequest: this.options.onRequest,
			onResponse: this.options.onResponse,
			onError: this.handleError,
		});

		return response;
	}

	private async getHeaders(): Promise<Headers> {
		const headers = new Headers();

		headers.set('Content-Type', 'application/json');

		const token = await this.options.getToken?.();
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		return headers;
	}

	private handleError = (error: FetchError) => {
		if (error.response?.status === 401) {
			// Handle unauthorized
			this.options.onUnauthorized?.();
		}

		throw error;
	};

	// HTTP method implementations
	async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
		return this.request<T>({ method: 'GET', endpoint, params });
	}

	async post<T>(endpoint: string, body: any): Promise<T> {
		return this.request<T>({ method: 'POST', endpoint, body });
	}

	async put<T>(endpoint: string, body: any): Promise<T> {
		return this.request<T>({ method: 'PUT', endpoint, body });
	}

	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>({ method: 'DELETE', endpoint });
	}
}

// plugins/api.ts
export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const auth = useAuthStore();

	const apiClient = new ApiClient(config.public.apiBase, {
		getToken: () => auth.token,
		onUnauthorized: () => {
			auth.clearSession();
			navigateTo('/login');
		},
		onRequest: ({ request, options }) => {
			// Add request interceptor logic
		},
		onResponse: ({ request, response, options }) => {
			// Add response interceptor logic
		},
	});

	return {
		provide: {
			api: apiClient,
		},
	};
});
```

### 2. API Resources

```typescript
// utils/api/resources/base.ts
export abstract class BaseResource {
	constructor(protected api: ApiClient) {}

	protected handleError(error: unknown) {
		if (error instanceof FetchError) {
			// Handle specific error cases
			switch (error.response?.status) {
				case 404:
					throw new NotFoundError();
				case 422:
					throw new ValidationError(error.data?.errors);
				default:
					throw new ApiError(error.message);
			}
		}
		throw error;
	}
}

// utils/api/resources/products.ts
export class ProductResource extends BaseResource {
	async list(params?: ProductListParams): Promise<ProductList> {
		try {
			return await this.api.get('/products', params);
		} catch (error) {
			throw this.handleError(error);
		}
	}

	async get(id: string): Promise<Product> {
		try {
			return await this.api.get(`/products/${id}`);
		} catch (error) {
			throw this.handleError(error);
		}
	}

	async create(data: CreateProductData): Promise<Product> {
		try {
			return await this.api.post('/products', data);
		} catch (error) {
			throw this.handleError(error);
		}
	}

	async update(id: string, data: UpdateProductData): Promise<Product> {
		try {
			return await this.api.put(`/products/${id}`, data);
		} catch (error) {
			throw this.handleError(error);
		}
	}

	async delete(id: string): Promise<void> {
		try {
			await this.api.delete(`/products/${id}`);
		} catch (error) {
			throw this.handleError(error);
		}
	}
}
```

## State Management

### 1. Store Setup

```typescript
// stores/base.ts
export abstract class BaseStore<T extends { id: string }> {
	protected items = ref<T[]>([]);
	protected loading = ref(false);
	protected error = ref<Error | null>(null);

	// Getters
	get all(): T[] {
		return this.items.value;
	}

	get isLoading(): boolean {
		return this.loading.value;
	}

	get hasError(): boolean {
		return this.error.value !== null;
	}

	// Actions
	protected async execute<R>(action: () => Promise<R>): Promise<R> {
		this.loading.value = true;
		this.error.value = null;

		try {
			return await action();
		} catch (e) {
			this.error.value = e as Error;
			throw e;
		} finally {
			this.loading.value = false;
		}
	}

	protected updateItems(items: T[]) {
		this.items.value = items;
	}

	protected addItem(item: T) {
		this.items.value.push(item);
	}

	protected updateItem(item: T) {
		const index = this.items.value.findIndex((i) => i.id === item.id);
		if (index !== -1) {
			this.items.value[index] = item;
		}
	}

	protected removeItem(id: string) {
		this.items.value = this.items.value.filter((item) => item.id !== id);
	}
}

// stores/products.ts
export const useProductStore = defineStore('products', () => {
	const store = new BaseStore<Product>();
	const api = useNuxtApp().$api;

	// State
	const filters = ref<ProductFilters>({
		category: null,
		price: null,
		sort: 'newest',
	});

	// Getters
	const filteredProducts = computed(() => {
		let result = store.all;

		if (filters.value.category) {
			result = result.filter(
				(p) => p.category === filters.value.category
			);
		}

		if (filters.value.price) {
			result = result.filter((p) => p.price <= filters.value.price!);
		}

		return result;
	});

	// Actions
	async function fetchProducts() {
		await store.execute(async () => {
			const products = await api.products.list({
				...filters.value,
			});
			store.updateItems(products);
		});
	}

	async function fetchProduct(id: string) {
		return store.execute(async () => {
			const product = await api.products.get(id);
			store.updateItem(product);
			return product;
		});
	}

	async function createProduct(data: CreateProductData) {
		return store.execute(async () => {
			const product = await api.products.create(data);
			store.addItem(product);
			return product;
		});
	}

	async function updateProduct(id: string, data: UpdateProductData) {
		return store.execute(async () => {
			const product = await api.products.update(id, data);
			store.updateItem(product);
			return product;
		});
	}

	async function deleteProduct(id: string) {
		await store.execute(async () => {
			await api.products.delete(id);
			store.removeItem(id);
		});
	}

	// Watchers
	watch(filters, () => {
		fetchProducts();
	});

	return {
		filters,
		filteredProducts,
		isLoading: store.isLoading,
		hasError: store.hasError,
		fetchProducts,
		fetchProduct,
		createProduct,
		updateProduct,
		deleteProduct,
	};
});
```

### 2. Composables Integration

```typescript
// composables/useResource.ts
export function useResource<T extends { id: string }>(options: {
	store: any;
	loadAction: string;
	loadParams?: any[];
}) {
	const loading = ref(false);
	const error = ref<Error | null>(null);
	const data = ref<T | null>(null);

	async function load() {
		if (loading.value) return;

		loading.value = true;
		error.value = null;

		try {
			const result = await options.store[options.loadAction](
				...(options.loadParams || [])
			);
			data.value = result;
		} catch (e) {
			error.value = e as Error;
			throw e;
		} finally {
			loading.value = false;
		}
	}

	onMounted(() => {
		load();
	});

	return {
		data: readonly(data),
		loading: readonly(loading),
		error: readonly(error),
		reload: load,
	};
}

// composables/useList.ts
export function useList<T extends { id: string }>(options: {
	store: any;
	loadAction: string;
	filterKey?: string;
}) {
	const loading = ref(false);
	const error = ref<Error | null>(null);
	const items = ref<T[]>([]);
	const filters = ref({});

	async function load() {
		if (loading.value) return;

		loading.value = true;
		error.value = null;

		try {
			const result = await options.store[options.loadAction]();
			items.value = result;
		} catch (e) {
			error.value = e as Error;
			throw e;
		} finally {
			loading.value = false;
		}
	}

	if (options.filterKey) {
		watch(
			() => filters.value,
			() => {
				options.store[options.filterKey] = filters.value;
			}
		);
	}

	onMounted(() => {
		load();
	});

	return {
		items: readonly(items),
		loading: readonly(loading),
		error: readonly(error),
		filters,
		reload: load,
	};
}

// Usage in components
const ProductList = defineComponent({
	setup() {
		const store = useProductStore();
		const {
			items: products,
			loading,
			error,
			filters,
		} = useList<Product>({
			store,
			loadAction: 'fetchProducts',
			filterKey: 'filters',
		});

		return {
			products,
			loading,
			error,
			filters,
		};
	},
});

const ProductDetail = defineComponent({
	props: {
		id: {
			type: String,
			required: true,
		},
	},
	setup(props) {
		const store = useProductStore();
		const {
			data: product,
			loading,
			error,
		} = useResource<Product>({
			store,
			loadAction: 'fetchProduct',
			loadParams: [props.id],
		});

		return {
			product,
			loading,
			error,
		};
	},
});
```

## Advanced Patterns

### 1. Optimistic Updates

```typescript
// composables/useOptimisticUpdate.ts
export function useOptimisticUpdate<T extends { id: string }>(options: {
	store: any;
	updateAction: string;
	rollbackAction: string;
}) {
	const processing = ref(false);
	const error = ref<Error | null>(null);

	async function update(
		id: string,
		data: Partial<T>,
		optimisticData?: Partial<T>
	) {
		if (processing.value) return;

		processing.value = true;
		error.value = null;

		// Store original state for rollback
		const original = { ...options.store.getItem(id) };

		try {
			// Apply optimistic update
			if (optimisticData) {
				options.store[options.updateAction](id, optimisticData);
			}

			// Perform actual update
			await options.store[options.updateAction](id, data);
		} catch (e) {
			// Rollback on error
			options.store[options.rollbackAction](id, original);
			error.value = e as Error;
			throw e;
		} finally {
			processing.value = false;
		}
	}

	return {
		processing: readonly(processing),
		error: readonly(error),
		update,
	};
}

// Usage in component
const { processing, error, update } = useOptimisticUpdate<Product>({
	store: useProductStore(),
	updateAction: 'updateProduct',
	rollbackAction: 'setProduct',
});

// Optimistic update example
await update(
	productId,
	{ quantity: newQuantity },
	{ quantity: newQuantity } // Optimistic data
);
```

### 2. Request Caching

```typescript
// composables/useRequestCache.ts
export function useRequestCache<T>(options: {
	key: string;
	ttl?: number;
	storage?: Storage;
}) {
	const storage = options.storage || localStorage;
	const ttl = options.ttl || 5 * 60 * 1000; // 5 minutes

	function getCacheKey(key: string): string {
		return `cache:${options.key}:${key}`;
	}

	function getCacheItem<T>(key: string): T | null {
		const cacheKey = getCacheKey(key);
		const item = storage.getItem(cacheKey);

		if (!item) return null;

		const { value, timestamp } = JSON.parse(item);

		if (Date.now() - timestamp > ttl) {
			storage.removeItem(cacheKey);
			return null;
		}

		return value as T;
	}

	function setCacheItem<T>(key: string, value: T): void {
		const cacheKey = getCacheKey(key);
		storage.setItem(
			cacheKey,
			JSON.stringify({
				value,
				timestamp: Date.now(),
			})
		);
	}

	function clearCache(): void {
		Object.keys(storage).forEach((key) => {
			if (key.startsWith(`cache:${options.key}:`)) {
				storage.removeItem(key);
			}
		});
	}

	return {
		get: getCacheItem,
		set: setCacheItem,
		clear: clearCache,
	};
}

// Usage with API calls
const cache = useRequestCache<Product[]>({
	key: 'products',
	ttl: 5 * 60 * 1000, // 5 minutes
});

async function fetchProducts() {
	const cacheKey = 'list';
	const cached = cache.get(cacheKey);

	if (cached) {
		return cached;
	}

	const products = await api.products.list();
	cache.set(cacheKey, products);
	return products;
}
```
