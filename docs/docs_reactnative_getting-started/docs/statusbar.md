On this page

# StatusBar

Component to control the app's status bar. The status bar is the zone,
typically at the top of the screen, that displays the current time, Wi-Fi and
cellular network information, battery level and/or other status icons.

### Usage with Navigator​

It is possible to have multiple `StatusBar` components mounted at the same
time. The props will be merged in the order the `StatusBar` components were
mounted.

  * TypeScript
  * JavaScript

### Imperative API​

For cases where using a component is not ideal, there is also an imperative
API exposed as static functions on the component. It is however not
recommended to use the static API and the component for the same prop because
any value set by the static API will get overridden by the one set by the
component in the next render.

* * *

# Reference

## Constants​

### `currentHeight`

Android

​

The height of the status bar, which includes the notch height, if present.

* * *

## Props​

### `animated`​

If the transition between status bar property changes should be animated.
Supported for `backgroundColor`, `barStyle` and `hidden` properties.

Type| Required| Default  
---|---|---  
boolean| No| `false`  
  
* * *

### `backgroundColor`

Android

​

The background color of the status bar.

warning

Due to edge-to-edge enforcement introduced in Android 15, setting background
color of the status bar is deprecated in API level 35 and setting it will have
no effect. You can read more about our [edge-to-edge recommendations
here](https://github.com/react-native-community/discussions-and-
proposals/discussions/827).

Type| Required| Default  
---|---|---  
[color](/docs/colors)| No| default system StatusBar background color, or
`'black'` if not defined  
  
* * *

### `barStyle`​

Sets the color of the status bar text.

On Android, this will only have an impact on API versions 23 and above.

