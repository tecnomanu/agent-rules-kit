---
description: Guide for using Redux state management in React applications
globs: <root>/src/**/*.{ts,tsx,js,jsx}
alwaysApply: false
---

# Redux State Management in React

Redux is a predictable state container for JavaScript applications, commonly used with React. It helps you manage global application state in a predictable and maintainable way.

## Core Concepts

1. **Store**: A single source of truth that holds the entire application state
2. **Actions**: Plain JavaScript objects that describe what happened
3. **Reducers**: Pure functions that specify how the state changes in response to actions
4. **Selectors**: Functions to extract specific pieces of state
5. **Middleware**: Extends Redux with custom functionality (async operations, logging, etc.)

## Directory Structure

```
src/
├── store/
│   ├── index.js              # Store configuration
│   ├── rootReducer.js        # Root reducer combining all feature reducers
│   ├── middleware.js         # Custom middleware configuration
│   └── hooks.js              # Custom Redux hooks
├── features/
│   ├── auth/
│   │   ├── authSlice.js      # Redux Toolkit slice (actions + reducer)
│   │   ├── authSelectors.js  # Selectors for auth state
│   │   └── authThunks.js     # Async thunks for auth operations
│   └── products/
│       ├── productsSlice.js  # Redux Toolkit slice for products
│       ├── productsSelectors.js
│       └── productsThunks.js
└── services/
    └── api.js                # API client for data fetching
```

## Implementation with Redux Toolkit

### Store Setup

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import rootReducer from './rootReducer';
import middleware from './middleware';

const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(middleware),
	devTools: process.env.NODE_ENV !== 'production',
});

// Optional: Setup listeners for RTK Query
setupListeners(store.dispatch);

export default store;
```

```javascript
// store/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productsReducer from '../features/products/productsSlice';
import { api } from '../services/api';

const rootReducer = combineReducers({
	auth: authReducer,
	products: productsReducer,
	[api.reducerPath]: api.reducer,
});

export default rootReducer;
```

```javascript
// store/middleware.js
import { api } from '../services/api';

const middleware = [
	api.middleware,
	// Add additional middleware here
];

export default middleware;
```

```javascript
// store/hooks.js
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './types';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```typescript
// store/types.ts
import { store } from './index';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Feature Slice Example

```javascript
// features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { loginUser, logoutUser, registerUser } from './authThunks';

const initialState = {
	user: null,
	token: localStorage.getItem('token') || null,
	isAuthenticated: !!localStorage.getItem('token'),
	status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
	error: null,
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Login
			.addCase(loginUser.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.user = action.payload.user;
				state.token = action.payload.token;
				state.isAuthenticated = true;
				localStorage.setItem('token', action.payload.token);
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload || 'Login failed';
			})

			// Logout
			.addCase(logoutUser.fulfilled, (state) => {
				state.user = null;
				state.token = null;
				state.isAuthenticated = false;
				localStorage.removeItem('token');
			})

			// Register
			.addCase(registerUser.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.user = action.payload.user;
				state.token = action.payload.token;
				state.isAuthenticated = true;
				localStorage.setItem('token', action.payload.token);
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload || 'Registration failed';
			});
	},
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
```

### Thunks for Async Operations

```javascript
// features/auth/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const loginUser = createAsyncThunk(
	'auth/login',
	async (credentials, { rejectWithValue }) => {
		try {
			const response = await api.post('/auth/login', credentials);
			return response.data;
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || 'Login failed'
			);
		}
	}
);

export const logoutUser = createAsyncThunk(
	'auth/logout',
	async (_, { rejectWithValue }) => {
		try {
			await api.post('/auth/logout');
			return {};
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || 'Logout failed'
			);
		}
	}
);

export const registerUser = createAsyncThunk(
	'auth/register',
	async (userData, { rejectWithValue }) => {
		try {
			const response = await api.post('/auth/register', userData);
			return response.data;
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || 'Registration failed'
			);
		}
	}
);
```

### Selectors

```javascript
// features/auth/authSelectors.js
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
```

### Usage in Components

```jsx
// components/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser } from '../../features/auth/authThunks';
import { clearError } from '../../features/auth/authSlice';
import {
	selectAuthStatus,
	selectAuthError,
	selectIsAuthenticated,
} from '../../features/auth/authSelectors';

