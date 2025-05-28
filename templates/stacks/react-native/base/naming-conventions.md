---
description: Naming conventions for React Native applications.
globs: <root>/**/*.{js,jsx,ts,tsx}
alwaysApply: true
---

# React Native Naming Conventions

Consistent naming conventions are vital for maintaining a readable, scalable, and collaborative codebase in your React Native project at {projectPath}. This guide outlines recommended conventions.

## General Principles

-   **Clarity and Descriptiveness**: Names should clearly indicate the purpose or role of the item.
-   **Consistency**: Apply chosen conventions uniformly across the project.

## File Naming

-   **Components (React Components)**: `PascalCase`
    -   Example: `UserProfile.tsx`, `Button.jsx`, `OrderSummaryView.js`
-   **Screens (Top-level view components used in navigation)**: `PascalCaseScreen`
    -   Example: `LoginScreen.tsx`, `ProductDetailsScreen.js`
-   **Hooks (Custom React Hooks)**: `useCamelCase`
    -   Example: `useAuth.ts`, `useKeyboardVisibility.js`
-   **Utilities/Services/Helpers**: `camelCase`
    -   Example: `apiClient.ts`, `stringUtils.js`, `permissionHelper.ts`
-   **Configuration Files**: `camelCase` or `kebab-case`
    -   Example: `appConfig.js`, `firebase-config.js`
-   **Style Files (if separate)**: `camelCase.styles.ts` or `PascalCase.styles.ts` (co-located with component)
    -   Example: `userProfile.styles.ts` or `UserProfile.styles.ts`
-   **Test Files**: Match the file being tested, with a suffix.
    -   Example: `UserProfile.test.tsx`, `useAuth.spec.ts`

## Component Naming

-   **Convention**: `PascalCase`
-   **Details**: Standard React convention. Components are typically nouns or noun phrases.
-   **Example**:
    ```jsx
    // Good
    function UserAvatar(props) { /* ... */ }
    class OrderForm extends React.Component { /* ... */ }

    // Avoid
    // function user_avatar(props) { /* ... */ }
    // class orderform extends React.Component { /* ... */ }
    ```

## Variable and Function Naming

-   **Variables (including state variables)**: `camelCase`
    -   Example: `let userName = '';`, `const [isLoading, setIsLoading] = useState(false);`
-   **Functions/Methods**: `camelCase`
    -   Example: `function getUserProfile(userId) { /* ... */ }`, `const calculateTotalPrice = () => { /* ... */ }`

## Constant Naming

-   **Convention**: `UPPER_SNAKE_CASE`
-   **Details**: For values that are truly constant and will not be reassigned. Often defined at the top of a module or in a dedicated constants file.
-   **Example**:
    ```javascript
    const API_TIMEOUT = 15000;
    const DEFAULT_USERNAME = 'Guest';
    ```

## Prop Naming

-   **Convention**: `camelCase`
-   **Details**: Standard for props passed to components. Boolean props should ideally be prefixed with `is`, `has`, `should`, etc.
-   **Example**:
    ```jsx
    // <UserProfile userId="123" isActive={true} showAvatar={false} />

    // Avoid
    // <UserProfile UserID="123" IsActive={true} />
    ```

## Event Handler Naming

-   **Handler Functions (defined in component)**: `handleEventName` or `onEventName` (if it directly maps to a prop)
    -   Example: `const handleLoginPress = () => { /* ... */ }`, `const onValueChange = (newValue) => { /* ... */ }`
-   **Prop Names for Event Handlers**: `onEventName`
    -   Example: `<Button onPress={handleButtonPress} onFocus={handleFocus} />`

## Style Object Naming (within `StyleSheet.create`)

-   **Convention**: `camelCase`
-   **Details**: Keys within the `StyleSheet.create` object should be descriptive and follow camelCase.
-   **Example**:
    ```javascript
    const styles = StyleSheet.create({
      container: { /* ... */ },
      titleText: { /* ... */ },
      profileImage: { /* ... */ },
      buttonContainer: { /* ... */ },
      activeIndicator: { /* ... */ }
    });
    ```

## Asset Naming (Images, Fonts, etc.)

-   **Convention**: `snake_case` or `kebab-case` (lowercase)
    -   This is often preferred for assets as it avoids case sensitivity issues across different file systems and platforms.
-   **Details**: Be descriptive. Include size or variant if applicable.
-   **Example**:
    -   Images: `icon_user_avatar.png`, `background_login_screen.jpg`, `logo@2x.png`
    -   Fonts: `roboto_regular.ttf`, `open_sans_bold.otf`
    -   Ensure consistency with how assets are referenced in code (e.g. `require('./assets/icon_user_avatar.png')`).

## Native Module Naming

-   **Native Class Names (Java/Kotlin/Swift/Objective-C)**: Follow platform conventions (`PascalCase` for classes).
    -   Example (Java/Kotlin): `MyCustomModule`
    -   Example (Swift): `MyCustomModule`
    -   Example (Objective-C): `RNMyCustomModule` (often prefixed)
-   **JavaScript Interface for Native Module**: `PascalCase` (matching the module name exposed to JS).
    -   Example: `import { MyCustomModule } from 'react-native';` or `const { MyCustomModule } = NativeModules;`

## Folder Naming

-   **Convention**: `camelCase` or `kebab-case` (lowercase) for most folders. `PascalCase` can be used for folders containing components if that's the team convention.
-   **Example**:
    -   `src/components/`
    -   `src/screens/`
    -   `src/features/user-authentication/`
    -   `src/assets/images/`

Adherence to these naming conventions will significantly improve the development experience and long-term maintainability of the {projectPath} React Native application.
```
