# Vue.js Testing Guide

This guide outlines the recommended approach to testing Vue.js applications in {projectPath}.

## Testing Framework

The recommended testing stack for Vue applications:

-   **Vitest**: Fast and compatible test runner (or Jest)
-   **Vue Test Utils**: Official testing library for Vue components
-   **Testing Library**: Optional addition for more user-centric testing
-   **Cypress/Playwright**: For end-to-end testing

## Setting Up Testing Environment

For a Vue 3 project with Vitest:

```js
// vitest.config.js
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./vitest.setup.js'],
	},
});
```

```js
// vitest.setup.js
import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// Global mocks and setup
```

## Component Testing

### Testing Vue Components

Test components using Vue Test Utils:

```js
// Component.vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="increment">Count: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Default Title',
  },
});

const count = ref(0);
const increment = () => count.value++;
</script>

// Component.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Component from './Component.vue';

describe('Component', () => {
  it('renders props.title when passed', () => {
    const title = 'Test Title';
    const wrapper = mount(Component, {
      props: { title },
    });

    expect(wrapper.find('h1').text()).toBe(title);
  });

  it('increments count when button is clicked', async () => {
    const wrapper = mount(Component);

    expect(wrapper.text()).toContain('Count: 0');

    await wrapper.find('button').trigger('click');

    expect(wrapper.text()).toContain('Count: 1');
  });
});
```

### Testing Composables

Test Vue composables (composition functions):

```js
// useCounter.js
import { ref } from 'vue';

export function useCounter(initialValue = 0) {
	const count = ref(initialValue);

	function increment() {
		count.value++;
	}

	function decrement() {
		count.value--;
	}

	return {
		count,
		increment,
		decrement,
	};
}

// useCounter.test.js
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
	it('should initialize with the default value', () => {
		const { count } = useCounter();
		expect(count.value).toBe(0);
	});

	it('should initialize with the provided value', () => {
		const { count } = useCounter(10);
		expect(count.value).toBe(10);
	});

	it('should increment the count', () => {
		const { count, increment } = useCounter();
		increment();
		expect(count.value).toBe(1);
	});

	it('should decrement the count', () => {
		const { count, decrement } = useCounter(5);
		decrement();
		expect(count.value).toBe(4);
	});
});
```

## Testing with Pinia

For applications using Pinia for state management:

```js
// store.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
	state: () => ({ count: 0 }),
	actions: {
		increment() {
			this.count++;
		},
	},
});

// store.test.js
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useCounterStore } from './store';

describe('Counter Store', () => {
	beforeEach(() => {
		// Create a fresh pinia instance for each test
		setActivePinia(createPinia());
	});

	it('increments', () => {
		const store = useCounterStore();
		expect(store.count).toBe(0);

		store.increment();
		expect(store.count).toBe(1);
	});
});

// Component using the store
// ComponentWithStore.test.js
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { useCounterStore } from './store';
import ComponentWithStore from './ComponentWithStore.vue';

describe('ComponentWithStore', () => {
	it('shows the counter value from the store', () => {
		// Create a new pinia for each test
		const pinia = createPinia();

		// Mount the component with pinia
		const wrapper = mount(ComponentWithStore, {
			global: {
				plugins: [pinia],
			},
		});

		// Get the store after mounting
		const store = useCounterStore();

		// Test the initial state
		expect(wrapper.text()).toContain('0');

		// Update the store
		store.increment();

		// Check that the component updates
		expect(wrapper.text()).toContain('1');
	});
});
```

## Testing Vue Router Integration

For components that use Vue Router:

```js
// ComponentWithRouter.test.js
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { describe, it, expect, beforeEach } from 'vitest';
import ComponentWithRouter from './ComponentWithRouter.vue';
import HomeView from './HomeView.vue';
import AboutView from './AboutView.vue';

// Create a router instance
const router = createRouter({
	history: createMemoryHistory(),
	routes: [
		{ path: '/', component: HomeView },
		{ path: '/about', component: AboutView },
	],
});

describe('ComponentWithRouter', () => {
	it('navigates to the about page when about link is clicked', async () => {
		// Mount with router
		const wrapper = mount(ComponentWithRouter, {
			global: {
				plugins: [router],
			},
		});

		// Find the link and click it
		await wrapper.find('a[href="/about"]').trigger('click');

		// Verify we navigated to the about page
		expect(router.currentRoute.value.path).toBe('/about');
	});
});
```

