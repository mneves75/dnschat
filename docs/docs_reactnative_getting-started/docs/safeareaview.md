On this page

# SafeAreaView

> **Deprecated.** Use [react-native-safe-area-
> context](https://github.com/AppAndFlow/react-native-safe-area-context)
> instead.

The purpose of `SafeAreaView` is to render content within the safe area
boundaries of a device. It is currently only applicable to iOS devices with
iOS version 11 or later.

`SafeAreaView` renders nested content and automatically applies padding to
reflect the portion of the view that is not covered by navigation bars, tab
bars, toolbars, and other ancestor views. Moreover, and most importantly, Safe
Area's paddings reflect the physical limitation of the screen, such as rounded
corners or camera notches (i.e. the sensor housing area on iPhone 13).

## Example​

To use, wrap your top level view with a `SafeAreaView` with a `flex: 1` style
applied to it. You may also want to use a background color that matches your
application's design.

* * *

# Reference

## Props​

### [View Props](/docs/view#props)​

Inherits [View Props](/docs/view#props).

> As padding is used to implement the behavior of the component, padding rules
> in styles applied to a `SafeAreaView` will be ignored and can cause
> different results depending on the platform. See
> [#22211](https://github.com/facebook/react-native/issues/22211) for details.

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/safeareaview.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/safeareaview.md)

Last updated on **Aug 12, 2025**

[ PreviousInputAccessoryView](/docs/inputaccessoryview)[NextImage Style
Props](/docs/image-style-props)

  * Example
  * Props
    * View Props

