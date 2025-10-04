On this page

# ToastAndroid

React Native's ToastAndroid API exposes the Android platform's ToastAndroid
module as a JS module. It provides the method `show(message, duration)` which
takes the following parameters:

  * _message_ A string with the text to toast
  * _duration_ The duration of the toast—either `ToastAndroid.SHORT` or `ToastAndroid.LONG`

You can alternatively use `showWithGravity(message, duration, gravity)` to
specify where the toast appears in the screen's layout. May be
`ToastAndroid.TOP`, `ToastAndroid.BOTTOM` or `ToastAndroid.CENTER`.

The `showWithGravityAndOffset(message, duration, gravity, xOffset, yOffset)`
method adds the ability to specify an offset with in pixels.

> Starting with Android 11 (API level 30), setting the gravity has no effect
> on text toasts. Read about the changes
> [here](https://developer.android.com/about/versions/11/behavior-
> changes-11#text-toast-api-changes).

* * *

# Reference

## Methods​

### `show()`​

tsx

    
    
    static show(message: string, duration: number);  
    

* * *

### `showWithGravity()`​

This property will only work on Android API 29 and below. For similar
functionality on higher Android APIs, consider using snackbar or notification.

tsx

    
    
    static showWithGravity(message: string, duration: number, gravity: number);  
    

* * *

### `showWithGravityAndOffset()`​

This property will only work on Android API 29 and below. For similar
functionality on higher Android APIs, consider using snackbar or notification.

tsx

    
    
    static showWithGravityAndOffset(  
      message: string,  
      duration: number,  
      gravity: number,  
      xOffset: number,  
      yOffset: number,  
    );  
    

## Properties​

### `SHORT`​

Indicates the duration on the screen.

tsx

    
    
    static SHORT: number;  
    

* * *

### `LONG`​

Indicates the duration on the screen.

tsx

    
    
    static LONG: number;  
    

* * *

### `TOP`​

Indicates the position on the screen.

tsx

    
    
    static TOP: number;  
    

* * *

### `BOTTOM`​

Indicates the position on the screen.

tsx

    
    
    static BOTTOM: number;  
    

* * *

### `CENTER`​

Indicates the position on the screen.

tsx

    
    
    static CENTER: number;  
    

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/toastandroid.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/toastandroid.md)

Last updated on **Aug 12, 2025**

[
PreviousPermissionsAndroid](/docs/permissionsandroid)[NextActionSheetIOS](/docs/actionsheetios)

  * Methods
    * `show()`
    * `showWithGravity()`
    * `showWithGravityAndOffset()`
  * Properties
    * `SHORT`
    * `LONG`
    * `TOP`
    * `BOTTOM`
    * `CENTER`

