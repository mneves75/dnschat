On this page

# I18nManager

The `I18nManager` module provides utilities for managing Right-to-Left (RTL)
layout support for languages like Arabic, Hebrew, and others. It provides
methods to control RTL behavior and check the current layout direction.

## Examples​

### Change positions and animations based on RTL​

If you absolutely position elements to align with other flexbox elements, they
may not align in RTL languages. Using `isRTL` can be used to adjust alignment
or animations.

### During Development​

# Reference

## Properties​

### `isRTL`​

typescript

    
    
    static isRTL: boolean;  
    

A boolean value indicating whether the app is currently in RTL layout mode.

The value of `isRTL` is determined by the following logic:

  * If `forceRTL` is `true`, `isRTL` returns `true`
  * If `allowRTL` is `false`, `isRTL` returns `false`
  * Otherwise, `isRTL` will be `true` given the following:
    * **iOS:**
      * The user-preferred language on the device is an RTL language
      * The application-defined localizations include the user-chosen language (as defined in the Xcode project file (`knownRegions = (...)`)
    * **Android:**
      * The user-preferred language on the device is an RTL language
      * The application's `AndroidManifest.xml` defines `android:supportsRTL="true"` on the `<application>` element

### `doLeftAndRightSwapInRTL`​

typescript

    
    
    static doLeftAndRightSwapInRTL: boolean;  
    

A boolean value indicating whether left and right style properties should be
automatically swapped when in RTL mode. When enabled, left becomes right and
right becomes left in RTL layouts.

## Methods​

### `allowRTL()`​

typescript

    
    
    static allowRTL: (allowRTL: boolean) => void;  
    

Enables or disables RTL layout support for the application.

**Parameters:**

  * `allowRTL` (boolean): Whether to allow RTL layout

**Important Notes:**

  * Changes take effect on the next application start, not immediately
  * This setting is persisted across app restarts

### `forceRTL()`​

typescript

    
    
    static forceRTL: (forced: boolean) => void;  
    

Forces the app to use RTL layout regardless of the device language settings.
This is primarily useful for testing RTL layouts during development.

Avoid forcing RTL in production apps as it requires a full app restart to take
effect, which makes for a poor user-experience.

**Parameters:**

  * `forced` (boolean): Whether to force RTL layout

**Important Notes:**

  * Changes take full effect on the next application start, not immediately
  * The setting is persisted across app restarts
  * Only meant for development and testing. In production, you should either disallow RTL fully or handle it appropriately (see `isRTL`)

### `swapLeftAndRightInRTL()`​

typescript

    
    
    static swapLeftAndRightInRTL: (swapLeftAndRight: boolean) => void;  
    

Swap left and right style properties in RTL mode. When enabled, left becomes
right and right becomes left in RTL layouts. Does not affect the value of
`isRTL`.

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/i18nmanager.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/i18nmanager.md)

Last updated on **Aug 12, 2025**

[ PreviousEasing](/docs/easing)[Next🗑️
InteractionManager](/docs/interactionmanager)

  * Examples
    * Change positions and animations based on RTL
    * During Development
  * Properties
    * `isRTL`
    * `doLeftAndRightSwapInRTL`
  * Methods
    * `allowRTL()`
    * `forceRTL()`
    * `swapLeftAndRightInRTL()`

