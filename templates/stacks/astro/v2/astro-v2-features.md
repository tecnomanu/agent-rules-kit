---
title: Astro v2 Specific Features
description: Key features and implementation details specific to Astro version 2
tags: [Astro, v2, Features]
globs: <root>/src/content/**/*.md,<root>/src/content/**/*.mdx,<root>/astro.config.js,<root>/astro.config.mjs,<root>/astro.config.ts
---

# Astro v2 Specific Features

## Overview

Astro v2 introduces several important features and improvements that enhance the developer experience and expand the capabilities of the framework.

## Content Collections

One of the most significant additions in Astro 2.0 is the Content Collections API, which provides type safety for your content:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Define a schema for each collection
const blogCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		date: z.date(),
		author: z.string(),
		tags: z.array(z.string()),
		image: z.string().optional(),
		draft: z.boolean().default(false),
	}),
});

export const collections = {
	blog: blogCollection,
};
```

### Using Content Collections

```typescript
// src/pages/blog/index.astro
---
import { getCollection } from 'astro:content';
import BlogPostLayout from '../../layouts/BlogPostLayout.astro';

// Get all blog entries
const blogEntries = await getCollection('blog');

// Filter out drafts in production
const publishedBlogEntries = blogEntries.filter(post =>
  import.meta.env.DEV || !post.data.draft
);

// Sort by date
const sortedBlogEntries = publishedBlogEntries.sort(
  (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
);
---

<BlogPostLayout title="Blog">
  <h1>Blog</h1>
  <ul>
    {sortedBlogEntries.map(post => (
      <li>
        <a href={`/blog/${post.slug}`}>
          {post.data.title} - {post.data.date.toLocaleDateString()}
        </a>
      </li>
    ))}
  </ul>
</BlogPostLayout>
```

### Dynamic Routes with Content Collections

```typescript
// src/pages/blog/[...slug].astro
---
import { getCollection } from 'astro:content';
import BlogPostLayout from '../../layouts/BlogPostLayout.astro';

export async function getStaticPaths() {
  const blogEntries = await getCollection('blog');
  return blogEntries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<BlogPostLayout title={entry.data.title}>
  <article>
    <h1>{entry.data.title}</h1>
    <p>By {entry.data.author} • {entry.data.date.toLocaleDateString()}</p>
    <div class="tags">
      {entry.data.tags.map(tag => (
        <span class="tag">{tag}</span>
      ))}
    </div>
    {entry.data.image && <img src={entry.data.image} alt={entry.data.title} />}
    <Content />
  </article>
</BlogPostLayout>
```

## Hybrid Rendering

Astro 2.0 improves support for hybrid rendering, allowing you to choose between static and server rendering on a per-page basis:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
	output: 'hybrid',
	adapter: vercel(),
});
```

### Static Page Example

```typescript
// src/pages/about.astro
---
// This page will be statically generated at build time
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="About Us">
  <h1>About Our Company</h1>
  <p>This content is static and doesn't change between requests.</p>
</BaseLayout>
```

### Dynamic Page Example

```typescript
// src/pages/dashboard.astro
---
// This page will be server-rendered on each request
export const prerender = false;

import BaseLayout from '../layouts/BaseLayout.astro';
import { getUser } from '../utils/auth';

const user = await getUser(Astro.request);
if (!user) {
  return Astro.redirect('/login');
}

const dashboardData = await fetchDashboardData(user.id);
---

<BaseLayout title="Dashboard">
  <h1>Welcome, {user.name}</h1>
  <div class="dashboard-content">
    <!-- Dynamic dashboard content -->
  </div>
</BaseLayout>
```

## Markdown and MDX Improvements

Astro 2.0 enhances its Markdown and MDX support with better frontmatter validation and component usage:

### MDX with Components

```typescript
// src/components/CodeBlock.astro
---
interface Props {
  language: string;
  code: string;
}
const { language, code } = Astro.props;
---

<div class="code-block">
  <div class="code-header">
    <span>{language}</span>
  </div>
  <pre><code class={`language-${language}`}>{code}</code></pre>
</div>
```

```mdx
---
title: Using Components in MDX
layout: ../layouts/BlogPostLayout.astro
---

import CodeBlock from '../components/CodeBlock.astro';

# Using Components in MDX

Here's a custom code block:

<CodeBlock
	language='javascript'
	code={`
function greet(name) {
  return \`Hello, \${name}!\`;
}
`}
/>
```

## Image Optimization

Astro 2.0 features improved image optimization with the `astro:assets` integration:

```typescript
// src/pages/gallery.astro
---
import { Image } from 'astro:assets';
import BaseLayout from '../layouts/BaseLayout.astro';
import heroImage from '../assets/hero.jpg';
---

<BaseLayout title="Image Gallery">
  <h1>Image Gallery</h1>

  <!-- Optimized image with automatic width/height -->
  <Image
    src={heroImage}
    alt="Hero image"
    quality={80}
  />

  <!-- Remote image with explicit dimensions -->
  <Image
    src="https://example.com/remote-image.jpg"
    alt="Remote image"
    width={800}
    height={600}
    format="webp"
  />
</BaseLayout>
```

## Redirects

Astro 2.0 introduces built-in redirects:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	redirects: {
		'/old-page': '/new-page',
		'/blog/category/:slug': '/articles/:slug',
		'/legacy': {
			status: 302,
			destination: '/modern',
		},
	},
});
```

## TypeScript Enhancements

Astro 2.0 improves TypeScript integration with better type inference and error reporting:

```typescript
// src/env.d.ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_API_URL: string;
	readonly DATABASE_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
```

## New View Transitions API

Astro 2.0 introduces experimental view transitions for smoother page navigation:

```typescript
// src/layouts/BaseLayout.astro
---
import { ViewTransitions } from 'astro:transitions';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{Astro.props.title}</title>
    <ViewTransitions />
  </head>
  <body>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/blog">Blog</a>
    </nav>
    <main>
      <slot />
    </main>
  </body>
</html>
```

## Migration from Astro v1

When migrating from Astro 1.x to 2.0, consider these key changes:

1. **Content Collections**: Replace file-based routing in `src/pages/` with the Content Collections API
2. **New Image API**: Update to the new image optimization syntax
3. **Updated Configuration**: Review and update the `astro.config.mjs` file
4. **TypeScript Improvements**: Leverage enhanced type safety
5. **View Transitions**: Implement the new transitions API for improved UX
