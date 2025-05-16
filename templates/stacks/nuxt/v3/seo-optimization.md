---
title: Nuxt 3 SEO and Performance Optimization Guide
description: Best practices for SEO and performance optimization in Nuxt 3 applications
tags: [Nuxt, SEO, Performance, Optimization]
globs: ./**/*
always: true
---

# Nuxt 3 SEO and Performance Optimization Guide

## SEO Configuration

### 1. Core Meta Tags Setup

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	app: {
		head: {
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
			title: 'My Nuxt App',
			meta: [
				{ name: 'description', content: 'My amazing Nuxt application' },
				{ name: 'format-detection', content: 'telephone=no' },
			],
			link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
		},
	},
});
```

### 2. Dynamic Meta Management

```typescript
// composables/useSEO.ts
export const useSEO = (options: {
	title: MaybeRef<string>;
	description?: MaybeRef<string>;
	image?: MaybeRef<string>;
	type?: MaybeRef<string>;
	url?: MaybeRef<string>;
}) => {
	const route = useRoute();
	const config = useRuntimeConfig();

	const title = computed(() => unref(options.title));
	const description = computed(() => unref(options.description));
	const image = computed(() => unref(options.image));
	const type = computed(() => unref(options.type) || 'website');
	const url = computed(
		() => unref(options.url) || `${config.public.siteUrl}${route.path}`
	);

	useHead({
		title,
		meta: [
			{
				name: 'description',
				content: description,
			},
			// Open Graph
			{
				property: 'og:title',
				content: title,
			},
			{
				property: 'og:description',
				content: description,
			},
			{
				property: 'og:image',
				content: image,
			},
			{
				property: 'og:url',
				content: url,
			},
			{
				property: 'og:type',
				content: type,
			},
			// Twitter
			{
				name: 'twitter:card',
				content: 'summary_large_image',
			},
			{
				name: 'twitter:title',
				content: title,
			},
			{
				name: 'twitter:description',
				content: description,
			},
			{
				name: 'twitter:image',
				content: image,
			},
		].filter((meta) => meta.content),
	});
};

// Usage in a page
const article = ref({
	title: 'Amazing Article',
	description: 'This is an amazing article about Nuxt 3',
	image: '/images/article.jpg',
});

useSEO({
	title: computed(() => `${article.value.title} | My Site`),
	description: computed(() => article.value.description),
	image: computed(() => article.value.image),
	type: 'article',
});
```

## Performance Optimization

### 1. Image Optimization

```typescript
// components/OptimizedImage.vue
<template>
  <nuxt-img
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :sizes="sizes"
    loading="lazy"
    decoding="async"
    format="webp"
    :quality="80"
    provider="cloudinary"
    :modifiers="{
      fit: 'cover',
      format: 'webp'
    }"
  />
</template>

<script setup lang="ts">
defineProps<{
  src: string
  alt: string
  width: number
  height: number
  sizes?: string
}>()
</script>

// nuxt.config.ts
export default defineNuxtConfig({
  image: {
    cloudinary: {
      baseURL: 'https://res.cloudinary.com/my-account'
    },
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },
    presets: {
      avatar: {
        modifiers: {
          format: 'webp',
          fit: 'cover',
          quality: '80'
        }
      }
    }
  }
})
```

### 2. Resource Loading Optimization

```typescript
// plugins/performance.ts
export default defineNuxtPlugin((nuxtApp) => {
	if (process.client) {
		// Preload critical resources
		function preloadCriticalResources() {
			const resources = [
				{ type: 'style', href: '/css/critical.css' },
				{ type: 'font', href: '/fonts/main.woff2' },
				{ type: 'image', href: '/images/hero.webp' },
			];

			resources.forEach(({ type, href }) => {
				const link = document.createElement('link');
				link.rel = 'preload';
				link.as = type;
				link.href = href;
				if (type === 'font') link.crossOrigin = 'anonymous';
				document.head.appendChild(link);
			});
		}

		// Prefetch likely navigation paths
		function prefetchLikelyPaths() {
			const paths = ['/about', '/products', '/contact'];
			paths.forEach((path) => {
				const link = document.createElement('link');
				link.rel = 'prefetch';
				link.href = path;
				document.head.appendChild(link);
			});
		}

		nuxtApp.hook('app:mounted', () => {
			preloadCriticalResources();
			prefetchLikelyPaths();
		});
	}
});
```

### 3. Route-based Code Splitting

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
	experimental: {
		payloadExtraction: true,
		inlineSSRStyles: false,
		viewTransition: true,
		componentIslands: true,
	},
	nitro: {
		compressPublicAssets: true,
		minify: true,
	},
	vite: {
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						auth: [
							'./composables/useAuth.ts',
							'./components/auth/LoginForm.vue',
						],
						products: [
							'./composables/useProducts.ts',
							'./components/products/ProductList.vue',
						],
					},
				},
			},
		},
	},
});
```

