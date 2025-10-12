# ![Expo ScreenOrientation icon](/static/images/packages/expo-screen-
orientation.png)Expo ScreenOrientation

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-screen-
orientation)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
screen-orientation/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
screen-orientation)

Ask AI

A universal library for managing a device's screen orientation.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-screen-
orientation)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
screen-orientation/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
screen-orientation)

Ask AI

Android

iOS

Web

Bundled version:

~9.0.7

Copy

* * *

Screen Orientation is defined as the orientation in which graphics are painted
on the device. For example, the figure below has a device in a vertical and
horizontal physical orientation, but a portrait screen orientation. For
physical device orientation, see the orientation section of [Device
Motion](/versions/latest/sdk/devicemotion).

![Portrait orientation in different physical
orientations.](/static/images/screen-orientation-portrait.jpg)

On both Android and iOS platforms, changes to the screen orientation will
override any system settings or user preferences. On Android, it is possible
to change the screen orientation while taking the user's preferred orientation
into account. On iOS, user and system settings are not accessible by the
application and any changes to the screen orientation will override existing
settings.

> Web has [limited support](https://caniuse.com/#feat=deviceorientation).

## Installation

Terminal

Copy

`- ``npx expo install expo-screen-orientation`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

### Warning

Apple added support for _split view_ mode to iPads in iOS 9. This changed how
the screen orientation is handled by the system. To put the matter shortly,
for iOS, your iPad is always in landscape mode unless you open two
applications side by side. To be able to lock screen orientation using this
module you will need to disable support for this feature. For more information
about the _split view_ mode, check out [the official Apple
documentation](https://support.apple.com/en-us/HT207582).

## Configuration in app config

You can configure `expo-screen-orientation` using its built-in [config
plugin](/config-plugins/introduction) if you use config plugins in your
project ([EAS Build](/build/introduction) or `npx expo run:[android|ios]`).
The plugin allows you to configure various properties that cannot be set at
runtime and require building a new app binary to take effect.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "ios": {
          "requireFullScreen": true
        },
        "plugins": [
          [
            "expo-screen-orientation",
            {
              "initialOrientation": "DEFAULT"
            }
          ]
        ]
      }
    }
    

### Configurable properties

Name| Default| Description  
---|---|---  
`initialOrientation`| `undefined`| Only for: iOS  
Sets the iOS initial screen orientation. Possible values: `DEFAULT`, `ALL`,
`PORTRAIT`, `PORTRAIT_UP`, `PORTRAIT_DOWN`, `LANDSCAPE`, `LANDSCAPE_LEFT`,
`LANDSCAPE_RIGHT`  
  
Are you using this library in an existing React Native app?

  1. Open the ios directory in Xcode with `xed ios`. If you don't have the directory, run `npx expo prebuild -p ios` to generate one.
  2. Tick the `Requires Full Screen` checkbox in Xcode. It should be located under Project Target > General > Deployment Info.

## API

    
    
    import * as ScreenOrientation from 'expo-screen-orientation';
    

## Methods

### `ScreenOrientation.getOrientationAsync()`

Android

iOS

Web

Gets the current screen orientation.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<Orientation>`

Returns a promise that fulfils with an `Orientation` value that reflects the
current screen orientation.

### `ScreenOrientation.getOrientationLockAsync()`

Android

iOS

Web

Gets the current screen orientation lock type.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<OrientationLock>`

Returns a promise which fulfils with an `OrientationLock` value.

### `ScreenOrientation.getPlatformOrientationLockAsync()`

Android

iOS

Web

Gets the platform specific screen orientation lock type.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PlatformOrientationInfo>`

Returns a promise which fulfils with a `PlatformOrientationInfo` value.

### `ScreenOrientation.lockAsync(orientationLock)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
orientationLock| `OrientationLock`| The orientation lock to apply. See the
`OrientationLock` enum for possible values.  
  
  

Lock the screen orientation to a particular `OrientationLock`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Returns a promise with `void` value, which fulfils when the orientation is
set.

Example

    
    
    async function changeScreenOrientation() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    }
    

### `ScreenOrientation.lockPlatformAsync(options)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
options| `PlatformOrientationInfo`| The platform specific lock to apply. See
the `PlatformOrientationInfo` object type for the different platform formats.  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Returns a promise with `void` value, resolving when the orientation is set and
rejecting if an invalid option or value is passed.

