---
title: Nuxt 3 Architecture and Organization Guide
description: Best practices for structuring and organizing Nuxt 3 applications
tags: [Nuxt, Architecture, Organization, Best Practices]
globs: ./**/*
always: true
---

# Nuxt 3 Architecture and Organization Guide

## Project Structure

### 1. Core Directory Structure

```
nuxt-app/
├── .nuxt/              # Build directory
├── assets/             # Uncompiled assets
├── components/         # Vue components
├── composables/        # Composable functions
├── layouts/            # Layout components
├── middleware/         # Navigation middleware
├── pages/             # File-based routing
├── plugins/           # App plugins
├── public/            # Static files
├── server/            # Server routes & middleware
├── stores/            # State management
├── types/             # TypeScript types
└── utils/             # Utility functions
```

### 2. Feature-based Organization

```
components/
├── common/            # Shared components
│   ├── Button.vue
│   ├── Input.vue
│   └── Modal.vue
├── features/          # Feature-specific components
│   ├── auth/
│   │   ├── LoginForm.vue
│   │   └── RegisterForm.vue
│   └── products/
│       ├── ProductCard.vue
│       └── ProductList.vue
└── layout/           # Layout components
    ├── Header.vue
    └── Footer.vue
```

## Architecture Patterns

### 1. Domain-Driven Design

```typescript
// Domain layer
// domain/product/types.ts
export interface Product {
	id: string;
	name: string;
	price: number;
	category: string;
}

// domain/product/repository.ts
export interface ProductRepository {
	findById(id: string): Promise<Product>;
	findAll(criteria: SearchCriteria): Promise<Product[]>;
	save(product: Product): Promise<void>;
}

// Infrastructure layer
// infrastructure/repositories/product.ts
export class ApiProductRepository implements ProductRepository {
	constructor(private readonly api: ApiClient) {}

	async findById(id: string): Promise<Product> {
		return this.api.get(`/products/${id}`);
	}

	async findAll(criteria: SearchCriteria): Promise<Product[]> {
		return this.api.get('/products', { params: criteria });
	}

	async save(product: Product): Promise<void> {
		await this.api.post('/products', product);
	}
}

// Application layer
// composables/useProducts.ts
export const useProducts = () => {
	const repository = inject('productRepository');
	const products = ref<Product[]>([]);

	async function fetchProducts(criteria: SearchCriteria) {
		products.value = await repository.findAll(criteria);
	}

	return {
		products: readonly(products),
		fetchProducts,
	};
};
```

### 2. Clean Architecture

```typescript
// core/entities/User.ts
export class User {
  constructor(
    public id: string,
    public email: string,
    private password: string
  ) {}

  validatePassword(input: string): boolean {
    return this.password === hashPassword(input)
  }
}

// core/usecases/auth/LoginUseCase.ts
export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService
  ) {}

  async execute(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email)
    if (!user || !user.validatePassword(password)) {
      throw new InvalidCredentialsError()
    }
    return this.authService.createSession(user)
  }
}

// infrastructure/repositories/UserRepository.ts
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email }
    })
    return userData ? new User(userData.id, userData.email, userData.password) : null
  }
}

// presentation/components/LoginForm.vue
<script setup lang="ts">
const { login } = useAuth()
const form = reactive({
  email: '',
  password: ''
})

async function handleSubmit() {
  try {
    await login(form.email, form.password)
    navigateTo('/dashboard')
  } catch (error) {
    handleError(error)
  }
}
</script>
```

## State Management

### 1. Store Organization

```typescript
// stores/index.ts
import { defineStore } from 'pinia';

// Root store for app-wide state
export const useAppStore = defineStore('app', {
	state: () => ({
		theme: 'light',
		isInitialized: false,
	}),
	actions: {
		async initialize() {
			// Implementation
		},
	},
});

// Feature stores
// stores/features/auth.ts
export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: null,
		token: null,
	}),
	getters: {
		isAuthenticated: (state) => !!state.token,
	},
	actions: {
		async login(credentials: Credentials) {
			// Implementation
		},
	},
});

// Composable for accessing stores
// composables/useStores.ts
export const useStores = () => {
	const app = useAppStore();
	const auth = useAuthStore();

	return {
		app,
		auth,
	};
};
```

### 2. State Management Patterns

```typescript
// stores/modules/cart.ts
export const useCartStore = defineStore('cart', () => {
	// State
	const items = ref<CartItem[]>([]);
	const isLoading = ref(false);

	// Getters
	const total = computed(() =>
		items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
	);

	const itemCount = computed(() =>
		items.value.reduce((sum, item) => sum + item.quantity, 0)
	);

	// Actions
	async function addItem(item: CartItem) {
		isLoading.value = true;
		try {
			await api.cart.add(item);
			items.value.push(item);
		} finally {
			isLoading.value = false;
		}
	}

	async function removeItem(itemId: string) {
		const index = items.value.findIndex((item) => item.id === itemId);
		if (index !== -1) {
			await api.cart.remove(itemId);
			items.value.splice(index, 1);
		}
	}

	// Hydration/persistence
	async function hydrate() {
		const savedCart = await api.cart.get();
		items.value = savedCart;
	}

	return {
		items: readonly(items),
		isLoading: readonly(isLoading),
		total,
		itemCount,
		addItem,
		removeItem,
		hydrate,
	};
});
```

## API Integration

### 1. API Client Organization

