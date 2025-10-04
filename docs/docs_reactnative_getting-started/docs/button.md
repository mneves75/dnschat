On this page

# Button

A basic button component that should render nicely on any platform. Supports a
minimal level of customization.

If this button doesn't look right for your app, you can build your own button
using [Pressable](/docs/pressable). For inspiration, look at the [source code
for the Button component](https://github.com/facebook/react-
native/blob/main/packages/react-native/Libraries/Components/Button.js).

tsx

    
    
    <Button  
      onPress={onPressLearnMore}  
      title="Learn More"  
      color="#841584"  
      accessibilityLabel="Learn more about this purple button"  
    />  
    

## Example​

* * *

# Reference

## Props​

###

Required

**`onPress`**​

Handler to be called when the user taps the button.

Type  
---  
`({nativeEvent: [PressEvent](/docs/pressevent)})`  
  
* * *

###

Required

**`title`**​

Text to display inside the button. On Android the given title will be
converted to the uppercased form.

Type  
---  
string  
  
* * *

### `accessibilityLabel`​

Text to display for blindness accessibility features.

Type  
---  
string  
  
* * *

### `accessibilityLanguage`

iOS

​

A value indicating which language should be used by the screen reader when the
user interacts with the element. It should follow the [BCP 47
specification](https://www.rfc-editor.org/info/bcp47).

See the [iOS `accessibilityLanguage`
doc](https://developer.apple.com/documentation/objectivec/nsobject/1615192-accessibilitylanguage)
for more information.

Type  
---  
string  
  
* * *

### `accessibilityActions`​

Accessibility actions allow an assistive technology to programmatically invoke
the actions of a component. The `accessibilityActions` property should contain
a list of action objects. Each action object should contain the field name and
label.

See the [Accessibility guide](/docs/accessibility#accessibility-actions) for
more information.

Type| Required  
---|---  
array| No  
  
* * *

### `onAccessibilityAction`​

Invoked when the user performs the accessibility actions. The only argument to
this function is an event containing the name of the action to perform.

See the [Accessibility guide](/docs/accessibility#accessibility-actions) for
more information.

Type| Required  
---|---  
function| No  
  
* * *

### `color`​

Color of the text (iOS), or background color of the button (Android).

Type| Default  
---|---  
[color](/docs/colors)|  `'#2196F3'` Android

* * *

`'#007AFF'` iOS  
  
* * *

### `disabled`​

If `true`, disable all interactions for this component.

Type| Default  
---|---  
bool| `false`  
  
* * *

### `hasTVPreferredFocus`

TV

​

TV preferred focus.

Type| Default  
---|---  
bool| `false`  
  
* * *

### `nextFocusDown`

Android

TV

​

Designates the next view to receive focus when the user navigates down. See
the [Android
documentation](https://developer.android.com/reference/android/view/View.html#attr_android:nextFocusDown).

Type  
---  
number  
  
* * *

### `nextFocusForward`

Android

TV

​

Designates the next view to receive focus when the user navigates forward. See
the [Android
documentation](https://developer.android.com/reference/android/view/View.html#attr_android:nextFocusForward).

Type  
---  
number  
  
* * *

### `nextFocusLeft`

Android

TV

​

Designates the next view to receive focus when the user navigates left. See
the [Android
documentation](https://developer.android.com/reference/android/view/View.html#attr_android:nextFocusLeft).

Type  
---  
number  
  
* * *

### `nextFocusRight`

Android

TV

​

Designates the next view to receive focus when the user navigates right. See
the [Android
documentation](https://developer.android.com/reference/android/view/View.html#attr_android:nextFocusRight).

Type  
---  
number  
  
* * *

### `nextFocusUp`

Android

TV

​

Designates the next view to receive focus when the user navigates up. See the
[Android
documentation](https://developer.android.com/reference/android/view/View.html#attr_android:nextFocusUp).

Type  
---  
number  
  
* * *

### `testID`​

Used to locate this view in end-to-end tests.

Type  
---  
string  
  
* * *

### `touchSoundDisabled`

Android

​

If `true`, doesn't play system sound on touch.

Type| Default  
---|---  
boolean| `false`  
  
[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/button.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/button.md)

Last updated on **Aug 20, 2025**

[
PreviousActivityIndicator](/docs/activityindicator)[NextFlatList](/docs/flatlist)

  * Example
  * Props
    * Required**`onPress`**
    * Required**`title`**
    * `accessibilityLabel`
    * `accessibilityLanguage` iOS
    * `accessibilityActions`
    * `onAccessibilityAction`
    * `color`
    * `disabled`
    * `hasTVPreferredFocus` TV
    * `nextFocusDown` AndroidTV
    * `nextFocusForward` AndroidTV
    * `nextFocusLeft` AndroidTV
    * `nextFocusRight` AndroidTV
    * `nextFocusUp` AndroidTV
    * `testID`
    * `touchSoundDisabled` Android

