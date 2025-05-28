---
description: Handling platform-specific code (iOS/Android) in React Native.
globs: <root>/**/*.{js,jsx,ts,tsx}
alwaysApply: true
---

# Handling Platform-Specific Code in React Native

React Native aims to provide a "learn once, write anywhere" paradigm, but often you'll need to write platform-specific code to accommodate differences in UI conventions, native APIs, or behavior between iOS and Android. In {projectPath}, effectively managing this is key to a polished user experience.

## 1. Platform-Specific File Extensions

React Native's Metro bundler can automatically pick the correct file based on its extension when you import a module.

-   **`.ios.js` / `.ios.jsx` / `.ios.ts` / `.ios.tsx`**: Files with these extensions will only be bundled for iOS.
-   **`.android.js` / `.android.jsx` / `.android.ts` / `.android.tsx`**: Files with these extensions will only be bundled for Android.
-   **`.native.js` / `.native.jsx` / `.native.ts` / `.native.tsx`**: Files with these extensions will be bundled for both iOS and Android, but not for web (if you're using React Native for Web).
-   **Base File (e.g., `MyComponent.js`)**: If no platform-specific version is found, React Native will use the base file.

**Example**:
Imagine you have a component `CustomButton`.

```
// src/components/CustomButton/index.js (entry point)
import CustomButton from './CustomButton';
export default CustomButton;

// src/components/CustomButton/CustomButton.ios.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButtonIOS = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.buttonIOS}>
    <Text style={styles.textIOS}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({ /* iOS specific styles */ });
export default CustomButtonIOS;

// src/components/CustomButton/CustomButton.android.js
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native'; // Using Pressable for ripple effect

const CustomButtonAndroid = ({ title, onPress }) => (
  <Pressable onPress={onPress} style={styles.buttonAndroid} android_ripple={{ color: 'grey' }}>
    <Text style={styles.textAndroid}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({ /* Android specific styles */ });
export default CustomButtonAndroid;

// Usage elsewhere:
// import CustomButton from './src/components/CustomButton';
// <CustomButton title="Tap me" onPress={...} />
// React Native will automatically load the correct .ios.js or .android.js file.
```
This approach is best when the entire component or module has significant differences between platforms.

## 2. The `Platform` Module

React Native provides a `Platform` module that you can use to write conditional logic within a single component or file.

-   **`Platform.OS`**: A string that is `'ios'` on iOS, `'android'` on Android. It can also be `'windows'` or `'macos'` for those platforms, or `'web'` if using React Native for Web.
-   **`Platform.Version`**:
    -   On iOS, it's the iOS version as a string (e.g., "14.5").
    -   On Android, it's the Android API level as a number (e.g., 29 for Android 10).
-   **`Platform.select(config)`**: A utility function that takes an object where keys can be `'ios'`, `'android'`, `'native'`, `'default'`, and returns the value for the current platform.

**Example using `Platform.OS`**:
```javascript
import { Platform, StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
  textStyle: {
    fontSize: Platform.OS === 'ios' ? 20 : 18,
    color: Platform.OS === 'android' ? 'green' : 'blue',
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  }
});

const MyTextComponent = ({ children }) => <Text style={styles.textStyle}>{children}</Text>;
```

**Example using `Platform.select`**:
```javascript
import { Platform, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.select({
      ios: 20,
      android: 10,
      default: 0, // for other platforms
    }),
    backgroundColor: Platform.select({
      ios: 'silver',
      android: 'lightgrey',
    }),
  },
});

const MyContainer = ({ children }) => <View style={styles.container}>{children}</View>;
```
`Platform.select` is often cleaner for defining style objects or configuration objects that vary by platform.

## Organizing Platform-Specific Logic

-   **Small Differences**: Use `Platform.OS` or `Platform.select` directly within your component's style definitions or render logic for minor adjustments.
-   **Moderate Differences**: If logic or styles become too cluttered with inline checks, consider creating platform-specific helper functions or style objects within the same file, or use platform-specific file extensions for parts of a component.
-   **Large Differences**: If components are substantially different, use platform-specific file extensions (`.ios.js`, `.android.js`) for the entire component or module.

## Considerations for Native Modules

-   **Availability**: Some native modules might only be available for one platform, or might have different APIs. You'll need to check the module's documentation and potentially write wrappers or conditional logic.
    ```javascript
    import { NativeModules, Platform } from 'react-native';

    const MyNativeModule = NativeModules.MySpecificModule; // Might be null if not available

    function doSomethingNative() {
      if (Platform.OS === 'ios' && MyNativeModule && MyNativeModule.doIOSThing) {
        MyNativeModule.doIOSThing();
      } else if (Platform.OS === 'android' && MyNativeModule && MyNativeModule.doAndroidThing) {
        MyNativeModule.doAndroidThing();
      } else {
        console.warn("MySpecificModule is not available on this platform or method doesn't exist.");
      }
    }
    ```
-   **Custom Native Modules**: When writing your own native modules, you'll inherently be writing separate code for iOS (Swift/Objective-C) and Android (Kotlin/Java). Your JavaScript interface will then call these.

## UI Components Differing by Platform

-   Some built-in React Native components render differently by default to match platform conventions (e.g., `Switch`, `Picker`, `Alert`).
-   For more complex UI differences, you might use the file extension method to provide entirely different component implementations.
-   Libraries like `react-native-platform-touchable` can provide platform-adapted touchable components.

By thoughtfully applying these strategies, you can manage platform-specific code effectively in {projectPath}, ensuring a native look and feel where appropriate while maximizing code reuse.
```
