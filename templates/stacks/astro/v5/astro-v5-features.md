---
title: Astro v5 Specific Features
description: Key features and implementation details specific to Astro version 5
tags: [Astro, v5, Features, ContentLayer, ServerIslands, astro:env, Sessions]
globs: <root>/src/content/**/*.md,<root>/src/content/**/*.mdx,<root>/astro.config.js,<root>/astro.config.mjs,<root>/astro.config.ts,<root>/src/content.config.ts
---

# Astro v5 Specific Features

## Overview

Astro 5.0 represents a major evolution in the framework, introducing the Content Layer API for flexible content management, Server Islands for hybrid rendering, astro:env for type-safe environment variables, experimental sessions support, responsive images, and significant performance improvements.

## Content Layer API

The Content Layer API revolutionizes how Astro handles content by generalizing Content Collections to work with any data source, not just local files.

### Basic Content Layer Setup

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Local content with new loader syntax
const blog = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/data/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishDate: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

// Remote content from API
const products = defineCollection({
	loader: async () => {
		const response = await fetch('https://api.example.com/products');
		const data = await response.json();

		return data.map((product) => ({
			id: product.id,
			data: {
				name: product.name,
				price: product.price,
				description: product.description,
				category: product.category,
				inStock: product.stock > 0,
			},
		}));
	},
	schema: z.object({
		name: z.string(),
		price: z.number(),
		description: z.string(),
		category: z.string(),
		inStock: z.boolean(),
	}),
});

export const collections = { blog, products };
```

### Custom Loaders

```typescript
// src/loaders/database-loader.ts
import type { Loader } from 'astro/loaders';
import { db } from '../utils/database';

export function databaseLoader(table: string): Loader {
	return {
		name: 'database-loader',
		load: async ({ store, meta, logger }) => {
			logger.info(`Loading data from table: ${table}`);

			// Get last sync timestamp
			const lastSync = await meta.get('lastSync');
			const since = lastSync ? new Date(lastSync) : new Date(0);

			// Query database for new/updated records
			const records = await db.query(
				`
        SELECT * FROM ${table} 
        WHERE updated_at > $1 
        ORDER BY updated_at DESC
      `,
				[since]
			);

			// Store records
			for (const record of records) {
				store.set({
					id: record.id,
					data: record,
				});
			}

			// Update last sync timestamp
			await meta.set('lastSync', new Date().toISOString());

			logger.info(`Loaded ${records.length} records from ${table}`);
		},
	};
}
```

```typescript
// Using custom loader
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { databaseLoader } from './loaders/database-loader';

const users = defineCollection({
	loader: databaseLoader('users'),
	schema: z.object({
		name: z.string(),
		email: z.string().email(),
		role: z.enum(['admin', 'user', 'moderator']),
		createdAt: z.coerce.date(),
		isActive: z.boolean(),
	}),
});

export const collections = { users };
```

### Advanced Content Operations

```typescript
// src/pages/blog/index.astro
---
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';

// Get all blog posts, filtered and sorted
const allPosts = await getCollection('blog', ({ data }) => {
  return data.draft !== true;
});

// Sort by publish date (newest first)
const posts = allPosts.sort((a, b) =>
  b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
);

// Group posts by year
const postsByYear = posts.reduce((acc, post) => {
  const year = post.data.publishDate.getFullYear();
  if (!acc[year]) acc[year] = [];
  acc[year].push(post);
  return acc;
}, {} as Record<number, typeof posts>);

// Get unique tags
const allTags = [...new Set(posts.flatMap(post => post.data.tags))];
---

