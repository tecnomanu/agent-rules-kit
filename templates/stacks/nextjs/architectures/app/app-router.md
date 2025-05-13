---
description: App Router architecture guidelines for Next.js 13+
globs: <root>/app/**/*.{ts,tsx}
alwaysApply: false
---

# Next.js App Router Guidelines

This project uses Next.js App Router (introduced in Next.js 13). Follow these conventions for consistency.

## Directory Structure

```
app/
├── api/                # API routes (Server Components/Route Handlers)
├── (auth)/             # Auth group (route groups with parentheses don't affect URL paths)
│   ├── login/          # /login route
│   └── register/       # /register route
├── dashboard/          # /dashboard route
│   ├── page.tsx        # Main dashboard page component
│   ├── layout.tsx      # Dashboard layout wrapper
│   ├── loading.tsx     # Loading UI
│   └── error.tsx       # Error UI
├── blog/
│   ├── [slug]/         # Dynamic route segment
│   │   └── page.tsx    # Blog post page
│   └── page.tsx        # Blog index page
├── page.tsx            # Home page (/)
├── layout.tsx          # Root layout
└── not-found.tsx       # Custom 404 page
```

## File Conventions

-   **page.tsx**: The UI for a route segment
-   **layout.tsx**: Shared UI for a segment and its children
-   **loading.tsx**: Loading UI for a segment
-   **error.tsx**: Error UI for a segment
-   **not-found.tsx**: UI for 404 errors
-   **route.ts/js**: API endpoint for a route segment

## Server and Client Components

By default, all components in the App directory are React Server Components. Use the "use client" directive to opt into client-side rendering:

```tsx
// A server component (default)
export default function ServerComponent() {
	// Can use async/await and server-only data fetching
	// CANNOT use hooks or browser APIs
	return <div>Server-rendered content</div>;
}

// A client component
('use client');

import { useState } from 'react';

export default function ClientComponent() {
	// Can use hooks and browser APIs
	// CANNOT use async/await directly in component
	const [count, setCount] = useState(0);

	return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

## Data Fetching

Use the built-in data fetching methods in Server Components:

```tsx
async function getData() {
	const res = await fetch('https://api.example.com/data');

	if (!res.ok) {
		throw new Error('Failed to fetch data');
	}

	return res.json();
}

export default async function Page() {
	const data = await getData();

	return <main>{/* Use data */}</main>;
}
```

## Route Handlers

Route handlers (API routes) should be in `app/api` or alongside your pages:

```tsx
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
	const users = await fetchUsers();
	return NextResponse.json(users);
}

export async function POST(request: Request) {
	const data = await request.json();
	const newUser = await createUser(data);
	return NextResponse.json(newUser, { status: 201 });
}
```

## Best Practices

1. **Co-locate related files**: Keep page, layout, loading, and error handling files together
2. **Use route groups**: Organize routes with similar features using route groups (parentheses)
3. **Parallel routes**: For complex layouts with independent loading states, use parallel routes (@folder)
4. **Interception routes**: Intercept routes for modals using (.) or (..) in folder names
5. **Prefer Server Components**: Default to using Server Components unless you need client-side interactivity
6. **Create small, focused client components**: Move client-only logic into small, focused components
7. **Use streaming**: When appropriate, stream in UI with loading.tsx and Suspense boundaries

## Metadata

Set metadata in page or layout files:

```tsx
export const metadata = {
	title: 'Page Title',
	description: 'Page description',
};

export default function Page() {
	// ...
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
			<Link href='/dashboard'>Dashboard</Link>
		</nav>
	);
}
```
