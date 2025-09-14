---
description: Naming conventions for React applications
globs: <root>/src/**/*.ts,<root>/src/**/*.tsx,<root>/src/**/*.js,<root>/src/**/*.jsx,<root>/components/**/*.ts,<root>/components/**/*.tsx,<root>/components/**/*.js,<root>/components/**/*.jsx
alwaysApply: false
---

# React Naming Conventions

This guide outlines the recommended naming conventions for React applications in {projectPath}, covering components, hooks, utilities, and project structure.

## File and Directory Structure

### Recommended Project Structure

```
src/
├── components/               # Reusable UI components
│   ├── common/              # Generic components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   └── Modal/
│   │       ├── Modal.tsx
│   │       ├── Modal.test.tsx
│   │       └── index.ts
│   └── features/            # Feature-specific components
│       ├── UserProfile/
│       │   ├── UserProfile.tsx
│       │   ├── UserProfile.test.tsx
│       │   └── index.ts
│       └── ProductCard/
│           ├── ProductCard.tsx
│           ├── ProductCard.test.tsx
│           └── index.ts
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── useApi.ts
├── utils/                   # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── services/                # API and external services
│   ├── api.ts
│   ├── authService.ts
│   └── userService.ts
├── types/                   # TypeScript type definitions
│   ├── user.ts
│   ├── product.ts
│   └── api.ts
├── contexts/                # React contexts
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── UserContext.tsx
├── pages/                   # Page components (if using React Router)
│   ├── HomePage.tsx
│   ├── AboutPage.tsx
│   └── UserProfilePage.tsx
└── assets/                  # Static assets
    ├── images/
    ├── icons/
    └── styles/
```

## Component Naming

### Component Files

```typescript
// ✅ Good: PascalCase for component files
UserProfile.tsx
ProductCard.tsx
NavigationMenu.tsx
SearchInput.tsx
LoadingSpinner.tsx

// ✅ Good: Use descriptive, specific names
UserProfileCard.tsx          // Not just Card.tsx
ProductSearchForm.tsx        // Not just Form.tsx
DashboardNavigationMenu.tsx  // Not just Menu.tsx

// ❌ Avoid: Generic or unclear names
Component.tsx
Utils.tsx
Helper.tsx
Thing.tsx
```

### Component Function Names

```typescript
// ✅ Good: Function component names match file names
// File: UserProfile.tsx
export default function UserProfile({ userId }: { userId: string }) {
  return <div>User Profile for {userId}</div>;
}

// ✅ Good: Named exports for reusable components
// File: Button.tsx
export function Button({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`} 
      {...props}
    >
      {children}
    </button>
  );
}

// ✅ Good: Multiple related components in one file
// File: Card.tsx
export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  );
}
```

### Component Props Interfaces

```typescript
// ✅ Good: Props interface naming
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
}

interface UserProfileProps {
  user: User;
  isEditable?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscapeKey?: boolean;
}

// ✅ Good: Generic props for flexible components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}
```

## Hook Naming

### Custom Hooks

```typescript
// ✅ Good: Always start with 'use' and be descriptive
useAuth.ts                  // Authentication logic
useLocalStorage.ts          // Local storage management
useApi.ts                   // API calls
useFetch.ts                 // Data fetching
useDebounce.ts             // Debounced values
useToggle.ts               // Toggle state
useForm.ts                 // Form management
useClickOutside.ts         // Click outside detection
useWindowSize.ts           // Window size tracking
usePrevious.ts             // Previous value tracking

// ✅ Good: Feature-specific hooks
useUserProfile.ts          // User profile management
useShoppingCart.ts         // Shopping cart logic
useProductSearch.ts        // Product search functionality
useNotifications.ts        // Notification system

// Hook implementation examples:
// File: useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
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
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
  };
}

// File: useLocalStorage.ts
export function useLocalStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

## Event Handler Naming

```typescript
// ✅ Good: Event handler naming patterns
interface UserFormProps {
  user?: User;
  onSubmit: (userData: CreateUserData) => void;
  onCancel: () => void;
  onFieldChange?: (field: string, value: any) => void;
}

function UserForm({ user, onSubmit, onCancel, onFieldChange }: UserFormProps) {
  // ✅ Good: Internal event handler naming
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const userData = Object.fromEntries(formData.entries()) as CreateUserData;
    onSubmit(userData);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onFieldChange?.(name, value);
  };

  const handleCancelClick = () => {
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="name" 
        onChange={handleInputChange}
        defaultValue={user?.name}
      />
      <input 
        name="email" 
        type="email"
        onChange={handleInputChange}
        defaultValue={user?.email}
      />
      <button type="submit">Save</button>
      <button type="button" onClick={handleCancelClick}>Cancel</button>
    </form>
  );
}

// ✅ Good: Event handler naming in parent components
function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleUserCreate = async (userData: CreateUserData) => {
    try {
      const newUser = await userService.create(userData);
      setUsers(prev => [...prev, newUser]);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
  };

  const handleUserDelete = async (userId: string) => {
    try {
      await userService.delete(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div>
      <UserForm 
        user={selectedUser}
        onSubmit={handleUserCreate}
        onCancel={() => setSelectedUser(null)}
      />
      <UserList 
        users={users}
        onEdit={handleUserEdit}
        onDelete={handleUserDelete}
      />
    </div>
  );
}
```

## State Variable Naming

```typescript
// ✅ Good: Descriptive state variable names
function ProductSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // ✅ Good: Boolean state naming
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [shouldAutoSave, setShouldAutoSave] = useState(true);

  // ✅ Good: Object state naming
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'en',
    notifications: true,
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
  });

  return (
    // Component JSX
  );
}
```

## Utility Function Naming

```typescript
// ✅ Good: Clear utility function names
// File: utils/formatters.ts
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: format === 'short' ? 'short' : 'full',
  }).format(date);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
}

// File: utils/validators.ts
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
}

export function isStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}

// File: utils/array-utils.ts
export function groupBy<T, K extends keyof any>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = getKey(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

export function sortBy<T>(
  array: T[],
  getProperty: (item: T) => string | number,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = getProperty(a);
    const bVal = getProperty(b);
    
    if (order === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
}
```

## TypeScript Type and Interface Naming

```typescript
// ✅ Good: Clear type and interface names
// File: types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bio?: string;
  website?: string;
  location?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showLocation: boolean;
}

// ✅ Good: API-related types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// ✅ Good: Form-related types
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserData = Partial<CreateUserData>;
export type LoginCredentials = Pick<User, 'email'> & { password: string };

// ✅ Good: Union types
export type Theme = 'light' | 'dark';
export type UserRole = 'admin' | 'user' | 'moderator';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

## Context Naming

```typescript
// ✅ Good: Context naming
// File: contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: UpdateUserData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Implementation
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// File: contexts/ThemeContext.tsx
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  colors: ColorPalette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Implementation
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

## Constants Naming

```typescript
// ✅ Good: Constants naming
// File: utils/constants.ts
export const API_ENDPOINTS = {
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
  },
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s-()]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
} as const;

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000,
  MODAL_Z_INDEX: 1000,
  TOOLTIP_Z_INDEX: 1100,
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;
```

These naming conventions help maintain consistency and readability across your React application, making it easier for team members to understand and contribute to the codebase.
