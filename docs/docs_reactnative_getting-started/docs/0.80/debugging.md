This is documentation for React Native **0.80** , which is no longer in active
development.

For up-to-date documentation, see the **[latest version](/docs/debugging)**
(0.81).

Version: 0.80

On this page

# Debugging Basics

note

Debugging features, such as the Dev Menu, LogBox, and React Native DevTools
are disabled in release (production) builds.

## Opening the Dev Menu​

React Native provides an in-app developer menu providing access to debugging
features. You can access the Dev Menu by shaking your device or via keyboard
shortcuts:

  * iOS Simulator: `Ctrl` \+ `Cmd ⌘` \+ `Z` (or Device > Shake)
  * Android emulators: `Cmd ⌘` \+ `M` (macOS) or `Ctrl` \+ `M` (Windows and Linux)

Alternative (Android): `adb shell input keyevent 82`.

![The React Native Dev Menu](/assets/images/debugging-dev-
menu-076-0057c62ed9b02b1447966892b11ee39a.jpg)

## Opening DevTools​

[React Native DevTools](/docs/0.80/react-native-devtools) is our built-in
debugger for React Native. It allows you to inspect and understand how your
JavaScript code is running, similar to a web browser.

To open DevTools, either:

  * Select "Open DevTools" in the Dev Menu.
  * Press `j` from the CLI (`npx react-native start`).

On first launch, DevTools will open to a welcome panel, along with an open
console drawer where you can view logs and interact with the JavaScript
runtime. From the top of the window, you can navigate to other panels,
including the integrated React Components Inspector and Profiler.

![React Native DevTools opened to the &quot;Welcome&quot;
pane](/assets/images/debugging-rndt-
welcome-a39d3cb18d674007d6b044ae7362abcb.jpg)

React Native DevTools is powered by a dedicated debugging architecture built
into React Native and uses a customized build of the [Chrome
DevTools](https://developer.chrome.com/docs/devtools) frontend. This enables
us to offer familiar, browser-aligned debugging features that are deeply
integrated and built for end-to-end reliability.

Learn more in our [React Native DevTools guide](/docs/0.80/react-native-
devtools).

note

React Native DevTools is only available with the Hermes engine, and requires
either Google Chrome or Microsoft Edge installed.

info

#### Flipper and alternative debugging tools​

React Native DevTools replaces the previous Flipper, Experimental Debugger,
and Hermes debugger (Chrome) frontends. If you are on an older version of
React Native, please go to the docs [for your version](/versions).

For apps using JavaScriptCore instead of Hermes, Direct JSC Debugging is still
available (see [Other Debugging Methods](/docs/0.80/other-debugging-methods)).

React Native DevTools is designed for debugging React app concerns, and not to
replace native tools. If you want to inspect React Native’s underlying
platform layers (for example, while developing a Native Module), please use
the debugging tools available in Xcode and Android Studio (see [Debugging
Native Code](/docs/next/debugging-native-code)).

Other useful links:

  * [Why you don’t need Flipper in your React Native app … and how to get by without it ↗](https://shift.infinite.red/why-you-dont-need-flipper-in-your-react-native-app-and-how-to-get-by-without-it-3af461955109)

## LogBox​

LogBox is an in-app tool that displays when warnings or errors are logged by
your app.

![A LogBox warning and an expanded LogBox syntax
error](/assets/images/debugging-
logbox-076-0191f48c03cc7b550d749c4f100fab47.jpg)

### Fatal Errors​

When an unrecoverable error occurs, such as a JavaScript syntax error, LogBox
will open with the location of the error. In this state, LogBox is not
dismissable since your code cannot be executed. LogBox will automatically
dismiss once the syntax error is fixed — either via Fast Refresh or after a
manual reload.

### Console Errors and Warnings​

Console errors and warnings are displayed as on-screen notifications with a
red or yellow badge.

  * **Errors** will display with a notification count. Tap the notification to see an expanded view and to paginate through other logs.
  * **Warnings** will display a notification banner without details, prompting you to open React Native DevTools.

When React Native DevTools is open, all errors except fatal errors will be
hidden to LogBox. We recommend using the Console panel within React Native
DevTools as a source of truth, due to various LogBox options which can hide or
adjust the level of certain logs.

**💡 Ignoring logs**

LogBox can be configured via the `LogBox` API.

js

    
    
    import {LogBox} from 'react-native';  
    

#### Ignore all logs​

LogBox notifications can be disabled using `LogBox.ignoreAllLogs()`. This can
be useful in situations such as giving product demos.

js

    
    
    LogBox.ignoreAllLogs();  
    

#### Ignore specific logs​

Notifications can be disabled on a per-log basis via `LogBox.ignoreLogs()`.
This can be useful for noisy warnings or those that cannot be fixed, e.g. in a
third-party dependency.

js

    
    
    LogBox.ignoreLogs([  
      // Exact message  
      'Warning: componentWillReceiveProps has been renamed',  
      
      // Substring or regex match  
      /GraphQL error: .*/,  
    ]);  
    

note

LogBox will treat certain errors from React as warnings, which will mean they
don't display as an in-app error notification. Advanced users can change this
behaviour by customising LogBox's warning filter using
[`LogBoxData.setWarningFilter()`](https://github.com/facebook/react-
native/blob/d334f4d77eea538dff87fdcf2ebc090246cfdbb0/packages/react-
native/Libraries/LogBox/Data/LogBoxData.js#L338).

## Performance Monitor​

On Android and iOS, an in-app performance overlay can be toggled during
development by selecting **"Perf Monitor"** in the Dev Menu. Learn more about
this feature [here](/docs/performance).

![The Performance Monitor overlay on iOS and
Android](/assets/images/debugging-performance-
monitor-3e0023c343ba59b5f62e563a4aa2741a.jpg)

info

The Performance Monitor runs in-app and is a guide. We recommend investigating
the native tooling under Android Studio and Xcode for accurate performance
measurements.

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/debugging.md)[Edit page for 0.80
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.80/debugging.md)

Last updated on **Jun 17, 2025**

[ PreviousAccessibility](/docs/0.80/accessibility)[NextReact Native
DevTools](/docs/0.80/react-native-devtools)

  * Opening the Dev Menu
  * Opening DevTools
  * LogBox
    * Fatal Errors
    * Console Errors and Warnings
  * Performance Monitor

