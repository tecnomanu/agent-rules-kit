---
title: Astro Content Patterns
description: Advanced patterns for managing static and dynamic content in Astro
tags: [Astro, Content, SSG, SSR, Patterns]
globs: ./**/*
always: true
---

# Astro Content Patterns

## Static Content Patterns

### Content Collections Architecture

1. **Collection Structure**

    ```
    src/
    ├── content/
    │   ├── blog/
    │   │   ├── post-1.md
    │   │   └── post-2.mdx
    │   ├── products/
    │   │   └── [...]
    │   └── config.ts
    ```

2. **Type-Safe Schemas**

    ```typescript
    // src/content/config.ts
    import { defineCollection, reference, z } from 'astro:content';

    const blog = defineCollection({
    	schema: z.object({
    		title: z.string(),
    		date: z.date(),
    		author: reference('authors'),
    		image: z
    			.object({
    				src: z.string(),
    				alt: z.string(),
    			})
    			.optional(),
    		tags: z.array(z.string()),
    	}),
    });

    const authors = defineCollection({
    	schema: z.object({
    		name: z.string(),
    		bio: z.string(),
    		avatar: z.string().optional(),
    	}),
    });

    export const collections = { blog, authors };
    ```

### Static Generation Patterns

1. **Page Generation**

    ```astro
    ---
    import { getCollection } from 'astro:content';

    export async function getStaticPaths() {
      const posts = await getCollection('blog');
      return posts.map(post => ({
        params: { slug: post.slug },
        props: { post }
      }));
    }

    const { post } = Astro.props;
    const { Content } = await post.render();
    ---
    <article>
      <h1>{post.data.title}</h1>
      <Content />
    </article>
    ```

2. **Content Organization**
    - Group related content in collections
    - Use consistent frontmatter patterns
    - Implement content relationships

### Asset Management

1. **Image Optimization**

    ```astro
    ---
    import { Image } from 'astro:assets';
    import hero from '../assets/hero.jpg';
    ---
    <Image
      src={hero}
      width={800}
      height={400}
      alt="Hero image"
      format="avif"
    />
    ```

2. **Asset Organization**
    ```
    src/
    ├── assets/
    │   ├── images/
    │   ├── fonts/
    │   └── styles/
    └── public/
        ├── favicon.ico
        └── robots.txt
    ```

## Dynamic Content Patterns

### Server-Side Rendering

1. **Configuration**

    ```typescript
    // astro.config.mjs
    import { defineConfig } from 'astro/config';
    import node from '@astrojs/node';

    export default defineConfig({
    	output: 'server',
    	adapter: node({
    		mode: 'standalone',
    	}),
    });
    ```

2. **Dynamic Routes**
    ```astro
    ---
    // src/pages/api/posts/[id].ts
    export async function get({ params }) {
      const { id } = params;
      const post = await fetchPost(id);

      return new Response(JSON.stringify(post), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    ```

### Hybrid Rendering Patterns

1. **Pre-rendered with Dynamic Islands**

    ```astro
    ---
    import DynamicComments from '../components/DynamicComments';
    const { slug } = Astro.params;
    const post = await getPost(slug);
    ---
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
      <DynamicComments client:visible postId={post.id} />
    </article>
    ```

2. **Conditional SSR**

    ```typescript
    // src/middleware.ts
    import { defineMiddleware } from 'astro/middleware';

    export const onRequest = defineMiddleware(async (context, next) => {
    	const needsSSR = checkIfNeedsSSR(context.url);
    	if (needsSSR) {
    		context.locals.rendering = 'ssr';
    	}
    	return next();
    });
    ```

### Data Management

1. **API Integration**

    ```typescript
    // src/utils/api.ts
    export async function fetchData<T>(endpoint: string): Promise<T> {
    	const response = await fetch(`${import.meta.env.API_URL}${endpoint}`);
    	if (!response.ok) {
    		throw new Error(`API error: ${response.statusText}`);
    	}
    	return response.json();
    }
    ```

2. **Caching Strategies**

    ```typescript
    // src/utils/cache.ts
    import { LRUCache } from 'lru-cache';

    const cache = new LRUCache({
    	max: 500,
    	ttl: 1000 * 60 * 5, // 5 minutes
    });

    export async function getCachedData<T>(
    	key: string,
    	fetcher: () => Promise<T>
    ): Promise<T> {
    	const cached = cache.get(key);
    	if (cached) return cached as T;

    	const data = await fetcher();
    	cache.set(key, data);
    	return data;
    }
    ```

## Performance Patterns

### Content Optimization

1. **Partial Hydration**

    ```astro
    ---
    import StaticContent from '../components/StaticContent.astro';
    import DynamicFeature from '../components/DynamicFeature';
    ---
    <StaticContent />
    <DynamicFeature client:visible />
    ```

2. **Progressive Enhancement**
    ```astro
    <form hx-post="/api/submit" hx-swap="outerHTML">
      <noscript>
        <p>Please enable JavaScript for enhanced functionality</p>
      </noscript>
      <!-- Form content -->
    </form>
    ```

### Content Delivery

1. **Edge Caching**

    ```typescript
    // src/pages/api/data.ts
    export const get: APIRoute = async ({ request }) => {
    	return new Response(JSON.stringify(data), {
    		headers: {
    			'Cache-Control': 'public, max-age=3600',
    			'Content-Type': 'application/json',
    		},
    	});
    };
    ```

2. **Content Preloading**
    ```astro
    <head>
      <link
        rel="preload"
        href="/api/critical-data"
        as="fetch"
        crossorigin="anonymous"
      >
    </head>
    ```

## Testing Patterns

1. **Content Testing**

    ```typescript
    // tests/content.test.ts
    import { describe, it, expect } from 'vitest';
    import { getCollection } from 'astro:content';

    describe('Content Collections', () => {
    	it('validates blog post schema', async () => {
    		const posts = await getCollection('blog');
    		expect(posts.length).toBeGreaterThan(0);
    		posts.forEach((post) => {
    			expect(post.data).toHaveProperty('title');
    			expect(post.data).toHaveProperty('date');
    		});
    	});
    });
    ```

2. **Dynamic Content Testing**

    ```typescript
    // tests/api.test.ts
    import { describe, it, expect } from 'vitest';
    import { fetchData } from '../src/utils/api';

    describe('API Integration', () => {
    	it('handles dynamic data fetching', async () => {
    		const data = await fetchData('/api/test');
    		expect(data).toBeDefined();
    	});
    });
    ```
