# Vue.js Architecture Concepts

This document outlines the core architectural concepts and patterns used in Vue.js applications in {projectPath}.

## Component Architecture

### Vue Component Types

1. **Base/UI Components**

    - Lowest level reusable components
    - Form inputs, buttons, cards, etc.
    - Should be highly reusable and presentational
    - Often found in a UI library or component library

2. **Composite Components**

    - Composed of multiple base components
    - Implement specific features (SearchBar, UserProfile)
    - May have internal state and logic
    - Can emit events to parent components

3. **Page/View Components**

    - Top-level components rendered by a router
    - Organize the layout of a page
    - Coordinate data flow between components
    - Handle page-level logic and state

4. **Layout Components**
    - Define the overall structure of the app
    - Often contain slots for content projection
    - Examples: AppHeader, AppSidebar, PageLayout

### Props Down, Events Up Pattern

The core Vue data flow pattern:

-   Parent components pass data to children via props
-   Child components communicate with parents via events
-   Maintains clear unidirectional data flow
-   Makes component relationships explicit

```vue
<!-- Parent.vue -->
<template>
	<Child :data="parentData" @update="handleUpdate" />
</template>

<script setup>
import { ref } from 'vue';
import Child from './Child.vue';

const parentData = ref('Hello');
const handleUpdate = (newValue) => {
	parentData.value = newValue;
};
</script>

<!-- Child.vue -->
<template>
	<div>
		<p>{{ data }}</p>
		<button @click="emitUpdate">Update</button>
	</div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps(['data']);
const emit = defineEmits(['update']);

const emitUpdate = () => {
	emit('update', 'New value');
};
</script>
```

## State Management Patterns

### Component Local State

For simple components with self-contained state:

```vue
<script setup>
import { ref, computed } from 'vue';

// Local state
const count = ref(0);
const doubleCount = computed(() => count.value * 2);

// Methods
const increment = () => count.value++;
</script>
```

### Composition API Patterns

Vue 3's Composition API enables better code organization:

1. **Composables**: Reusable logic extracted into functions
2. **Reactive References**: `ref()` and `reactive()`
3. **Computed Properties**: Derived state with `computed()`
4. **Watchers**: Side effects with `watch()` and `watchEffect()`
5. **Lifecycle Hooks**: `onMounted()`, `onUnmounted()`, etc.

```js
// composables/useUsers.js
import { ref, computed, onMounted } from 'vue';

export function useUsers() {
	const users = ref([]);
	const loading = ref(true);
	const error = ref(null);

	const userCount = computed(() => users.value.length);

	async function fetchUsers() {
		loading.value = true;
		try {
			const response = await fetch('/api/users');
			users.value = await response.json();
		} catch (e) {
			error.value = e;
		} finally {
			loading.value = false;
		}
	}

	onMounted(fetchUsers);

	return {
		users,
		loading,
		error,
		userCount,
		fetchUsers,
	};
}

// Using the composable in a component
import { useUsers } from '@/composables/useUsers';

const { users, loading, error, userCount } = useUsers();
```

### Global State Management

#### Pinia (Recommended)

The modern Vue state management library:

```js
// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
	// State
	state: () => ({
		count: 0,
		loading: false,
	}),

	// Getters (computed values)
	getters: {
		doubleCount: (state) => state.count * 2,
	},

	// Actions (methods)
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

// Using the store in a component
import { useCounterStore } from '@/stores/counter';

const counterStore = useCounterStore();

// Access state and getters
console.log(counterStore.count);
console.log(counterStore.doubleCount);

// Call actions
counterStore.increment();
await counterStore.fetchCount();
```

#### Vuex (Legacy)

For older Vue 2 applications:

```js
// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		count: 0,
	},
	mutations: {
		INCREMENT(state) {
			state.count++;
		},
		SET_COUNT(state, value) {
			state.count = value;
		},
	},
	actions: {
		increment({ commit }) {
			commit('INCREMENT');
		},
		async fetchCount({ commit }) {
			const response = await fetch('/api/count');
			const data = await response.json();
			commit('SET_COUNT', data.count);
		},
	},
	getters: {
		doubleCount: (state) => state.count * 2,
	},
});
```

## Project Organization

### Feature-Based Structure

Organize by feature rather than by file type:

```
src/
├── assets/                 # Static assets
├── components/
│   ├── ui/                 # Base UI components
│   └── common/             # Shared composite components
├── features/
│   ├── auth/
│   │   ├── components/     # Auth-specific components
│   │   ├── composables/    # Auth-specific composables
│   │   ├── stores/         # Auth-specific stores
│   │   └── views/          # Auth-related pages
│   └── products/
│       ├── components/
│       ├── composables/
│       ├── stores/
│       └── views/
├── layouts/                # Layout components
├── composables/            # Shared composables
├── stores/                 # Pinia stores
├── router/                 # Vue Router configuration
├── utils/                  # Utility functions
├── App.vue                 # Root component
└── main.js                 # Entry point
```

