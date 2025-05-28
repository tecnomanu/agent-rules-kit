---
description: Styling approaches and best practices in React Native.
globs: <root>/**/*.{js,jsx,ts,tsx}
alwaysApply: true
---

# Styling in React Native Applications

Styling is a fundamental aspect of building visually appealing and user-friendly React Native applications for {projectPath}. React Native provides several ways to style components, each with its own advantages and use cases.

## `StyleSheet.create` API

The most common way to define styles in React Native is using the `StyleSheet.create` API. This method offers performance benefits by sending the style objects over the bridge only once and referring to them by ID later. It also helps in validating your style declarations.

-   **Syntax**:
    ```javascript
    import { StyleSheet, Text, View } from 'react-native';

    const MyComponent = () => (
      <View style={styles.container}>
        <Text style={styles.title}>Hello, {projectPath}!</Text>
      </View>
    );

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
      },
      title: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        color: '#333333',
      },
    });

    export default MyComponent;
    ```
-   **Benefits**:
    -   Performance optimizations.
    -   Code organization and readability.
    -   Validation of style properties.

## Inline Styles

You can apply styles directly to a component using an inline object. This is convenient for dynamic styles or quick, one-off styling needs.

-   **Syntax**:
    ```javascript
    <Text style={{ fontSize: 16, color: 'blue', fontWeight: 'bold' }}>
      Inline Styled Text
    </Text>
    ```
-   **Considerations**:
    -   Less performant for complex or frequently changing styles compared to `StyleSheet.create` because the style object is created anew on each render.
    -   Can make JSX verbose if many styles are applied.
    -   Generally recommended for dynamic styles that depend on component state or props.

## Prop-Based Styling

Components can be designed to accept props that influence their styles. This is a powerful way to create reusable and configurable components.

-   **Example**:
    ```javascript
    const Button = ({ title, primary }) => (
      <View style={[styles.buttonBase, primary ? styles.buttonPrimary : styles.buttonSecondary]}>
        <Text style={styles.buttonText}>{title}</Text>
      </View>
    );

    // Usage: <Button title="Submit" primary />
    ```

## Platform-Specific Styles

Often, you'll need to apply different styles for iOS and Android. React Native provides the `Platform` module for this.

-   **Using `Platform.OS`**:
    ```javascript
    const styles = StyleSheet.create({
      header: {
        fontSize: Platform.OS === 'ios' ? 24 : 20,
        paddingTop: Platform.OS === 'android' ? 20 : 0,
      },
    });
    ```
-   **Using `Platform.select`**:
    ```javascript
    const styles = StyleSheet.create({
      container: Platform.select({
        ios: {
          backgroundColor: 'silver',
        },
        android: {
          backgroundColor: 'blue',
        },
        default: { // For other platforms like web
          backgroundColor: 'green',
        }
      }),
    });
    ```

You can also use platform-specific file extensions (e.g., `MyComponent.ios.js`, `MyComponent.android.js`) for more significant stylistic differences that might involve different component structures.

## Common Styling Libraries

While `StyleSheet` is the core, several libraries offer different paradigms:

-   **Styled Components for React Native (`styled-components/native`)**:
    -   Allows writing CSS code directly in your JavaScript/TypeScript files using tagged template literals.
    -   Encapsulates styles within the component itself.
    -   Supports theming and dynamic props easily.
    -   Example:
        ```javascript
        import styled from 'styled-components/native';

        const StyledView = styled.View`
          background-color: papayawhip;
          padding: 10px;
        `;
        const StyledText = styled.Text`
          color: palevioletred;
          font-size: ${props => props.large ? '24px' : '16px'};
        `;
        // <StyledView><StyledText large>Hello</StyledText></StyledView>
        ```
-   **Restyle (Shopify)**:
    -   A type-enforced system for building UI components in React Native with a focus on theming and constraints.
    -   Promotes consistency by defining a design system (palette, spacing, variants).
-   **NativeWind (Tailwind CSS for React Native)**:
    -   Allows using Tailwind CSS utility classes directly in your React Native components.
    -   Requires a setup step to compile Tailwind utilities into `StyleSheet` objects.
    -   Example: `<Text className="text-blue-500 font-bold text-lg">Hello Tailwind!</Text>`
-   **Emotion (`@emotion/native`)**: Similar to Styled Components, offering CSS-in-JS capabilities.

## Theming Strategies

For consistent styling across your app, especially with dark mode or multiple brand themes:

-   **React Context API**: Use Context to provide theme values (colors, fonts, spacing) to components.
-   **CSS-in-JS Libraries**: Most CSS-in-JS libraries (like Styled Components, Emotion) have built-in `ThemeProvider` components.
-   **Custom Theme Objects**: Define theme objects and pass them down or access them via context.

```javascript
// Example with Context API
const ThemeContext = React.createContext();

const AppThemeProvider = ({ children, theme }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

const useAppTheme = () => useContext(ThemeContext);

// In a component:
// const theme = useAppTheme();
// <View style={{ backgroundColor: theme.colors.background }} />
```

## Organizing Styles

-   **Co-location**: Keep styles for a specific component within the same file or in a nearby `styles.js` file.
-   **Global Styles**: Define global styles (e.g., typography, color palette) in a central theme file and import them where needed.
-   **Style Inheritance**: React Native does not support CSS-style inheritance in the same way the web does. Styles are generally not inherited from parent to child, except for some text properties within `<Text>` components.

Choosing the right styling approach for {projectPath} depends on team familiarity, project size, and the need for dynamic theming or utility-first approaches. `StyleSheet.create` is the foundation, while libraries can offer more advanced patterns.
```
