---
description: Core architectural concepts for React Native applications
globs: <root>/src/**/*.ts,<root>/src/**/*.tsx,<root>/src/**/*.js,<root>/src/**/*.jsx
alwaysApply: false
---

# React Native Architecture Concepts

This guide outlines the core architectural concepts for React Native applications in {projectPath}, covering the bridge architecture, native modules, and performance considerations.

## React Native Architecture Overview

### The Bridge Architecture

React Native uses a bridge to communicate between JavaScript and native code:

```
┌─────────────────┐    Bridge    ┌─────────────────┐
│   JavaScript    │ ◄─────────► │   Native Code   │
│   (React)       │              │   (iOS/Android) │
└─────────────────┘              └─────────────────┘
```

#### Key Components:

1. **JavaScript Thread**: Runs React components and business logic
2. **Native Thread**: Handles UI rendering and native operations  
3. **Bridge**: Serializes data between JavaScript and native code

### New Architecture (Fabric + TurboModules)

React Native's new architecture improves performance:

```javascript
// TurboModules - Synchronous native module calls
import { TurboModuleRegistry } from 'react-native';

const MyTurboModule = TurboModuleRegistry.getEnforcing('MyTurboModule');
const result = MyTurboModule.synchronousMethod(); // No bridge!

// Fabric - New rendering system
// Components render directly to native views
```

## Component Architecture

### Component Hierarchy

```javascript
// App.tsx - Root component
export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

// Navigation structure
const RootNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="TabNavigator" component={TabNavigator} />
    <Stack.Screen name="Modal" component={ModalScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);
```

### Screen Components

```javascript
// screens/HomeScreen.tsx
import React, { useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchPosts } from '../store/slices/postsSlice';

export function HomeScreen() {
  const dispatch = useAppDispatch();
  const { posts, loading } = useAppSelector(state => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={() => dispatch(fetchPosts())}
      />
    </View>
  );
}
```

## State Management Architecture

### Redux Toolkit Pattern

```javascript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authSlice from './slices/authSlice';
import postsSlice from './slices/postsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
};

const persistedAuthReducer = persistReducer(persistConfig, authSlice);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    posts: postsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Context API Pattern

```javascript
// contexts/ThemeContext.tsx
import React, { createContext, useContext, useReducer } from 'react';
import { Appearance } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  colors: ColorScheme;
}

interface ThemeContextType extends ThemeState {
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeReducer = (state: ThemeState, action: any): ThemeState => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light',
        colors: state.theme === 'light' ? darkColors : lightColors,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
        colors: action.payload === 'light' ? lightColors : darkColors,
      };
    default:
      return state;
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, {
    theme: Appearance.getColorScheme() || 'light',
    colors: Appearance.getColorScheme() === 'dark' ? darkColors : lightColors,
  });

  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });
  const setTheme = (theme: Theme) => dispatch({ type: 'SET_THEME', payload: theme });

  return (
    <ThemeContext.Provider value={{ ...state, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

## Navigation Architecture

### Navigation Structure

```javascript
// navigation/types.ts
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  Modal: { data: any };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: { userId?: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};
```

### Navigation Configuration

```javascript
// navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="Modal" 
              component={ModalScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Data Flow Architecture

### Unidirectional Data Flow

```javascript
// hooks/useApi.ts
import { useState, useCallback } from 'react';

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute };
}
```

### Service Layer

```javascript
// services/apiService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private baseURL = 'https://api.example.com';
  
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Specific API methods
  async getPosts() {
    return this.request<Post[]>('/posts');
  }

  async getUser(id: string) {
    return this.request<User>(`/users/${id}`);
  }
}

export const apiService = new ApiService();
```

## Performance Architecture

### Component Optimization

```javascript
// components/OptimizedList.tsx
import React, { memo, useMemo, useCallback } from 'react';
import { FlatList, ListRenderItem } from 'react-native';

interface OptimizedListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
}

function OptimizedListComponent<T>({
  data,
  renderItem,
  keyExtractor,
}: OptimizedListProps<T>) {
  const memoizedData = useMemo(() => data, [data]);

  const memoizedRenderItem = useCallback<ListRenderItem<T>>(
    (info) => renderItem(info),
    [renderItem]
  );

  const getItemLayout = useCallback(
    (data: T[] | null | undefined, index: number) => ({
      length: 80, // Fixed item height
      offset: 80 * index,
      index,
    }),
    []
  );

  return (
    <FlatList
      data={memoizedData}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={50}
    />
  );
}

export const OptimizedList = memo(OptimizedListComponent) as typeof OptimizedListComponent;
```

### Image Optimization

```javascript
// components/OptimizedImage.tsx
import React, { useState } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';

interface OptimizedImageProps {
  source: { uri: string };
  style?: any;
  placeholder?: React.ReactNode;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder,
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={style}>
      <FastImage
        source={{
          uri: source.uri,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        style={style}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        resizeMode={FastImage.resizeMode.cover}
      />
      {loading && (
        <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
          {placeholder || <ActivityIndicator />}
        </View>
      )}
    </View>
  );
};
```

## Security Architecture

### Secure Storage

```javascript
// utils/secureStorage.ts
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SecureStorage {
  // Store sensitive data in Keychain
  static async setSecureItem(key: string, value: string): Promise<void> {
    await Keychain.setInternetCredentials(key, key, value);
  }

  static async getSecureItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(key);
      return credentials ? credentials.password : null;
    } catch (error) {
      return null;
    }
  }

  // Store non-sensitive data in AsyncStorage
  static async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  static async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }
}
```

## Testing Architecture

### Test Structure

```javascript
// __tests__/components/UserCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UserCard } from '../../src/components/UserCard';

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://example.com/avatar.jpg',
};

describe('UserCard', () => {
  it('renders user information correctly', () => {
    const { getByText, getByTestId } = render(<UserCard user={mockUser} />);
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john@example.com')).toBeTruthy();
    expect(getByTestId('user-avatar')).toBeTruthy();
  });

  it('calls onPress when card is tapped', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <UserCard user={mockUser} onPress={mockOnPress} />
    );
    
    fireEvent.press(getByTestId('user-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockUser);
  });
});
```

This architecture provides a solid foundation for scalable React Native applications with clear separation of concerns, optimized performance, and maintainable code structure.
