---
description: Feature-Sliced Design architecture for React applications
globs: '<root>/src/**/*.{ts,tsx,js,jsx}'
alwaysApply: false
---

# Feature Sliced Design Architecture in React

Feature Sliced Design (FSD) is a methodology for organizing code in frontend applications by features and layers, emphasizing isolation, domain-driven structure, and explicit relationships between modules.

## Core Principles

1. **Feature-Based Organization**: Code is organized by features or business domains
2. **Slice-Based Decomposition**: Features are divided into self-contained slices
3. **Layer-Based Segmentation**: Code within slices is organized by layers (UI, logic, etc.)
4. **Public API Boundaries**: Modules expose only what's necessary via public APIs

## Layers Hierarchy

FSD organizes code into layers, with each higher layer able to use modules from lower layers:

1. **app** - Application initialization, global providers, styles
2. **processes** - Complex workflows involving multiple entities/features
3. **pages** - Application route components
4. **widgets** - Complex, composite components for specific business scenarios
5. **features** - User interactions that change business data/logic
6. **entities** - Core business objects with logic and data
7. **shared** - Reusable utilities, UI kit, types, etc.

## Directory Structure

```
src/
├── app/                    # Application setup
│   ├── providers/          # Application providers
│   ├── styles/             # Global styles
│   └── index.tsx           # Entry point
├── processes/              # Cross-feature processes
│   ├── authentication/     # Auth process
│   └── payment/            # Payment process
├── pages/                  # Routes/pages
│   ├── home/
│   ├── profile/
│   └── dashboard/
├── widgets/                # Composite blocks
│   ├── header/
│   ├── sidebar/
│   └── product-card/
├── features/               # User interactions
│   ├── auth/
│   │   ├── login/
│   │   ├── logout/
│   │   └── register/
│   ├── cart/
│   │   ├── add-to-cart/
│   │   └── remove-from-cart/
│   └── product/
│       ├── filter-products/
│       └── sort-products/
├── entities/               # Business entities
│   ├── user/
│   ├── product/
│   └── order/
└── shared/                 # Shared utilities
    ├── api/                # API clients
    ├── config/             # Configuration
    ├── lib/                # External libraries
    └── ui/                 # UI kit
```

## Segment Structure

Each segment (feature, entity, etc.) follows a consistent structure:

```
feature/
├── ui/           # UI components
├── model/        # Business logic (state, actions, selectors)
├── api/          # HTTP calls, WebSocket, etc.
├── lib/          # Utilities, helpers
└── index.ts      # Public API
```

## Implementation Guidelines

### 1. Shared Layer

```tsx
// shared/ui/button/button.tsx
import React from 'react';
import './button.css';

type ButtonProps = {
	variant?: 'primary' | 'secondary' | 'ghost';
	size?: 'small' | 'medium' | 'large';
	children: React.ReactNode;
	onClick?: () => void;
};

export const Button = ({
	variant = 'primary',
	size = 'medium',
	children,
	onClick,
	...props
}: ButtonProps) => {
	return (
		<button
			className={`button button--${variant} button--${size}`}
			onClick={onClick}
			{...props}>
			{children}
		</button>
	);
};
```

-   Keep components generic and reusable
-   Avoid business logic
-   Export via a public API

### 2. Entity Layer

```tsx
// entities/product/model/types.ts
export interface Product {
	id: string;
	title: string;
	description: string;
	price: number;
	imageUrl: string;
}

// entities/product/api/productApi.ts
import { Product } from '../model/types';

export const fetchProducts = async (): Promise<Product[]> => {
	const response = await fetch('/api/products');
	return response.json();
};

// entities/product/ui/product-card/index.tsx
import React from 'react';
import { Product } from '../../model/types';
import './product-card.css';

interface ProductCardProps {
	product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
	return (
		<div className='product-card'>
			<img src={product.imageUrl} alt={product.title} />
			<h3>{product.title}</h3>
			<p className='product-card__price'>${product.price}</p>
		</div>
	);
};

// entities/product/index.ts
export { ProductCard } from './ui/product-card';
export { fetchProducts } from './api/productApi';
export type { Product } from './model/types';
```

-   Focus on core business entities
-   Export a clear public API
-   Avoid dependencies on features or higher layers

### 3. Feature Layer

