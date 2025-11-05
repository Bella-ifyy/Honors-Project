# Sleep Tracker Setup Guide

## Overview

The Sleep Tracker feature integrates with Apple HealthKit to read and write sleep data. This guide explains what's needed to enable and use the sleep tracker.

## Requirements

### 1. **Platform Support**
- ✅ **iOS Only**: Sleep tracker is currently available on iOS devices only
- ❌ **Android**: Not supported (shows alert if attempted on Android)
- ❌ **Web**: Not supported

### 2. **Dependencies**

The following package is already installed:
- `react-native-health@^1.11.0` - Provides HealthKit integration

### 3. **iOS Configuration**

The app is already configured with the necessary HealthKit permissions in `app.json`:

```json
{
  "ios": {
    "infoPlist": {
      "NSHealthShareUsageDescription": "workout syncs your sleep sessions with Apple Health to keep insights accurate across devices.",
      "NSHealthUpdateUsageDescription": "workout records the sleep sessions you track so that Apple Health stays up to date."
    }
  }
}
```

### 4. **HealthKit Capabilities**

The app requires the following HealthKit permissions:
- **Read**: Sleep Analysis data
- **Write**: Sleep Analysis data

## Setup Steps

### For Users

1. **Open the App**
   - Navigate to the Home screen
   - Find the "Sleep Tracker" card in Quick Actions

2. **Tap "Setup" Button**
   - The card shows a "Setup" badge when permissions aren't granted
   - Tap the card to start the setup process

3. **Grant Permissions**
   - A permission dialog will appear
   - Tap "Connect" to grant HealthKit permissions
   - iOS will show the HealthKit permission screen
   - Select "Allow" to grant read/write access to Sleep Analysis

4. **Verify Setup**
   - Once granted, the "Setup" badge disappears
   - The card will show "Live" badge if a sleep session is active
   - Sleep data will start syncing from Apple Health

### For Developers

#### 1. **Verify Dependencies**

Check that `react-native-health` is installed:

```bash
cd workout-mobile
yarn list react-native-health
```

Should show: `react-native-health@1.19.0` (or compatible version)

#### 2. **Rebuild iOS App**

After any configuration changes, rebuild the iOS app:

```bash
# Clean build
cd ios
rm -rf build
cd ..

# Rebuild
yarn ios
# or
npx expo run:ios
```

#### 3. **Test Permissions**

The app automatically checks permissions on launch. You can verify:

- **Permission Status**: Checked in `Home.tsx` via `checkSleepPermissionStatus()`
- **Permission Request**: Triggered via `requestSleepPermissions()`

## How It Works

### Permission Flow

1. **Initial Check**: On app launch, checks current permission status
2. **User Action**: User taps Sleep Tracker card
3. **Permission Request**: If not granted, shows permission dialog
4. **HealthKit Prompt**: iOS shows native HealthKit permission screen
5. **Status Update**: App updates permission status and syncs data

### Data Sync

- **Read**: Fetches sleep sessions from Apple Health (last 14 days by default)
- **Write**: Saves manually tracked sleep sessions to Apple Health
- **Active Sessions**: Tracks ongoing sleep sessions locally

## Troubleshooting

### "Sleep tracking is currently available on iOS only"

**Cause**: Running on Android or Web  
**Solution**: Use an iOS device or iOS Simulator

### "Health access denied"

**Cause**: User denied HealthKit permissions  
**Solution**: 
1. Go to iOS Settings → Privacy & Security → Health
2. Find "workout" in the list
3. Enable "Sleep Analysis" for both Read and Write

### "Setup" badge still showing after granting permissions

**Cause**: Permission status not refreshed  
**Solution**:
1. Close and reopen the app
2. Or tap the Sleep Tracker card again to refresh

### No sleep data showing

**Possible Causes**:
1. **No data in Apple Health**: 
   - Make sure you have sleep data recorded in Apple Health
   - Data can come from Apple Watch, iPhone, or other health apps

2. **Permissions not fully granted**:
   - Check iOS Settings → Privacy & Security → Health → workout
   - Ensure both Read and Write are enabled for Sleep Analysis

3. **App needs rebuild**:
   - Rebuild the iOS app after configuration changes
   - `yarn ios` or `npx expo run:ios`

## Code Structure

### Key Files

- **Service**: `src/modules/sleep/sleep.service.ts`
  - Handles HealthKit API calls
  - Permission management
  - Data fetching and saving

- **Types**: `src/modules/sleep/sleep.types.ts`
  - TypeScript definitions
  - Permission status types

- **Storage**: `src/modules/sleep/sleep.storage.ts`
  - Local storage for active sessions

- **UI**: `src/views/Authenticated/Home/Home.tsx`
  - Sleep Tracker card
  - Permission dialogs
  - Sleep modal

### Permission Status Values

```typescript
type SleepPermissionStatus = 
  | 'unknown'      // Not yet checked
  | 'granted'      // User granted permissions
  | 'denied'       // User denied permissions
  | 'unavailable'  // HealthKit not available (Android/Web)
```

## Testing

### Test Permission Flow

1. **Reset Permissions** (iOS Simulator):
   ```bash
   # Reset app data
   xcrun simctl uninstall booted com.ajibadedapo.workout
   ```

2. **Test Grant Flow**:
   - Open app
   - Tap Sleep Tracker card
   - Grant permissions
   - Verify "Setup" badge disappears

3. **Test Deny Flow**:
   - Reset app
   - Tap Sleep Tracker card
   - Deny permissions
   - Verify appropriate message shows

### Test Data Sync

1. **Add Test Data to Apple Health** (iOS Simulator):
   - Use Health app to manually add sleep data
   - Or use a test health data generator

2. **Verify Sync**:
   - Open workout
   - Sleep data should appear in the tracker

## Current Status

✅ **Already Configured**:
- HealthKit permissions in `app.json`
- `react-native-health` package installed
- Permission request flow implemented
- Data sync functionality implemented

✅ **Ready to Use**:
- Users can tap "Setup" to grant permissions
- App will sync sleep data from Apple Health
- Manual sleep tracking available

## Next Steps

1. **Build and Test**:
   ```bash
   cd workout-mobile
   yarn ios
   ```

2. **Grant Permissions**:
   - Tap Sleep Tracker card
   - Grant HealthKit permissions when prompted

3. **Verify Data**:
   - Check that sleep data appears
   - Test manual sleep tracking

## Notes

- Sleep tracker requires a physical iOS device or iOS Simulator
- HealthKit data is only available on iOS
- Permissions are device-specific and persist across app restarts
- The app can read up to 14 days of historical sleep data
