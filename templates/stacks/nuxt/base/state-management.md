---
description: State management concepts and approaches in Nuxt applications
globs: <root>/**/*.{vue,ts,js}
alwaysApply: true
---

# State Management in Nuxt Applications

This document outlines common conceptual approaches to state management in Nuxt applications in {projectPath}. Nuxt provides unique considerations for state management due to its universal rendering capabilities and server-side features.

## Nuxt-Specific State Considerations

### 1. Universal Rendering
- **SSR/SSG**: State must be serializable and transferable between server and client.
- **Hydration**: Ensure state consistency during client-side hydration.
- **Initial State**: Server can populate initial state before sending to client.
- **Performance**: Consider state size impact on initial page load.

### 2. Auto-imports and Composables
- **Built-in Composables**: Nuxt provides many built-in state management composables.
- **Auto-imports**: State management utilities are automatically imported.
- **Server-Safe**: Composables work safely in both server and client contexts.

## Built-in State Management

### 1. useState Composable
- **Concept**: Nuxt's built-in reactive state that works across SSR/client.
- **Features**: Automatic serialization, hydration-safe, shared across components.
- **Use Cases**: Simple shared state, user preferences, UI state.

```typescript
// Shared state across components
const user = useState('user', () => ({ name: '', email: '' }))

// With default factory function
const counter = useState('counter', () => 0)
```

### 2. Reactive State with ref/reactive
- **Concept**: Vue's built-in reactivity system.
- **Use Cases**: Component-local state, computed values, watchers.
- **SSR Considerations**: Works well with Nuxt's auto-imports.

### 3. Pinia (Recommended)
- **Concept**: Official Vue state management library, successor to Vuex.
- **Nuxt Integration**: Excellent integration with `@pinia/nuxt` module.
- **Features**: TypeScript support, devtools, SSR compatibility.
- **Use Cases**: Complex state logic, large applications, team development.

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isLoggedIn = computed(() => !!user.value)
  
  const login = async (credentials) => {
    // Login logic
  }
  
  return { user, isLoggedIn, login }
})
```

### 4. Vuex (Legacy)
- **Status**: Still supported but Pinia is recommended for new projects.
- **Migration**: Nuxt provides migration path from Vuex to Pinia.
- **Use When**: Maintaining existing Vuex-based applications.

## Server-Side State Management

### 1. Server API and Nitro
- **Concept**: Use Nuxt's server API for server-side state operations.
- **Features**: File-based routing, middleware, database integration.
- **Use Cases**: Authentication, data fetching, server-side computations.

```typescript
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  // Server-side state operations
  return await getUsersFromDatabase()
})
```

### 2. Runtime Config
- **Concept**: Configuration that can be updated at runtime.
- **Use Cases**: API endpoints, feature flags, environment-specific settings.
- **Access**: Available in both server and client contexts.

### 3. Server Storage
- **Concept**: Persistent storage on the server side.
- **Options**: File system, databases, external services.
- **Use Cases**: Session data, caching, server-side state persistence.

## Client-Side State Management

### 1. Data Fetching Composables
- **useFetch**: Nuxt's built-in data fetching with caching and SSR support.
- **useLazyFetch**: Lazy version that doesn't block navigation.
- **$fetch**: Direct fetch utility for manual data fetching.
- **refresh**: Refresh cached data when needed.

```typescript
// Automatic caching and SSR support
const { data: users, refresh } = await useFetch('/api/users')

