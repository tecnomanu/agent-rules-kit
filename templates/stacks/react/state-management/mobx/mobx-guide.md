# MobX State Management in React

MobX is a state management library that makes managing application state simple and scalable by applying object-oriented programming principles and reactive programming.

## Core Concepts

1. **Observable State**: Data that can be tracked for changes
2. **Actions**: Methods that modify observable state
3. **Computed Values**: Values derived from observable state that auto-update
4. **Reactions**: Side-effects that execute when observed data changes
5. **Stores**: Classes/objects that contain state and logic

## Directory Structure

```
src/
├── stores/
│   ├── index.js                  # Exports all stores and RootStore
│   ├── RootStore.js              # Optional: combines all stores
│   ├── UserStore.js              # User-related state and operations
│   └── ProductStore.js           # Product-related state and operations
├── hooks/
│   └── useStores.js              # Hook for accessing stores
├── contexts/
│   └── StoreContext.js           # React context for providing stores
└── components/
    ├── UserProfile.jsx           # Component that uses UserStore
    ├── ProductList.jsx           # Component that uses ProductStore
    └── ShoppingCart.jsx          # Component that uses multiple stores
```

## Implementation

### Setting Up MobX

First, install the required packages:

```bash
npm install mobx mobx-react-lite
# or with yarn
yarn add mobx mobx-react-lite
```

### Store Implementation

```javascript
// stores/UserStore.js
import { makeAutoObservable, runInAction } from 'mobx';
import authService from '../services/authService';

class UserStore {
	user = null;
	isAuthenticated = false;
	isLoading = false;
	error = null;

	constructor(rootStore) {
		// Optional: Keep reference to root store for cross-store interactions
		this.rootStore = rootStore;

		// Make all properties observable, actions auto-bound, and enable computeds
		makeAutoObservable(this);

		// Check for saved authentication
		this.checkAuth();
	}

	// Actions to modify state

	setUser(user) {
		this.user = user;
		this.isAuthenticated = !!user;
	}

	setLoading(state) {
		this.isLoading = state;
	}

	setError(error) {
		this.error = error;
	}

	resetError() {
		this.error = null;
	}

	// Async actions

	async login(credentials) {
		this.setLoading(true);
		this.resetError();

		try {
			const user = await authService.login(credentials);

			// Use runInAction for batch updates after async operation
			runInAction(() => {
				this.setUser(user);
				this.setLoading(false);
			});

			return user;
		} catch (error) {
			runInAction(() => {
				this.setError(error.message);
				this.setLoading(false);
			});

			throw error;
		}
	}

	async logout() {
		this.setLoading(true);

		try {
			await authService.logout();

			runInAction(() => {
				this.setUser(null);
				this.setLoading(false);
			});
		} catch (error) {
			runInAction(() => {
				this.setError(error.message);
				this.setLoading(false);
			});

			throw error;
		}
	}

	async checkAuth() {
		const savedUser = localStorage.getItem('user');

		if (savedUser) {
			try {
				const user = JSON.parse(savedUser);
				this.setUser(user);
			} catch (e) {
				localStorage.removeItem('user');
			}
		}
	}

	// Computed values

	get firstName() {
		return this.user ? this.user.firstName : '';
	}

	get lastName() {
		return this.user ? this.user.lastName : '';
	}

	get fullName() {
		return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
	}
}

export default UserStore;
```

```javascript
// stores/ProductStore.js
import { makeAutoObservable, runInAction } from 'mobx';
import productService from '../services/productService';

class ProductStore {
	products = [];
	selectedProduct = null;
	isLoading = false;
	error = null;

	constructor(rootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
	}

	// Actions

	setProducts(products) {
		this.products = products;
	}

	setSelectedProduct(product) {
		this.selectedProduct = product;
	}

	setLoading(state) {
		this.isLoading = state;
	}

	setError(error) {
		this.error = error;
	}

	resetError() {
		this.error = null;
	}

	// Async actions

	async fetchProducts() {
		this.setLoading(true);
		this.resetError();

		try {
			const products = await productService.getAll();

			runInAction(() => {
				this.setProducts(products);
				this.setLoading(false);
			});

			return products;
		} catch (error) {
			runInAction(() => {
				this.setError(error.message);
				this.setLoading(false);
			});

			throw error;
		}
	}

	async fetchProductById(id) {
		this.setLoading(true);
		this.resetError();

		try {
			const product = await productService.getById(id);

			runInAction(() => {
				this.setSelectedProduct(product);
				this.setLoading(false);
			});

			return product;
		} catch (error) {
			runInAction(() => {
				this.setError(error.message);
				this.setLoading(false);
			});

			throw error;
		}
	}

	// Computed values

	get productCount() {
		return this.products.length;
	}

	get totalValue() {
		return this.products.reduce((sum, product) => sum + product.price, 0);
	}

	get productsByCategory() {
		const categories = {};

		this.products.forEach((product) => {
			if (!categories[product.category]) {
				categories[product.category] = [];
			}

			categories[product.category].push(product);
		});

		return categories;
	}
}

export default ProductStore;
```

