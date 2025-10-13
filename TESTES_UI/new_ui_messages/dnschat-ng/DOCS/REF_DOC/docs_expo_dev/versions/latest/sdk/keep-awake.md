# ![Expo KeepAwake icon](/static/images/packages/expo-keep-awake.png)Expo
KeepAwake

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-keep-
awake)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-keep-
awake/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-keep-awake)

Ask AI

A React component that prevents the screen from sleeping when rendered.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-keep-
awake)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-keep-
awake/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-keep-awake)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~15.0.7

Copy

* * *

`expo-keep-awake` provides a React hook that prevents the screen from sleeping
and a pair of functions to enable this behavior imperatively.

## Installation

Terminal

Copy

`- ``npx expo install expo-keep-awake`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

### Example: hook

Keep Awake hook

Copy

Open in Snack

    
    
    import { useKeepAwake } from 'expo-keep-awake';
    import React from 'react';
    import { Text, View } from 'react-native';
    
    export default function KeepAwakeExample() {
      useKeepAwake();
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>This screen will never sleep!</Text>
        </View>
      );
    }
    

### Example: functions

Keep Awake functions

Copy

Open in Snack

    
    
    import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
    import React from 'react';
    import { Button, View } from 'react-native';
    
    export default class KeepAwakeExample extends React.Component {
      render() {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button onPress={this._activate} title="Activate" />
            <Button onPress={this._deactivate} title="Deactivate" />
          </View>
        );
      }
    
      _activate = () => {
        activateKeepAwake();
        alert('Activated!');
      };
    
      _deactivate = () => {
        deactivateKeepAwake();
        alert('Deactivated!');
      };
    }
    

## API

    
    
    import * as KeepAwake from 'expo-keep-awake';
    

## Constants

### `KeepAwake.ExpoKeepAwakeTag`

Android

iOS

tvOS

Web

Type: `'ExpoKeepAwakeDefaultTag'`

Default tag, used when no tag has been specified in keep awake method calls.

## Hooks

### `useKeepAwake(tag, options)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
tag(optional)| `string`| Tag to lock screen sleep prevention. If not provided,
an ID unique to the owner component is used.  
options(optional)| `KeepAwakeOptions`| Additional options for the keep awake
hook.  
  
  

A React hook to keep the screen awake for as long as the owner component is
mounted. The optionally provided `tag` argument is used when activating and
deactivating the keep-awake feature. If unspecified, an ID unique to the owner
component is used. See the documentation for `activateKeepAwakeAsync` below to
learn more about the `tag` argument.

Returns:

`void`

## Methods

> Deprecated use `activateKeepAwakeAsync` instead.

### `KeepAwake.activateKeepAwake(tag)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
tag(optional)| `string`| Tag to lock screen sleep prevention. If not provided,
the default tag is used.Default:`ExpoKeepAwakeTag`  
  
  

Prevents the screen from sleeping until `deactivateKeepAwake` is called with
the same `tag` value.

If the `tag` argument is specified, the screen will not sleep until you call
`deactivateKeepAwake` with the same `tag` argument. When using multiple `tags`
for activation you'll have to deactivate each one in order to re-enable screen
sleep. If tag is unspecified, the default `tag` is used.

Web support [is limited](https://caniuse.com/wake-lock).

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `KeepAwake.activateKeepAwakeAsync(tag)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
tag(optional)| `string`| Tag to lock screen sleep prevention. If not provided,
the default tag is used.Default:`ExpoKeepAwakeTag`  
  
  

Prevents the screen from sleeping until `deactivateKeepAwake` is called with
the same `tag` value.

If the `tag` argument is specified, the screen will not sleep until you call
`deactivateKeepAwake` with the same `tag` argument. When using multiple `tags`
for activation you'll have to deactivate each one in order to re-enable screen
sleep. If tag is unspecified, the default `tag` is used.

Web support [is limited](https://caniuse.com/wake-lock).

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `KeepAwake.deactivateKeepAwake(tag)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
tag(optional)| `string`| Tag to release the lock on screen sleep prevention.
If not provided, the default tag is used.Default:`ExpoKeepAwakeTag`  
  
  

Releases the lock on screen-sleep prevention associated with the given `tag`
value. If `tag` is unspecified, it defaults to the same default tag that
`activateKeepAwake` uses.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `KeepAwake.isAvailableAsync()`

Android

iOS

tvOS

Web

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

`true` on all platforms except [unsupported web
browsers](https://caniuse.com/wake-lock).

## Event Subscriptions

### `KeepAwake.addListener(tagOrListener, listener)`

Web

Parameter| Type  
---|---  
tagOrListener| `string | [KeepAwakeListener](/versions/latest/sdk/keep-awake#keepawakelistenerevent)`  
listener(optional)| `[KeepAwakeListener](/versions/latest/sdk/keep-
awake#keepawakelistenerevent)`  
  
  

Observe changes to the keep awake timer. On web, this changes when navigating
away from the active window/tab. No-op on native.

Returns:

`EventSubscription`

Example

    
    
    KeepAwake.addListener(({ state }) => {
      // ...
    });
    

## Types

### `KeepAwakeEvent`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
state| `KeepAwakeEventState`| Keep awake state.  
  
### `KeepAwakeListener(event)`

Web

Parameter| Type  
---|---  
event| `KeepAwakeEvent`  
  
Returns:

`void`

### `KeepAwakeOptions`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
listener(optional)| `[KeepAwakeListener](/versions/latest/sdk/keep-
awake#keepawakelistenerevent)`| Only for: Web  
A callback that is invoked when the keep-awake state changes.  
suppressDeactivateWarnings(optional)| `boolean`| The call will throw an
unhandled promise rejection on Android when the original Activity is dead or
deactivated. Set the value to `true` for suppressing the uncaught exception.  
  
## Enums

### `KeepAwakeEventState`

Android

iOS

tvOS

Web

#### `RELEASE`

`KeepAwakeEventState.RELEASE ＝ "release"`

