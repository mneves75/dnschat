# ![Expo Battery icon](/static/images/packages/expo-battery.png)Expo Battery

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
battery)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
battery/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-battery)

Ask AI

A library that provides battery information for the physical device, as well
as corresponding event listeners.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
battery)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
battery/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-battery)

Ask AI

Android

iOS (device only)

Web

Bundled version:

~10.0.7

Copy

* * *

`expo-battery` provides battery information for the physical device (such as
battery level, whether or not the device is charging, and more) as well as
corresponding event listeners.

## Installation

Terminal

Copy

`- ``npx expo install expo-battery`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

Basic Battery Usage

Copy

Open in Snack

    
    
    import { useBatteryLevel } from 'expo-battery';
    import { StyleSheet, Text, View } from 'react-native';
    
    export default function App() {
      const batteryLevel = useBatteryLevel();
    
      return (
        <View style={styles.container}>
          <Text>Current Battery Level: {batteryLevel}</Text>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center',
      },
    });
    

## API

    
    
    import * as Battery from 'expo-battery';
    

## Hooks

### `useBatteryLevel()`

Android

iOS

Web

Gets the device's battery level, as in `getBatteryLevelAsync`.

Returns:

`number`

The battery level of the device.

Example

    
    
    const batteryLevel = useBatteryLevel();
    

### `useBatteryState()`

Android

iOS

Web

Gets the device's battery state, as in `getBatteryStateAsync`.

Returns:

`BatteryState`

The battery state of the device.

Example

    
    
    const batteryState = useBatteryState();
    

### `useLowPowerMode()`

Android

iOS

Web

Boolean that indicates if the device is in low power or power saver mode, as
in `isLowPowerModeEnabledAsync`.

Returns:

`boolean`

Returns a boolean indicating if the device is in low power mode.

Example

    
    
    const lowPowerMode = useLowPowerMode();
    

### `usePowerState()`

Android

iOS

Web

Gets the device's power state information, as in `getPowerStateAsync`.

Returns:

`PowerState`

Returns power state information.

Example

    
    
    const { lowPowerMode, batteryLevel, batteryState } = usePowerState();
    

## Methods

### `getBatteryLevelAsync()`

Android

iOS

Web

Gets the battery level of the device as a number between `0` and `1`,
inclusive. If the device does not support retrieving the battery level, this
method returns `-1`. On web, this method always returns `1`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<number>`

A `Promise` that fulfils with a number between `0` and `1` representing the
battery level, or `-1` if the device does not provide it.

Example

    
    
    await Battery.getBatteryLevelAsync();
    // 0.759999
    

### `getBatteryStateAsync()`

Android

iOS

Web

Tells the battery's current state. On web, this always returns
`BatteryState.UNKNOWN`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<BatteryState>`

Returns a `Promise` which fulfills with a `Battery.BatteryState` enum value
for whether the device is any of the four states.

Example

    
    
    await Battery.getBatteryStateAsync();
    // BatteryState.CHARGING
    

### `getPowerStateAsync()`

Android

iOS

Web

Gets the power state of the device including the battery level, whether it is
plugged in, and if the system is currently operating in Power Saver Mode
(Android) or Low Power Mode (iOS). This method re-throws any errors that occur
when retrieving any of the power-state information.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PowerState>`

Returns a `Promise` which fulfills with `PowerState` object.

Example

    
    
    await Battery.getPowerStateAsync();
    // {
    //   batteryLevel: 0.759999,
    //   batteryState: BatteryState.UNPLUGGED,
    //   lowPowerMode: true,
    // }
    

### `isAvailableAsync()`

Android

iOS

Web

Resolves with whether the battery API is available on the current device. The
value of this property is `true` on Android and physical iOS devices and
`false` on iOS simulators. On web, it depends on whether the browser supports
the web battery API.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

### `isBatteryOptimizationEnabledAsync()`

Android

iOS

Web

Checks whether battery optimization is enabled for your application. If
battery optimization is enabled for your app, background tasks might be
affected when your app goes into doze mode state. (only on Android 6.0 or
later)

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

Returns a `Promise` which fulfills with a `boolean` value of either `true` or
`false`, indicating whether the battery optimization is enabled or disabled,
respectively. (Android only)

Example

    
    
    await Battery.isBatteryOptimizationEnabledAsync();
    // true
    

### `isLowPowerModeEnabledAsync()`

Android

iOS

Web

Gets the current status of Power Saver mode on Android and Low Power mode on
iOS. If a platform doesn't support Low Power mode reporting (like web, older
Android devices), the reported low-power state is always `false`, even if the
device is actually in low-power mode.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

Returns a `Promise` which fulfills with a `boolean` value of either `true` or
`false`, indicating whether low power mode is enabled or disabled.

Example

Power Saver Mode (Android) or Low Power Mode (iOS) are enabled.

    
    
    await Battery.isLowPowerModeEnabledAsync();
    // true
    

## Event Subscriptions

### `addBatteryLevelListener(listener)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
listener| `(event: BatteryLevelEvent) => void`| A callback that is invoked
when battery level changes. The callback is provided a single argument that is
an object with a `batteryLevel` key.  
  
  

