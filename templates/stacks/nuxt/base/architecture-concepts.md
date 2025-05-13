---
description: Core architectural concepts for Nuxt applications
globs: '<root>/app.vue,<root>/components/**/*.{vue,ts,js}'
alwaysApply: false
---

# Nuxt Architecture Concepts

This document outlines the core architectural concepts and patterns used in Nuxt.js applications in {projectPath}.

## Nuxt Framework Overview

Nuxt is a meta-framework built on top of Vue.js that provides:

-   Server-side rendering (SSR)
-   Static site generation (SSG)
-   Client-side rendering (CSR)
-   File-based routing
-   Auto-imports
-   Server API routes
-   Optimized build process

## Rendering Modes

Nuxt supports multiple rendering strategies:

### Universal Rendering (Default)

-   **Server-side rendering + hydration**: Pages first render on the server, then hydrate on the client
-   Provides the best SEO and initial load performance
-   Works in most scenarios

### Static Site Generation

-   Pre-renders all pages at build time
-   Creates static HTML files for deployment to CDNs
-   Configured via `nuxt.config.ts`

### Client-Side Rendering

-   For SPA-like behavior
-   Render components exclusively on the client
-   Less optimal for SEO
-   Use with `<ClientOnly>` component or in the Composition API

## Directory Structure

Nuxt follows a conventional directory structure:

```
project/
├── .nuxt/                  # Build directory (auto-generated)
├── assets/                 # Static assets that will be processed
├── components/             # Vue components (auto-imported)
│   ├── ui/                 # UI components
│   └── feature/            # Feature-specific components
├── composables/            # Composable functions (auto-imported)
├── content/                # Markdown/JSON content for Nuxt Content
├── layouts/                # Layout components
├── middleware/             # Route middleware
├── pages/                  # Application pages (file-based routing)
├── plugins/                # Nuxt plugins
├── public/                 # Static assets served as-is
├── server/                 # Server-side logic
│   ├── api/                # API endpoints
│   └── middleware/         # Server middleware
├── stores/                 # Pinia stores
├── app.vue                 # The main application component
├── error.vue               # Error page
├── nuxt.config.ts          # Nuxt configuration
└── package.json            # Project dependencies
```

## Auto-Imports

One of Nuxt's key features is automatic imports:

-   **Components**: All files in `/components` are auto-imported
-   **Composables**: All files in `/composables` are auto-imported
-   **Plugins**: All files in `/plugins` are auto-loaded
-   **Nuxt APIs**: Built-in functions like `useState`, `useRoute`, etc.

## Routing Architecture

Nuxt uses file-based routing in the `/pages` directory, with the file path determining the URL route. This system supports:

-   Static routes
-   Dynamic parameters
-   Nested routes
-   Catch-all routes
-   Route middleware

### Route Middleware

Middleware runs before navigating to a route. They can be:

-   Named middleware (specific to certain routes)
-   Global middleware (applied to all routes)
-   Anonymous middleware (inline in page components)

## State Management

Nuxt provides several approaches to state management:

### Local Component State

For simple state within a component, use standard Vue reactivity and local state.

### Shared State with useState

Nuxt provides `useState` for shared state across components, which works on both server and client.

### Pinia Stores (Recommended for Complex State)

For larger applications, Pinia offers a more structured approach with:

-   State (reactive data)
-   Actions (methods that change state)
-   Getters (computed values based on state)

## Data Fetching

Nuxt provides several ways to fetch data:

### useAsyncData

Fetch data before a component renders, with caching and server-side support.

### useFetch

Simplified API for common fetch scenarios, with automatic key generation.

### Server-Only Data Fetching

For improved security and performance, certain operations can be restricted to server-side code only.

## Server Routes

Define API endpoints in the `server/api` directory with automatic route mapping based on file names and HTTP methods.

## Layouts and Page Structure

Nuxt provides a layered approach to page structure with:

-   Default layouts
-   Custom layouts per page
-   Nested layouts
-   Layout transitions

## Modularity and Organization

For large Nuxt applications, consider organizing by feature instead of technical role to improve maintainability and code cohesion.

## Plugins

Use plugins to add global functionality to the application. Plugins can:

-   Extend the Vue instance
-   Register global components
-   Provide functions to the application
-   Initialize external libraries

## Composables

Create reusable logic with composables to share functionality across components.

## SEO and Meta Tags

Manage SEO with the `useHead` composable to set:

-   Title and meta tags
-   Open Graph and social media tags
-   Link tags
-   Script tags
-   HTML attributes

## Error Handling

Nuxt provides built-in error handling with:

-   Custom error pages
-   Standardized error objects
-   Error handling in data fetching
-   Server-side error logging

## Performance Patterns

Key patterns for Nuxt performance:

1. **Code Splitting**: Automatic route-based code splitting
2. **Lazy Loading**: Import components with `defineAsyncComponent`
3. **Prefetching and Preloading**: Automatic for linked pages
4. **Image Optimization**: Using Nuxt Image module
5. **Caching Strategy**: Use appropriate headers for API responses

## Architecture Decision Framework

Consider these factors when making architecture decisions:

1. **Rendering Strategy**: Choose based on content type and update frequency
2. **State Management**: Use built-in Nuxt state for simple cases, Pinia for complex
3. **API Strategy**: Decide between server routes, server functions or external APIs
4. **SEO Requirements**: Influence rendering choices and meta tag strategy
5. **Performance Goals**: Guide choices for lazy loading, caching, etc.