### Root Store (Optional but recommended)

```javascript
// stores/RootStore.js
import UserStore from './UserStore';
import ProductStore from './ProductStore';
import CartStore from './CartStore';

class RootStore {
	constructor() {
		// Initialize all stores with the root store instance
		this.userStore = new UserStore(this);
		this.productStore = new ProductStore(this);
		this.cartStore = new CartStore(this);
	}
}

export default RootStore;
```

```javascript
// stores/index.js
import RootStore from './RootStore';

// Create a single root store instance
const rootStore = new RootStore();

// Export individual stores for convenience
export const userStore = rootStore.userStore;
export const productStore = rootStore.productStore;
export const cartStore = rootStore.cartStore;

// Export the root store to access all stores
export default rootStore;
```

### Store Provider Context

```javascript
// contexts/StoreContext.js
import React, { createContext, useContext } from 'react';
import rootStore from '../stores';

// Create a context with the root store
const StoreContext = createContext(rootStore);

// Provider component
export const StoreProvider = ({ children }) => {
	return (
		<StoreContext.Provider value={rootStore}>
			{children}
		</StoreContext.Provider>
	);
};

// Hook to use the store context
export const useStores = () => {
	const context = useContext(StoreContext);

	if (context === undefined) {
		throw new Error('useStores must be used within a StoreProvider');
	}

	return context;
};

// Hooks for individual stores
export const useUserStore = () => {
	const { userStore } = useStores();
	return userStore;
};

export const useProductStore = () => {
	const { productStore } = useStores();
	return productStore;
};

export const useCartStore = () => {
	const { cartStore } = useStores();
	return cartStore;
};
```

### Application Setup

```jsx
// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StoreProvider } from './contexts/StoreContext';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<StoreProvider>
			<App />
		</StoreProvider>
	</React.StrictMode>
);
```

### Component Usage

```jsx
// components/LoginForm.jsx
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useUserStore } from '../contexts/StoreContext';

const LoginForm = observer(() => {
	const userStore = useUserStore();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await userStore.login({ email, password });
			// Redirect or show success message
		} catch (error) {
			// Error is handled by the store and displayed below
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			{userStore.error && (
				<div className='error-message'>{userStore.error}</div>
			)}

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

			<button type='submit' disabled={userStore.isLoading}>
				{userStore.isLoading ? 'Logging in...' : 'Login'}
			</button>
		</form>
	);
});

export default LoginForm;
```

```jsx
// components/ProductList.jsx
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useProductStore } from '../contexts/StoreContext';
import { useCartStore } from '../contexts/StoreContext';

const ProductList = observer(() => {
	const productStore = useProductStore();
	const cartStore = useCartStore();

	useEffect(() => {
		// Load products when component mounts
		productStore.fetchProducts();
	}, [productStore]);

	if (productStore.isLoading) {
		return <div>Loading products...</div>;
	}

	if (productStore.error) {
		return <div>Error: {productStore.error}</div>;
	}

	return (
		<div className='product-list'>
			<h2>Products ({productStore.productCount})</h2>

			{productStore.products.length === 0 ? (
				<p>No products available.</p>
			) : (
				<ul>
					{productStore.products.map((product) => (
						<li key={product.id} className='product-item'>
							<h3>{product.name}</h3>
							<p>${product.price}</p>
							<button
								onClick={() => cartStore.addToCart(product)}
								disabled={cartStore.isItemInCart(product.id)}>
								{cartStore.isItemInCart(product.id)
									? 'In Cart'
									: 'Add to Cart'}
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
});

export default ProductList;
```

## Advanced MobX Patterns

### 1. Reactions

```javascript
// Example reaction in a component
import { reaction } from 'mobx';
import { useEffect } from 'react';
import { useCartStore } from '../contexts/StoreContext';

const CartNotification = () => {
	const cartStore = useCartStore();

	useEffect(() => {
		// Set up a reaction that triggers when cart items change
		const disposeReaction = reaction(
			// Track the cart items length
			() => cartStore.items.length,
			// React to the changes
			(length, previousLength) => {
				if (length > previousLength) {
					showNotification('Item added to cart');
				} else if (length < previousLength) {
					showNotification('Item removed from cart');
				}
			}
		);

		// Clean up the reaction when component unmounts
		return () => {
			disposeReaction();
		};
	}, [cartStore]);

	// Component rendering
	return null; // This component doesn't render anything visible
};

function showNotification(message) {
	// Implementation of notification system
	console.log(message);
}
```

