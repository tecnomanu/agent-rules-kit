# Next.js 14: Understanding Server Components

## Overview

Next.js 14 continues to build on the React Server Components (RSC) architecture introduced with the App Router.
Server Components allow rendering UI on the server, reducing client-side JavaScript and improving performance.
They can fetch data directly and run server-side code, simplifying data fetching and access to backend resources.

## Key Concepts & Best Practices

-   **Default Server Components:** Components inside the `app` directory are Server Components by default. This helps in sending minimal JavaScript to the client.
-   **Client Components:** Use the `'use client'` directive at the top of a file to define a Client Component. These are necessary for interactivity, event listeners, and using browser-only APIs or React Hooks like `useState`, `useEffect`.
-   **Data Fetching:** Fetch data directly within Server Components using `async/await`. This is often done in page components or specific data-fetching components.
-   **Keep Client Components Small:** Delegate interactive parts of your UI to Client Components, but keep them as small and focused as possible to minimize their JavaScript footprint.
-   **Interleaving Server and Client Components:** Server Components can import and render Client Components. Client Components can render Server Components passed as props (e.g., `children`).
-   **Avoid Server-Only Code in Client Components:** Do not import server-side utilities (like database clients or file system modules) directly into Client Components. Pass data from Server Components as props.
-   **Streaming with Suspense:** Use React Suspense to stream UI from the server, improving perceived performance for pages with dynamic content.

## Server Component Example (Data Fetching)

```javascript
// File: app/posts/page.js (Server Component by default)
async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1>Blog Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Client Component Example (Interactivity)

```javascript
// File: app/components/InteractiveButton.js
'use client'; // Directive to mark as a Client Component

import { useState } from 'react';

export default function InteractiveButton({ children }) {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {children} (Clicked {count} times)
    </button>
  );
}
```

## Using Suspense for Streaming

```javascript
// File: app/dashboard/page.js
import { Suspense } from 'react';
import UserProfile from '../components/UserProfile'; // Assume UserProfile fetches user data
import UserPosts from '../components/UserPosts';   // Assume UserPosts fetches post data

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading profile...</p>}>
        <UserProfile />
      </Suspense>
      <Suspense fallback={<p>Loading posts...</p>}>
        <UserPosts />
      </Suspense>
    </div>
  );
}
```
