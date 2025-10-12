# ![Expo Brightness icon](/static/images/packages/expo-brightness.png)Expo
Brightness

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
brightness)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
brightness/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-brightness)

Ask AI

A library that provides access to an API for getting and setting the screen
brightness.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
brightness)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
brightness/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-brightness)

Ask AI

Android

iOS

Bundled version:

~14.0.7

Copy

* * *

An API to get and set screen brightness.

On Android, there is a global system-wide brightness setting, and each app has
its own brightness setting that can optionally override the global setting. It
is possible to set either of these values with this API. On iOS, the system
brightness setting cannot be changed programmatically; instead, any changes to
the screen brightness will persist until the device is locked or powered off.

## Installation

Terminal

Copy

`- ``npx expo install expo-brightness`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration

Are you using this library in an existing React Native app?

If you're not using Continuous Native Generation ([CNG](/workflow/continuous-
native-generation)) or you're using a native android project manually, then
you need to add the `android.permission.WRITE_SETTINGS` permission to the
AndroidManifest.xml file:

android/app/src/main/AndroidManifest.xml

Copy

    
    
    <uses-permission android:name="android.permission.WRITE_SETTINGS" />
    

## Usage

Basic Brightness Usage

Copy

Open in Snack

    
    
    import { useEffect } from 'react';
    import { StyleSheet, View, Text } from 'react-native';
    import * as Brightness from 'expo-brightness';
    
    export default function App() {
      useEffect(() => {
        (async () => {
          const { status } = await Brightness.requestPermissionsAsync();
          if (status === 'granted') {
            Brightness.setSystemBrightnessAsync(1);
          }
        })();
      }, []);
    
      return (
        <View style={styles.container}>
          <Text>Brightness Module Example</Text>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      },
    });
    

## API

    
    
    import * as Brightness from 'expo-brightness';
    

## Hooks

### `usePermissions(options)`

Android

iOS

Parameter| Type  
---|---  
options(optional)| `PermissionHookOptions<object>`  
  
  

Check or request permissions to modify the system brightness. This uses both
`requestPermissionAsync` and `getPermissionsAsync` to interact with the
permissions.

Returns:

`[null | PermissionResponse, RequestPermissionMethod<PermissionResponse>, GetPermissionMethod<PermissionResponse>]`

Example

    
    
    const [permissionResponse, requestPermission] = Brightness.usePermissions();
    

## Methods

### `Brightness.getBrightnessAsync()`

Android

iOS

Gets the current brightness level of the device's main screen.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<number>`

A `Promise` that fulfils with a number between `0` and `1`, inclusive,
representing the current screen brightness.

### `Brightness.getPermissionsAsync()`

Android

iOS

Checks user's permissions for accessing system brightness.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

A promise that fulfils with an object of type PermissionResponse.

### `Brightness.getSystemBrightnessAsync()`

Android

Gets the global system screen brightness.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<number>`

A `Promise` that is resolved with a number between `0` and `1`, inclusive,
representing the current system screen brightness.

### `Brightness.getSystemBrightnessModeAsync()`

Android

Gets the system brightness mode (e.g. whether or not the OS will automatically
adjust the screen brightness depending on ambient light).

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<BrightnessMode>`

A `Promise` that fulfils with a `BrightnessMode`. Requires `SYSTEM_BRIGHTNESS`
permissions.

### `Brightness.isAvailableAsync()`

Android

iOS

Returns whether the Brightness API is enabled on the current device. This does
not check the app permissions.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

Async `boolean`, indicating whether the Brightness API is available on the
current device. Currently this resolves `true` on iOS and Android only.

### `Brightness.isUsingSystemBrightnessAsync()`

Android

Returns a boolean specifying whether or not the current activity is using the
system-wide brightness value.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A `Promise` that fulfils with `true` when the current activity is using the
system-wide brightness value, and `false` otherwise.

### `Brightness.requestPermissionsAsync()`

Android

iOS

Asks the user to grant permissions for accessing system brightness.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

A promise that fulfils with an object of type PermissionResponse.

### `Brightness.restoreSystemBrightnessAsync()`

Android

Resets the brightness setting of the current activity to use the system-wide
brightness value rather than overriding it.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A `Promise` that fulfils when the setting has been successfully changed.

### `Brightness.setBrightnessAsync(brightnessValue)`

Android

iOS

Parameter| Type| Description  
---|---|---  
brightnessValue| `number`| A number between `0` and `1`, inclusive,
representing the desired screen brightness.  
  
  

Sets the current screen brightness. On iOS, this setting will persist until
the device is locked, after which the screen brightness will revert to the
user's default setting. On Android, this setting only applies to the current
activity; it will override the system brightness value whenever your app is in
the foreground.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A `Promise` that fulfils when the brightness has been successfully set.

