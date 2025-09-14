---
description: State management concepts and approaches in Laravel applications
globs: <root>/resources/**/*.{js,ts,vue,blade.php}, <root>/app/**/*.php
alwaysApply: true
---

# State Management in Laravel Applications

This document outlines common conceptual approaches to state management in Laravel applications in {projectPath}. Laravel applications can use various state management strategies depending on the frontend architecture chosen.

## Server-Side State Management

### 1. Session Management
- **Concept**: Store user state on the server using Laravel's session system.
- **Use Cases**: User authentication, shopping carts, form data persistence.
- **Storage Options**: File, database, Redis, Memcached.
- **Pros**: Secure, works without JavaScript, simple to implement.
- **Cons**: Server memory usage, not suitable for API-only applications.

### 2. Database State
- **Concept**: Store application state directly in the database.
- **Use Cases**: User preferences, application settings, persistent data.
- **Implementation**: Eloquent models, database migrations, seeders.
- **Pros**: Persistent, queryable, relational.
- **Cons**: Database overhead, not suitable for temporary state.

### 3. Cache-Based State
- **Concept**: Use Laravel's cache system for temporary state storage.
- **Use Cases**: Computed values, API responses, temporary data.
- **Storage Options**: Redis, Memcached, file, database.
- **Pros**: Fast access, automatic expiration, distributed.
- **Cons**: May be volatile, requires cache strategy.

### 4. Queue State Management
- **Concept**: Manage state through job queues and background processing.
- **Use Cases**: Long-running processes, asynchronous state updates.
- **Implementation**: Laravel jobs, queues, event listeners.
- **Pros**: Non-blocking, scalable, reliable.
- **Cons**: Eventual consistency, complexity.

## Client-Side State Management

### 1. Traditional Form-Based State
- **Concept**: Use HTML forms and server-side processing for state changes.
- **Implementation**: Blade templates, form requests, validation.
- **State Flow**: Client form → Server processing → Database → Response.
- **Pros**: Simple, works without JavaScript, SEO-friendly.
- **Cons**: Page reloads, limited interactivity.

### 2. AJAX-Based State
- **Concept**: Use JavaScript and AJAX for dynamic state updates.
- **Implementation**: jQuery, Axios, Fetch API with Laravel routes.
- **State Flow**: Client JavaScript → API endpoint → Database → JSON response.
- **Pros**: Better UX, no page reloads, partial updates.
- **Cons**: Requires JavaScript, more complex error handling.

### 3. SPA State Management
- **Concept**: Single Page Application with client-side routing and state.
- **Frontend Options**: Vue.js, React, Angular with Laravel API.
- **State Libraries**: Vuex/Pinia, Redux, Zustand.
- **Pros**: Rich interactivity, offline capabilities, modern UX.
- **Cons**: SEO challenges, complexity, requires build process.

## Laravel + Frontend Framework Integration

### 1. Laravel + Vue.js
- **State Management**: Vuex (Vue 2) or Pinia (Vue 3).
- **API Integration**: Laravel API routes with Vue HTTP client.
- **Authentication**: Laravel Sanctum for SPA authentication.
- **Real-time**: Laravel WebSockets or Pusher with Vue.

```php
// Laravel API Controller
class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::all());
    }
}
```

### 2. Laravel + React
- **State Management**: Redux Toolkit, Zustand, or React Query.
- **API Integration**: Laravel API with React HTTP client.
- **Authentication**: Laravel Sanctum or Passport.
- **Server-Side Rendering**: Laravel + Inertia.js for SSR.

### 3. Laravel + Alpine.js
- **State Management**: Alpine.js reactive data and stores.
- **Integration**: Blade templates with Alpine.js directives.
- **API Calls**: Alpine.js with Laravel routes.
- **Pros**: Lightweight, easy integration, progressive enhancement.

### 4. Laravel + Inertia.js
- **Concept**: Build SPAs using server-side routing and controllers.
- **State Management**: Server-side props with client-side reactivity.
- **Frontend**: Vue.js, React, or Svelte with Inertia adapter.
- **Pros**: SPA experience with server-side simplicity.

## State Synchronization Patterns

### 1. Real-time State Updates
- **Laravel WebSockets**: Real-time communication with WebSocket server.
- **Pusher Integration**: Cloud-based real-time messaging.
- **Server-Sent Events**: One-way real-time updates from server.
- **Use Cases**: Live chat, notifications, collaborative editing.

### 2. Optimistic Updates
- **Concept**: Update UI immediately, sync with server afterward.
- **Implementation**: Client-side state updates with API calls.
- **Error Handling**: Rollback on server error.
- **Use Cases**: Like buttons, form submissions, instant feedback.

### 3. Offline State Management
- **Service Workers**: Cache API responses for offline use.
- **Local Storage**: Store state locally for offline access.
- **Sync Strategies**: Background sync when connection restored.
- **Use Cases**: Progressive Web Apps, mobile applications.

## Authentication State

### 1. Session-Based Authentication
- **Implementation**: Laravel's built-in session authentication.
- **State Storage**: Server-side session storage.
- **Frontend Access**: CSRF tokens, authenticated user data.
- **Use Cases**: Traditional web applications.

### 2. Token-Based Authentication
- **Laravel Sanctum**: SPA authentication with tokens.
- **Laravel Passport**: OAuth2 server implementation.
- **JWT**: JSON Web Tokens for stateless authentication.
- **Use Cases**: API-driven applications, mobile apps.

### 3. Social Authentication
- **Laravel Socialite**: OAuth integration with social providers.
- **State Management**: User profile data, social connections.
- **Implementation**: OAuth flows with state persistence.

## Best Practices

### Server-Side State
- **Validation**: Always validate state changes on the server.
- **Authorization**: Check permissions before state modifications.
- **Transactions**: Use database transactions for atomic updates.
- **Caching**: Cache frequently accessed state data.

### Client-Side State
- **Synchronization**: Keep client state in sync with server.
- **Validation**: Validate on both client and server sides.
- **Error Handling**: Handle network errors gracefully.
- **Performance**: Minimize state updates and re-renders.

### Security Considerations
- **CSRF Protection**: Use Laravel's CSRF protection for state changes.
- **Input Sanitization**: Sanitize all user inputs.
- **Rate Limiting**: Implement rate limiting for state-changing operations.
- **Audit Logging**: Log important state changes for security.

## Recommendations

### For Traditional Laravel Applications
- Use **session-based state** for user data
- Use **database state** for persistent application data
- Use **cache** for computed or temporary data
- Implement **CSRF protection** for all state changes

### For Laravel + SPA Applications
- Use **Laravel Sanctum** for authentication
- Use **appropriate frontend state library** (Pinia, Redux, etc.)
- Implement **optimistic updates** for better UX
- Use **Laravel Echo** for real-time updates

### For Laravel API Applications
- Use **token-based authentication**
- Implement **stateless design** principles
- Use **database state** for persistence
- Consider **event sourcing** for complex state management

### For High-Performance Applications
- Use **Redis** for session and cache storage
- Implement **queue-based state updates**
- Use **database read replicas** for state queries
- Consider **CQRS pattern** for complex state management

Remember that state management strategy should align with your application's architecture, scalability requirements, and team expertise.
