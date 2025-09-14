---
description: Platform-specific code patterns for React Native applications
globs: <root>/src/**/*.ts,<root>/src/**/*.tsx,<root>/src/**/*.js,<root>/src/**/*.jsx,<root>/android/**/*,<root>/ios/**/*
alwaysApply: false
---

# React Native Platform-Specific Code

This guide covers platform-specific development patterns for React Native applications in {projectPath}, including iOS and Android differences, native modules, and platform detection.

## Platform Detection

### Basic Platform Detection

```javascript
import { Platform } from 'react-native';

// Simple platform check
if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'android') {
  // Android-specific code
}

// Platform version check
if (Platform.OS === 'ios' && Platform.Version >= '14') {
  // iOS 14+ specific code
}

if (Platform.OS === 'android' && Platform.Version >= 30) {
  // Android API 30+ specific code
}
```

### Platform-Specific Styling

```javascript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 0, // iOS status bar
    ...Platform.select({
      ios: {
        backgroundColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        backgroundColor: '#FAFAFA',
        elevation: 4,
      },
    }),
  },
  header: {
    height: Platform.OS === 'ios' ? 44 : 56,
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#2196F3',
  },
  button: {
    borderRadius: Platform.OS === 'ios' ? 8 : 4,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
});
```

## Platform-Specific Components

### Conditional Component Rendering

```javascript
// components/PlatformButton.tsx
import React from 'react';
import { Platform, TouchableOpacity, TouchableNativeFeedback } from 'react-native';

export const PlatformButton = ({ children, onPress, style }) => {
  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity style={style} onPress={onPress}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableNativeFeedback onPress={onPress}>
      <View style={style}>{children}</View>
    </TouchableNativeFeedback>
  );
};
```

### Platform-Specific File Extensions

```javascript
// Create separate files for each platform:
// Button.ios.tsx
// Button.android.tsx
// Button.tsx (fallback)

// React Native automatically selects the correct file
import { Button } from './components/Button';

// iOS implementation - Button.ios.tsx
export const Button = ({ title, onPress }) => (
  <TouchableOpacity style={iosStyles.button} onPress={onPress}>
    <Text style={iosStyles.text}>{title}</Text>
  </TouchableOpacity>
);

// Android implementation - Button.android.tsx
export const Button = ({ title, onPress }) => (
  <TouchableNativeFeedback onPress={onPress}>
    <View style={androidStyles.button}>
      <Text style={androidStyles.text}>{title}</Text>
    </View>
  </TouchableNativeFeedback>
);
```

## Native Modules Integration

### Using Native Modules

```javascript
// services/BiometricsService.ts
import TouchID from 'react-native-touch-id';
import { Platform } from 'react-native';

export class BiometricsService {
  static async isSupported(): Promise<boolean> {
    try {
      const biometryType = await TouchID.isSupported();
      return !!biometryType;
    } catch (error) {
      return false;
    }
  }

  static async authenticate(): Promise<boolean> {
    try {
      const optionalConfigObject = {
        title: 'Authentication Required',
        imageColor: '#e00606',
        imageErrorColor: '#ff0000',
        sensorDescription: 'Touch sensor',
        sensorErrorDescription: 'Failed',
        cancelText: 'Cancel',
        fallbackLabel: 'Show Passcode',
        unifiedErrors: false,
        passcodeFallback: false,
      };

      if (Platform.OS === 'android') {
        optionalConfigObject.title = 'Authenticate';
        optionalConfigObject.subTitle = 'Use your fingerprint or face to authenticate';
      }

      await TouchID.authenticate('Authenticate to access your account', optionalConfigObject);
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }
}
```

### Camera Integration

```javascript
// services/CameraService.ts
import { launchImageLibrary, launchCamera, MediaType } from 'react-native-image-picker';
import { Platform, Alert, Linking } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export class CameraService {
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  static async openCamera(): Promise<any> {
    const hasPermission = await this.requestCameraPermission();
    
    if (!hasPermission) {
      Alert.alert(
        'Camera Permission',
        'Please enable camera permission in settings to take photos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return null;
    }

    return new Promise((resolve) => {
      const options = {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
      };

      launchCamera(options, (response) => {
        if (response.assets && response.assets[0]) {
          resolve(response.assets[0]);
        } else {
          resolve(null);
        }
      });
    });
  }

  static async openImageLibrary(): Promise<any> {
    return new Promise((resolve) => {
      const options = {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
        selectionLimit: 1,
      };

      launchImageLibrary(options, (response) => {
        if (response.assets && response.assets[0]) {
          resolve(response.assets[0]);
        } else {
          resolve(null);
        }
      });
    });
  }
}
```

## Platform-Specific Navigation

### Status Bar Handling

```javascript
// components/StatusBarManager.tsx
import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const StatusBarManager = ({ barStyle = 'dark-content', backgroundColor }) => {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'ios') {
    return (
      <StatusBar
        barStyle={barStyle}
        backgroundColor="transparent"
        translucent
      />
    );
  }

  return (
    <StatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor || '#FFFFFF'}
      translucent={false}
    />
  );
};
```

### Safe Area Handling

