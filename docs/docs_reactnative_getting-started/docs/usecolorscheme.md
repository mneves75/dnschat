On this page

# useColorScheme

tsx

    
    
    import {useColorScheme} from 'react-native';  
    

The `useColorScheme` React hook provides and subscribes to color scheme
updates from the [`Appearance`](/docs/appearance) module. The return value
indicates the current user preferred color scheme. The value may be updated
later, either through direct user action (e.g. theme selection in device
settings) or on a schedule (e.g. light and dark themes that follow the
day/night cycle).

### Supported color schemes​

  * `"light"`: The user prefers a light color theme.
  * `"dark"`: The user prefers a dark color theme.
  * `null`: The user has not indicated a preferred color theme.

* * *

## Example​

You can find a complete example that demonstrates the use of this hook
alongside a React context to add support for light and dark themes to your
application in [`AppearanceExample.js`](https://github.com/facebook/react-
native/blob/main/packages/rn-
tester/js/examples/Appearance/AppearanceExample.js).

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/usecolorscheme.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/usecolorscheme.md)

Last updated on **Aug 12, 2025**

[
PreviousVibration](/docs/vibration)[NextuseWindowDimensions](/docs/usewindowdimensions)

  * Supported color schemes
  * Example