### Module-Based Structure

For larger applications, a modular approach with explicit boundaries:

```
src/
├── modules/
│   ├── auth/
│   │   ├── api.js          # Auth-specific API calls
│   │   ├── components/     # Internal components
│   │   ├── composables/    # Internal composables
│   │   ├── store.js        # Module store
│   │   ├── routes.js       # Module routes
│   │   └── index.js        # Public API of this module
│   └── products/
│       ├── api.js
│       ├── components/
│       ├── composables/
│       ├── store.js
│       ├── routes.js
│       └── index.js
├── core/                   # Core application functionality
│   ├── components/
│   ├── composables/
│   ├── router/
│   └── store/
└── main.js                 # Entry point
```

## Routing Architecture

Vue Router enables navigation between views:

```js
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const routes = [
	{
		path: '/',
		name: 'home',
		component: HomeView,
	},
	{
		path: '/about',
		name: 'about',
		// Lazy-loaded route
		component: () => import('@/views/AboutView.vue'),
	},
	{
		path: '/users/:id',
		name: 'user-profile',
		component: () => import('@/views/UserProfile.vue'),
		// Route metadata
		meta: { requiresAuth: true },
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

// Navigation guards for global logic (e.g., authentication)
router.beforeEach((to, from) => {
	if (to.meta.requiresAuth && !isAuthenticated()) {
		return { name: 'login', query: { redirect: to.fullPath } };
	}
});

export default router;
```

## API Integration Patterns

### API Module Pattern

Centralize API calls in dedicated modules:

```js
// api/users.js
import axios from 'axios';

const api = axios.create({
	baseURL: '/api',
});

export default {
	async getUsers() {
		const response = await api.get('/users');
		return response.data;
	},

	async getUser(id) {
		const response = await api.get(`/users/${id}`);
		return response.data;
	},

	async createUser(userData) {
		const response = await api.post('/users', userData);
		return response.data;
	},
};
```

### API Composable Pattern

Wrap API calls in composables for reactive state:

```js
// composables/useUserApi.js
import { ref } from 'vue';
import usersApi from '@/api/users';

export function useUserApi() {
	const users = ref([]);
	const user = ref(null);
	const loading = ref(false);
	const error = ref(null);

	const fetchUsers = async () => {
		loading.value = true;
		error.value = null;

		try {
			users.value = await usersApi.getUsers();
		} catch (err) {
			error.value = err;
		} finally {
			loading.value = false;
		}
	};

	const fetchUser = async (id) => {
		loading.value = true;
		error.value = null;

		try {
			user.value = await usersApi.getUser(id);
		} catch (err) {
			error.value = err;
		} finally {
			loading.value = false;
		}
	};

	return {
		users,
		user,
		loading,
		error,
		fetchUsers,
		fetchUser,
	};
}
```

## Typed Vue with TypeScript

Vue 3 has excellent TypeScript support:

```ts
// User.vue
<script setup lang="ts">
import { ref, computed } from 'vue';

// Define typed props
interface Props {
  user: {
    id: number;
    name: string;
    email: string;
  };
  isAdmin?: boolean;
}

const props = defineProps<Props>();

// Define typed emits
const emit = defineEmits<{
  (e: 'update:user', user: Props['user']): void;
  (e: 'delete', id: number): void;
}>();

// Typed ref
const isEditing = ref<boolean>(false);

// Type inference works automatically
const userDisplayName = computed(() => {
  return isEditing.value ? `Editing: ${props.user.name}` : props.user.name;
});
</script>
```

## Dependency Injection

For passing data deeply without prop drilling:

```js
// Context provider component
<script setup>
import { provide } from 'vue';

const theme = ref('light');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};

// Provide values to descendants
provide('theme', theme);
provide('toggleTheme', toggleTheme);
</script>

// Deep component that needs theme
<script setup>
import { inject } from 'vue';

// Inject values from ancestors
const theme = inject('theme');
const toggleTheme = inject('toggleTheme');
</script>
```

## Performance Optimization

Key techniques for Vue performance:

1. **Proper Key Usage**: Always use `:key` with unique values in `v-for` loops
2. **Computed Properties**: Cache derived values with `computed`
3. **Memoization**: Use `computed` or `v-memo` to avoid unnecessary re-renders
4. **Lazy Loading**: Load components on demand with dynamic imports
5. **Virtual Scrolling**: For long lists, consider libraries like `vue-virtual-scroller`
6. **Component Splitting**: Break large components into smaller, focused ones

## Architecture Decision Records

Consider maintaining ADRs for key decisions:

```
docs/
└── architecture/
    ├── decisions/
    │   ├── 0001-state-management-choice.md
    │   ├── 0002-api-approach.md
    │   └── 0003-component-organization.md
    └── architecture-overview.md
```
