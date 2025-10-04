On this page

# AppState

`AppState` can tell you if the app is in the foreground or background, and
notify you when the state changes.

AppState is frequently used to determine the intent and proper behavior when
handling push notifications.

### App States​

  * `active` \- The app is running in the foreground
  * `background` \- The app is running in the background. The user is either:
    * in another app
    * on the home screen
    * [Android] on another `Activity` (even if it was launched by your app)
  * [iOS] `inactive` \- This is a state that occurs when transitioning between foreground & background, and during periods of inactivity such as entering the multitasking view, opening the Notification Center or in the event of an incoming call.

For more information, see [Apple's
documentation](https://developer.apple.com/documentation/uikit/app_and_scenes/managing_your_app_s_life_cycle)

## Basic Usage​

To see the current state, you can check `AppState.currentState`, which will be
kept up-to-date. However, `currentState` will be null at launch while
`AppState` retrieves it over the bridge.

This example will only ever appear to say "Current state is: active" because
the app is only visible to the user when in the `active` state, and the null
state will happen only momentarily. If you want to experiment with the code we
recommend to use your own device instead of embedded preview.

* * *

# Reference

## Events​

### `change`​

This event is received when the app state has changed. The listener is called
with one of [the current app state values](/docs/appstate#app-states).

### `memoryWarning`​

This event is used in the need of throwing memory warning or releasing it.

### `focus`

Android

​

Received when the app gains focus (the user is interacting with the app).

### `blur`

Android

​

Received when the user is not actively interacting with the app. Useful in
situations when the user pulls down the [notification
drawer](https://developer.android.com/guide/topics/ui/notifiers/notifications#bar-
and-drawer). `AppState` won't change but the `blur` event will get fired.

## Methods​

### `addEventListener()`​

tsx

    
    
    static addEventListener(  
      type: AppStateEvent,  
      listener: (state: AppStateStatus) => void,  
    ): NativeEventSubscription;  
    

Sets up a function that will be called whenever the specified event type on
AppState occurs. Valid values for `eventType` are listed above. Returns the
`EventSubscription`.

## Properties​

### `currentState`​

tsx

    
    
    static currentState: AppStateStatus;  
    

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/appstate.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/appstate.md)

Last updated on **Aug 20, 2025**

[ PreviousAppRegistry](/docs/appregistry)[NextDevSettings](/docs/devsettings)

  * App States
  * Basic Usage
  * Events
    * `change`
    * `memoryWarning`
    * `focus` Android
    * `blur` Android
  * Methods
    * `addEventListener()`
  * Properties
    * `currentState`