### `ScreenOrientation.supportsOrientationLockAsync(orientationLock)`

Android

iOS

Web

Parameter| Type  
---|---  
orientationLock| `OrientationLock`  
  
  

Returns whether the `OrientationLock` policy is supported on the device.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

Returns a promise that resolves to a `boolean` value that reflects whether or
not the orientationLock is supported.

### `ScreenOrientation.unlockAsync()`

Android

iOS

Web

Sets the screen orientation back to the `OrientationLock.DEFAULT` policy.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Returns a promise with `void` value, which fulfils when the orientation is
set.

## Event Subscriptions

### `ScreenOrientation.addOrientationChangeListener(listener)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
listener| `[OrientationChangeListener](/versions/latest/sdk/screen-
orientation#orientationchangelistenerevent)`| Each orientation update will
pass an object with the new `OrientationChangeEvent` to the listener.  
  
  

Invokes the `listener` function when the screen orientation changes from
`portrait` to `landscape` or from `landscape` to `portrait`. For example, it
won't be invoked when screen orientation change from `portrait up` to
`portrait down`, but it will be called when there was a change from `portrait
up` to `landscape left`.

Returns:

`EventSubscription`

### `ScreenOrientation.removeOrientationChangeListener(subscription)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
subscription| `EventSubscription`| A subscription object that manages the
updates passed to a listener function on an orientation change.  
  
  

Unsubscribes the listener associated with the `Subscription` object from all
orientation change updates.

Returns:

`void`

### `ScreenOrientation.removeOrientationChangeListeners()`

Android

iOS

Web

Removes all listeners subscribed to orientation change updates.

Returns:

`void`

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

### `OrientationChangeEvent`

Android

iOS

Web

Property| Type| Description  
---|---|---  
orientationInfo| `ScreenOrientationInfo`| The current `ScreenOrientationInfo`
of the device.  
orientationLock| `OrientationLock`| The current `OrientationLock` of the
device.  
  
### `OrientationChangeListener(event)`

Android

iOS

Web

Parameter| Type  
---|---  
event| `OrientationChangeEvent`  
  
Returns:

`void`

### `PlatformOrientationInfo`

Android

iOS

Web

