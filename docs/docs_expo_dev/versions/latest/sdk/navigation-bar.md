# Expo NavigationBar

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-navigation-
bar)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
navigation-bar/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
navigation-bar)

Ask AI

A library that provides access to various interactions with the native
navigation bar on Android.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-navigation-
bar)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
navigation-bar/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
navigation-bar)

Ask AI

Android

Bundled version:

~5.0.8

Copy

* * *

`expo-navigation-bar` enables you to modify and observe the native navigation
bar on Android devices. Due to some Android platform restrictions, parts of
this API overlap with the `expo-status-bar` API.

Properties are named after style properties; visibility, position,
backgroundColor, borderColor, and so on.

The APIs in this package have no impact when "Gesture Navigation" is enabled
on the Android device. There is currently no native Android API to detect if
"Gesture Navigation" is enabled or not.

## Installation

Terminal

Copy

`- ``npx expo install expo-navigation-bar`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## API

    
    
    import * as NavigationBar from 'expo-navigation-bar';
    

## Hooks

### `useVisibility()`

Android

React hook that statefully updates with the visibility of the system
navigation bar.

Returns:

`NavigationBarVisibility | null`

Visibility of the navigation bar, `null` during async initialization.

Example

    
    
    function App() {
      const visibility = NavigationBar.useVisibility()
      // React Component...
    }
    

## Methods

### `NavigationBar.getBackgroundColorAsync()`

Android

Gets the navigation bar's background color.

> This method is supported only when edge-to-edge is disabled.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

Current navigation bar color in hex format. Returns `#00000000` (transparent)
on unsupported platforms (iOS, web).

Example

    
    
    const color = await NavigationBar.getBackgroundColorAsync();
    

### `NavigationBar.getBehaviorAsync()`

Android

Gets the behavior of the status and navigation bars when the user swipes or
touches the screen.

> This method is supported only when edge-to-edge is disabled.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<NavigationBarBehavior>`

Navigation bar interaction behavior. Returns `inset-touch` on unsupported
platforms (iOS, web).

Example

    
    
    await NavigationBar.getBehaviorAsync()
    

### `NavigationBar.getBorderColorAsync()`

Android

Gets the navigation bar's top border color, also known as the "divider color".

> This method is supported only when edge-to-edge is disabled.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

Navigation bar top border color in hex format. Returns `#00000000`
(transparent) on unsupported platforms (iOS, web).

Example

    
    
    const color = await NavigationBar.getBorderColorAsync();
    

### `NavigationBar.getButtonStyleAsync()`

Android

Gets the navigation bar's button color styles.

> This method is supported only when edge-to-edge is disabled.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<NavigationBarButtonStyle>`

Navigation bar foreground element color settings. Returns `light` on
unsupported platforms (iOS, web).

Example

    
    
    const style = await NavigationBar.getButtonStyleAsync();
    

### `NavigationBar.getVisibilityAsync()`

Android

Get the navigation bar's visibility.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<NavigationBarVisibility>`

Navigation bar's current visibility status. Returns `hidden` on unsupported
platforms (iOS, web).

Example

    
    
    const visibility = await NavigationBar.getVisibilityAsync("hidden");
    

### `NavigationBar.setBackgroundColorAsync(color)`

Android

