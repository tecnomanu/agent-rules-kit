---
description: Testing implementation examples for Nuxt 2
globs: <root>/test/**/*.{spec,test}.{js,ts}
alwaysApply: false
---

# Nuxt 2 Testing Implementation

This document provides specific code examples for implementing tests in Nuxt 2 applications in {projectPath}.

## Setting Up Testing Environment

### Jest with Nuxt 2

Configure Jest in your Nuxt 2 project:

```js
// jest.config.js
module.exports = {
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
		'^~/(.*)$': '<rootDir>/$1',
		'^vue$': 'vue/dist/vue.common.js',
	},
	moduleFileExtensions: ['js', 'vue', 'json'],
	transform: {
		'^.+\\.js$': 'babel-jest',
		'.*\\.(vue)$': 'vue-jest',
	},
	collectCoverage: true,
	collectCoverageFrom: [
		'<rootDir>/components/**/*.vue',
		'<rootDir>/pages/**/*.vue',
		'<rootDir>/store/**/*.js',
	],
	testEnvironment: 'jsdom',
};
```

Add necessary scripts to your package.json:

```json
{
	"scripts": {
		"test": "jest",
		"test:watch": "jest --watch",
		"test:coverage": "jest --coverage"
	}
}
```

## Component Testing

### Testing Vue Components in Nuxt 2

Here's how to test components in Nuxt 2:

```js
// components/Counter.vue
<template>
  <div>
    <p class="count">Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    };
  },
  methods: {
    increment() {
      this.count++;
    }
  }
};
</script>

// tests/components/Counter.spec.js
import { mount } from '@vue/test-utils';
import Counter from '@/components/Counter.vue';

describe('Counter Component', () => {
  test('renders and increments count when button is clicked', async () => {
    const wrapper = mount(Counter);

    // Initial state
    expect(wrapper.find('.count').text()).toBe('Count: 0');

    // Interact with component
    await wrapper.find('button').trigger('click');

    // Check updated state
    expect(wrapper.find('.count').text()).toBe('Count: 1');
  });
});
```

### Testing with Vuex Store

```js
// components/UserInfo.vue
<template>
  <div>
    <p v-if="user">{{ user.name }}</p>
    <button @click="fetchUser">Load User</button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState({
      user: state => state.user.currentUser
    })
  },
  methods: {
    ...mapActions('user', ['fetchUser'])
  }
};
</script>

// tests/components/UserInfo.spec.js
import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import UserInfo from '@/components/UserInfo.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('UserInfo Component', () => {
  let actions;
  let store;
  let state;

  beforeEach(() => {
    actions = {
      'user/fetchUser': jest.fn()
    };
    state = {
      user: {
        currentUser: null
      }
    };
    store = new Vuex.Store({
      state,
      actions
    });
  });

  test('calls store action when button is clicked', async () => {
    const wrapper = mount(UserInfo, {
      store,
      localVue
    });

    await wrapper.find('button').trigger('click');
    expect(actions['user/fetchUser']).toHaveBeenCalled();
  });

  test('displays user name when user is set', async () => {
    // Set user in the store
    state.user.currentUser = { name: 'John Doe' };

    const wrapper = mount(UserInfo, {
      store,
      localVue
    });

    expect(wrapper.text()).toContain('John Doe');
  });
});
```

## Testing Pages

### Testing Nuxt 2 Pages

```js
// pages/index.vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'Welcome to Nuxt',
      description: 'Nuxt.js is awesome!'
    };
  }
};
</script>

// tests/pages/index.spec.js
import { mount } from '@vue/test-utils';
import IndexPage from '@/pages/index.vue';

describe('Index Page', () => {
  test('renders the correct title and description', () => {
    const wrapper = mount(IndexPage);
    expect(wrapper.find('h1').text()).toBe('Welcome to Nuxt');
    expect(wrapper.find('p').text()).toBe('Nuxt.js is awesome!');
  });
});
```

### Testing with asyncData and fetch

