---
title: Astro v4 Specific Features
description: Key features and implementation details specific to Astro version 4
tags: [Astro, v4, Features, AstroDB, Actions, i18n]
globs: <root>/src/content/**/*.md,<root>/src/content/**/*.mdx,<root>/astro.config.js,<root>/astro.config.mjs,<root>/astro.config.ts,<root>/db/**/*.ts
---

# Astro v4 Specific Features

## Overview

Astro 4.0 introduces revolutionary features for building dynamic web applications, including Astro DB for database management, Astro Actions for type-safe server functions, enhanced internationalization, and significantly improved development experience.

## Astro DB

Astro 4.0 introduces Astro DB, a SQL database designed specifically for Astro. It provides a simple, lightweight database solution with excellent TypeScript integration.

### Database Schema Definition

```typescript
// db/config.ts
import { defineDb, defineTable, column } from 'astro:db';

const User = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		name: column.text(),
		email: column.text({ unique: true }),
		createdAt: column.date({ default: new Date() }),
		isActive: column.boolean({ default: true }),
	},
});

const Post = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		title: column.text(),
		content: column.text(),
		slug: column.text({ unique: true }),
		authorId: column.number({ references: () => User.columns.id }),
		publishedAt: column.date({ optional: true }),
		tags: column.json({ optional: true }),
	},
});

const Comment = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		content: column.text(),
		postId: column.number({ references: () => Post.columns.id }),
		authorId: column.number({ references: () => User.columns.id }),
		createdAt: column.date({ default: new Date() }),
	},
});

export default defineDb({
	tables: { User, Post, Comment },
});
```

### Database Seeding

```typescript
// db/seed.ts
import { db, User, Post, Comment } from 'astro:db';

export default async function seed() {
	// Seed users
	await db.insert(User).values([
		{
			id: 1,
			name: 'John Doe',
			email: 'john@example.com',
		},
		{
			id: 2,
			name: 'Jane Smith',
			email: 'jane@example.com',
		},
	]);

	// Seed posts
	await db.insert(Post).values([
		{
			id: 1,
			title: 'Getting Started with Astro DB',
			content: 'Learn how to use Astro DB...',
			slug: 'getting-started-astro-db',
			authorId: 1,
			publishedAt: new Date('2024-01-01'),
			tags: ['astro', 'database', 'tutorial'],
		},
		{
			id: 2,
			title: 'Advanced Database Patterns',
			content: 'Explore advanced patterns...',
			slug: 'advanced-database-patterns',
			authorId: 2,
			publishedAt: new Date('2024-01-15'),
			tags: ['astro', 'database', 'advanced'],
		},
	]);

	// Seed comments
	await db.insert(Comment).values([
		{
			id: 1,
			content: 'Great article!',
			postId: 1,
			authorId: 2,
		},
		{
			id: 2,
			content: 'Very helpful, thanks!',
			postId: 1,
			authorId: 1,
		},
	]);
}
```

### Using the Database

```typescript
// src/pages/blog/[slug].astro
---
import { db, Post, User, Comment } from 'astro:db';
import Layout from '../../layouts/Layout.astro';

const { slug } = Astro.params;

// Query post with author information
const post = await db
  .select({
    id: Post.id,
    title: Post.title,
    content: Post.content,
    publishedAt: Post.publishedAt,
    tags: Post.tags,
    authorName: User.name,
    authorEmail: User.email,
  })
  .from(Post)
  .innerJoin(User, eq(Post.authorId, User.id))
  .where(eq(Post.slug, slug))
  .get();

if (!post) {
  return Astro.redirect('/404');
}

// Query comments for this post
const comments = await db
  .select({
    id: Comment.id,
    content: Comment.content,
    createdAt: Comment.createdAt,
    authorName: User.name,
  })
  .from(Comment)
  .innerJoin(User, eq(Comment.authorId, User.id))
  .where(eq(Comment.postId, post.id))
  .orderBy(desc(Comment.createdAt));
---

<Layout title={post.title}>
  <article>
    <header>
      <h1>{post.title}</h1>
      <p>By {post.authorName} on {post.publishedAt?.toLocaleDateString()}</p>
      {post.tags && (
        <div class="tags">
          {post.tags.map((tag) => (
            <span class="tag">{tag}</span>
          ))}
        </div>
      )}
    </header>

    <div class="content">
      {post.content}
    </div>

    <section class="comments">
      <h2>Comments ({comments.length})</h2>
      {comments.map((comment) => (
        <div class="comment">
          <p>{comment.content}</p>
          <small>By {comment.authorName} on {comment.createdAt.toLocaleDateString()}</small>
        </div>
      ))}
    </section>
  </article>
</Layout>
```

### Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import db from '@astrojs/db';

export default defineConfig({
	integrations: [db()],
	output: 'server', // Required for Astro DB
});
```

## Astro Actions

Astro Actions provide a type-safe way to handle server-side logic with automatic input validation and error handling.

### Defining Actions

```typescript
// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { db, User, Post } from 'astro:db';

export const server = {
	// User registration action
	registerUser: defineAction({
		input: z.object({
			name: z.string().min(2, 'Name must be at least 2 characters'),
			email: z.string().email('Invalid email address'),
			password: z
				.string()
				.min(8, 'Password must be at least 8 characters'),
		}),
		handler: async (input) => {
			try {
				const hashedPassword = await hashPassword(input.password);

				const user = await db
					.insert(User)
					.values({
						name: input.name,
						email: input.email,
						password: hashedPassword,
					})
					.returning();

				return {
					success: true,
					user: user[0],
				};
			} catch (error) {
				throw new ActionError({
					code: 'BAD_REQUEST',
					message: 'Email already exists',
				});
			}
		},
	}),

	// Create post action
	createPost: defineAction({
		input: z.object({
			title: z.string().min(5, 'Title must be at least 5 characters'),
			content: z
				.string()
				.min(10, 'Content must be at least 10 characters'),
			slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
			tags: z.array(z.string()).optional(),
		}),
		handler: async (input, context) => {
			// Check if user is authenticated
			const user = await getCurrentUser(context);
			if (!user) {
				throw new ActionError({
					code: 'UNAUTHORIZED',
					message: 'You must be logged in to create a post',
				});
			}

			const post = await db
				.insert(Post)
				.values({
					title: input.title,
					content: input.content,
					slug: input.slug,
					authorId: user.id,
					tags: input.tags,
					publishedAt: new Date(),
				})
				.returning();

			return {
				success: true,
				post: post[0],
			};
		},
	}),

	// Like post action
	likePost: defineAction({
		input: z.object({
			postId: z.number(),
		}),
		handler: async (input, context) => {
			const user = await getCurrentUser(context);
			if (!user) {
				throw new ActionError({
					code: 'UNAUTHORIZED',
					message: 'You must be logged in to like a post',
				});
			}

			// Toggle like logic here
			const likes = await togglePostLike(input.postId, user.id);

			return { likes };
		},
	}),
};
```

### Using Actions in Components

```typescript
// src/pages/create-post.astro
---
import { actions } from 'astro:actions';
import Layout from '../layouts/Layout.astro';

const result = await Astro.callAction(actions.createPost);

if (result && !result.error) {
  return Astro.redirect(`/blog/${result.data.post.slug}`);
}
---

<Layout title="Create Post">
  <form method="POST" action={actions.createPost}>
    <div>
      <label for="title">Title:</label>
      <input
        type="text"
        id="title"
        name="title"
        required
        value={result?.error?.fields?.title?.[0] || ''}
      />
      {result?.error?.fieldErrors?.title && (
        <p class="error">{result.error.fieldErrors.title[0]}</p>
      )}
    </div>

    <div>
      <label for="content">Content:</label>
      <textarea
        id="content"
        name="content"
        required
      >{result?.error?.fields?.content?.[0] || ''}</textarea>
      {result?.error?.fieldErrors?.content && (
        <p class="error">{result.error.fieldErrors.content[0]}</p>
      )}
    </div>

    <div>
      <label for="slug">Slug:</label>
      <input
        type="text"
        id="slug"
        name="slug"
        required
        value={result?.error?.fields?.slug?.[0] || ''}
      />
      {result?.error?.fieldErrors?.slug && (
        <p class="error">{result.error.fieldErrors.slug[0]}</p>
      )}
    </div>

    <button type="submit">Create Post</button>
  </form>

  {result?.error?.message && (
    <p class="error">{result.error.message}</p>
  )}
</Layout>
```

### Client-Side Action Usage

```typescript
// src/components/LikeButton.astro
---
interface Props {
  postId: number;
  initialLikes: number;
}