Property| Type| Description  
---|---|---  
screenOrientationArrayIOS(optional)| `Orientation[]`| Only for: iOS  
An array of orientations to allow on the iOS platform.  
screenOrientationConstantAndroid(optional)| `number`| Only for: Android  
A constant to set using the Android native
[API](https://developer.android.com/reference/android/R.attr#screenOrientation).
For example, in order to set the lock policy to
[unspecified](https://developer.android.com/reference/android/content/pm/ActivityInfo.html#SCREEN_ORIENTATION_UNSPECIFIED),
`-1` should be passed in.  
screenOrientationLockWeb(optional)| `WebOrientationLock`| Only for: Web  
A web orientation lock to apply in the browser.  
  
### `ScreenOrientationInfo`

Android

iOS

Web

Property| Type| Description  
---|---|---  
horizontalSizeClass(optional)| `SizeClassIOS`| Only for: iOS  
The [horizontal size
class](https://developer.apple.com/documentation/uikit/uitraitcollection/1623508-horizontalsizeclass)
of the device.  
orientation| `Orientation`| The current orientation of the device.  
verticalSizeClass(optional)| `SizeClassIOS`| Only for: iOS  
The [vertical size
class](https://developer.apple.com/documentation/uikit/uitraitcollection/1623513-verticalsizeclass)
of the device.  
  
## Enums

### `Orientation`

Android

iOS

Web

#### `UNKNOWN`

`Orientation.UNKNOWN ＝ 0`

An unknown screen orientation. For example, the device is flat, perhaps on a
table.

#### `PORTRAIT_UP`

`Orientation.PORTRAIT_UP ＝ 1`

Right-side up portrait interface orientation.

#### `PORTRAIT_DOWN`

`Orientation.PORTRAIT_DOWN ＝ 2`

Upside down portrait interface orientation.

#### `LANDSCAPE_LEFT`

`Orientation.LANDSCAPE_LEFT ＝ 3`

Left landscape interface orientation.

#### `LANDSCAPE_RIGHT`

`Orientation.LANDSCAPE_RIGHT ＝ 4`

Right landscape interface orientation.

### `OrientationLock`

Android

iOS

Web

An enum whose values can be passed to the `lockAsync` method.

> Note: `OrientationLock.ALL` and `OrientationLock.PORTRAIT` are invalid on
> devices which don't support `OrientationLock.PORTRAIT_DOWN`.

#### `DEFAULT`

`OrientationLock.DEFAULT ＝ 0`

The default orientation. On iOS, this will allow all orientations except
`Orientation.PORTRAIT_DOWN`. On Android, this lets the system decide the best
orientation.

#### `ALL`

`OrientationLock.ALL ＝ 1`

All four possible orientations

#### `PORTRAIT`

`OrientationLock.PORTRAIT ＝ 2`

Any portrait orientation.

#### `PORTRAIT_UP`

`OrientationLock.PORTRAIT_UP ＝ 3`

Right-side up portrait only.

#### `PORTRAIT_DOWN`

`OrientationLock.PORTRAIT_DOWN ＝ 4`

Upside down portrait only.

#### `LANDSCAPE`

`OrientationLock.LANDSCAPE ＝ 5`

Any landscape orientation.

#### `LANDSCAPE_LEFT`

`OrientationLock.LANDSCAPE_LEFT ＝ 6`

Left landscape only.

#### `LANDSCAPE_RIGHT`

`OrientationLock.LANDSCAPE_RIGHT ＝ 7`

Right landscape only.

#### `OTHER`

`OrientationLock.OTHER ＝ 8`

A platform specific orientation. This is not a valid policy that can be
applied in `lockAsync`.

#### `UNKNOWN`

`OrientationLock.UNKNOWN ＝ 9`

An unknown screen orientation lock. This is not a valid policy that can be
applied in `lockAsync`.

### `SizeClassIOS`

Android

iOS

Web

Each iOS device has a default set of [size
classes](https://developer.apple.com/documentation/uikit/uiuserinterfacesizeclass)
that you can use as a guide when designing your interface.

#### `UNKNOWN`

`SizeClassIOS.UNKNOWN ＝ 0`

#### `COMPACT`

`SizeClassIOS.COMPACT ＝ 1`

#### `REGULAR`

`SizeClassIOS.REGULAR ＝ 2`

### `WebOrientation`

Android

iOS

Web

#### `LANDSCAPE_PRIMARY`

`WebOrientation.LANDSCAPE_PRIMARY ＝ "landscape-primary"`

#### `LANDSCAPE_SECONDARY`

`WebOrientation.LANDSCAPE_SECONDARY ＝ "landscape-secondary"`

#### `PORTRAIT_PRIMARY`

`WebOrientation.PORTRAIT_PRIMARY ＝ "portrait-primary"`

#### `PORTRAIT_SECONDARY`

`WebOrientation.PORTRAIT_SECONDARY ＝ "portrait-secondary"`

### `WebOrientationLock`

Android

iOS

Web

An enum representing the lock policies that can be applied on the web
platform, modelled after the [W3C specification](https://w3c.github.io/screen-
orientation/#dom-orientationlocktype). These values can be applied through the
`lockPlatformAsync` method.

#### `ANY`

`WebOrientationLock.ANY ＝ "any"`

#### `LANDSCAPE`

`WebOrientationLock.LANDSCAPE ＝ "landscape"`

#### `LANDSCAPE_PRIMARY`

`WebOrientationLock.LANDSCAPE_PRIMARY ＝ "landscape-primary"`

#### `LANDSCAPE_SECONDARY`

`WebOrientationLock.LANDSCAPE_SECONDARY ＝ "landscape-secondary"`

#### `NATURAL`

`WebOrientationLock.NATURAL ＝ "natural"`

#### `PORTRAIT`

`WebOrientationLock.PORTRAIT ＝ "portrait"`

#### `PORTRAIT_PRIMARY`

`WebOrientationLock.PORTRAIT_PRIMARY ＝ "portrait-primary"`

#### `PORTRAIT_SECONDARY`

`WebOrientationLock.PORTRAIT_SECONDARY ＝ "portrait-secondary"`

#### `UNKNOWN`

`WebOrientationLock.UNKNOWN ＝ "unknown"`

