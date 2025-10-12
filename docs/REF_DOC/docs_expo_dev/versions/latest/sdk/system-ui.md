# Expo SystemUI

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-system-
ui)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-system-
ui/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-system-ui)

Ask AI

A library that allows interacting with system UI elements.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-system-
ui)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-system-
ui/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-system-ui)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~6.0.7

Copy

* * *

`expo-system-ui` enables you to interact with UI elements that fall outside of
the React tree. Specifically the root view background color, and locking the
user interface style globally on Android.

## Installation

Terminal

Copy

`- ``npx expo install expo-system-ui`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## API

    
    
    import * as SystemUI from 'expo-system-ui';
    

## Methods

### `SystemUI.getBackgroundColorAsync()`

Android

iOS

tvOS

Web

Gets the root view background color.

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[ColorValue](https://reactnative.dev/docs/colors) | null>`

Current root view background color in hex format. Returns `null` if the
background color is not set.

Example

    
    
    const color = await SystemUI.getBackgroundColorAsync();
    

### `SystemUI.setBackgroundColorAsync(color)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
color| `null | [ColorValue](https://reactnative.dev/docs/colors)`| Any valid [CSS 3 (SVG) color](http://www.w3.org/TR/css3-color/#svg-color).  
  
  

Changes the root view background color. Call this function in the root file
outside of your component.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Example

    
    
    SystemUI.setBackgroundColorAsync("black");
    

