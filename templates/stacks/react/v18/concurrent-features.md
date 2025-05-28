---
description: Guide to React 18 Concurrent Features
globs: <root>/src/**/*.{ts,tsx,js,jsx}
alwaysApply: true # As these are core v18 features
---

# React 18: Concurrent Features Guide

## Overview

React 18 introduced concurrent features, which fundamentally change how React handles rendering and updates.
Concurrency allows React to work on multiple tasks simultaneously (e.g., rendering UI, responding to user input) without blocking the main thread.
This leads to improved performance, smoother user experiences, and new capabilities for UI patterns.

## Key Concurrent APIs and Patterns

-   **`startTransition`**:
    -   "Use `startTransition` to mark UI updates as non-urgent transitions. React can interrupt these transitions if more urgent updates (like user input) come in."
    -   "Helps keep the UI responsive during heavy updates or re-renders."
    -   "Syntax: `startTransition(() => { /* state update */ });`"
-   **`useTransition`**:
    -   "A hook that provides a pending state (`isPending`) for transitions, allowing you to show loading indicators."
    -   "Syntax: `const [isPending, startTransition] = useTransition();`"
-   **`useDeferredValue`**:
    -   "Use `useDeferredValue` to defer re-rendering a non-critical part of the UI."
    -   "React will render the deferred part with a slight delay, allowing more critical updates to render first."
    -   "Useful for optimizing lists or content that renders based on rapidly changing values."
    -   "Syntax: `const deferredValue = useDeferredValue(value);`"
-   **Automatic Batching:**
    -   "React 18 automatically batches multiple state updates (even those inside promises, setTimeout, or native event handlers) into a single re-render for better performance. Previously, batching was mostly limited to React event handlers."

### Automatic Batching Explained

In React 18, state updates are automatically batched, even if they are outside of React event handlers (e.g., inside `setTimeout`, promises, or native event handlers). This means multiple `setState` calls will result in only one re-render, improving performance.

**Conceptual Example:**

```javascript
// React 17 (potentially two re-renders)
setTimeout(() => {
  setCount(c => c + 1); // Re-render 1
  setLoading(false);    // Re-render 2
}, 1000);

// React 18 (only one re-render)
setTimeout(() => {
  setCount(c => c + 1); // Batched
  setLoading(false);    // Batched - single re-render
}, 1000);
```
-   **Suspense for Data Fetching (General Concept):**
    -   "While full Suspense for data fetching is still evolving in libraries, React 18 improves its core capabilities, enabling patterns where components can 'suspend' while data is being fetched, showing a fallback UI."
    -   **Note on Data Fetching Libraries:** While React provides the primitives for Suspense, integrating it for data fetching is often handled by libraries like React Query, SWR, or Relay. Consult the documentation of your chosen data fetching library for specific patterns on how to use Suspense for declarative loading states.

## `startTransition` Example

```javascript
import { useState, useTransition } from 'react';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setInputValue(e.target.value);
    startTransition(() => {
      setSearchTerm(e.target.value); // This update is a transition
    });
  };

  return (
    <div>
      <input type="text" value={inputValue} onChange={handleChange} />
      {isPending ? <p>Loading...</p> : null}
      <DisplayResults searchTerm={searchTerm} />
    </div>
  );
}

function DisplayResults({ searchTerm }) {
  // Imagine this component renders a list based on searchTerm
  return <p>Showing results for: {searchTerm}</p>;
}

export default App;
```

## `useDeferredValue` Example

```javascript
import { useState, useDeferredValue } from 'react';

function SearchResults({ query }) {
  // If 'query' changes rapidly, 'deferredQuery' will update with a delay.
  const deferredQuery = useDeferredValue(query);
  
  // This list will only re-render when deferredQuery updates,
  // preventing lag if 'query' updates too frequently.
  const list = Array.from({ length: 5000 }, (_, index) => (
    <div key={index}>{`Item ${index + 1} for ${deferredQuery}`}</div>
  ));

  return <div>{list}</div>;
}

function App() {
  const [query, setQuery] = useState('');
  
  return (
    <div>
      <input 
        type="text" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="Type to search..."
      />
      <SearchResults query={query} />
    </div>
  );
}

export default App;
```
