# Zustand State Management in React

Zustand (German for "state") is a small, fast, and scalable state-management solution for React. It uses a simplified flux-like store pattern with hooks, making it both powerful and easy to use.

## Core Concepts

1. **Store**: A hook-based store containing state and actions
2. **Selectors**: Functions to extract specific pieces of state
3. **Actions**: Functions that modify state
4. **Middlewares**: Enhancers that add functionality to stores
5. **Immutability**: All state updates are immutable

## Key Advantages

-   **Minimal API**: Learn the entire API in minutes
-   **No Boilerplate**: No reducers, action types, or dispatchers
-   **No Context Providers**: Direct store consumption without providers
-   **No Re-renders**: Subscribes to state portions, not the entire store
-   **Middleware**: Includes devtools, persistence, and immer integration

## Directory Structure

```
src/
├── stores/
│   ├── index.js                   # Exports all stores (optional)
│   ├── useAuthStore.js            # Authentication store
│   ├── useCartStore.js            # Shopping cart store
│   └── useSettingsStore.js        # Application settings store
└── components/
    ├── LoginForm.jsx              # Uses auth store
    ├── ShoppingCart.jsx           # Uses cart store
    └── ThemeToggle.jsx            # Uses settings store
```

## Setup and Installation

Install Zustand:

```bash
npm install zustand
# or with yarn
yarn add zustand
```

## Basic Implementation

### Creating a Store

```javascript
// stores/useCounterStore.js
import create from 'zustand';

// Create a store
const useCounterStore = create((set) => ({
	// Initial state
	count: 0,

	// Actions (functions that modify state)
	increment: () => set((state) => ({ count: state.count + 1 })),
	decrement: () => set((state) => ({ count: state.count - 1 })),
	reset: () => set({ count: 0 }),
	incrementBy: (amount) => set((state) => ({ count: state.count + amount })),
}));

export default useCounterStore;
```

### Using the Store in Components

```jsx
// components/Counter.jsx
import React from 'react';
import useCounterStore from '../stores/useCounterStore';

const Counter = () => {
	// Extract only what you need (components will only re-render when these values change)
	const count = useCounterStore((state) => state.count);
	const { increment, decrement, reset } = useCounterStore((state) => ({
		increment: state.increment,
		decrement: state.decrement,
		reset: state.reset,
	}));

	return (
		<div>
			<h2>Count: {count}</h2>
			<button onClick={increment}>Increment</button>
			<button onClick={decrement}>Decrement</button>
			<button onClick={reset}>Reset</button>
		</div>
	);
};

export default Counter;
```

## Advanced Patterns

### Async Actions

```javascript
// stores/useTodoStore.js
import create from 'zustand';

const useTodoStore = create((set, get) => ({
	todos: [],
	isLoading: false,
	error: null,

	// Synchronous actions
	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),
	setTodos: (todos) => set({ todos }),

	// Asynchronous action
	fetchTodos: async () => {
		try {
			set({ isLoading: true, error: null });
			const response = await fetch(
				'https://jsonplaceholder.typicode.com/todos'
			);
			const todos = await response.json();
			set({ todos, isLoading: false });
		} catch (error) {
			set({ error: error.message, isLoading: false });
		}
	},

	addTodo: async (title) => {
		try {
			set({ isLoading: true, error: null });
			const response = await fetch(
				'https://jsonplaceholder.typicode.com/todos',
				{
					method: 'POST',
					body: JSON.stringify({
						title,
						completed: false,
						userId: 1,
					}),
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
					},
				}
			);
			const newTodo = await response.json();

			// Update the local state with the new todo
			set((state) => ({
				todos: [...state.todos, newTodo],
				isLoading: false,
			}));
		} catch (error) {
			set({ error: error.message, isLoading: false });
		}
	},

	toggleTodo: (id) => {
		set((state) => ({
			todos: state.todos.map((todo) =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo
			),
		}));
	},
}));

export default useTodoStore;
```

### Using the Todo Store

