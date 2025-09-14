---
description: State management concepts and approaches in React applications
globs: <root>/src/**/*.{ts,tsx,js,jsx}
alwaysApply: true
---

# State Management in React Applications

This document outlines common conceptual approaches to state management in React applications in {projectPath}. The choice of state management solution can significantly impact maintainability, scalability, and developer experience.

## React Built-in State Management

### 1. useState Hook
- **Concept**: Manages local component state with functional components.
- **Use Cases**: Simple component state, form inputs, toggles.
- **Pros**: Simple API, no additional dependencies, works out of the box.
- **Cons**: Limited to component scope, doesn't persist across unmounts.

### 2. useReducer Hook
- **Concept**: Manages complex state logic with reducer pattern.
- **Use Cases**: Complex state transitions, multiple related state variables.
- **Pros**: Predictable state updates, good for complex logic.
- **Cons**: More boilerplate than useState, overkill for simple state.

### 3. useContext Hook
- **Concept**: Shares state across component tree without prop drilling.
- **Use Cases**: Theme data, user authentication, global settings.
- **Pros**: Built-in React feature, avoids prop drilling.
- **Cons**: Can cause unnecessary re-renders, not suitable for frequently changing data.

### 4. Custom Hooks
- **Concept**: Encapsulate stateful logic in reusable functions.
- **Use Cases**: Shared state logic, complex state patterns.
- **Pros**: Reusable, testable, follows React patterns.
- **Cons**: Can become complex, may need additional state management for global state.

## Third-Party State Management Libraries

### 1. Redux Toolkit (RTK)
- **Concept**: Modern Redux with less boilerplate and better DevTools.
- **Use Cases**: Large applications, complex state logic, time-travel debugging.
- **Features**: 
  - Immutable updates with Immer
  - Built-in DevTools support
  - RTK Query for data fetching
  - Excellent TypeScript support
- **Pros**: Predictable state updates, excellent debugging tools, large ecosystem.
- **Cons**: Learning curve, can be overkill for simple applications.

### 2. Zustand
- **Concept**: Lightweight state management with minimal boilerplate.
- **Use Cases**: Small to medium applications, simple global state needs.
- **Features**:
  - Simple API with hooks
  - TypeScript support
  - Middleware support
  - No providers needed
- **Pros**: Minimal boilerplate, easy to learn, good performance.
- **Cons**: Less ecosystem support, fewer debugging tools than Redux.

### 3. Jotai
- **Concept**: Atomic state management with bottom-up approach.
- **Use Cases**: Applications with fine-grained state requirements.
- **Features**:
  - Atomic state units
  - Composable atoms
  - Suspense integration
  - TypeScript support
- **Pros**: Fine-grained reactivity, composable, works well with Suspense.
- **Cons**: Different mental model, smaller ecosystem.

### 4. Valtio
- **Concept**: Proxy-based state management with mutable API.
- **Use Cases**: Applications where you prefer mutable state updates.
- **Features**:
  - Mutable state updates
  - Automatic optimization
  - Simple API
  - TypeScript support
- **Pros**: Familiar mutable API, automatic optimization.
- **Cons**: Proxy-based approach may have browser compatibility issues.

### 5. Recoil
- **Concept**: Facebook's experimental state management library.
- **Use Cases**: Applications needing atomic state management.
- **Features**:
  - Atomic state units
  - Derived state
  - Async state support
  - DevTools support
- **Pros**: Atomic approach, async state handling.
- **Cons**: Still experimental, uncertain future support.

## Server State Management

### 1. React Query (TanStack Query)
- **Concept**: Data fetching and caching library for server state.
- **Features**:
  - Automatic caching and background refetching
  - Optimistic updates
  - Offline support
  - DevTools
- **Use When**: Complex data fetching requirements, need caching strategies.

### 2. SWR
- **Concept**: Data fetching library with focus on user experience.
- **Features**:
  - Automatic revalidation
  - Optimistic updates
  - Error handling
  - TypeScript support
- **Use When**: Simple data fetching with good user experience.

### 3. Apollo Client
- **Concept**: GraphQL client with integrated state management.
- **Features**:
  - GraphQL integration
  - Normalized caching
  - Real-time subscriptions
  - DevTools
- **Use When**: Using GraphQL, need normalized caching.

## State Management Patterns

### 1. Lifting State Up
- **Concept**: Move state to common ancestor component.
- **Use When**: Multiple components need to share state.
- **Pros**: Simple, follows React patterns.
- **Cons**: Can lead to prop drilling.

### 2. Component Composition
- **Concept**: Use component composition to avoid prop drilling.
- **Use When**: Deep component trees, want to avoid context.
- **Pros**: Explicit data flow, no hidden dependencies.
- **Cons**: Can make components less flexible.

### 3. State Machines
- **Concept**: Model state as finite state machines.
- **Libraries**: XState, use-machine.
- **Use When**: Complex state transitions, need to model workflows.
- **Pros**: Predictable state transitions, visual modeling.
- **Cons**: Learning curve, can be overkill for simple state.

## Best Practices

### Choosing the Right Solution
- **Local State**: Use useState or useReducer for component-local state.
- **Shared State**: Use useContext for infrequently changing shared state.
- **Global State**: Use Redux Toolkit, Zustand, or Jotai for frequently changing global state.
- **Server State**: Use React Query, SWR, or Apollo Client for server data.

### Performance Considerations
- **Minimize Re-renders**: Use React.memo, useMemo, and useCallback appropriately.
- **State Normalization**: Normalize state shape for better performance.
- **Selective Subscriptions**: Subscribe only to needed state slices.
- **Code Splitting**: Split state management code when possible.

### Development Experience
- **DevTools**: Use Redux DevTools, React DevTools, or library-specific tools.
- **TypeScript**: Use TypeScript for better development experience.
- **Testing**: Write tests for state logic separately from components.
- **Documentation**: Document state shape and update patterns.

## Recommendations

### For Small Applications (< 10 components with shared state)
- Use **React built-in state** (useState, useContext)
- Use **SWR** for server state if needed
- Keep state close to where it's used

### For Medium Applications (10-50 components with shared state)
- Use **Zustand** for client state management
- Use **React Query** for server state management
- Consider **useReducer** for complex component state

### For Large Applications (50+ components with shared state)
- Use **Redux Toolkit** for complex client state management
- Use **React Query** or **Apollo Client** for server state management
- Implement proper state architecture with clear boundaries
- Consider **state machines** for complex workflows

### For Team Environments
- Choose solutions with good TypeScript support
- Prefer solutions with good DevTools support
- Establish clear patterns and conventions
- Provide team training on chosen solutions

Remember that you can mix and match different state management solutions in the same application. Use the right tool for each specific use case rather than trying to solve everything with a single solution.
