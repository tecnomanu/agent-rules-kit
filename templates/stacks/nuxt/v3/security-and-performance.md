---
title: Nuxt 3 Security and Performance Guide
description: Comprehensive guide for security and performance optimization in Nuxt 3
tags: [Nuxt, Security, Performance, Optimization]
globs: ./**/*
always: true
---

# Nuxt 3 Security and Performance Guide

## Security Best Practices

### 1. Server-side Security

```typescript
// server/middleware/security.ts
export default defineEventHandler((event) => {
	// Set security headers
	setResponseHeaders(event, {
		// Prevent XSS attacks
		'Content-Security-Policy': [
			"default-src 'self'",
			"script-src 'self' 'nonce-{RANDOM_NONCE}'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https:",
			"connect-src 'self' https://api.example.com",
		].join('; '),

		// Prevent clickjacking
		'X-Frame-Options': 'SAMEORIGIN',

		// Prevent MIME type sniffing
		'X-Content-Type-Options': 'nosniff',

		// Enable browser XSS protection
		'X-XSS-Protection': '1; mode=block',

		// Control referrer information
		'Referrer-Policy': 'strict-origin-when-cross-origin',

		// HTTP Strict Transport Security
		'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
	});
});
```

### 2. Authentication Security

```typescript
// composables/useSecureAuth.ts
export const useSecureAuth = () => {
	const token = useCookie('auth_token', {
		maxAge: 3600,
		secure: true,
		httpOnly: true,
		sameSite: 'strict',
	});

	const refreshToken = useCookie('refresh_token', {
		maxAge: 7 * 24 * 3600,
		secure: true,
		httpOnly: true,
		sameSite: 'strict',
	});

	async function login(credentials: Credentials) {
		try {
			const { token: newToken, refreshToken: newRefresh } = await $fetch(
				'/api/auth/login',
				{
					method: 'POST',
					body: credentials,
				}
			);

			token.value = newToken;
			refreshToken.value = newRefresh;

			return true;
		} catch (error) {
			handleAuthError(error);
			return false;
		}
	}

	return {
		login,
		logout: () => {
			token.value = null;
			refreshToken.value = null;
		},
	};
};
```

### 3. API Security

```typescript
// server/middleware/api-security.ts
export default defineEventHandler(async (event) => {
	// Rate limiting
	const ip = getRequestIP(event);
	const rateLimiter = await getRateLimiter(ip);

	if (!rateLimiter.isAllowed()) {
		throw createError({
			statusCode: 429,
			message: 'Too many requests',
		});
	}

	// Request validation
	const body = await readBody(event);
	validateRequestSchema(event.path, body);

	// CORS handling
	if (event.method === 'OPTIONS') {
		setResponseHeaders(event, {
			'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type,Authorization',
			'Access-Control-Max-Age': '86400',
		});
		return null;
	}
});
```

## Performance Optimization

