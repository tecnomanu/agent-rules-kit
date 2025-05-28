---
description: Naming conventions for React applications
globs: <root>/src/**/*.{ts,tsx,js,jsx},<root>/components/**/*.{ts,tsx,js,jsx}
alwaysApply: true
---

# React Naming Conventions

This document outlines common naming conventions to follow when developing React applications in {projectPath}. Consistent naming improves code readability and maintainability.

## General Conventions

### 1. Components
- **Convention**: `PascalCase`
- **Filename**: `MyComponent.jsx` or `MyComponent.tsx`
- **Details**: Component names should be descriptive and clearly indicate their purpose.
- **Example**:
  ```jsx
  // Good
  function UserProfile(props) { /* ... */ }
  class ShoppingCart extends React.Component { /* ... */ }

  // Filename: UserProfile.jsx

  // Avoid
  // function userprofile(props) { /* ... */ }
  // class shopping_cart extends React.Component { /* ... */ }
  ```

### 2. Hooks
- **Convention**: `camelCase` with `use` prefix.
- **Filename**: `useUserData.js` or `useUserData.ts`
- **Details**: Custom hooks must start with `use` for React to recognize them as hooks and enforce rules of hooks.
- **Example**:
  ```javascript
  // Good
  function useOnlineStatus() { /* ... */ }
  const useTheme = () => { /* ... */ };

  // Filename: useOnlineStatus.js

  // Avoid
  // function onlineStatus() { /* ... */ }
  // const ThemeHook = () => { /* ... */ };
  ```

### 3. Variables and Functions
- **Convention**: `camelCase`
- **Details**: Standard JavaScript convention for variables and functions.
- **Example**:
  ```javascript
  // Good
  const userData = fetchUserData();
  let isLoading = true;
  function formatUserName(user) { /* ... */ }

  // Avoid
  // const UserData = ...;
  // let IsLoading = true;
  // function Format_User_Name(user) { /* ... */ }
  ```

### 4. Constants
- **Convention**: `UPPER_SNAKE_CASE`
- **Details**: For values that are truly constant and will not be reassigned. Often defined at the top of a module or in a dedicated constants file.
- **Example**:
  ```javascript
  // Good
  const MAX_USERS = 10;
  const API_ENDPOINT = "/api/v1";

  // Avoid
  // const maxUsers = 10;
  // const apiEndpoint = "/api/v1";
  ```

### 5. Props
- **Convention**: `camelCase`
- **Details**: Props passed to components should follow camelCase.
- **Example**:
  ```jsx
  // Good
  // <UserProfile userId="123" isActive={true} />

  // Avoid
  // <UserProfile UserID="123" is_active={true} />
  ```

### 6. Event Handlers
- **Convention**: `camelCase` with `handle` prefix (or `on` prefix for props that receive handler functions).
- **Details**:
    - Functions defined to handle events: `handleEventName` (e.g., `handleClick`, `handleSubmit`).
    - Props that accept event handler functions: `onEventName` (e.g., `onClick`, `onSubmit`).
- **Example**:
  ```jsx
  // Good
  function MyComponent({ onSave }) {
    const handleClick = () => {
      console.log('Button clicked!');
      // Potentially call a prop like onSave
    };

    return <button onClick={handleClick}>Click Me</button>;
  }

  // <Article onSubmit={handleFormSubmit} />

  // Avoid
  // function MyComponent({ SaveHandler }) {
  //   const click_event = () => { /* ... */ };
  //   return <button on_click={click_event}>Click Me</button>;
  // }
  ```

## File Naming

- **Components**: `PascalCase.jsx` or `PascalCase.tsx` (e.g., `UserProfile.jsx`).
- **Hooks**: `useCamelCase.js` or `useCamelCase.ts` (e.g., `useAuth.js`).
- **Utilities/Services**: `camelCase.js` or `camelCase.ts` (e.g., `apiClient.js`, `stringUtils.ts`).
- **Contexts**: `PascalCaseContext.js` or `PascalCaseContext.tsx` (e.g., `ThemeContext.js`).
- **Tests**: Follow the naming of the file being tested, often with a suffix like `.test.js`, `.spec.js`, `.test.tsx`, or `.spec.tsx` (e.g., `UserProfile.test.jsx`, `useAuth.spec.js`).

Adhering to these conventions will help maintain a clean and understandable codebase in {projectPath}.
```