Parameter| Type| Description  
---|---|---  
color| `string`| Any valid [CSS 3 (SVG)
color](http://www.w3.org/TR/css3-color/#svg-color).  
  
  

Changes the navigation bar's background color.

> This method is supported only when edge-to-edge is disabled.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Example

    
    
    NavigationBar.setBackgroundColorAsync("white");
    

### `NavigationBar.setBehaviorAsync(behavior)`

Android

Parameter| Type| Description  
---|---|---  
behavior| `NavigationBarBehavior`| Dictates the interaction behavior of the
navigation bar.  
  
  

Sets the behavior of the status bar and navigation bar when they are hidden
and the user wants to reveal them.

For example, if the navigation bar is hidden (`setVisibilityAsync(false)`) and
the behavior is `'overlay-swipe'`, the user can swipe from the bottom of the
screen to temporarily reveal the navigation bar.

  * `'overlay-swipe'`: Temporarily reveals the System UI after a swipe gesture (bottom or top) without insetting your App's content.
  * `'inset-swipe'`: Reveals the System UI after a swipe gesture (bottom or top) and insets your App's content (Safe Area). The System UI is visible until you explicitly hide it again.
  * `'inset-touch'`: Reveals the System UI after a touch anywhere on the screen and insets your App's content (Safe Area). The System UI is visible until you explicitly hide it again.

> This method is supported only when edge-to-edge is disabled.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Example

    
    
    await NavigationBar.setBehaviorAsync('overlay-swipe')
    

### `NavigationBar.setBorderColorAsync(color)`

Android

Parameter| Type| Description  
---|---|---  
color| `string`| Any valid [CSS 3 (SVG)
color](http://www.w3.org/TR/css3-color/#svg-color).  
  
  

Changes the navigation bar's border color.

> This method is supported only when edge-to-edge is disabled.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Example

    
    
    NavigationBar.setBorderColorAsync("red");
    

### `NavigationBar.setButtonStyleAsync(style)`

Android

Parameter| Type| Description  
---|---|---  
style| `NavigationBarButtonStyle`| Dictates the color of the foreground
element color.  
  
  

Changes the navigation bar's button colors between white (`light`) and a dark
gray color (`dark`).

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Example

    
    
    NavigationBar.setButtonStyleAsync("light");
    

### `NavigationBar.setPositionAsync(position)`

Android

Parameter| Type| Description  
---|---|---  
position| `NavigationBarPosition`| Based on CSS position property.  
  
  

Sets positioning method used for the navigation bar (and status bar). Setting
position `absolute` will float the navigation bar above the content, whereas
position `relative` will shrink the screen to inline the navigation bar.

When drawing behind the status and navigation bars, ensure the safe area
insets are adjusted accordingly.

> This method is supported only when edge-to-edge is disabled.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Example

    
    
    // enables edge-to-edge mode
    await NavigationBar.setPositionAsync('absolute')
    // transparent backgrounds to see through
    await NavigationBar.setBackgroundColorAsync('#ffffff00')
    

### `NavigationBar.setStyle(style)`

Android

Parameter| Type  
---|---  
style| `NavigationBarStyle`  
  
  

Sets the style of the navigation bar.

> This will have an effect when the following conditions are met:
>
>   * Edge-to-edge is enabled
>   * The `enforceNavigationBarContrast` option of the `react-native-edge-to-
> edge` plugin is set to `false`.
>   * The device is using the three-button navigation bar.
>

> Due to a bug in the Android 15 emulator this function may have no effect.
> Try a physical device or an emulator with a different version of Android.

Returns:

`void`

### `NavigationBar.setVisibilityAsync(visibility)`

Android

Parameter| Type| Description  
---|---|---  
visibility| `NavigationBarVisibility`| Based on CSS visibility property.  
  
  

Set the navigation bar's visibility.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Example

    
    
    NavigationBar.setVisibilityAsync("hidden");
    

### `NavigationBar.unstable_getPositionAsync()`

Android

Whether the navigation and status bars float above the app (absolute) or sit
inline with it (relative). This value can be incorrect if
`androidNavigationBar.visible` is used instead of the config plugin `position`
property.

This method is unstable because the position can be set via another native
module and get out of sync. Alternatively, you can get the position by
measuring the insets returned by `react-native-safe-area-context`.

> This method is supported only when edge-to-edge is disabled.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<NavigationBarPosition>`

Navigation bar positional rendering mode. Returns `relative` on unsupported
platforms (iOS, web).

Example

    
    
    await NavigationBar.unstable_getPositionAsync()
    

## Event Subscriptions

### `NavigationBar.addVisibilityListener(listener)`

Android

Parameter| Type  
---|---  
listener| `(event: NavigationBarVisibilityEvent) => void`  
  
  

Observe changes to the system navigation bar. Due to platform constraints,
this callback will also be triggered when the status bar visibility changes.

Returns:

`EventSubscription`

Example

    
    
    NavigationBar.addVisibilityListener(({ visibility }) => {
      // ...
    });
    

## Types

### `NavigationBarBehavior`

Android

Literal Type: `string`

Interaction behavior for the system navigation bar.

Acceptable values are: `'overlay-swipe'` | `'inset-swipe'` | `'inset-touch'`

### `NavigationBarButtonStyle`

Android

Literal Type: `string`

Appearance of the foreground elements in the navigation bar, i.e. the color of
the menu, back, home button icons.

  * `dark` makes buttons darker to adjust for a mostly light nav bar.
  * `light` makes buttons lighter to adjust for a mostly dark nav bar.

Acceptable values are: `'light'` | `'dark'`

### `NavigationBarPosition`

Android

Literal Type: `string`

Navigation bar positional mode.

Acceptable values are: `'relative'` | `'absolute'`

### `NavigationBarStyle`

Android

Literal Type: `string`

Navigation bar style.

  * `auto` will automatically adjust based on the current theme.
  * `light` a light navigation bar with dark content.
  * `dark` a dark navigation bar with light content.
  * `inverted` the bar colors are inverted in relation to the current theme.

Acceptable values are: `'auto'` | `'inverted'` | `'light'` | `'dark'`

### `NavigationBarVisibility`

Android

Literal Type: `string`

Visibility of the navigation bar.

Acceptable values are: `'visible'` | `'hidden'`

### `NavigationBarVisibilityEvent`

Android

Current system UI visibility state. Due to platform constraints, this will
return when the status bar visibility changes as well as the navigation bar.

Property| Type| Description  
---|---|---  
rawVisibility| `number`| Native Android system UI visibility state, returned
from the native Android `setOnSystemUiVisibilityChangeListener` API.  
visibility| `NavigationBarVisibility`| Current navigation bar visibility.