```javascript
// components/SafeScreen.tsx
import React from 'react';
import { View, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SafeScreen = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  const safeAreaStyle = {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  return (
    <View style={[safeAreaStyle, style]}>
      {children}
    </View>
  );
};
```

## Device-Specific Features

### Haptic Feedback

```javascript
// utils/haptics.ts
import { Platform } from 'react-native';

let HapticFeedback: any;

if (Platform.OS === 'ios') {
  HapticFeedback = require('react-native-haptic-feedback').default;
}

export class HapticsService {
  static trigger(type: 'selection' | 'impactLight' | 'impactMedium' | 'impactHeavy' | 'notificationSuccess' | 'notificationWarning' | 'notificationError') {
    if (Platform.OS === 'ios' && HapticFeedback) {
      const options = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      };

      HapticFeedback.trigger(type, options);
    } else if (Platform.OS === 'android') {
      // Android vibration fallback
      const { Vibration } = require('react-native');
      
      switch (type) {
        case 'selection':
        case 'impactLight':
          Vibration.vibrate(10);
          break;
        case 'impactMedium':
          Vibration.vibrate(20);
          break;
        case 'impactHeavy':
        case 'notificationError':
          Vibration.vibrate(50);
          break;
        case 'notificationSuccess':
        case 'notificationWarning':
          Vibration.vibrate([10, 50]);
          break;
      }
    }
  }
}
```

### Device Info

```javascript
// utils/deviceInfo.ts
import DeviceInfo from 'react-native-device-info';
import { Platform, Dimensions } from 'react-native';

export class DeviceInfoService {
  static async getDeviceInfo() {
    const { width, height } = Dimensions.get('window');
    
    return {
      platform: Platform.OS,
      platformVersion: Platform.Version,
      deviceId: await DeviceInfo.getUniqueId(),
      deviceName: await DeviceInfo.getDeviceName(),
      systemName: await DeviceInfo.getSystemName(),
      systemVersion: await DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      bundleId: DeviceInfo.getBundleId(),
      screenWidth: width,
      screenHeight: height,
      isTablet: DeviceInfo.isTablet(),
      hasNotch: await DeviceInfo.hasNotch(),
      isEmulator: await DeviceInfo.isEmulator(),
    };
  }

  static isIPhoneX(): boolean {
    if (Platform.OS !== 'ios') return false;
    
    const { height, width } = Dimensions.get('window');
    return (
      (height === 812 || width === 812) || // iPhone X, XS
      (height === 896 || width === 896) || // iPhone XR, XS Max
      (height === 844 || width === 844) || // iPhone 12, 12 Pro
      (height === 926 || width === 926)    // iPhone 12 Pro Max
    );
  }
}
```

## Platform-Specific Storage

### Secure Storage

```javascript
// services/SecureStorageService.ts
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let Keychain: any;
if (Platform.OS === 'ios') {
  Keychain = require('react-native-keychain');
}

export class SecureStorageService {
  // For sensitive data (tokens, passwords)
  static async setSecureItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'ios' && Keychain) {
      await Keychain.setInternetCredentials(key, key, value);
    } else {
      // Android fallback - consider using encrypted storage
      await AsyncStorage.setItem(`secure_${key}`, value);
    }
  }

  static async getSecureItem(key: string): Promise<string | null> {
    if (Platform.OS === 'ios' && Keychain) {
      try {
        const credentials = await Keychain.getInternetCredentials(key);
        return credentials ? credentials.password : null;
      } catch (error) {
        return null;
      }
    } else {
      return AsyncStorage.getItem(`secure_${key}`);
    }
  }

  static async removeSecureItem(key: string): Promise<void> {
    if (Platform.OS === 'ios' && Keychain) {
      await Keychain.resetInternetCredentials(key);
    } else {
      await AsyncStorage.removeItem(`secure_${key}`);
    }
  }

  // For regular data
  static async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  static async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  static async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}
```

## Testing Platform-Specific Code

### Platform Mocking

```javascript
// __tests__/utils/platformMocks.ts
export const mockPlatform = (OS: 'ios' | 'android', Version?: number) => {
  jest.doMock('react-native/Libraries/Utilities/Platform', () => ({
    OS,
    Version: Version || (OS === 'ios' ? '14.0' : 30),
    select: jest.fn((obj) => obj[OS]),
  }));
};

// __tests__/components/PlatformButton.test.tsx
import { render } from '@testing-library/react-native';
import { PlatformButton } from '../PlatformButton';
import { mockPlatform } from '../utils/platformMocks';

describe('PlatformButton', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders TouchableOpacity on iOS', () => {
    mockPlatform('ios');
    const { getByTestId } = render(
      <PlatformButton testID="platform-button" onPress={jest.fn()}>
        <Text>Button</Text>
      </PlatformButton>
    );
    
    // Test iOS-specific behavior
  });

  it('renders TouchableNativeFeedback on Android', () => {
    mockPlatform('android');
    const { getByTestId } = render(
      <PlatformButton testID="platform-button" onPress={jest.fn()}>
        <Text>Button</Text>
      </PlatformButton>
    );
    
    // Test Android-specific behavior
  });
});
```

This guide provides comprehensive patterns for handling platform-specific code in React Native applications, ensuring optimal user experience on both iOS and Android platforms.
