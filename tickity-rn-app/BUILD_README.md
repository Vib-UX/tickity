# Build Instructions

## Environment Variables Setup

To fix the "useActiveAccount should be used within ThirdwebProvider" error in TestFlight builds, you need to set up environment variables properly.

### Option 1: Using EAS Build Configuration

1. Create a `.env` file in your project root (if it doesn't exist):

```bash
EXPO_PUBLIC_THIRDWEB_CLIENT_ID=e815b7bc8066484753033e49b5f637f8
EXPO_PUBLIC_THIRDWEB_SECRET_KEY=TLTWULf6K5QRGeh9Oh3nmeoqXRBJmCBMUy9B_RCid_NfmRSjV85xIYXmRmBwQKZ0ApGZAPOdfw0psbKEUm5mcA
```

2. Update your `eas.json` to include environment variables:

```json
{
  "cli": {
    "version": ">= 16.16.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_THIRDWEB_CLIENT_ID": "e815b7bc8066484753033e49b5f637f8",
        "EXPO_PUBLIC_THIRDWEB_SECRET_KEY": "TLTWULf6K5QRGeh9Oh3nmeoqXRBJmCBMUy9B_RCid_NfmRSjV85xIYXmRmBwQKZ0ApGZAPOdfw0psbKEUm5mcA"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_THIRDWEB_CLIENT_ID": "e815b7bc8066484753033e49b5f637f8",
        "EXPO_PUBLIC_THIRDWEB_SECRET_KEY": "TLTWULf6K5QRGeh9Oh3nmeoqXRBJmCBMUy9B_RCid_NfmRSjV85xIYXmRmBwQKZ0ApGZAPOdfw0psbKEUm5mcA"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_THIRDWEB_CLIENT_ID": "e815b7bc8066484753033e49b5f637f8",
        "EXPO_PUBLIC_THIRDWEB_SECRET_KEY": "TLTWULf6K5QRGeh9Oh3nmeoqXRBJmCBMUy9B_RCid_NfmRSjV85xIYXmRmBwQKZ0ApGZAPOdfw0psbKEUm5mcA"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Option 2: Using EAS CLI

You can also set environment variables using the EAS CLI:

```bash
# Set environment variables for all builds
eas secret:create --scope project --name EXPO_PUBLIC_THIRDWEB_CLIENT_ID --value "e815b7bc8066484753033e49b5f637f8"
eas secret:create --scope project --name EXPO_PUBLIC_THIRDWEB_SECRET_KEY --value "TLTWULf6K5QRGeh9Oh3nmeoqXRBJmCBMUy9B_RCid_NfmRSjV85xIYXmRmBwQKZ0ApGZAPOdfw0psbKEUm5mcA"
```

## Build Commands

### Development Build

```bash
npm run build:dev
```

### Preview Build (for TestFlight)

```bash
npm run build:preview
```

### Production Build

```bash
npm run build:prod
```

## Troubleshooting

### ThirdwebProvider Error

If you're still getting the "useActiveAccount should be used within ThirdwebProvider" error:

1. **Check Environment Variables**: Ensure the environment variables are properly set in your EAS build configuration.

2. **Clear Build Cache**: Sometimes build cache can cause issues:

   ```bash
   eas build --clear-cache
   ```

3. **Check Console Logs**: The updated code now includes better logging. Check the console output for:

   - "Thirdweb Environment Check" logs
   - "useActiveAccount error" logs

4. **Verify ThirdwebProvider**: The app now uses a `ThirdwebWrapper` component that provides better error handling.

### Common Issues

1. **Environment Variables Not Loading**: Make sure your `.env` file is in the project root and not gitignored.

2. **Build Configuration**: Ensure your `eas.json` includes the environment variables for all build profiles.

3. **Thirdweb Version**: The app uses thirdweb v5.105.21. Make sure all dependencies are compatible.

## Testing

After making these changes:

1. Test locally first:

   ```bash
   npm start
   ```

2. Build a preview version:

   ```bash
   npm run build:preview
   ```

3. Submit to TestFlight:
   ```bash
   eas submit --platform ios
   ```

The updated code includes:

- Better error handling for `useActiveAccount`
- Environment variable validation
- Graceful fallbacks for missing credentials
- Improved logging for debugging