### `Brightness.setSystemBrightnessAsync(brightnessValue)`

Android

Parameter| Type| Description  
---|---|---  
brightnessValue| `number`| A number between `0` and `1`, inclusive,
representing the desired screen brightness.  
  
  

Sets the global system screen brightness and changes the brightness mode to
`MANUAL`. Requires `SYSTEM_BRIGHTNESS` permissions.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A `Promise` that fulfils when the brightness has been successfully set.

### `Brightness.setSystemBrightnessModeAsync(brightnessMode)`

Android

Parameter| Type| Description  
---|---|---  
brightnessMode| `BrightnessMode`| One of `BrightnessMode.MANUAL` or
`BrightnessMode.AUTOMATIC`. The system brightness mode cannot be set to
`BrightnessMode.UNKNOWN`.  
  
  

Sets the system brightness mode.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

> Deprecated Use `restoreSystemBrightnessAsync` method instead.

### `Brightness.useSystemBrightnessAsync()`

Android

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

## Event Subscriptions

### `Brightness.addBrightnessListener(listener)`

iOS

Parameter| Type| Description  
---|---|---  
listener| `(event: BrightnessEvent) => void`| A callback that is invoked when
brightness (iOS) changes. The callback is provided a single argument that is
an object with a `brightness` key.  
  
  

Subscribe to brightness (iOS) updates. The event fires whenever the power mode
is toggled.

On web and android the event never fires.

Returns:

`EventSubscription`

A `Subscription` object on which you can call `remove()` to unsubscribe from
the listener.

## Types

### `BrightnessEvent`

Android

iOS

Property| Type| Description  
---|---|---  
brightness| `number`| A number between `0` and `1`, inclusive, representing
the current screen brightness.  
  
### `PermissionExpiration`

Android

iOS

Literal Type: `union`

Permission expiration time. Currently, all permissions are granted
permanently.

Acceptable values are: `'never'` | `number`

### `PermissionHookOptions`

Android

iOS

Literal Type: `union`

Acceptable values are: `PermissionHookBehavior` | `Options`

### `PermissionResponse`

Android

iOS

An object obtained by permissions get and request functions.

Property| Type| Description  
---|---|---  
canAskAgain| `boolean`| Indicates if user can be asked again for specific
permission. If not, one should be directed to the Settings app in order to
enable/disable the permission.  
expires| `PermissionExpiration`| Determines time when the permission expires.  
granted| `boolean`| A convenience boolean that indicates if the permission is
granted.  
status| `PermissionStatus`| Determines the status of the permission.  
  
## Enums

### `BrightnessMode`

Android

iOS

#### `UNKNOWN`

`BrightnessMode.UNKNOWN ＝ 0`

Means that the current brightness mode cannot be determined.

#### `AUTOMATIC`

`BrightnessMode.AUTOMATIC ＝ 1`

Mode in which the device OS will automatically adjust the screen brightness
depending on the ambient light.

#### `MANUAL`

`BrightnessMode.MANUAL ＝ 2`

Mode in which the screen brightness will remain constant and will not be
adjusted by the OS.

### `PermissionStatus`

Android

iOS

#### `DENIED`

`PermissionStatus.DENIED ＝ "denied"`

User has denied the permission.

#### `GRANTED`

`PermissionStatus.GRANTED ＝ "granted"`

User has granted the permission.

#### `UNDETERMINED`

`PermissionStatus.UNDETERMINED ＝ "undetermined"`

User hasn't granted or denied the permission yet.

## Error codes

### `ERR_BRIGHTNESS`

An error occurred when getting or setting the app brightness.

### `ERR_BRIGHTNESS_MODE`

An error occurred when getting or setting the system brightness mode. See the
`nativeError` property of the thrown error for more information.

### `ERR_BRIGHTNESS_PERMISSIONS_DENIED`

An attempt to set the system brightness was made without the proper
permissions from the user. The user did not grant `SYSTEM_BRIGHTNESS`
permissions.

### `ERR_BRIGHTNESS_SYSTEM`

An error occurred when getting or setting the system brightness.

### `ERR_INVALID_ARGUMENT`

An invalid argument was passed. Only `BrightnessMode.MANUAL` or
`BrightnessMode.AUTOMATIC` are allowed.

## Permissions

### Android

You must add the following permissions to your app.json inside the
[`expo.android.permissions`](/versions/latest/config/app#permissions) array.

Android Permission| Description  
---|---  
`WRITE_SETTINGS`| Allows an application to read or write the system settings.  
  
### iOS

_No permissions required_.

