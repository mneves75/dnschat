On this page

# TouchableNativeFeedback

> If you're looking for a more extensive and future-proof way to handle touch-
> based input, check out the [Pressable](/docs/pressable) API.

A wrapper for making views respond properly to touches (Android only). On
Android this component uses native state drawable to display touch feedback.

At the moment it only supports having a single View instance as a child node,
as it's implemented by replacing that View with another instance of RCTView
node with some additional properties set.

Background drawable of native feedback touchable can be customized with
`background` property.

## Example​

* * *

# Reference

## Props​

### [TouchableWithoutFeedback Props](/docs/touchablewithoutfeedback#props)​

Inherits [TouchableWithoutFeedback
Props](/docs/touchablewithoutfeedback#props).

* * *

### `background`​

Determines the type of background drawable that's going to be used to display
feedback. It takes an object with `type` property and extra data depending on
the `type`. It's recommended to use one of the static methods to generate that
dictionary.

Type  
---  
backgroundPropType  
  
* * *

### `useForeground`​

Set to true to add the ripple effect to the foreground of the view, instead of
the background. This is useful if one of your child views has a background of
its own, or you're e.g. displaying images, and you don't want the ripple to be
covered by them.

Check TouchableNativeFeedback.canUseNativeForeground() first, as this is only
available on Android 6.0 and above. If you try to use this on older versions
you will get a warning and fallback to background.

Type  
---  
bool  
  
* * *

### `hasTVPreferredFocus`

Android

​

TV preferred focus (see documentation for the View component).

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
  
## Methods​

### `SelectableBackground()`​

tsx

    
    
    static SelectableBackground(  
      rippleRadius: number | null,  
    ): ThemeAttributeBackgroundPropType;  
    

Creates an object that represents android theme's default background for
selectable elements (`?android:attr/selectableItemBackground`). `rippleRadius`
parameter controls the radius of the ripple effect.

* * *

### `SelectableBackgroundBorderless()`​

tsx

    
    
    static SelectableBackgroundBorderless(  
      rippleRadius: number | null,  
    ): ThemeAttributeBackgroundPropType;  
    

Creates an object that represent android theme's default background for
borderless selectable elements
(`?android:attr/selectableItemBackgroundBorderless`). Available on android API
level 21+. `rippleRadius` parameter controls the radius of the ripple effect.

* * *

### `Ripple()`​

tsx

    
    
    static Ripple(  
      color: ColorValue,  
      borderless: boolean,  
      rippleRadius?: number | null,  
    ): RippleBackgroundPropType;  
    

Creates an object that represents ripple drawable with specified color (as a
string). If property `borderless` evaluates to true the ripple will render
outside of the view bounds (see native actionbar buttons as an example of that
behavior). This background type is available on Android API level 21+.

**Parameters:**

Name| Type| Required| Description  
---|---|---|---  
color| string| Yes| The ripple color  
borderless| boolean| Yes| If the ripple can render outside its bounds  
rippleRadius| ?number| No| controls the radius of the ripple effect  
  
* * *

### `canUseNativeForeground()`​

tsx

    
    
    static canUseNativeForeground(): boolean;  
    

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/touchablenativefeedback.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/touchablenativefeedback.md)

Last updated on **Aug 20, 2025**

[
PreviousDrawerLayoutAndroid](/docs/drawerlayoutandroid)[NextInputAccessoryView](/docs/inputaccessoryview)

  * Example
  * Props
    * TouchableWithoutFeedback Props
    * `background`
    * `useForeground`
    * `hasTVPreferredFocus` Android
    * `nextFocusDown` Android
    * `nextFocusForward` Android
    * `nextFocusLeft` Android
    * `nextFocusRight` Android
    * `nextFocusUp` Android
  * Methods
    * `SelectableBackground()`
    * `SelectableBackgroundBorderless()`
    * `Ripple()`
    * `canUseNativeForeground()`

