---
description: State management concepts and approaches in SvelteKit applications
globs: <root>/src/**/*.{svelte,ts,js}
alwaysApply: true
---

# State Management in SvelteKit Applications

This document outlines common conceptual approaches to state management in SvelteKit applications in {projectPath}. SvelteKit provides unique considerations for state management due to its universal rendering capabilities and Svelte's reactive system.

## Svelte's Built-in Reactivity

### 1. Reactive Variables
- **Concept**: Variables that automatically update the UI when changed.
- **Syntax**: Simple assignment triggers reactivity.
- **Use Cases**: Component-local state, form inputs, UI state.
- **Performance**: Compile-time optimizations for minimal runtime overhead.

```svelte
<script>
  let count = 0;
  let name = '';
  
  // Reactive statement
  $: doubled = count * 2;
  $: greeting = `Hello, ${name}!`;
</script>

<button on:click={() => count++}>
  Count: {count} (Doubled: {doubled})
</button>
```

### 2. Reactive Statements
- **Concept**: Code that runs automatically when dependencies change.
- **Syntax**: `$:` prefix for reactive statements.
- **Use Cases**: Derived values, side effects, complex computations.
- **Dependency Tracking**: Automatic dependency detection.

### 3. Stores (Built-in State Management)
- **Concept**: Svelte's built-in state management system.
- **Types**: Writable, readable, derived stores.
- **Reactivity**: Subscribe to changes with `$` prefix.
- **SSR Compatible**: Works seamlessly with server-side rendering.

```javascript
// stores.js
import { writable, derived } from 'svelte/store';

export const count = writable(0);
export const doubled = derived(count, $count => $count * 2);

// In component
import { count } from './stores.js';

// Auto-subscription with $
$: console.log($count);

// Manual subscription
const unsubscribe = count.subscribe(value => {
  console.log(value);
});
```

## SvelteKit-Specific State Management

### 1. Page Data and Load Functions
- **Concept**: Server-side data loading that becomes client-side state.
- **Load Functions**: `load` functions in `+page.js` or `+page.server.js`.
- **Universal**: Data loaded on server, available on client.
- **Reactivity**: Page data is reactive and updates on navigation.

```javascript
// +page.js
export async function load({ fetch, params }) {
  const response = await fetch(`/api/posts/${params.id}`);
  const post = await response.json();
  
  return {
    post
  };
}
```

### 2. Form Actions
- **Concept**: Server-side form handling with progressive enhancement.
- **Actions**: Define form actions in `+page.server.js`.
- **State Updates**: Actions can update page data automatically.
- **Error Handling**: Built-in error and validation handling.

```javascript
// +page.server.js
export const actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const title = data.get('title');
    
    // Server-side logic
    const post = await createPost({ title });
    
    return {
      success: true,
      post
    };
  }
};
```

### 3. App State and Stores
- **Global Stores**: Share state across the entire application.
- **SSR Considerations**: Handle server-side initialization properly.
- **Persistence**: Optionally persist state to localStorage or cookies.

## Advanced State Management Patterns

### 1. Custom Stores
- **Pattern**: Create custom stores with specific business logic.
- **Encapsulation**: Hide implementation details behind store interface.
- **Validation**: Add validation and error handling to stores.
- **Persistence**: Implement automatic persistence mechanisms.

```javascript
// userStore.js
import { writable } from 'svelte/store';

function createUserStore() {
  const { subscribe, set, update } = writable(null);
  
  return {
    subscribe,
    login: async (credentials) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      const user = await response.json();
      set(user);
    },
    logout: () => {
      set(null);
    },
    updateProfile: (updates) => {
      update(user => ({ ...user, ...updates }));
    }
  };
}

export const user = createUserStore();
```

### 2. Store Composition
- **Pattern**: Compose multiple stores to create complex state.
- **Derived Stores**: Create computed values from multiple stores.
- **Store Dependencies**: Manage dependencies between stores.

```javascript
import { writable, derived } from 'svelte/store';

export const todos = writable([]);
export const filter = writable('all');

export const filteredTodos = derived(
  [todos, filter],
  ([$todos, $filter]) => {
    switch ($filter) {
      case 'completed':
        return $todos.filter(todo => todo.completed);
      case 'active':
        return $todos.filter(todo => !todo.completed);
      default:
        return $todos;
    }
  }
);
```

### 3. Context API
- **Pattern**: Share state down the component tree without prop drilling.
- **Context**: Use `setContext` and `getContext` for dependency injection.
- **Stores in Context**: Combine context with stores for powerful patterns.

```svelte
<!-- Parent.svelte -->
<script>
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  
  const theme = writable('light');
  setContext('theme', theme);
</script>

<!-- Child.svelte -->
<script>
  import { getContext } from 'svelte';
  
  const theme = getContext('theme');
</script>

<div class="theme-{$theme}">
  Content
</div>
```

## Server-Side State Management

