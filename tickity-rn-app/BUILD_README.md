# Local Build Options for Tickity

This guide explains how to use the local build options for the Tickity React Native app.

## Prerequisites

1. **Install EAS CLI** (if not already installed):

   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**:

   ```bash
   eas login
   ```

3. **Configure EAS** (first time only):
   ```bash
   eas build:configure
   ```

## Available Build Scripts

### Development Builds

- `npm run build:dev` - Build for both platforms (development)
- `npm run build:android:dev` - Android development build
- `npm run build:ios:dev` - iOS development build

### Preview Builds

- `npm run build:preview` - Build for both platforms (preview)
- `npm run build:android:preview` - Android preview build
- `npm run build:ios:preview` - iOS preview build

### Production Builds

- `npm run build:prod` - Build for both platforms (production)
- `npm run build:android:prod` - Android production build
- `npm run build:ios:prod` - iOS production build

### Utility Scripts

- `npm run prebuild` - Generate native code
- `npm run clean` - Clean and regenerate native code

## Build Profiles

### Development Profile

- **Purpose**: For development and testing
- **Features**: Development client, internal distribution
- **Android**: APK format
- **iOS**: Development build with debugging capabilities

### Preview Profile

- **Purpose**: For internal testing and QA
- **Features**: Internal distribution, optimized for testing
- **Android**: APK format
- **iOS**: Preview build for testing

### Production Profile

- **Purpose**: For app store submission
- **Features**: Optimized for production
- **Android**: AAB format (required for Play Store)
- **iOS**: Production build for App Store

## Platform-Specific Notes

### Android

- Development and Preview builds create APK files
- Production builds create AAB files (required for Google Play Store)
- Minimum SDK version: 26

### iOS

- Requires macOS and Xcode for local builds
- Development builds include development client
- All builds use medium resource class for optimal performance

## Environment Setup

### For Android Local Builds

1. Install Android Studio
2. Set up Android SDK
3. Configure ANDROID_HOME environment variable

### For iOS Local Builds

1. Install Xcode
2. Install iOS Simulator
3. Accept Xcode license: `sudo xcodebuild -license accept`

## Troubleshooting

### Common Issues

1. **EAS CLI not found**:

   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Build fails with permission errors**:

   ```bash
   sudo chown -R $(whoami) ~/.expo
   ```

3. **iOS build requires specific Xcode version**:

   - Check your Xcode version: `xcodebuild -version`
   - Update if needed through App Store

4. **Android build fails**:
   - Ensure Android SDK is properly configured
   - Check ANDROID_HOME environment variable
   - Verify Java/JDK installation

### Build Optimization

- Use `--clear-cache` flag if builds are failing due to cache issues
- Use `--no-wait` flag to run builds in background
- Monitor build logs for specific error messages

## Configuration Files

- `app.json`: Main app configuration with build profiles
- `eas.json`: EAS Build specific configuration
- `package.json`: Build scripts and dependencies

## Next Steps

1. Update the `projectId` in `app.json` with your actual Expo project ID
2. Configure your development environment for the target platforms
3. Run your first local build using the appropriate script

For more information, visit the [EAS Build documentation](https://docs.expo.dev/build/introduction/).
