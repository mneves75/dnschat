# ![Expo DevClient icon](/static/images/packages/expo-dev-client.png)Expo
DevClient

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-dev-
client)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-dev-
client/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-dev-client)

Ask AI

A library that allows creating a development build and includes useful
development tools.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-dev-
client)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-dev-
client/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-dev-client)

Ask AI

Android

iOS

tvOS

Bundled version:

~6.0.13

Copy

* * *

`expo-dev-client` adds various useful development tools to your debug builds:

  * A configurable launcher UI, so you can launch updates (such as from [PR previews](/develop/development-builds/development-workflows#pr-previews)) and switch between development servers without needing to recompile the native app
  * Improved debugging tools (such as support for [inspecting network requests](/debugging/tools#inspecting-network-requests))
  * [A powerful and extensible developer menu UI](/debugging/tools#developer-menu)

Expo documentation refers to debug builds that include `expo-dev-client` as
[development builds](/develop/development-builds/introduction).

## Installation

Terminal

Copy

`- ``npx expo install expo-dev-client`

If you are installing this in an [existing React Native app](/bare/overview),
start by installing [`expo`](/bare/installing-expo-modules) in your project.
Then, follow the instructions from [Install `expo-dev-client` in an existing
React Native project](/bare/install-dev-builds-in-bare).

## Configuration in app config

You can configure development client launcher using its built-in [config
plugin](/config-plugins/introduction) if you use config plugins in your
project ([EAS Build](/build/introduction) or `npx expo run:[android|ios]`).
The plugin allows you to configure various properties that cannot be set at
runtime and require building a new app binary to take effect.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "plugins": [
          [
            "expo-dev-client",
            {
              "launchMode": "most-recent"
            }
          ]
        ]
      }
    }
    

### Configurable properties

Name| Default| Description  
---|---|---  
`launchMode`| `"most-recent"`| Determines whether to launch the most recently
opened project or navigate to the launcher screen.

  * `most-recent` \- Attempt to launch directly into a previously opened project and if unable to connect, fall back to the launcher screen.
  * `launcher` \- Opens the launcher screen.

  
`addGeneratedScheme`| `true`| By default, `expo-dev-client` will register a
custom URL scheme to open a project. Set this property to `false` to disable
this scheme.  
  
## TV support

  * This library is only supported for TV in SDK 54 and later.

    * Android TV: All operations are supported, similar to an Android phone.
    * Apple TV: Basic operations with a local or tunneled packager are supported. Authentication to EAS and listing of EAS builds and updates is not yet supported.

## API

    
    
    import * as DevClient from 'expo-dev-client';
    

## Methods

### `DevClient.closeMenu()`

Android

iOS

tvOS

A method that closes development client menu when called.

Returns:

`void`

### `DevClient.hideMenu()`

Android

iOS

tvOS

A method that hides development client menu when called.

Returns:

`void`

### `DevClient.openMenu()`

Android

iOS

tvOS

A method that opens development client menu when called.

Returns:

`void`

### `DevClient.registerDevMenuItems(items)`

Android

iOS

tvOS

Parameter| Type  
---|---  
items| `ExpoDevMenuItem[]`  
  
  

A method that allows to specify custom entries in the development client menu.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

## Types

### `ExpoDevMenuItem`

Android

iOS

tvOS

An object representing the custom development client menu entry.

Property| Type| Description  
---|---|---  
callback| `() => void`| Callback to fire, when user selects an item.  
name| `string`| Name of the entry, will be used as label.  
shouldCollapse(optional)| `boolean`| A boolean specifying if the menu should
close after the user interaction.Default:`false`