```tsx
// features/cart/add-to-cart/ui/add-to-cart-button.tsx
import React from 'react';
import { Button } from 'shared/ui/button';
import { useAddToCart } from '../model/useAddToCart';
import { Product } from 'entities/product';

interface AddToCartButtonProps {
	product: Product;
}

export const AddToCartButton = ({ product }: AddToCartButtonProps) => {
	const { addToCart, isLoading } = useAddToCart();

	const handleClick = () => {
		addToCart(product);
	};

	return (
		<Button onClick={handleClick} disabled={isLoading}>
			{isLoading ? 'Adding...' : 'Add to Cart'}
		</Button>
	);
};

// features/cart/add-to-cart/model/useAddToCart.ts
import { useState } from 'react';
import { Product } from 'entities/product';
import { addProductToCart } from '../api/cartApi';

export const useAddToCart = () => {
	const [isLoading, setIsLoading] = useState(false);

	const addToCart = async (product: Product) => {
		setIsLoading(true);
		try {
			await addProductToCart(product.id);
			// Handle success
		} catch (error) {
			// Handle error
			console.error('Failed to add to cart', error);
		} finally {
			setIsLoading(false);
		}
	};

	return { addToCart, isLoading };
};

// features/cart/add-to-cart/index.ts
export { AddToCartButton } from './ui/add-to-cart-button';
```

-   Implement user interactions
-   Use entities but don't modify them directly
-   Encapsulate feature-specific logic
-   Export only necessary components via index files

### 4. Widget Layer

```tsx
// widgets/product-showcase/ui/product-showcase.tsx
import React, { useEffect, useState } from 'react';
import { ProductCard, Product, fetchProducts } from 'entities/product';
import { AddToCartButton } from 'features/cart/add-to-cart';
import './product-showcase.css';

export const ProductShowcase = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadProducts = async () => {
			try {
				const data = await fetchProducts();
				setProducts(data);
			} catch (error) {
				console.error('Failed to load products', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadProducts();
	}, []);

	if (isLoading) return <div>Loading products...</div>;

	return (
		<div className='product-showcase'>
			<h2>Featured Products</h2>
			<div className='product-showcase__grid'>
				{products.map((product) => (
					<div key={product.id} className='product-showcase__item'>
						<ProductCard product={product} />
						<AddToCartButton product={product} />
					</div>
				))}
			</div>
		</div>
	);
};

// widgets/product-showcase/index.ts
export { ProductShowcase } from './ui/product-showcase';
```

-   Compose entities and features
-   Create complex UI blocks
-   Solve specific business scenarios

### 5. Page Layer

```tsx
// pages/home/ui/home-page.tsx
import React from 'react';
import { ProductShowcase } from 'widgets/product-showcase';
import { Header } from 'widgets/header';
import { Footer } from 'widgets/footer';
import './home-page.css';

export const HomePage = () => {
	return (
		<div className='home-page'>
			<Header />
			<main className='home-page__content'>
				<section className='home-page__hero'>
					<h1>Welcome to Our Store</h1>
				</section>
				<ProductShowcase />
			</main>
			<Footer />
		</div>
	);
};

// pages/home/index.ts
export { HomePage } from './ui/home-page';
```

-   Compose widgets and features
-   Handle routing concerns
-   Don't contain complex business logic

## Best Practices

1. **Layer Dependencies**

    - Higher layers can import from lower layers, but not vice versa
    - Public APIs should be exposed through index files
    - Avoid circular dependencies

2. **Feature Isolation**

    - Features should be self-contained
    - Features should not directly import from other features
    - Cross-feature communication should happen through entities or shared layers

3. **Public API Design**

    - Only export what's necessary
    - Use barrel files (index.ts) to expose public APIs
    - Hide implementation details

4. **File Naming**

    - Use kebab-case for folders and files
    - Use descriptive, domain-oriented names
    - Group related files in folders

5. **Component Organization**
    - Follow the segment structure (ui, model, api, lib)
    - Keep components focused on single responsibilities
    - Co-locate related files

## When to Use Feature Sliced Design

Feature Sliced Design is particularly well-suited for:

-   Mid-to-large scale applications
-   Projects with complex business domains
-   Teams with clear separation of responsibilities
-   Applications that need to scale over time

However, it might introduce overhead for small projects. Evaluate if the structure benefits your specific use case before adopting it.
