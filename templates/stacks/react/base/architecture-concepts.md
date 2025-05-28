---
description: Core architectural concepts for React applications
globs: <root>/src/**/*.{ts,tsx,js,jsx}
alwaysApply: true
---

# React Architecture Concepts

This document outlines the core architectural concepts and patterns used in React applications in {projectPath}.

## Component Architecture

React's component architecture is based on these principles:

### Component Types

1. **Presentational Components**

    - Focus solely on UI rendering
    - Receive data via props
    - Don't handle state (or only UI state)
    - Reusable and composable

2. **Container Components**

    - Handle data fetching and state management
    - Pass data to presentational components
    - Connect to global state
    - Focus on behavior over appearance

3. **HOCs (Higher-Order Components)**

    - Take a component and return a new enhanced component
    - Share common functionality between components
    - Examples: `withRouter`, `withAuth`

4. **Render Props Components**
    - Share code via a prop that's a function
    - Function returns element to render
    - Example: `<Route render={props => <Component {...props} />} />`

### Hooks Architecture

Modern React apps increasingly use hooks for organization:

1. **Hook Categories**

    - **State Hooks**: `useState`, `useReducer`
    - **Effect Hooks**: `useEffect`, `useLayoutEffect`
    - **Context Hooks**: `useContext`
    - **Ref Hooks**: `useRef`, `useImperativeHandle`
    - **Custom Hooks**: Reusable logic patterns

2. **Custom Hook Architecture**
    - Extract and share logic between components
    - Name with `use` prefix
    - Can be composed from other hooks
    - Examples: `useForm`, `useLocalStorage`, `useFetch`

## State Management Architecture

React applications can employ several state management patterns:

### Component-Level State

-   Use `useState` and `useReducer` for component-specific state
-   Lift state up to common ancestor when needed
-   Use callbacks to pass state updates downward

### Context-Based Architecture

-   `React.createContext` and `useContext` for state shared across components
-   Avoids prop drilling
-   Best for moderate state complexity
-   Often organized by domain or feature

```jsx
// Example Context Architecture
const UserContext = createContext();

function UserProvider({ children }) {
	const [user, setUser] = useState(null);
	// Auth logic here

	return (
		<UserContext.Provider value={{ user, login, logout }}>
			{children}
		</UserContext.Provider>
	);
}

// Custom hook for consuming context
function useUser() {
	return useContext(UserContext);
}
```

### Redux Architecture

For complex applications with many state interactions:

1. **Store**: Single source of truth
2. **Actions**: Plain objects describing state changes
3. **Reducers**: Pure functions updating state
4. **Selectors**: Functions to extract specific state
5. **Middleware**: For side effects (e.g., async operations)

```
src/
├── store/
│   ├── index.js              # Store configuration
│   ├── rootReducer.js        # Combined reducers
│   └── middleware.js         # Custom middleware
├── features/
│   ├── auth/
│   │   ├── authSlice.js      # Redux Toolkit slice (actions+reducer)
│   │   └── authSelectors.js  # State selectors
│   └── products/
│       ├── productsSlice.js
│       └── productsSelectors.js
```

### Other State Management Options

-   **Zustand**: Simpler alternative to Redux
-   **Recoil**: Flexible state management with atoms and selectors
-   **Jotai**: Atomic state management
-   **MobX**: Observable state management

## Project Architecture

### Feature-Based Architecture

Organize by feature rather than type:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/       # Components specific to auth
│   │   ├── hooks/            # Custom hooks for auth
│   │   ├── api.js            # Auth API calls
│   │   ├── types.ts          # TypeScript types
│   │   └── index.js          # Public API of the feature
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api.js
│   └── cart/
│       ├── components/
│       ├── hooks/
│       └── api.js
├── common/                   # Shared across features
│   ├── components/
│   ├── hooks/
│   └── utils/
```

### Scalable React Architecture

For large React applications:

1. **Atomic Design**

    - **Atoms**: Smallest building blocks (Button, Input)
    - **Molecules**: Combinations of atoms (SearchForm)
    - **Organisms**: Complex UI sections (Header, ProductCard)
    - **Templates**: Page layouts without specific content
    - **Pages**: Templates with actual content

2. **Modular Architecture**
    - Independent, self-contained modules
    - Explicit public API for each module
    - Enables team collaboration and code isolation
    - Scales well for large codebases

## Data Flow Architecture

### Unidirectional Data Flow

-   Data flows down via props
-   Events/callbacks flow up
-   Maintains predictable state management
-   Simplifies debugging and reasoning about code

### Component Communication Patterns

1. **Parent-Child**: Props for down, callbacks for up
2. **Context API**: For cross-component/global state
3. **State Management Libraries**: For complex or app-wide state
4. **Event Bus/PubSub**: For decoupled communication (less common)
5. **URL/Router**: State in URL for navigational state

## API Interaction Architecture

### Data Fetching Patterns

1. **Custom Hooks**

    ```jsx
    function useProducts() {
    	const [products, setProducts] = useState([]);
    	const [loading, setLoading] = useState(true);
    	const [error, setError] = useState(null);

    	useEffect(() => {
    		fetchProducts()
    			.then((data) => setProducts(data))
    			.catch((err) => setError(err))
    			.finally(() => setLoading(false));
    	}, []);

    	return { products, loading, error };
    }
    ```

2. **React Query/SWR**

    ```jsx
    // With React Query
    function Products() {
    	const { data, isLoading, error } = useQuery('products', fetchProducts);

    	if (isLoading) return <Spinner />;
    	if (error) return <ErrorMessage error={error} />;

    	return <ProductList products={data} />;
    }
    ```

3. **Redux + Thunks/Sagas**
    ```jsx
    // Using Redux with thunks
    const fetchProducts = () => async (dispatch) => {
    	dispatch({ type: 'products/loading' });
    	try {
    		const data = await api.getProducts();
    		dispatch({ type: 'products/loaded', payload: data });
    	} catch (error) {
    		dispatch({ type: 'products/error', payload: error });
    	}
    };
    ```

## Testing Architecture

Layer your tests according to the testing pyramid:

1. **Unit Tests**: Individual components, hooks, utils
2. **Integration Tests**: Component interactions
3. **E2E Tests**: Full user flows

## Progressive Enhancement

For production applications, consider:

1. **Code Splitting**: Lazy load routes and large components
2. **Performance Optimization**: Memoization, virtualization
3. **Error Boundaries**: Graceful failure handling
4. **Accessibility**: ARIA attributes, keyboard navigation
5. **Internationalization**: i18n support

## Architecture Decision Records

Consider maintaining ADRs (Architecture Decision Records) for significant architecture decisions:

```
docs/
└── architecture/
    ├── decisions/
    │   ├── 0001-state-management.md
    │   ├── 0002-routing-solution.md
    │   └── 0003-testing-strategy.md
    └── architecture-overview.md
```
