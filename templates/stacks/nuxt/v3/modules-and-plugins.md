---
title: Nuxt 3 Modules and Plugins Guide
description: Comprehensive guide for working with Nuxt 3 modules and plugins
tags: [Nuxt, Modules, Plugins, Configuration]
globs: ./**/*
always: true
---

# Nuxt 3 Modules and Plugins Guide

## Module Development

### 1. Basic Module Structure

```typescript
// modules/my-module/module.ts
import { defineNuxtModule } from '@nuxt/kit';

export interface ModuleOptions {
	enabled?: boolean;
	configuration?: Record<string, any>;
}

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: 'my-module',
		configKey: 'myModule',
		compatibility: {
			nuxt: '^3.0.0',
		},
	},
	defaults: {
		enabled: true,
		configuration: {},
	},
	setup(options, nuxt) {
		// Module implementation
		if (!options.enabled) return;

		// Add runtime directory
		const { resolve } = createResolver(import.meta.url);
		nuxt.options.build.transpile.push(resolve('./runtime'));

		// Add composables
		addImportsDir(resolve('./runtime/composables'));

		// Add components
		addComponent({
			name: 'MyComponent',
			filePath: resolve('./runtime/components/MyComponent.vue'),
		});

		// Add plugins
		addPlugin(resolve('./runtime/plugin'));

		// Add runtime config
		nuxt.options.runtimeConfig.myModule = options.configuration;
	},
});
```

### 2. Module with Hooks

```typescript
// modules/analytics/module.ts
export default defineNuxtModule({
	meta: {
		name: 'analytics',
	},
	setup(_, nuxt) {
		nuxt.hook('app:created', (app) => {
			// Initialize analytics
		});

		nuxt.hook('pages:generated', () => {
			// Track page generation
		});

		nuxt.hook('build:done', () => {
			// Cleanup after build
		});
	},
});
```

## Plugin Development

### 1. Type-Safe Plugins

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();

	const api = {
		async get<T>(endpoint: string): Promise<T> {
			return $fetch<T>(`${config.public.apiBase}${endpoint}`);
		},
		async post<T>(endpoint: string, data: any): Promise<T> {
			return $fetch<T>(`${config.public.apiBase}${endpoint}`, {
				method: 'POST',
				body: data,
			});
		},
	};

	return {
		provide: {
			api,
		},
	};
});

// Types extension
declare module '#app' {
	interface NuxtApp {
		$api: typeof api;
	}
}
```

### 2. Plugin with Vue Integration

```typescript
// plugins/notifications.ts
export default defineNuxtPlugin((nuxtApp) => {
	const notifications = reactive({
		items: [] as Notification[],
		add(notification: Notification) {
			this.items.push(notification);
			setTimeout(() => this.remove(notification.id), 5000);
		},
		remove(id: string) {
			const index = this.items.findIndex((item) => item.id === id);
			if (index !== -1) this.items.splice(index, 1);
		},
	});

	nuxtApp.vueApp.provide('notifications', notifications);

	return {
		provide: {
			notify: notifications.add.bind(notifications),
		},
	};
});
```

## Module Configuration Patterns

### 1. Environment-aware Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	myModule: {
		enabled: true,
		configuration: {
			apiKey: process.env.API_KEY,
			environment: process.env.NODE_ENV,
			features: {
				analytics: process.env.ENABLE_ANALYTICS === 'true',
				monitoring: process.env.ENABLE_MONITORING === 'true',
			},
		},
	},
});
```

