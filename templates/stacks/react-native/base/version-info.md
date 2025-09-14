---
description: Version information for React Native applications
globs: <root>/package.json,<root>/android/app/build.gradle,<root>/ios/Podfile
alwaysApply: true
---

# React Native Version Information

This project is using React Native **{detectedVersion}**. This guide covers version-specific features, upgrade paths, and compatibility information for React Native development in {projectPath}.

## Supported React Native Versions

### Current Stable Versions

-   **React Native 0.72.x** (Stable)

    -   New Architecture (Fabric + TurboModules) stable
    -   Improved performance and stability
    -   Better TypeScript support

-   **React Native 0.73.x** (Latest)
    -   Bridgeless mode improvements
    -   Enhanced Metro bundler
    -   Better Hermes integration

## Version Detection

Check your React Native version:

```bash
# Check React Native version
npx react-native --version

# Check project version
cat package.json | grep "react-native"
```

## Platform Requirements

### iOS Requirements

-   iOS 12.4+ (React Native 0.72+)
-   iOS 13.0+ (React Native 0.73+)

### Android Requirements

-   API 21+ (Android 5.0+) for React Native 0.72+
-   API 23+ (Android 6.0+) for React Native 0.73+

## Node.js Compatibility

| React Native | Node.js     | NPM  |
| ------------ | ----------- | ---- |
| 0.72.x       | 16.x - 18.x | 8.x+ |
| 0.73.x       | 16.x - 20.x | 8.x+ |

## Upgrade Guide

```bash
# Use React Native Upgrade Helper
# Visit: https://react-native-community.github.io/upgrade-helper/

# Upgrade to specific version
npx react-native upgrade 0.73.0
```

## New Architecture

### Enabling New Architecture

```javascript
// android/gradle.properties
newArchEnabled = true;

// ios/Podfile
ENV['RCT_NEW_ARCH_ENABLED'] = '1';
```

## Compatibility Matrix

| Feature          | 0.72.x | 0.73.x |
| ---------------- | ------ | ------ |
| New Architecture | ✅     | ✅     |
| Bridgeless Mode  | 🧪     | ✅     |
| Hermes Default   | ✅     | ✅     |

Use `npx react-native --version` to verify your runtime version and refer to the [React Native releases](https://github.com/facebook/react-native/releases) for updates.
