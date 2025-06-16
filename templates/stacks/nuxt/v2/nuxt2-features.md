---
description: Nuxt 2 specific features and best practices
globs: <root>/nuxt.config.js,<root>/nuxt.config.ts,<root>/pages/**/*.vue,<root>/pages/**/*.js,<root>/pages/**/*.ts
alwaysApply: false
---

# Nuxt 2 Specific Features

This document outlines features and best practices specific to Nuxt 2 applications in {projectPath}.

## Key Nuxt 2 Features

### Options API by Default

Nuxt 2 primarily uses Vue 2's Options API:

```vue
<template>
	<div>
		<p>Count: {{ count }}</p>
		<p>Double: {{ doubleCount }}</p>
		<button @click="increment">Increment</button>
	</div>
</template>

<script>
export default {
	data() {
		return {
			count: 0,
		};
	},
	computed: {
		doubleCount() {
			return this.count * 2;
		},
	},
	methods: {
		increment() {
			this.count++;
		},
	},
};
</script>
```

### Vuex for State Management

```js
// store/index.js
export const state = () => ({
	counter: 0,
	user: null,
});

export const mutations = {
	increment(state) {
		state.counter++;
	},
	setUser(state, user) {
		state.user = user;
	},
};

export const actions = {
	async fetchUser({ commit }, id) {
		const user = await this.$axios.$get(`/api/users/${id}`);
		commit('setUser', user);
	},
};

export const getters = {
	isAuthenticated(state) {
		return !!state.user;
	},
};
```

### Accessing the Store in Components

```vue
<script>
export default {
	computed: {
		counter() {
			return this.$store.state.counter;
		},
		isAuthenticated() {
			return this.$store.getters.isAuthenticated;
		},
	},
	methods: {
		increment() {
			this.$store.commit('increment');
		},
		async loadUser(id) {
			await this.$store.dispatch('fetchUser', id);
		},
	},
};
</script>
```

### Modules System

```js
// nuxt.config.js
export default {
	// Nuxt 2 modules
	modules: ['@nuxtjs/axios', '@nuxtjs/auth-next', '@nuxtjs/pwa', 'nuxt-i18n'],

	// Modules that run in development mode only
	buildModules: ['@nuxtjs/tailwindcss', '@nuxtjs/composition-api/module'],

	// Module configuration
	axios: {
		baseURL: process.env.API_URL || 'http://localhost:3000',
	},

	auth: {
		strategies: {
			local: {
				token: {
					property: 'token',
				},
			},
		},
	},
};
```

### Nuxt 2 Navigation

```js
// Navigation with redirect
this.$router.push('/dashboard');

// With params
this.$router.push({ name: 'users-id', params: { id: 123 } });

// With query parameters
this.$router.push({ path: '/search', query: { q: 'term' } });

// Accessing route params
const id = this.$route.params.id;

// Accessing query parameters
const searchTerm = this.$route.query.q;
```

### Nuxt 2 Lifecycle Hooks

```js
export default {
	// Server-side only
	asyncData(context) {
		return { serverData: 'from server' };
	},

	// Server-side and client-side
	fetch() {
		// Called before rendering component
	},

	// Client-side only
	mounted() {
		// Component is mounted to DOM
	},

	// Custom Nuxt hooks
	middleware: 'auth',
	layout: 'admin',
};
```

## Data Fetching in Nuxt 2

### Using asyncData

```js
export default {
	async asyncData({ $axios, params, error }) {
		try {
			const post = await $axios.$get(`/api/posts/${params.id}`);
			return { post };
		} catch (e) {
			error({ statusCode: 404, message: 'Post not found' });
		}
	},
};
```

### Using fetch (Nuxt 2.12+)

```js
export default {
	data() {
		return {
			posts: [],
		};
	},
	async fetch() {
		this.posts = await this.$axios.$get('/api/posts');
	},
	fetchOnServer: false, // Only fetch on client-side
};
```

## Plugins in Nuxt 2

### Creating a Plugin

```js
// plugins/my-plugin.js
export default ({ app, store }, inject) => {
  inject('myPlugin', {
    hello: (msg) => `Hello ${msg}!`
  })
}

// nuxt.config.js
export default {
  plugins: [
    '~/plugins/my-plugin'
  ]
}
```

### Using Plugins in Components

```vue
<template>
	<div>{{ $myPlugin.hello('World') }}</div>
</template>
```

## Static Site Generation

Nuxt 2 supports static site generation:

```js
// nuxt.config.js
export default {
	target: 'static',

	generate: {
		routes: [
			'/posts/1',
			'/posts/2',
			// Dynamic routes
		],

		async routes() {
			const { data } = await axios.get('https://api.example.com/posts');
			return data.map((post) => `/posts/${post.id}`);
		},
	},
};
```

## Middleware

### Global Middleware

```js
// middleware/stats.js
export default function ({ route }) {
  // Track page visit
  console.log(`Visiting ${route.path}`)
}

// nuxt.config.js
export default {
  router: {
    middleware: ['stats']
  }
}
```

### Route-Specific Middleware

```js
// middleware/auth.js
export default function ({ store, redirect }) {
  if (!store.getters.isAuthenticated) {
    return redirect('/login')
  }
}

// pages/profile.vue
export default {
  middleware: 'auth'
}
```

## TypeScript Support in Nuxt 2

Using TypeScript with Nuxt 2:

```js
// nuxt.config.js
export default {
	buildModules: ['@nuxt/typescript-build'],
};
```

```ts
// With class-based components
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component
export default class MyComponent extends Vue {
	@Prop({ required: true }) readonly name!: string;

	count: number = 0;

	get doubleCount(): number {
		return this.count * 2;
	}

	increment(): void {
		this.count++;
	}
}
```

## Using Composition API in Nuxt 2

```js
// nuxt.config.js
export default {
	buildModules: ['@nuxtjs/composition-api/module'],
};
```

```vue
<template>
	<div>{{ count }}</div>
</template>

<script>
import { ref, useContext } from '@nuxtjs/composition-api';

export default {
	setup() {
		const { $axios } = useContext();
		const count = ref(0);

		async function fetchData() {
			const data = await $axios.$get('/api/data');
			return data;
		}

		return {
			count,
			fetchData,
		};
	},
};
</script>
```

## Performance Best Practices for Nuxt 2

1. **Use Component Lazy Loading**

    ```js
    components: {
    	LazyComponent: () => import('~/components/LazyComponent.vue');
    }
    ```

2. **Optimize Images with Responsive Loader**

    ```js
    // nuxt.config.js
    export default {
    	modules: ['@nuxtjs/style-resources', '@aceforth/nuxt-optimized-images'],
    	optimizedImages: {
    		optimizeImages: true,
    	},
    };
    ```

3. **Use PurgeCSS for Smaller CSS Bundles**

    ```js
    // nuxt.config.js
    export default {
    	buildModules: ['nuxt-purgecss'],
    	purgeCSS: {
    		enabled: ({ isDev, isClient }) => !isDev && isClient,
    	},
    };
    ```

4. **Implement Prefetching and Preloading**

    ```vue
    <nuxt-link prefetch to="/about">About</nuxt-link>
    ```

5. **Add API Caching**

    ```js
    async asyncData({ $axios, params, $config }) {
      const cacheKey = `post_${params.id}`
      const cached = sessionStorage.getItem(cacheKey)

      if (cached) {
        return { post: JSON.parse(cached) }
      }

      const post = await $axios.$get(`/api/posts/${params.id}`)
      sessionStorage.setItem(cacheKey, JSON.stringify(post))
      return { post }
    }
    ```