<Layout title="Blog Archive">
  <div class="blog-archive">
    <h1>Blog Archive</h1>

    <div class="tags-filter">
      <h2>Filter by Tags</h2>
      {allTags.map(tag => (
        <a href={`/blog/tags/${tag}`} class="tag">{tag}</a>
      ))}
    </div>

    {Object.entries(postsByYear)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([year, yearPosts]) => (
        <section class="year-section">
          <h2>{year}</h2>
          <div class="posts-grid">
            {yearPosts.map(post => (
              <article class="post-card">
                <h3>
                  <a href={`/blog/${post.id}`}>{post.data.title}</a>
                </h3>
                <p>{post.data.description}</p>
                <div class="meta">
                  <time>{post.data.publishDate.toLocaleDateString()}</time>
                  <div class="tags">
                    {post.data.tags.map(tag => (
                      <span class="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))
    }
  </div>
</Layout>
```

### Content with Rendered Output

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const documentation = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/docs' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		category: z.string(),
		order: z.number().default(0),
		toc: z.boolean().default(true),
	}),
});

export const collections = { documentation };
```

```typescript
// src/pages/docs/[...slug].astro
---
import { getCollection, getEntry } from 'astro:content';
import Layout from '../../layouts/DocsLayout.astro';

export async function getStaticPaths() {
  const docs = await getCollection('documentation');
  return docs.map(doc => ({
    params: { slug: doc.id },
    props: { doc },
  }));
}

const { doc } = Astro.props;
const { Content, headings } = await doc.render();
---

<Layout
  title={doc.data.title}
  description={doc.data.description}
  headings={doc.data.toc ? headings : []}
>
  <article class="documentation">
    <header>
      <h1>{doc.data.title}</h1>
      <p class="description">{doc.data.description}</p>
    </header>

    <div class="content">
      <Content />
    </div>
  </article>
</Layout>
```

## Server Islands

Server Islands enable hybrid rendering where parts of your page are server-rendered on demand while the rest remains static.

### Basic Server Island Implementation

```typescript
// src/components/UserProfile.astro
---
// This component will be server-rendered on demand
import { getUserProfile, getUserActivity } from '../utils/auth';

// Get user session from cookies
const sessionToken = Astro.cookies.get('session')?.value;

if (!sessionToken) {
  throw new Error('User not authenticated');
}

const userProfile = await getUserProfile(sessionToken);
const recentActivity = await getUserActivity(sessionToken, { limit: 5 });
---

<div class="user-profile">
  <div class="profile-header">
    <img
      src={userProfile.avatar}
      alt={`${userProfile.name}'s avatar`}
      class="avatar"
    />
    <div class="user-info">
      <h2>{userProfile.name}</h2>
      <p>{userProfile.email}</p>
      <span class="role">{userProfile.role}</span>
    </div>
  </div>

  <div class="recent-activity">
    <h3>Recent Activity</h3>
    <ul>
      {recentActivity.map(activity => (
        <li>
          <time>{activity.timestamp.toLocaleDateString()}</time>
          <span>{activity.action}</span>
        </li>
      ))}
    </ul>
  </div>
</div>

<style>
  .user-profile {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    background: white;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
  }

  .role {
    background: #3b82f6;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }
</style>
```

### Using Server Islands in Pages

```typescript
// src/pages/dashboard.astro
---
import Layout from '../layouts/Layout.astro';
import UserProfile from '../components/UserProfile.astro';
import StaticContent from '../components/StaticContent.astro';
import LoadingSpinner from '../components/LoadingSpinner.astro';
---

<Layout title="Dashboard">
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
      <!-- Static content renders immediately -->
      <StaticContent />
    </header>

    <main class="dashboard-content">
      <!-- Server Island with fallback content -->
      <UserProfile server:defer>
        <LoadingSpinner slot="fallback" />
      </UserProfile>

      <!-- Another server island -->
      <div class="metrics">
        <MetricsWidget server:defer>
          <div slot="fallback" class="metrics-placeholder">
            Loading metrics...
          </div>
        </MetricsWidget>
      </div>
    </main>
  </div>
</Layout>

<style>
  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .dashboard-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
    margin-top: 2rem;
  }

  .metrics-placeholder {
    background: #f7fafc;
    padding: 2rem;
    text-align: center;
    border-radius: 8px;
    color: #718096;
  }
</style>
```

### Dynamic Server Islands

```typescript
// src/components/DynamicChart.astro
---
interface Props {
  chartType: 'bar' | 'line' | 'pie';
  timeRange: string;
}

const { chartType, timeRange } = Astro.props;

// This data is fetched on the server for each request
const chartData = await fetchChartData(chartType, timeRange);
const chartConfig = getChartConfig(chartType);
---

<div class="chart-container" data-chart-type={chartType}>
  <h3>Analytics - {timeRange}</h3>

  <div class="chart-wrapper">
    <!-- Chart will be hydrated on the client -->
    <div
      class="chart"
      data-chart-data={JSON.stringify(chartData)}
      data-chart-config={JSON.stringify(chartConfig)}
    >
    </div>
  </div>
</div>

<script>
  // Client-side chart rendering
  import { createChart } from '../utils/charts';

  document.addEventListener('DOMContentLoaded', () => {
    const chartElements = document.querySelectorAll('.chart');

    chartElements.forEach(element => {
      const data = JSON.parse(element.getAttribute('data-chart-data'));
      const config = JSON.parse(element.getAttribute('data-chart-config'));

      createChart(element, data, config);
    });
  });
</script>
```

## astro:env - Type-Safe Environment Variables

Astro 5.0 introduces astro:env for better environment variable management with type safety and validation.

### Environment Schema Definition

```javascript
// astro.config.mjs
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
	env: {
		schema: {
			// Database configuration
			DATABASE_URL: envField.string({
				context: 'server',
				access: 'secret',
			}),
			DATABASE_POOL_SIZE: envField.number({
				context: 'server',
				access: 'public',
				default: 10,
			}),

			// API configuration
			API_BASE_URL: envField.string({
				context: 'client',
				access: 'public',
				default: 'https://api.example.com',
			}),
			API_KEY: envField.string({
				context: 'server',
				access: 'secret',
			}),

			// Feature flags
			ENABLE_ANALYTICS: envField.boolean({
				context: 'client',
				access: 'public',
				default: false,
			}),
			ENABLE_DEBUG_MODE: envField.boolean({
				context: 'server',
				access: 'public',
				default: false,
			}),

			// Optional configurations
			REDIS_URL: envField.string({
				context: 'server',
				access: 'secret',
				optional: true,
			}),
			SMTP_HOST: envField.string({
				context: 'server',
				access: 'secret',
				optional: true,
			}),
		},
	},
});
```

### Using Environment Variables

```typescript
// src/utils/config.ts
import { DATABASE_URL, DATABASE_POOL_SIZE, API_KEY } from 'astro:env/server';

import { API_BASE_URL, ENABLE_ANALYTICS } from 'astro:env/client';

// Server-side configuration
export const databaseConfig = {
	url: DATABASE_URL,
	poolSize: DATABASE_POOL_SIZE,
	ssl: process.env.NODE_ENV === 'production',
};

export const apiConfig = {
	key: API_KEY,
	baseUrl: API_BASE_URL,
	timeout: 5000,
};

// Client-side configuration
export const clientConfig = {
	apiBaseUrl: API_BASE_URL,
	enableAnalytics: ENABLE_ANALYTICS,
};
```

```typescript
// src/pages/api/users.ts
import type { APIRoute } from 'astro';
import { DATABASE_URL, API_KEY } from 'astro:env/server';
import { createDatabase } from '../utils/database';

const db = createDatabase(DATABASE_URL);

export const GET: APIRoute = async ({ request }) => {
	// Validate API key
	const authHeader = request.headers.get('Authorization');
	if (authHeader !== `Bearer ${API_KEY}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const users = await db.query('SELECT id, name, email FROM users');
		return new Response(JSON.stringify(users), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response('Internal Server Error', { status: 500 });
	}
};
```

### Client-Side Environment Usage

```typescript
// src/components/Analytics.astro
---
import { ENABLE_ANALYTICS, API_BASE_URL } from 'astro:env/client';
---

{ENABLE_ANALYTICS && (
  <script define:vars={{ apiBaseUrl: API_BASE_URL }}>
    // Analytics will only be loaded if enabled
    (function() {
      const analytics = {
        track: (event, data) => {
          fetch(`${apiBaseUrl}/analytics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, data, timestamp: Date.now() })
          });
        }
      };

      // Track page view
      analytics.track('page_view', {
        path: window.location.pathname,
        referrer: document.referrer
      });

      // Make analytics available globally
      window.analytics = analytics;
    })();
  </script>
)}
```

## Sessions (Experimental)

Astro 5.1 introduces experimental session support for server-side state management.

### Session Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	experimental: {
		session: {
			driver: 'fs', // or 'redis', 'cloudflare-kv', etc.
		},
	},
});
```

