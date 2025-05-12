---
description: Standard Architecture for Nuxt applications
globs: '<root>/nuxt.config.{js,ts},<root>/pages/**/*.{vue,js,ts},<root>/components/**/*.{vue,js,ts}'
alwaysApply: false
---

# Standard Nuxt Architecture

This document outlines the standard architecture pattern for Nuxt.js applications in {projectPath}.

## Directory Structure

The standard Nuxt architecture follows this directory structure:

```
{projectPath}/
├── assets/                # Uncompiled assets (processed by webpack)
│   ├── css/              # CSS/SCSS/LESS files
│   └── images/           # Image files
├── components/           # Vue components
│   ├── common/           # Shared/global components
│   ├── ui/               # UI components (buttons, inputs, etc.)
│   └── features/         # Feature-specific components
├── composables/          # Composition API functions
├── content/              # Markdown/JSON content (for @nuxt/content)
├── layouts/              # Page layouts
│   ├── default.vue       # Default layout
│   └── error.vue         # Error page layout
├── middleware/           # Navigation middleware
├── pages/                # Application pages & routing
├── plugins/              # Vue.js plugins
├── public/               # Static files (directly copied)
├── server/               # Server-side logic
│   ├── api/              # API endpoints
│   └── middleware/       # Server middleware
├── stores/               # State management (Pinia/Vuex)
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── app.vue               # Main application component
├── error.vue             # Custom error page
├── nuxt.config.js        # Nuxt configuration
└── package.json          # Project dependencies
```

## Component Organization

In the standard architecture, components are organized as follows:

### By Type/Role

```
components/
├── common/               # Shared/global components
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   └── AppSidebar.vue
├── ui/                   # Reusable UI components
│   ├── BaseButton.vue
│   ├── BaseCard.vue
│   ├── BaseInput.vue
│   └── BaseModal.vue
└── features/             # Feature-specific components
    ├── auth/
    │   ├── LoginForm.vue
    │   └── SignupForm.vue
    ├── products/
    │   ├── ProductCard.vue
    │   ├── ProductList.vue
    │   └── ProductDetail.vue
    └── checkout/
        ├── CheckoutForm.vue
        └── PaymentOptions.vue
```

## Data Flow

The standard data flow in a Nuxt application follows this pattern:

1. **API Layer**: Server routes or external APIs
2. **State Management**: Pinia/Vuex stores or composables
3. **Component Logic**: Page or component setup/data
4. **UI Layer**: Templates and rendered HTML

### Data Fetching Pattern

For Nuxt 3:

```ts
// pages/products/[id].vue
<script setup>
const route = useRoute()
const { data: product } = await useFetch(`/api/products/${route.params.id}`)
</script>
```

For Nuxt 2:

```js
// pages/products/_id.vue
export default {
	async asyncData({ params, $axios }) {
		const product = await $axios.$get(`/api/products/${params.id}`);
		return { product };
	},
};
```

## State Management

### Pinia (Recommended for Nuxt 3)

```ts
// stores/products.js
export const useProductStore = defineStore('products', {
	state: () => ({
		items: [],
		loading: false,
	}),

	actions: {
		async fetchProducts() {
			this.loading = true;
			try {
				this.items = await $fetch('/api/products');
			} finally {
				this.loading = false;
			}
		},
	},

	getters: {
		featuredProducts: (state) => state.items.filter((p) => p.featured),
	},
});
```

### Vuex (Nuxt 2)

```js
// store/products.js
export const state = () => ({
	items: [],
	loading: false,
});

export const mutations = {
	SET_PRODUCTS(state, products) {
		state.items = products;
	},
	SET_LOADING(state, status) {
		state.loading = status;
	},
};

export const actions = {
	async fetchProducts({ commit }) {
		commit('SET_LOADING', true);
		try {
			const products = await this.$axios.$get('/api/products');
			commit('SET_PRODUCTS', products);
		} finally {
			commit('SET_LOADING', false);
		}
	},
};
```

## API Layer

### Server Routes (Nuxt 3)

```ts
// server/api/products/index.get.ts
export default defineEventHandler(async (event) => {
	// Connect to database or external API
	const products = await db.products.findMany();
	return products;
});

// server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id');
	const product = await db.products.findUnique({ where: { id } });

	if (!product) {
		throw createError({
			statusCode: 404,
			message: `Product with ID ${id} not found`,
		});
	}

	return product;
});
```