// Lazy loading
const { data: posts } = await useLazyFetch('/api/posts')
```

### 2. Reactive State Patterns
- **Global Composables**: Create reusable state composables.
- **Provide/Inject**: Share state down the component tree.
- **Event Bus**: Simple event-based state communication.

### 3. Local Storage Integration
- **Persistence**: Persist state to local storage for offline use.
- **Hydration**: Handle hydration mismatches with local storage.
- **Libraries**: Use libraries like `@vueuse/core` for local storage utilities.

## Advanced State Management Patterns

### 1. Composable-Based Architecture
- **Pattern**: Create composables for specific state domains.
- **Benefits**: Reusable, testable, type-safe.
- **Organization**: Group related state and actions together.

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const user = useState('auth.user', () => null)
  const isLoggedIn = computed(() => !!user.value)
  
  const login = async (credentials) => {
    const { data } = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    user.value = data.user
  }
  
  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }
  
  return {
    user: readonly(user),
    isLoggedIn,
    login,
    logout
  }
}
```

### 2. State Machines
- **Libraries**: XState, @vueuse/core state machines.
- **Use Cases**: Complex workflows, form validation, multi-step processes.
- **Benefits**: Predictable state transitions, visual modeling.

### 3. Event-Driven State
- **Pattern**: Use events to coordinate state changes across components.
- **Implementation**: Custom event bus or libraries like mitt.
- **Use Cases**: Loosely coupled components, cross-component communication.

## Authentication State

### 1. Session-Based Authentication
- **Server Sessions**: Use Nuxt server API for session management.
- **Cookies**: Secure HTTP-only cookies for session tokens.
- **Middleware**: Route middleware for authentication checks.

### 2. JWT Authentication
- **Token Storage**: Store tokens securely (HTTP-only cookies recommended).
- **Refresh Logic**: Implement token refresh mechanisms.
- **Route Protection**: Protect routes with authentication middleware.

### 3. OAuth Integration
- **Providers**: GitHub, Google, Auth0, etc.
- **Libraries**: Use `@sidebase/nuxt-auth` or similar for OAuth flows.
- **State Management**: Handle OAuth state and user profiles.

## Performance Optimization

### 1. State Splitting
- **Domain Separation**: Split state by feature or domain.
- **Lazy Loading**: Load state modules only when needed.
- **Code Splitting**: Split state management code with dynamic imports.

### 2. Caching Strategies
- **useFetch Caching**: Leverage built-in caching for API calls.
- **State Persistence**: Cache computed values to avoid recalculation.
- **Server-Side Caching**: Use server-side caching for expensive operations.

### 3. Hydration Optimization
- **Selective Hydration**: Only hydrate necessary state.
- **Lazy Hydration**: Defer hydration of non-critical state.
- **State Normalization**: Normalize state shape for better performance.

## Best Practices

### Development Patterns
- **Type Safety**: Use TypeScript for better state management.
- **Composable Organization**: Group related state in composables.
- **Testing**: Write tests for state logic separately from components.
- **Documentation**: Document state shape and update patterns.

### SSR Considerations
- **Serialization**: Ensure all state is serializable for SSR.
- **Hydration Safety**: Avoid hydration mismatches.
- **Server Context**: Use server-only state when appropriate.
- **Performance**: Consider state size impact on initial load.

### Security
- **Sensitive Data**: Never store sensitive data in client state.
- **Validation**: Validate state changes on both client and server.
- **Sanitization**: Sanitize user inputs before storing in state.
- **Authentication**: Implement proper authentication state management.

## Recommendations

### For Small Applications
- Use **useState** for simple shared state
- Use **useFetch** for data fetching and caching
- Keep state close to where it's used
- Use **composables** for reusable state logic

### For Medium Applications
- Use **Pinia** for complex state management
- Implement **authentication state** with proper security
- Use **middleware** for route-based state logic
- Organize state with **domain-driven** approach

### For Large Applications
- Use **Pinia** with modular store organization
- Implement **state persistence** strategies
- Use **TypeScript** for better developer experience
- Consider **state machines** for complex workflows
- Implement **comprehensive testing** for state logic

### For Real-time Applications
- Use **WebSocket** integration with state management
- Implement **optimistic updates** for better UX
- Use **event-driven** state patterns
- Consider **conflict resolution** strategies

Remember that Nuxt's universal rendering capabilities provide unique opportunities for state management, allowing you to leverage both server-side and client-side state effectively.
