---
description: Navigation basics for React Native applications
globs: <root>/src/**/*.ts,<root>/src/**/*.tsx,<root>/src/**/*.js,<root>/src/**/*.jsx
alwaysApply: false
---

# React Native Navigation Basics

This guide covers navigation fundamentals for React Native applications in {projectPath} using React Navigation v6.

## Navigation Setup

### Installation and Configuration

```bash
# Install React Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs

# Install dependencies for React Native CLI
npm install react-native-screens react-native-safe-area-context

# For iOS, run pod install
cd ios && pod install
```

### Root Navigation Setup

```typescript
// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

## Navigation Types

### Stack Navigation

```typescript
// navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetails: { productId: string };
  UserProfile: { userId: string; canEdit?: boolean };
};

// navigation/RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen 
            name="ProductDetails" 
            component={ProductDetailsScreen}
            options={{ headerShown: true, title: 'Product Details' }}
          />
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfileScreen}
            options={{ headerShown: true, title: 'Profile' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
```

### Tab Navigation

```typescript
// navigation/MainTabNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Favorites: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Favorites':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
```

## Navigation Hooks

### useNavigation Hook

```typescript
// screens/HomeScreen.tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId, canEdit: false });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handleProductPress('123')}>
        <Text>View Product</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleUserPress('456')}>
        <Text>View User Profile</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### useRoute Hook

```typescript
// screens/ProductDetailsScreen.tsx
import { useRoute, RouteProp } from '@react-navigation/native';

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

export const ProductDetailsScreen: React.FC = () => {
  const route = useRoute<ProductDetailsRouteProp>();
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProduct(productId).then(setProduct);
  }, [productId]);

  return (
    <View style={styles.container}>
      {product ? (
        <ProductDetails product={product} />
      ) : (
        <ActivityIndicator size="large" />
      )}
    </View>
  );
};
```

## Modal Navigation

### Modal Screens

```typescript
// navigation/RootNavigator.tsx
export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Group>
      
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen 
          name="CreatePost" 
          component={CreatePostScreen}
          options={{ 
            headerShown: true, 
            title: 'Create Post',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text>Cancel</Text>
              </TouchableOpacity>
            )
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};
```

## Deep Linking

### Deep Link Configuration

```typescript
// navigation/linking.ts
export const linking = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Search: 'search',
          Profile: 'profile',
        },
      },
      ProductDetails: 'product/:productId',
      UserProfile: 'user/:userId',
    },
  },
};

// App.tsx
export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <RootNavigator />
    </NavigationContainer>
  );
}
```

## Navigation Guards

### Authentication Guard

```typescript
// navigation/AuthGuard.tsx
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return <>{children}</>;
};

// Usage in RootNavigator
export const RootNavigator: React.FC = () => {
  return (
    <AuthGuard>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </AuthGuard>
  );
};
```

## Navigation State Management

### Navigation State Persistence

```typescript
// hooks/useNavigationPersistence.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const NAVIGATION_STATE_KEY = 'NAVIGATION_STATE';

export const useNavigationPersistence = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
        const state = savedStateString ? JSON.parse(savedStateString) : undefined;
        setInitialState(state);
      } catch (e) {
        console.warn('Failed to restore navigation state');
      } finally {
        setIsReady(true);
      }
    };

    restoreState();
  }, []);

  const onStateChange = useCallback((state) => {
    AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state));
  }, []);

  return { isReady, initialState, onStateChange };
};

// Usage in App.tsx
export default function App() {
  const { isReady, initialState, onStateChange } = useNavigationPersistence();

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={onStateChange}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
```

## Custom Navigation Components

### Custom Header

```typescript
// components/CustomHeader.tsx
export const CustomHeader: React.FC<{
  title: string;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
}> = ({ title, showBack = false, rightComponent }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
      {rightComponent && <View>{rightComponent}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
});
```

This navigation guide provides a comprehensive foundation for implementing navigation in React Native applications with proper type safety and best practices.
