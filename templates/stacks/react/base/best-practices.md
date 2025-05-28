---
description: Best practices for React applications
globs: <root>/src/**/*.{ts,tsx,js,jsx},<root>/components/**/*.{ts,tsx,js,jsx}
alwaysApply: true
---

# React Best Practices

This guide outlines the recommended best practices for React development in {projectPath}.

## Component Structure

### Functional Components

Use functional components with hooks as the default pattern:

```jsx
// ✅ Preferred: Functional component with hooks
const UserProfile = ({ userId }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchUser(userId).then((data) => {
			setUser(data);
			setLoading(false);
		});
	}, [userId]);

	if (loading) return <Spinner />;
	return <div>{user.name}</div>;
};
```

### Component Organization

Organize components by feature or page rather than by type:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── index.js
│   ├── dashboard/
│   └── settings/
├── common/
│   ├── components/
│   ├── hooks/
│   └── utils/
```

## State Management

### Local State

Use local state for component-specific state:

```jsx
// Simple counter with local state
function Counter() {
	const [count, setCount] = useState(0);
	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}
```

### Global State

For global state, choose the appropriate solution based on complexity:

-   **Context API**: For simpler applications or shared state within a specific feature
-   **Redux**: For complex applications with many state updates or when you need time-travel debugging
-   **Zustand/Jotai/Recoil**: For simpler API with less boilerplate than Redux

```jsx
// Context API example
const ThemeContext = createContext();

function ThemeProvider({ children }) {
	const [theme, setTheme] = useState('light');
	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

// Hook to use the theme
function useTheme() {
	return useContext(ThemeContext);
}
```

## Performance Optimization

### Memoization

Use `React.memo`, `useMemo`, and `useCallback` for performance optimization, but only when necessary:

```jsx
// Memoize expensive calculations
const MemoizedComponent = React.memo(({ value }) => {
	// Only re-renders if value changes
	return <div>{value}</div>;
});

function ParentComponent() {
	const [count, setCount] = useState(0);

	// Memoize callback to prevent unnecessary rerenders
	const handleClick = useCallback(() => {
		console.log('Clicked');
	}, []);

	// Memoize expensive calculations
	const expensiveValue = useMemo(() => {
		return computeExpensiveValue(count);
	}, [count]);

	return (
		<div>
			<button onClick={() => setCount(count + 1)}>Increment</button>
			<MemoizedComponent value={expensiveValue} onClick={handleClick} />
		</div>
	);
}
```

### Virtual List

For long lists, use virtualization libraries like `react-window` or `react-virtualized`:

```jsx
import { FixedSizeList } from 'react-window';

const Row = ({ index, style }) => <div style={style}>Row {index}</div>;

const VirtualList = () => (
	<FixedSizeList height={500} width='100%' itemCount={10000} itemSize={35}>
		{Row}
	</FixedSizeList>
);
```

## Code Splitting

Use dynamic imports and React.lazy for code splitting:

```jsx
import React, { Suspense, lazy } from 'react';

// Lazy load the component
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
	return (
		<div>
			<Suspense fallback={<div>Loading...</div>}>
				<LazyComponent />
			</Suspense>
		</div>
	);
}
```

## Custom Hooks

Extract reusable logic into custom hooks:

```jsx
// Custom hook for handling form state
function useForm(initialValues) {
	const [values, setValues] = useState(initialValues);

	const handleChange = useCallback((e) => {
		const { name, value } = e.target;
		setValues((prev) => ({ ...prev, [name]: value }));
	}, []);

	const resetForm = useCallback(() => {
		setValues(initialValues);
	}, [initialValues]);

	return { values, handleChange, resetForm };
}

// Usage
function LoginForm() {
	const { values, handleChange, resetForm } = useForm({
		email: '',
		password: '',
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		// Process form submission
		resetForm();
	};

	return (
		<form onSubmit={handleSubmit}>
			<input name='email' value={values.email} onChange={handleChange} />
			<input
				type='password'
				name='password'
				value={values.password}
				onChange={handleChange}
			/>
			<button type='submit'>Login</button>
		</form>
	);
}
```

## API Calls

Use custom hooks for API calls:

```jsx
function useApi(url) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let isMounted = true;
		setLoading(true);

		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				if (isMounted) {
					setData(data);
					setLoading(false);
				}
			})
			.catch((error) => {
				if (isMounted) {
					setError(error);
					setLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [url]);

	return { data, loading, error };
}

// Usage
function UserList() {
	const { data, loading, error } = useApi('/api/users');

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<ul>
			{data.map((user) => (
				<li key={user.id}>{user.name}</li>
			))}
		</ul>
	);
}
```

## Type Safety

Use TypeScript or PropTypes for type checking:

```tsx
// TypeScript example
interface UserProps {
	name: string;
	age: number;
	email?: string; // Optional
}

const User: React.FC<UserProps> = ({ name, age, email }) => {
	return (
		<div>
			<h2>{name}</h2>
			<p>Age: {age}</p>
			{email && <p>Email: {email}</p>}
		</div>
	);
};
```

## Accessibility

Follow accessibility best practices:

-   Use semantic HTML elements
-   Include proper labels for form elements
-   Ensure keyboard navigation works
-   Provide alternative text for images
-   Test with screen readers

```jsx
// Accessible form element
<div>
	<label htmlFor='email'>Email Address</label>
	<input id='email' type='email' aria-describedby='email-help' />
	<p id='email-help'>We'll never share your email.</p>
</div>
```

## Error Boundaries

Use error boundaries to catch JavaScript errors and display fallback UI:

```jsx
class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		// Log the error to an error reporting service
		logErrorToService(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return <h1>Something went wrong.</h1>;
		}

		return this.props.children;
	}
}

// Usage
<ErrorBoundary>
	<MyComponent />
</ErrorBoundary>;
```

## Project Structure

Follow a consistent project structure:

```
src/
├── assets/         # Static files like images, fonts
├── components/     # Shared components
│   ├── common/     # Very generic components used across features
│   └── ui/         # UI components like buttons, inputs, etc.
├── features/       # Feature-based modules
├── hooks/          # Custom hooks
├── layouts/        # Layout components
├── pages/          # Page components
├── services/       # API services
├── store/          # State management
├── utils/          # Utility functions
├── App.jsx         # Root component
└── index.jsx       # Entry point
```
