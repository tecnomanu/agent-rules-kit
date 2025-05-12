---
description: Core architectural concepts for Next.js applications
globs: '<root>/app/**/*.{ts,tsx},<root>/src/**/*.{ts,tsx},<root>/pages/api/**/*.ts,<root>/tests/**/*.{ts,tsx}'
alwaysApply: false
---

# Next.js Architecture Concepts

This document outlines the core architectural concepts and patterns used in Next.js applications in {projectPath}.

## Rendering Paradigms

Next.js supports multiple rendering approaches:

### Server-Side Rendering (SSR)

-   Pages rendered on the server for each request
-   Better SEO and initial load performance
-   Implemented with `getServerSideProps()`
-   Ideal for pages with frequently changing data or user-specific content

```jsx
// SSR Example
export async function getServerSideProps(context) {
	const { req, res, query } = context;
	const data = await fetchData(query.id);

	return {
		props: { data },
	};
}
```

### Static Site Generation (SSG)

-   Pages generated at build time
-   Fastest performance and optimal caching
-   Implemented with `getStaticProps()` and optionally `getStaticPaths()`
-   Ideal for content that doesn't change frequently

```jsx
// SSG Example
export async function getStaticProps() {
	const posts = await fetchPosts();

	return {
		props: { posts },
		// Re-generate at most once per hour
		revalidate: 3600,
	};
}

export async function getStaticPaths() {
	const posts = await fetchPosts();
	const paths = posts.map((post) => ({
		params: { slug: post.slug },
	}));

	return {
		paths,
		fallback: 'blocking', // or true or false
	};
}
```

### Incremental Static Regeneration (ISR)

-   Static generation with time-based revalidation
-   Combines benefits of SSG and SSR
-   Uses `revalidate` property in `getStaticProps()`
-   Ideal for content that changes occasionally

### Client-Side Rendering (CSR)

-   Components render on client after JavaScript loads
-   Used for highly interactive parts of the application
-   Combined with other rendering methods for optimal UX
-   Implemented with SWR or React Query for data fetching

```jsx
// CSR Example with SWR
import useSWR from 'swr';

function Profile() {
	const { data, error } = useSWR('/api/user', fetcher);

	if (error) return <div>Failed to load</div>;
	if (!data) return <div>Loading...</div>;

	return <div>Hello {data.name}!</div>;
}
```

## App Router vs Pages Router

Next.js offers two routing systems:

### App Router Architecture (Next.js 13+)

-   File-system based routing in the `app/` directory
-   Support for React Server Components
-   Nested layouts and parallel routes
-   Server-centric data fetching
-   Streaming and partial rendering

```
app/
├── layout.tsx             # Root layout (applied to all routes)
├── page.tsx               # Homepage
├── blog/
│   ├── layout.tsx         # Blog layout
│   ├── page.tsx           # Blog index
│   └── [slug]/
│       └── page.tsx       # Blog post page
└── dashboard/
    ├── layout.tsx         # Dashboard layout
    └── page.tsx           # Dashboard page
```

### Pages Router Architecture (Traditional)

-   File-system based routing in the `pages/` directory
-   API routes in `pages/api/`
-   Higher-level routing components like `Link` and `router`

```
pages/
├── index.js               # Homepage
├── _app.js                # Custom App component
├── _document.js           # Custom Document
├── blog/
│   ├── index.js           # Blog index
│   └── [slug].js          # Blog post page
└── api/                   # API Routes
    └── hello.js
```

## Server Components vs Client Components

### Server Components

-   Render on the server
-   Reduce client-side JavaScript
-   Direct database/filesystem access
-   Marked by default in App Router

```jsx
// Server Component
import { db } from '@/lib/db';

export default async function Posts() {
	const posts = await db.posts.findMany();

	return (
		<ul>
			{posts.map((post) => (
				<li key={post.id}>{post.title}</li>
			))}
		</ul>
	);
}
```

### Client Components

-   Render on the client
-   Support interactivity and React hooks
-   Marked with 'use client' directive
-   Hydrated on the client

