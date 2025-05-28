---
description: Overview of state management strategies in React Native.
globs: <root>/**/*.{js,jsx,ts,tsx}
alwaysApply: true
---

# State Management in React Native Applications

Managing state effectively is crucial for building scalable and maintainable React Native applications in {projectPath}. State can range from local component state to complex global state shared across many parts of the application.

## Local Component State

For state that is only relevant to a single component and its direct children.

-   **`useState` Hook**:
    -   The most basic way to manage state within a functional component.
    -   Use for simple state values like booleans, strings, numbers, or small objects/arrays.
    -   Example: `const [isVisible, setIsVisible] = useState(false);`
-   **`useReducer` Hook**:
    -   Preferable for more complex state logic that involves multiple sub-values or when the next state depends on the previous one in a more involved way.
    -   Often used when state transitions are well-defined (similar to Redux reducers but local to a component).
    -   Example:
        ```javascript
        const initialState = { count: 0, step: 1 };
        function reducer(state, action) {
          switch (action.type) {
            case 'increment': return { ...state, count: state.count + state.step };
            case 'decrement': return { ...state, count: state.count - state.step };
            case 'setStep': return { ...state, step: action.step };
            default: throw new Error();
          }
        }
        // const [state, dispatch] = useReducer(reducer, initialState);
        ```

## React Context API

For sharing state that can be considered "global" for a tree of React components, without having to pass props down manually at every level.

-   **How it works**:
    -   `React.createContext()`: Creates a Context object.
    -   `Context.Provider`: Allows consuming components to subscribe to context changes. It accepts a `value` prop to be passed to consuming components.
    -   `useContext(MyContext)`: Hook to access the context value in a functional component.
    -   `Context.Consumer`: An alternative way to consume context in class components or when needing a render prop pattern.
-   **Use Cases**:
    -   Theming (passing down color schemes, font sizes).
    -   User authentication status.
    -   User preferences.
    -   Managing state for a specific feature area (e.g., a shopping cart).
-   **Considerations**:
    -   Context is not optimized for high-frequency updates. If the context value changes, all components consuming that context will re-render.
    -   For complex global state or state requiring many updates, dedicated global state libraries might be more performant.

## Global State Management Libraries

When application state becomes complex, shared across many disconnected components, or requires advanced features like middleware, time-travel debugging, or selectors, dedicated global state libraries are recommended.

### 1. Redux (with React Redux)
-   **Core Concepts**: Store, Actions, Reducers, Dispatch, Middleware (e.g., Thunk, Saga for async operations).
-   **Pros**:
    -   Predictable state updates (unidirectional data flow).
    -   Mature ecosystem and extensive developer tools (Redux DevTools).
    -   Well-suited for large, complex applications.
    -   Strongly opinionated, which can lead to consistency.
-   **Cons**:
    -   Boilerplate-heavy, especially for simple state changes (though Redux Toolkit significantly reduces this).
    -   Steeper learning curve.
-   **React Native Context**: Often used with `react-redux`'s `Provider` to pass the store down.
-   **Redux Toolkit**: The official, opinionated, batteries-included toolset for efficient Redux development. Highly recommended for new Redux projects.

### 2. Zustand
-   **Core Concepts**: A small, fast, and scalable state management solution using a simplified Flux-like pattern. Uses hooks as the primary way to interact with the store.
-   **Pros**:
    -   Minimal boilerplate; very concise API.
    -   Easy to learn and use.
    -   Good performance; only components that subscribe to specific parts of the state re-render.
    -   Supports middleware and async actions.
-   **Cons**:
    -   Less opinionated than Redux, which might require more team discipline.
    -   Smaller ecosystem compared to Redux, but growing rapidly.

### 3. Jotai / Recoil
-   **Core Concepts**: Atomic state management. State is broken down into small, independent pieces called "atoms." Components subscribe only to the atoms they need.
-   **Pros**:
    -   Fine-grained subscriptions lead to good performance.
    -   Intuitive API, feels very "React-like."
    -   Good for applications where state is distributed and not necessarily centralized.
    -   Recoil was developed by Facebook, Jotai is a popular community alternative.
-   **Cons**:
    -   Newer paradigms, still evolving.
    -   Developer tools might not be as mature as Redux DevTools.

### 4. MobX (with `mobx-react-lite`)
-   **Core Concepts**: Based on observable state and reactions. Changes to observable state automatically trigger re-renders in components that use that state (transparent reactive programming).
-   **Pros**:
    -   Less boilerplate; state updates are often direct mutations.
    -   Intuitive for developers familiar with OOP.
    -   Good performance due to fine-grained reactivity.
-   **Cons**:
    -   Can feel "too magical" for some, potentially making debugging harder if not understood well.
    -   Requires understanding of reactivity concepts.

## Considerations for State Persistence

Often, you need to persist application state across app launches (e.g., user settings, offline data).

-   **AsyncStorage**: React Native's built-in simple, unencrypted, asynchronous, persistent key-value storage system. Suitable for non-sensitive data.
-   **Secure Storage**: For sensitive data (tokens, user credentials), use libraries like `react-native-keychain` or `expo-secure-store`.
-   **Integration with Global State Libraries**:
    -   **Redux Persist**: A popular library for persisting and rehydrating a Redux store.
    -   **Zustand Persist Middleware**: Zustand offers middleware for easy state persistence.
    -   Many libraries have specific adapters or middleware for common storage solutions.
-   **Offline Capabilities**: For complex offline data requirements, consider:
    -   **SQLite**: Using libraries like `react-native-sqlite-storage`.
    -   **WatermelonDB / Realm**: More powerful local databases designed for mobile apps, offering features like observables and synchronization.

Choosing the right state management strategy for {projectPath} depends on the application's complexity, team familiarity, and performance requirements. Start simple with local state and Context API, and introduce global state libraries as the need arises.
```
