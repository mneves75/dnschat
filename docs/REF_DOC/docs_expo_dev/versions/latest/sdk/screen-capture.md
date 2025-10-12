# Expo ScreenCapture

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-screen-
capture)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
screen-capture/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-screen-
capture)

Ask AI

A library that allows you to protect screens in your app from being captured
or recorded.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-screen-
capture)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
screen-capture/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-screen-
capture)

Ask AI

Android

iOS

Bundled version:

~8.0.8

Copy

* * *

`expo-screen-capture` allows you to protect screens in your app from being
captured or recorded, as well as be notified if a screenshot is taken while
your app is foregrounded. The two most common reasons you may want to prevent
screen capture are:

  * If a screen is displaying sensitive information (password, credit card data, and so on)
  * You are displaying paid content that you don't want to be recorded and shared

This is especially important on Android since the
[`android.media.projection`](https://developer.android.com/about/versions/android-5.0.html#ScreenCapture)
API allows third-party apps to perform screen capture or screen sharing (even
if the app is in the background).

On Android, the screen capture callback works without additional permissions
only for Android 14+. You don't need to request or check permissions for
blocking screen capture or using the callback on Android 14+.

If you want to use the screen capture callback on Android 13 or lower, you
need to add the `READ_MEDIA_IMAGES` permission to your AndroidManifest.xml
file. You can use the `android.permissions` key in your app config. See
[Android permissions](/guides/permissions#android) for more information.

> The `READ_MEDIA_IMAGES` permission can be added only for apps needing broad
> access to photos. See [Details on Google Play's Photo and Video Permissions
> policy](https://support.google.com/googleplay/android-
> developer/answer/14115180).

> For testing screen capture functionality: On Android Emulator, run `adb
> shell input keyevent 120` in a separate terminal to trigger a screenshot. On
> iOS Simulator, you can trigger screenshots using Device > Trigger Screenshot
> from the menu bar.

## Installation

Terminal

Copy

`- ``npx expo install expo-screen-capture`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

### Example: hook

Screen Capture hook

Copy

Open in Snack

    
    
    import { usePreventScreenCapture } from 'expo-screen-capture';
    import { Text, View } from 'react-native';
    
    export default function ScreenCaptureExample() {
      usePreventScreenCapture();
    
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>As long as this component is mounted, this screen is unrecordable!</Text>
        </View>
      );
    }
    

### Example: Blocking screen capture imperatively

Blocking screen capture

Copy

Open in Snack

    
    
    import * as ScreenCapture from 'expo-screen-capture';
    import { useEffect } from 'react';
    import { Button, StyleSheet, View } from 'react-native';
    
    export default function ScreenCaptureExample() {
      const activate = async () => {
        await ScreenCapture.preventScreenCaptureAsync();
      };
    
      const deactivate = async () => {
        await ScreenCapture.allowScreenCaptureAsync();
      };
    
      return (
        <View style={styles.container}>
          <Button title="Activate" onPress={activate} />
          <Button title="Deactivate" onPress={deactivate} />
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
    });
    

### Example: Callback for screen capture

Callback for screen capture

Copy

Open in Snack

    
    
    import * as ScreenCapture from 'expo-screen-capture';
    import { useEffect } from 'react';
    import { Button, StyleSheet, View } from 'react-native';
    
    export default function useScreenCaptureCallback() {
      // Only use this if you add the READ_MEDIA_IMAGES permission to your AndroidManifest.xml
      const hasPermissions = async () => {
        const { status } = await ScreenCapture.requestPermissionsAsync();
        return status === 'granted';
      };
    
      useEffect(() => {
        let subscription;
    
        const addListenerAsync = async () => {
          if (await hasPermissions()) {
            subscription = ScreenCapture.addScreenshotListener(() => {
              alert('Thanks for screenshotting my beautiful app 😊');
            });
          } else {
            console.error('Permissions needed to subscribe to screenshot events are missing!');
          }
        };
        addListenerAsync();
    
        return () => {
          subscription?.remove();
        };
      }, []);
    }
    

## API

    
    
    import * as ScreenCapture from 'expo-screen-capture';
    

## Hooks

### `usePermissions(options)`

Android

iOS

Parameter| Type  
---|---  
options(optional)| `PermissionHookOptions<object>`  
  
  

Check or request permissions necessary for detecting when a screenshot is
taken. This uses both `requestPermissionsAsync` and `getPermissionsAsync` to
interact with the permissions.

Returns:

`[null | PermissionResponse, RequestPermissionMethod<PermissionResponse>, GetPermissionMethod<PermissionResponse>]`

Example

    
    
    const [status, requestPermission] = ScreenCapture.usePermissions();
    

### `usePreventScreenCapture(key)`

Android

iOS

Parameter| Type| Description  
---|---|---  
key(optional)| `string`| If provided, this will prevent multiple instances of
this hook or the `preventScreenCaptureAsync` and `allowScreenCaptureAsync`
methods from conflicting with each other. This argument is useful if you have
multiple active components using the `allowScreenCaptureAsync`
hook.Default:`'default'`  
  
  

A React hook to prevent screen capturing for as long as the owner component is
mounted.

Returns:

`void`

### `useScreenshotListener(listener)`

Android

iOS

Parameter| Type| Description  
---|---|---  
listener| `() => void`| A function that will be called whenever a screenshot
is detected. This hook automatically starts listening when the component
mounts, and stops listening when the component unmounts.  
  
  

A React hook that listens for screenshots taken while the component is
mounted.

Returns:

`void`

## Methods

### `ScreenCapture.allowScreenCaptureAsync(key)`

Android

iOS

Parameter| Type| Description  
---|---|---  
key(optional)| `string`| This will prevent multiple instances of the
`preventScreenCaptureAsync` and `allowScreenCaptureAsync` methods from
conflicting with each other. If provided, the value must be the same as the
key passed to `preventScreenCaptureAsync` in order to re-enable screen
capturing.Default:`'default'`  
  
  

Re-allows the user to screen record or screenshot your app. If you haven't
called `preventScreenCapture()` yet, this method does nothing.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `ScreenCapture.disableAppSwitcherProtectionAsync()`

iOS

Disables the privacy protection overlay that was previously enabled with
`enableAppSwitcherProtectionAsync`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `ScreenCapture.enableAppSwitcherProtectionAsync(blurIntensity)`

iOS

Parameter| Type| Description  
---|---|---  
blurIntensity(optional)| `number`| The intensity of the blur effect, from 0.0
(no blur) to 1.0 (maximum blur). Default is 0.5.Default:`0.5`  
  
  

Enables a privacy protection blur overlay that hides sensitive content when
the app is not in focus. The overlay applies a customizable blur effect when
the app is in the app switcher, background, or during interruptions (calls,
Siri, Control Center, etc.), and automatically removes it when the app becomes
active again.

This provides visual privacy protection by preventing sensitive app content
from being visible in:

  * App switcher previews
  * Background app snapshots
  * Screenshots taken during inactive states

For Android, app switcher protection is automatically provided by
`preventScreenCaptureAsync()` using the FLAG_SECURE window flag, which shows a
blank screen in the recent apps preview.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `ScreenCapture.getPermissionsAsync()`

Android

iOS

Checks user's permissions for detecting when a screenshot is taken.

> Only Android requires additional permissions to detect screenshots. On iOS
> devices, this method will always resolve to a `granted` permission response.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

A promise that resolves to a `PermissionResponse` object.

### `ScreenCapture.isAvailableAsync()`

Android

iOS

Returns whether the Screen Capture API is available on the current device.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise that resolves to a `boolean` indicating whether the Screen Capture
API is available on the current device.

### `ScreenCapture.preventScreenCaptureAsync(key)`

Android

iOS

Parameter| Type| Description  
---|---|---  
key(optional)| `string`| Optional. If provided, this will help prevent
multiple instances of the `preventScreenCaptureAsync` and
`allowScreenCaptureAsync` methods (and `usePreventScreenCapture` hook) from
conflicting with each other. When using multiple keys, you'll have to re-allow
each one in order to re-enable screen capturing.Default:`'default'`  
  
  

Prevents screenshots and screen recordings until `allowScreenCaptureAsync` is
called or the app is restarted. If you are already preventing screen capture,
this method does nothing (unless you pass a new and unique `key`).

> On iOS, this prevents screen recordings and screenshots, and is only
> available on iOS 11+ (recordings) and iOS 13+ (screenshots). On older iOS
> versions, this method does nothing.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `ScreenCapture.requestPermissionsAsync()`

Android

iOS

Asks the user to grant permissions necessary for detecting when a screenshot
is taken.

> Only Android requires additional permissions to detect screenshots. On iOS
> devices, this method will always resolve to a `granted` permission response.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

A promise that resolves to a `PermissionResponse` object.

## Event Subscriptions

### `ScreenCapture.addScreenshotListener(listener)`

Android

iOS

Parameter| Type| Description  
---|---|---  
listener| `() => void`| The function that will be executed when the user takes
a screenshot. This function accepts no arguments.  
  
  

Adds a listener that will fire whenever the user takes a screenshot while the
app is foregrounded.

Permission requirements for this method depend on your device’s Android
version:

  * Before Android 13: Requires `READ_EXTERNAL_STORAGE`.
  * Android 13: Switches to `READ_MEDIA_IMAGES`.
  * Post-Android 13: No additional permissions required. You can request the appropriate permissions by using [`MediaLibrary.requestPermissionsAsync()`](/versions/latest/sdk/media-library#medialibraryrequestpermissionsasync).

Returns:

`EventSubscription`

A `Subscription` object that you can use to unregister the listener, either by
calling `remove()` or passing it to `removeScreenshotListener`.

### `ScreenCapture.removeScreenshotListener(subscription)`

Android

iOS

Parameter| Type| Description  
---|---|---  
subscription| `EventSubscription`| Subscription returned by
`addScreenshotListener`.  
  
  

Removes the subscription you provide, so that you are no longer listening for
screenshots. You can also call `remove()` on that `Subscription` object.

Returns:

`void`

Example

    
    
    let mySubscription = addScreenshotListener(() => {
      console.log("You took a screenshot!");
    });
    ...
    mySubscription.remove();
    // OR
    removeScreenshotListener(mySubscription);
    

### `ScreenCapture.useScreenshotListener(listener)`

Android

iOS

Parameter| Type| Description  
---|---|---  
listener| `() => void`| A function that will be called whenever a screenshot
is detected. This hook automatically starts listening when the component
mounts, and stops listening when the component unmounts.  
  
  

A React hook that listens for screenshots taken while the component is
mounted.

Returns:

`void`

## Interfaces

### `Subscription`

Android

iOS

A subscription object that allows to conveniently remove an event listener
from the emitter.

Subscription Methods

### `remove()`

Android

iOS

Removes an event listener for which the subscription has been created. After
calling this function, the listener will no longer receive any events from the
emitter.

Returns:

`void`

## Types

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