### API Middleware (Nuxt 2)

```js
// server-middleware/api/products.js
const express = require('express');
const app = express();

app.use(express.json());

app.get('/products', async (req, res) => {
	// Handle request
	res.json([
		/* products */
	]);
});

app.get('/products/:id', async (req, res) => {
	// Handle request
	res.json({ id: req.params.id, name: 'Product' });
});

module.exports = app;
```

## Authentication Pattern

### Auth Flow

1. User submits credentials
2. Credentials validated by server
3. JWT/session stored
4. Protected routes check auth status
5. Redirect if unauthenticated

### Implementation (Nuxt 3)

```ts
// composables/useAuth.js
export const useAuth = () => {
	const user = useState('user', () => null);
	const isAuthenticated = computed(() => !!user.value);

	async function login(credentials) {
		const response = await $fetch('/api/auth/login', {
			method: 'POST',
			body: credentials,
		});

		user.value = response.user;

		// You might store token in cookie/localStorage
		// Or use auth.js/NuxtAuthHandler

		return navigateTo('/dashboard');
	}

	function logout() {
		user.value = null;
		// Clear stored tokens
		return navigateTo('/login');
	}

	return {
		user,
		isAuthenticated,
		login,
		logout,
	};
};
```

## Middleware Usage

### Auth Middleware (Nuxt 3)

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
	const user = useState('user');

	if (!user.value && to.path !== '/login') {
		return navigateTo('/login');
	}
});
```

### Auth Middleware (Nuxt 2)

```js
// middleware/auth.js
export default function ({ store, redirect, route }) {
	if (!store.state.auth.user && route.path !== '/login') {
		return redirect('/login');
	}
}
```

## Composables Architecture

Organize composables by feature or functionality:

```
composables/
├── auth/
│   ├── useAuth.js          # Authentication functions
│   └── usePermissions.js   # Permission checks
├── products/
│   ├── useProducts.js      # Product data management
│   └── useCategories.js    # Category data management
└── ui/
    ├── useBreakpoints.js   # Responsive breakpoint detection
    ├── useToast.js         # Toast notification system
    └── useForm.js          # Form handling utilities
```

## Testing Structure

```
tests/
├── components/           # Component tests
│   ├── BaseButton.test.js
│   └── ProductCard.test.js
├── composables/          # Composable tests
│   └── useAuth.test.js
├── pages/                # Page tests
│   └── index.test.js
└── server/               # Server API tests
    └── products.test.js
```

Example component test:

```js
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseButton from '~/components/ui/BaseButton.vue';

describe('BaseButton', () => {
	it('renders the button with the correct text', () => {
		const wrapper = mount(BaseButton, {
			slots: {
				default: 'Click me',
			},
		});

		expect(wrapper.text()).toContain('Click me');
	});

	it('emits click event when clicked', async () => {
		const wrapper = mount(BaseButton);

		await wrapper.trigger('click');

		expect(wrapper.emitted('click')).toBeTruthy();
	});
});
```

## Configuration Architecture

Organize your Nuxt configuration by logical groups:

```js
// nuxt.config.js
export default defineNuxtConfig({
	// Core configuration
	app: {
		head: {
			title: 'My Nuxt App',
			meta: [{ name: 'description', content: 'My Nuxt App Description' }],
		},
	},

	// Module configuration
	modules: ['@pinia/nuxt', '@nuxt/content', '@nuxtjs/tailwindcss'],

	// Feature configuration
	content: {
		// Content module options
	},

	// Environment configuration
	runtimeConfig: {
		apiSecret: process.env.API_SECRET,
		public: {
			apiBase: process.env.API_BASE || '/api',
		},
	},

	// Build configuration
	nitro: {
		// Server options
	},
	vite: {
		// Vite options
	},
});
```

## Best Practices for Standard Architecture

1. **Consistent Component Organization**

    - Group by feature or type depending on project size
    - Use consistent naming conventions

2. **State Management Modularity**

    - Divide stores by domain/feature
    - Avoid a single monolithic store

3. **Minimalist Component Design**

    - Keep components focused on single responsibilities
    - Extract reusable logic to composables

4. **Server/Client Code Separation**

    - Clearly distinguish server-only and client-only code
    - Use appropriate server utilities for sensitive operations

5. **Typed Interfaces**
    - Define and use TypeScript interfaces for data structures
    - Enforce consistent data shapes across the application
