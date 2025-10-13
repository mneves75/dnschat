# ![Expo Barometer icon](/static/images/packages/expo-sensors.png)Expo
Barometer

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
sensors)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
sensors/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-sensors)

Ask AI

A library that provides access to device's barometer sensor.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
sensors)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
sensors/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-sensors)

Ask AI

Android

iOS (device only)

Bundled version:

~15.0.7

Copy

* * *

`Barometer` from `expo-sensors` provides access to the device barometer sensor
to respond to changes in air pressure, which is measured in hectopascals
(`hPa`).

## Installation

Terminal

Copy

`- ``npx expo install expo-sensors`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

Basic Barometer usage

Copy

Open in Snack

    
    
    import { useState } from 'react';
    import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
    import { Barometer } from 'expo-sensors';
    
    export default function App() {
      const [{ pressure, relativeAltitude }, setData] = useState({ pressure: 0, relativeAltitude: 0 });
      const [subscription, setSubscription] = useState(null);
    
      const toggleListener = () => {
        subscription ? unsubscribe() : subscribe();
      };
    
      const subscribe = () => {
        setSubscription(Barometer.addListener(setData));
      };
    
      const unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
      };
    
      return (
        <View style={styles.wrapper}>
          <Text>Barometer: Listener {subscription ? 'ACTIVE' : 'INACTIVE'}</Text>
          <Text>Pressure: {pressure} hPa</Text>
          <Text>
            Relative Altitude:{' '}
            {Platform.OS === 'ios' ? `${relativeAltitude} m` : `Only available on iOS`}
          </Text>
          <TouchableOpacity onPress={toggleListener} style={styles.button}>
            <Text>Toggle listener</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      button: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
        padding: 10,
        marginTop: 15,
      },
      wrapper: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
        paddingHorizontal: 20,
      },
    });
    

## API

    
    
    import { Barometer } from 'expo-sensors';
    

## Classes

### `Barometer`

Android

iOS

Type: Class extends
`[DeviceSensor](/versions/latest/sdk/sensors)<BarometerMeasurement>`

Barometer Methods

### `addListener(listener)`

Android

iOS

Parameter| Type| Description  
---|---|---  
listener| `Listener<BarometerMeasurement>`| A callback that is invoked when a
barometer update is available. When invoked, the listener is provided with a
single argument that is `BarometerMeasurement`.  
  
  

Subscribe for updates to the barometer.

Returns:

`EventSubscription`

A subscription that you can call `remove()` on when you would like to
unsubscribe the listener.

Example

    
    
    const subscription = Barometer.addListener(({ pressure, relativeAltitude }) => {
      console.log({ pressure, relativeAltitude });
    });
    

### `getListenerCount()`

Android

iOS

Returns the registered listeners count.

Returns:

`number`

### `getPermissionsAsync()`

Android

iOS

Checks user's permissions for accessing sensor.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

### `hasListeners()`

Android

iOS

Returns boolean which signifies if sensor has any listeners registered.

Returns:

`boolean`

### `isAvailableAsync()`

Android

iOS

> You should always check the sensor availability before attempting to use it.

Check the availability of the device barometer. Requires at least Android 2.3
(API Level 9) and iOS 8.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise that resolves to a `boolean` denoting the availability of the
sensor.

### `removeAllListeners()`

Android

iOS

Removes all registered listeners.

Returns:

`void`

### `removeSubscription(subscription)`

Android

iOS

Parameter| Type| Description  
---|---|---  
subscription| `EventSubscription`| A subscription to remove.  
  
  

Removes the given subscription.

Returns:

`void`

### `requestPermissionsAsync()`

Android

iOS

Asks the user to grant permissions for accessing sensor.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

### `setUpdateInterval(intervalMs)`

Android

iOS

Parameter| Type| Description  
---|---|---  
intervalMs| `number`| Desired interval in milliseconds between sensor updates.

> Starting from Android 12 (API level 31), the system has a 200ms limit for
> each sensor updates. If you need an update interval less than 200ms, you
> should:
>
>   * add `android.permission.HIGH_SAMPLING_RATE_SENSORS` to [app.json
> `permissions` field](/versions/latest/config/app#permissions)
>   * or if you are using bare workflow, add `<uses-permission
> android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS"/>` to
> AndroidManifest.xml.
>
  
  
  

Set the sensor update interval.

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

### `BarometerMeasurement`

Android

iOS

The altitude data returned from the native sensors.

Property| Type| Description  
---|---|---  
pressure| `number`| Measurement in hectopascals (`hPa`).  
relativeAltitude(optional)| `number`| Only for: iOS  
Measurement in meters (`m`).  
timestamp| `number`| Timestamp of the measurement in seconds.  
  
### `PermissionExpiration`

Android

iOS

Literal Type: `union`

Permission expiration time. Currently, all permissions are granted
permanently.

Acceptable values are: `'never'` | `number`

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

## Units and providers

OS| Units| Provider| Description  
---|---|---|---  
iOS|  _`hPa`_|
[`CMAltimeter`](https://developer.apple.com/documentation/coremotion/cmaltimeter)|
Altitude events reflect the change in the current altitude, not the absolute
altitude.  
Android|  _`hPa`_|
[`Sensor.TYPE_PRESSURE`](https://developer.android.com/reference/android/hardware/Sensor#TYPE_PRESSURE)|
Monitoring air pressure changes.  
Web| | | This sensor is not available on the web and cannot be accessed. An `UnavailabilityError` will be thrown if you attempt to get data.