### 2. Dynamic Module Loading

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	modules: [
		// Conditional module loading
		process.env.NODE_ENV === 'development' && '@nuxt/devtools',
		[
			'@nuxtjs/sentry',
			{
				dsn: process.env.SENTRY_DSN,
				enabled: process.env.NODE_ENV === 'production',
			},
		],
	].filter(Boolean),
});
```

## Advanced Module Patterns

### 1. Module Composition

```typescript
// modules/full-stack/module.ts
import { defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
	meta: {
		name: 'full-stack',
		dependencies: {
			'@nuxtjs/supabase': '^1.0.0',
			'@pinia/nuxt': '^0.5.0',
		},
	},
	setup(_, nuxt) {
		// Ensure required modules are installed
		const modules = ['@nuxtjs/supabase', '@pinia/nuxt', '@nuxt/image'];

		modules.forEach((module) => {
			if (!nuxt.options.modules.includes(module)) {
				nuxt.options.modules.push(module);
			}
		});

		// Add custom configuration
		nuxt.options.runtimeConfig.public.apiBase =
			process.env.API_BASE || '/api';

		// Add composables
		addImportsDir('./runtime/composables');
	},
});
```

### 2. Module with TypeScript Integration

```typescript
// modules/api-client/module.ts
import { defineNuxtModule, addTemplate } from '@nuxt/kit';
import { generateApi } from './generator';

export default defineNuxtModule({
	meta: {
		name: 'api-client',
	},
	setup(_, nuxt) {
		// Generate API client from OpenAPI spec
		const apiClient = generateApi();

		// Add generated types
		addTemplate({
			filename: 'api-client.d.ts',
			getContents: () => apiClient.types,
		});

		// Add runtime code
		addTemplate({
			filename: 'api-client.ts',
			getContents: () => apiClient.code,
		});

		// Extend TypeScript config
		nuxt.hook('prepare:types', ({ references }) => {
			references.push({
				path: resolve(nuxt.options.buildDir, 'api-client.d.ts'),
			});
		});
	},
});
```

## Plugin Best Practices

### 1. Plugin Organization

```typescript
// plugins/index.ts
export default defineNuxtPlugin((nuxtApp) => {
	// Register lifecycle hooks
	nuxtApp.hook('app:mounted', () => {
		// Initialize client-side features
	});

	// Register error handlers
	nuxtApp.hook('vue:error', (error) => {
		// Handle Vue errors
	});

	// Register global properties
	nuxtApp.vueApp.config.globalProperties.$format = {
		date: (date: Date) => date.toLocaleDateString(),
	};
});
```

### 2. Plugin with SSR Considerations

```typescript
// plugins/analytics.ts
export default defineNuxtPlugin((nuxtApp) => {
	const router = useRouter();

	if (process.client) {
		// Client-side initialization
		router.afterEach((to) => {
			trackPageView(to.fullPath);
		});
	}

	if (process.server) {
		// Server-side initialization
		nuxtApp.hooks.hook('render:html', (html) => {
			// Add analytics script to head
			html.head.push(`<script src="analytics.js"></script>`);
		});
	}
});
```

## Testing Modules and Plugins

### 1. Module Testing

```typescript
// tests/my-module.test.ts
import { describe, test, expect } from 'vitest';
import { setupTest, createResolver } from '@nuxt/test-utils';
import myModule from '../modules/my-module';

describe('my-module', async () => {
	await setupTest({
		rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
		server: true,
		browser: true,
	});

	test('module configuration', async () => {
		const { nuxt } = useTestContext();
		expect(nuxt.options.runtimeConfig.myModule).toBeDefined();
	});

	test('adds components', () => {
		const resolver = createResolver(import.meta.url);
		const components = nuxt.options.components;
		expect(components).toContainEqual({
			name: 'MyComponent',
			filePath: resolver.resolve('./runtime/components/MyComponent.vue'),
		});
	});
});
```

### 2. Plugin Testing

```typescript
// tests/plugins/api.test.ts
import { describe, test, expect, vi } from 'vitest';
import { createApp, definePlugin } from '#app';

describe('api plugin', () => {
	test('provides api client', async () => {
		const plugin = definePlugin(async (nuxtApp) => {
			const { $api } = useNuxtApp();
			expect($api).toBeDefined();
			expect(typeof $api.get).toBe('function');
			expect(typeof $api.post).toBe('function');
		});

		const app = createApp();
		await app.use(plugin);
	});

	test('handles api calls', async () => {
		const { $api } = useNuxtApp();
		const mockData = { id: 1 };

		vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(mockData),
			})
		);

		const result = await $api.get('/test');
		expect(result).toEqual(mockData);
	});
});
```
