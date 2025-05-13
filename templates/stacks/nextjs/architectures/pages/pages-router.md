---
description: Pages Router architecture guidelines for Next.js
globs: <root>/pages/**/*.{ts,tsx}
alwaysApply: false
---

# Next.js Pages Router Guidelines

This project uses Next.js Pages Router (traditional routing). Follow these conventions for consistency.

## Directory Structure

```
pages/
├── _app.tsx            # Custom App component
├── _document.tsx       # Custom Document component
├── index.tsx           # Home page (/)
├── about.tsx           # About page (/about)
├── api/                # API routes
│   ├── auth/
│   │   └── [...nextauth].ts  # NextAuth.js API routes
│   └── users.ts        # Users API endpoint
├── blog/
│   ├── [slug].tsx      # Dynamic blog post page
│   └── index.tsx       # Blog listing page
└── dashboard/
    ├── index.tsx       # Dashboard main page
    └── settings.tsx    # Dashboard settings page
```

## File Naming Conventions

-   **\_app.tsx**: Customize the App component for global layouts and styles
-   **\_document.tsx**: Customize the Document component to modify HTML structure
-   **index.tsx**: Main component for a route (e.g., `/pages/about/index.tsx` for `/about`)
-   **[param].tsx**: Dynamic route (e.g., `/pages/blog/[slug].tsx` for `/blog/:slug`)
-   **[...catchAll].tsx**: Catch-all routes (e.g., `/pages/docs/[...slug].tsx` for `/docs/*`)
-   **404.tsx**: Custom 404 page
-   **500.tsx**: Custom error page

## Data Fetching

Use built-in data fetching methods for different requirements:

### getStaticProps (Static Generation)

```tsx
export async function getStaticProps() {
	const data = await fetchData();

	return {
		props: { data },
		revalidate: 60, // Optional: revalidate after 60 seconds
	};
}

export default function Page({ data }) {
	return <div>{/* Use data */}</div>;
}
```

### getStaticPaths (Dynamic Routes with Static Generation)

```tsx
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

export async function getStaticProps({ params }) {
	const post = await fetchPost(params.slug);

	return {
		props: { post },
	};
}

export default function Post({ post }) {
	return <div>{/* Use post data */}</div>;
}
```

### getServerSideProps (Server-side Rendering)

```tsx
export async function getServerSideProps(context) {
	const { req, query } = context;
	const data = await fetchData(query.id);

	return {
		props: { data },
	};
}

export default function Page({ data }) {
	return <div>{/* Use data */}</div>;
}
```

## API Routes

Create API endpoints in the `pages/api` directory:

```tsx
// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === 'GET') {
		const users = await fetchUsers();
		return res.status(200).json(users);
	}

	if (req.method === 'POST') {
		const user = await createUser(req.body);
		return res.status(201).json(user);
	}

	// Method not allowed
	return res.status(405).end();
}
```

## Layouts

For consistent layouts across pages, use a layout component with the Component pattern:

```tsx
// components/Layout.tsx
export default function Layout({ children }) {
	return (
		<div>
			<header>Header</header>
			<main>{children}</main>
			<footer>Footer</footer>
		</div>
	);
}

// pages/about.tsx
import Layout from '../components/Layout';

export default function AboutPage() {
	return (
		<Layout>
			<h1>About Us</h1>
			<p>Content here...</p>
		</Layout>
	);
}
```

## Navigation

Use the Link component for client-side navigation:

```tsx
import Link from 'next/link';

export default function Navigation() {
	return (
		<nav>
			<Link href='/'>Home</Link>
			<Link href='/about'>About</Link>
			<Link href='/blog/[slug]' as={`/blog/hello-world`}>
				Hello World Post
			</Link>
		</nav>
	);
}
```

## Image Optimization

Use the Image component for optimized images:

```tsx
import Image from 'next/image';

export default function MyComponent() {
	return (
		<div>
			<Image
				src='/images/profile.jpg'
				alt='Profile Picture'
				width={500}
				height={300}
				layout='responsive'
			/>
		</div>
	);
}
```

## Best Practices

1. **Organize by features**: Group related pages together in subdirectories
2. **Prefer getStaticProps**: Use Static Generation when possible for better performance
3. **Use ISR**: Leverage Incremental Static Regeneration (revalidate) for dynamic content
4. **Custom App**: Use `_app.tsx` for global state, layouts, and styles
5. **Custom Document**: Use `_document.tsx` only for custom HTML structure
6. **API middleware**: Use middleware for authentication and validation in API routes
7. **Dynamic imports**: Use Next.js dynamic imports for code splitting
