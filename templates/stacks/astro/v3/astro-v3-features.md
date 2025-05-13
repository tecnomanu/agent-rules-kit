---
title: Astro v3 Specific Features
description: Key features and implementation details specific to Astro version 3
tags: [Astro, v3, Features]
globs: <root>/src/content/**/*.md,<root>/src/content/**/*.mdx,<root>/astro.config.js,<root>/astro.config.mjs,<root>/astro.config.ts
---

# Astro v3 Specific Features

## Overview

Astro 3.0 introduces several major features and improvements that build on the foundation of Astro 2.0, enhancing both developer experience and end-user performance.

## View Transitions API

Astro 3.0 makes the View Transitions API official (no longer experimental), providing smooth page transitions for a more app-like experience:

```typescript
// src/layouts/BaseLayout.astro
---
import { ViewTransitions } from 'astro:transitions';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
    <!-- Add ViewTransitions to enable smooth page transitions -->
    <ViewTransitions />
  </head>
  <body>
    <main transition:animate="slide">
      <slot />
    </main>
  </body>
</html>
```

### Element-Specific Transitions

You can specify transitions for individual elements:

```typescript
// src/pages/index.astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Home">
  <h1 transition:animate="fade">Welcome to My Site</h1>

  <!-- Elements that should persist between pages -->
  <header transition:persist>
    <!-- Your header content -->
  </header>

  <!-- Custom transition for specific elements -->
  <div class="hero" transition:animate={{ name: 'slide', duration: '0.5s' }}>
    <h2>Featured Content</h2>
    <!-- Content -->
  </div>
</BaseLayout>
```

### Custom Transition Directives

You can define custom transitions:

```typescript
// src/transitions.js
export function myFadeTransition(options) {
	return {
		forwards: {
			old: [
				{
					name: 'fade',
					duration: options.duration || '0.3s',
					easing: options.easing || 'ease-out',
					fillMode: 'forwards',
				},
			],
			new: [
				{
					name: 'fade',
					duration: options.duration || '0.3s',
					easing: options.easing || 'ease-in',
					fillMode: 'backwards',
					direction: 'reverse',
				},
			],
		},
	};
}
```

```typescript
// Using custom transitions
<div transition:animate={myFadeTransition({ duration: '0.5s' })}>
	Fades with custom duration
</div>
```

## Image Optimization Improvements

Astro 3.0 greatly enhances the built-in image optimization features:

### Image Component

```typescript
// src/pages/gallery.astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Gallery">
  <h1>Image Gallery</h1>

  <!-- Local images with automatic width/height -->
  <Image
    src={heroImage}
    alt="Hero image"
    format="avif"
    quality={90}
  />

  <!-- Responsive images -->
  <Image
    src={heroImage}
    alt="Responsive hero"
    densities={[1, 2]}
    width={800}
    height={600}
  />

  <!-- Image with explicit output formats -->
  <Image
    src="https://example.com/image.jpg"
    alt="Remote image"
    width={400}
    height={300}
    format="webp"
  />
</BaseLayout>
```

### Picture Component

```typescript
// src/pages/responsive.astro
---
import { Picture } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Responsive Images">
  <h1>Responsive Images</h1>

  <Picture
    src={heroImage}
    alt="Responsive hero image"
    widths={[400, 800, 1200]}
    sizes="(max-width: 767px) 400px, (max-width: 1199px) 800px, 1200px"
    formats={['avif', 'webp', 'jpeg']}
  />
</BaseLayout>
```

### Improved Optimization Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	image: {
		service: {
			entrypoint: 'astro/assets/services/sharp',
			config: {
				quality: 80,
				defaults: {
					format: 'webp',
					cacheDir: './node_modules/.astro/cache/assets',
				},
			},
		},
		domains: ['trusted-image-domain.com'],
		remotePatterns: [{ protocol: 'https' }],
	},
});
```

## React Server Components (Experimental)

Astro 3.0 adds experimental support for React Server Components (RSC):

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
	integrations: [
		react({
			experimentalReactComponents: true,
		}),
	],
});
```

Using RSC in Astro:

```tsx
// src/components/ServerComponent.tsx
export default function ServerComponent() {
	// This component runs on the server only
	const data = await fetch('https://api.example.com/data').then((r) =>
		r.json()
	);

	return (
		<div>
			<h2>Server-Fetched Data</h2>
			<ul>
				{data.map((item) => (
					<li key={item.id}>{item.name}</li>
				))}
			</ul>
		</div>
	);
}
```

```typescript
// src/pages/with-rsc.astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ServerComponent from '../components/ServerComponent';
---

<BaseLayout title="React Server Components">
  <h1>Using React Server Components</h1>
  <ServerComponent />
</BaseLayout>
```