### 1. Server-Only State
- **Concept**: State that exists only on the server side.
- **Use Cases**: Database connections, authentication, server configuration.
- **Implementation**: Use `+page.server.js` and `+layout.server.js`.

### 2. Session Management
- **Cookies**: Use cookies for session state.
- **Server State**: Store session data on the server.
- **Security**: Implement proper session security measures.

### 3. Database Integration
- **ORM Integration**: Use ORMs like Prisma, Drizzle, or Sequelize.
- **Direct Database**: Direct database connections in server code.
- **Connection Pooling**: Implement proper connection management.

## Client-Side State Persistence

### 1. localStorage Integration
- **Pattern**: Persist store state to localStorage.
- **Hydration**: Handle SSR hydration properly.
- **Sync**: Keep store and localStorage in sync.

```javascript
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const defaultValue = { theme: 'light', lang: 'en' };
const initialValue = browser 
  ? JSON.parse(localStorage.getItem('settings') || JSON.stringify(defaultValue))
  : defaultValue;

export const settings = writable(initialValue);

if (browser) {
  settings.subscribe(value => {
    localStorage.setItem('settings', JSON.stringify(value));
  });
}
```

### 2. sessionStorage Integration
- **Use Cases**: Temporary state, form data, navigation state.
- **Lifetime**: Persists only for the browser session.
- **Implementation**: Similar to localStorage but with session lifetime.

### 3. IndexedDB Integration
- **Use Cases**: Large amounts of data, offline capabilities.
- **Libraries**: Use libraries like Dexie.js for easier IndexedDB usage.
- **Complexity**: More complex but more powerful than localStorage.

## Real-time State Management

### 1. WebSocket Integration
- **Real-time Updates**: Use WebSockets for real-time state updates.
- **Store Integration**: Update stores based on WebSocket messages.
- **Connection Management**: Handle connection lifecycle properly.

```javascript
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export const messages = writable([]);

if (browser) {
  const ws = new WebSocket('ws://localhost:8080');
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    messages.update(msgs => [...msgs, message]);
  };
}
```

### 2. Server-Sent Events (SSE)
- **One-way Communication**: Server to client real-time updates.
- **Implementation**: Use EventSource API with SvelteKit.
- **Use Cases**: Live updates, notifications, real-time data.

### 3. Polling Strategies
- **Regular Polling**: Fetch data at regular intervals.
- **Smart Polling**: Poll based on user activity or visibility.
- **Background Sync**: Sync data when connection is restored.

## State Management Libraries

### 1. Zustand
- **Integration**: Can be used with Svelte with some adaptation.
- **Simple API**: Minimal boilerplate, easy to use.
- **TypeScript**: Excellent TypeScript support.

### 2. Jotai
- **Atomic State**: Bottom-up state management approach.
- **Svelte Integration**: Requires custom integration layer.
- **Use Cases**: Complex state with fine-grained updates.

### 3. XState
- **State Machines**: Model complex state transitions.
- **Svelte Integration**: Good integration with Svelte stores.
- **Use Cases**: Complex workflows, form validation, UI states.

## Best Practices

### Development Patterns
- **Start Simple**: Begin with component state, add stores as needed.
- **Composition**: Compose multiple simple stores rather than one complex store.
- **Naming**: Use clear, descriptive names for stores and state.
- **Documentation**: Document store interfaces and state shapes.

### Performance Optimization
- **Selective Subscriptions**: Subscribe only to needed state slices.
- **Derived Stores**: Use derived stores for computed values.
- **Unsubscribe**: Properly unsubscribe to prevent memory leaks.
- **Batching**: Batch related state updates when possible.

### SSR Considerations
- **Hydration**: Ensure consistent state between server and client.
- **Initial State**: Properly initialize state on both server and client.
- **Browser Detection**: Use `browser` from `$app/environment` for client-only code.
- **Serialization**: Ensure state is serializable for SSR.

### Security
- **Sensitive Data**: Never store sensitive data in client state.
- **Validation**: Validate state changes on the server.
- **Sanitization**: Sanitize user inputs before storing.
- **Authentication**: Handle authentication state securely.

## Recommendations

### For Small Applications
- Use **component state** with reactive variables
- Use **Svelte stores** for shared state
- Use **page data** for server-fetched state
- Keep state management simple and close to usage

### For Medium Applications
- Use **custom stores** for business logic
- Implement **state persistence** where needed
- Use **derived stores** for computed values
- Organize stores by domain or feature

### For Large Applications
- Implement **store composition** patterns
- Use **context API** for dependency injection
- Consider **state machines** for complex workflows
- Implement **comprehensive testing** for state logic
- Use **TypeScript** for better developer experience

### For Real-time Applications
- Use **WebSocket** or **SSE** for real-time updates
- Implement **optimistic updates** for better UX
- Handle **connection states** properly
- Consider **conflict resolution** strategies

Remember that SvelteKit's universal rendering and Svelte's reactive system provide powerful foundations for state management, often requiring less complex solutions than other frameworks while maintaining excellent performance and developer experience.