### Using Sessions in Actions

```typescript
// src/actions/auth.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { verifyPassword, hashPassword } from '../utils/auth';

export const server = {
	login: defineAction({
		input: z.object({
			email: z.string().email(),
			password: z.string().min(6),
		}),
		handler: async (input, context) => {
			const user = await getUserByEmail(input.email);

			if (
				!user ||
				!(await verifyPassword(input.password, user.passwordHash))
			) {
				throw new ActionError({
					code: 'UNAUTHORIZED',
					message: 'Invalid credentials',
				});
			}

			// Store user in session
			await context.session.set('user', {
				id: user.id,
				email: user.email,
				role: user.role,
				loginTime: Date.now(),
			});

			return { success: true, user: { id: user.id, email: user.email } };
		},
	}),

	logout: defineAction({
		input: z.object({}),
		handler: async (input, context) => {
			await context.session.destroy();
			return { success: true };
		},
	}),

	updateProfile: defineAction({
		input: z.object({
			name: z.string().min(2),
			bio: z.string().optional(),
		}),
		handler: async (input, context) => {
			const user = await context.session.get('user');

			if (!user) {
				throw new ActionError({
					code: 'UNAUTHORIZED',
					message: 'Not logged in',
				});
			}

			const updatedUser = await updateUserProfile(user.id, input);

			// Update session with new data
			await context.session.set('user', {
				...user,
				...updatedUser,
			});

			return { success: true, user: updatedUser };
		},
	}),
};
```

