---
description: Core architectural concepts for React Native applications.
globs: <root>/**/*.{js,jsx,ts,tsx}
alwaysApply: true
---

# React Native Architecture Concepts

Understanding the core architecture of React Native is crucial for building robust and performant mobile applications in {projectPath}. This document covers key concepts and common architectural patterns.

## The React Native Bridge

React Native allows you to build mobile apps using JavaScript that run on native platforms (iOS and Android). This is achieved through a "bridge" that facilitates communication between the JavaScript realm and the Native realm.

-   **JavaScript Thread**: This is where your React Native application code runs. It includes your components, business logic, and JavaScript libraries.
-   **Native Thread(s)**: These are the main UI thread and other native threads responsible for rendering native UI components, handling user gestures, and accessing device APIs (like camera, GPS, etc.).
-   **The Bridge**: This is an asynchronous, batched, and serializable communication channel.
    -   **JS to Native**: When your JavaScript code needs to render a native UI element (e.g., `<View>`, `<Text>`) or call a native API, the instructions are bundled, serialized (typically as JSON), and sent over the bridge to the native side.
    -   **Native to JS**: Conversely, native events (like button presses, device rotation, or responses from native modules) are sent back to the JavaScript thread via the bridge.

The asynchronous nature of the bridge means that JavaScript and Native code do not directly block each other, which is important for performance. However, excessive communication over the bridge (the "bridge tax") can lead to performance bottlenecks.

## Native Modules

Native Modules are custom pieces of native code (written in Java/Kotlin for Android or Objective-C/Swift for iOS) that can be invoked from JavaScript. They are used when:
-   You need to access platform-specific APIs not exposed by React Native core components.
-   Performance-critical tasks (e.g., image processing, heavy computations) are better suited for native execution.
-   You want to reuse existing native libraries.

React Native provides mechanisms to create and register these modules, making them available to your JavaScript code.

## UI Rendering Lifecycle

1.  **JavaScript Renders**: Your React components render, producing a tree of UI elements.
2.  **Bridge Communication**: This tree is translated into a serialized message and sent to the native side.
3.  **Native UI Updates**: The native platform interprets this message and creates/updates the corresponding native UI views (e.g., `UIView` on iOS, `android.view.View` on Android).
4.  **User Interaction**: The user interacts with the native UI.
5.  **Native Event to JS**: These interactions are translated into events sent back across the bridge to the JavaScript thread.
6.  **JS Event Handling**: Your JavaScript event handlers process these events, potentially leading to state changes and re-renders, starting the cycle again.

React Native aims to keep the UI thread as free as possible. Layout calculations (using Yoga, a cross-platform layout engine) can happen on a separate shadow thread before being committed to the main UI thread.

## Component-Based Structure

Like React, React Native applications are built using a hierarchy of reusable components. This promotes modularity, maintainability, and code reuse.

## Common Architectural Patterns

While React Native doesn't enforce a specific architectural pattern beyond its component model, several patterns are commonly adopted:

-   **Flux/Redux-like Patterns**: For managing global application state, patterns like Flux (or libraries like Redux, Zustand, Jotai) are popular. They provide a unidirectional data flow, making state changes predictable and easier to debug.
-   **Feature-First (or Module-Based) Structure**: Organizing code by features rather than by type (e.g., putting all authentication-related components, screens, and logic in an `auth` folder). This improves scalability and team collaboration.
-   **Service Layers**: Abstracting API calls, data storage, or other external interactions into dedicated service modules.

## Typical Project Structure

A common project structure for a React Native application in {projectPath} might look like this:

```
{projectPath}/
├── android/          # Android native project files
├── ios/              # iOS native project files
├── src/              # Main JavaScript/TypeScript source code
│   ├── assets/       # Images, fonts, static data
│   ├── components/   # Reusable UI components (atomic/shared)
│   │   ├── common/
│   │   └── ui/
│   ├── config/       # Application configuration, environment variables
│   ├── features/     # Feature-based modules (alternative to screens/components at top level)
│   │   └── Auth/
│   │       ├── components/
│   │       ├── screens/
│   │       └── state/
│   ├── navigation/   # Navigation setup (e.g., React Navigation stacks, tabs)
│   ├── screens/      # Top-level screen components (if not using feature-first)
│   ├── services/     # API clients, utility services
│   ├── state/        # Global state management (e.g., Redux store, Zustand store)
│   │   ├── actions/
│   │   ├── reducers/
│   │   └── selectors/
│   ├── styles/       # Global styles, theme definitions
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── App.tsx           # Root React Native component
├── index.js          # Entry point for the application
└── package.json      # Project dependencies and scripts
```

The choice of structure depends on the project's scale and team preferences. Consistency is key.
The new architecture (New Architecture / Fabric) in React Native aims to evolve the bridge model for more synchronous communication capabilities and improved performance, but the core concepts of JS/Native interaction remain fundamental.
```
