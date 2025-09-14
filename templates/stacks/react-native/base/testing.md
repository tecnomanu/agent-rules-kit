---
description: Testing patterns for React Native applications
globs: <root>/src/**/*.test.ts,<root>/src/**/*.test.tsx,<root>/__tests__/**/*.ts,<root>/__tests__/**/*.tsx
alwaysApply: false
---

# React Native Testing

This guide covers testing patterns and best practices for React Native applications in {projectPath}, including unit testing, component testing, and integration testing.

## Testing Setup

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/index.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons)/)',
  ],
};
```

### Setup File

```javascript
// src/setupTests.ts
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock permissions
jest.mock('react-native-permissions', () => ({
  request: jest.fn(() => Promise.resolve('granted')),
  PERMISSIONS: {
    IOS: { CAMERA: 'ios.permission.CAMERA' },
    ANDROID: { CAMERA: 'android.permission.CAMERA' },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

// Global test utilities
global.mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
};
```

## Component Testing

### Basic Component Testing

```javascript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../src/components/Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Click me" onPress={jest.fn()} />
    );
    
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Click me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={mockOnPress} disabled />
    );
    
    const button = getByText('Click me').parent;
    expect(button.props.accessibilityState.disabled).toBe(true);
    
    fireEvent.press(getByText('Click me'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('applies correct styles for different variants', () => {
    const { getByTestId } = render(
      <Button 
        title="Primary" 
        variant="primary" 
        onPress={jest.fn()} 
        testID="primary-button"
      />
    );
    
    const button = getByTestId('primary-button');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: '#007AFF',
      })
    );
  });
});
```

### Component with Props Testing

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

describe('UserCard Component', () => {
  it('displays user information correctly', () => {
    const { getByText, getByTestId } = render(
      <UserCard user={mockUser} />
    );
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john@example.com')).toBeTruthy();
    expect(getByTestId('user-avatar')).toBeTruthy();
  });

  it('calls onPress with user data when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <UserCard user={mockUser} onPress={mockOnPress} />
    );
    
    fireEvent.press(getByTestId('user-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockUser);
  });

  it('shows placeholder when avatar is not available', () => {
    const userWithoutAvatar = { ...mockUser, avatar: null };
    const { getByTestId } = render(
      <UserCard user={userWithoutAvatar} />
    );
    
    expect(getByTestId('avatar-placeholder')).toBeTruthy();
  });
});
```

## Hook Testing

### Custom Hook Testing

```javascript
// __tests__/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../../src/hooks/useAuth';
import * as authService from '../../src/services/authService';

jest.mock('../../src/services/authService');
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles login successfully', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    mockedAuthService.login.mockResolvedValue({ user: mockUser, token: 'token123' });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'john@example.com', password: 'password' });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    mockedAuthService.login.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'john@example.com', password: 'wrong' });
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles logout', async () => {
    mockedAuthService.logout.mockResolvedValue();

    const { result } = renderHook(() => useAuth());
    
    // Set initial authenticated state
    await act(async () => {
      result.current.setUser(mockUser);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

## Screen Testing

### Screen Component Testing

```javascript
// __tests__/screens/HomeScreen.test.tsx
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../../src/screens/HomeScreen';
import * as postsService from '../../src/services/postsService';

jest.mock('../../src/services/postsService');
const mockedPostsService = postsService as jest.Mocked<typeof postsService>;

const mockPosts = [
  { id: '1', title: 'Post 1', content: 'Content 1' },
  { id: '2', title: 'Post 2', content: 'Content 2' },
];

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays posts on mount', async () => {
    mockedPostsService.getPosts.mockResolvedValue(mockPosts);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Post 1')).toBeTruthy();
      expect(getByText('Post 2')).toBeTruthy();
    });

    expect(mockedPostsService.getPosts).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator while fetching posts', () => {
    mockedPostsService.getPosts.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockPosts), 100))
    );

    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('handles error when fetching posts fails', async () => {
    const errorMessage = 'Failed to fetch posts';
    mockedPostsService.getPosts.mockRejectedValue(new Error(errorMessage));

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  it('refreshes posts when pull to refresh is triggered', async () => {
    mockedPostsService.getPosts.mockResolvedValue(mockPosts);

    const { getByTestId } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Post 1')).toBeTruthy();
    });

    // Simulate pull to refresh
    const flatList = getByTestId('posts-list');
    fireEvent(flatList, 'refresh');

    expect(mockedPostsService.getPosts).toHaveBeenCalledTimes(2);
  });
});
```

## Service Testing

### API Service Testing

```javascript
// __tests__/services/authService.test.ts
import { authService } from '../../src/services/authService';

// Mock fetch
global.fetch = jest.fn();
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login makes correct API call and returns user data', async () => {
    const mockResponse = {
      user: { id: '1', name: 'John Doe', email: 'john@example.com' },
      token: 'token123',
    };

    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const credentials = { email: 'john@example.com', password: 'password' };
    const result = await authService.login(credentials);

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://api.example.com/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }
    );

    expect(result).toEqual(mockResponse);
  });

  it('login throws error when API call fails', async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized',
    } as Response);

    const credentials = { email: 'john@example.com', password: 'wrong' };

    await expect(authService.login(credentials)).rejects.toThrow('Login failed');
  });

  it('logout makes correct API call', async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
    } as Response);

    await authService.logout();

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://api.example.com/auth/logout',
      { method: 'POST' }
    );
  });
});
```

## Integration Testing

### Navigation Integration

```javascript
// __tests__/integration/navigation.test.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RootNavigator } from '../../src/navigation/RootNavigator';
import { AuthProvider } from '../../src/contexts/AuthContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </AuthProvider>
  );
};

describe('Navigation Integration', () => {
  it('navigates from home to product details', async () => {
    const { getByTestId, getByText } = renderWithProviders(<RootNavigator />);

    // Wait for home screen to load
    await waitFor(() => {
      expect(getByTestId('home-screen')).toBeTruthy();
    });

    // Navigate to product details
    fireEvent.press(getByTestId('product-1'));

    await waitFor(() => {
      expect(getByText('Product Details')).toBeTruthy();
    });
  });

  it('shows auth screen when user is not authenticated', async () => {
    const { getByTestId } = renderWithProviders(<RootNavigator />);

    await waitFor(() => {
      expect(getByTestId('auth-screen')).toBeTruthy();
    });
  });
});
```

## Testing Utilities

### Custom Render Function

```javascript
// src/utils/testUtils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from '../store';

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </Provider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
```

### Mock Generators

```javascript
// src/utils/mockData.ts
export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://example.com/avatar.jpg',
  ...overrides,
});

export const createMockPost = (overrides = {}) => ({
  id: '1',
  title: 'Sample Post',
  content: 'This is a sample post content',
  author: createMockUser(),
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockApiResponse = (data: any, overrides = {}) => ({
  data,
  message: 'Success',
  success: true,
  ...overrides,
});
```

## Test Coverage and Reporting

### Coverage Configuration

```javascript
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:coverage:open": "jest --coverage && open coverage/lcov-report/index.html"
  },
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/*.stories.tsx",
      "!src/index.tsx"
    ],
    "coverageReporters": ["text", "lcov", "html"],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

This testing guide provides comprehensive coverage for testing React Native applications with proper mocking, utilities, and best practices.