```jsx
// components/TodoList.jsx
import React, { useEffect, useState } from 'react';
import useTodoStore from '../stores/useTodoStore';

const TodoList = () => {
	const [newTodoTitle, setNewTodoTitle] = useState('');

	// Extract state and actions
	const { todos, isLoading, error, fetchTodos, addTodo, toggleTodo } =
		useTodoStore();

	// Load todos on component mount
	useEffect(() => {
		fetchTodos();
	}, [fetchTodos]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!newTodoTitle.trim()) return;

		addTodo(newTodoTitle);
		setNewTodoTitle('');
	};

	if (isLoading && todos.length === 0) {
		return <div>Loading todos...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div>
			<h2>Todo List</h2>

			<form onSubmit={handleSubmit}>
				<input
					type='text'
					value={newTodoTitle}
					onChange={(e) => setNewTodoTitle(e.target.value)}
					placeholder='Add a new todo'
				/>
				<button type='submit' disabled={isLoading}>
					{isLoading ? 'Adding...' : 'Add Todo'}
				</button>
			</form>

			<ul>
				{todos.map((todo) => (
					<li
						key={todo.id}
						style={{
							textDecoration: todo.completed
								? 'line-through'
								: 'none',
							cursor: 'pointer',
						}}
						onClick={() => toggleTodo(todo.id)}>
						{todo.title}
					</li>
				))}
			</ul>
		</div>
	);
};

export default TodoList;
```

## Middleware

### 1. Using Immer for Simplified State Updates

Immer allows you to write "mutative" code while maintaining immutability:

```javascript
// stores/useUserStore.js
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useUserStore = create(
	immer((set) => ({
		users: [],
		selectedUserId: null,

		addUser: (user) =>
			set((state) => {
				// "Mutate" the state directly - Immer handles immutability
				state.users.push(user);
			}),

		updateUser: (userId, updates) =>
			set((state) => {
				const userIndex = state.users.findIndex(
					(user) => user.id === userId
				);
				if (userIndex !== -1) {
					// Direct "mutation" is safe with Immer
					Object.assign(state.users[userIndex], updates);
				}
			}),

		deleteUser: (userId) =>
			set((state) => {
				const userIndex = state.users.findIndex(
					(user) => user.id === userId
				);
				if (userIndex !== -1) {
					state.users.splice(userIndex, 1);
				}

				// Reset selectedUserId if it's the deleted user
				if (state.selectedUserId === userId) {
					state.selectedUserId = null;
				}
			}),

		selectUser: (userId) =>
			set((state) => {
				state.selectedUserId = userId;
			}),
	}))
);

export default useUserStore;
```

### 2. Persistence Middleware

Save and load state from localStorage:

```javascript
// stores/useSettingsStore.js
import create from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
	persist(
		(set) => ({
			theme: 'light',
			fontSize: 'medium',
			notifications: true,

			setTheme: (theme) => set({ theme }),
			setFontSize: (fontSize) => set({ fontSize }),
			toggleNotifications: () =>
				set((state) => ({
					notifications: !state.notifications,
				})),

			resetSettings: () =>
				set({
					theme: 'light',
					fontSize: 'medium',
					notifications: true,
				}),
		}),
		{
			name: 'app-settings', // unique name for localStorage
			getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
		}
	)
);

export default useSettingsStore;
```

### 3. Redux DevTools Integration

```javascript
// stores/useCartStore.js
import create from 'zustand';
import { devtools } from 'zustand/middleware';

const useCartStore = create(
	devtools(
		(set) => ({
			items: [],
			totalItems: 0,
			totalPrice: 0,

			addItem: (item) =>
				set((state) => {
					const existingItem = state.items.find(
						(i) => i.id === item.id
					);

					const newItems = existingItem
						? state.items.map((i) =>
								i.id === item.id
									? { ...i, quantity: i.quantity + 1 }
									: i
						  )
						: [...state.items, { ...item, quantity: 1 }];

					return {
						items: newItems,
						totalItems: state.totalItems + 1,
						totalPrice: state.totalPrice + item.price,
					};
				}),

			removeItem: (itemId) =>
				set((state) => {
					const item = state.items.find((i) => i.id === itemId);
					if (!item) return state;

					const newItems = state.items.filter((i) => i.id !== itemId);

					return {
						items: newItems,
						totalItems: state.totalItems - item.quantity,
						totalPrice:
							state.totalPrice - item.price * item.quantity,
					};
				}),

			clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
		}),
		{
			name: 'cart-store', // unique name for Redux DevTools
		}
	)
);

export default useCartStore;
```