const { postId, initialLikes } = Astro.props;
---

<button
  class="like-button"
  data-post-id={postId}
  data-likes={initialLikes}
>
  <span class="likes-count">{initialLikes}</span> ❤️
</button>

<script>
  import { actions } from 'astro:actions';

  document.addEventListener('DOMContentLoaded', () => {
    const likeButtons = document.querySelectorAll('.like-button');

    likeButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();

        const postId = parseInt(button.dataset.postId);
        const likesSpan = button.querySelector('.likes-count');

        try {
          const result = await actions.likePost({ postId });

          if (!result.error) {
            likesSpan.textContent = result.data.likes;
          } else {
            console.error('Error liking post:', result.error.message);
          }
        } catch (error) {
          console.error('Network error:', error);
        }
      });
    });
  });
</script>

<style>
  .like-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    transition: transform 0.2s;
  }

  .like-button:hover {
    transform: scale(1.1);
  }
</style>
```

## Enhanced Internationalization (i18n)

Astro 4.0 significantly improves internationalization support with routing, locale detection, and translation helpers.

### Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'es', 'fr', 'de'],
		routing: {
			prefixDefaultLocale: false,
			redirectToDefaultLocale: true,
		},
		domains: {
			fr: 'https://fr.example.com',
			es: 'https://es.example.com',
		},
	},
});
```

### Routing with Locales

```typescript
// src/pages/[...locale]/blog/[slug].astro
---
import { getStaticPaths } from 'astro:i18n';
import Layout from '../../../layouts/Layout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');

  return posts.flatMap((post) => {
    return ['en', 'es', 'fr', 'de'].map((locale) => ({
      params: {
        locale,
        slug: post.slug
      },
      props: { post, locale }
    }));
  });
}

const { post, locale } = Astro.props;
const { slug } = Astro.params;
---

<Layout title={post.data.title} locale={locale}>
  <article>
    <h1>{post.data.title}</h1>
    <div set:html={post.render()} />
  </article>
</Layout>
```

### Translation Utilities

```typescript
// src/utils/i18n.ts
const translations = {
	en: {
		'nav.home': 'Home',
		'nav.about': 'About',
		'nav.blog': 'Blog',
		'nav.contact': 'Contact',
		'blog.readMore': 'Read more',
		'blog.publishedOn': 'Published on',
	},
	es: {
		'nav.home': 'Inicio',
		'nav.about': 'Acerca de',
		'nav.blog': 'Blog',
		'nav.contact': 'Contacto',
		'blog.readMore': 'Leer más',
		'blog.publishedOn': 'Publicado el',
	},
	fr: {
		'nav.home': 'Accueil',
		'nav.about': 'À propos',
		'nav.blog': 'Blog',
		'nav.contact': 'Contact',
		'blog.readMore': 'Lire la suite',
		'blog.publishedOn': 'Publié le',
	},
};

export function t(locale: string, key: string): string {
	return translations[locale]?.[key] || translations.en[key] || key;
}

export function getLocaleFromUrl(url: URL): string {
	const segments = url.pathname.split('/');
	const potentialLocale = segments[1];

	if (['en', 'es', 'fr', 'de'].includes(potentialLocale)) {
		return potentialLocale;
	}

	return 'en';
}
```

## Development Toolbar Enhancements

Astro 4.0 introduces a powerful development toolbar with built-in apps and the ability to create custom ones.

### Custom Toolbar App

