On this page

# TouchableHighlight

> If you're looking for a more extensive and future-proof way to handle touch-
> based input, check out the [Pressable](/docs/pressable) API.

A wrapper for making views respond properly to touches. On press down, the
opacity of the wrapped view is decreased, which allows the underlay color to
show through, darkening or tinting the view.

The underlay comes from wrapping the child in a new View, which can affect
layout, and sometimes cause unwanted visual artifacts if not used correctly,
for example if the backgroundColor of the wrapped view isn't explicitly set to
an opaque color.

TouchableHighlight must have one child (not zero or more than one). If you
wish to have several child components, wrap them in a View.

tsx

    
    
    function MyComponent(props: MyComponentProps) {  
      return (  
        <View {...props} style={{flex: 1, backgroundColor: '#fff'}}>  
          <Text>My Component</Text>  
        </View>  
      );  
    }  
      
    <TouchableHighlight  
      activeOpacity={0.6}  
      underlayColor="#DDDDDD"  
      onPress={() => alert('Pressed!')}>  
      <MyComponent />  
    </TouchableHighlight>;  
    

## Example​

* * *

# Reference

## Props​

### [TouchableWithoutFeedback Props](/docs/touchablewithoutfeedback#props)​

Inherits [TouchableWithoutFeedback
Props](/docs/touchablewithoutfeedback#props).

* * *

### `activeOpacity`​

Determines what the opacity of the wrapped view should be when touch is
active. The value should be between 0 and 1. Defaults to 0.85. Requires
`underlayColor` to be set.

Type  
---  
number  
  
* * *

### `onHideUnderlay`​

Called immediately after the underlay is hidden.

Type  
---  
function  
  
* * *

### `onShowUnderlay`​

Called immediately after the underlay is shown.

Type  
---  
function  
  
* * *

### `style`​

Type  
---  
View.style  
  
* * *

### `underlayColor`​

The color of the underlay that will show through when the touch is active.

Type  
---  
[color](/docs/colors)  
  
* * *

### `hasTVPreferredFocus`

iOS

​

_(Apple TV only)_ TV preferred focus (see documentation for the View
component).

Type  
---  
bool  
  
* * *

### `nextFocusDown`

Android

​

TV next focus down (see documentation for the View component).

Type  
---  
number  
  
* * *

### `nextFocusForward`

Android

​

TV next focus forward (see documentation for the View component).

Type  
---  
number  
  
* * *

### `nextFocusLeft`

Android

​

TV next focus left (see documentation for the View component).

Type  
---  
number  
  
* * *

### `nextFocusRight`

Android

​

TV next focus right (see documentation for the View component).

Type  
---  
number  
  
* * *

### `nextFocusUp`

Android

​

TV next focus up (see documentation for the View component).

Type  
---  
number  
  
* * *

### `testOnly_pressed`​

Handy for snapshot tests.

Type  
---  
bool  
  
[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/touchablehighlight.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/touchablehighlight.md)

Last updated on **Aug 20, 2025**

[
PreviousTextInput](/docs/textinput)[NextTouchableOpacity](/docs/touchableopacity)

  * Example
  * Props
    * TouchableWithoutFeedback Props
    * `activeOpacity`
    * `onHideUnderlay`
    * `onShowUnderlay`
    * `style`
    * `underlayColor`
    * `hasTVPreferredFocus` iOS
    * `nextFocusDown` Android
    * `nextFocusForward` Android
    * `nextFocusLeft` Android
    * `nextFocusRight` Android
    * `nextFocusUp` Android
    * `testOnly_pressed`

