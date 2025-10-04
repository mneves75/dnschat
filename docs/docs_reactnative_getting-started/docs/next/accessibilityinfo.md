This is unreleased documentation for React Native **Next** version.

For up-to-date documentation, see the **[latest
version](/docs/accessibilityinfo)** (0.81).

Version: Next

On this page

# AccessibilityInfo

Sometimes it's useful to know whether or not the device has a screen reader
that is currently active. The `AccessibilityInfo` API is designed for this
purpose. You can use it to query the current state of the screen reader as
well as to register to be notified when the state of the screen reader
changes.

## Example​

* * *

# Reference

## Methods​

### `addEventListener()`​

tsx

    
    
    static addEventListener(  
      eventName: AccessibilityChangeEventName | AccessibilityAnnouncementEventName,  
      handler: (  
        event: AccessibilityChangeEvent | AccessibilityAnnouncementFinishedEvent,  
      ) => void,  
    ): EmitterSubscription;  
    

Add an event handler. Supported events:

Event name| Description  
---|---  
`accessibilityServiceChanged`  
Android| Fires when some services such as TalkBack, other Android assistive
technologies, and third-party accessibility services are enabled. The argument
to the event handler is a boolean. The boolean is `true` when a some
accessibility services is enabled and `false` otherwise.  
`announcementFinished`  
iOS| Fires when the screen reader has finished making an announcement. The
argument to the event handler is a dictionary with these keys:

  * `announcement`: The string announced by the screen reader.
  * `success`: A boolean indicating whether the announcement was successfully made.

  
`boldTextChanged`  
iOS| Fires when the state of the bold text toggle changes. The argument to the
event handler is a boolean. The boolean is `true` when bold text is enabled
and `false` otherwise.  
`grayscaleChanged`  
iOS| Fires when the state of the gray scale toggle changes. The argument to
the event handler is a boolean. The boolean is `true` when a gray scale is
enabled and `false` otherwise.  
`invertColorsChanged`  
iOS| Fires when the state of the invert colors toggle changes. The argument to
the event handler is a boolean. The boolean is `true` when invert colors is
enabled and `false` otherwise.  
`reduceMotionChanged`| Fires when the state of the reduce motion toggle
changes. The argument to the event handler is a boolean. The boolean is `true`
when a reduce motion is enabled (or when "Transition Animation Scale" in
"Developer options" is "Animation off") and `false` otherwise.  
`reduceTransparencyChanged`  
iOS| Fires when the state of the reduce transparency toggle changes. The
argument to the event handler is a boolean. The boolean is `true` when reduce
transparency is enabled and `false` otherwise.  
`screenReaderChanged`| Fires when the state of the screen reader changes. The
argument to the event handler is a boolean. The boolean is `true` when a
screen reader is enabled and `false` otherwise.  
  
* * *

### `announceForAccessibility()`​

tsx

    
    
    static announceForAccessibility(announcement: string);  
    

Post a string to be announced by the screen reader.

* * *

### `announceForAccessibilityWithOptions()`​

tsx

    
    
    static announceForAccessibilityWithOptions(  
      announcement: string,  
      options: {queue?: boolean},  
    );  
    

Post a string to be announced by the screen reader with modification options.
By default announcements will interrupt any existing speech, but on iOS they
can be queued behind existing speech by setting `queue` to `true` in the
options object.

**Parameters:**

Name| Type| Description  
---|---|---  
announcement Required| string| The string to be announced  
options Required| object| `queue` \- queue the announcement behind existing
speech iOS  
  
* * *

### `getRecommendedTimeoutMillis()`

Android

​

tsx

    
    
    static getRecommendedTimeoutMillis(originalTimeout: number): Promise<number>;  
    

Gets the timeout in millisecond that the user needs. This value is set in
"Time to take action (Accessibility timeout)" of "Accessibility" settings.

**Parameters:**

Name| Type| Description  
---|---|---  
originalTimeout Required| number| The timeout to return if "Accessibility
timeout" is not set. Specify in milliseconds.  
  
