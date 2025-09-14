---
description: Naming conventions for Next.js applications
globs: <root>/app/**/*.ts,<root>/app/**/*.tsx,<root>/src/**/*.ts,<root>/src/**/*.tsx,<root>/pages/**/*.ts,<root>/pages/**/*.tsx,<root>/components/**/*.ts,<root>/components/**/*.tsx
alwaysApply: false
---

# Next.js Naming Conventions

This guide outlines the recommended naming conventions for Next.js applications in {projectPath}, covering both App Router and Pages Router patterns.

## File and Directory Naming

### App Router (Next.js 13+)

```
app/
├── page.tsx                    # Home page
├── layout.tsx                  # Root layout
├── loading.tsx                 # Loading UI
├── error.tsx                   # Error UI
├── not-found.tsx              # 404 page
├── global-error.tsx           # Global error handler
├── template.tsx               # Template wrapper
├── default.tsx                # Default UI for parallel routes
├── robots.txt                 # Static file
├── sitemap.xml               # Static file
├── favicon.ico               # Static file
├── apple-icon.png            # Static file
├── icon.png                  # Static file
├── manifest.json             # Static file
├── opengraph-image.jpg       # Open Graph image
├── twitter-image.jpg         # Twitter image
├── dashboard/
│   ├── page.tsx              # /dashboard
│   ├── layout.tsx            # Dashboard layout
│   ├── loading.tsx           # Dashboard loading
│   ├── settings/
│   │   └── page.tsx          # /dashboard/settings
│   └── analytics/
│       ├── page.tsx          # /dashboard/analytics
│       └── loading.tsx       # Analytics loading
├── blog/
│   ├── page.tsx              # /blog
│   ├── [slug]/
│   │   └── page.tsx          # /blog/[slug]
│   └── [...slug]/
│       └── page.tsx          # /blog/[...slug] (catch-all)
├── shop/
│   └── [[...slug]]/
│       └── page.tsx          # /shop/[[...slug]] (optional catch-all)
├── (marketing)/              # Route group (doesn't affect URL)
│   ├── about/
│   │   └── page.tsx          # /about
│   └── contact/
│       └── page.tsx          # /contact
├── @modal/                   # Parallel route slot
│   ├── default.tsx
│   └── login/
│       └── page.tsx
└── api/
    ├── route.ts              # API route handler
    ├── auth/
    │   └── route.ts          # /api/auth
    └── users/
        ├── route.ts          # /api/users
        └── [id]/
            └── route.ts      # /api/users/[id]
```

### Pages Router (Legacy)

```
pages/
├── _app.tsx                  # App component
├── _document.tsx             # Document component
├── _error.tsx                # Error page
├── 404.tsx                   # Custom 404 page
├── 500.tsx                   # Custom 500 page
├── index.tsx                 # Home page (/)
├── about.tsx                 # /about
├── contact.tsx               # /contact
├── blog/
│   ├── index.tsx             # /blog
│   ├── [slug].tsx            # /blog/[slug]
│   └── [...slug].tsx         # /blog/[...slug] (catch-all)
├── dashboard/
│   ├── index.tsx             # /dashboard
│   ├── settings.tsx          # /dashboard/settings
│   └── analytics.tsx         # /dashboard/analytics
└── api/
    ├── hello.ts              # /api/hello
    ├── auth/
    │   └── login.ts          # /api/auth/login
    └── users/
        ├── index.ts          # /api/users
        └── [id].ts           # /api/users/[id]
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
// ✅ Good: Match file name exactly
// File: UserProfile.tsx
export default function UserProfile() {
  return <div>User Profile</div>;
}

// ✅ Good: Named export matches file name
// File: ProductCard.tsx
export function ProductCard() {
  return <div>Product Card</div>;
}

// ✅ Good: For generic components, use descriptive names
// File: Button.tsx
export function Button({ variant, children, ...props }) {
  return <button className={`btn btn-${variant}`} {...props}>{children}</button>;
}

// File: Modal.tsx
export function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return <div className="modal">{children}</div>;
}
```

## Hook Naming

### Custom Hooks

