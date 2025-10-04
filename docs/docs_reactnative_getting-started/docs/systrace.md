On this page

# Systrace

`Systrace` is a standard Android marker-based profiling tool (and is installed
when you install the Android platform-tools package). Profiled code blocks are
surrounded by start/end markers which are then visualized in a colorful chart
format. Both the Android SDK and React Native framework provide standard
markers that you can visualize.

## Example​

`Systrace` allows you to mark JavaScript (JS) events with a tag and an integer
value. Capture the non-Timed JS events in EasyProfiler.

* * *

# Reference

## Methods​

### `isEnabled()`​

tsx

    
    
    static isEnabled(): boolean;  
    

* * *

### `beginEvent()`​

tsx

    
    
    static beginEvent(eventName: string | (() => string), args?: EventArgs);  
    

beginEvent/endEvent for starting and then ending a profile within the same
call stack frame.

* * *

### `endEvent()`​

tsx

    
    
    static endEvent(args?: EventArgs);  
    

* * *

### `beginAsyncEvent()`​

tsx

    
    
    static beginAsyncEvent(  
      eventName: string | (() => string),  
      args?: EventArgs,  
    ): number;  
    

beginAsyncEvent/endAsyncEvent for starting and then ending a profile where the
end can either occur on another thread or out of the current stack frame, eg
await the returned cookie variable should be used as input into the
endAsyncEvent call to end the profile.

* * *

### `endAsyncEvent()`​

tsx

    
    
    static endAsyncEvent(  
      eventName: EventName,  
      cookie: number,  
      args?: EventArgs,  
    );  
    

* * *

### `counterEvent()`​

tsx

    
    
    static counterEvent(eventName: string | (() => string), value: number);  
    

Register the value to the profileName on the systrace timeline.

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/systrace.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/systrace.md)

Last updated on **Aug 12, 2025**

[ PreviousStyleSheet](/docs/stylesheet)[NextTransforms](/docs/transforms)

  * Example
  * Methods
    * `isEnabled()`
    * `beginEvent()`
    * `endEvent()`
    * `beginAsyncEvent()`
    * `endAsyncEvent()`
    * `counterEvent()`