```js
// pages/users/_id.vue
<template>
  <div>
    <h1>User Profile</h1>
    <div v-if="user">
      <p>Name: {{ user.name }}</p>
      <p>Email: {{ user.email }}</p>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ params, $axios }) {
    const user = await $axios.$get(`/api/users/${params.id}`);
    return { user };
  }
};
</script>

// tests/pages/users/_id.spec.js
import { mount } from '@vue/test-utils';
import UserPage from '@/pages/users/_id.vue';

describe('User Page', () => {
  test('renders user data from asyncData', async () => {
    // Mock asyncData result
    const mockUser = { name: 'John Doe', email: 'john@example.com' };
    UserPage.asyncData = jest.fn().mockResolvedValue({ user: mockUser });

    // Mount component with asyncData pre-resolved
    const asyncDataResult = await UserPage.asyncData({
      params: { id: '1' },
      $axios: {
        $get: jest.fn().mockResolvedValue(mockUser)
      }
    });

    const wrapper = mount(UserPage, {
      data() {
        return asyncDataResult;
      }
    });

    expect(wrapper.find('h1').text()).toBe('User Profile');
    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('john@example.com');
  });
});
```

## Testing Vuex Store

### Testing Vuex Actions and Mutations

```js
// store/counter.js
export const state = () => ({
	count: 0,
});

export const mutations = {
	increment(state) {
		state.count++;
	},
	setValue(state, value) {
		state.count = value;
	},
};

export const actions = {
	async fetchCount({ commit }) {
		const count = await this.$axios.$get('/api/count');
		commit('setValue', count);
		return count;
	},
};

export const getters = {
	doubleCount: (state) => state.count * 2,
};

// tests/store/counter.spec.js
import { mutations, actions, getters } from '@/store/counter';

describe('Counter Store', () => {
	// Test mutations
	describe('mutations', () => {
		test('increment increments count by 1', () => {
			const state = { count: 0 };
			mutations.increment(state);
			expect(state.count).toBe(1);
		});

		test('setValue sets count to given value', () => {
			const state = { count: 0 };
			mutations.setValue(state, 10);
			expect(state.count).toBe(10);
		});
	});

	// Test getters
	describe('getters', () => {
		test('doubleCount returns count multiplied by 2', () => {
			const state = { count: 5 };
			expect(getters.doubleCount(state)).toBe(10);
		});
	});

	// Test actions
	describe('actions', () => {
		test('fetchCount commits the fetched count', async () => {
			const count = 42;
			const commit = jest.fn();

			// Mock Nuxt's $axios
			const $axios = {
				$get: jest.fn().mockResolvedValue(count),
			};

			// Mock context
			const context = {
				commit,
				$axios,
			};

			// Create mock for Nuxt context
			const nuxtContext = {
				$axios,
			};

			// Bind nuxtContext to the action (simulating Nuxt's injection)
			const boundActions = {};
			Object.keys(actions).forEach((key) => {
				boundActions[key] = actions[key].bind(nuxtContext);
			});

			const result = await boundActions.fetchCount({ commit });

			expect(result).toBe(count);
			expect(commit).toHaveBeenCalledWith('setValue', count);
		});
	});
});
```

## Testing Nuxt Plugins

```js
// plugins/format.js
export default ({ app }, inject) => {
	inject('formatDate', (date) => {
		if (!date) return '';
		return new Date(date).toLocaleDateString();
	});
};

// tests/plugins/format.spec.js
import format from '@/plugins/format';

describe('Format Plugin', () => {
	test('formatDate formats date correctly', () => {
		// Create mock context and inject function
		const inject = jest.fn();
		const context = { app: {} };

		// Call plugin
		format(context, inject);

		// Check that formatDate was injected
		expect(inject).toHaveBeenCalledWith('formatDate', expect.any(Function));

		// Get the injected function
		const formatDate = inject.mock.calls[0][1];

		// Test the function
		const date = new Date('2023-01-15');
		expect(formatDate(date)).toBe(date.toLocaleDateString());
		expect(formatDate(null)).toBe('');
	});
});
```

## Testing API Requests

### Mocking Axios in Nuxt 2

