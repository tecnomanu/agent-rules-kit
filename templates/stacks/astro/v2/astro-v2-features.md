---
description: Key features and implementation details specific to Astro version 2, including Content Collections, Hybrid Rendering, Markdown/MDX improvements, Image Optimization (astro:assets), built-in Redirects, TypeScript enhancements, and experimental View Transitions.
globs: <root>/src/**/*.{astro,md,mdx},<root>/astro.config.mjs
alwaysApply: true # Applies if v2 is detected
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
import BlogPostLayout from '../../layouts/BlogPostLayout.astro'; // Assuming layout exists

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
        <a href={`/blog/${post.slug}/`}> {/* Ensure trailing slash for canonical URLs */}
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
import BlogPostLayout from '../../layouts/BlogPostLayout.astro'; // Assuming layout exists

export async function getStaticPaths() {
  const blogEntries = await getCollection('blog', ({data}) => {
    return import.meta.env.DEV || !data.draft; // Only build published posts in prod
  });
  return blogEntries.map(entry => ({
    params: { slug: entry.slug }, // Astro handles slug generation
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
import vercel from '@astrojs/vercel/serverless'; // Or your preferred adapter

export default defineConfig({
	output: 'hybrid', // Can also be 'server' if most pages are dynamic
	adapter: vercel(), // Example adapter
});
```

### Static Page Example

```astro
---
// src/pages/about.astro
// This page will be statically generated at build time by default
import BaseLayout from '../layouts/BaseLayout.astro'; // Assuming layout exists
---

<BaseLayout title="About Us">
  <h1>About Our Company</h1>
  <p>This content is static and doesn't change between requests.</p>
</BaseLayout>
```

### Dynamic Page Example (Server-Side Rendering)

```astro
---
// src/pages/dashboard.astro
// This page will be server-rendered on each request
export const prerender = false; // Explicitly disable prerendering for this dynamic page

import BaseLayout from '../layouts/BaseLayout.astro'; // Assuming layout exists
// Assume getUser and fetchDashboardData are defined utility functions
// import { getUser } from '../utils/auth';
// import { fetchDashboardData } from '../utils/data';

// Example: This would run on the server for each request
// const user = await getUser(Astro.request);
// if (!user) {
//   return Astro.redirect('/login');
// }
// const dashboardData = await fetchDashboardData(user.id);
const user = { name: 'Current User' }; // Placeholder
const dashboardData = { info: 'Dynamic Info' }; // Placeholder
---

<BaseLayout title="Dashboard">
  <h1>Welcome, {user.name}</h1>
  <div class="dashboard-content">
    <p>{dashboardData.info}</p>
  </div>
</BaseLayout>
```

## Markdown and MDX Improvements

Astro 2.0 enhances its Markdown and MDX support with better frontmatter validation (via Content Collections schemas) and component usage:

### MDX with Components

```astro
---
// src/components/CodeBlock.astro
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
layout: ../../layouts/BlogPostLayout.astro # Adjust path as needed
---

import CodeBlock from '../../components/CodeBlock.astro'; # Adjust path as needed

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

## Image Optimization (`astro:assets`)

Astro 2.0 features improved image optimization with the `astro:assets` integration (which became more stable and feature-rich around this version, officially part of core later).

```astro
---
// src/pages/gallery.astro
import { Image } from 'astro:assets';
import BaseLayout from '../layouts/BaseLayout.astro'; // Assuming layout exists
import heroImage from '../assets/hero.jpg'; // Assuming asset exists
---

<BaseLayout title="Image Gallery">
  <h1>Image Gallery</h1>

  <!-- Optimized local image -->
  <Image
    src={heroImage}
    alt="Hero image"
    widths={[300, 600, 900]}
    sizes="(max-width: 600px) 300px, (max-width: 900px) 600px, 900px"
    quality={80}
  />

  <!-- Remote image requires explicit dimensions for optimization to work best -->
  <Image
    src="https://placehold.co/800x600/webp"
    alt="Remote image placeholder"
    width={800}
    height={600}
    format="webp"
  />
</BaseLayout>
```

## Redirects

Astro 2.0 introduces built-in redirects in `astro.config.mjs`:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	redirects: {
		'/old-page': '/new-page', // Basic 301 redirect
		'/blog/category/:slug': '/articles/:slug', // Dynamic redirect with parameters
		'/legacy': { // Object for more options
			status: 302, // Temporary redirect
			destination: '/modern',
		},
	},
});
```

## TypeScript Enhancements

Astro 2.0 improves TypeScript integration with better type inference and error reporting, especially with Content Collections providing type safety for frontmatter.

```typescript
// src/env.d.ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_API_URL: string; // Variables prefixed with PUBLIC_ are client-accessible
	readonly DATABASE_URL: string; // Server-side only if not prefixed
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
```

## View Transitions API (Experimental in early v2, stable later)

Astro 2.0 timeframe saw the introduction and stabilization of the View Transitions API for smoother page navigation.

```astro
---
// src/layouts/BaseLayout.astro
import { ViewTransitions } from 'astro:transitions';
interface Props { title: string; }
const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
    <ViewTransitions /> {/* Enables View Transitions */}
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
1.  **Content Collections**: This is a major new way to handle content. You might migrate existing Markdown/MDX from `src/pages` to `src/content/` and define schemas.
2.  **Image API**: If you were using older community plugins for images, consider migrating to `astro:assets` (which evolved through v2 and became fully integrated).
3.  **Configuration**: Review `astro.config.mjs` for any deprecated options or new features like `redirects`.
4.  **Error Overlays**: Astro 2 improved error overlays for a better development experience.

Always consult the official Astro blog and migration guides for detailed instructions when upgrading versions.
```