### 4. Combining Multiple Middleware

```javascript
// stores/useAuthStore.js
import create from 'zustand';
import { devtools, persist, immer } from 'zustand/middleware';

// Combine multiple middlewares
const useAuthStore = create(
	devtools(
		persist(
			immer((set) => ({
				user: null,
				token: null,
				isAuthenticated: false,

				login: (userData, token) =>
					set((state) => {
						state.user = userData;
						state.token = token;
						state.isAuthenticated = true;
					}),

				logout: () =>
					set((state) => {
						state.user = null;
						state.token = null;
						state.isAuthenticated = false;
					}),

				updateProfile: (updates) =>
					set((state) => {
						if (state.user) {
							Object.assign(state.user, updates);
						}
					}),
			})),
			{
				name: 'auth-storage',
				getStorage: () => localStorage,
			}
		),
		{
			name: 'auth-store',
		}
	)
);

export default useAuthStore;
```

## Advanced Usage

### 1. Computed Values (Selectors)

```javascript
// Using derived values with selectors
import useCartStore from '../stores/useCartStore';

const CartSummary = () => {
	// Derive discounted price based on cart total
	const { items, totalPrice, totalItems } = useCartStore();

	// Compute values
	const discountRate = totalPrice > 100 ? 0.1 : 0;
	const discount = totalPrice * discountRate;
	const finalPrice = totalPrice - discount;

	return (
		<div className='cart-summary'>
			<h3>Cart Summary</h3>
			<p>Items: {totalItems}</p>
			<p>Subtotal: ${totalPrice.toFixed(2)}</p>
			{discount > 0 && <p>Discount: -${discount.toFixed(2)}</p>}
			<p className='final-price'>Total: ${finalPrice.toFixed(2)}</p>
		</div>
	);
};
```

### 2. Combining Multiple Stores

```javascript
// components/Checkout.jsx
import React from 'react';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import useSettingsStore from '../stores/useSettingsStore';

const Checkout = () => {
	// Get values from different stores
	const { items, totalPrice, clearCart } = useCartStore();
	const { user, isAuthenticated } = useAuthStore();
	const { theme } = useSettingsStore();

	const handleCheckout = () => {
		if (!isAuthenticated) {
			alert('Please log in to checkout');
			return;
		}

		// Process checkout...
		alert(`Processing checkout for ${user.name} with total $${totalPrice}`);
		clearCart();
	};

	return (
		<div className={`checkout-container ${theme}`}>
			<h2>Checkout</h2>

			{isAuthenticated ? (
				<div className='user-info'>
					<p>Shipping to: {user.name}</p>
					<p>Email: {user.email}</p>
				</div>
			) : (
				<p>Please log in to checkout</p>
			)}

			<div className='cart-items'>
				{items.map((item) => (
					<div key={item.id} className='checkout-item'>
						<span>
							{item.name} x {item.quantity}
						</span>
						<span>${(item.price * item.quantity).toFixed(2)}</span>
					</div>
				))}
			</div>

			<div className='total'>
				<h3>Total: ${totalPrice.toFixed(2)}</h3>
			</div>

			<button
				onClick={handleCheckout}
				disabled={!isAuthenticated || items.length === 0}>
				Complete Purchase
			</button>
		</div>
	);
};

export default Checkout;
```

### 3. Store Factory Pattern

When you need multiple instances of similar stores:

```javascript
// stores/createListStore.js
import create from 'zustand';

// Store factory function
const createListStore = (name) => {
	return create((set) => ({
		items: [],

		add: (item) =>
			set((state) => ({
				items: [...state.items, item],
			})),

		remove: (id) =>
			set((state) => ({
				items: state.items.filter((item) => item.id !== id),
			})),

		clear: () => set({ items: [] }),

		// Store metadata
		name,
		createdAt: new Date().toISOString(),
	}));
};

export default createListStore;
```

```javascript
// Use the factory to create different stores
const useTaskListStore = createListStore('tasks');
const useShoppingListStore = createListStore('shopping');
const useBookmarksStore = createListStore('bookmarks');

// Usage in components
const TaskList = () => {
	const { items, add, remove } = useTaskListStore();
	// ...
};
```

## TypeScript Integration

```typescript
// stores/useCartStore.ts
import create from 'zustand';

// Define types
export interface Product {
	id: string;
	name: string;
	price: number;
	image?: string;
}

export interface CartItem extends Product {
	quantity: number;
}

interface CartState {
	items: CartItem[];
	totalItems: number;
	totalPrice: number;

	// Actions
	addItem: (product: Product) => void;
	removeItem: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
}

// Create typed store
const useCartStore = create<CartState>((set) => ({
	items: [],
	totalItems: 0,
	totalPrice: 0,

	addItem: (product) =>
		set((state) => {
			const existingItem = state.items.find(
				(item) => item.id === product.id
			);

			if (existingItem) {
				const updatedItems = state.items.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				);

				return {
					items: updatedItems,
					totalItems: state.totalItems + 1,
					totalPrice: state.totalPrice + product.price,
				};
			} else {
				const newItem = { ...product, quantity: 1 };

				return {
					items: [...state.items, newItem],
					totalItems: state.totalItems + 1,
					totalPrice: state.totalPrice + product.price,
				};
			}
		}),

	removeItem: (productId) =>
		set((state) => {
			const existingItem = state.items.find(
				(item) => item.id === productId
			);

			if (!existingItem) return state;

			return {
				items: state.items.filter((item) => item.id !== productId),
				totalItems: state.totalItems - existingItem.quantity,
				totalPrice:
					state.totalPrice -
					existingItem.price * existingItem.quantity,
			};
		}),

	updateQuantity: (productId, quantity) =>
		set((state) => {
			const existingItem = state.items.find(
				(item) => item.id === productId
			);

			if (!existingItem) return state;

			// Calculate the difference in quantity
			const quantityDiff = quantity - existingItem.quantity;

			const updatedItems = state.items.map((item) =>
				item.id === productId ? { ...item, quantity } : item
			);

			return {
				items: updatedItems,
				totalItems: state.totalItems + quantityDiff,
				totalPrice:
					state.totalPrice + existingItem.price * quantityDiff,
			};
		}),

	clearCart: () =>
		set({
			items: [],
			totalItems: 0,
			totalPrice: 0,
		}),
}));

export default useCartStore;
```

## Best Practices

### 1. Store Organization

-   **Single Responsibility**: Each store should focus on a specific domain
-   **Atomic Stores**: Keep stores small and focused
-   **Naming Convention**: Use `use*Store` naming for consistency
-   **Action Naming**: Use clear action names (add*, remove*, update*, set*, toggle\*, etc.)

### 2. Performance Optimization

-   **Selective State Subscription**: Extract only what you need from the store
-   **Memoization**: Use memoized selectors for derived state
-   **Shallow Equality**: Zustand uses shallow equality by default
-   **Avoid Large Stores**: Split large stores into smaller domain-specific ones

```javascript
// BAD: Will re-render on ANY state change
const { users, posts, comments } = useStore();

// GOOD: Will only re-render when these specific values change
const users = useStore((state) => state.users);
const posts = useStore((state) => state.posts);
```

### 3. Combining with React Hooks