```js
// components/UserList.vue
<template>
  <div>
    <h2>Users</h2>
    <ul v-if="users.length">
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
    <button @click="loadUsers">Load Users</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: []
    };
  },
  methods: {
    async loadUsers() {
      this.users = await this.$axios.$get('/api/users');
    }
  }
};
</script>

// tests/components/UserList.spec.js
import { mount } from '@vue/test-utils';
import UserList from '@/components/UserList.vue';

describe('UserList', () => {
  test('loads and displays users when button is clicked', async () => {
    // Mock data
    const users = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];

    // Create mock $axios
    const $axios = {
      $get: jest.fn().mockResolvedValue(users)
    };

    // Mount with mocks
    const wrapper = mount(UserList, {
      mocks: {
        $axios
      }
    });

    // Initially no users
    expect(wrapper.findAll('li').length).toBe(0);

    // Click button to load users
    await wrapper.find('button').trigger('click');

    // Check that $axios was called correctly
    expect($axios.$get).toHaveBeenCalledWith('/api/users');

    // Wait for DOM to update
    await wrapper.vm.$nextTick();

    // Check that users are displayed
    const listItems = wrapper.findAll('li');
    expect(listItems.length).toBe(2);
    expect(listItems.at(0).text()).toBe('John Doe');
    expect(listItems.at(1).text()).toBe('Jane Smith');
  });
});
```

## End-to-End Testing with Cypress

```js
// cypress/integration/navigation.spec.js
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

	it('completes a login flow', () => {
		// Visit login page
		cy.visit('/login');

		// Fill the form
		cy.get('input[name="email"]').type('test@example.com');
		cy.get('input[name="password"]').type('password123');

		// Submit the form
		cy.get('form').submit();

		// Verify redirect to dashboard
		cy.url().should('include', '/dashboard');

		// Verify user is logged in
		cy.get('.user-profile').should('contain', 'test@example.com');
	});
});
```

## Testing Middleware

```js
// middleware/auth.js
export default function ({ store, redirect, route }) {
	if (!store.state.auth.loggedIn && route.path !== '/login') {
		return redirect('/login');
	}
}

// tests/middleware/auth.spec.js
import authMiddleware from '@/middleware/auth';

describe('Auth Middleware', () => {
	test('redirects to login when user is not authenticated', () => {
		// Mock context
		const redirect = jest.fn();
		const context = {
			store: {
				state: {
					auth: {
						loggedIn: false,
					},
				},
			},
			route: {
				path: '/dashboard',
			},
			redirect,
		};

		// Call middleware
		authMiddleware(context);

		// Check that redirect was called
		expect(redirect).toHaveBeenCalledWith('/login');
	});

	test('allows access when user is authenticated', () => {
		// Mock context with authenticated user
		const redirect = jest.fn();
		const context = {
			store: {
				state: {
					auth: {
						loggedIn: true,
					},
				},
			},
			route: {
				path: '/dashboard',
			},
			redirect,
		};

		// Call middleware
		authMiddleware(context);

		// Check that redirect was not called
		expect(redirect).not.toHaveBeenCalled();
	});

	test('allows access to login page even when not authenticated', () => {
		// Mock context with unauthenticated user but on login page
		const redirect = jest.fn();
		const context = {
			store: {
				state: {
					auth: {
						loggedIn: false,
					},
				},
			},
			route: {
				path: '/login',
			},
			redirect,
		};

		// Call middleware
		authMiddleware(context);

		// Check that redirect was not called
		expect(redirect).not.toHaveBeenCalled();
	});
});
```

## Testing with Nuxt-Specific Helpers

For more complex Nuxt 2 testing, you can use `@nuxt/test-utils`:

```js
// tests/pages/about.spec.js
import { setupTest, createPage } from '@nuxt/test-utils';

describe('About Page', () => {
	setupTest({
		testDir: __dirname,
		fixture: '../',
		browser: true,
	});

	test('renders the about page with correct content', async () => {
		const page = await createPage('/about');
		const html = await page.innerHTML('h1');
		expect(html).toContain('About Us');
	});
});
```

## Best Practices for Nuxt 2 Testing

When testing Nuxt 2 applications, remember to:

1. Mock Nuxt-specific objects like `$axios`, `$store`, and `$router`
2. Handle async operations correctly with `await` and `$nextTick()`
3. Pre-resolve `asyncData` and `fetch` when testing pages
4. Use a combination of unit, integration, and end-to-end tests
5. Keep test files organized, mirroring your application structure
6. Use snapshot testing sparingly, focusing on behavior over implementation details
