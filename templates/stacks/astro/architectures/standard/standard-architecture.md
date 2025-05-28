---
description: Guidelines for implementing the standard Astro project architecture, covering directory structure, component organization, layouts, content collections, data fetching patterns, and state management.
globs: <root>/src/**/*.astro,<root>/astro.config.mjs
alwaysApply: false
---

# Standard Astro Architecture

## Overview

The standard Astro architecture follows Astro's recommended project structure with a focus on maintainability, performance, and developer experience.

## Directory Structure

```
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Shared components
│   │   ├── layout/          # Layout components
│   │   └── pages/           # Page-specific components
│   ├── layouts/             # Layout templates
│   ├── pages/               # Page routes
│   ├── content/             # Content collections
│   │   └── config.ts        # Collection schemas
│   ├── styles/              # Global styles and variables
│   ├── utils/               # Utility functions
│   │   ├── api.ts           # API functions
│   │   └── helpers.ts       # Helper functions
│   └── env.d.ts             # TypeScript env definitions
├── astro.config.mjs         # Astro configuration
├── package.json             # Project dependencies
└── tsconfig.json            # TypeScript configuration
```

## Component Organization

### Categorizing Components

In the standard architecture, components are organized into the following categories:

1. **Common Components**: Reusable UI elements like buttons, cards, etc.
2. **Layout Components**: Elements that define the page structure
3. **Page Components**: Components specific to particular pages

### Component Responsibilities

Each component should have a focused responsibility:

```typescript
// src/components/common/Button.astro
---
interface Props {
  text: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  onClick?: string;
}

const { text, variant = 'primary', size = 'medium', onClick } = Astro.props;
---

<button
  class:list={['btn', `btn-${variant}`, `btn-${size}`]}
  onclick={onClick}
>
  {text}
</button>

<style>
  .btn {
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-primary {
    background-color: var(--color-primary);
    color: white;
  }

  /* Other styles... */
</style>
```

## Layouts Implementation

Layouts are used to define consistent page structures:

```typescript
// src/layouts/BaseLayout.astro
---
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'My Astro Site' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

## Page Structure

Pages serve as the entry points for routes in your application:

```typescript
// src/pages/index.astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/pages/home/Hero.astro';
import FeatureSection from '../components/pages/home/FeatureSection.astro';
import CTASection from '../components/common/CTASection.astro';

const pageTitle = 'Welcome to My Astro Site';
---

<BaseLayout title={pageTitle}>
  <Hero />
  <FeatureSection />
  <CTASection title="Ready to get started?" buttonText="Get Started" href="/getting-started" />
</BaseLayout>
```

## Content Collections

Content is organized using Astro's content collections:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		date: z.date(),
		author: z.string(),
		image: z.string().optional(),
		description: z.string(),
		draft: z.boolean().default(false),
		tags: z.array(z.string()),
	}),
});

export const collections = {
	blog: blogCollection,
};
```

## Data Fetching Pattern

Standard architecture follows these data fetching patterns:

### Static Data Fetching (Build Time)

```typescript
// src/pages/posts/index.astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/pages/blog/PostCard.astro';

// Fetch all blog posts at build time
const posts = await getCollection('blog', ({ data }) => {
  return import.meta.env.PROD ? !data.draft : true;
});

// Sort by date
const sortedPosts = posts.sort((a, b) =>
  new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
);
---

<BaseLayout title="Blog Posts">
  <h1>Blog Posts</h1>
  <div class="post-grid">
    {sortedPosts.map(post => (
      <PostCard post={post} />
    ))}
  </div>
</BaseLayout>
```

### Server-Side Data Fetching (SSR)

```typescript
// src/pages/api/search.js
export async function get({ request }) {
	const url = new URL(request.url);
	const query = url.searchParams.get('q');

	if (!query) {
		return new Response(
			JSON.stringify({
				error: 'Missing search query',
			}),
			{ status: 400 }
		);
	}

	try {
		const results = await searchDatabase(query);
		return new Response(JSON.stringify({ results }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
		});
	}
}
```

## State Management

For client-side state, use local component state or a minimal state management library:

```typescript
// src/components/SearchForm.jsx
import { useState } from 'react';

export default function SearchForm() {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);

	async function handleSearch(e) {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch(
				`/api/search?q=${encodeURIComponent(query)}`
			);
			const data = await response.json();
			setResults(data.results);
		} catch (error) {
			console.error('Search error:', error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSearch}>
			<input
				type='text'
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder='Search...'
			/>
			<button type='submit' disabled={loading}>
				{loading ? 'Searching...' : 'Search'}
			</button>

			{results.length > 0 && (
				<ul>
					{results.map((result) => (
						<li key={result.id}>{result.title}</li>
					))}
				</ul>
			)}
		</form>
	);
}
```

## Integration Patterns

Standard architecture supports integration with other frameworks and libraries:

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
	integrations: [react(), tailwind(), mdx()],
	output: 'hybrid', // Enables SSR where needed, static by default
	vite: {
		ssr: {
			noExternal: ['styled-components'],
		},
	},
});
```

## Summary of Best Practices

1. **Component Composition**: Build complex UIs from simple, reusable components
2. **Type Safety**: Use TypeScript for props and data validation
3. **Content as Data**: Leverage content collections for structured content
4. **Performance First**: Use Astro's partial hydration for minimal JavaScript
5. **Progressive Enhancement**: Build for the widest audience possible
6. **SSR Selective Usage**: Use SSR only for dynamic routes that require it
