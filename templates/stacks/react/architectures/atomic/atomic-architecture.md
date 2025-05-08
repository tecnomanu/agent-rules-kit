# Atomic Design Architecture in React

Atomic Design is a methodology composed of five distinct stages working together to create interface design systems in a more deliberate and hierarchical manner.

## Core Principles

1. **Atoms**: Basic building blocks (buttons, inputs, labels) that can't be broken down further
2. **Molecules**: Groups of atoms working together as a unit (form fields, navigation items)
3. **Organisms**: Groups of molecules forming a distinct section (headers, forms, content areas)
4. **Templates**: Page-level objects placing components into a layout
5. **Pages**: Specific instances of templates with real content

## Directory Structure

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.test.jsx
│   │   │   └── Button.module.css
│   │   ├── Input/
│   │   ├── Label/
│   │   └── ...
│   ├── molecules/
│   │   ├── FormField/
│   │   ├── SearchBar/
│   │   └── ...
│   ├── organisms/
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── ProductCard/
│   │   └── ...
│   └── templates/
│       ├── HomeTemplate/
│       ├── ProductTemplate/
│       └── ...
├── pages/
│   ├── Home/
│   ├── Product/
│   └── ...
└── ...
```

## Implementation Guidelines

### 1. Atoms

```jsx
// Button.jsx
export const Button = ({
	children,
	variant = 'primary',
	size = 'medium',
	onClick,
	...props
}) => {
	return (
		<button
			className={`button ${variant} ${size}`}
			onClick={onClick}
			{...props}>
			{children}
		</button>
	);
};
```

-   Keep atoms as simple and pure as possible
-   Ensure they are highly reusable
-   Maintain clear props interfaces with good defaults
-   Avoid business logic at this level

### 2. Molecules

```jsx
// FormField.jsx
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { ErrorMessage } from '../../atoms/ErrorMessage';

export const FormField = ({ label, name, error, ...inputProps }) => {
	return (
		<div className='form-field'>
			<Label htmlFor={name}>{label}</Label>
			<Input
				id={name}
				name={name}
				aria-invalid={!!error}
				{...inputProps}
			/>
			{error && <ErrorMessage>{error}</ErrorMessage>}
		</div>
	);
};
```

-   Compose molecules from atoms
-   Focus on specific use cases
-   Maintain clear interfaces between components
-   Keep business logic minimal

### 3. Organisms

```jsx
// ProductCard.jsx
import { Heading } from '../../atoms/Heading';
import { Image } from '../../atoms/Image';
import { StarRating } from '../../molecules/StarRating';
import { PriceTag } from '../../molecules/PriceTag';
import { AddToCartButton } from '../../molecules/AddToCartButton';

export const ProductCard = ({ product }) => {
	return (
		<div className='product-card'>
			<Image src={product.image} alt={product.name} />
			<Heading level={3}>{product.name}</Heading>
			<StarRating value={product.rating} />
			<PriceTag price={product.price} discount={product.discount} />
			<AddToCartButton productId={product.id} />
		</div>
	);
};
```

-   Compose organisms from atoms and molecules
-   Can contain domain-specific logic
-   Connect to data sources or state management
-   Represent distinct sections of a UI

### 4. Templates

```jsx
// ProductTemplate.jsx
import { Header } from '../../organisms/Header';
import { ProductDetails } from '../../organisms/ProductDetails';
import { RelatedProducts } from '../../organisms/RelatedProducts';
import { Footer } from '../../organisms/Footer';

export const ProductTemplate = ({ product, relatedProducts }) => {
	return (
		<div className='product-page'>
			<Header />
			<main>
				<ProductDetails product={product} />
				<RelatedProducts products={relatedProducts} />
			</main>
			<Footer />
		</div>
	);
};
```

-   Create page layouts without specific content
-   Handle responsive layout concerns
-   Focus on component composition
-   Avoid business logic at this level

### 5. Pages

```jsx
// ProductPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductTemplate } from '../../components/templates/ProductTemplate';
import { fetchProduct, fetchRelatedProducts } from '../../api/products';

export const ProductPage = () => {
	const { productId } = useParams();
	const [product, setProduct] = useState(null);
	const [relatedProducts, setRelatedProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			try {
				const productData = await fetchProduct(productId);
				setProduct(productData);

				const relatedData = await fetchRelatedProducts(productId);
				setRelatedProducts(relatedData);
			} catch (error) {
				console.error('Failed to load product data', error);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [productId]);

	if (loading) return <div>Loading...</div>;

	return (
		<ProductTemplate product={product} relatedProducts={relatedProducts} />
	);
};
```

-   Add specific data to templates
-   Connect to APIs, data sources, and state management
-   Handle routing and URL parameters
-   Focus on business logic and data fetching

## Best Practices

1. **Clear Component Boundaries**

    - Each component should have a single responsibility
    - Props interfaces should be well-defined
    - Document components with comments or prop-types

2. **Reusability**

    - Lower-level components (atoms, molecules) should be highly reusable
    - Avoid tightly coupling components to specific data structures
    - Use composition over inheritance

3. **Testability**

    - Each component should be easily testable in isolation
    - Write unit tests for atoms and molecules, integration tests for organisms and templates

4. **Composability**

    - Components should be easy to compose to create more complex UIs
    - Use React's children prop for flexible composition
    - Consider using render props or HOCs for complex sharing of behavior

5. **Consistency**
    - Maintain consistent naming conventions
    - Keep directory structure consistent
    - Use consistent patterns for handling props, state, and events

## When to Use Atomic Design

Atomic Design is particularly well-suited for:

-   Large applications with many UI components
-   Projects that require a design system
-   Teams with designers and developers working closely together
-   Products that need consistent UI across different areas

However, it may be overkill for small or simple applications. Evaluate if the structure benefits your project before implementing it.