const LoginForm = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const status = useAppSelector(selectAuthStatus);
	const error = useAppSelector(selectAuthError);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

	// Redirect if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			navigate('/dashboard');
		}
	}, [isAuthenticated, navigate]);

	// Clear errors when unmounting
	useEffect(() => {
		return () => {
			dispatch(clearError());
		};
	}, [dispatch]);

	const handleSubmit = (e) => {
		e.preventDefault();
		dispatch(loginUser({ email, password }));
	};

	return (
		<form onSubmit={handleSubmit}>
			{error && <div className='error-message'>{error}</div>}

			<div className='form-group'>
				<label htmlFor='email'>Email</label>
				<input
					type='email'
					id='email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='password'>Password</label>
				<input
					type='password'
					id='password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
			</div>

			<button type='submit' disabled={status === 'loading'}>
				{status === 'loading' ? 'Logging in...' : 'Login'}
			</button>
		</form>
	);
};

export default LoginForm;
```

## Using RTK Query for API Calls

Redux Toolkit Query (RTK Query) is a powerful data fetching and caching tool included in Redux Toolkit.

```javascript
// services/api.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api',
		prepareHeaders: (headers, { getState }) => {
			// Get token from auth state
			const token = getState().auth.token;

			// If token exists, add to headers
			if (token) {
				headers.set('authorization', `Bearer ${token}`);
			}

			return headers;
		},
	}),
	endpoints: (builder) => ({
		getProducts: builder.query({
			query: () => 'products',
			providesTags: ['Products'],
		}),
		getProduct: builder.query({
			query: (id) => `products/${id}`,
			providesTags: (result, error, id) => [{ type: 'Products', id }],
		}),
		addProduct: builder.mutation({
			query: (product) => ({
				url: 'products',
				method: 'POST',
				body: product,
			}),
			invalidatesTags: ['Products'],
		}),
		updateProduct: builder.mutation({
			query: ({ id, ...patch }) => ({
				url: `products/${id}`,
				method: 'PATCH',
				body: patch,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: 'Products', id },
			],
		}),
		deleteProduct: builder.mutation({
			query: (id) => ({
				url: `products/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Products'],
		}),
	}),
});

export const {
	useGetProductsQuery,
	useGetProductQuery,
	useAddProductMutation,
	useUpdateProductMutation,
	useDeleteProductMutation,
} = api;
```

### Using RTK Query Hooks

```jsx
// components/ProductsList.jsx
import React from 'react';
import { useGetProductsQuery } from '../../services/api';

const ProductsList = () => {
	const { data: products, isLoading, error } = useGetProductsQuery();

	if (isLoading) return <div>Loading products...</div>;
	if (error) return <div>Error loading products: {error.message}</div>;

	return (
		<div className='products-list'>
			<h2>Products</h2>
			<ul>
				{products.map((product) => (
					<li key={product.id}>
						<h3>{product.name}</h3>
						<p>${product.price}</p>
					</li>
				))}
			</ul>
		</div>
	);
};

export default ProductsList;
```

## Application Setup

```jsx
// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import store from './store';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</Provider>
	</React.StrictMode>
);
```

## Best Practices

1. **Use Redux Toolkit**

    - Simplifies store setup and reduces boilerplate
    - Includes utilities for common patterns
    - Enforces Redux best practices

2. **Follow the Ducks Pattern**

    - Group related actions, reducers, and selectors by feature
    - Use Redux Toolkit's `createSlice` to define reducers and actions together

3. **Keep Reducers Pure**

    - Reducers should be pure functions without side effects
    - Use middleware like Thunks for side effects (API calls, etc.)

4. **Normalize Complex State**

    - Use a normalized state structure for collections of items
    - Consider using `createEntityAdapter` for CRUD operations

5. **Use Selectors for Data Access**

    - Create selector functions to access state
    - Use `reselect` for memoized selectors to optimize performance

6. **Typescript Integration**

    - Define types for state and actions
    - Use typed hooks (`useAppDispatch`, `useAppSelector`)

7. **Testing**
    - Test reducers as pure functions
    - Test selectors with known state
    - Use mock store for testing connected components

## When to Use Redux

Redux is most beneficial in the following scenarios:

-   Complex applications with significant state management needs
-   Large applications where state is shared across many components
-   Applications with complex state transitions and side effects
-   Apps that need time-travel debugging
-   When you need a single source of truth for application state

For smaller applications or when you only need local state, consider using React's built-in state management (useState, useReducer, Context API) instead.
