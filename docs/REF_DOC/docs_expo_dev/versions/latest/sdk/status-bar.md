# ![Expo StatusBar icon](/static/images/packages/expo-status-bar.png)Expo
StatusBar

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-status-
bar)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-status-
bar/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-status-bar)

Ask AI

A library that provides the same interface as the React Native StatusBar API,
but with slightly different defaults to work great in Expo environments.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-status-
bar)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-status-
bar/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-status-bar)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~3.0.8

Copy

* * *

`expo-status-bar` gives you a component and imperative interface to control
the app status bar to change its text color, background color, hide it, make
it translucent or opaque, and apply animations to any of these changes.
Exactly what you are able to do with the `StatusBar` component depends on the
platform you're using.

> tvOS and web support
>
> For tvOS, the `expo-status-bar` code will compile and run, but no status bar
> will show.
>
> For web, there is no API available to control the operating system's status
> bar, so `expo-status-bar` will do nothing and won't throw an error.

## Installation

Terminal

Copy

`- ``npx expo install expo-status-bar`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

Example

Copy

Open in Snack

    
    
    import { StyleSheet, Text, View } from 'react-native';
    import { StatusBar } from 'expo-status-bar';
    
    export default function App() {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Notice that the status bar has light text!</Text>
          <StatusBar style="light" />
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
      },
      text: {
        color: '#fff',
      },
    });
    

## API

    
    
    import { StatusBar } from 'expo-status-bar';
    

## Component

### `StatusBar`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<StatusBarProps>`

A component that allows you to configure your status bar without directly
calling imperative methods like `setBarStyle`.

You will likely have multiple `StatusBar` components mounted in the same app
at the same time. For example, if you have multiple screens in your app, you
may end up using one per screen. The props of each `StatusBar` component will
be merged in the order that they were mounted. This component is built on top
of the [StatusBar](https://reactnative.dev/docs/statusbar) component exported
from React Native, and it provides defaults that work better for Expo users.

StatusBarProps

### `animated`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

If the transition between status bar property changes should be animated.
Supported for `backgroundColor`, `barStyle` and `hidden`.

### `backgroundColor`

Android

Optional • Type: `string`

The background color of the status bar.

### `hidden`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

If the status bar is hidden.

### `hideTransitionAnimation`

iOS

Optional • Type: `StatusBarAnimation` • Default: `'fade'`

The transition effect when showing and hiding the status bar using the hidden
prop.

### `networkActivityIndicatorVisible`

iOS

Optional • Type: `boolean`

If the network activity indicator should be visible.

### `style`

Android

iOS

tvOS

Web

Optional • Type: `StatusBarStyle` • Default: `'auto'`

Sets the color of the status bar text. Default value is `"auto"` which picks
the appropriate value according to the active color scheme, eg: if your app is
dark mode, the style will be `"light"`.

### `translucent`

Android

Optional • Type: `boolean`

If the status bar is translucent. When translucent is set to `true`, the app
will draw under the status bar. This is the default behaviour in projects
created with Expo tools because it is consistent with iOS.

## Methods

### `StatusBar.setStatusBarBackgroundColor(backgroundColor, animated)`

Android

Parameter| Type| Description  
---|---|---  
backgroundColor| `[ColorValue](https://reactnative.dev/docs/colors)`| The
background color of the status bar.  
animated(optional)| `boolean`| `true` to animate the background color change,
`false` to change immediately.  
  
  

Set the background color of the status bar.

Returns:

`void`

### `StatusBar.setStatusBarHidden(hidden, animation)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
hidden| `boolean`| If the status bar should be hidden.  
animation(optional)| `StatusBarAnimation`| Animation to use when toggling
hidden, defaults to `'none'`.  
  
  

Toggle visibility of the status bar.

Returns:

`void`

### `StatusBar.setStatusBarNetworkActivityIndicatorVisible(visible)`

iOS

Parameter| Type| Description  
---|---|---  
visible| `boolean`| If the network activity indicator should be visible.  
  
  

Toggle visibility of the network activity indicator.

Returns:

`void`

### `StatusBar.setStatusBarStyle(style, animated)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
style| `StatusBarStyle`| The color of the status bar text.  
animated(optional)| `boolean`| If the transition should be animated.  
  
  

Set the bar style of the status bar.

Returns:

`void`

### `StatusBar.setStatusBarTranslucent(translucent)`

Android

Parameter| Type| Description  
---|---|---  
translucent| `boolean`| Whether the app can draw under the status bar. When
`true`, content will be rendered under the status bar. This is always `true`
on iOS and cannot be changed.  
  
  

Set the translucency of the status bar.

Returns:

`void`

## Types

### `StatusBarAnimation`

Android

iOS

tvOS

Web

Literal Type: `string`

Acceptable values are: `'none'` | `'fade'` | `'slide'`

### `StatusBarStyle`

Android

iOS

tvOS

Web

Literal Type: `string`

Acceptable values are: `'auto'` | `'inverted'` | `'light'` | `'dark'`

