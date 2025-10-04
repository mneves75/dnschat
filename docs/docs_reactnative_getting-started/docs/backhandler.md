On this page

# BackHandler

The Backhandler API detects hardware button presses for back navigation, lets
you register event listeners for the system's back action, and lets you
control how your application responds. It is Android-only.

The event subscriptions are called in reverse order (i.e. the last registered
subscription is called first).

  * **If one subscription returns true,** then subscriptions registered earlier will not be called.
  * **If no subscription returns true or none are registered,** it programmatically invokes the default back button functionality to exit the app.

> **Warning for modal users:** If your app shows an opened `Modal`,
> `BackHandler` will not publish any events ([see `Modal`
> docs](/docs/modal#onrequestclose)).

## Pattern​

tsx

    
    
    const subscription = BackHandler.addEventListener(  
      'hardwareBackPress',  
      function () {  
        /**  
         * this.onMainScreen and this.goBack are just examples,  
         * you need to use your own implementation here.  
         *  
         * Typically you would use the navigator here to go to the last state.  
         */  
      
        if (!this.onMainScreen()) {  
          this.goBack();  
          /**  
           * When true is returned the event will not be bubbled up  
           * & no other back action will execute  
           */  
          return true;  
        }  
        /**  
         * Returning false will let the event to bubble up & let other event listeners  
         * or the system's default back action to be executed.  
         */  
        return false;  
      },  
    );  
      
    // Unsubscribe the listener on unmount  
    subscription.remove();  
    

## Example​

The following example implements a scenario where you confirm if the user
wants to exit the app:

`BackHandler.addEventListener` creates an event listener & returns a
`NativeEventSubscription` object which should be cleared using
`NativeEventSubscription.remove` method.

## Usage with React Navigation​

If you are using React Navigation to navigate across different screens, you
can follow their guide on [Custom Android back button
behaviour](https://reactnavigation.org/docs/custom-android-back-button-
handling/)

## Backhandler hook​

[React Native Hooks](https://github.com/react-native-
community/hooks#usebackhandler) has a nice `useBackHandler` hook which will
simplify the process of setting up event listeners.

* * *

# Reference

## Methods​

### `addEventListener()`​

tsx

    
    
    static addEventListener(  
      eventName: BackPressEventName,  
      handler: () => boolean | null | undefined,  
    ): NativeEventSubscription;  
    

* * *

### `exitApp()`​

tsx

    
    
    static exitApp();  
    

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/backhandler.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/backhandler.md)

Last updated on **Aug 12, 2025**

[
PrevioususeWindowDimensions](/docs/usewindowdimensions)[NextPermissionsAndroid](/docs/permissionsandroid)

  * Pattern
  * Example
  * Usage with React Navigation
  * Backhandler hook
  * Methods
    * `addEventListener()`
    * `exitApp()`