## Mocking HTTP Requests

For mocking API calls using Vitest:

```js
// api.js
import axios from 'axios';

export const api = {
	async getUsers() {
		const response = await axios.get('/api/users');
		return response.data;
	},
};

// api.test.js
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { api } from './api';

// Mock axios
vi.mock('axios');

describe('API', () => {
	it('fetches users successfully', async () => {
		// Mock response data
		const users = [{ id: 1, name: 'John' }];

		// Mock axios get method
		axios.get.mockResolvedValue({ data: users });

		// Call the API function
		const result = await api.getUsers();

		// Verify the result
		expect(result).toEqual(users);

		// Verify axios was called correctly
		expect(axios.get).toHaveBeenCalledWith('/api/users');
	});
});
```

## Testing Async Components

For testing async/await behavior:

```js
// AsyncComponent.vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>{{ data }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from './api';

const loading = ref(true);
const data = ref(null);

onMounted(async () => {
  try {
    data.value = await api.fetchData();
  } finally {
    loading.value = false;
  }
});
</script>

// AsyncComponent.test.js
import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import AsyncComponent from './AsyncComponent.vue';
import { api } from './api';

// Mock the API
vi.mock('./api', () => ({
  api: {
    fetchData: vi.fn(),
  },
}));

describe('AsyncComponent', () => {
  it('shows loading state initially, then shows data', async () => {
    // Mock API response
    api.fetchData.mockResolvedValue('Test Data');

    // Mount the component
    const wrapper = mount(AsyncComponent);

    // Check initial loading state
    expect(wrapper.text()).toContain('Loading...');

    // Wait for all promises to resolve
    await flushPromises();

    // Check data is displayed
    expect(wrapper.text()).toContain('Test Data');
    expect(wrapper.text()).not.toContain('Loading...');
  });
});
```

## E2E Testing

For end-to-end testing with Cypress:

```js
// cypress/e2e/login.cy.js
describe('Login Flow', () => {
	it('allows a user to log in', () => {
		// Visit the login page
		cy.visit('/login');

		// Fill in form fields
		cy.get('[data-test="email"]').type('user@example.com');
		cy.get('[data-test="password"]').type('password123');

		// Submit the form
		cy.get('[data-test="submit"]').click();

		// Assert we reach the dashboard
		cy.url().should('include', '/dashboard');
		cy.get('[data-test="welcome-message"]').should(
			'contain',
			'Welcome, User'
		);
	});
});
```

## Test Organization Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly with setup, actions, and assertions
2. **Test User Behavior**: Focus on what the user sees and does
3. **Use Data Attributes**: Add `data-test` attributes for test selectors
4. **Isolate Tests**: Each test should be independent and not rely on other tests
5. **Snapshot Testing**: Use sparingly for stable UI components

## Snapshot Testing

For UI component stability:

```js
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import UserProfile from './UserProfile.vue';

describe('UserProfile', () => {
	it('renders correctly', () => {
		const wrapper = mount(UserProfile, {
			props: {
				user: { name: 'John Doe', email: 'john@example.com' },
			},
		});

		expect(wrapper.element).toMatchSnapshot();
	});
});
```

## Component Test Structure

Organize tests in a descriptive, maintainable way:

```js
describe('LoginForm', () => {
	// Setup common test data/mocks
	const validCredentials = {
		email: 'user@example.com',
		password: 'password123',
	};

	// Grouped related tests
	describe('form validation', () => {
		it('requires email', async () => {
			// Test logic
		});

		it('requires password', async () => {
			// Test logic
		});
	});

	describe('form submission', () => {
		it('emits submit event with credentials', async () => {
			// Test logic
		});

		it('shows error message on failed login', async () => {
			// Test logic
		});
	});
});
```

## Testing Coverage Goals

Aim for these coverage targets:

-   **Unit tests**: 80%+ for business logic, utilities, composables
-   **Component tests**: 70%+ for UI components
-   **E2E tests**: Key user flows and critical paths