```typescript
// ✅ Good: Always start with 'use'
useUser.ts
useAuth.ts
useLocalStorage.ts
useApi.ts
useFetch.ts
useDebounce.ts
useToggle.ts

// ✅ Good: Be specific about what the hook does
useUserProfile.ts           // Not just useUser.ts
useProductSearch.ts         // Not just useSearch.ts
useShoppingCart.ts          // Not just useCart.ts

// Hook implementation examples:
// File: useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const login = async (credentials) => { /* ... */ };
  const logout = () => { /* ... */ };
  
  return { user, isLoading, login, logout };
}

// File: useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}
```

## Utility and Helper Functions

### File Naming

```typescript
// ✅ Good: Descriptive utility file names
utils/
├── formatters.ts             // Date, currency, text formatters
├── validators.ts             // Input validation functions
├── api-helpers.ts            // API-related utilities
├── dom-utils.ts              // DOM manipulation utilities
├── string-utils.ts           // String manipulation functions
├── date-utils.ts             // Date manipulation functions
├── array-utils.ts            // Array manipulation functions
└── constants.ts              // Application constants

// ✅ Good: Function naming within utilities
// File: formatters.ts
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date, format = 'short'): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: format as 'short' | 'medium' | 'long' | 'full',
  }).format(date);
}

// File: validators.ts
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
}
```

## API Route Naming

### REST API Conventions

```typescript
// ✅ Good: RESTful API route naming
api/
├── users/
│   ├── route.ts              # GET /api/users, POST /api/users
│   └── [id]/
│       └── route.ts          # GET /api/users/[id], PUT /api/users/[id], DELETE /api/users/[id]
├── products/
│   ├── route.ts              # GET /api/products, POST /api/products
│   ├── [id]/
│   │   └── route.ts          # GET /api/products/[id], PUT /api/products/[id]
│   └── categories/
│       └── route.ts          # GET /api/products/categories
├── auth/
│   ├── login/
│   │   └── route.ts          # POST /api/auth/login
│   ├── logout/
│   │   └── route.ts          # POST /api/auth/logout
│   └── register/
│       └── route.ts          # POST /api/auth/register
└── search/
    └── route.ts              # GET /api/search?q=query
```

### API Handler Functions

```typescript
// ✅ Good: Clear handler function names
// File: api/users/route.ts
export async function GET(request: NextRequest) {
  // Handle GET /api/users
}

export async function POST(request: NextRequest) {
  // Handle POST /api/users
}

// File: api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle GET /api/users/[id]
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle PUT /api/users/[id]
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle DELETE /api/users/[id]
}
```

## TypeScript Interfaces and Types

### Interface Naming

```typescript
// ✅ Good: Clear interface names with 'I' prefix (optional) or descriptive names
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface UserProfile extends User {
  bio?: string;
  avatar?: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
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
    totalPages: number;
  };
}

// ✅ Good: Component props interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

### Type Naming

```typescript
// ✅ Good: Union types for specific values
type Theme = 'light' | 'dark';
type UserRole = 'admin' | 'user' | 'moderator';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// ✅ Good: Utility types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type CreateUserData = Omit<User, 'id' | 'createdAt'>;
type UpdateUserData = Partial<CreateUserData>;

// ✅ Good: Event handler types
type ClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;
type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
```

## CSS and Styling

### CSS Module Naming

```scss
// ✅ Good: BEM-like naming in CSS modules
// File: UserProfile.module.css
.userProfile {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.userProfile__header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.userProfile__avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-right: 1rem;
}

.userProfile__name {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.userProfile__email {
  color: #666;
  margin: 0;
}

.userProfile--loading {
  opacity: 0.5;
  pointer-events: none;
}
```

### Styled Components (if using)

```typescript
// ✅ Good: Styled component naming
import styled from 'styled-components';

const UserProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const UserProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const UserAvatar = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-right: 1rem;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
`;
```

## Environment Variables

```bash
# ✅ Good: Clear environment variable naming
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=My Next.js App
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

DATABASE_URL=postgresql://user:password@localhost:5432/myapp
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx

EMAIL_FROM=noreply@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# ✅ Good: Use NEXT_PUBLIC_ prefix for client-side variables
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
```

## Constants and Configuration

```typescript
// ✅ Good: Clear constant naming
// File: constants/index.ts
export const API_ENDPOINTS = {
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
} as const;

export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
```

These naming conventions help maintain consistency and readability across your Next.js application, making it easier for team members to understand and contribute to the codebase.