### 2. Using Multiple Stores

```jsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useUserStore, useCartStore } from '../contexts/StoreContext';

const Header = observer(() => {
  const userStore = useUserStore();
  const cartStore = useCartStore();

  return (
    <header className="app-header">
      <div className="logo">My Store</div>

      <div className="user-section">
        {userStore.isAuthenticated ? (
          <>
            <span>Welcome, {userStore.fullName}</span>
            <button onClick={() => userStore.logout()}>Logout</button>
          </>
        ) : (
          <button onClick={() => /* navigate to login */}>Login</button>
        )}
      </div>

      <div className="cart-section">
        <button>
          Cart ({cartStore.itemCount}) - ${cartStore.totalPrice}
        </button>
      </div>
    </header>
  );
});

export default Header;
```

### 3. Local Component State with MobX

```jsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { makeAutoObservable } from 'mobx';

// Local component store
class FormState {
	firstName = '';
	lastName = '';
	email = '';
	errors = {};

	constructor() {
		makeAutoObservable(this);
	}

	setField(field, value) {
		this[field] = value;
		// Clear error when field is edited
		if (this.errors[field]) {
			delete this.errors[field];
		}
	}

	validate() {
		const errors = {};

		if (!this.firstName) errors.firstName = 'First name is required';
		if (!this.lastName) errors.lastName = 'Last name is required';
		if (!this.email) {
			errors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(this.email)) {
			errors.email = 'Email is invalid';
		}

		this.errors = errors;
		return Object.keys(errors).length === 0;
	}

	get isValid() {
		return Object.keys(this.errors).length === 0;
	}

	get formData() {
		return {
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
		};
	}
}

const RegistrationForm = observer(() => {
	// Create local store for form
	const [formState] = React.useState(() => new FormState());

	const handleSubmit = (e) => {
		e.preventDefault();

		if (formState.validate()) {
			console.log('Form submitted:', formState.formData);
			// Submit to server or global store
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className='form-group'>
				<label htmlFor='firstName'>First Name</label>
				<input
					id='firstName'
					value={formState.firstName}
					onChange={(e) =>
						formState.setField('firstName', e.target.value)
					}
				/>
				{formState.errors.firstName && (
					<div className='error'>{formState.errors.firstName}</div>
				)}
			</div>

			<div className='form-group'>
				<label htmlFor='lastName'>Last Name</label>
				<input
					id='lastName'
					value={formState.lastName}
					onChange={(e) =>
						formState.setField('lastName', e.target.value)
					}
				/>
				{formState.errors.lastName && (
					<div className='error'>{formState.errors.lastName}</div>
				)}
			</div>

			<div className='form-group'>
				<label htmlFor='email'>Email</label>
				<input
					id='email'
					type='email'
					value={formState.email}
					onChange={(e) =>
						formState.setField('email', e.target.value)
					}
				/>
				{formState.errors.email && (
					<div className='error'>{formState.errors.email}</div>
				)}
			</div>

			<button type='submit' disabled={!formState.isValid}>
				Register
			</button>
		</form>
	);
});

export default RegistrationForm;
```

## Best Practices

1. **Stores Structure**

    - Create separate stores for different domains
    - Use a root store to provide reference between stores
    - Compose stores based on functionality

2. **State Mutation**

    - Only modify state inside actions
    - Use runInAction for updates after async operations
    - Keep derivations and side effects separate from state changes

3. **Computed Properties**

    - Use computed values for derived state
    - Keep computeds pure and focused on a single responsibility
    - Memoize complex calculations with computed properties

4. **Typescript Integration**

    - Define interfaces for store state
    - Type your actions and computed properties
    - Use strict mode to catch errors early

5. **Performance Considerations**

    - Use @observer on the lowest possible component level
    - Split complex components into smaller observed parts
    - Use @computed to memoize expensive calculations

6. **Testing**
    - Test stores in isolation
    - Mock dependencies (API services, etc.)
    - Test reactions and side effects

## MobX vs. Redux

### When to Choose MobX

MobX is often a better choice when:

-   You prefer a more object-oriented approach
-   You want simpler, less boilerplate code
-   Your state is complex and deeply nested
-   You want a more flexible, less opinionated structure
-   You're building a smaller to medium-sized application
-   You want to iterate quickly with less setup

### When to Choose Redux

Redux might be better when:

-   You want predictable state management with a strict unidirectional data flow
-   You need time-travel debugging or state snapshots
-   You prefer explicit, traceable state changes
-   Your team is more familiar with functional programming concepts
-   You're building a very large application with complex state changes
-   You want more established patterns and guidelines