```typescript
// src/dev-toolbar/my-app.ts
import type { DevToolbarApp } from 'astro';

export default {
	id: 'my-custom-app',
	name: 'My Custom App',
	icon: '🛠️',
	init(canvas, eventTarget) {
		// Create UI elements
		const button = document.createElement('button');
		button.textContent = 'Toggle Feature';
		button.style.cssText = `
      background: #7c3aed;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    `;

		button.addEventListener('click', () => {
			// Toggle some development feature
			document.body.classList.toggle('debug-mode');
			eventTarget.dispatchEvent(
				new CustomEvent('astro:dev-toolbar:toggled', {
					detail: {
						enabled: document.body.classList.contains('debug-mode'),
					},
				})
			);
		});

		canvas.appendChild(button);
	},
} satisfies DevToolbarApp;
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	devToolbar: {
		enabled: true,
		apps: ['./src/dev-toolbar/my-app.ts'],
	},
});
```

## Request Rewriting

Astro 4.13 introduces request rewriting capabilities for advanced routing scenarios.

### Using Rewrite in Middleware

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
	const url = new URL(context.request.url);

	// Rewrite API routes to versioned endpoints
	if (url.pathname.startsWith('/api/')) {
		const version = context.request.headers.get('API-Version') || 'v1';
		return context.rewrite(`/api/${version}${url.pathname.slice(4)}`);
	}

	// A/B testing rewrites
	if (url.pathname === '/pricing') {
		const variant = Math.random() > 0.5 ? 'a' : 'b';
		return context.rewrite(`/pricing-${variant}`);
	}

	// Redirect old blog structure
	if (url.pathname.startsWith('/blog/')) {
		const slug = url.pathname.slice(6);
		return context.rewrite(`/posts/${slug}`);
	}

	return next();
});
```

### Using Rewrite in Pages

```typescript
// src/pages/legacy/[...path].astro
---
// Rewrite legacy URLs to new structure
const { path } = Astro.params;

if (path?.startsWith('product/')) {
  const productId = path.split('/')[1];
  return Astro.rewrite(`/products/${productId}`);
}

if (path?.startsWith('category/')) {
  const category = path.split('/')[1];
  return Astro.rewrite(`/shop/${category}`);
}

return Astro.redirect('/404');
---
```

## CSS Imports and Asset Handling

Astro 4.0 improves CSS handling and asset processing.

### CSS Modules

```typescript
// src/components/Card.astro
---
interface Props {
  title: string;
  content: string;
}

const { title, content } = Astro.props;
---

<div class="card">
  <h3 class="title">{title}</h3>
  <p class="content">{content}</p>
</div>

<style module>
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .title {
    margin: 0 0 0.5rem 0;
    color: #1a202c;
    font-size: 1.25rem;
  }

  .content {
    margin: 0;
    color: #4a5568;
    line-height: 1.5;
  }
</style>
```

### Asset Imports

```typescript
// src/pages/gallery.astro
---
import heroImage from '../assets/hero.jpg?url';
import iconSprite from '../assets/icons.svg?raw';
import configData from '../data/config.json';
---

<div class="gallery">
  <img src={heroImage} alt="Hero" />

  <!-- Inline SVG -->
  <div set:html={iconSprite} />

  <!-- Use imported JSON data -->
  <h1>{configData.siteTitle}</h1>
</div>
```

## Environment Variables and Security

Astro 4.0 enhances security with CSRF protection and improved environment variable handling.

### CSRF Protection

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	security: {
		checkOrigin: true,
	},
	output: 'server',
});
```

### Environment Variables

```typescript
// src/utils/env.ts
import { z } from 'astro:schema';

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	API_KEY: z.string().min(32),
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);
```

```typescript
// Using environment variables safely
---
import { env } from '../utils/env';

// This will be validated at build/runtime
const apiResponse = await fetch(`${env.API_URL}/data`, {
  headers: {
    'Authorization': `Bearer ${env.API_KEY}`
  }
});
---
```

## Performance Optimizations

Astro 4.0 includes numerous performance improvements and new optimization features.

### Bundle Analysis

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					'react-vendor': ['react', 'react-dom'],
					utils: ['lodash', 'date-fns'],
				},
			},
		},
	},
	vite: {
		build: {
			rollupOptions: {
				external: ['some-large-library'],
			},
		},
	},
});
```

### Preloading Strategies

```typescript
// src/layouts/BaseLayout.astro
---
interface Props {
  title: string;
  preloadImages?: string[];
  preloadScripts?: string[];
}

const { title, preloadImages = [], preloadScripts = [] } = Astro.props;
---

<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>

  <!-- Preload critical images -->
  {preloadImages.map(src => (
    <link rel="preload" as="image" href={src} />
  ))}

  <!-- Preload critical scripts -->
  {preloadScripts.map(src => (
    <link rel="modulepreload" href={src} />
  ))}
</head>
<body>
  <slot />
</body>
</html>
```

This comprehensive guide covers the major features introduced in Astro 4.0, providing practical examples and implementation patterns for building modern web applications with enhanced database capabilities, type-safe server actions, improved internationalization, and better development experience.
