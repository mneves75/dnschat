# Expo Modules API: Overview

[Edit](https://github.com/expo/expo/edit/main/docs/pages/modules/overview.mdx)

Copy

An overview of the APIs and utilities provided by Expo to develop native
modules.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/modules/overview.mdx)

Copy

* * *

## What is the Expo Modules API

The Expo Modules API allows you to write Swift and Kotlin to add new
capabilities to your app with native modules and views. The API is designed to
take advantage of modern language features, to be as consistent as possible on
both platforms, to require minimal boilerplate, and provide comparable
performance characteristics to React Native's Turbo Modules API. Expo Modules
all support the New Architecture and are automatically backwards compatible
with existing React Native apps using the old architecture.

We believe that using the Expo Modules API makes building and maintaining
nearly all kinds of React Native modules about as easy as it can be, and we
think that the Expo Modules API is the best choice for the vast majority of
developers building native modules for their apps.

### Common questions

Do I need to know the Expo Modules API to build an Expo / React Native app?

Most of the time, Expo and React Native developers don't need to write any
native code — libraries are already available for a wide range of use cases,
from camera to video to maps to haptics and much more.

But sometimes, nothing does exactly what you need. Maybe you want to integrate
an analytics service that your company mandates but that doesn't yet have a
React Native library yet, so you need to build a module around their SDK. Or
maybe you want to access a system feature that your app requires, but isn't
commonly used, so nobody maintains a library for it.

When should I use Turbo Modules and when should I use the Expo Modules API?

To summarize and paraphrase the [recommendation from the React Native
team](https://github.com/react-native-community/discussions-and-
proposals/blob/main/proposals/0759-react-native-frameworks.md#what-do-we-
recommend-to-react-native-library-developers):

  * If you intend to use C++ in your native module, use Turbo Modules since it provides easier access to lower-level mechanisms.
  * If you are looking for a better developer experience and you are willing to depend on the `expo` package in your module, then use the Expo Modules API.

Where can I find open source Expo Modules to learn from?

The [Expo SDK](https://github.com/expo/expo/tree/main/packages) is a great
place to look if you want to learn how we have implemented our libraries.
Another great resource is open source apps, such as
[Bluesky](https://github.com/bluesky-social/social-app/tree/main/modules).

The following libraries are some of our favorites from the community:

  * [`react-native-widget-extension`](https://github.com/bndkt/react-native-widget-extension)
  * [`burnt`](https://github.com/nandorojo/burnt)
  * [`expo-video-metadata`](https://github.com/hirbod/expo-video-metadata)
  * [`swiftui-react-native`](https://github.com/andrew-levy/swiftui-react-native)
  * [`react-native-ios-context-menu`](https://github.com/dominicstop/react-native-ios-context-menu)
  * [`react-native-mlkit`](https://github.com/infinitered/react-native-mlkit)
  * [`react-native-passkeys`](https://github.com/peterferguson/react-native-passkeys)
  * [`expo-drag-drop-content-view`](https://github.com/AlirezaHadjar/expo-drag-drop-content-view)

What impact does using the Expo Modules API have on my app size?

Adding the Expo Modules API to your app has a negligible impact on your app
size, it may increase the size by a few hundred kilobytes. [Learn more in this
blog post](https://blog.expo.dev/embracing-expo-modules-in-your-react-native-
projects-cd8ed4cbec3).

What impact does using the Expo Modules API have on my app's performance?

The Expo Modules API has similar performance characteristics to React Native's
Turbo Modules API. Both APIs leverage React Native's JavaScript Interface
(JSI), rather than the legacy approach of using a JSON message queue
("bridge") ([learn more about JSI](https://reactnative.dev/docs/the-new-
architecture/landing-page#fast-javascriptnative-interfacing)).

Neither Expo Modules nor Turbo Modules are designed to be as fast as
technically possible, but rather they are fast where it matters. For example,
the Expo Modules API could leverage code generation and the new native Swift /
C++ interop to reduce the overhead of individual method calls. However, this
imposes some developer experience challenges and overhead, and we have not yet
encountered any use cases where such an optimization would provide any
meaningful real-world performance improvements. In reality, the time spent
executing the body of a native method is often orders of magnitude greater
than the overhead of the method invocation. Both Expo Modules and Turbo
Modules can easily execute hundreds of thousands of native method calls per
second, which is well over what you are likely to find in any app, and the
overhead of the method calls is unlikely to be the bottleneck.

If you encounter any performance bottlenecks with the Expo Modules API, [file
an issue](https://github.com/expo/expo/issues/new/choose) and we'd be happy to
discuss it with you.

Does the Expo Modules API support platforms other than Android, iOS, and web?

The Expo Modules API has experimental support for macOS and tvOS. See
[Additional platform support](/modules/additional-platform-support) tutorial
for more information.

How can I use the Expo Modules API to make a third-party SDK available to my
Expo app?

Learn more about this in the [Integrate an existing
library](/modules/existing-library) tutorial.

## Next steps

[Tutorial: Creating a native moduleA tutorial on creating a native module that
persists settings with Expo Modules API.](/modules/native-module-tutorial)
[Tutorial: Creating a native viewA tutorial on creating a native view that
renders a WebView with Expo Modules API.](/modules/native-view-tutorial) [Expo
Modules API: ReferenceA reference on creating native modules using Kotlin and
Swfit.](/modules/module-api) [Expo Modules API: Design considerationsAn
overview of the design considerations behind the Expo Modules
API.](/modules/design) [expo-module.config.jsonA reference of available
configuration options.](/modules/module-config)