## i18n Routing

Astro 3.0 introduces built-in support for internationalization routing:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'es', 'fr'],
		routing: {
			strategy: 'prefix-always', // 'prefix-always' or 'prefix-other-locales'
		},
		fallback: {
			es: 'en',
			fr: 'en',
		},
	},
});
```

Using i18n in your code:

```typescript
// src/pages/index.astro
---
import { getI18n } from 'astro:i18n';
import BaseLayout from '../layouts/BaseLayout.astro';

const i18n = getI18n(Astro.currentLocale);
---

<BaseLayout title={i18n.t('home.title')}>
  <h1>{i18n.t('home.heading')}</h1>
  <p>{i18n.t('home.welcome')}</p>

  <div>
    <a href={i18n.link('/about')}>{i18n.t('nav.about')}</a>
    <a href={i18n.link('/contact')}>{i18n.t('nav.contact')}</a>
  </div>
</BaseLayout>
```

## TypeScript Improvements

Astro 3.0 improves TypeScript support with stricter types and better developer experience:

```typescript
// src/types.ts
import type { APIRoute } from 'astro';

// Define a type for route parameters
export interface BlogPostParams {
	slug: string;
}

// Define a type for API responses
export type APIResponse<T> = {
	success: boolean;
	data?: T;
	error?: string;
};

// Use with API routes
export const GET: APIRoute<BlogPostParams> = async ({ params, request }) => {
	const { slug } = params;

	try {
		const data = await fetchBlogPost(slug);
		return new Response(
			JSON.stringify({
				success: true,
				data,
			} as APIResponse<typeof data>)
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				error: error.message,
			} as APIResponse<never>),
			{ status: 500 }
		);
	}
};
```

## Content Collections Enhancements

Astro 3.0 adds more features to Content Collections:

```typescript
// src/content/config.ts
import { defineCollection, reference, z } from 'astro:content';

// Author collection with references
const authorsCollection = defineCollection({
	type: 'data', // JSON/YAML data collection
	schema: z.object({
		name: z.string(),
		bio: z.string(),
		avatar: z.string(),
	}),
});

// Blog collection with references to authors
const blogCollection = defineCollection({
	type: 'content', // Markdown/MDX content
	schema: z.object({
		title: z.string(),
		date: z.date(),
		author: reference('authors'), // Reference to authors collection
		tags: z.array(reference('tags')), // Reference to tags collection
		image: z.string().optional(),
		draft: z.boolean().default(false),
	}),
});

// Tags collection
const tagsCollection = defineCollection({
	type: 'data',
	schema: z.object({
		name: z.string(),
		description: z.string().optional(),
	}),
});

export const collections = {
	blog: blogCollection,
	authors: authorsCollection,
	tags: tagsCollection,
};
```

Using referenced collections:

```typescript
// src/pages/blog/[slug].astro
---
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post }
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();

// Retrieve referenced author
const author = await getEntry(post.data.author);

// Retrieve referenced tags
const tags = await Promise.all(
  post.data.tags.map(tagRef => getEntry(tagRef))
);
---

<BaseLayout title={post.data.title}>
  <article>
    <h1>{post.data.title}</h1>
    <p>By {author.data.name} • {post.data.date.toLocaleDateString()}</p>

    <div class="tags">
      {tags.map(tag => (
        <span class="tag">{tag.data.name}</span>
      ))}
    </div>

    <Content />

    <div class="author-bio">
      <img src={author.data.avatar} alt={author.data.name} />
      <p>{author.data.bio}</p>
    </div>
  </article>
</BaseLayout>
```

## Performance Optimizations

Astro 3.0 includes performance improvements for faster builds and runtime:

### Bundle Splitting

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	build: {
		splitting: true, // Enable code splitting for improved loading performance
		inlineStylesheets: 'auto', // 'auto', 'always', or 'never'
	},
	vite: {
		build: {
			cssCodeSplit: true,
			rollupOptions: {
				output: {
					manualChunks: {
						// Define custom chunk splitting
						vendor: ['react', 'react-dom'],
						utils: ['./src/utils/index.ts'],
					},
				},
			},
		},
	},
});
```

## Migration from Astro v2

When upgrading from Astro 2.x to 3.0, consider these key changes:

1. **View Transitions**: Update to the official View Transitions API
2. **Image Optimization**: Use the enhanced image components with better optimization
3. **TypeScript Updates**: Leverage improved type checking and definitions
4. **Content Collections**: Utilize reference support for more complex content relationships
5. **i18n Support**: Implement built-in internationalization if needed