### Session Management in Components

```typescript
// src/components/UserMenu.astro
---
// Access session in component
const user = await Astro.session.get('user');
const isLoggedIn = !!user;
---

<div class="user-menu">
  {isLoggedIn ? (
    <div class="user-dropdown">
      <button class="user-button">
        <img src={user.avatar || '/default-avatar.png'} alt="User avatar" />
        <span>{user.email}</span>
      </button>

      <div class="dropdown-content">
        <a href="/profile">Profile</a>
        <a href="/settings">Settings</a>
        <hr />
        <form method="POST" action="/api/logout">
          <button type="submit">Logout</button>
        </form>
      </div>
    </div>
  ) : (
    <div class="auth-buttons">
      <a href="/login" class="btn btn-outline">Login</a>
      <a href="/signup" class="btn btn-primary">Sign Up</a>
    </div>
  )}
</div>
```

### Session Middleware

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
	const { url, session } = context;

	// Check if user is accessing protected routes
	const protectedRoutes = ['/dashboard', '/profile', '/admin'];
	const isProtectedRoute = protectedRoutes.some((route) =>
		url.pathname.startsWith(route)
	);

	if (isProtectedRoute) {
		const user = await session.get('user');

		if (!user) {
			return context.redirect('/login');
		}

		// Check session expiry (optional)
		const sessionAge = Date.now() - user.loginTime;
		const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

		if (sessionAge > maxAge) {
			await session.destroy();
			return context.redirect('/login');
		}

		// Check admin routes
		if (url.pathname.startsWith('/admin') && user.role !== 'admin') {
			return new Response('Forbidden', { status: 403 });
		}
	}

	return next();
});
```

## Responsive Images (Experimental)

Astro 5.0 introduces experimental responsive images with automatic srcset and sizes generation.

### Responsive Image Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	experimental: {
		responsiveImages: true,
	},
	image: {
		experimentalDefaultStyles: true, // Can be disabled for custom styling
		domains: ['images.unsplash.com', 'cdn.example.com'],
	},
});
```

### Using Responsive Images

```typescript
// src/components/ResponsiveImage.astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';

interface Props {
  layout: 'fixed' | 'responsive' | 'fill';
  priority?: boolean;
}

const { layout, priority = false } = Astro.props;
---

<!-- Responsive layout with automatic srcset -->
<Image
  src={heroImage}
  alt="Hero image"
  layout="responsive"
  width={1200}
  height={800}
  priority={priority}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

<!-- Fixed layout for specific dimensions -->
<Image
  src={heroImage}
  alt="Thumbnail"
  layout="fixed"
  width={300}
  height={200}
/>

<!-- Fill layout for container-based sizing -->
<div class="image-container">
  <Image
    src={heroImage}
    alt="Background"
    layout="fill"
    objectFit="cover"
  />
</div>

<style>
  .image-container {
    position: relative;
    width: 100%;
    height: 400px;
  }
</style>
```

### Custom Image Loader

```typescript
// src/utils/image-loader.ts
export function customImageLoader({ src, width, quality }) {
	const params = new URLSearchParams();
	params.set('url', src);
	params.set('w', width.toString());

	if (quality) {
		params.set('q', quality.toString());
	}

	return `https://your-image-service.com/api/transform?${params}`;
}
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { customImageLoader } from './src/utils/image-loader';