### 1. Build Optimization

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	// Optimize build
	nitro: {
		preset: 'node-cluster',
		minify: true,
		compressPublicAssets: {
			brotli: true,
			gzip: true,
		},
		storage: {
			redis: {
				driver: 'redis',
				port: 6379,
				host: '127.0.0.1',
			},
		},
	},

	// Vite optimization
	vite: {
		build: {
			cssCodeSplit: true,
			chunkSizeWarningLimit: 1000,
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes('node_modules')) {
							return 'vendor';
						}
					},
				},
			},
		},
		optimizeDeps: {
			include: ['vue', '@vueuse/core'],
		},
	},
});
```

### 2. Runtime Performance

```typescript
// plugins/performance.ts
export default defineNuxtPlugin((nuxtApp) => {
	if (process.client) {
		// Monitor Core Web Vitals
		const vitals = {
			cls: 0,
			fid: 0,
			lcp: 0,
		};

		nuxtApp.hook('app:mounted', () => {
			// Initialize performance monitoring
			webVitals.onCLS((metric) => (vitals.cls = metric.value));
			webVitals.onFID((metric) => (vitals.fid = metric.value));
			webVitals.onLCP((metric) => (vitals.lcp = metric.value));
		});

		// Report metrics
		nuxtApp.hook('page:finish', () => {
			reportVitals(vitals);
		});
	}
});
```

### 3. Caching Strategy

```typescript
// composables/useCache.ts
export const useCache = () => {
	const cache = new Map();

	async function getCached<T>(
		key: string,
		fetcher: () => Promise<T>,
		options: {
			ttl?: number;
			staleWhileRevalidate?: boolean;
		} = {}
	): Promise<T> {
		const cached = cache.get(key);

		if (cached && Date.now() < cached.expiry) {
			return cached.data;
		}

		if (options.staleWhileRevalidate && cached) {
			// Return stale data and refresh in background
			refreshCache(key, fetcher, options.ttl);
			return cached.data;
		}

		return refreshCache(key, fetcher, options.ttl);
	}

	async function refreshCache<T>(
		key: string,
		fetcher: () => Promise<T>,
		ttl = 300000 // 5 minutes default
	): Promise<T> {
		const data = await fetcher();
		cache.set(key, {
			data,
			expiry: Date.now() + ttl,
		});
		return data;
	}

	return {
		getCached,
		refreshCache,
		invalidate: (key: string) => cache.delete(key),
	};
};
```

### 4. Image Optimization

```typescript
// components/OptimizedImage.vue
<template>
  <nuxt-img
    :src="src"
    :width="width"
    :height="height"
    :loading="loading"
    :placeholder="placeholder"
    format="webp"
    densities="x1 x2"
    :modifiers="{
      quality: 80,
      fit: 'cover',
      format: 'webp'
    }"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  src: string
  width: number
  height: number
  loading?: 'lazy' | 'eager'
  placeholder?: string
}>()

const config = useRuntimeConfig()

// Preload critical images
onMounted(() => {
  if (props.loading === 'eager') {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = props.src
    document.head.appendChild(link)
  }
})
</script>
```

## Monitoring and Error Handling

### 1. Error Tracking

```typescript
// plugins/error-tracking.ts
export default defineNuxtPlugin((nuxtApp) => {
	const config = useRuntimeConfig();

	// Setup error boundaries
	nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
		// Log to monitoring service
		reportError({
			error,
			component: instance?.$options.name,
			info,
			context: {
				route: useRoute().fullPath,
				user: useUser().value?.id,
			},
		});
	};

	// Handle unhandled rejections
	if (process.client) {
		window.addEventListener('unhandledrejection', (event) => {
			reportError({
				error: event.reason,
				type: 'unhandledRejection',
			});
		});
	}
});
```

### 2. Performance Monitoring

```typescript
// plugins/performance-monitoring.ts
export default defineNuxtPlugin((nuxtApp) => {
	if (process.client) {
		// Monitor navigation performance
		nuxtApp.hook('page:start', () => {
			performance.mark('navigationStart');
		});

		nuxtApp.hook('page:finish', () => {
			performance.mark('navigationEnd');

			const navigationTiming = performance.measure(
				'navigation',
				'navigationStart',
				'navigationEnd'
			);

			reportPerformanceMetric('navigation', navigationTiming.duration);
		});

		// Monitor API performance
		const originalFetch = window.fetch;
		window.fetch = async (input, init) => {
			const start = performance.now();
			try {
				const response = await originalFetch(input, init);
				const duration = performance.now() - start;

				reportPerformanceMetric('api', {
					url: typeof input === 'string' ? input : input.url,
					duration,
				});

				return response;
			} catch (error) {
				const duration = performance.now() - start;
				reportPerformanceMetric('api_error', {
					url: typeof input === 'string' ? input : input.url,
					duration,
					error: error.message,
				});
				throw error;
			}
		};
	}
});
```
