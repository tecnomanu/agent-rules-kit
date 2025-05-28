---
description: Fundamental concepts of navigation in React Native applications.
globs: <root>/**/*.{js,jsx,ts,tsx}
alwaysApply: true
---

# Navigation in React Native Applications

Navigation is a core part of almost every mobile application, allowing users to move between different screens and content. In {projectPath}, a robust navigation solution is essential. React Navigation is the de-facto standard and most widely recommended library for handling navigation in React Native.

## React Navigation: The Primary Choice

React Navigation is a comprehensive, extensible, and community-driven navigation solution. It offers:
-   Navigators for common UI patterns (stack, tabs, drawer).
-   Customizable appearance and behavior.
-   Support for deep linking.
-   Integration with platform navigation elements.
-   Type checking with TypeScript.

### Core Concepts of React Navigation

1.  **Navigators**: These are components that define how your screens are presented and transition. Common types include:
    -   **Stack Navigator (`createStackNavigator`)**: Manages a stack of screens. New screens are pushed onto the stack, and pressing the back button pops them off. Ideal for sequential flows like user onboarding or drilling down into details.
    -   **Tab Navigator (`createBottomTabNavigator`, `createMaterialTopTabNavigator`)**: Displays a set of tabs (usually at the bottom or top of the screen) to switch between different sections of the app.
    -   **Drawer Navigator (`createDrawerNavigator`)**: Provides a navigation drawer that slides in from the side of the screen. Useful for apps with many top-level sections.

2.  **Screens**: These are your React components that represent different views in your application (e.g., `HomeScreen`, `ProfileScreen`). Each screen is registered with a navigator.

3.  **Navigation Container (`NavigationContainer`)**: This is a top-level component that wraps your entire navigator structure. It manages the navigation tree and contains the navigation state. It must be the root of your navigation setup.

4.  **Route Object**: Each screen in a navigator receives a `route` prop. This object contains information about the current route, such as:
    -   `route.name`: The name of the screen as defined in the navigator.
    -   `route.params`: An object containing parameters passed to this screen.

5.  **Navigation Prop (`navigation`)**: Each screen also receives a `navigation` prop. This prop provides methods to interact with the navigator, such as:
    -   `navigation.navigate('ScreenName', { params })`: Go to another screen.
    -   `navigation.goBack()`: Go back to the previous screen in the stack.
    -   `navigation.setParams({ params })`: Update the params for the current screen.
    -   `navigation.dispatch(action)`: Dispatch a navigation action for more complex scenarios.

### Basic Setup Example (Stack Navigator)

```javascript
// App.js or your main navigation file
import * as React from 'react';
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details', { itemId: 86, otherParam: 'anything' })}
      />
    </View>
  );
}

function DetailsScreen({ route, navigation }) {
  const { itemId, otherParam } = route.params; // Access passed parameters
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
      <Text>Item ID: {JSON.stringify(itemId)}</Text>
      <Text>Other Param: {JSON.stringify(otherParam)}</Text>
      <Button title="Go to Details... again" onPress={() => navigation.push('Details', { itemId: Math.floor(Math.random() * 100) })} />
      <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
      <Button title="Go back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Overview' }} // Screen-specific options
        />
        <Stack.Screen 
          name="Details" 
          component={DetailsScreen} 
          initialParams={{ itemId: 42 }} // Default params
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
```

### Navigating Between Screens

-   `navigation.navigate('ScreenName')`: Navigates to the specified screen. If the screen is already in the stack, it will go back to it. If not, it pushes it.
-   `navigation.push('ScreenName')`: Always adds a new screen to the top of the stack, even if one of the same type already exists.
-   `navigation.popToTop()`: Goes back to the first screen in the stack.
-   `navigation.replace('ScreenName')`: Replaces the current screen with a new one.

### Passing Parameters to Routes

You can pass parameters when navigating:
`navigation.navigate('Details', { userId: 1, userName: 'Jane' });`

Access parameters in the target screen:
`const { userId, userName } = route.params;`

### Handling Navigation State

React Navigation manages the navigation state internally. You can interact with this state using `navigation` and `route` props. For more advanced state management or persistence, React Navigation offers solutions like state persistence.

### Common Navigation Patterns

-   **Authentication Flow**:
    -   Conditionally render different navigators based on authentication status (e.g., user token).
    -   Typically, an `AuthNavigator` (Login, SignUp screens) and a `MainAppNavigator` (rest of the app).
    -   Switch between these navigators once the authentication state changes.
-   **Modal Screens**: Stack navigator can present screens as modals using the `mode="modal"` option or `presentation: 'modal'` in screen options.
-   **Nested Navigators**: You can nest navigators (e.g., a tab navigator inside a stack navigator) to create complex navigation structures.

### Deep Linking

React Navigation supports deep linking, allowing users to open specific screens in your app from URLs or push notifications. Configuration involves setting up prefixes and mapping paths to screen names.

While React Navigation is dominant, other libraries or custom solutions exist but are less common for general-purpose navigation. For {projectPath}, leveraging React Navigation is highly recommended for its robustness and extensive feature set.
```