export default defineConfig({
	image: {
		service: {
			entrypoint: customImageLoader,
		},
	},
});
```

## Container API for Testing

The Container API enables rendering Astro components in isolation, perfect for testing.

### Basic Testing Setup

```typescript
// tests/components/Card.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Card from '../../src/components/Card.astro';

test('Card renders with title and content', async () => {
	const container = await AstroContainer.create();

	const result = await container.renderToString(Card, {
		props: {
			title: 'Test Card',
			content: 'This is test content',
		},
	});

	expect(result).toContain('Test Card');
	expect(result).toContain('This is test content');
});

test('Card with slots', async () => {
	const container = await AstroContainer.create();

	const result = await container.renderToString(Card, {
		props: {
			title: 'Slot Test',
		},
		slots: {
			default: '<p>Slot content</p>',
			footer: '<button>Action</button>',
		},
	});

	expect(result).toContain('Slot content');
	expect(result).toContain('<button>Action</button>');
});
```

### Advanced Testing with Context

```typescript
// tests/components/UserProfile.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, beforeEach } from 'vitest';
import UserProfile from '../../src/components/UserProfile.astro';

let container: AstroContainer;

beforeEach(async () => {
	container = await AstroContainer.create({
		streaming: false,
		renderers: [],
	});
});

test('UserProfile with authenticated user', async () => {
	// Mock session data
	const mockUser = {
		id: 1,
		name: 'John Doe',
		email: 'john@example.com',
		role: 'user',
	};

	const result = await container.renderToString(UserProfile, {
		props: { user: mockUser },
		request: new Request('http://localhost/dashboard', {
			headers: {
				cookie: 'session=mock-session-token',
			},
		}),
	});

	expect(result).toContain('John Doe');
	expect(result).toContain('john@example.com');
});

test('UserProfile renders error state', async () => {
	const result = await container.renderToString(UserProfile, {
		props: { user: null },
	});

	expect(result).toContain('Please log in');
});
```

## Performance Optimizations

Astro 5.0 includes numerous performance improvements and new optimization strategies.

### Code Splitting Strategies

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
	build: {
		split: true, // Enable automatic code splitting
		rollupOptions: {
			output: {
				manualChunks: {
					// Vendor chunks
					'react-vendor': ['react', 'react-dom'],
					'ui-vendor': ['@headlessui/react', 'framer-motion'],

					// Feature-based chunks
					auth: [
						'./src/utils/auth.ts',
						'./src/components/AuthModal.astro',
					],
					dashboard: ['./src/pages/dashboard/index.astro'],
				},
			},
		},
	},
	vite: {
		build: {
			cssCodeSplit: true,
			rollupOptions: {
				output: {
					assetFileNames: (assetInfo) => {
						const extType = assetInfo.name.split('.').pop();
						if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
							return `assets/images/[name]-[hash][extname]`;
						}
						if (/css/i.test(extType)) {
							return `assets/css/[name]-[hash][extname]`;
						}
						return `assets/[name]-[hash][extname]`;
					},
				},
			},
		},
	},
});
```

### Resource Preloading

```typescript
// src/layouts/OptimizedLayout.astro
---
interface Props {
  title: string;
  criticalCSS?: string;
  preloadImages?: string[];
  preloadFonts?: string[];
}

const { title, criticalCSS, preloadImages = [], preloadFonts = [] } = Astro.props;
---

<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>

  <!-- Inline critical CSS -->
  {criticalCSS && (
    <style set:html={criticalCSS} />
  )}

  <!-- Preload critical fonts -->
  {preloadFonts.map(font => (
    <link
      rel="preload"
      as="font"
      href={font}
      type="font/woff2"
      crossorigin
    />
  ))}

  <!-- Preload critical images -->
  {preloadImages.map(src => (
    <link rel="preload" as="image" href={src} />
  ))}

  <!-- DNS prefetch for external domains -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="dns-prefetch" href="//api.example.com">
</head>
<body>
  <slot />

  <!-- Load non-critical CSS asynchronously -->
  <script>
    // Load non-critical stylesheets
    const loadCSS = (href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    // Load after page is loaded
    window.addEventListener('load', () => {
      loadCSS('/assets/non-critical.css');
    });
  </script>
</body>
</html>
```

This comprehensive guide covers all major features in Astro 5.0, providing practical examples for building modern, performant web applications with the latest content management capabilities, server rendering features, and developer experience improvements.