Type| Required| Default  
---|---|---  
[StatusBarStyle](/docs/statusbar#statusbarstyle)| No| `'default'`  
  
* * *

### `hidden`​

If the status bar is hidden.

Type| Required| Default  
---|---|---  
boolean| No| `false`  
  
* * *

### `networkActivityIndicatorVisible`

iOS

​

If the network activity indicator should be visible.

Type| Default  
---|---  
boolean| `false`  
  
* * *

### `showHideTransition`

iOS

​

The transition effect when showing and hiding the status bar using the
`hidden` prop.

Type| Default  
---|---  
[StatusBarAnimation](/docs/statusbar#statusbaranimation)| `'fade'`  
  
* * *

### `translucent`

Android

​

If the status bar is translucent. When translucent is set to `true`, the app
will draw under the status bar. This is useful when using a semi transparent
status bar color.

warning

Due to edge-to-edge enforcement introduced in Android 15, setting the status
bar as translucent is deprecated in API level 35 and setting it will have no
effect. You can read more about our [edge-to-edge recommendations
here](https://github.com/react-native-community/discussions-and-
proposals/discussions/827).

Type| Default  
---|---  
boolean| `false`  
  
## Methods​

### `popStackEntry()`​

tsx

    
    
    static popStackEntry(entry: StatusBarProps);  
    

Get and remove the last StatusBar entry from the stack.

**Parameters:**

Name| Type| Description  
---|---|---  
entry Required| any| Entry returned from `pushStackEntry`.  
  
* * *

### `pushStackEntry()`​

tsx

    
    
    static pushStackEntry(props: StatusBarProps): StatusBarProps;  
    

Push a StatusBar entry onto the stack. The return value should be passed to
`popStackEntry` when complete.

**Parameters:**

Name| Type| Description  
---|---|---  
props Required| any| Object containing the StatusBar props to use in the stack
entry.  
  
* * *

### `replaceStackEntry()`​

tsx

    
    
    static replaceStackEntry(  
      entry: StatusBarProps,  
      props: StatusBarProps  
    ): StatusBarProps;  
    

Replace an existing StatusBar stack entry with new props.

**Parameters:**

Name| Type| Description  
---|---|---  
entry Required| any| Entry returned from `pushStackEntry` to replace.  
props Required| any| Object containing the StatusBar props to use in the
replacement stack entry.  
  
* * *

### `setBackgroundColor()`

Android

​

tsx

    
    
    static setBackgroundColor(color: ColorValue, animated?: boolean);  
    

Set the background color for the status bar.

warning

Due to edge-to-edge enforcement introduced in Android 15, setting background
color of the status bar is deprecated in API level 35 and setting it will have
no effect. You can read more about our [edge-to-edge recommendations
here](https://github.com/react-native-community/discussions-and-
proposals/discussions/827).

**Parameters:**

Name| Type| Description  
---|---|---  
color Required| string| Background color.  
animated| boolean| Animate the style change.  
  
* * *

### `setBarStyle()`​

tsx

    
    
    static setBarStyle(style: StatusBarStyle, animated?: boolean);  
    

Set the status bar style.

**Parameters:**

Name| Type| Description  
---|---|---  
style Required| [StatusBarStyle](/docs/statusbar#statusbarstyle)| Status bar
style to set.  
animated| boolean| Animate the style change.  
  
* * *

### `setHidden()`​

tsx

    
    
    static setHidden(hidden: boolean, animation?: StatusBarAnimation);  
    

Show or hide the status bar.

**Parameters:**

Name| Type| Description  
---|---|---  
hidden Required| boolean| Hide the status bar.  
animation iOS| [StatusBarAnimation](/docs/statusbar#statusbaranimation)|
Animation when changing the status bar hidden property.  
  
* * *

### `setNetworkActivityIndicatorVisible()`

iOS

​

tsx

    
    
    static setNetworkActivityIndicatorVisible(visible: boolean);  
    

Control the visibility of the network activity indicator.

**Parameters:**

Name| Type| Description  
---|---|---  
visible Required| boolean| Show the indicator.  
  
* * *

### `setTranslucent()`

Android

​

tsx

    
    
    static setTranslucent(translucent: boolean);  
    

Control the translucency of the status bar.

warning

Due to edge-to-edge enforcement introduced in Android 15, setting the status
bar as translucent is deprecated in API level 35 and setting it will have no
effect. You can read more about our [edge-to-edge recommendations
here](https://github.com/react-native-community/discussions-and-
proposals/discussions/827).

**Parameters:**

Name| Type| Description  
---|---|---  
translucent Required| boolean| Set as translucent.  
  
## Type Definitions​

### StatusBarAnimation​

Status bar animation type for transitions on the iOS.

Type  
---  
enum  
  
**Constants:**

Value| Type| Description  
---|---|---  
`'fade'`| string| Fade animation  
`'slide'`| string| Slide animation  
`'none'`| string| No animation  
  
* * *

### StatusBarStyle​

Status bar style type.

Type  
---  
enum  
  
**Constants:**

Value| Type| Description  
---|---|---  
`'default'`| string| Default status bar style (dark for iOS, light for
Android)  
`'light-content'`| string| White texts and icons  
`'dark-content'`| string| Dark texts and icons (requires API>=23 on Android)  
  
[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/statusbar.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/statusbar.md)

Last updated on **Aug 20, 2025**

[ PreviousSectionList](/docs/sectionlist)[NextSwitch](/docs/switch)

  * Usage with Navigator
  * Imperative API
  * Constants
    * `currentHeight` Android
  * Props
    * `animated`
    * `backgroundColor` Android
    * `barStyle`
    * `hidden`
    * `networkActivityIndicatorVisible` iOS
    * `showHideTransition` iOS
    * `translucent` Android
  * Methods
    * `popStackEntry()`
    * `pushStackEntry()`
    * `replaceStackEntry()`
    * `setBackgroundColor()` Android
    * `setBarStyle()`
    * `setHidden()`
    * `setNetworkActivityIndicatorVisible()` iOS
    * `setTranslucent()` Android
  * Type Definitions
    * StatusBarAnimation
    * StatusBarStyle