```javascript
// Custom hook combining Zustand with React's useState
import { useState, useEffect } from 'react';
import useAuthStore from '../stores/useAuthStore';

export function useLoginForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errors, setErrors] = useState({});

	const { login, isLoading, error } = useAuthStore();

	// Reset errors when form changes
	useEffect(() => {
		setErrors({});
	}, [email, password]);

	// Sync with store errors
	useEffect(() => {
		if (error) {
			setErrors({ form: error });
		}
	}, [error]);

	const validate = () => {
		const newErrors = {};

		if (!email) newErrors.email = 'Email is required';
		if (!password) newErrors.password = 'Password is required';

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validate()) return;

		try {
			await login(email, password);
			// Clear form on success
			setEmail('');
			setPassword('');
		} catch (err) {
			// Login errors handled in the store
		}
	};

	return {
		email,
		setEmail,
		password,
		setPassword,
		errors,
		isLoading,
		handleSubmit,
	};
}
```

### 4. Testing Zustand Stores

```javascript
// tests/todoStore.test.js
import { beforeEach, describe, expect, it } from 'vitest';
import useTodoStore from '../src/stores/useTodoStore';

// Reset the store before each test
beforeEach(() => {
	useTodoStore.setState({
		todos: [],
		isLoading: false,
		error: null,
	});
});

describe('Todo Store', () => {
	it('should add a todo', () => {
		// Get initial state
		expect(useTodoStore.getState().todos).toEqual([]);

		// Call the action
		useTodoStore.getState().addTodo({
			id: '1',
			title: 'Test Todo',
			completed: false,
		});

		// Assert the new state
		expect(useTodoStore.getState().todos).toEqual([
			{
				id: '1',
				title: 'Test Todo',
				completed: false,
			},
		]);
	});

	it('should toggle a todo', () => {
		// Setup
		useTodoStore.setState({
			todos: [
				{
					id: '1',
					title: 'Test Todo',
					completed: false,
				},
			],
		});

		// Action
		useTodoStore.getState().toggleTodo('1');

		// Assert
		expect(useTodoStore.getState().todos[0].completed).toBe(true);
	});

	it('should handle errors during fetch', async () => {
		// Mock fetch to throw an error
		global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

		// Action
		await useTodoStore.getState().fetchTodos();

		// Assert
		expect(useTodoStore.getState().error).toBe('Network error');
		expect(useTodoStore.getState().isLoading).toBe(false);
	});
});
```

## When to Choose Zustand

Zustand is an excellent choice when:

-   You want a minimal, hook-based state management solution
-   You need something simpler than Redux but more powerful than Context API
-   You prefer direct store access without providers
-   Performance and bundle size are concerns
-   You value minimal boilerplate and API simplicity

Zustand may not be the best fit when:

-   You need a more established ecosystem with extensive middleware and patterns
-   You require strict enforcement of unidirectional data flow
-   Your team is already familiar and productive with Redux
-   You need extensive time-travel debugging capabilities

## Comparison with Other Libraries

### Zustand vs. Redux

-   **API**: Zustand has a simpler, hook-based API with less boilerplate
-   **Bundle Size**: Zustand is much smaller (2KB vs Redux + React-Redux at 10KB+)
-   **Provider Requirement**: Zustand doesn't need providers
-   **Middleware**: Both support middleware, but Redux has more options
-   **Learning Curve**: Zustand is easier to learn

### Zustand vs. Context API

-   **Performance**: Zustand has better performance for frequent updates
-   **Boilerplate**: Zustand requires less code than Context + useReducer
-   **Provider Nesting**: No provider hell with Zustand
-   **Features**: Zustand offers more features (middleware, devtools, etc.)

### Zustand vs. MobX

-   **Paradigm**: Zustand is more functional, MobX is more object-oriented
-   **Learning Curve**: Zustand is simpler to learn
-   **Reactivity Model**: MobX uses observables, Zustand uses subscriptions
-   **Bundle Size**: Zustand is smaller
-   **Flexibility**: Both are flexible, but Zustand is more explicit
