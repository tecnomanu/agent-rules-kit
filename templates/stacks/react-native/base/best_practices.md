---
description: Best practices for developing React Native applications.
globs: <root>/**/*.{js,jsx,ts,tsx}
alwaysApply: true
---

# React Native Best Practices

Developing high-quality React Native applications for {projectPath} requires adherence to best practices that focus on performance, maintainability, security, and user experience.

## Performance Optimization

-   **Memoization**:
    -   Use `React.useMemo` to memoize expensive calculations.
    -   Use `React.useCallback` to memoize functions passed as props to child components, preventing unnecessary re-renders.
    -   Wrap components in `React.memo` to prevent re-renders if props haven't changed. Use judiciously, as it adds overhead.
-   **List Optimization**:
    -   For long lists, use `FlatList` or `SectionList` instead of `ScrollView` + `map`. These components virtualize rows, rendering only items currently visible on screen.
    -   Implement `getItemLayout` for `FlatList` if item heights are fixed, to speed up rendering.
    -   Ensure `keyExtractor` provides unique, stable keys.
    -   Optimize list items: keep them lightweight, use `React.memo` if appropriate.
-   **Avoiding Unnecessary Renders**:
    -   Minimize prop changes to child components.
    -   Structure state effectively; avoid deeply nested state objects that cause widespread re-renders.
    -   Understand how React's reconciliation process works.
-   **Offloading Heavy Tasks**:
    -   Move computationally intensive tasks off the JavaScript thread to native modules or using libraries that support background threads (e.g., `react-native-threads` for CPU-bound tasks, though use with caution).
    -   For animations, prefer the Animated API's `useNativeDriver: true` option to run animations on the UI thread, making them smoother.
-   **Image Optimization**:
    -   Use appropriate image formats (e.g., WebP for smaller size and good quality).
    -   Resize images to the dimensions they will be displayed at.
    -   Use libraries like `react-native-fast-image` for better caching and performance.
-   **Lazy Loading**: Load components and modules only when they are needed using `React.lazy` and dynamic imports (though support in React Native can vary or require specific Babel setups).

## Bundle Size Reduction

-   **Analyze Bundle**: Use tools like `react-native-bundle-visualizer` to understand what's contributing to your bundle size.
-   **Tree Shaking**: Ensure your build process (Metro bundler) is configured to perform tree shaking, which removes unused code. This is generally effective with ES6 modules.
-   **Optimize Assets**: Compress images, fonts, and other assets.
-   **Selective Library Imports**: Import only the specific functions or components you need from libraries (e.g., `import get from 'lodash/get'` instead of `import _ from 'lodash'`).
-   **Remove Unused Code**: Regularly audit and remove dead code, unused libraries, and old features.

## Managing Native Dependencies

-   **Keep Dependencies Updated**: Regularly update your React Native version and third-party native modules to get bug fixes, performance improvements, and new features.
-   **Use Autolinking**: React Native's autolinking feature simplifies the installation of most native modules.
-   **Understand Native Build Systems**: Basic familiarity with Xcode (for iOS) and Gradle (for Android) is helpful for troubleshooting build issues.
-   **Check Compatibility**: Before adding a new native module, check its compatibility with your React Native version and other libraries.

## Error Handling

-   **Error Boundaries**: Implement React Error Boundaries at appropriate levels in your component tree to catch JavaScript errors in components and display a fallback UI instead of crashing the app.
-   **Try-Catch Blocks**: Use `try...catch` for synchronous operations and `.catch()` for promises to handle errors gracefully.
-   **Global Error Handler**: Consider setting up a global error handler (e.g., `ErrorUtils.setGlobalHandler()`) for unhandled exceptions, primarily for logging/reporting.
-   **Crash Reporting**: Integrate a crash reporting tool (e.g., Sentry, Firebase Crashlytics, Bugsnag) to monitor and diagnose issues in production.

## Security Considerations

-   **Data Storage**:
    -   Avoid storing sensitive information in AsyncStorage (or `localStorage` equivalent) as it's unencrypted.
    -   For sensitive data, use secure storage solutions like `react-native-keychain` or `expo-secure-store`.
-   **API Keys & Secrets**:
    -   Do not hardcode API keys or secrets directly in your JavaScript code.
    -   Use environment variables (e.g., via `.env` files and `react-native-config`) or native build configurations to manage them.
    -   Ideally, API keys that grant significant access should be managed by a backend proxy.
-   **Network Security**:
    -   Use HTTPS for all API communications.
    -   Implement SSL pinning for critical connections if high security is required, though this adds complexity.
-   **Input Validation**: Validate all user input on both the client-side and server-side.
-   **Deep Linking Security**: Be cautious with deep linking parameters; validate and sanitize them.
-   **Code Obfuscation**: While not foolproof, consider code obfuscation as part of your build process for production apps to make reverse-engineering harder.

## Platform Consistency vs. Platform-Specific UX

-   **Strive for Consistency**: Aim for a consistent brand identity and core user experience across platforms.
-   **Respect Platform Conventions**: Adhere to platform-specific design guidelines and user expectations where it makes sense (e.g., navigation patterns, alert dialogs, date pickers).
-   **Use `Platform.select` or File Extensions**: Implement platform-specific adjustments using `Platform.select()` or `.ios.js`/`.android.js` file extensions.
-   **Test on Both Platforms**: Regularly test on both iOS and Android devices to catch platform-specific issues and ensure a good UX.

## Development Workflow

-   **Use TypeScript or Flow**: For type safety and improved developer experience.
-   **Linting and Formatting**: Use ESLint, Prettier, and a style guide to maintain code consistency.
-   **Fast Refresh**: Leverage React Native's Fast Refresh for quicker feedback during development.
-   **Debugging Tools**: Utilize Flipper, React Native Debugger, or Chrome DevTools effectively.

By following these best practices, teams working on {projectPath} can build more stable, performant, and maintainable React Native applications.
```
