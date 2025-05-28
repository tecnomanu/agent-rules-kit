---
description: Guide to API Routes in Next.js 13, covering App Router Route Handlers and Pages Router API Routes.
globs: <root>/app/api/**/route.{js,ts},<root>/pages/api/**/*.{js,ts}
alwaysApply: true
---

# Next.js 13 API Routes Guide

## Overview

API routes in Next.js 13 provide a streamlined way to build backend functionality for your applications. With the introduction of the App Router, Next.js now emphasizes **Route Handlers**, which are functions exported from `route.js` or `route.ts` files within the `app` directory. These handlers allow you to create API endpoints by leveraging native `Request` and `Response` objects, offering more flexibility and aligning closer to web standards.

## Key Guidelines for Route Handlers (App Router)

-   **Utilize Route Handlers in the `app/api/...` directory for new API endpoints.** This is the recommended approach for building APIs in Next.js 13+ with the App Router.
-   **Organize API routes logically within the `app` directory.** For example, an endpoint to fetch a user by ID could be located at `app/api/users/[id]/route.ts`.
-   **Leverage native `Request` and `Response` objects** for handling HTTP requests and responses. This provides a powerful and standardized way to interact with incoming requests and formulate outgoing responses.
-   **Implement proper error handling and consistent JSON responses.** Ensure your API routes gracefully handle errors and return meaningful JSON responses with appropriate status codes.
-   **Secure API routes using appropriate authentication and authorization mechanisms.** Tools like NextAuth.js or custom middleware can be integrated to protect your endpoints.
-   **Consider using Edge Functions for API routes that require low latency or are geographically distributed.** Next.js supports deploying Route Handlers as Edge Functions, which can improve performance for users across different regions.

## Simple GET Example (Route Handler)

This example demonstrates a basic GET request handler that returns a JSON message.

```typescript
// File: app/api/hello/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello, world!' });
}
```

## POST Example with Data Validation (Route Handler)

This example shows how to handle POST requests, including basic data validation and error handling.

```typescript
// File: app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Process data (e.g., save to database)
    console.log('Received data:', body);

    return NextResponse.json({ message: 'Data received successfully', data: body }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    // Check if error is due to invalid JSON
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

## Dynamic Route Example (Route Handler)

This example illustrates how to create dynamic API routes where parts of the URL path are parameters.

```typescript
// File: app/api/items/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const itemId = params.id;

  // Fetch item from a data source based on itemId
  // For example: const item = await getItemById(itemId);
  const itemExists = true; // Replace with actual check

  if (!itemExists) { // Replace with actual check, e.g., !item
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json({ id: itemId, name: `Item ${itemId}` }); // Replace with actual item data
}
```

## Note on Pages Router API Routes

For projects still using or migrating from the Pages Router, API routes are defined as files within the `pages/api` directory. These export a default function that handles requests (e.g., `export default function handler(req, res) { ... }`).

-   **Location**: `pages/api/**/*.ts` (or `.js`)
-   **Handler Signature**: `export default function handler(req: NextApiRequest, res: NextApiResponse) { ... }`
-   **Example (`pages/api/user.ts`)**:
    ```typescript
    import type { NextApiRequest, NextApiResponse } from 'next';

    type UserData = {
      id: number;
      name: string;
    };

    export default function handler(
      req: NextApiRequest,
      res: NextApiResponse<UserData | { error: string }>
    ) {
      if (req.method === 'GET') {
        // Example: Fetch user data
        res.status(200).json({ id: 1, name: 'John Doe' });
      } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
      }
    }
    ```

While Route Handlers in the App Router are the modern approach for Next.js 13+, `pages/api` routes remain functional and are the standard for Pages Router contexts. Understanding both is useful when working with diverse Next.js projects or during migrations.
```
