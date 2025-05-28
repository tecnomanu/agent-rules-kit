---
description: Naming conventions for Next.js applications and project structure.
globs: <root>/{app,src,pages,components}/**/*.{ts,tsx,js,jsx},<root>/next.config.{js,ts}
alwaysApply: true
---

# Next.js Naming Conventions

Consistent naming is crucial for maintainability and readability in Next.js projects developed in {projectPath}. This guide covers common conventions for files, folders, components, and variables.

## File and Folder Naming (Routing)

Next.js uses a file-system based router. The naming of files and folders within specific directories (`app` or `pages`) directly impacts the application's routes.

### App Router Specific (`app` directory)

-   **Route Segments**: Folders define route segments. Use `lowercase` and `kebab-case` for folder names.
    -   Example: `app/user-profile/settings/` maps to `/user-profile/settings`.
-   **Dynamic Segments**: Enclose folder names in square brackets: `[segmentName]`.
    -   Example: `app/blog/[slug]/` maps to `/blog/:slug`.
    -   Catch-all: `app/shop/[...categories]/` maps to `/shop/*`.
    -   Optional catch-all: `app/feed/[[...tags]]/` maps to `/feed/*` or `/feed`.
-   **Route Groups**: Enclose folder names in parentheses: `(groupName)` to organize routes without affecting the URL path.
    -   Example: `app/(marketing)/about/page.tsx` still maps to `/about`.
-   **Parallel Routes & Intercepted Routes**: Use special prefixes `@slotName` and `(.)`, `(..)`, `(...)` respectively.
-   **Special Files**:
    -   `page.tsx` / `page.jsx` / `page.js`: Defines the UI for a route segment.
    -   `layout.tsx` / `layout.jsx` / `layout.js`: Defines a shared UI layout for a segment and its children.
    -   `template.tsx` / `template.jsx` / `template.js`: Similar to `layout.tsx`, but re-mounts on navigation.
    -   `loading.tsx` / `loading.jsx` / `loading.js`: Defines loading UI for a segment using Suspense.
    -   `error.tsx` / `error.jsx` / `error.js`: Defines error UI for a segment.
    -   `not-found.tsx` / `not-found.jsx` / `not-found.js`: Defines UI for when `notFound()` is thrown.
    -   `route.ts` / `route.js`: Defines API endpoints (Route Handlers).

### Pages Router Specific (`pages` directory)

-   **Route Files**: Files directly map to routes. Use `lowercase` or `kebab-case`.
    -   Example: `pages/about-us.tsx` maps to `/about-us`.
    -   `pages/index.tsx` maps to `/`.
-   **Dynamic Segments**: Enclose filenames or folder names in square brackets: `[paramName].tsx`.
    -   Example: `pages/post/[pid].tsx` maps to `/post/:pid`.
    -   Catch-all: `pages/docs/[...slug].tsx` maps to `/docs/*`.
-   **Special Files**:
    -   `_app.tsx` / `_app.jsx` / `_app.js`: Custom App component to initialize pages.
    -   `_document.tsx` / `_document.jsx` / `_document.js`: Custom Document to augment `<html>` and `<body>` tags.
    -   `_error.tsx` / `_error.jsx` / `_error.js`: Custom error page.
    -   Files inside `pages/api/`: Define API routes. Example: `pages/api/user.ts` maps to `/api/user`.

## Component Naming

-   **Convention**: `PascalCase` for component filenames and component names.
-   **Filename**: `MyComponent.tsx` or `MyComponent.jsx`.
-   **Example**:
    ```tsx
    // Good: components/UserProfile.tsx
    export default function UserProfile({ user }) { /* ... */ }

    // Good: components/shared/Button.tsx
    export const Button = ({ children }) => { /* ... */ };
    ```

## Hook Naming

-   **Convention**: `camelCase` with a `use` prefix.
-   **Filename**: `useAnalytics.ts` or `useUserData.js`.
-   **Example**:
    ```tsx
    // Good: hooks/useAuth.ts
    export function useAuth() { /* ... */ }

    // Good: lib/useTimeFormatter.js
    export const useTimeFormatter = () => { /* ... */ };
    ```

## API Routes / Route Handlers

-   **App Router**: Files are named `route.ts` or `route.js` within the `app/api/...` directory structure.
    -   Example: `app/api/users/[userId]/route.ts`
-   **Pages Router**: Files are named according to the route within `pages/api/`.
    -   Example: `pages/api/auth/login.ts`

## Environment Variables

-   **Client-side (browser-exposed)**: Must be prefixed with `NEXT_PUBLIC_`.
    -   Example: `NEXT_PUBLIC_ANALYTICS_ID=123`
-   **Server-side only**: No specific prefix required, but avoid `NEXT_PUBLIC_`.
    -   Example: `DATABASE_URL="postgresql://..."`
    -   Accessed via `process.env.VARIABLE_NAME`.

## Utility Functions and Modules

-   **Convention**: `camelCase` for filenames and exported functions/variables.
-   **Filename**: `utils/stringFormatter.ts`, `lib/apiClient.js`.
-   **Example**:
    ```ts
    // utils/dateHelpers.ts
    export function formatDate(date) { /* ... */ }
    export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
    ```

## Other Common Conventions

-   **Configuration Files**:
    -   `next.config.js` or `next.config.mjs` or `next.config.ts` (if using TypeScript for config)
    -   `tailwind.config.js`, `postcss.config.js`, `babel.config.js`, `tsconfig.json`, `.eslintrc.json`
-   **Folders for non-route code**:
    -   `components/`: For UI components.
    -   `lib/`: For utility functions, API helpers, shared logic.
    -   `hooks/`: For custom React Hooks.
    -   `styles/` or `assets/`: For global styles, images, fonts (though co-location is also common).
    -   `public/`: For static assets accessible directly via URL.
    -   `src/`: Optional directory to separate application code from project root configuration files. If used, `app`, `pages`, `components`, etc., go inside `src`.

Adhering to these conventions will make your Next.js project in {projectPath} more organized and easier for team members to navigate and understand.
```
