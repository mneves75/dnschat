On this page

# Platform

## Example​

* * *

# Reference

## Properties​

### `constants`​

tsx

    
    
    static constants: PlatformConstants;  
    

Returns an object which contains all available common and specific constants
related to the platform.

**Properties:**

Name| Type| Optional| Description  
---|---|---|---  
isTesting| boolean| No|  
reactNativeVersion| object| No| Information about React Native version. Keys
are `major`, `minor`, `patch` with optional `prerelease` and values are
`number`s.  
Version Android| number| No| OS version constant specific to Android.  
Release Android| string| No|  
Serial Android| string| No| Hardware serial number of an Android device.  
Fingerprint Android| string| No| A string that uniquely identifies the build.  
Model Android| string| No| The end-user-visible name for the Android device.  
Brand Android| string| No| The consumer-visible brand with which the
product/hardware will be associated.  
Manufacturer Android| string| No| The manufacturer of the Android device.  
ServerHost Android| string| Yes|  
uiMode Android| string| No| Possible values are: `'car'`, `'desk'`,
`'normal'`,`'tv'`, `'watch'` and `'unknown'`. Read more about [Android
ModeType](https://developer.android.com/reference/android/app/UiModeManager.html).  
forceTouchAvailable iOS| boolean| No| Indicate the availability of 3D Touch on
a device.  
interfaceIdiom iOS| string| No| The interface type for the device. Read more
about
[UIUserInterfaceIdiom](https://developer.apple.com/documentation/uikit/uiuserinterfaceidiom).  
osVersion iOS| string| No| OS version constant specific to iOS.  
systemName iOS| string| No| OS name constant specific to iOS.  
  
* * *

### `isPad`

iOS

​

tsx

    
    
    static isPad: boolean;  
    

Returns a boolean which defines if device is an iPad.

Type  
---  
boolean  
  
* * *

### `isTV`​

tsx

    
    
    static isTV: boolean;  
    

Returns a boolean which defines if device is a TV.

Type  
---  
boolean  
  
* * *

### `isVision`​

tsx

    
    
    static isVision: boolean;  
    

Returns a boolean which defines if device is an Apple Vision. _If you are
using[Apple Vision Pro (Designed for
iPad)](https://developer.apple.com/documentation/visionos/checking-whether-
your-app-is-compatible-with-visionos) `isVision` will be `false` but `isPad`
will be `true`_

Type  
---  
boolean  
  
* * *

### `isTesting`​

tsx

    
    
    static isTesting: boolean;  
    

Returns a boolean which defines if application is running in Developer Mode
with testing flag set.

Type  
---  
boolean  
  
* * *

### `OS`​

tsx

    
    
    static OS: 'android' | 'ios';  
    

Returns string value representing the current OS.

Type  
---  
enum(`'android'`, `'ios'`)  
  
* * *

### `Version`​

tsx

    
    
    static Version: 'number' | 'string';  
    

Returns the version of the OS.

Type  
---  
number Android

* * *

string iOS  
  
## Methods​

### `select()`​

tsx

    
    
    static select(config: Record<string, T>): T;  
    

Returns the most fitting value for the platform you are currently running on.

#### Parameters:​

Name| Type| Required| Description  
---|---|---|---  
config| object| Yes| See config description below.  
  
Select method returns the most fitting value for the platform you are
currently running on. That is, if you're running on a phone, `android` and
`ios` keys will take preference. If those are not specified, `native` key will
be used and then the `default` key.

The `config` parameter is an object with the following keys:

  * `android` (any)
  * `ios` (any)
  * `native` (any)
  * `default` (any)

**Example usage:**

tsx

    
    
    import {Platform, StyleSheet} from 'react-native';  
      
    const styles = StyleSheet.create({  
      container: {  
        flex: 1,  
        ...Platform.select({  
          android: {  
            backgroundColor: 'green',  
          },  
          ios: {  
            backgroundColor: 'red',  
          },  
          default: {  
            // other platforms, web for example  
            backgroundColor: 'blue',  
          },  
        }),  
      },  
    });  
    

This will result in a container having `flex: 1` on all platforms, a green
background color on Android, a red background color on iOS, and a blue
background color on other platforms.

Since the value of the corresponding platform key can be of type `any`,
[`select`](/docs/platform#select) method can also be used to return platform-
specific components, like below:

tsx

    
    
    const Component = Platform.select({  
      ios: () => require('ComponentIOS'),  
      android: () => require('ComponentAndroid'),  
    })();  
      
    <Component />;  
    

tsx

    
    
    const Component = Platform.select({  
      native: () => require('ComponentForNative'),  
      default: () => require('ComponentForWeb'),  
    })();  
      
    <Component />;  
    

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/platform.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/platform.md)

Last updated on **Aug 20, 2025**

[
PreviousPixelRatio](/docs/pixelratio)[NextPlatformColor](/docs/platformcolor)

  * Example
  * Properties
    * `constants`
    * `isPad` iOS
    * `isTV`
    * `isVision`
    * `isTesting`
    * `OS`
    * `Version`
  * Methods
    * `select()`

