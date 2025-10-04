# Native Platform

Your application may need access to platform features that aren’t directly
available from react-native or one of the hundreds of [third-party
libraries](https://reactnative.directory/) maintained by the community. Maybe
you want to reuse some existing Objective-C, Swift, Java, Kotlin or C++ code
from the JavaScript runtime. Whatever your reason, React Native exposes a
powerful set of API to connect your native code to your JavaScript application
code.

This guide introduces:

  * **Native Modules:** native libraries that have no User Interface (UI) for the user. Examples would be persistent storage, notifications, network events. These are accessible to your user as JavaScript functions and objects.
  * **Native Component:** native platform views, widgets and controllers that are available to your application's JavaScript code through React Components.

note

You might have previously been familiar with:

  * [Legacy Native Modules](/docs/legacy/native-modules-intro);
  * [Legacy Native Components](/docs/legacy/native-components-android);

These are our deprecated native module and component API. You can still use
many of these legacy libraries with the New Architecture thanks to our interop
layers. You should consider:

  * using alternative libraries,
  * upgrading to newer library versions that have first-class support for the New Architecture, or
  * port these libraries yourself to Turbo Native Modules or Fabric Native Components.

  1. Native Modules
     * [Android & iOS](/docs/turbo-native-modules-introduction)
     * [Cross-Platform with C++](/docs/the-new-architecture/pure-cxx-modules)
     * [Advanced: Custom C++ Types](/docs/the-new-architecture/custom-cxx-types)
  2. Fabric Native Components
     * [Android & iOS](/docs/fabric-native-components-introduction)

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/native-platforms.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/native-platforms.md)

Last updated on **Aug 12, 2025**

[ PreviousThe Codegen CLI](/docs/the-new-architecture/codegen-cli)[NextAndroid
and iOS](/docs/turbo-native-modules-introduction)

