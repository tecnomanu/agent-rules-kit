---
description: Best practices for React Native applications
globs: <root>/src/**/*.ts,<root>/src/**/*.tsx,<root>/src/**/*.js,<root>/src/**/*.jsx,<root>/components/**/*.ts,<root>/components/**/*.tsx,<root>/components/**/*.js,<root>/components/**/*.jsx
alwaysApply: false
---

# React Native Best Practices

This guide outlines the recommended best practices for React Native development in {projectPath}, covering both React patterns and mobile-specific considerations.

## Component Structure

### Functional Components with Hooks

Use functional components with hooks as the standard pattern:

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

	if (loading) return <ActivityIndicator size="large" />;
	return <UserCard user={user} />;
};
```

## Performance Optimization

### List Optimization

```jsx
// ✅ Optimized FlatList implementation
const OptimizedProductList = ({ products }) => {
	const renderProduct = useCallback(({ item }) => (
		<ProductCard product={item} />
	), []);

	return (
		<FlatList
			data={products}
			renderItem={renderProduct}
			keyExtractor={item => item.id}
			removeClippedSubviews={true}
			maxToRenderPerBatch={10}
			windowSize={10}
			initialNumToRender={10}
		/>
	);
};
```

### Memory Management

```jsx
// ✅ Proper cleanup and memoization
const ChatScreen = () => {
	const [messages, setMessages] = useState([]);

	// Memoize expensive calculations
	const sortedMessages = useMemo(() => {
		return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
	}, [messages]);

	// Cleanup subscriptions
	useEffect(() => {
		const subscription = chatService.subscribe((newMessage) => {
			setMessages(prev => [...prev, newMessage]);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return <MessageList messages={sortedMessages} />;
};
```

## Platform-Specific Code

### Platform Detection

```jsx
import { Platform, StyleSheet } from 'react-native';

// ✅ Platform-specific styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: Platform.OS === 'ios' ? 44 : 0, // Status bar height
	},
	button: {
		...Platform.select({
			ios: {
				backgroundColor: '#007AFF',
				borderRadius: 8,
			},
			android: {
				backgroundColor: '#2196F3',
				elevation: 2,
			},
		}),
	},
});
```

## Error Handling

### Error Boundaries

```jsx
// ✅ Error boundary for React Native
class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		console.error('Error caught by boundary:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<View style={styles.errorContainer}>
					<Text>Something went wrong. Please restart the app.</Text>
				</View>
			);
		}

		return this.props.children;
	}
}
```

## Testing

### Component Testing

```jsx
// ✅ Testable component structure
export const UserCard = ({ user, onPress }) => {
	return (
		<TouchableOpacity 
			testID="user-card"
			style={styles.card}
			onPress={() => onPress(user.id)}
		>
			<Text testID="user-name">{user.name}</Text>
			<Text testID="user-email">{user.email}</Text>
		</TouchableOpacity>
	);
};
```

## Security

### Data Validation

```jsx
// ✅ Input validation
const validateEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

const LoginForm = () => {
	const [email, setEmail] = useState('');
	const [errors, setErrors] = useState({});

	const handleSubmit = useCallback(() => {
		if (!validateEmail(email)) {
			setErrors({ email: 'Please enter a valid email address' });
			return;
		}
		// Proceed with login
	}, [email]);

	return (
		<View>
			<TextInput
				value={email}
				onChangeText={setEmail}
				placeholder="Email"
				keyboardType="email-address"
				autoCapitalize="none"
			/>
			{errors.email && <Text style={styles.error}>{errors.email}</Text>}
		</View>
	);
};
```

## Accessibility

### Accessibility Support

```jsx
// ✅ Comprehensive accessibility
const AccessibleButton = ({ title, onPress, disabled = false }) => {
	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled}
			accessible={true}
			accessibilityRole="button"
			accessibilityLabel={title}
			accessibilityState={{ disabled }}
			style={[styles.button, disabled && styles.buttonDisabled]}
		>
			<Text style={styles.buttonText}>{title}</Text>
		</TouchableOpacity>
	);
};
```

Remember that React Native development requires balancing React best practices with mobile-specific considerations like performance, platform differences, and user experience patterns.
