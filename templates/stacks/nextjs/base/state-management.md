---
description: State management concepts and approaches in Next.js applications
globs: <root>/src/**/*.{ts,tsx,js,jsx}, <root>/app/**/*.{ts,tsx,js,jsx}, <root>/pages/**/*.{ts,tsx,js,jsx}
alwaysApply: true
---

# State Management in Next.js Applications

This document outlines common conceptual approaches to state management in Next.js applications in {projectPath}. Next.js provides unique considerations for state management due to its server-side rendering capabilities.

## Next.js Specific Considerations

### 1. Server-Side Rendering (SSR) Impact

-   **Hydration**: State must be serializable and match between server and client.
-   **Initial State**: Can be populated from server-side data fetching methods.
-   **Client-Server Sync**: Ensure state consistency during hydration process.

### 2. Data Fetching Integration

-   **getServerSideProps**: Fetch data on each request, good for dynamic content.
-   **getStaticProps**: Fetch data at build time, good for static content.
-   **App Router**: Use Server Components and Client Components appropriately.
-   **API Routes**: Built-in API endpoints for data mutations.

## State Management Approaches

### 1. React Built-in State

-   **useState**: For component-local state that doesn't need to persist.
-   **useReducer**: For complex state logic within components.
-   **useContext**: For sharing state across component tree without prop drilling.
-   **Pros**: No additional dependencies, works seamlessly with SSR.
-   **Cons**: Limited to component scope, no persistence across navigation.

### 2. Zustand

-   **Concept**: Lightweight state management with minimal boilerplate.
-   **Next.js Integration**: Excellent SSR support, works with both App and Pages Router.
-   **Features**: Simple API, TypeScript support, middleware support.
-   **Use When**: You need simple global state without complex requirements.

### 3. Redux Toolkit (RTK)

-   **Concept**: Modern Redux with less boilerplate and better DevTools.
-   **Next.js Integration**: Requires careful setup for SSR, use next-redux-wrapper.
-   **Features**: Powerful DevTools, time-travel debugging, extensive ecosystem.
-   **Use When**: Complex state logic, need for debugging tools, large team.

### 4. Jotai

-   **Concept**: Atomic state management with bottom-up approach.
-   **Next.js Integration**: Good SSR support, works well with React Suspense.
-   **Features**: Fine-grained reactivity, composable atoms.
-   **Use When**: You prefer atomic state management over global stores.

### 5. Valtio

-   **Concept**: Proxy-based state management with mutation-based API.
-   **Next.js Integration**: Works well with SSR when used correctly.
-   **Features**: Mutable API, automatic optimization.
-   **Use When**: You prefer mutable state updates over immutable patterns.

## Server State Management

### 1. SWR

-   **Concept**: Data fetching library with caching, revalidation, and error handling.
-   **Next.js Integration**: Excellent integration, built by Vercel team.
-   **Features**: Automatic revalidation, optimistic updates, offline support.
-   **Use When**: You need robust data fetching with caching.

### 2. React Query (TanStack Query)

-   **Concept**: Powerful data fetching and caching library.
-   **Next.js Integration**: Requires hydration setup for SSR.
-   **Features**: Advanced caching strategies, background refetching, optimistic updates.
-   **Use When**: Complex data fetching requirements, need advanced caching.

### 3. Apollo Client

-   **Concept**: GraphQL client with integrated state management.
-   **Next.js Integration**: Good SSR support with proper setup.
-   **Features**: GraphQL integration, normalized caching, real-time subscriptions.
-   **Use When**: Using GraphQL, need normalized caching.

## Best Practices

### SSR Considerations

-   **Serializable State**: Ensure all state can be serialized for SSR.
-   **Hydration Mismatch**: Avoid state that differs between server and client.
-   **Initial State**: Use data fetching methods to populate initial state.

### App Router vs Pages Router

-   **App Router**: Prefer Server Components for data fetching, use Client Components for interactivity.
-   **Pages Router**: Use getServerSideProps/getStaticProps for initial data.
-   **State Persistence**: Consider different approaches for each router type.

### Performance Optimization

-   **Code Splitting**: Split state management code when possible.
-   **Selective Updates**: Use fine-grained state updates to minimize re-renders.
-   **Memoization**: Use React.memo, useMemo, and useCallback appropriately.

## Recommendations

### For Simple Applications

-   Use **React built-in state** (useState, useContext)
-   Use **SWR** for server state management
-   Keep state close to where it's used

### For Medium Applications

-   Use **Zustand** for client state management
-   Use **SWR** or **React Query** for server state
-   Implement proper error boundaries

### For Complex Applications

-   Use **Redux Toolkit** for complex client state
-   Use **React Query** for advanced server state management
-   Implement proper state persistence strategies
-   Consider state machines for complex workflows

### For Real-time Applications

-   Use **Apollo Client** with GraphQL subscriptions
-   Consider **Zustand** with WebSocket integration
-   Implement optimistic updates for better UX

Remember that the choice of state management should align with your application's complexity, team expertise, and performance requirements.