Subscribe to the battery level change updates.

On Android devices, the event fires only when significant changes happens,
which is when the battery level drops below
[`android.intent.action.BATTERY_LOW`](https://developer.android.com/reference/android/content/Intent#ACTION_BATTERY_LOW)
or rises above
[`android.intent.action.BATTERY_OKAY`](https://developer.android.com/reference/android/content/Intent#ACTION_BATTERY_OKAY)
from a low battery level. See [Monitor the Battery Level and Charging
State](https://developer.android.com/training/monitoring-device-state/battery-
monitoring) in Android documentation for more information.

On iOS devices, the event fires when the battery level drops one percent or
more, but is only fired once per minute at maximum.

On web, the event never fires.

Returns:

`EventSubscription`

A `Subscription` object on which you can call `remove()` to unsubscribe from
the listener.

### `addBatteryStateListener(listener)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
listener| `(event: BatteryStateEvent) => void`| A callback that is invoked
when battery state changes. The callback is provided a single argument that is
an object with a `batteryState` key.  
  
  

Subscribe to the battery state change updates to receive an object with a
`Battery.BatteryState` enum value for whether the device is any of the four
states.

On web, the event never fires.

Returns:

`EventSubscription`

A `Subscription` object on which you can call `remove()` to unsubscribe from
the listener.

### `addLowPowerModeListener(listener)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
listener| `(event: PowerModeEvent) => void`| A callback that is invoked when
Power Saver Mode (Android) or Low Power Mode (iOS) changes. The callback is
provided a single argument that is an object with a `lowPowerMode` key.  
  
  

Subscribe to Power Saver Mode (Android) or Low Power Mode (iOS) updates. The
event fires whenever the power mode is toggled.

On web, the event never fires.

Returns:

`EventSubscription`

A `Subscription` object on which you can call `remove()` to unsubscribe from
the listener.

## Interfaces

### `Subscription`

Android

iOS

Web

A subscription object that allows to conveniently remove an event listener
from the emitter.

Subscription Methods

### `remove()`

Android

iOS

Web

Removes an event listener for which the subscription has been created. After
calling this function, the listener will no longer receive any events from the
emitter.

Returns:

`void`

## Types

### `BatteryLevelEvent`

Android

iOS

Web

Property| Type| Description  
---|---|---  
batteryLevel| `number`| A number between `0` and `1`, inclusive, or `-1` if
the battery level is unknown.  
  
### `BatteryStateEvent`

Android

iOS

Web

Property| Type| Description  
---|---|---  
batteryState| `BatteryState`| An enum value representing the battery state.  
  
### `PowerModeEvent`

Android

iOS

Web

Property| Type| Description  
---|---|---  
lowPowerMode| `boolean`| A boolean value, `true` if lowPowerMode is on,
`false` if lowPowerMode is off.  
  
### `PowerState`

Android

iOS

Web

Property| Type| Description  
---|---|---  
batteryLevel| `number`| A number between `0` and `1`, inclusive, or `-1` if
the battery level is unknown.  
batteryState| `BatteryState`| An enum value representing the battery state.  
lowPowerMode| `boolean`| A boolean value, `true` if lowPowerMode is on,
`false` if lowPowerMode is off.  
  
## Enums

### `BatteryState`

Android

iOS

Web

#### `UNKNOWN`

`BatteryState.UNKNOWN ＝ 0`

If the battery state is unknown or inaccessible.

#### `UNPLUGGED`

`BatteryState.UNPLUGGED ＝ 1`

If battery is not charging or discharging.

#### `CHARGING`

`BatteryState.CHARGING ＝ 2`

If battery is charging.

#### `FULL`

`BatteryState.FULL ＝ 3`

If the battery level is full.

