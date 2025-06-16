---
description: Best practices for Nuxt applications
globs: <root>/app.vue,<root>/components/**/*.vue,<root>/components/**/*.ts,<root>/components/**/*.js
alwaysApply: false
---

# Nuxt Best Practices

This document outlines best practices for Nuxt.js applications in {projectPath}.

## Performance Best Practices

### Component Optimization

1. **Use Shallow Imports**: Import only what you need

    ```js
    // Good
    import { ref, computed } from 'vue';

    // Avoid
    import * as Vue from 'vue';
    ```

2. **Component Laziness**: Use lazy loading for non-critical components

    ```js
    // In Nuxt's auto-imports, use a prefix of 'Lazy'
    <LazyHeavyComponent v-if='isVisible' />;

    // Or define explicitly
    const HeavyComponent = defineAsyncComponent(() =>
    	import('./HeavyComponent.vue')
    );
    ```

3. **Proper Keys**: Always use unique keys for v-for loops

    ```html
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
    ```

4. **Cache Expensive Computations**:
    ```js
    // Use computed properties for expensive operations
    const filteredItems = computed(() =>
    	items.value.filter(complexFilterFunction)
    );
    ```

### Route & Data Optimization

1. **Optimize Page Load**: Use `useAsyncData` with appropriate cache options

    ```js
    const { data } = await useAsyncData('posts', () => $fetch('/api/posts'), {
    	// Cache for 1 minute
    	watch: false,
    	server: true,
    	transform: (posts) => posts.map(simplifyPost),
    	headers: { 'Cache-Control': 'max-age=60' },
    });
    ```

2. **Prefetch Likely Routes**: Use prefetching for links that will likely be clicked

    ```html
    <NuxtLink to="/popular-page" prefetch>Popular Page</NuxtLink>
    ```

3. **Minimize Watchers**: Avoid unnecessary reactive updates
    ```js
    // Good - only updates when really needed
    const { data } = await useAsyncData('data', () => fetchData(), {
    	watch: false, // Or watch specific dependencies only
    });
    ```

## Code Organization

1. **Follow Modular Structure**:

    - Group related components, composables, and services
    - Create domain-specific directories for large applications

2. **Use Typed Interfaces**:

    ```ts
    // types/index.ts
    export interface User {
    	id: string;
    	name: string;
    	email: string;
    }

    // In components/composables
    const user = ref<User | null>(null);
    ```

3. **Component Naming Conventions**:

    - Use PascalCase for component files and imports
    - Use kebab-case in templates
    - Use prefix for component categories (e.g., `BaseButton`, `FormInput`)

4. **Keep Components Small and Focused**:
    - Single responsibility principle
    - Extract reusable logic to composables
    - Extract complex UI parts to sub-components

## State Management

1. **Choose the Right Approach**:

    - Component state (`ref`/`reactive`) for local state
    - `useState` for simple shared state
    - Pinia stores for complex state with actions

2. **Structure Pinia Stores Properly**:

    ```js
    // stores/user.js
    export const useUserStore = defineStore('user', {
    	state: () => ({
    		user: null,
    		isLoggedIn: false,
    	}),
    	actions: {
    		async login(credentials) {
    			// Implementation
    		},
    		logout() {
    			// Implementation
    		},
    	},
    	getters: {
    		fullName: (state) =>
    			state.user
    				? `${state.user.firstName} ${state.user.lastName}`
    				: '',
    	},
    });
    ```

3. **Prefer Composition API Store Usage**:

    ```js
    <script setup>
    	const userStore = useUserStore(); // Destructure with storeToRefs to
    	maintain reactivity const {(user, isLoggedIn)} = storeToRefs(userStore);
    	const {(login, logout)} = userStore;
    </script>
    ```

## Server Routes

1. **Use Request Validation**:

    ```js
    // server/api/users/index.post.js
    export default defineEventHandler(async (event) => {
    	const body = await readBody(event);

    	// Validate request
    	if (!body.email || !body.password) {
    		throw createError({
    			statusCode: 400,
    			message: 'Email and password are required',
    		});
    	}

    	// Process valid request
    	return {
    		/* ... */
    	};
    });
    ```

2. **Structure Server Routes Logically**:

    - Follow REST conventions
    - Group related endpoints
    - Use HTTP methods appropriately

3. **Separate Business Logic**:
    - Keep API handlers thin
    - Extract complex logic to server/utils or server/services

## Testing

1. **Test Components in Isolation**:

    ```js
    import { mount } from '@vue/test-utils';
    import MyComponent from './MyComponent.vue';

    test('renders correctly', () => {
    	const wrapper = mount(MyComponent);
    	expect(wrapper.text()).toContain('Expected text');
    });
    ```

2. **Mock External Dependencies**:

    ```js
    import { mockNuxtImport } from '@nuxt/test-utils/runtime';

    mockNuxtImport('useAsyncData', () => {
    	return () => ({
    		data: ref({
    			/* mock data */
    		}),
    		pending: ref(false),
    	});
    });
    ```

3. **Test Server Routes Separately**:

    ```js
    import { setup } from '@nuxt/test-utils/runtime';
    import { describe, it, expect } from 'vitest';

    describe('API endpoints', () => {
    	beforeEach(async () => {
    		await setup({
    			server: true,
    		});
    	});

    	it('returns users correctly', async () => {
    		const response = await fetch('/api/users');
    		const data = await response.json();
    		expect(data).toHaveLength(2);
    	});
    });
    ```

## Security

1. **Never Trust Client Input**:

    - Validate all inputs on the server
    - Use `defineModel` with validators for form inputs
    - Sanitize user-generated content before displaying

2. **Use HTTPS in Production**:

    - Configure your hosting environment to use HTTPS
    - Set proper security headers

3. **Implement CSRF Protection**:

    - Use SameSite cookies
    - Add CSRF tokens for sensitive operations

4. **Secure API Routes**:
    - Implement proper authentication
    - Add rate limiting for sensitive routes
    - Use CORS correctly

## SEO Optimization

1. **Optimize Meta Tags**:

    ```js
    <script setup>
    useHead({
      title: 'Page Title',
      meta: [
        {
          name: 'description',
          content: 'Page description'
        },
        {
          property: 'og:title',
          content: 'Open Graph Title'
        }
      ]
    })
    </script>
    ```

2. **Use Semantic HTML**:

    - Proper heading hierarchy
    - Accessible landmarks
    - Descriptive alt texts for images

3. **Implement Structured Data**:
    - Add JSON-LD for rich snippets
    - Use appropriate schemas for your content

## Deployment & Build

1. **Optimize Assets**:

    - Enable image optimization
    - Use webp format when possible
    - Lazy load offscreen images

2. **Configure Caching Strategy**:

    - Static assets: long cache
    - API responses: appropriate TTL
    - HTML: short or no cache

3. **Use CDN for Assets**:

    - Configure your deployment to use CDN
    - Set proper cache headers

4. **Monitor Performance**:
    - Use Lighthouse in CI/CD
    - Implement real user monitoring
