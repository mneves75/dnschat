On this page

# KeyboardAvoidingView

This component will automatically adjust its height, position, or bottom
padding based on the keyboard height to remain visible while the virtual
keyboard is displayed.

## Example​

* * *

# Reference

## Props​

### [View Props](/docs/view#props)​

Inherits [View Props](/docs/view#props).

* * *

### `behavior`​

Specify how to react to the presence of the keyboard.

> Android and iOS both interact with this prop differently. On both iOS and
> Android, setting `behavior` is recommended.

Type  
---  
enum(`'height'`, `'position'`, `'padding'`)  
  
* * *

### `contentContainerStyle`​

The style of the content container (View) when behavior is `'position'`.

Type  
---  
[View Style](/docs/view-style-props)  
  
* * *

### `enabled`​

Enabled or disabled KeyboardAvoidingView.

Type| Default  
---|---  
boolean| `true`  
  
* * *

### `keyboardVerticalOffset`​

This is the distance between the top of the user screen and the react native
view, may be non-zero in some use cases.

Type| Default  
---|---  
number| `0`  
  
[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/keyboardavoidingview.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/keyboardavoidingview.md)

Last updated on **Aug 12, 2025**

[ PreviousImageBackground](/docs/imagebackground)[NextModal](/docs/modal)

  * Example
  * Props
    * View Props
    * `behavior`
    * `contentContainerStyle`
    * `enabled`
    * `keyboardVerticalOffset`

