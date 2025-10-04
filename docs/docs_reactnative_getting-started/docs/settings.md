On this page

# Settings

`Settings` serves as a wrapper for
[`NSUserDefaults`](https://developer.apple.com/documentation/foundation/nsuserdefaults),
a persistent key-value store available only on iOS.

## Example​

* * *

# Reference

## Methods​

### `clearWatch()`​

tsx

    
    
    static clearWatch(watchId: number);  
    

`watchId` is the number returned by `watchKeys()` when the subscription was
originally configured.

* * *

### `get()`​

tsx

    
    
    static get(key: string): any;  
    

Get the current value for a given `key` in `NSUserDefaults`.

* * *

### `set()`​

tsx

    
    
    static set(settings: Record<string, any>);  
    

Set one or more values in `NSUserDefaults`.

* * *

### `watchKeys()`​

tsx

    
    
    static watchKeys(keys: string | array<string>, callback: () => void): number;  
    

Subscribe to be notified when the value for any of the keys specified by the
`keys` parameter has been changed in `NSUserDefaults`. Returns a `watchId`
number that may be used with `clearWatch()` to unsubscribe.

> **Note:** `watchKeys()` by design ignores internal `set()` calls and fires
> callback only on changes preformed outside of React Native code.

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/settings.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/settings.md)

Last updated on **Aug 12, 2025**

[ PreviousDynamicColorIOS](/docs/dynamiccolorios)

  * Example
  * Methods
    * `clearWatch()`
    * `get()`
    * `set()`
    * `watchKeys()`