```jsx
'use client';

import { useState } from 'react';

export default function Counter() {
	const [count, setCount] = useState(0);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}
```

## Data Fetching Patterns

### App Router Data Fetching

-   Fetch data directly in Server Components
-   Use React Cache for request deduplication
-   Component-level fetching
-   Support for parallel data fetching

```jsx
// Server Component data fetching
async function getData() {
	const res = await fetch('https://api.example.com/data');
	if (!res.ok) throw new Error('Failed to fetch data');
	return res.json();
}

export default async function Page() {
	const data = await getData();
	return <main>{/* Use data */}</main>;
}
```

### Pages Router Data Fetching

-   `getServerSideProps` for SSR
-   `getStaticProps` for SSG
-   SWR/React Query for client-side data fetching

## Project Structure

### Recommended App Router Structure

```
src/
├── app/                    # App Router routes
│   ├── layout.tsx
│   ├── page.tsx
│   └── [route]/
├── components/             # Shared components
│   ├── ui/                 # UI components
│   └── features/           # Feature components
├── lib/                    # Utility functions
│   └── db.ts               # Database client
├── models/                 # Data models
├── services/               # External services
└── styles/                 # Global styles
```

### Recommended Pages Router Structure

```
src/
├── pages/                  # Pages Router routes
│   ├── index.js
│   ├── _app.js
│   └── api/
├── components/             # Shared components
├── hooks/                  # Custom hooks
├── context/                # React context
├── lib/                    # Utility functions
├── services/               # External services
└── styles/                 # Global styles
```

## State Management in Next.js

### Server-Side State

-   Fetch data on the server and pass as props
-   Database queries in Server Components
-   Server Actions for mutations (App Router)

### Client-Side State

-   React state and context for local UI state
-   SWR/React Query for remote state management
-   Redux/Zustand for complex global state

## API and Backend Integration

### API Routes (Pages Router)

```jsx
// pages/api/users.js
export default async function handler(req, res) {
	if (req.method === 'GET') {
		const users = await db.users.findMany();
		res.status(200).json(users);
	} else {
		res.setHeader('Allow', ['GET']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
```

### Route Handlers (App Router)

```jsx
// app/api/users/route.js
import { NextResponse } from 'next/server';

export async function GET() {
	const users = await db.users.findMany();
	return NextResponse.json(users);
}
```

### Server Actions (App Router)

```jsx
'use server';

export async function createUser(formData) {
	const name = formData.get('name');
	const email = formData.get('email');

	await db.users.create({ data: { name, email } });
	return { success: true };
}
```

## Authentication Patterns

### Next.js Authentication Options

-   **NextAuth.js**: Full-featured auth solution
-   **Auth.js**: Evolution of NextAuth.js
-   **Custom Auth**: Roll your own with cookies/JWTs
-   **Auth Providers**: Firebase, Supabase, Clerk, etc.

### Auth Implementation

```jsx
// With Auth.js (NextAuth.js)
// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
	providers: [
		Providers.GitHub({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
		}),
		// More providers...
	],
	database: process.env.DATABASE_URL,
	session: {
		jwt: true,
	},
	// Custom pages, callbacks, etc.
});
```

## Performance Optimizations

1. **Image Optimization**: Use Next.js `Image` component
2. **Font Optimization**: Built-in font optimization
3. **Script Optimization**: Next.js `Script` component
4. **Route Prefetching**: Automatic with `Link` component
5. **Bundle Analysis**: `@next/bundle-analyzer`

## Deployment Models

1. **Vercel**: Optimized deployment for Next.js
2. **Self-hosted**: Node.js server
3. **Static Export**: Export as static site
4. **Container**: Docker deployment
5. **Edge**: Edge runtime for specific features

## Architecture Decision Framework

Consider these factors when making architecture decisions:

1. **Rendering Strategy**: Choose based on content type and update frequency
2. **Routing System**: App Router vs Pages Router based on requirements
3. **State Management**: Choose based on complexity and team familiarity
4. **API Strategy**: API routes, Route Handlers, or external API
5. **Authentication**: Based on security needs and user experience
