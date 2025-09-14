---
description: Component styling patterns for React Native applications
globs: <root>/src/**/*.ts,<root>/src/**/*.tsx,<root>/src/**/*.js,<root>/src/**/*.jsx
alwaysApply: false
---

# React Native Component Styling

This guide covers styling patterns and best practices for React Native components in {projectPath}, including StyleSheet usage, responsive design, and theming.

## StyleSheet Fundamentals

### Basic StyleSheet Usage

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const UserCard = ({ user }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  email: {
    fontSize: 14,
    color: '#666666',
  },
});
```

### Dynamic Styling

```javascript
import { StyleSheet } from 'react-native';

export const Button = ({ variant, size, disabled, children, ...props }) => {
  const buttonStyles = [
    styles.button,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`],
    disabled && styles.buttonDisabled,
  ];

  const textStyles = [
    styles.buttonText,
    styles[`buttonText${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    disabled && styles.buttonTextDisabled,
  ];

  return (
    <TouchableOpacity style={buttonStyles} disabled={disabled} {...props}>
      <Text style={textStyles}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#6C757D',
  },
  buttonDanger: {
    backgroundColor: '#DC3545',
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
  buttonTextDanger: {
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#999999',
  },
});
```

## Responsive Design

### Screen Dimensions

```javascript
import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
export const screenWidth = width;
export const screenHeight = height;

// Responsive font sizes
export const normalize = (size) => {
  const scale = screenWidth / 320;
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

// Usage in styles
const styles = StyleSheet.create({
  title: {
    fontSize: normalize(24),
    lineHeight: normalize(30),
  },
  subtitle: {
    fontSize: normalize(18),
    lineHeight: normalize(24),
  },
  body: {
    fontSize: normalize(16),
    lineHeight: normalize(22),
  },
});
```

### Device Orientation

```javascript
import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height 
      ? 'landscape' 
      : 'portrait'
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    });

    return () => subscription?.remove();
  }, []);

  return orientation;
};

// Usage in component
export const ResponsiveGrid = ({ data }) => {
  const orientation = useOrientation();
  const numColumns = orientation === 'landscape' ? 3 : 2;

  return (
    <FlatList
      data={data}
      numColumns={numColumns}
      key={orientation} // Force re-render on orientation change
      renderItem={({ item }) => <GridItem item={item} />}
    />
  );
};
```

### Breakpoints

```javascript
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const breakpoints = {
  small: 0,
  medium: 768,
  large: 1024,
};

export const getBreakpoint = () => {
  if (width >= breakpoints.large) return 'large';
  if (width >= breakpoints.medium) return 'medium';
  return 'small';
};

// Responsive styles
export const createResponsiveStyles = () => {
  const breakpoint = getBreakpoint();
  
  return StyleSheet.create({
    container: {
      padding: breakpoint === 'small' ? 16 : 24,
      flexDirection: breakpoint === 'small' ? 'column' : 'row',
    },
    sidebar: {
      width: breakpoint === 'small' ? '100%' : '30%',
      marginBottom: breakpoint === 'small' ? 16 : 0,
      marginRight: breakpoint === 'small' ? 0 : 16,
    },
    content: {
      width: breakpoint === 'small' ? '100%' : '70%',
    },
  });
};
```

## Theme System

### Theme Configuration

```javascript
// themes/index.ts
export const lightTheme = {
  colors: {
    primary: '#007AFF',
    secondary: '#6C757D',
    success: '#28A745',
    danger: '#DC3545',
    warning: '#FFC107',
    info: '#17A2B8',
    light: '#F8F9FA',
    dark: '#343A40',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
    h2: { fontSize: 28, fontWeight: '600', lineHeight: 36 },
    h3: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
    body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#0A84FF',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    border: '#38383A',
  },
};
```

### Theme Provider

```javascript
// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'

  const getActiveTheme = () => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getActiveTheme();

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Themed Components

```javascript
// components/ThemedButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const ThemedButton = ({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  style,
  ...props 
}) => {
  const { theme } = useTheme();
  
  const styles = createStyles(theme);
  
  const buttonStyles = [
    styles.button,
    styles[`button${size}`],
    { backgroundColor: theme.colors[variant] },
    style,
  ];

  return (
    <TouchableOpacity style={buttonStyles} {...props}>
      <Text style={[styles.text, { color: variant === 'light' ? theme.colors.dark : theme.colors.light }]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme) => StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  buttonsmall: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  buttonmedium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  buttonlarge: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  text: {
    ...theme.typography.body1,
    fontWeight: '600',
  },
});
```

## Platform-Specific Styling

### Platform Differences

```javascript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 0, // iOS status bar
    ...Platform.select({
      ios: {
        backgroundColor: '#F2F2F7',
      },
      android: {
        backgroundColor: '#FAFAFA',
      },
    }),
  },
  header: {
    height: Platform.OS === 'ios' ? 44 : 56,
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#2196F3',
    ...Platform.select({
      ios: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#C7C7CC',
      },
      android: {
        elevation: 4,
      },
    }),
  },
  button: {
    ...Platform.select({
      ios: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
      },
      android: {
        backgroundColor: '#2196F3',
        borderRadius: 4,
        elevation: 2,
      },
    }),
  },
});
```

### Safe Area Handling

```javascript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SafeScreen = ({ children }) => {
  const insets = useSafeAreaInsets();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  });

  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};
```

## Animation Styling

### Animated Values

```javascript
import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity } from 'react-native';

export const AnimatedButton = ({ children, onPress, style }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatedStyle = {
    transform: [{ scale: scaleValue }],
    opacity: opacityValue,
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={1}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};
```

## Performance Optimization

### StyleSheet Caching

```javascript
// utils/styleCache.ts
const styleCache = new Map();

export const createCachedStyles = (key, styleFactory, dependencies = []) => {
  const cacheKey = `${key}_${dependencies.join('_')}`;
  
  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey);
  }
  
  const styles = StyleSheet.create(styleFactory(...dependencies));
  styleCache.set(cacheKey, styles);
  
  return styles;
};

// Usage
const MyComponent = ({ theme, size }) => {
  const styles = createCachedStyles('MyComponent', (theme, size) => ({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing[size],
    },
  }), [theme, size]);

  return <View style={styles.container} />;
};
```

### Style Composition

```javascript
// utils/styleComposer.ts
export const composeStyles = (...styles) => {
  return styles.filter(Boolean).flat();
};

// Usage
const MyComponent = ({ variant, size, disabled, style }) => {
  const componentStyles = composeStyles(
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style
  );

  return <View style={componentStyles} />;
};
```

This styling system provides a comprehensive approach to React Native component styling with theming, responsiveness, and performance optimization.
