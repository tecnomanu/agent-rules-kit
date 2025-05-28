---
description: Advanced architecture patterns and performance optimization for Astro projects, covering component design, data flow, asset strategy (Image component), code splitting, resource loading, caching, and performance monitoring (Web Vitals, Lighthouse).
globs: <root>/src/**/*.{astro,ts,js},<root>/astro.config.mjs,<root>/public/**/*
alwaysApply: true
---

# Astro Performance and Architecture Guide

## Architecture Patterns

### Project Structure

```
src/
├── components/
│   ├── common/        # Shared components
│   ├── layout/        # Layout components
│   └── features/      # Feature-specific components
├── content/           # Content collections
├── layouts/           # Page layouts
├── pages/            # Route pages
├── styles/           # Global styles
└── utils/            # Utilities and helpers
```

### Component Architecture

1. **Component Organization**

    - Feature-based organization
    - Clear separation of concerns
    - Progressive enhancement patterns

2. **Component Design Principles**

    ```typescript
    // src/components/features/ProductCard/index.astro
    ---
    interface Props {
      product: {
        id: string;
        name: string;
        price: number;
        image: string;
      };
      loading?: 'eager' | 'lazy';
    }

    const { product, loading = 'lazy' } = Astro.props;
    ---
    <article class="product-card">
      <img
        src={product.image}
        loading={loading}
        decoding="async"
        width="300"
        height="300"
        alt={product.name}
      />
      <!-- Additional content -->
    </article>
    ```

### Data Architecture

1. **Data Flow Patterns**

    ```typescript
    // src/utils/data/ProductRepository.ts
    interface ProductRepository {
    	getProducts(): Promise<Product[]>;
    	getProduct(id: string): Promise<Product>;
    	searchProducts(query: string): Promise<Product[]>;
    }

    class ApiProductRepository implements ProductRepository {
    	// Implementation
    }
    ```

2. **State Management**

    ```typescript
    // src/store/cart.ts
    import { atom } from 'nanostores';

    export const cartItems = atom<CartItem[]>([]);
    export const cartTotal = computed(cartItems, (items) =>
    	items.reduce((sum, item) => sum + item.price, 0)
    );
    ```

## Performance Optimization

### Build Optimization

1. **Asset Strategy**

    ```javascript
    // astro.config.mjs
    export default defineConfig({
    	build: {
    		assets: 'assets',
    		inlineStylesheets: 'auto',
    	},
    	image: {
    		service: { entrypoint: 'astro/assets/services/sharp' },
    		domains: ['trusted-domain.com'],
    	},
    });
    ```

2. **Code Splitting**
    ```typescript
    // src/components/HeavyFeature.astro
    ---
    const Component = await import('../features/HeavyFeature.jsx');
    ---
    <Component.default client:visible />
    ```

### Runtime Performance

1. **Resource Loading**

    ```astro
    <head>
      <!-- Critical CSS -->
      <style is:global>
        @import '../styles/critical.css';
      </style>

      <!-- Preload critical assets -->
      <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>

      <!-- Prefetch likely navigations -->
      <link rel="prefetch" href="/about">
    </head>
    ```

2. **Lazy Loading Patterns**
    ```typescript
    // src/utils/lazyLoad.ts
    export function createLazyLoader<T>(
    	loader: () => Promise<T>,
    	options = { threshold: 0.1 }
    ) {
    	let loaded: T | null = null;

    	return new Promise((resolve) => {
    		const observer = new IntersectionObserver(async ([entry]) => {
    			if (entry.isIntersecting) {
    				loaded = await loader();
    				observer.disconnect();
    				resolve(loaded);
    			}
    		}, options);

    		// Attach to target element
    	});
    }
    ```

### Caching Strategy

1. **Browser Caching**

    ```typescript
    // src/middleware/cache.ts
    export const cacheControl = defineMiddleware((context, next) => {
    	const response = await next();

    	// Add cache headers based on route
    	if (context.url.pathname.startsWith('/api')) {
    		response.headers.set('Cache-Control', 'private, max-age=300');
    	} else if (context.url.pathname.startsWith('/static')) {
    		response.headers.set('Cache-Control', 'public, max-age=31536000');
    	}

    	return response;
    });
    ```

2. **Service Worker**

    ```typescript
    // src/service-worker.ts
    const CACHE_NAME = 'app-cache-v1';
    const CACHED_URLS = [
    	'/',
    	'/offline',
    	'/styles/main.css',
    	'/scripts/main.js',
    ];

    self.addEventListener('install', (event: ExtendableEvent) => {
    	event.waitUntil(
    		caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHED_URLS))
    	);
    });
    ```

## Monitoring and Analytics

### Performance Monitoring

1. **Web Vitals Tracking**

    ```typescript
    // src/utils/vitals.ts
    import { onCLS, onFID, onLCP } from 'web-vitals';

    export function reportWebVitals(metric: any) {
    	const body = {
    		name: metric.name,
    		value: metric.value,
    		rating: metric.rating,
    		delta: metric.delta,
    	};

    	fetch('/api/vitals', {
    		method: 'POST',
    		body: JSON.stringify(body),
    	});
    }

    onCLS(reportWebVitals);
    onFID(reportWebVitals);
    onLCP(reportWebVitals);
    ```

2. **Error Tracking**

    ```typescript
    // src/utils/errorTracking.ts
    export class ErrorTracker {
    	static init() {
    		window.addEventListener('error', this.handleError);
    		window.addEventListener(
    			'unhandledrejection',
    			this.handlePromiseError
    		);
    	}

    	static handleError(event: ErrorEvent) {
    		// Log error to analytics
    	}

    	static handlePromiseError(event: PromiseRejectionEvent) {
    		// Log promise rejection
    	}
    }
    ```

### Performance Testing

1. **Lighthouse CI Configuration**

    ```javascript
    // lighthouserc.js
    module.exports = {
    	ci: {
    		collect: {
    			startServerCommand: 'npm run preview',
    			url: ['http://localhost:4321'],
    		},
    		assert: {
    			assertions: {
    				'categories:performance': ['error', { minScore: 0.9 }],
    				'first-contentful-paint': [
    					'error',
    					{ maxNumericValue: 2000 },
    				],
    			},
    		},
    		upload: {
    			target: 'temporary-public-storage',
    		},
    	},
    };
    ```

2. **Load Testing**

    ```typescript
    // tests/load/homepage.test.ts
    import { test } from '@playwright/test';
    import { chromium } from 'playwright';

    test('homepage performance', async () => {
    	const browser = await chromium.launch();
    	const page = await browser.newPage();

    	const metrics = await page.goto('/').then(() => page.metrics());

    	expect(metrics.FirstContentfulPaint).toBeLessThan(2000);
    	expect(metrics.DomContentLoaded).toBeLessThan(3000);

    	await browser.close();
    });
    ```