* * *

### `isAccessibilityServiceEnabled()`

Android

​

tsx

    
    
    static isAccessibilityServiceEnabled(): Promise<boolean>;  
    

Check whether any accessibility service is enabled. This includes TalkBack but
also any third-party accessibility app that may be installed. To only check
whether TalkBack is enabled, use isScreenReaderEnabled. Returns a promise
which resolves to a boolean. The result is `true` when some accessibility
services is enabled and `false` otherwise.

note

Please use `isScreenReaderEnabled` if you only want to check the status of
TalkBack.

* * *

### `isBoldTextEnabled()`

iOS

​

tsx

    
    
    static isBoldTextEnabled(): Promise<boolean>:  
    

Query whether a bold text is currently enabled. Returns a promise which
resolves to a boolean. The result is `true` when bold text is enabled and
`false` otherwise.

* * *

### `isGrayscaleEnabled()`

iOS

​

tsx

    
    
    static isGrayscaleEnabled(): Promise<boolean>;  
    

Query whether grayscale is currently enabled. Returns a promise which resolves
to a boolean. The result is `true` when grayscale is enabled and `false`
otherwise.

* * *

### `isInvertColorsEnabled()`

iOS

​

tsx

    
    
    static isInvertColorsEnabled(): Promise<boolean>;  
    

Query whether invert colors is currently enabled. Returns a promise which
resolves to a boolean. The result is `true` when invert colors is enabled and
`false` otherwise.

* * *

### `isReduceMotionEnabled()`​

tsx

    
    
    static isReduceMotionEnabled(): Promise<boolean>;  
    

Query whether reduce motion is currently enabled. Returns a promise which
resolves to a boolean. The result is `true` when reduce motion is enabled and
`false` otherwise.

* * *

### `isReduceTransparencyEnabled()`

iOS

​

tsx

    
    
    static isReduceTransparencyEnabled(): Promise<boolean>;  
    

Query whether reduce transparency is currently enabled. Returns a promise
which resolves to a boolean. The result is `true` when a reduce transparency
is enabled and `false` otherwise.

* * *

### `isScreenReaderEnabled()`​

tsx

    
    
    static isScreenReaderEnabled(): Promise<boolean>;  
    

Query whether a screen reader is currently enabled. Returns a promise which
resolves to a boolean. The result is `true` when a screen reader is enabled
and `false` otherwise.

* * *

### `prefersCrossFadeTransitions()`

iOS

​

tsx

    
    
    static prefersCrossFadeTransitions(): Promise<boolean>;  
    

Query whether reduce motion and prefer cross-fade transitions settings are
currently enabled. Returns a promise which resolves to a boolean. The result
is `true` when prefer cross-fade transitions is enabled and `false` otherwise.

* * *

### `setAccessibilityFocus()`​

tsx

    
    
    static setAccessibilityFocus(reactTag: number);  
    

Set accessibility focus to a React component.

On Android, this calls `UIManager.sendAccessibilityEvent` method with passed
`reactTag` and `UIManager.AccessibilityEventTypes.typeViewFocused` arguments.

note

Make sure that any `View` you want to receive the accessibility focus has
`accessible={true}`.

[Edit this page](https://github.com/facebook/react-native-
website/edit/main/docs/accessibilityinfo.md)

Last updated on **Sep 2, 2025**

[ NextAlert](/docs/next/alert)

  * Example
  * Methods
    * `addEventListener()`
    * `announceForAccessibility()`
    * `announceForAccessibilityWithOptions()`
    * `getRecommendedTimeoutMillis()` Android
    * `isAccessibilityServiceEnabled()` Android
    * `isBoldTextEnabled()` iOS
    * `isGrayscaleEnabled()` iOS
    * `isInvertColorsEnabled()` iOS
    * `isReduceMotionEnabled()`
    * `isReduceTransparencyEnabled()` iOS
    * `isScreenReaderEnabled()`
    * `prefersCrossFadeTransitions()` iOS
    * `setAccessibilityFocus()`

