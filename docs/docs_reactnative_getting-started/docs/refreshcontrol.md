On this page

# RefreshControl

This component is used inside a ScrollView or ListView to add pull to refresh
functionality. When the ScrollView is at `scrollY: 0`, swiping down triggers
an `onRefresh` event.

## Example​

> Note: `refreshing` is a controlled prop, this is why it needs to be set to
> `true` in the `onRefresh` function otherwise the refresh indicator will stop
> immediately.

* * *

# Reference

## Props​

### [View Props](/docs/view#props)​

Inherits [View Props](/docs/view#props).

* * *

###

Required

**`refreshing`**​

Whether the view should be indicating an active refresh.

Type  
---  
boolean  
  
* * *

### `colors`

Android

​

The colors (at least one) that will be used to draw the refresh indicator.

Type  
---  
array of [colors](/docs/colors)  
  
* * *

### `enabled`

Android

​

Whether the pull to refresh functionality is enabled.

Type| Default  
---|---  
boolean| `true`  
  
* * *

### `onRefresh`​

Called when the view starts refreshing.

Type  
---  
function  
  
* * *

### `progressBackgroundColor`

Android

​

The background color of the refresh indicator.

Type  
---  
[color](/docs/colors)  
  
* * *

### `progressViewOffset`​

Progress view top offset.

Type| Default  
---|---  
number| `0`  
  
* * *

### `size`

Android

​

Size of the refresh indicator.

Type| Default  
---|---  
enum(`'default'`, `'large'`)| `'default'`  
  
* * *

### `tintColor`

iOS

​

The color of the refresh indicator.

Type  
---  
[color](/docs/colors)  
  
* * *

### `title`

iOS

​

The title displayed under the refresh indicator.

Type  
---  
string  
  
* * *

### `titleColor`

iOS

​

The color of the refresh indicator title.

Type  
---  
[color](/docs/colors)  
  
[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/refreshcontrol.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/refreshcontrol.md)

Last updated on **Aug 20, 2025**

[ PreviousPressable](/docs/pressable)[NextScrollView](/docs/scrollview)

  * Example
  * Props
    * View Props
    * Required**`refreshing`**
    * `colors` Android
    * `enabled` Android
    * `onRefresh`
    * `progressBackgroundColor` Android
    * `progressViewOffset`
    * `size` Android
    * `tintColor` iOS
    * `title` iOS
    * `titleColor` iOS