```typescript
// utils/api/client.ts
export class ApiClient {
	constructor(private baseURL: string, private options: ApiOptions = {}) {}

	async request<T>(
		method: string,
		endpoint: string,
		options: RequestOptions = {}
	): Promise<T> {
		const response = await fetch(`${this.baseURL}${endpoint}`, {
			method,
			headers: this.buildHeaders(options),
			body: options.body ? JSON.stringify(options.body) : undefined,
			...options,
		});

		if (!response.ok) {
			throw await this.handleError(response);
		}

		return response.json();
	}

	private buildHeaders(options: RequestOptions): Headers {
		const headers = new Headers(options.headers);

		if (options.body) {
			headers.set('Content-Type', 'application/json');
		}

		if (this.options.auth?.token) {
			headers.set('Authorization', `Bearer ${this.options.auth.token}`);
		}

		return headers;
	}

	private async handleError(response: Response): Promise<ApiError> {
		const data = await response.json();
		return new ApiError(response.status, data.message, data.errors);
	}
}

// utils/api/resources.ts
export class ProductApi {
	constructor(private client: ApiClient) {}

	async list(params?: ProductSearchParams) {
		return this.client.request<Product[]>('GET', '/products', { params });
	}

	async get(id: string) {
		return this.client.request<Product>('GET', `/products/${id}`);
	}

	async create(data: CreateProductData) {
		return this.client.request<Product>('POST', '/products', {
			body: data,
		});
	}
}
```

### 2. API Integration Patterns

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();

	const apiClient = new ApiClient(config.public.apiBase, {
		auth: {
			getToken: () => useCookie('auth_token').value,
		},
		onError: (error) => {
			if (error.status === 401) {
				navigateTo('/login');
			}
		},
	});

	const api = {
		products: new ProductApi(apiClient),
		orders: new OrderApi(apiClient),
		users: new UserApi(apiClient),
	};

	return {
		provide: {
			api,
		},
	};
});

// composables/useApi.ts
export const useApi = () => {
	const nuxtApp = useNuxtApp();
	return nuxtApp.$api;
};
```

## Error Handling

### 1. Error Boundaries

```typescript
// plugins/error-boundary.ts
export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
		// Log error
		console.error('Vue Error:', error);
		console.error('Component:', instance?.$options.name);
		console.error('Error Info:', info);

		// Report to error tracking service
		reportError(error, {
			component: instance?.$options.name,
			info,
			user: useUser().value?.id,
		});

		// Show user-friendly error
		const { showError } = useError();
		showError({
			statusCode: error.statusCode || 500,
			message: process.dev
				? error.message
				: 'An unexpected error occurred',
		});
	};
});
```

### 2. Error Handling Patterns

```typescript
// composables/useErrorHandler.ts
export const useErrorHandler = () => {
	function handleApiError(error: unknown) {
		if (error instanceof ApiError) {
			switch (error.status) {
				case 400:
					handleValidationError(error);
					break;
				case 401:
					handleAuthenticationError(error);
					break;
				case 403:
					handleAuthorizationError(error);
					break;
				default:
					handleUnexpectedError(error);
			}
		} else {
			handleUnexpectedError(error);
		}
	}

	function handleValidationError(error: ApiError) {
		const toast = useToast();
		toast.error('Please check the form for errors');

		const form = useForm();
		form.setErrors(error.errors);
	}

	function handleAuthenticationError(error: ApiError) {
		const auth = useAuth();
		auth.clearSession();
		navigateTo('/login');
	}

	return {
		handleApiError,
	};
};
```

## Performance Patterns

### 1. Component Loading Optimization

```typescript
// utils/component-loader.ts
export function defineAsyncComponent(
	loader: () => Promise<Component>,
	options: AsyncComponentOptions = {}
) {
	return defineNuxtAsyncComponent({
		loader,
		loadingComponent: LoadingSpinner,
		delay: 200,
		timeout: 3000,
		suspensible: false,
		onError(error, retry, fail) {
			if (error.message.includes('fetch')) {
				retry();
			} else {
				fail();
			}
		},
		...options,
	});
}

// components/features/Dashboard.vue
const AdminPanel = defineAsyncComponent(() => import('./AdminPanel.vue'));

const ChartComponent = defineAsyncComponent(
	() => import('./ChartComponent.vue'),
	{
		delay: 400,
		suspensible: true,
	}
);
```

### 2. Data Loading Patterns

```typescript
// composables/useDataLoader.ts
export const useDataLoader = <T>(
	loader: () => Promise<T>,
	options: {
		immediate?: boolean;
		transform?: (data: T) => any;
		onError?: (error: Error) => void;
	} = {}
) => {
	const data = ref<T | null>(null);
	const error = ref<Error | null>(null);
	const isLoading = ref(false);

	async function load() {
		if (isLoading.value) return;

		isLoading.value = true;
		error.value = null;

		try {
			const result = await loader();
			data.value = options.transform ? options.transform(result) : result;
		} catch (e) {
			error.value = e as Error;
			options.onError?.(error.value);
		} finally {
			isLoading.value = false;
		}
	}

	if (options.immediate) {
		load();
	}

	return {
		data: readonly(data),
		error: readonly(error),
		isLoading: readonly(isLoading),
		load,
	};
};

// Usage example
const { data: products, isLoading } = useDataLoader(() => api.products.list(), {
	immediate: true,
	transform: (data) => data.map(formatProduct),
	onError: (error) => toast.error(error.message),
});
```
