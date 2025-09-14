---
description: Naming conventions for React Native applications
globs: <root>/src/**/*.ts,<root>/src/**/*.tsx,<root>/src/**/*.js,<root>/src/**/*.jsx
alwaysApply: false
---

# React Native Naming Conventions

This guide outlines the recommended naming conventions for React Native applications in {projectPath}, covering components, screens, hooks, services, and project structure.

## Project Structure

### Recommended Directory Structure

```
src/
├── components/              # Reusable UI components
│   ├── common/             # Generic components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── Input/
│   │       ├── Input.tsx
│   │       ├── Input.test.tsx
│   │       └── index.ts
│   └── features/           # Feature-specific components
│       ├── UserProfile/
│       └── ProductCard/
├── screens/                # Screen components
│   ├── HomeScreen.tsx
│   ├── ProfileScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/             # Navigation configuration
│   ├── RootNavigator.tsx
│   ├── TabNavigator.tsx
│   └── types.ts
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useLocalStorage.ts
├── services/               # API and external services
│   ├── apiService.ts
│   ├── authService.ts
│   └── storageService.ts
├── store/                  # State management
│   ├── index.ts
│   ├── slices/
│   └── middleware/
├── utils/                  # Utility functions
│   ├── constants.ts
│   ├── helpers.ts
│   └── validation.ts
├── types/                  # TypeScript definitions
│   ├── api.ts
│   ├── navigation.ts
│   └── user.ts
└── assets/                 # Static assets
    ├── images/
    ├── icons/
    └── fonts/
```

## Component Naming

### Screen Components

```typescript
// ✅ Good: Screen suffix for navigation screens
HomeScreen.tsx
ProfileScreen.tsx
SettingsScreen.tsx
LoginScreen.tsx
RegisterScreen.tsx

// ✅ Good: Descriptive screen names
UserProfileScreen.tsx      // Not just Profile.tsx
ProductDetailsScreen.tsx   // Not just Details.tsx
ShoppingCartScreen.tsx     // Not just Cart.tsx

// Component implementation
export const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Home Screen</Text>
    </SafeAreaView>
  );
};
```

### UI Components

```typescript
// ✅ Good: PascalCase component names
Button.tsx
Input.tsx
Modal.tsx
Card.tsx
Avatar.tsx

// ✅ Good: Specific component names
UserAvatar.tsx            // Not just Avatar.tsx
ProductCard.tsx           // Not just Card.tsx
LoadingSpinner.tsx        // Not just Loading.tsx
SearchInput.tsx           // Not just Input.tsx

// Component with props interface
interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onPress: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], styles[size]]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};
```

## Hook Naming

### Custom Hooks

```typescript
// ✅ Good: Always start with 'use' prefix
useAuth.ts                // Authentication logic
useApi.ts                 // API calls
useLocalStorage.ts        // Local storage management
usePermissions.ts         // Device permissions
useCamera.ts              // Camera functionality
useLocation.ts            // Location services
useNetworkStatus.ts       // Network connectivity
useBiometrics.ts          // Biometric authentication

// ✅ Good: Feature-specific hooks
useUserProfile.ts         // User profile management
useProductSearch.ts       // Product search functionality
useShoppingCart.ts        // Shopping cart logic
usePushNotifications.ts   // Push notification handling

// Hook implementation example
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
  };
};
```

## Navigation Naming

### Navigation Types

```typescript
// navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Modal: { data: any };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: { userId?: string };
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductDetails: { productId: string };
  UserProfile: { userId: string };
};
```

### Navigator Components

```typescript
// ✅ Good: Navigator suffix for navigation components
RootNavigator.tsx
AuthNavigator.tsx
MainTabNavigator.tsx
HomeStackNavigator.tsx

// Navigator implementation
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
```

## Service Naming

### API Services

```typescript
// ✅ Good: Service suffix for service classes
authService.ts
userService.ts
productService.ts
paymentService.ts
notificationService.ts

// Service implementation
class AuthService {
  private baseURL = 'https://api.example.com';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
    });
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    return response.json();
  }
}

export const authService = new AuthService();
```

### Utility Services

```typescript
// ✅ Good: Descriptive utility names
storageService.ts         // AsyncStorage wrapper
validationService.ts      // Form validation
formattingService.ts      // Data formatting
encryptionService.ts      // Data encryption
deviceService.ts          // Device info and capabilities

// Storage service example
class StorageService {
  async setItem(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }
}

export const storageService = new StorageService();
```

## State Management Naming

### Redux Slices

```typescript
// ✅ Good: Slice suffix for Redux slices
authSlice.ts
userSlice.ts
productSlice.ts
cartSlice.ts
notificationSlice.ts

// Slice implementation
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string) => {
    const response = await userService.getUser(userId);
    return response;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
```

## Event Handler Naming

### Component Event Handlers

```typescript
// ✅ Good: Event handler naming patterns
const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  // Internal event handlers - use 'handle' prefix
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancelPress = () => {
    onCancel();
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    
    if (result.assets?.[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        onChangeText={(text) => handleInputChange('name', text)}
      />
      <TouchableOpacity onPress={handleImagePicker}>
        <Text>Select Image</Text>
      </TouchableOpacity>
      <Button title="Submit" onPress={handleSubmit} />
      <Button title="Cancel" onPress={handleCancelPress} />
    </View>
  );
};
```

## TypeScript Naming

### Interface and Type Naming

```typescript
// ✅ Good: Clear interface names
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserProfile extends User {
  bio?: string;
  location?: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

// ✅ Good: Props interfaces
interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  onPress: () => void;
}

interface ScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

// ✅ Good: API response types
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ✅ Good: Union types
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
type Theme = 'light' | 'dark' | 'system';
type Permission = 'granted' | 'denied' | 'never_ask_again';
```

## Asset Naming

### Image Assets

```
assets/
├── images/
│   ├── logo.png
│   ├── logo@2x.png
│   ├── logo@3x.png
│   ├── splash-screen.png
│   ├── onboarding-step1.png
│   └── placeholder-avatar.png
├── icons/
│   ├── home-icon.png
│   ├── profile-icon.png
│   ├── settings-icon.png
│   └── back-arrow.png
└── fonts/
    ├── Roboto-Regular.ttf
    ├── Roboto-Bold.ttf
    └── Inter-Medium.ttf
```

## Constants Naming

```typescript
// ✅ Good: Constants naming
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
  },
  USERS: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
} as const;

export const COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#6C757D',
  SUCCESS: '#28A745',
  DANGER: '#DC3545',
  WARNING: '#FFC107',
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
} as const;

export const SCREEN_NAMES = {
  HOME: 'Home',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  LOGIN: 'Login',
} as const;
```

These naming conventions ensure consistency and maintainability across your React Native application, making it easier for team members to understand and contribute to the codebase.