## Content Optimization

### 1. Structured Data

```typescript
// composables/useStructuredData.ts
export const useStructuredData = (data: any) => {
	useHead({
		script: [
			{
				type: 'application/ld+json',
				children: JSON.stringify(data),
			},
		],
	});
};

// Usage for a product page
const product = ref({
	name: 'Example Product',
	description: 'This is an example product',
	price: 99.99,
	image: '/images/product.jpg',
});

useStructuredData({
	'@context': 'https://schema.org',
	'@type': 'Product',
	name: product.value.name,
	description: product.value.description,
	image: product.value.image,
	offers: {
		'@type': 'Offer',
		price: product.value.price,
		priceCurrency: 'USD',
	},
});
```

### 2. Content Preloading

```typescript
// composables/usePreloadContent.ts
export const usePreloadContent = () => {
	const preloadedContent = new Map();

	async function preloadPage(path: string) {
		if (preloadedContent.has(path)) return;

		try {
			const content = await $fetch(`/api/_content${path}`);
			preloadedContent.set(path, content);
		} catch (error) {
			console.error(`Failed to preload ${path}:`, error);
		}
	}

	function getPreloadedContent(path: string) {
		return preloadedContent.get(path);
	}

	return {
		preloadPage,
		getPreloadedContent,
	};
};

// Usage in navigation
const { preloadPage } = usePreloadContent();

// Preload on hover
onHover(() => {
	preloadPage('/about');
});
```

## Performance Monitoring

### 1. Core Web Vitals Tracking

```typescript
// plugins/vitals.ts
export default defineNuxtPlugin((nuxtApp) => {
	if (process.client) {
		const reportWebVitals = ({ name, delta, id }) => {
			reportToAnalytics('web-vitals', {
				name,
				value: delta,
				id,
			});
		};

		nuxtApp.hook('app:mounted', () => {
			// Load web-vitals library
			import('web-vitals').then(({ onCLS, onFID, onLCP }) => {
				onCLS(reportWebVitals);
				onFID(reportWebVitals);
				onLCP(reportWebVitals);
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
		const performance = window.performance;

		// Monitor navigation timing
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

		// Monitor resource loading
		const observer = new PerformanceObserver((list) => {
			list.getEntries().forEach((entry) => {
				if (
					entry.initiatorType === 'fetch' ||
					entry.initiatorType === 'xmlhttprequest'
				) {
					reportPerformanceMetric('api', {
						url: entry.name,
						duration: entry.duration,
					});
				}
			});
		});

		observer.observe({ entryTypes: ['resource'] });
	}
});
```

## SEO Analytics and Monitoring

### 1. SEO Performance Tracking

```typescript
// plugins/seo-tracking.ts
export default defineNuxtPlugin((nuxtApp) => {
	function trackSEOMetrics() {
		// Track meta tags
		const metaTags = document.querySelectorAll(
			'meta[name], meta[property]'
		);
		const metaData = Array.from(metaTags).map((tag) => ({
			name: tag.getAttribute('name') || tag.getAttribute('property'),
			content: tag.getAttribute('content'),
		}));

		// Track structured data
		const structuredData = Array.from(
			document.querySelectorAll('script[type="application/ld+json"]')
		).map((script) => JSON.parse(script.textContent || '{}'));

		reportSEOMetrics({
			path: window.location.pathname,
			metaTags: metaData,
			structuredData,
		});
	}

	if (process.client) {
		nuxtApp.hook('page:finish', () => {
			trackSEOMetrics();
		});
	}
});
```

### 2. SEO Monitoring

```typescript
// composables/useSEOMonitor.ts
export const useSEOMonitor = () => {
	const route = useRoute();

	// Monitor route changes for SEO issues
	watch(
		() => route.path,
		async (newPath) => {
			const response = await $fetch(`/api/_seo/analyze`, {
				method: 'POST',
				body: {
					path: newPath,
					html: document.documentElement.outerHTML,
				},
			});

			if (response.issues.length > 0) {
				console.warn('SEO issues detected:', response.issues);
				reportSEOIssues(response.issues);
			}
		}
	);

	// Monitor dynamic content changes
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			if (mutation.type === 'childList') {
				checkSEOImpact(mutation.target);
			}
		});
	});

	onMounted(() => {
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});

	onUnmounted(() => {
		observer.disconnect();
	});
};
```
