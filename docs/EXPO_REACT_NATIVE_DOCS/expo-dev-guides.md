<!--
Downloaded via https://llm.codes by @steipete on September 30, 2025 at 03:03 PM
Source URL: https://docs.expo.dev/guides/
Total pages processed: 44
URLs filtered: No
Content de-duplicated: Yes
Availability strings filtered: Yes
Code blocks only: No
-->

# https://docs.expo.dev/guides/local-app-development/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Local app development

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/local-app-development.mdx)

Copy

Learn how to compile and build your Expo app locally.

* * *

To build your project into an app locally using your machine, you have to manually generate native code before testing the debug build or creating a production build for it to submit to the app store. There are two ways you can build your app locally. This guide provides a brief introduction to both methods and references to other guides that are necessary to create this workflow.

## Prerequisites

You need to install and set up Android Studio and Xcode to compile and run Android and iOS projects on your local machine. See the following on how to set up these tools:

- [Android Studio](https://docs.expo.dev/get-started/set-up-your-environment?platform=android&device=physical&mode=development-build&buildEnv=local#set-up-an-android-device-with-a-development-build)
- [Xcode](https://docs.expo.dev/get-started/set-up-your-environment?platform=ios&device=physical&mode=development-build&buildEnv=local#set-up-an-ios-device-with-a-development-build)

## Local app compilation

To build your project locally you can use compile commands from Expo CLI which generates the android and ios directories:

Terminal

`# Build native Android project`

`- ` `npx expo run:android`

`# Build native iOS project`

`- ` `npx expo run:ios`

The above commands compile your project, using your locally installed Android SDK or Xcode, into a debug build of your app.

- These compilation commands initially run `npx expo prebuild` to generate native directories (android and ios) before building, if they do not exist yet. If they already exist, this will be skipped.
- You can also add the `--device` flag to select a device to run the app on — you can select a physically connected device or emulator/simulator.
- You can pass in `--variant release` (Android) or `--configuration Release` (iOS) to build a [production build of your app](https://docs.expo.dev/deploy/build-project#production-builds-locally). Note that these builds are not signed and you cannot submit them to app stores. To sign your production build, see [Local app production](https://docs.expo.dev/guides/local-app-production).

To modify your project's configuration or native code after the first build, you will have to rebuild your project. Running `npx expo prebuild` again layers the changes on top of existing files. It may also produce different results after the build.

To avoid this, the native directories are automatically added to the project's .gitignore when you create a new project, and you can use `npx expo prebuild --clean` command. This ensures that the project is always managed, and the [`--clean` flag](https://docs.expo.dev/workflow/prebuild#clean) will delete existing directories before regenerating them. You can use [app config](https://docs.expo.dev/workflow/configuration) or create a [config plugin](https://docs.expo.dev/config-plugins/introduction) to modify your project's configuration or code inside the native directories.

To learn more about how compilation and prebuild works, see the following guides:

[Compiling with Expo CLI\\
\\
Learn how Expo CLI uses `run` commands to compile your app locally, arguments you can pass to the CLI and more.](https://docs.expo.dev/more/expo-cli#compiling) [Prebuild\\
\\
Learn how Expo CLI generates native code of your project before compiling it.](https://docs.expo.dev/workflow/prebuild)

## Local builds with `expo-dev-client`

If you install [`expo-dev-client`](https://docs.expo.dev/develop/development-builds/introduction#what-is-expo-dev-client) to your project, then a debug build of your project will include the `expo-dev-client` UI and tooling, and we call these development builds.

`- ` `npx expo install expo-dev-client`

To create a development build, you can use [local app compilation](https://docs.expo.dev/guides/local-app-development#local-app-compilation) commands ( `npx expo run:[android|ios]`) which will create a debug build and start the development server.

If you have a custom Android project with multiple product flavors using different application IDs, you can configure `npx expo run:android` to use the correct flavor and build type. Expo supports both `--variant` and `--app-id` to customize the build and launch behavior.

The `--variant` flag can switch the Android build type from debug to release. This flag can also configure a product flavor and build type, when formatted in camelCase. For example, if you have both [free and paid product flavors](https://developer.android.com/build/build-variants#change-app-id), you can build a development version of your app with:

`- ` `npx expo run:android --variant freeDebug`

`- ` `npx expo run:android --variant paidDebug`

The `--app-id` flag can be used to launch the app after building using a customized application id. For example, if your product flavor free is using `applicationIdSuffix ".free"` or `applicationId "dev.expo.myapp.free"` you can run build and launch the app with:

## Local builds with EAS

[Run builds on your infrastructure\\
\\
Learn how to run EAS Build on your custom infrastructure or locally on your machine with the `--local` flag.](https://docs.expo.dev/build-reference/local-builds)

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/overview/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Guides: Overview

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/overview.mdx)

Copy

* * *

This section contains information about the development with Expo and Expo Application Services (EAS):

### Development process

Learn about the process of [building an app with Expo](https://docs.expo.dev/workflow/overview) to help understand the mental model of the core development loop. This section also dives into additional configurations and workflows you may require during the development process to help you develop, deploy, and maintain your app. It contains in-depth information about [app config](https://docs.expo.dev/workflow/configuration), [permissions](https://docs.expo.dev/guides/permissions), [universal links](https://docs.expo.dev/linking/into-your-app), [custom native code](https://docs.expo.dev/workflow/continuous-native-generation), [web](https://docs.expo.dev/workflow/web), and more.

### Expo Router

Learn about using different navigation functionalities from the [Expo Router](https://docs.expo.dev/router/basics/layout#root-layout) library. It also covers a comprehensive [Hooks API](https://docs.expo.dev/router/reference/hooks) that the library provides and other aspects of navigation such as [Authentication](https://docs.expo.dev/router/reference/authentication), [Redirects](https://docs.expo.dev/router/reference/redirects), [Testing](https://docs.expo.dev/router/reference/testing), and more.

### Expo Modules API

Learn how to add and use native modules in your app using [Expo Modules API](https://docs.expo.dev/modules/overview).

### Tutorials

If you're looking for step-by-step tutorials for Expo and EAS, see the [Tutorial section](https://docs.expo.dev/tutorial/overview) which includes comprehensive tutorials for both [building apps with Expo](https://docs.expo.dev/tutorial/introduction) and [using EAS services](https://docs.expo.dev/tutorial/eas/introduction).

### Other content

Apart from the essentials listed above, there are plenty of other features to explore such as [Push notifications](https://docs.expo.dev/push-notifications/overview). We also have a collection of guides in the Assorted and third-party Integrations sections.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-analytics/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# React Native analytics SDKs and libraries

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-analytics.mdx)

Copy

An overview of analytics services available in the Expo and React Native ecosystem.

* * *

An analytics service allows you to track how users interact with your app. With this data, you can take a measured approach when improving your app.

[Google Firebase Analytics\\
\\
Learn how to integrate React Native Firebase Analytics in your project.](https://rnfirebase.io/analytics/usage) [Segment\\
\\
Learn how to integrate Segment Analytics SDK in your project.](https://segment.com/docs/connections/sources/catalog/libraries/mobile/react-native/) [Amplitude\\
\\
Learn how to integrate Amplitude Analytics SDK in your project.](https://www.docs.developers.amplitude.com/data/sdks/typescript-react-native/) [AWS Amplify\\
\\
Learn how to integrate AWS Amplify Analytics in your project.](https://docs.amplify.aws/lib/analytics/getting-started/q/platform/react-native/) [Vexo\\
\\
Learn how to integrate Vexo Analytics in your project.](https://docs.vexo.co/) [Aptabase\\
\\
Learn how to integrate Aptabase Analytics in your project. Works with Expo Go.](https://aptabase.com/for-react-native) [Astrolytics\\
\\
Learn how to integrate Astrolytics in your project. Works with Expo Go.](https://www.astrolytics.io/react-native) [PostHog\\
\\
Learn how to integrate PostHog in your project. Works with Expo Go.](https://posthog.com/docs/libraries/react-native)

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/testing-rsc/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Testing React Server Components

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/testing-rsc.mdx)

Copy

Learn about writing unit tests for React Server Components in Expo.

Android

iOS

Web

React Server Components (RSC) is a new feature in React that allows you to build components that render on the server and can be hydrated on the client. This guide provides details on how to write unit tests for RSC in your project.

## Jest testing

React Server Components run on Node.js. This means Jest on its own can closely emulate the server-side rendering environment, in contrast with client-based tests that require a Jest preset to communicate between Node.js and a web browser.

### Setup

While standard server rendering is web-only, Expo's universal RSC bundles custom server renderers for each platform. This means platform-specific file extensions are supported. For example, when writing Server Components for an iOS app, platform-specific extensions such as \*.ios.js and \*.native.ts will be resolved.

`jest-expo` provides a couple different presets for testing Server Components:

| Runner | Description |
| --- | --- |
| `jest-expo/rsc/android` | An Android-only runner for RSC. Uses \*.android.js, \*.native.js, and \*.js files. |
| `jest-expo/rsc/ios` | An iOS-only runner for RSC. Uses \*.ios.js, \*.native.js, and \*.js files. |
| `jest-expo/rsc/web` | A web-only runner for RSC. Uses \*.web.js and \*.js files. |
| `jest-expo/rsc` | A multi-runner that combines the above runners. |

To configure Jest for RSC, create a jest-rsc.config.js file in your project's root:

jest-rsc.config.js

```text-2xs text-default

Then, you can add a script such as `test:rsc` to your package.json:

package.json

### Writing tests

Tests should be written in a \_\_rsc\_tests\_\_ directory to prevent Jest from running your client tests on the server.

\_\_rsc\_tests\_\_/my-component.test.ts

Any code you import in your test files will run in the server environment. You can import server-only modules like `react-server` and `server-only`. This is useful for determining if a library is compatible with RSC.

### Custom expect matchers

`jest-expo` for RSC adds a couple of custom matchers to Jest's `expect`:

- `toMatchFlight`: Render a JSX element using a pseudo-implementation of the render in Expo CLI and compare to a flight string.
- `toMatchFlightSnapshot`: Same as `toMatchFlight` but saves the flight string to a snapshot file.

Behind the scenes, these methods handle a part of the framework operation needed to render RSC. The component's render stream is buffered to a string and compared all at once. You can alternatively stream it manually to observe the rendering progress.

If a component fails to render, the matcher will throw an error to fail the test. In practice, the server renderer will generate an `E:` line, which will sent to the client to be thrown locally for the user.

### Running tests

You can run your tests with the `test:rsc` script:

Terminal

`- ` `yarn test:rsc --watch`

If you're using the multi-runner, you can select a specific project using the `--selectProjects` flag. The following example only runs the web platform:

`- ` `yarn test:rsc --watch --selectProjects rsc/web`

### Environments

In an RSC bundling environment, you can import files like

## Tips

Use the `server-only` and `client-only` modules to assert that a module should not be imported on the client or server:

my-module.js

RSC supports package exports by default. You can use the `react-server` condition to change what file is imported from a module:

When bundling for RSC, all modules are bundled in React Server mode and you can opt out with the `"use client"` directive. When `"use client"` is found, the module becomes an async reference to the client module.

`"use server"` is not the opposite of `"use client"`. It is instead used to define a React Server Functions file.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/icons/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Expo Vector Icons

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/icons.mdx)

Copy

Learn how to use various types of icons in your Expo app, including react native vector icons, custom icon fonts, icon images, and icon buttons.

* * *

Not every app needs to use emojis for icons. You can use a popular icon set through an icon font such as FontAwesome, Glyphicons, or Ionicons, or choose PNGs from [The Noun Project](https://thenounproject.com/). This guide explains various ways to use icons in your Expo app.

## `@expo/vector-icons`

The `@expo/vector-icons` library is installed by default on the template project using `npx create-expo-app` and is part of the `expo` package. It is built on top of [`react-native-vector-icons`](https://github.com/oblador/react-native-vector-icons) and uses a similar API. It includes popular icon sets you can browse at [icons.expo.fyi](https://icons.expo.fyi/).

The component loads the `Ionicons` font and renders a checkmark icon in the following example:

Vector icons

Open in Snack

```text-2xs text-default

## Custom icon fonts

To use a custom icon font, first import it into your project. Only after the font has loaded, can you create an Icon set. [Learn more about loading custom fonts](https://docs.expo.dev/develop/user-interface/fonts#handle-expovector-icons-initial-load).

`@expo/vector-icons` exposes three methods to help you create an icon set:

### `createIconSet`

The `createIconSet` method returns a custom font based on the `glyphMap` where the key is the icon name and the value is either a UTF-8 character or its character code.

In the example below, the `glyphMap` object is defined and then passed as the first argument to the `createIconSet` method. The second argument `fontFamily` is the name of the font (not the filename). Optionally, you can pass the third argument for Android support, which is the custom font file name.

createIconSet example

### `createIconSetFromIcoMoon`

The `createIconSetFromIcoMoon` method is used to create a custom font based on an [IcoMoon](https://icomoon.io/) config file. You have to save the selection.json and .ttf in your project, preferably in the assets directory, and then load the font using either `useFonts` hook or `Font.loadAsync` method from `expo-font`.

See the example below that uses the `useFonts` hook to load the font:

Icomoon Icons

### `createIconSetFromFontello`

The `createIconSetFromFontello` method is used to create a custom font based on a [Fontello](http://fontello.com/) config file. You have to save the config.json and .ttf somewhere convenient in your project, preferably in the assets directory, and then load the font using either `useFonts` hook or `Font.loadAsync` method from `expo-font`.

It follows a similar configuration as `createIconSetFromIcoMoon` as shown in the example:

Fontello Icons

## Button component

You can create an Icon Button using the `Font.Button` syntax where the `Font` is the icon set that you import from `@expo/vector-icons`.

In the example below, a login button uses the `FontAwesome` icon set. Notice that the `FontAwesome.Button` component accepts props to handle action when a button is pressed and can wrap the text of the button.

Icon Button Component

### Properties

Any [`Text`](http://reactnative.dev/docs/text), [`TouchableHighlight`](http://reactnative.dev/docs/touchablehighlight), or [`TouchableWithoutFeedback`](http://reactnative.dev/docs/touchablewithoutfeedback) property in addition to these:

| Prop | Description | Default |
| --- | --- | --- |
| `color` | Text and icon color, use `iconStyle` or nest a `Text` component if you need different colors. | `white` |
| `size` | Icon size. | `20` |
| `iconStyle` | Styles applied to the icon only, good for setting margins or a different color. _Note: use `iconStyle` for margins or expect unstable behaviour._ | `{marginRight: 10}` |
| `backgroundColor` | Background color of the button. | `#007AFF` |
| `borderRadius` | Border radius of the button, set to `0` to disable. | `5` |
| `onPress` | A function called when the button is pressed. | _None_ |

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-feature-flags/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# React Native feature flag services

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-feature-flags.mdx)

Copy

An overview of feature flag services available in the Expo and React Native ecosystem.

* * *

A feature flag (also known as a _feature gate_) is a mechanism that enables and disables features remotely. They are a safe way to rollout new features to your app users without deploying additional code. You can use them for testing in production, A/B testing, or to ship new app features such as UI elements.

## Feature flag services

The following libraries provide robust support for feature flag functionality and out-of-the-box compatibility with Expo apps using [Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/continuous-native-generation) and [config plugins](https://docs.expo.dev/config-plugins/introduction) for seamless integration in your app.

### Posthog

[PostHog](https://posthog.com/) is an open-source product analytics platform that provides comprehensive feature flagging capabilities alongside analytics, session recordings, and A/B testing. It supports real-time feature toggles with user segmentation and the ability to roll back features instantly, making it an excellent choice for teams that want analytics and feature management in a single platform. It includes built-in A/B testing and multivariate testing functionality, allowing you to run experiments directly through feature flags while collecting detailed analytics on feature adoption and performance metrics. The service also supports bootstrap flags to eliminate loading states and improve user experience.

[PostHog React Native library\\
\\
Learn how to integrate PostHog feature flags in your React Native and Expo projects.](https://posthog.com/docs/libraries/react-native#feature-flags) [PostHog feature flags tutorial\\
\\
Follow this step-by-step guide to implement feature flags with PostHog.](https://posthog.com/tutorials/react-native-analytics)

### Statsig

[Statsig](https://statsig.com/) is a feature management platform designed for data-driven product development that provides advanced statistical analysis, gradual rollouts, and sophisticated targeting capabilities with built-in metrics and performance monitoring for feature releases. The platform offers a robust SDK for React Native and Expo, with automatic event logging and dynamic configurations, making it particularly well-suited for teams focused on rigorous experimentation and data-driven decision-making.

[Statsig Expo integration\\
\\
Learn how to integrate StatSig feature flags and experiments in your Expo project.](https://docs.statsig.com/client/javascript-sdk/expo/#basics-check-gate)

### LaunchDarkly

[LaunchDarkly](https://launchdarkly.com/) is an enterprise-grade feature management platform that enables instant feature toggles and targeted rollouts with comprehensive dashboard controls, advanced user targeting, and robust experimentation tools that provide real-time flag updates. The SDK includes advanced features such as hooks for React integration, context identification and modification, comprehensive logging, support for multiple environments in development workflows, private attributes for handling sensitive data, and relay proxy configuration for enhanced security and performance.

[LaunchDarkly React Native SDK\\
\\
Follow this guide to integrate LaunchDarkly feature flags in your React Native and Expo projects.](https://launchdarkly.com/docs/sdk/client-side/react/react-native)

### Firebase Remote Config

[Firebase Remote Config](https://firebase.google.com/docs/remote-config) is a cloud service allows you to change the appearance and functionality of your app without requiring an app update. Remote Config values are managed through the Firebase console and accessed via a JavaScript API, which gives you full control over when and how these values affect your app. The service supports conditional targeting based on user properties, app versions, custom attributes and real-time updates.

[React Native Firebase Remote Config\\
\\
Learn how to integrate Firebase Remote Config from React Native Firebase library in your React Native and Expo projects.](https://rnfirebase.io/remote-config/usage)

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-supabase/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using Supabase

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-supabase.mdx)

Copy

Add a Postgres Database and user authentication to your React Native app with Supabase.

* * *

[Supabase](https://supabase.com/?utm_source=expo&utm_medium=referral&utm_term=expo-react-native) is a Backend-as-a-Service (BaaS) app development platform that provides hosted backend services such as a Postgres database, user authentication, file storage, edge functions, realtime syncing, and a vector and AI toolkit. It's an open-source alternative to Google's Firebase.

Supabase automatically [generates a REST API](https://supabase.com/docs/guides/api?utm_source=expo&utm_medium=referral&utm_term=expo-react-native) from your database and employs a concept called [row level security (RLS)](https://supabase.com/docs/guides/auth/row-level-security?utm_source=expo&utm_medium=referral&utm_term=expo-react-native) to secure your data, making it possible to directly interact with your database from your React Native application without needing to go through a server!

Supabase provides a TypeScript client library called [`supabase-js`](https://supabase.com/docs/reference/javascript/introduction?utm_source=expo&utm_medium=referral&utm_term=expo-react-native) to interact with the REST API. Alternatively, Supabase also exposes a [GraphQL API](https://supabase.com/docs/guides/database/extensions/pg_graphql?utm_source=expo&utm_medium=referral&utm_term=expo-react-native) allowing you to use your favorite GraphQL client (for example, [Apollo Client](https://supabase.github.io/pg_graphql/usage_with_apollo/)) should you wish to.

## Prerequisites

Head over to [database.new](https://database.new/?utm_source=expo&utm_medium=referral&utm_term=expo-react-native) to create a new Supabase project.

### Get the API Keys

Get the Project URL and `anon` key from the API settings.

1. Go to the [API Settings](https://supabase.com/dashboard/project/_/settings/api) page in the Dashboard.
2. Find your Project `URL`, `anon`, and `service_role` keys on this page.

## Using the Supabase TypeScript SDK

Using [`supabase-js`](https://supabase.com/docs/reference/javascript/introduction?utm_source=expo&utm_medium=referral&utm_term=expo-react-native) is the most convenient way of leveraging the full power of the Supabase stack as it conveniently combines all the different services (database, auth, realtime, storage, edge functions) together.

### Install and initialize the Supabase TypeScript SDK

1

After you have created your [Expo project](https://docs.expo.dev/get-started/create-a-project), install `@supabase/supabase-js` and the required dependencies using the following command:

Terminal

`- ` `npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill`

2

Create a helper file to initialize the Supabase client ( `@supabase/supabase-js`). You need the API URL and the `anon` key copied [earlier](https://docs.expo.dev/guides/using-supabase#get-the-api-keys). These variables are safe to expose in your Expo app since Supabase has [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security?utm_source=expo&utm_medium=referral&utm_term=expo-react-native) enabled in the Database.

utils/supabase.ts

```text-2xs text-default

Now you can `import { supabase } from '/utils/supabase'` throughout your application to leverage the full power of Supabase!

## Next steps

[Build a User Management App\\
\\
Learn how to combine Supabase Auth and Database in this quickstart guide.](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native?utm_source=expo&utm_medium=referral&utm_term=expo-react-native) [Sign in with Apple\\
\\
Supabase Auth supports using Sign in with Apple on the web and in native apps for iOS, macOS, watchOS or tvOS.](https://supabase.com/docs/guides/auth/social-login/auth-apple?platform=react-native&utm_source=expo&utm_medium=referral&utm_term=expo-react-native) [Sign in with Google\\
\\
Supabase Auth supports Sign in with Google on the web, native Android applications, and Chrome extensions.](https://supabase.com/docs/guides/auth/social-login/auth-google?platform=react-native&utm_source=expo&utm_medium=referral&utm_term=expo-react-native) [Deep Linking for OAuth and Magic Links\\
\\
When performing OAuth or sending magic link emails from native mobile applications, learn how to configure deep linking for Android and iOS applications.](https://supabase.com/docs/guides/auth/native-mobile-deep-linking?utm_source=expo&utm_medium=referral&utm_term=expo-react-native) [Offline-first React Native Apps with WatermelonDB\\
\\
Learn how to store your data locally and sync it with Postgres using WatermelonDB.](https://supabase.com/blog/react-native-offline-first-watermelon-db?utm_source=expo&utm_medium=referral&utm_term=expo-react-native) [React Native file upload with Supabase Storage\\
\\
Learn how to implement authentication and file upload in a React Native app.](https://supabase.com/blog/react-native-storage?utm_source=expo&utm_medium=referral&utm_term=expo-react-native)

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/tailwind/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Tailwind CSS

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/tailwind.mdx)

Copy

Learn how to configure and use Tailwind CSS in your Expo project.

[Tailwind CSS](https://tailwindcss.com/) is a utility-first CSS framework and can be used with Metro for web projects. This guide explains how to configure your Expo project to use the framework.

## Prerequisites

The following files will be modified to set the Tailwind CSS configuration:

`app.json`

`package.json`

`global.css`

`index.js`

Ensure that your project is using Metro for web. You can verify this by checking the `web.bundler` field which is set to `metro` in the app.json file.

app.json

```text-2xs text-default

## Configuration

Configure Tailwind CSS in your Expo project according to the [Tailwind PostCSS documentation](https://tailwindcss.com/docs/installation/using-postcss).

v3

v4

1

Install `tailwindcss` and its required peer dependencies. Then, the run initialization command to create tailwind.config.js and post.config.js files in the root of your project.

Terminal

`# Install Tailwind and its peer dependencies`

`- ` `npx expo install tailwindcss@3 postcss autoprefixer --dev`

`# Create a Tailwind config file`

`- ` `npx tailwindcss init -p`

2

Add paths to all of your template files inside tailwind.config.js.

tailwind.config.js

3

Create a global.css file in the root of your project and directives for each of Tailwind's layers:

global.css

4

Import the global.css file in your app/\_layout.tsx (if using Expo Router) or index.js file:

app/\_layout.tsx

index.js

5

You now start your project and use Tailwind CSS classes in your components.

`- ` `npx expo start`

Install `tailwindcss` and its required peer dependencies:

`- ` `npx expo install tailwindcss @tailwindcss/postcss postcss --dev`

Add Tailwind to your PostCSS configuration

postcss.config.mjs

Create a global CSS file that imports Tailwind CSS.

You can choose any name for this file. Using global.css is common practice.

Import your CSS file in your app/\_layout.tsx (if using Expo Router) or index.js file:

## Usage

You can use Tailwind with React DOM elements as-is:

app/index.tsx

You can use the `{ $$css: true }` syntax to use Tailwind with React Native web elements:

## Tailwind for Android and iOS

Tailwind does not support Android and iOS platforms. You can use a compatibility library such as [NativeWind](https://www.nativewind.dev/) for universal support.

## Alternative for Android and iOS

Alternatively, you can use [DOM components](https://docs.expo.dev/guides/dom-components) to render your Tailwind web code in a `WebView` on native.

## Troubleshooting

If you have a custom `config.cacheStores` in your metro.config.js, you need to extend the Expo superclass of `FileStore`:

metro.config.js

Ensure you don't have CSS disabled in your metro.config.js:

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/prebuilt-expo-modules/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Prebuilt Expo Modules for Android

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/prebuilt-expo-modules.mdx)

Copy

Learn how prebuilt Expo Modules reduce Android build times by up to 25% on your machine.

* * *

When building React Native apps, longer build times can slow down your development workflow and reduce productivity. Each time you make changes to your code, you might need to wait for the build process to complete, which can add up to significant delays.

Starting from SDK 53, Expo introduces prebuilt Expo Modules for Android to address this pain point. Instead of compiling Expo Modules source code from scratch during each build, your project can now use pre-compiled versions of these modules. Ultimately, this results in faster build times.

## Benefits

- Faster local development: Up to 25% reduction in Android build times on local machines
- Improved developer experience: Less waiting time during development iterations
- Automatic optimization: Works out of the box with new projects for SDK 53 and above

## How prebuilt Expo Modules for Android work

During your project's Android build process, look for the `[📦]` emoji prefix next to package names in the build output. This indicates that those packages are using prebuilt versions rather than being compiled from source.

For example, after creating a project with SDK 53's default template, and running the `npx expo run:android` command, you will notice the `[📦 package-name` prefix next to packages that are precompiled:\
\

\
## Configuration\
\
For SDK 53 and above, no configuration steps are required for projects that are created with one of the available [Expo templates](https://docs.expo.dev/more/create-expo#--template).\
\
### Opting out of prebuilt Expo Modules\
\
You can opt out of prebuilt modules. This might be required when you are modifying the module source code yourself. In this scenario, you can configure the Expo Autolinking configuration by adding `buildFromSource` to the package.json file:\
\
package.json\
\
Copy\
\
```text-2xs text-default\
\
```\
\
### Selectively opt out\
\
You can also opt out of specific modules while keeping others prebuilt by specifying individual package names instead of the wildcard `".*"`:\
\
package.json\
\
Copy\
\
```text-2xs text-default\
\
```\
\
## Considerations\
\
- Existing projects can benefit from this feature when upgrading to SDK 53 and above\
- Performance improvements may vary based on your hardware configuration\
- Current improvements on EAS Builds are more modest but provide groundwork for future caching mechanisms\
\
reCAPTCHA\
\
Recaptcha requires verification.\
\
[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)\
\
protected by **reCAPTCHA**\
\
[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

---

# https://docs.expo.dev/guides/new-architecture/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# React Native's New Architecture

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/new-architecture.mdx)

Copy

Learn about React Native's "New Architecture" and how and why to migrate to it.

The New Architecture is a name that we use to describe a complete refactoring of the internals of React Native. It is also used to solve limitations of the original React Native architecture discovered over years of usage in production at Meta and other companies.

In this guide, we'll talk about how to use the New Architecture in Expo projects today.

[New Architecture is here\\
\\
A blog post from the React Native team at Meta that gives an overview of the features of the New Architecture and the motivations behind building it.](https://reactnative.dev/blog/2024/10/23/the-new-architecture-is-here)

Why migrate to the New Architecture? [Permalink](https://docs.expo.dev/guides/new-architecture/#why-migrate-to-the-new-architecture)

The New Architecture is the future of React Native — yet, for many apps, there may not be many immediate benefits to migrating today. You may want to think of migrating to the New Architecture as an investment in the future of your app, rather than as a way to immediately improve your app.

That said, new React and React Native features are coming to the New Architecture only. For example, the New Architecture includes [full support for Suspense](https://reactnative.dev/blog/2024/10/23/the-new-architecture-is-here#full-support-for-suspense) and [new styling capabilities](https://reactnative.dev/blog/2025/01/21/version-0.77#new-css-features-for-better-layouts-sizing-and-blending) are not implemented in the legacy architecture. Libraries such as [@shopify/flash-list](https://github.com/Shopify/flash-list) and [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) will be shipping new major versions that take full advantage of new features to deliver better performance than was possible before, and will drop support for the legacy architecture.

The legacy architecture will not be around forever — it's possible that the legacy architecture will be removed from React Native in a late 2025 release. When it is removed, you will not be able to upgrade React Native or the Expo SDK without migrating to the New Architecture.

## Expo tools and the New Architecture

As of SDK 53, all `expo-*` packages in the [Expo SDK](https://docs.expo.dev/versions/latest) support the New Architecture (including [bridgeless](https://github.com/reactwg/react-native-new-architecture/discussions/154)). [Learn more about known issues](https://docs.expo.dev/guides/new-architecture#known-issues-in-expo-sdk-libraries).

Additionally, all modules written using the [Expo Modules API](https://docs.expo.dev/modules/overview) support the New Architecture by default! So if you have built your own native modules using this API, no additional work is needed to use them with the New Architecture.

As of April 2025, approximately 75% of SDK 52+ projects built with [EAS Build](https://docs.expo.dev/build/introduction) use the New Architecture.

## Third-party libraries and the New Architecture

The compatibility status of many of the most popular libraries is tracked on [React Native Directory](https://reactnative.directory/) ( [learn more about known issues in third-party libraries](https://docs.expo.dev/guides/new-architecture#known-issues-in-third-party-libraries)). We've built tooling into Expo Doctor to integrate with React Native Directory to help you validate your dependencies, so you can quickly learn which libraries are unmaintained and which incompatible or untested with the New Architecture.

### Validate your dependencies with React Native Directory

Run `npx expo-doctor` to check your dependencies against the data in React Native Directory.

Terminal

`- ` `npx expo-doctor@latest`

You can configure the React Native Directory check in your package.json file. For example, if you would like to exclude a package from validation:

package.json

```text-2xs text-default

See all available options [Permalink](https://docs.expo.dev/guides/new-architecture/#see-all-available-options)

- enabled: If `true`, the check will warn if any packages are missing from React Native Directory. Set this to `false` to disable this behavior. On SDK 52 and above, this is set to `true` by default, otherwise it is `false` by default. You can also override this setting with the `EXPO_DOCTOR_ENABLE_DIRECTORY_CHECK` environment variable (0 is `false`, 1 is `true`).
- exclude: List any packages you want to exclude from the check. Supports exact package names and regex patterns. For example, `["exact-package", "/or-a-regex-.*/"]`.
- listUnknownPackages: By default, the check will warn if any packages are missing from React Native Directory. Set this to false to disable this behavior.

## Initialize a new project with the New Architecture

As of SDK 52, all new projects will be initialized with the New Architecture enabled by default.

`- ` `npx create-expo-app@latest`

## Enable the New Architecture in an existing project

SDK 53 and above

SDK 52

SDK 51 and below

The New Architecture is enabled by default in SDK 53 and above. If you have explicitly disabled it, remove that configuration to enable it.

We recommend upgrading to SDK 53 to ensure that your app can take advantage of all of the latest New Architecture related fixes and improvements with libraries and React Native itself. If you want to try it on SDK 52 first, follow the instructions below.

1

To enable it on both Android and iOS, use the `newArchEnabled` at the root of the `expo` object in your app config. You can selectively enable it for a single platform by setting, for example, `"android": { "newArchEnabled": true }`.

app.json

2

Create a new build:

Android

iOS

`# Run a clean prebuild and start a local build, if you like`

`- ` `npx expo prebuild --clean && npx expo run:android`

`# Run a build with EAS if you prefer`

`- ` `eas build -p android`

`- ` `npx expo prebuild --clean && npx expo run:ios`

`- ` `eas build -p ios`

If the build succeeds, you will now be running your app with the New Architecture! Depending on the native modules you use, your app may work properly immediately.

Now you can tap around your app and test it out. For most non-trivial apps, you're likely to encounter some issues, such as missing native views that haven't been implemented for the New Architecture yet. Many of the issues you encounter are actionable and can be resolved with some configuration or code changes. We recommend reading [Troubleshooting](https://docs.expo.dev/guides/new-architecture#troubleshooting) sections below for more information.

We recommend upgrading to at least SDK 52, preferably SDK 53. It's possible to enable the New Architecture in SDK 51, but you are likely to encounter a variety of issues that have been resolved in more recent releases. To enable it, you need to [install the `expo-build-properties` plugin](https://docs.expo.dev/versions/latest/sdk/build-properties#installation) and set `newArchEnabled` on target platforms.

Are you enabling the New Architecture in a bare React Native app? [Permalink](https://docs.expo.dev/guides/new-architecture/#are-you-enabling-the-new-architecture-in)

If you are using Expo SDK 53 or higher, it will be enabled by default. The following instructions apply to older projects.

- Android: Set `newArchEnabled=true` in the gradle.properties file.
- iOS: If your project has a Podfile.properties.json file (which is created by `npx create-expo-app` or `npx expo prebuild`), you can enable the New Architecture by setting the `newArchEnabled` property to `"true"` in the Podfile.properties.json file. Otherwise, refer to the ["Enable the New Architecture for Apps"](https://github.com/reactwg/react-native-new-architecture/blob/main/docs/enable-apps.md) section of the React Native New Architecture working group.

If you want to opt out of using the New Architecture, set the `newArchEnabled` property to `false` in app config and create a [development build](https://docs.expo.dev/develop/development-builds/introduction).

Are you disabling the New Architecture in a bare React Native app? [Permalink](https://docs.expo.dev/guides/new-architecture/#are-you-disabling-the-new-architecture-in)

- Android: Set `newArchEnabled=false` in the gradle.properties file.
- iOS: If your project has a Podfile.properties.json file (which is created by `npx create-expo-app` or `npx expo prebuild`), you can disable the New Architecture by setting the `newArchEnabled` property to `"false"` in the Podfile.properties.json file. Otherwise, refer to the ["Enable the New Architecture for Apps"](https://github.com/reactwg/react-native-new-architecture/blob/main/docs/enable-apps.md) section of the React Native New Architecture working group.

## Troubleshooting

Meta and Expo are working towards making the New Architecture the default for all new apps and ensuring it is as easy as possible to migrate existing apps. However, the New Architecture isn't just a name — many of the internals of React Native has been re-architected and rebuilt from the ground up. As a result, you may encounter issues when enabling the New Architecture in your app. The following is some advice for troubleshooting these issues.

Can I still try the New Architecture even if some of the libraries I use aren't supported? [Permalink](https://docs.expo.dev/guides/new-architecture/#can-i-still-try-the-new-architecture)

You may be able to try the New Architecture in your app even if some of the libraries you use aren't supported, but it will require temporarily removing those libraries. Create a new branch in your repository and remove any of the libraries that aren't compatible until your app is running. This will give you a good idea of what libraries still need work before you can fully migrate to the New Architecture. We recommend creating issues or pull requests on those libraries' repositories to help them become compatible with the New Architecture. Alternatively, you could switch to other libraries that are compatible with the New Architecture. Refer to [React Native Directory](https://reactnative.directory/) to find compatible libraries.

Known issues in React Native [Permalink](https://docs.expo.dev/guides/new-architecture/#known-issues-in-react-native)

Refer to the [issues labeled with "Type: New Architecture" on the React Native GitHub repository](https://github.com/facebook/react-native/issues?q=is%3Aopen+is%3Aissue+label%3A%22Type%3A+New+Architecture%22).

Known issues in Expo libraries [Permalink](https://docs.expo.dev/guides/new-architecture/#known-issues-in-expo-libraries)

There are no known issues specific to the New Architecture in Expo libraries.

Known issues in third-party libraries [Permalink](https://docs.expo.dev/guides/new-architecture/#known-issues-in-third-party-libraries)

Since React Native 0.74, there are various Interop Layers enabled by default. This allows many libraries built for the old architecture to work on the New Architecture without any changes. However, the interop is not perfect and some libraries will need to be updated. The libraries that are most likely to require updates are those that ship or depend on third-party native code. [Learn more about library support in the New Architecture](https://github.com/reactwg/react-native-new-architecture/discussions/167).

Refer to [React Native Directory](https://reactnative.directory/) a more complete list of libraries and their compatibility with the New Architecture. The following libraries were found to be popular among Expo apps and are known to be incompatible:

The following are known issues with libraries that are popular among Expo apps.

- react-native-maps: Version 1.20.x, which is the default for SDK 53, supports the New Architecture with the interop layer and works well for most features. A New Architecture-first version is available in version 1.21.0, which is still stabilizing. We encourage your to test it in your app, report issues that you find, and [follow along with the discussion on GitHub](https://github.com/react-native-maps/react-native-maps/discussions/5355). We are also investigating another approach that may provider a smoother migration path, by leaning on the [interop layer](https://github.com/reactwg/react-native-new-architecture/discussions/175) rather than rewriting the module. It's worth mentioning that if your app can force a minimum version of iOS 17, or does not need to support maps on iOS, then you can consider using [`expo-maps`](https://docs.expo.dev/versions/latest/sdk/maps) instead.
- @stripe/react-native: The New Architecture is supported starting with version 0.45.0, which is the default for SDK 53.
- @react-native-community/masked-view: Use `@react-native-masked-view/masked-view` instead.
- @react-native-community/clipboard: Use `@react-native-clipboard/clipboard` instead.
- rn-fetch-blob: Use `react-native-blob-util` instead.
- react-native-fs: Use `expo-file-system` or [a fork of react-native-fs](https://github.com/birdofpreyru/react-native-fs) instead.
- react-native-geolocation-service: Use `expo-location` instead.
- react-native-datepicker: Use `react-native-date-picker` or `@react-native-community/datetimepicker` instead.

My build failed after enabling the New Architecture [Permalink](https://docs.expo.dev/guides/new-architecture/#my-build-failed-after-enabling-the-new)

This isn't entirely surprising! Not all libraries are compatible yet, and in some cases compatibility was only recently added and so you will want to ensure you update your libraries to their latest versions. Read the logs to determine which library is incompatible. Also, run `npx expo-doctor@latest` to check your dependencies against the data in React Native Directory.

When you are using the latest version of a library and it is not compatible, report any issues you encounter to the respective GitHub repository. Create a [minimal reproducible example](https://stackoverflow.com/help/minimal-reproducible-example) and report the issue to the library author. If you believe the issue originates in React Native itself, rather than a library, report it to the React Native team (again, with a minimal reproducible example).

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/why-metro/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Why Metro?

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/why-metro.mdx)

Copy

Learn why Metro is the future of universal bundling in React Native and how it benefits developers.

* * *

[Metro](https://metrobundler.dev/) is the official bundler for Expo and React Native. It's a central build tool in the Expo framework. Bundlers comprise thousands of opinions and trade-offs. This document outlines the key reasons why Expo is developed around Metro and how it benefits developers.

## Official Meta bundler

Metro is maintained by Meta, the maintainers of React, React Native, Yoga, and Hermes. It's used for developing some of the world's largest apps, ranging across all categories in the app stores.

Meta engineers actively develop Metro with the express requirement of bundling all their apps, across 400k+ source files, while remaining fast and reliable.

By having first-class Metro support, we ensure Expo developers have continuity across Meta's tools and get instant access to emerging features. This includes:

- React Fast Refresh was [first introduced](https://reactnative.dev/blog/2019/09/18/version-0.61) as a Metro feature in 2019. The React web community adopted it the following year via Webpack.
- Transforming JavaScript to Hermes bytecode for instant native startup.
- React Native DevTools, including first-class support for [network and JS debugging](https://docs.expo.dev/debugging/tools#debugging-with-react-native-devtools), is exclusively available with Metro and Hermes.
- React Compiler was initially rolled out as a Metro-compatible Babel plugin.

New and upcoming features that are planned to come to Metro include:

- Compiling Flow code to native machine code with Static Hermes. Learn more in the [Static Hermes](https://www.youtube.com/watch?v=GUM64b-gAGg) talk by Tzvetan Mikov.
- Data fetching, streaming, React Suspense, server rendering, and build-time static rendering with universal React Server Components for all platforms. Learn more in the [Universal React Server Components](https://www.youtube.com/watch?v=djhEgxQf3Kw) talk at React Conf 2024.

The Expo team collaborates with Meta to develop Metro for Expo Router, adding features like [file-based routing](https://docs.expo.dev/develop/file-based-routing), [web support](https://docs.expo.dev/guides/customizing-metro#web-support), [bundle splitting](https://docs.expo.dev/guides/customizing-metro#bundle-splitting), [tree shaking](https://docs.expo.dev/guides/tree-shaking), [CSS](https://docs.expo.dev/versions/latest/config/metro#css), [DOM components](https://docs.expo.dev/guides/dom-components), server components, and [API routes](https://docs.expo.dev/router/reference/api-routes).

## Battle-tested at scale

Nearly every React Native app in the world uses Metro, making it a battle-tested solution optimized for large-scale projects. This makes it suitable for developers of all sizes, from hobbyists to large companies. Metro is designed specifically to handle large-scale Meta apps, which is why it has features such as native file watching with Watchman and [shared remote caches](https://metrobundler.dev/docs/caching).

## On-demand processing

In development, Metro doesn't perform any platform-specific work until requested. This allows developers to work on large projects without paying a performance cost for the number of platforms they support. In conjunction with aggressive caching and [async routes](https://docs.expo.dev/router/reference/async-routes), developers can incrementally bundle only the parts of the app that they're actively working on.

## Multi-dimensional

Unlike traditional bundlers, which create multiple instances to bundle server and client code, Metro maximizes resource reuse across platforms and environments (server, client, DOM components). This architecture is ideal for multiplatform and server development.

## Reusable transform memoization

Metro is incremental and can create cached transform artifacts that can be used across machines. This enables large teams to reuse work from remote builders, a technique used at Meta for all large projects.

## Optimized for custom runtimes

While other bundlers are designed around the static specification of web browsers, Metro is optimized for the flexibility of React Native. This enables features like generating the specific set of supported language features required for Hermes bytecode compilation which enables faster app startup in production. This will also extend to Static Hermes, which will compile static type information into machine code for native apps.

## Cross-technology support

Expo leverages Metro's technology to create novel functionality like [DOM components](https://docs.expo.dev/guides/dom-components). This allows a React component in a native app to be dynamically bundled as an entire website with all the same defaults as the parent app, on-demand.

## Native asset exports

Unlike traditional bundlers, where the end result is a fully hosted app, Metro's configuration options support exporting bundles to embed as native artifacts in standalone app binaries. This leverages OS-specific optimizations such as `xcassets` on Apple platforms.

## Concurrent processing

All AST transformation in Metro is performed concurrently across all available threads, maximizing the use of hardware.

## Comparison with other approaches

While Metro is designed for universal app development, it's often compared to other web-only bundlers. Here are some key differences:

### Browser ESM versus bundling

While bundlers like Vite leverage built-in ESM support in the browser, this approach can lead to slower practical development times at medium to large scales due to thousands of cascading network requests. Metro performs bundling in local development, which aligns the development results much closer to the production results and is better suited for React Native's larger module count.

### JavaScript versus native languages

Several bundlers are opting to write their core in Rust for performance reasons, but this comes with some trade-offs, such as more challenging contributions, patches, and development. Metro uses a mix of technologies based on the operation:

- The core bundler and utilities are written in JS/Flow.
- File watching is written in C++ via Watchman, with a JS fallback. Watchman is then used across projects on your computer.
- AST is parsed with Hermes parser (WebAssembly) to a Babel-compatible format.
- AST transformation is done with Babel. This maximizes developer customization.
- Minification uses Hermes on native platforms and Terser (with optional ESBuild support) for web.
- CSS parsing and minification is performed with [LightningCSS](https://lightningcss.dev/) (Rust).

This approach aligns with Meta and community tools while allowing easier debugging, profiling, and patching for developers.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-push-notifications-services/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using push notifications

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-push-notifications-services.mdx)

Copy

Learn about push notification services that are compatible with Expo and React Native apps.

* * *

## Expo push notifications

[Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications) provides a unified API for handling push notifications across Android and iOS. It integrates seamlessly with your Expo account and is free to use.

### Key capabilities

- Fully compatible with the [`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications) library
- Includes an EAS dashboard to track notification delivery to FCM and APNs
- Supports testing notifications with the [Expo Notifications Tool](https://expo.dev/notifications)

### Considerations and limitations

- iOS Notification Service Extension for adding additional content to notifications, such as images, is not formally included, but you can add it using a config plugin with custom native code and configuration ( [example](https://github.com/expo/expo/pull/36202)).
- Volumes are limited to 600 notifications per second per project.

For implementation details, see the following guides:

[Expo push notifications overview\\
\\
Learn more about Expo push notifications.](https://docs.expo.dev/push-notifications/overview) [Expo Notifications server-side SDK options\\
\\
Learn more about sending push notifications using a server.](https://docs.expo.dev/push-notifications/sending-notifications#send-push-notifications-using-a-servers)

## OneSignal

[OneSignal](https://onesignal.com/) is a customer engagement platform that provides push notifications, in-app messaging, SMS, and email services for web and mobile apps. OneSignal supports rich media in notifications and engagement analytics. It includes an [Expo config plugin](https://github.com/OneSignal/onesignal-expo-plugin) for direct integration into your Expo project.

[OneSignal Expo SDK Setup\\
\\
Follow this guide for a step-by-step setup on how to integrate OneSignal in your Expo project.](https://documentation.onesignal.com/docs/react-native-expo-sdk-setup)

## Braze

[Braze](https://www.braze.com/) is a customer engagement platform that delivers personalized, cross-channel messaging through push notifications, in-app messaging, email, SMS, and web. Braze supports rich notification content, push notification campaigns, and support for resending notifications after failed deliveries on Android. It provides a [React Native SDK](https://github.com/braze-inc/braze-react-native-sdk) and a [config plugin](https://github.com/braze-inc/braze-expo-plugin/tree/main). Check out the [Expo example app](https://github.com/braze-inc/braze-expo-plugin/tree/main/example) for more details.

[Braze Expo Setup\\
\\
Follow this guide for a step-by-step setup on how to integrate Braze in your Expo project.](https://www.braze.com/docs/developer_guide/platforms/react_native/sdk_integration)

## Customer.io

[Customer.io](http://customer.io/) is a customer engagement platform that allows you to design powerful automated workflows utilizing push notifications, in-app messaging, email, SMS capabilities, and more. Its visual workflow builder allows you to automate complex, data-driven campaigns across multiple channels. Customer.io supports device-side metrics collection that can be used to customize push notifications tailored to user behaviors and preferences. Customer.io provides an [Expo plugin](https://github.com/customerio/customerio-expo-plugin) for direct integration with your Expo project and documentation for using Customer.io push notifications alongside other providers.

[Customer.io Expo Quick Start Guide\\
\\
Follow this guide for a step-by-step setup on how to integrate Customer.io in your Expo project.](https://docs.customer.io/sdk/expo/quick-start-guide/)

## CleverTap

[CleverTap](https://clevertap.com/) is an all-in-one customer engagement platform that helps you deliver personalized, real-time, omnichannel messaging across push notifications, in-app messages, email, and more. It offers advanced segmentation, analytics, and campaign automation — built to scale with your business. The [CleverTap React Native SDK](https://developer.clevertap.com/docs/react-native) and [Expo config plugin](https://github.com/CleverTap/clevertap-expo-plugin) make it easy to integrate CleverTap into your Expo projects. The config plugin handles all the native module setup during the prebuild process, allowing you to configure CleverTap through your app config without having to manually modify native code. For more information, check out the [CleverTap Example Plugin](https://github.com/CleverTap/clevertap-expo-plugin/tree/main/CTExample).

[CleverTap Expo Plugin Docs\\
\\
Follow this guide to set up CleverTap in your Expo or React Native project.](https://developer.clevertap.com/docs/clevertap-expo-plugin)

## Send notifications directly via FCM and APNs

You may choose to send directly to platform push API's from your backend. In this case, you can still use [`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications) to retrieve the native push token and configure notifications separately for each platform.

Although the client-side code remains cross-platform with [`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications), you will need to implement server-side logic to interact with the [FCM](https://firebase.google.com/docs/cloud-messaging) and [APNs](https://developer.apple.com/documentation/usernotifications) APIs individually.

## React Native Firebase messaging

[React Native Firebase](https://rnfirebase.io/) provides a messaging module that lets you use [Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging) as a unified push notification service for both Android and iOS. While FCM is often associated with Android notifications, it also supports iOS by routing messages through Apple Push Notification service (APNs) behind the scenes.

## Tips and important considerations

- Avoid mixing client-side implementations: Different notification services may have conflicting client-side implementations. Use a consistent approach to prevent potential issues.
- Web notifications: Expo notifications do not support web notifications. However, some third-party solutions may offer this capability. Consider your app's requirements when choosing a service.
- Token management: Track both Expo push tokens and native device tokens in your database. This provides flexibility for future integrations, especially with marketing tools that send notifications directly via FCM or APNs.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/local-https-development/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using local HTTPS development

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/local-https-development.mdx)

Copy

Learn how to set up local HTTPS for Expo web apps.

* * *

When developing Expo web apps locally, you may need to use HTTPS with your local development environment for testing secure browser APIs. This guide shows you how to set up local HTTPS for Expo web apps.

## Prerequisites

This guide requires the following tool installed on your machine:

- `mkcert`: A tool for creating development certificates. For installation instructions, see the [`mkcert` GitHub repository](https://github.com/FiloSottile/mkcert#installation).

## Benefits

- Team scalability: Same setup works for everyone
- Authentication support: HTTP-Only Cookies and secure contexts
- Production parity: Match your production HTTPS environment
- Easy sharing: Consistent development URLs across the team

## Set up your project

1

Create or navigate to your Expo project:

Terminal

`# Create a new project (if needed)`

`- ` `npx create-expo-app@latest example-app`

`- ` `cd example-app`

`# Or navigate to existing project`

`- ` `cd your-expo-project`

2

Start your Expo development server:

`- ` `npx expo start --web`

Your app will be running on `http://localhost:8081`. Keep this terminal window open.

3

Use `mkcert` to generate a certificate for localhost. Run the following command in a new terminal window from your project's root directory:

This will generate two signed certificate files: `localhost.pem` (certificate) and `localhost-key.pem` (private key), inside your project's root directory.

4

Inside your project's root directory, run the following command to start the proxy:

This creates a proxy that forwards HTTPS traffic from port 443 to your Expo dev server on port 8081.

5

Open `https://localhost` in your browser to access your app. Your Expo app is now running with HTTPS.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/permissions/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Permissions

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/permissions.mdx)

Copy

Learn about configuring and adding permissions in an app config file.

* * *

When developing a native app that requires access to potentially sensitive information on a user's device, such as their location or contacts, the app must request the user's permission first. For example, to access the user's media library, the app will need to run [`MediaLibrary.requestPermissionsAsync()`](https://docs.expo.dev/versions/latest/sdk/media-library#medialibraryrequestpermissionsasync).

## Android

Permissions are configured with the [`android.permissions`](https://docs.expo.dev/versions/latest/config/app#permissions) and [`android.blockedPermissions`](https://docs.expo.dev/versions/latest/config/app#blockedpermissions) keys in your [app config](https://docs.expo.dev/workflow/configuration).

Most permissions are added automatically by libraries that you use in your app either with [config plugins](https://docs.expo.dev/config-plugins/plugins-and-mods#create-a-plugin) or with a package-level AndroidManifest.xml. You only need to use `android.permissions` to add additional permissions that are not included by default in a library.

app.json

```text-2xs text-default

The only way to remove permissions that are added by package-level AndroidManifest.xml files is to block them with the [`android.blockedPermissions`](https://docs.expo.dev/versions/latest/config/app#blockedpermissions) property. To do this, specify the full permission name. For example, if you want to remove the audio recording permissions added by `expo-av`:

- See [`android.permissions`](https://docs.expo.dev/versions/latest/config/app#permissions) to learn about which permissions are included in the default [prebuild template](https://docs.expo.dev/workflow/prebuild#templates).
- Apps using _dangerous_ or _signature_ permissions without valid reasons may be rejected by Google. Ensure you follow the [Android permissions best practices](https://developer.android.com/training/permissions/usage-notes) when submitting your app.
- [All available Android `Manifest.permissions`](https://developer.android.com/reference/android/Manifest.permission).

Are you using this library in an existing React Native app? [Permalink](https://docs.expo.dev/guides/permissions/#are-you-using-this-library-in-an)

## iOS

Your iOS app can ask for system permissions from the user. For example, to use the device's camera or access photos, Apple requires an explanation for how your app makes use of that data. Most packages will automatically provide a boilerplate reason for a given permission with [config plugins](https://docs.expo.dev/config-plugins/introduction). These default messages will most likely need to be tailored to your specific use case for your app to be accepted by the App Store.

To set permission messages, use the [`ios.infoPlist`](https://docs.expo.dev/versions/latest/config/app#infoplist) key in your [app config](https://docs.expo.dev/workflow/configuration), for example:

Many of these properties are also directly configurable using the [config plugin](https://docs.expo.dev/config-plugins/introduction) properties associated with the library that adds them. For example, with [`expo-media-library`](https://docs.expo.dev/versions/latest/sdk/media-library) you can configure photo permission messages like this:

- Changes to the Info.plist cannot be updated over-the-air, they will only be deployed when you submit a new native binary. For example, with [`eas build`](https://docs.expo.dev/build/introduction).
- Apple's official [permission message recommendations](https://developer.apple.com/design/human-interface-guidelines/privacy#Requesting-permission).
- [All available Info.plist properties](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html).

Are you using this library in an existing React Native app? [Permalink](https://docs.expo.dev/guides/permissions/#are-you-using-this-library-in-an-1)

Add and modify the permission message values in Info.plist file directly. We recommend doing this directly in Xcode for autocompletion.

## Web

On the web, permissions like the `Camera` and `Location` can only be requested from a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts#When_is_a_context_considered_secure). For example, using `https://` or `http://localhost`. This limitation is similar to Android's manifest permissions and iOS's Info.plist usage messages and is enforced to increase privacy.

## Resetting permissions

Often you want to be able to test what happens when a user rejects permissions, to ensure your app reacts gracefully. An operating-system level restriction on both Android and iOS prohibits an app from asking for the same permission more than once (you can imagine how this could be annoying for the user to be repeatedly prompted for permissions after rejecting them). To test different flows involving permissions in development, you may need to uninstall and reinstall the native app.

When testing in [Expo Go](https://expo.dev/go), you can delete the app and reinstall it by running `npx expo start` and pressing `i` or `a` in the [Expo CLI](https://docs.expo.dev/more/expo-cli) Terminal UI.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-bugsnag/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using BugSnag

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-bugsnag.mdx)

Copy

A guide on installing and configuring BugSnag for end-to-end error reporting and analytics.

* * *

[BugSnag](https://www.bugsnag.com/) is a stability monitoring solution that provides rich, end-to-end error reporting and analytics to reproduce and fix errors with speed and precision. BugSnag supports the full stack with open-source libraries for more than [50 platforms](https://www.bugsnag.com/platforms), including [React Native](https://docs.bugsnag.com/platforms/react-native/react-native/).

With BugSnag, developers and engineering organizations can:

- Stabilize: Innovate faster by knowing when to build new features versus fix bugs. Use the release health dashboard, stability scores and targets, and built-in alerts via email, Slack, PagerDuty, and more.
- Prioritize: Improve customer experience by identifying and prioritizing bugs that have the greatest impact on app stability. Analyze issues grouped by root cause and sorted by business impact, customer segmentation, A/B testing and experiment results.
- Fix: Increase productivity by spending less time on reproducing and fixing bugs. Utilize powerful diagnostic data, full stacktraces and automatic breadcrumbs.

## Integration

See the integration guide below for instructions on adding BugSnag to your Expo apps to report JavaScript errors. It also includes instructions for uploading source maps for updates published with [EAS Update](https://docs.expo.dev/eas-update/introduction).

If you're new to BugSnag, you can [create an account](https://app.bugsnag.com/user/new/) or [request a demo](https://www.bugsnag.com/demo-request).

[Expo BugSnag integration\\
\\
See the official guide on how to integrate BugSnag with an Expo app.](https://docs.bugsnag.com/platforms/react-native/expo/)

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/keyboard-handling/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Keyboard handling

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/keyboard-handling.mdx)

Copy

A guide for handling common keyboard interactions on an Android or iOS device.

* * *

Keyboard handling is crucial for creating an excellent user experience in your Expo app. React Native provides [`Keyboard`](https://reactnative.dev/docs/keyboard) and [`KeyboardAvoidingView`](https://reactnative.dev/docs/keyboardavoidingview), which are commonly used to handle keyboard events. For more complex or custom keyboard interactions, you can consider using [`react-native-keyboard-controller`](https://kirillzyusko.github.io/react-native-keyboard-controller), which is a library that offers advanced keyboard handling capabilities.

This guide covers common keyboard interactions and how to manage them effectively.

[![Keyboard Handling tutorial for React Native apps](https://i3.ytimg.com/vi/Y51mDfAhd4E/maxresdefault.jpg)\\
\\
Keyboard Handling tutorial for React Native apps\\
\\
In this keyboard handling tutorial for React Native apps, you'll learn how to solve the problem of the keyboard covering your input when you try to type on your app.](https://www.youtube.com/watch?v=Y51mDfAhd4E)

## Keyboard handling basics

The following sections explain how to handle keyboard interactions with common APIs.

### Keyboard avoiding view

The `KeyboardAvoidingView` is a component that automatically adjusts a view's height, position, or bottom padding based on the keyboard height to remain visible while it is displayed.

Android and iOS interact with the `behavior` property differently. On iOS, `padding` is usually what works best, and for Android, just having the `KeyboardAvoidingView` prevents covering the input. This is why the following example uses `undefined` for Android. Playing around with the `behavior` is a good practice since a different option could work best for your app.

HomeScreen.tsx

```text-2xs text-default

In the above example, the height of the `KeyboardAvoidingView` automatically adjusts based on the device's keyboard height, which ensures that the input is always visible.

When using a Bottom Tab navigator on Android, you might notice that focusing on an input field causes the bottom tabs to be pushed above the keyboard. To address this issue, add the `softwareKeyboardLayoutMode` property to your Android configuration in [app config](https://docs.expo.dev/workflow/configuration) and set it to `pan`.

app.json

After adding this property, restart the development server and reload your app to apply the changes.

It's also possible to hide the bottom tab when the keyboard opens using [`tabBarHideOnKeyboard`](https://reactnavigation.org/docs/bottom-tab-navigator/#tabbarhideonkeyboard). It is an option with the Bottom Tab Navigator. If set to `true`, it will hide the bar when the keyboard opens.

app/\_layout.tsx

### Keyboard events

The `Keyboard` module from React Native allows you to listen for native events, react to them, and make changes to the keyboard, such as dismissing it.

To listen for keyboard events, use the `Keyboard.addListener` method. This method accepts an event name and a callback function as arguments. When the keyboard is shown or hidden, the callback function is called with the event data.

The following example illustrates a use case for adding a keyboard listener. The state variable `isKeyboardVisible` is toggled each time the keyboard shows or hides. Based on this variable, a button allows the user to dismiss the keyboard only if the keyboard is active. Also, notice that the button uses the `Keyboard.dismiss` method.

## Advanced keyboard handling with Keyboard Controller

For more complex keyboard interactions, such as larger scrollable entry forms with several text input fields, consider using the [`react-native-keyboard-controller` (Keyboard Controller)](https://kirillzyusko.github.io/react-native-keyboard-controller) library. It offers additional functionality beyond the built-in React Native keyboard APIs, providing consistency across Android and iOS with minimal configuration and offering the native feel users expect.

### Prerequisites

The following steps are described using a [development build](https://docs.expo.dev/develop/development-builds/introduction) since the Keyboard Controller library is not included in Expo Go. See [Create a development build](https://docs.expo.dev/develop/development-builds/create-a-build) for more information.

[Keyboard Controller](https://kirillzyusko.github.io/react-native-keyboard-controller) also requires `react-native-reanimated` to work correctly. To install it, follow these [installation instructions](https://docs.expo.dev/versions/latest/sdk/reanimated#installation).

### Install

Start by installing the Keyboard Controller library in your Expo project:

Terminal

`- ` `npx expo install react-native-keyboard-controller`

### Set up provider

To finalize the setup, add the `KeyboardProvider` to your app.

### Handling multiple inputs

The [`KeyboardAvoidingView`](https://docs.expo.dev/guides/keyboard-handling#keyboard-avoiding-view) component is excellent for prototyping, but it requires platform-specific configuration and is not very customizable.

As a more powerful alternative, you can use the [`KeyboardAwareScrollView`](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-aware-scroll-view) component. It automatically scrolls to a focused `TextInput` and provides native-like performance. For simple screens with only a few elements, using `KeyboardAwareScrollView` is a great approach.

For screens with multiple inputs, the Keyboard Controller library also provides a `KeyboardToolbar` component to use alongside `KeyboardAwareScrollView`. Together, these components handle input navigation and prevent the keyboard from covering the screen without custom configuration:

FormScreen.tsx

The above example wraps the inputs with `KeyboardAwareScrollView` to prevent the keyboard from covering them. The `KeyboardToolbar` component displays navigation controls and a dismiss button. While it works without configuration, you can customize the toolbar content if needed.

### Animating views in sync with keyboard height

For a more advanced and customizable approach, you can use [`useKeyboardHandler`](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/keyboard/use-keyboard-handler). It provides access to keyboard lifecycle events. It allows us to determine when the keyboard starts animating and its position in every frame of the animation.

Using the `useKeyboardHandler` hook, you can create a custom hook to access the height of the keyboard at each frame. It uses `useSharedValue` from reanimated to return the height, as shown below.

ChatScreen.tsx

You can use the `useGradualAnimation` hook to animate a view and give it a smooth animation when the keyboard is active or dismissed, for example, in a chat screen component (shown in the example below). This component gets the keyboard height from the hook. It then creates an animated style called `fakeView` using the `useAnimatedStyle` hook from reanimated. This style only contains one property: `height`, which is set to the keyboard's height.

The `fakeView` animated style is used in an animated view after the `TextInput`. This view's height will animate based on the keyboard's height at each frame, which effectively pushes the content above the keyboard with a smooth animation. It also decreases its height to zero when the keyboard is dismissed.

## Additional resources

[Example\\
\\
See the source code for the example project on GitHub.](https://github.com/betomoedano/keyboard-guide) [`react-native-keyboard-controller`\\
\\
For more details on the Keyboard Controller library, see the documentation.](https://kirillzyusko.github.io/react-native-keyboard-controller)

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/in-app-purchases/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using in-app purchases

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/in-app-purchases.mdx)

Copy

Learn about how to use in-app purchases in your Expo app.

* * *

## Tutorial

[![Watch: How to Implement In-App Purchases in Expo](https://i3.ytimg.com/vi/R3fLKC-2Qh0/maxresdefault.jpg)\\
\\
Watch: How to Implement In-App Purchases in Expo](https://www.youtube.com/watch?v=R3fLKC-2Qh0)

[Expo In-App Purchase Tutorial\\
\\
The getting started guide for in-app purchases and subscriptions with `react-native-purchases` library and RevenueCat.](https://www.revenuecat.com/blog/engineering/expo-in-app-purchase-tutorial/)

## Libraries

The following libraries provide robust support for in-app purchase functionality and out-of-the-box compatibility with Expo apps using [CNG](https://docs.expo.dev/workflow/continuous-native-generation) and [Config Plugins](https://docs.expo.dev/config-plugins/introduction) for seamless integration in your app.

[`react-native-purchases`\\
\\
An open-source framework that provides a wrapper around Google Play Billing and StoreKit APIs, and integration with RevenueCat services supporting in-app purchases. It enables product management, analytics, and simplified workflows for in-app purchase requirements that may extend beyond your client code, such as validating purchases on an app's backend.](https://github.com/RevenueCat/react-native-purchases) [`expo-iap`\\
\\
A React Native library for in-app purchases that works with development builds.](https://github.com/hyochan/expo-iap)

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-logrocket/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using LogRocket

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-logrocket.mdx)

Copy

A guide on installing and configuring LogRocket for session replays and error monitoring.

* * *

[LogRocket](https://logrocket.com/) records user sessions and identifies bugs as your users use your app. You can filter sessions by update IDs and also connect to your LogRocket account on the EAS dashboard to get quick access to your app's session data.

## Install and configure LogRocket

You can install the LogRocket SDK with the following command:

Terminal

`- ` `npx expo install @logrocket/react-native expo-build-properties`

Then, in your [app config](https://docs.expo.dev/workflow/configuration), include the LogRocket config plugin:

app.json

```text-2xs text-default

Finally, initialize LogRocket in your app in a top-level file, like app/\_layout.tsx:

app/\_layout.tsx

## Connecting LogRocket on the EAS dashboard

You can link your LogRocket account and project to your Expo account and project on Expo's dashboard, so that you can see the last few sessions from your app in the deployments and updates dashboards.

Then, you'll start to see View on LogRocket buttons in the EAS dashboard in the Native Deployments and Updates dashboards, along with the last few sessions from your app.

## Learn more about LogRocket

To learn more about how to use LogRocket with Expo, check out the [LogRocket documentation](https://docs.logrocket.com/reference/react-native-expo-adding-the-sdk).

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/minify/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Minifying JavaScript

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/minify.mdx)

Copy

Learn about customizing the JavaScript minification process in Expo CLI with Metro bundler.

* * *

Minification is an optimization build step. It removes unnecessary characters such as collapses whitespace, removes comments, and shortens static operations, from the source code. This process reduces the final size and improves load times.

## Minification in Expo CLI

In Expo CLI, minification is performed on JavaScript files during the production export (when `npx expo export`, `npx expo export:embed`, `eas build`, and so on, commands run).

For example, consider following code snippet in a project:

Input

```text-2xs text-default

This will be minified by the Expo CLI:

Output

The default minification of Expo CLI is sufficient for most projects. However, you can customize the minifier to optimize for speed or remove additional features like logs.

## Remove console logs

You can remove console logs from your production build. Use the `drop_console` option in the Terser minifier config.

metro.config.js

You can also pass an array of console types to drop if you want to preserve certain logs. For example: `drop_console: ['log', 'info']` will remove `console.log` and `console.info` but preserve `console.warn` and `console.error`.

## Customizing the minifier

Different minifiers have tradeoffs between speed and compression. You can customize the minifier used by Expo CLI by modifying the metro.config.js file in your project.

1

To install Terser in a project, run the command:

Terminal

`- ` `yarn add --dev metro-minify-terser`

2

Set Terser as a minifier with `transformer.minifierPath`, and pass in [`terser` options](https://github.com/terser/terser#compress-options) to `transformer.minifierConfig`.

### Unsafe Terser options

For additional compression that may not work in all JavaScript engines, enable the [`unsafe` `compress` options](https://terser.org/docs/miscellaneous/#the-unsafe-compress-option):

### esbuild

[`esbuild`](https://esbuild.github.io/) is used to minify exponentially faster than `uglify-es` and `terser`. For more information, see [`metro-minify-esbuild`](https://github.com/EvanBacon/metro-minify-esbuild#usage) usage.

### Uglify

For projects SDK 48 and above, you can use [`uglify-es`](https://github.com/mishoo/UglifyJS) by following the steps below:

To install Uglify in a project, run the command:

Set Uglify as a minifier with `transformer.minifierPath`, and pass in [options](https://github.com/mishoo/UglifyJS#compress-options) to `transformer.minifierConfig`.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/editing-richtext/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Edit rich text

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/editing-richtext.mdx)

Copy

Learn about current approaches to preview and edit rich text in React Native.

* * *

However, sometimes you need to be more flexible. Think of long social media posts, note apps, or document editors. Ideally, you need to allow different text styles, lists, headings, embedded images, and more. This is called a rich text editor, and it's a difficult problem to solve everywhere, including in React Native.

There is currently no default solution for that in the React Native ecosystem. However, this guide explores some options and promising approaches, each with its own tradeoffs.

[![Watch: How to implement a Rich Text Editor using DOM components](https://i3.ytimg.com/vi/CxORa1tXMjw/maxresdefault.jpg)\\
\\
Watch: How to implement a Rich Text Editor using DOM components](https://www.youtube.com/watch?v=CxORa1tXMjw)

## Render rich text

There are a lot of good options to display rich text:

- For markdown content, you can use a markdown renderer such as [`react-native-markdown-display`](https://www.npmjs.com/package/react-native-markdown-display) or another.

- For HTML content, you can use [`@expo/html-elements`](https://www.npmjs.com/package/@expo/html-elements) or a webview ( [`react-native-webview`](https://docs.expo.dev/versions/latest/sdk/webview)).

```text-2xs text-default

- You can also use [Expo Modules](https://docs.expo.dev/modules/overview) to write a custom renderer component with native platform primitives using third-party libraries such as [Markwon](https://github.com/noties/Markwon) on Android and `AttributedString` on iOS.

## Approaches to edit rich text

There are a few approaches to get rich text rendering to work. However, all have different limitations.

### Webview-based editors

While most React Native UI components wrap native platform primitives and are fast, performant, and native feeling as a result, the webview-based rich text editors use a different approach.

They wrap an existing rich text editor built for web with JavaScript inside a [`react-native-webview`](https://docs.expo.dev/versions/latest/sdk/webview). It works on all platforms (Android, iOS, Web) and can take advantage of popular rich text editors available for the Web platform, but it has a performance and UX penalty.

You will not be able to use native UI components inside the editor. Any implementation of features like mentions or image embedding will duplicate features and require significant effort to implement.

### Existing webview-based React Native libraries

There are a couple of existing React Native libraries to allow rich-text editing. These are the easiest options to get started if you need a basic rich text editor with limited configuration and don't have strict performance or UX requirements:

- [`react-native-rich-editor`](https://github.com/wxik/react-native-rich-editor)
- [`react-native-cn-quill`](https://github.com/imnapo/react-native-cn-quill)
- [`@10play/tentap-editor`](https://github.com/10play/10Tap-Editor)

### Custom webview-based editor

If you need more configurability, you can build a similar library with an existing web-only editor. However, you have to handle the message passing and web implementation yourself. This gives you all the options that the underlying editor offers and lets you implement more features.

- [Quill](https://quilljs.com/)
- [lexical](https://github.com/facebook/lexical)
- [slate](https://github.com/ianstormtaylor/slate)

You will need to use message passing to pass text and `onChange` events to and from the webview. Since rich texts often end up long, it's better to model it as an uncontrolled component to prevent lag on each keystroke. Also, if you can avoid serializing and sending the entire state on each keystroke that also improves performance.

## Building on top of React Native TextInput

In this section, let's discuss if it is possible to have a feature complete rich text input for general purposes.

Here is a quick example. Let's start by rendering a text input with the following bold text:

Then, let's append a fifth letter `a` to the text input. The position of your cursor should determine if the new letter is a part of the bold string or not. Unfortunately, the callback only returns `aaaaa`.

There is an additional `onSelectionChange` prop that can be used to get that information. However, it makes the task significantly harder. Inserting additional characters (such as newlines for lists or bullet points) also desynchronizes the selection.

There are some attempts to build such an editor, such as [`markdown-editor`](https://github.com/shakogegia/markdown-editor) (not actively maintained) and [`rn-text-editor`](https://github.com/amjadbouhouch/rn-text-editor) (in beta), but no widely used packages exist.

## Markdown editors with visible styling markers

If using a markdown to style text fulfills your requirement, you can render the markdown in a separate, non-editable view while editing. It is not complex to build on your own using any markdown renderer. You can also use a third-party library such as [`react-native-markdown-editor`](https://github.com/kunall17/react-native-markdown-editor).

This editing experience suits power users or programming/tech applications. You can also explore rendering rich text while showing markdown only in the selected chunk of text or other hybrid approaches.

## Native editors

You can use a native Android or iOS rich text editor wrapped into a React Native module. There are a few options:

- [`react-native-aztec`](https://github.com/WordPress/gutenberg/tree/trunk/packages/react-native-aztec)
- [`gutenberg-mobile`](https://github.com/wordpress-mobile/gutenberg-mobile)
- [`react-native-live-markdown`](https://github.com/Expensify/react-native-live-markdown)
- [`react-native-enriched`](https://github.com/software-mansion-labs/react-native-enriched)

There is also an effort to port the lexical editor to Android and iOS and provide a React Native wrapper, [track it here](https://github.com/facebook/lexical/discussions/2410).

## Summary

While there are many great options for showing rich text, there is no one-size-fits-all solution for rich text editing in React Native. There's no popular solution that is sufficient in most use cases. Further contribution from the community is needed to improve existing solutions or add new ones.

For now, you need to carefully choose between a more complex, native editor that offers more features but may be harder to maintain, or an editor built on top of react-native primitives. This depends on how core the feature is to your app, how many features you need in your editor, and how much effort you are willing to spend on building it out.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/server-components/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using React Server Components in Expo Router apps

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/server-components.mdx)

Copy

Learn about rendering React components on the server in Expo.

React Server Components enable a number of exciting capabilities, including:

- Data fetching with async components and React Suspense.
- Working with secrets and server-side APIs.
- Server-side rendering (SSR) for SEO and performance.
- Build-time rendering to remove unused JS code.

Expo Router enables support for [React Server Components](https://react.dev/reference/rsc/server-components) on all platforms. This is an early preview of a feature that will be enabled by default in Expo Router.

## Prerequisites

Your project must use Expo Router and React Native new architecture (default from SDK 52).

## Usage

To use React Server Components in your Expo app, you need to:

1. Install the required RSC dependency `react-server-dom-webpack@19.0.0-rc-6230622a1a-20240610` ( `react-server-dom-webpack@~19.0.0` for SDK 53 and above).
2. Ensure the entry module is `expo-router/entry` (default) in package.json.
3. Enable the flag in the project app config:

app.json

```text-2xs text-default

4. Ensure `"origin": "false"` is not set anywhere in your app config.
5. Create an initial route app/index.tsx:

app/index.tsx (Client Component)

4. Create a Server Function actions/render-info.tsx:

actions/render-info.tsx (Server Function)

## Server Components

Server Components run in the server, meaning they can access server APIs and Node.js built-ins (when running locally). They can also use async components.

Consider the following component which fetches data and renders it:

components/pokemon.tsx

To render this as a server component, you'll need to return it from a Server Function.

### Key points

- You cannot use hooks like `useState`, `useEffect`, or `useContext` in Server Components.
- You cannot use browser or native APIs in Server Components.
- `"use server"` is not meant to mark a file as a server component. It's used to mark a file as having React Server Functions exported from it.
- Server components have access to all environment variables as they run securely off the client.

## Client Components

Since Server Components cannot access native APIs or React Context, you can create a Client Component to use these features. They are created by marking files with the `"use client"` directive at the top.

components/button.tsx

This module can be imported and used in a Server Function or Server Component.

### Key point

You cannot pass functions as props to Server Components. You can only pass serializable data.

## React Server Functions

Server Functions are functions that run on the server and can be called from Client Components. Think of them like fully-typed API routes that are easier to write.

They must always be an async function and are marked with `"use server"` at the top of the function.

app/index.tsx

You can create a Client Component to invoke the Server Function:

Server Functions can also be defined in a standalone file (with `"use server"` at the top) and imported from Client Components:

components/server-actions.tsx

These can be used in a Client Component:

### Key points

- You can only pass serializable data to Server Functions as arguments.
- Server Functions can only return serializable data.
- Server Functions run on the server and are a good place to put logic that should not be exposed to the client.
- Server Functions currently cannot be used inside of DOM components

### Rendering in Server Functions

React Server Functions in Expo Router can render React components on the server and stream back an RSC payload (a custom JSON-like format that's maintained by the React team) for rendering on the client. This is similar to server-side rendering (SSR) on the web.

For example, the following Server Function will render some text:

This Server Function can be invoked from a Client Component and the contents will be streamed guide.

## Metadata

React Server Components are a feature of React 19. To enable them, Expo CLI automatically uses a special canary build of React on all platforms. In the future, it will be removed when React 19 is enabled by default in React Native.

You can use this instead of the `Head` component from `expo-router/head`, but it only works on web for now.

## Request headers

You can access the request headers used to make the request to the Server Component using the `expo-router/rsc/headers` module.

actions/renderHome.tsx

The `unstable_headers` function returns a promise that resolves to a read-only `Headers` object.

### Key points

- This API cannot be used with build-time rendering ( `render: 'static'`) because the headers dynamically change based on the request. In the future, this API will assert if the output mode is `static`.
- `unstable_headers` is server-only and cannot be used on the client.

Enabling full React Server Components support allows you to leverage even more features. In this mode, the default rendering mode for routes is server components instead of client components. It is still in development, as the Router and React Navigation need to be rewritten to support concurrency.

To enable full Server Components mode, you need to enable the `reactServerComponentRoutes` flag in the app config:

With this enabled, all routes will render as Server Components by default. In the future this will reduce server/client waterfalls and enable build-time rendering to provide better offline support.

- There is currently no stack routing. The custom layouts, `Stack`, `Tabs`, and `Drawer`, do not support Server Components yet.
- Most `Link` component props are not supported yet.

Server Components are reloaded on every request in development. This means that you can make changes to your server components and see them reflected immediately in the client runtime. You may want to manually trigger a reload event programmatically to refetch data or re-render the component. This can be done using the `router.reload()` function from the `useRouter` hook.

If the route was rendered at build-time, it will not be re-rendered on the client. This is because the rendering code is not included in the production server.

Expo Router supports two different modes of rendering Server Components: build-time rendering and request-time rendering. These modes can be indicated on a per-route basis by using the `unstable_settings` export:

- `render: 'static'` will render the component at build-time and never re-render it in production. This is similar to how classic static site generators work.
- `render: 'dynamic'` will render the component at request-time and re-render it on every request. This is similar to how server-side rendering works.

If you want client-side rendering, move your data fetching to a Client Component and control the rendering locally.

Routes marked with `static` output will be rendered at build-time and embedded in the native binary. This enables rendering routes without making a server request (because the server request was made when the app was downloaded).

The current default is `dynamic` rendering. In the future, we'll change the caching and optimizations to be smarter and more automatic.

You can generate static pages at build-time with the `generateStaticParams` function. This is useful for components that must only run at build-time and not on the server.

app/shapes/\[shape\].tsx

Expo Router supports importing global CSS and CSS modules in Server Components.

The CSS will be hoisted into the client bundle from the server.

### Web

First, build the web project:

Terminal

`- ` `npx expo export -p web`

Then you can host it locally with `npx expo serve` or deploy it to the cloud:

[Deploy instantly with EAS\\
\\
EAS Hosting is the best way to deploy your Expo API routes and servers.](https://docs.expo.dev/eas/hosting/get-started)

### Native

You can deploy your native React Server Components by following the server deployment guide:

[Deploy native servers to EAS\\
\\
Deploy and link versioned servers to your production native apps.](https://docs.expo.dev/router/reference/api-routes#native-deployment)

- Expo Snack does not support bundling Server Components.
- EAS Update does not work with Server Components yet.
- DOM components cannot use React Server Functions in production yet.
- Production deployment is limited and not recommended yet.
- Server Rendering RSC payloads to HTML is not supported yet. This means static and server output doesn't fully work yet.
- [`generateStaticParams`](https://docs.expo.dev/router/reference/static-rendering#generatestaticparams) is only partially supported in full React Server Components mode.
- HTML `form` integration with Server Functions is not supported yet (this partially works automatically, but data is not encrypted).
- `StyleSheet.create` and `Platform.OS` are not supported on native. Use standard objects for styles and `process.env.EXPO_OS` for platform detection.
- React Server Functions that invoke other Server Functions are not supported on Hermes due to a limitation in the Hermes runtime. This may be resolved with Static Hermes.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-nextjs/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using Next.js with Expo for Web

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-nextjs.mdx)

Copy

A guide for integrating Next.js with Expo for the web.

[Next.js](https://nextjs.org/) is a React framework that provides simple page-based routing as well as server-side rendering. To use Next.js with the Expo SDK, we recommend using [`@expo/next-adapter`](https://github.com/expo/expo-cli/tree/main/packages/next-adapter) library to handle the configuration.

## Automatic setup

To quickly get started, create a new project using [with-nextjs](https://github.com/expo/examples/tree/master/with-nextjs) template:

Terminal

`- ` `npx create-expo-app -e with-nextjs`

- Native: `npx expo start` — start the Expo project
- Web: `npx next dev` — start the Next.js project

## Manual setup

### Install dependencies

Ensure you have `expo`, `next`, `@expo/next-adapter` installed in your project:

`- ` `yarn add expo next @expo/next-adapter`

### Transpilation

Configure Next.js to transform language features:

Next.js with swc. (Recommended) [Permalink](https://docs.expo.dev/guides/using-nextjs/#nextjs-with-swc-recommended)

Using Next.js with SWC is recommended. You can configure the [babel.config.js](https://docs.expo.dev/versions/latest/config/babel) to only account for native:

babel.config.js

```text-2xs text-default

You will also have to [force Next.js to use SWC](https://nextjs.org/docs/messages/swc-disabled) by adding the following to your next.config.js:

next.config.js

Next.js with Babel. (Not recommended) [Permalink](https://docs.expo.dev/guides/using-nextjs/#nextjs-with-babel-not-recommended)

Adjust your babel.config.js to conditionally add `next/babel` when bundling with webpack for web:

### Next.js configuration

Add the following to your next.config.js:

The fully qualified Next.js config may look like:

### React Native Web styling

The package `react-native-web` builds on the assumption of reset CSS styles. Here's how you reset styles in Next.js using the pages directory.

pages/\_document.js

pages/\_app.js

## Transpiling modules

By default, modules in the React Native ecosystem are not transpiled to run in web browsers. React Native relies on advanced caching in Metro to reload quickly. Next.js uses webpack, which does not have the same level of caching, so no node modules are transpiled by default. You will have to manually mark every module you want to transpile with the `transpilePackages` option in next.config.js:

## Deploy to Vercel

This is Vercel's preferred method for deploying Next.js projects to production.

1

Add a `build` script to your package.json:

package.json

2

Install the Vercel CLI:

`- ` `npm i -g vercel`

3

Deploy to Vercel:

`- ` `vercel`

## Limitations or differences compared to the default Expo for Web

Using Next.js for the web means you will be bundling with the Next.js webpack config. This will lead to some core differences in how you develop your app vs your website.

- Expo Next.js adapter does not support the experimental app directory.
- For file-based routing on native, we recommend using [Expo Router](https://github.com/expo/router).

## Contributing

If you would like to help make Next.js support in Expo better, feel free to open a PR or submit an issue:

- [@expo/next-adapter](https://github.com/expo/expo-cli/tree/main/packages/next-adapter)

## Troubleshooting

### Cannot use import statement outside a module

Figure out which module has the import statement and add it to the `transpilePackages` option in next.config.js:

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/react-compiler/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# React Compiler

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/react-compiler.mdx)

Copy

Learn how to enable and use the React Compiler in Expo apps.

* * *

The new [React Compiler](https://react.dev/learn/react-compiler) automatically memoizes components and hooks to enable fine-grained reactivity. This can lead to significant performance improvements in your app. You can enable it in your app by following the instructions below.

## Enabling React Compiler

1

[Check how compatible](https://react.dev/learn/react-compiler#checking-compatibility) your project is with the React Compiler.

Terminal

`- ` `npx react-compiler-healthcheck@latest`

This will generally verify if your app is following the [rules of React](https://react.dev/reference/rules).

2

Install `babel-plugin-react-compiler` and the React compiler runtime in your project:

SDK 54 and above

SDK 53

SDK 52 and below

Babel is automatically configured in Expo SDK 54 and above.

`- ` `npx expo install babel-plugin-react-compiler@beta`

`- ` `npx expo install babel-plugin-react-compiler@beta react-compiler-runtime@beta`

3

Toggle on the React Compiler experiment in your app config file:

app.json

```text-2xs text-default

Additionally, you should use the ESLint plugin to continuously enforce the rules of React in your project.

Run [`npx expo lint`](https://docs.expo.dev/guides/using-eslint#eslint) to ensure ESLint is setup in your app, then install the ESLint plugin for React Compiler:

`- ` `npx expo install eslint-plugin-react-compiler -D`

Update your [ESLint configuration](https://docs.expo.dev/guides/using-eslint) to include the plugin:

.eslintrc.js

## Incremental adoption

You can incrementally adopt the React Compiler in your app using a few strategies:

Configure the Babel plugin to only run on specific files or components. To do this:

1. If your project doesn't have [babel.config.js](https://docs.expo.dev/versions/latest/config/babel), create one by running `npx expo customize babel.config.js`.
2. Add the following configuration to babel.config.js:

babel.config.js

Whenever you change your babel.config.js file, you need to restart the Metro bundler to apply the changes:

`- ` `npx expo start --clear`

Use the `"use no memo"` directive to opt out of the React Compiler for specific components or files.

Improvements are primarily automatic. You can remove instances of `useCallback`, `useMemo`, and `React.memo` in favor of the automatic memoization. Class components will not be optimized. Instead, migrate to function components.

Expo's implementation of the React Compiler will only run on application code (no node modules), and only when bundling for the client (disabled in server rendering).

## Configuration

You can pass additional settings to the React Compiler Babel plugin by using the `react-compiler` object in the Babel configuration:

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-bun/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using Bun

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-bun.mdx)

Copy

A guide on using Bun with Expo and EAS.

* * *

[Bun](https://bun.sh/) is a JavaScript runtime and a drop-in alternative for [Node.js](https://nodejs.org/en). In Expo projects, Bun can be used to install npm packages and run Node.js scripts. The benefits of using Bun are faster package installation than npm, pnpm, or Yarn and [at least 4x faster startup time compared to Node.js](https://bun.sh/docs#design-goals), which gives a huge boost to your local development experience.

To create a new app using Bun, [install Bun on your local machine](https://bun.sh/docs/installation#installing).

## Start a new Expo project with Bun

To create a new project, run the command:

Terminal

`- ` `bun create expo-app my-app`

You can also run any package.json script with `bun run`:

`- ` `bun run ios`

To install any Expo library, you can use `bun expo install`:

`- ` `bun expo install expo-av`

## Use Bun for EAS builds

EAS decides which package manager to use based on the lockfile in your codebase. If you want EAS to use Bun, run `bun install` in your codebase which will create a bun.lockb (the Bun lockfile). As long as this lockfile is in your codebase, Bun will be used as the package manager for your builds. Make sure to delete any lockfiles generated by other package managers.

### Customize Bun version on EAS

Bun is installed by default when using EAS. See the [Android server images](https://docs.expo.dev/build-reference/infrastructure#android-server-images) and [iOS server images](https://docs.expo.dev/build-reference/infrastructure#ios-server-images) to learn which version of Bun is used by your build's image.

To use an [exact version of Bun](https://docs.expo.dev/eas/json#bun) with EAS, add the version number in eas.json under the build profile's configuration. For example, the configuration below specifies Bun version `1.0.0` for the `development` build profile:

eas.json

```text-2xs text-default

## Trusted dependencies

Unlike other package managers, Bun does not automatically execute lifecycle scripts from installed libraries, as this is considered a security risk. However, if a package you are installing has a `postinstall` script that you want to run, you have to explicitly state that by including that library in your [`trustedDependencies`](https://bun.sh/guides/install/trusted) array in your package.json.

For example, if you install `packageA`, which has a dependency on `packageB` and `packageB` has a `postinstall` script, you must add `packageB` in your `trustedDependencies`.

To add a trusted dependency in your package.json, add:

package.json

Then, remove your lockfile and re-install the dependencies:

`- ` `rm -rf node_modules`

`- ` `rm bun.lockb`

`- ` `bun install`

## Common errors

### EAS Build fails when using Sentry and Bun

If you're using `sentry-expo` or `@sentry/react-native`, these depend on `@sentry/cli`, which updates source maps to Sentry during your build. The `@sentry/cli` package has a `postinstall` script which needs to run for the "upload source maps" script to become available.

To fix this, add `@sentry/cli` to your [trusted dependencies](https://docs.expo.dev/guides/using-bun#trusted-dependencies) array in package.json:

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-eslint/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using ESLint and Prettier

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-eslint.mdx)

Copy

A guide on configuring ESLint and Prettier to format Expo apps.

* * *

[ESLint](https://eslint.org/) is a JavaScript linter that helps you find and fix errors in your code. It's a great tool to help you write better code and catch mistakes before they make it to production. In conjunction, you can use [Prettier](https://prettier.io/docs/en/), a code formatter that ensures all the code files follow a consistent styling.

This guide provides steps to set up and configure ESLint and Prettier.

## ESLint

To set up ESLint in your Expo project, you can use the Expo CLI to install the necessary dependencies. Running this command also creates a eslint.config.js file at the root of your project which extends configuration from [`eslint-config-expo`](https://github.com/expo/expo/tree/main/packages/eslint-config-expo).

Terminal

`# Install and configure ESLint`

`- ` `npx expo lint`

You can lint your code manually from the command line with the `npx expo lint` script:

`# After ESLint has been configured, run the command again to lint your code.`

Running the above command will run the `lint` script from package.json.

`# Example output for npx expo lint command`

`/app/components/HelloWave.tsx` ` 22:6 warning React Hook useEffect has a missing dependency: "rotateAnimation".` ` Either include it or remove the dependency array react-hooks/exhaustive-deps`

`✖ 1 problem (0 errors, 1 warning)`

### Environment configuration

ESLint is generally configured for a single environment. However, the source code is written in JavaScript in an Expo app that runs in multiple different environments. For example, the app.config.js, metro.config.js, babel.config.js, and app/+html.tsx files are run in a Node.js environment. It means they have access to the global `__dirname` variable and can use Node.js modules such as `path`. Standard Expo project files like app/index.js can be run in Hermes, Node.js, or the web browser.

The approach to configure environment-specific globals differs between Flat config and legacy config:

Flat config

Legacy config

For Flat config, metro.config.js files already work with Node.js globals because of the built-in support in `eslint-config-expo`. For other configuration files that might need Node.js globals, use [`languageOptions.globals`](https://eslint.org/docs/latest/use/configure/language-options#predefined-global-variables) in your eslint.config.js:

eslint.config.js

```text-2xs text-default

For example, with this setup, you can now use Node.js globals in babel.config.js:

babel.config.js

For legacy config, you can add the `eslint-env` comment to the top of a file to tell ESLint which environment the file is running in:

metro.config.js

## Prettier

### Installation

To install Prettier in your project:

macOS/Linux

Windows

`- ` `npx expo install prettier eslint-config-prettier eslint-plugin-prettier --dev`

`- ` `npx expo install prettier eslint-config-prettier eslint-plugin-prettier "--" --dev`

### Setup

To integrate Prettier with ESLint, update your eslint.config.js:

To integrate Prettier with ESlint, update your .eslintrc.js:

.eslintrc.js

Now, when you run `npx expo lint`, anything that is not aligned with Prettier formatting will be caught as an error.

To customize Prettier settings, create a .prettierrc file at the root of your project and add your configuration.

[Custom Prettier configuration\\
\\
Learn more about customizing Prettier configuration.](https://github.com/expo/expo/tree/main/packages/eslint-config-universe#customizing-prettier)

## Troubleshooting

### ESLint is not updating in VS Code

If you're using VS Code, install the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) to lint your code as you type. You can try restarting the ESLint server by running the command `ESLint: Restart ESLint Server` from the [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette).

### ESLint is slow

ESLint can be slow to run on large projects. The easiest way to speed up the process is to lint fewer files. Add a .eslintignore file to your project root to ignore certain files and directories such as:

.eslintignore

Upgrade ESLint and `eslint-config-expo`:

`- ` `npx expo install eslint eslint-config-expo --dev`

`- ` `npx expo install eslint eslint-config-expo "--" --dev`

If you haven't customized your ESLint config at all, delete your .eslintrc.js and generate the new config with:

Alternatively, migrate your config based on the [ESLint's migration guide](https://eslint.org/docs/latest/use/configure/migration-guide). `npx expo lint` supports both legacy and flat config, so the new config will automatically be picked up by the CLI.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/analyzing-bundles/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Analyzing JavaScript bundles with Expo Atlas and Lighthouse

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/analyzing-bundles.mdx)

Copy

Learn about improving the production JavaScript bundle size of Expo apps and websites with Expo Atlas and Lighthouse.

* * *

Bundle performance varies for different platforms. For example, web browsers don't support precompiled bytecode, so the JavaScript bundle size is important for improving startup time and performance. The smaller the bundle, the faster it can be downloaded and parsed.

## Analyzing bundle size with Expo Atlas

The libraries used in a project influence the size of the production JavaScript bundle. You can use [Expo Atlas](https://github.com/expo/expo-atlas#readme) to visualize the production bundle and identify which libraries contribute to the bundle size.

### Using Atlas with `npx expo start`

You can use Expo Atlas with the local development server. This method allows Atlas to update whenever you change any code in your project.

Once your app is running using the local development server on Android, iOS, and/or web, you can open Atlas through the [dev tools plugin menu](https://docs.expo.dev/debugging/devtools-plugins#using-a-dev-tools-plugin) using `shift` \+ `m`.

Terminal

`# Start the local development server with Atlas`

`- ` `EXPO_ATLAS=true npx expo start`

#### Changing development mode to production

By default, Expo starts the local development server in [development mode](https://docs.expo.dev/workflow/development-mode#development-mode). Development mode disables some optimizations that are enabled in [production mode](https://docs.expo.dev/workflow/development-mode#production-mode). You can also start the local development server in production mode to get a more accurate representation of the production bundle size:

`# Run the local development server in production mode`

`- ` `EXPO_ATLAS=true npx expo start --no-dev`

### Using Expo Atlas with `npx expo export`

You can also use Expo Atlas when generating a production bundle for your app or EAS Update. Atlas generates a .expo/atlas.jsonl file during export, which you can share and open without having access to the project.

`# Export your app for all platforms`

`- ` `EXPO_ATLAS=true npx expo export`

`# Open the generated Expo Atlas file`

`- ` `npx expo-atlas .expo/atlas.jsonl`

You can also specify the platforms you want to analyze using the `--platform` option. Expo Atlas will gather the data for the exported platforms only.

### Analyzing transformed modules

Inside Atlas, you can hold `⌘ Cmd` and click on a graph node to see the transformed module details. This feature helps you understand how a module is transformed by Babel, which modules it imports, and which modules imported it. This can be used to trace the origin of a module across the dependency graph.

If you are using SDK 50 or below, you can use the [`source-map-explorer`](https://www.npmjs.com/package/source-map-explorer) library to visualize and analyze the production JavaScript bundle.

1

To use source map explorer, run the following command to install it:

`- ` `npm i --save-dev source-map-explorer`

2

Add a script to package.json to run it. You might have to adjust the input path depending on the platform or SDK you are using. For brevity, the following example assumes the project is Expo SDK 50 and does not use Expo Router `server` output.

package.json

```text-2xs text-default

If you are using the SDK 50 `server` output for web, then use the following to map web bundles:

`- ` `npx source-map-explorer 'dist/client/_expo/static/js/web/*.js' 'dist/client/_expo/static/js/web/*.js.map'`

Web bundles are output to the dist/client subdirectory to prevent exposing server code to the client.

3

Export your production JavaScript bundle and include the `--source-maps` flag so that the source map explorer can read the source maps. For native apps using Hermes, you can use the `--no-bytecode` option to disable bytecode generation.

`- ` `npx expo export --source-maps --platform web`

`# Native apps using Hermes can disable bytecode for analyzing the JavaScript bundle.`

`- ` `npx expo export --source-maps --platform ios --no-bytecode`

4

Run the script to analyze your bundle:

`- ` `npm run analyze:web`

On running this command, you might see the following error:

This is probably due to a [known issue](https://github.com/danvk/source-map-explorer/issues/247) in `source-map-explorer` in Node.js 18 and above. To resolve this, set the environment variable `NODE_OPTIONS=--no-experimental-fetch` before running the analyze script.

## Lighthouse

Lighthouse is a great way to see how fast, accessible, and performant your website is. You can test your project with the Audit tab in Chrome, or with the [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse#using-the-node-cli).

After creating a production build with `npx expo export -p web` and serving it (using either `npx serve dist`, or production deployment, or custom server), run Lighthouse with the URL your site is hosted at.

`# Install the lighthouse CLI`

`- ` `npm install -g lighthouse`

`# Run the lighthouse CLI for your site`

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/tree-shaking/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Tree shaking and code removal

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/tree-shaking.mdx)

Copy

Learn about how Expo CLI optimizes production JavaScript bundles.

Android

iOS

tvOS

Web

* * *

Tree shaking (also referred to as _dead code removal_) is a technique to remove unused code from the production bundle. Expo CLI employs different techniques, including [minification](https://docs.expo.dev/guides/minify), to improve startup time by removing unused code.

## Platform shaking

Expo CLI employs a process known as platform shaking for app bundling, where it creates separate bundles for each platform (Android, iOS, web). It ensures that the code is only used on one platform and is removed from other platforms.

Any code that is used conditionally based on the `Platform` module from `react-native` is removed from the other platforms. However, this exclusion specifically applies to instances where `Platform.select` and `Platform.OS` are directly imported from react-native in each file. If these are re-exported through a different module, they will not be removed during the bundling process for different platforms.

For example, consider the following transformation input:

Input

```text-2xs text-default

The production bundle will remove the conditional based on the platform:

Output (Android)

Output (iOS)

This optimization is production only and runs on a per-file basis. If you re-export `Platform.OS` from a different module, it will not be removed from the production bundle.

The `process.env.EXPO_OS` can be used to detect the platform that the JavaScript was bundled for (cannot change at runtime). This value does not support platform shaking imports due to how Metro minifies code after dependency resolution.

## Remove development-only code

In your project, there might be code designed to help with the development process. It should be excluded from the production bundle. To handle these scenarios, use the `process.env.NODE_ENV ` environment variable or the non-standard `__DEV__` global boolean.

1

For example, the following code snippet will be removed from the production bundle:

2

After _constants folding_ takes place, the conditions can be evaluated statically:

Post constants folding

3

The unreachable conditions are removed during [minification](https://docs.expo.dev/guides/minify):

Output (production)

To improve speed, Expo CLI only performs code elimination in production builds. Conditionals from the above code snippet are kept in development builds.

## Custom code removal

`EXPO_PUBLIC_` environment variables are inlined before the minification process. This means they can be used to remove code from the production bundle. For example:

.env

The above input code snippet is transformed to the following after `babel-preset-expo`:

Post babel-preset-expo

The above code snippet is then minified, which removes the unused conditional:

Post minifier

- This system does not apply to server code as environment variables are not inlined in server bundles.
- Library authors should not use `EXPO_PUBLIC_` environment variables as they only run in application code for security reasons.

## Removing server code

It's common to use `typeof window === 'undefined'` to conditionally enable or disable code for server and client environments.

`babel-preset-expo` will transform `typeof window === 'undefined'` to `true` when bundling for server environments. By default, this check remains unchanged when bundling for web client environments. This transform runs in both development and production but only removes conditional requires in production.

You can configure `babel-preset-expo` to enable this transform by passing `{ minifyTypeofWindow: true }`.
By default, this transform remains disabled even for web environments since web workers won't have a `window` global.

The input code from the previous step is transformed to the following code snippet after `babel-preset-expo` when bundling for server environments (API routes, server rendering):

Post babel-preset-expo (bundling for server)

Bundling client code for web or native apps will not replace `typeof window` unless `minifyTypeOfWindow: true` is set:

For server environments, the above code snippet is then minified which removes the unused conditional:

Post minifier (server)

Post minifier (client)

## React Native web imports

`babel-preset-expo` provides a built-in optimization for the `react-native-web` barrel file. If you import `react-native` directly using ESM, then the barrel file will be removed from the production bundle.

ESM

CJS

If you import `react-native` using the static `import` syntax, the barrel file will be removed.

Output (web)

If you import `react-native` using `require()`, the barrel file will be left as-is in the production bundle.

You can experimentally enable support for automatically removing unused imports and exports across modules. This is useful for speeding up native OTA downloads and optimizing web performance where JavaScript must be parsed and executed using a standard JavaScript engine.

Consider the following example code:

index.js

icons.js

Since only `ArrowUp` is used in `index.js`, the production bundle will remove all other components from `icons.js`.

icons.js (Output)

This system scales up to automatically optimize all `import` and `export` syntax in your app, across all platforms. While this results in smaller bundles, processing JS still requires time and computer memory so avoid importing millions of modules.

- Tree-shaking only runs in production bundles and can only run on modules that use `import` and `export` syntax. Files that use `module.exports` and `require` will not be tree-shaken.
- Avoid adding Babel plugins such as `@babel/plugin-transform-modules-commonjs` which convert `import`/ `export` syntax to CJS. This will break tree-shaking across your project.
- Modules that are marked as side-effects will not be removed from the graph.
- `export * from "..."` will be expanded and optimized unless the export uses `module.exports` or `exports`.
- All modules in the Expo SDK are shipped as ESM and can be exhaustively tree-shaken.

How to enable import support in older SDK versions? [Permalink](https://docs.expo.dev/guides/tree-shaking/#how-to-enable-import-support-in-older)

metro.config.js

Experimental import support uses a custom version of the `@babel/plugin-transform-modules-commonjs` plugin. This drastically reduces the number of resolutions and simplifies your output bundle. This feature can be used with `inlineRequires` to further optimize your bundle experimentally.

Toggle on the environment variable `EXPO_UNSTABLE_METRO_OPTIMIZE_GRAPH=1` to keep modules around until the entire graph is created. Ensure your app builds and runs as expected in production with this feature enabled before continuing.

This will only be used in production mode.

Toggle on the environment variable `EXPO_UNSTABLE_TREE_SHAKING=1` to enable the feature.

4

Bundle your app in production mode to see the effects of tree shaking.

Terminal

`- ` `npx expo export`

This feature is very experimental because it changes the fundamental structure of how Metro bundles code. By default, Metro bundles everything on-demand and lazily to ensure the fastest possible development times. In contrast, tree shaking requires some transformation to be delayed until after the entire bundle has been created. This means less code can be cached, which is generally fine because tree shaking is a production-only feature and production bundles often don't use transform caches.

With Expo tree shaking, star exports will automatically be expanded and shaken based on usage. For example, consider the following code snippet:

The optimization pass will crawl `./icons` and add the exports to the current module. If the exports are unused, they will be removed from the production bundle.

Expanded

This will be shaken according to standard tree shaking rules. If you only import `ArrowRight`, then `ArrowLeft` will be removed from the production bundle.

If the star export pulls in ambiguous exports such as `module.exports.ArrowUp` or `exports.ArrowDown`, then the optimization pass will not expand the star export and no exports will be removed from the barrel file. You can use [Expo Atlas](https://docs.expo.dev/guides/analyzing-bundles#analyzing-bundle-size-with-atlas) to inspect the expanded exports.

You can use this strategy with libraries like `lucide-react` to remove all icons that are not used in your app.

Expo optimizes a module by recursing through the graph exhaustively to find unused imports. Consider the following code snippet:

In this case, `bar` is used in `foo`, so it cannot be removed. However, if `foo` is not used anywhere in the app, then `foo` will be removed and the module will be scanned again to see if `bar` can be removed. This process recurses 5 times for a given module before bailing out due to performance reasons.

## Side-effects

Expo CLI respects module side-effects according to the [Webpack system](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free). Side-effects are generally used for defining global variables ( `console.log`) or modifying prototypes (avoid doing this).

You can mark if your module has side-effects in the package.json:

package.json

Side-effects will prevent the removal of unused modules and disable module inlining to ensure JS code runs in the expected order. Side-effects will be removed if they're empty or contain only comments and directives ( `"use strict"`, `"use client"`, and so on).

When Expo tree shaking is enabled, you can safely enable `inlineRequires` in your metro.config.js for production bundles. This will lazily load modules when they're evaluated, leading to faster startup time. Avoid using this feature without Expo tree shaking as it will move modules around in ways that can change the execution order of side-effects.

## Optimizing for tree shaking

Before Expo tree shaking, React Native libraries would remove imports by wrapping them in conditional blocks such as:

This is problematic because you don't have accurate TypeScript support and it makes the graph ambiguous since you cannot statically analyze the code. With Expo tree shaking enabled, you can restructure this code to use ESM imports:

In both cases, the entire module will be empty in production bundles.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/publishing-websites/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Publish websites

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/publishing-websites.mdx)

Copy

Learn how to deploy Expo websites for production.

* * *

An Expo web app can be served locally for testing the production behavior, and deployed to a hosting service. We recommend deploying to [EAS Hosting](https://docs.expo.dev/eas/hosting) for the best feature support. You can also self-host or use a third-party service.

[Deploying instantly with EAS\\
\\

## Output targets

The [`web.output`](https://docs.expo.dev/versions/latest/config/app#output) target can be configured in the [app config](https://docs.expo.dev/workflow/configuration) to set the export method for the web app:

app.json

```text-2xs text-default

Expo Router supports three output targets for web apps.

| Output | Expo Router | API Routes | Description |
| --- | --- | --- | --- |
| `single` (default) | | | Outputs a Single Page Application (SPA) with a single index.html in the output directory and has no statically indexable HTML. |
| `server` | | | Creates client and server directories. Client files are output as separate HTML files. API routes as separate JavaScript files for hosting with a custom Node.js server. |
| `static` | | | Outputs separate HTML files for every route in the app directory. |

## Create a build

Creating a build of the project is the first step to publishing a web app. Whether you want to serve it locally or deploy to a hosting service, you'll need to export all JavaScript and assets of a project. This is known as a static bundle. It can be exported by running the following command:

Run the universal export command to compile the project for web:

Terminal

`- ` `npx expo export -p web`

The resulting project files are located in the dist directory. Any files inside the public directory are also copied to the dist directory.

## Serve locally

Use `npx expo serve` to quickly test locally how your website will be hosted in production. Run the following command to serve the static bundle:

`- ` `npx expo serve`

Open [`http://localhost:8081`](http://localhost:8081/) to see your project in action. This is HTTP only, so permissions, camera, location, and many other secure features may not work as expected.

## Hosting with EAS

When you're ready to go to production, you can instantly deploy your website with EAS CLI.

[Deploying instantly with EAS\\
\\
EAS Hosting is the best way to deploy your web app with support for custom domains, SSL, and more.](https://docs.expo.dev/eas/hosting/get-started)

## Hosting on third-party services

### Netlify

[Netlify](https://www.netlify.com/) is a mostly-unopinionated platform for deploying web apps. This has the highest compatibility with Expo web apps as it makes few assumptions about the framework.

#### Manual deployment with the Netlify CDN

1

Install the Netlify CLI by running the following command:

`- ` `npm install -g netlify-cli`

2

`expo.web.output: 'single'` generates a single-page application. It means there's only one dist/index.html file to which all requests must be redirected. This can be done in Netlify by creating a ./public/\_redirects file and redirecting all requests to /index.html.

public/\_redirects

If you modify this file, you must rebuild your project with `npx expo export -p web` to have it safely copied into the dist directory.

3

Deploy the web build directory by running the following command:

`- ` `netlify deploy --dir dist`

You'll see a URL that you can use to view your project online.

#### Continuous delivery

Netlify can also build and deploy when you push to git or open a new pull request:

- [Start a new Netlify project](https://app.netlify.com/signup).
- Pick your Git hosting service and select your repository.
- Click Build your site.

### Vercel

[Vercel](https://vercel.com/) has a single-command deployment flow.

Install the [Vercel CLI](https://vercel.com/docs/cli).

`- ` `npm install -g vercel@latest`

Configure redirects for single-page applications.

Create a vercel.json file at the root of your app and add the following configuration:

vercel.json

If your app uses [static rendering](https://docs.expo.dev/router/reference/static-rendering), then you may want to add additional [dynamic route configuration](https://docs.expo.dev/router/reference/static-rendering#dynamic-routes).

Deploy the website.

`- ` `vercel`

You'll now see a URL that you can use to view your project online. Paste that URL into your browser when the build is complete, and you'll see your deployed app.

### AWS Amplify Console

The [AWS Amplify Console](https://console.amplify.aws/) provides a Git-based workflow for continuously deploying and hosting full-stack serverless web apps. Amplify deploys your PWA from a repository instead of from your computer. In this guide, we'll use a GitHub repository. Before starting, [create a new repo on GitHub](https://github.com/new).

Add the [amplify-explicit.yml](https://github.com/expo/amplify-demo/blob/master/amplify-explicit.yml) file to the root of your repository. Ensure you have removed the generated dist directory from the .gitignore file and committed those changes.

Push your local Expo project to a GitHub repository. If you haven't pushed to GitHub yet, follow [GitHub's guide to add an existing project to GitHub](https://docs.github.com/en/get-started/importing-your-projects-to-github/importing-source-code-to-github/adding-locally-hosted-code-to-github).

Login to the [Amplify Console](https://console.aws.amazon.com/amplify/home) and select an existing app or create a new app. Grant Amplify permission to read from your GitHub account or the organization that owns your repo.

4

Add your repo, select the branch, and select Connecting a monorepo? to enter the path to your app's dist directory and choose Next.

The Amplify Console will detect the amplify.yml file in your project. Select Allow AWS Amplify to automatically deploy all files hosted in your project root directory and choose Next.

5

Review your settings and choose Save and deploy. Your app will now be deployed to a `https://branchname.xxxxxx.amplifyapp.com` URL. You can now visit your web app, deploy another branch, or add a unified backend environment across your Expo mobile and web apps.

Follow the steps in the Learn how to get the most out of Amplify Hosting drop-down to Add a custom domain with a free SSL certificate and more information.

### Firebase hosting

[Firebase Hosting](https://console.firebase.google.com/) is production-grade web content hosting for web projects.

Create a firebase project with the [Firebase Console](https://console.firebase.google.com/) and install the Firebase CLI by following these [instructions](https://firebase.google.com/docs/hosting).

Using the CLI, login to your Firebase account by running the command:

`- ` `firebase login`

Then, initialize your firebase project to host by running the command:

`- ` `firebase init`

The settings will depend on how you built your Expo website:

1. When asked about the public path, make sure to specify the dist directory.
2. When prompted Configure as a single-page app (rewrite all urls to /index.html), only select Yes if you used `web.output: "single"` (default). Otherwise, select No.

In the existing `scripts` property of package.json, add `predeploy` and `deploy` properties. Each has the following values:

package.json

To deploy, run the following command:

`- ` `npm run deploy-hosting`

Open the URL from the console output to check your deployment, for example: `https://project-name.firebaseapp.com`.

In case you want to change the header for hosting add the following config for `hosting` section in firebase.json:

firebase.json

### GitHub Pages

Start by initializing a new git repository in your project and configuring it to push to a GitHub repository. If you are already syncing your changes with a GitHub repository, skip this step.

Create a repository on the GitHub website. Then, run the following commands in your project's root directory:

`- ` `git init`

`- ` `git remote add origin https://github.com/username/expo-gh-pages.git`

The above commands initialize a new Git repository and configure it to push your source code to the specified GitHub repository.

Install the `gh-pages` package as a development dependency in your project:

npm

Yarn

`- ` `npm install --save-dev gh-pages`

`- ` `yarn add -D gh-pages`

To deploy the project, configure it to a subdomain with the [`baseUrl`](https://docs.expo.dev/versions/latest/config/app#baseurl) property in [app config](https://docs.expo.dev/workflow/configuration). Set its value to the string `/repo-name`.

For example, if the GitHub repository is `expo-gh-pages`, the following will be the value of the [experimental `baseUrl` property](https://docs.expo.dev/more/expo-cli#hosting-with-sub-paths):

Modify the `scripts` in the package.json file by adding `predeploy` and `deploy` scripts. Each has its own value:

Since Expo uses underscores in generated files, you need to disable Jekyll with the `--nojekyll` flag.

To generate a production build of the web app and deploy it to GitHub Pages, run the following command:

`- ` `npm run deploy`

`- ` `yarn deploy`

This publishes a build of the web app to the `gh-pages` branch of your GitHub repository. This branch only contains build artifacts from the dist directory, plus the .nojekyll file generated by `gh-pages`. It does not include development source code.

6

Now that the web app is published to the `gh-pages` branch, configure GitHub Pages to serve the app from that branch.

- Navigate to the Settings tab of the GitHub repository.
- Scroll down to Pages section.
- Ensure the Source is set to Deploy from a branch.
- Under Branch section, select gh-pages and the root directory.
- Click Save.

7

Once the web app is published and the GitHub Pages configuration is set, a GitHub Action will deploy your website. You can monitor its progress by navigating to your repository's Actions tab. Upon completion, your web app will be available at the URL `http://username-on-github.github.io/repo-name`.

For subsequent deployments and updates, run the `deploy` command and the GitHub Action will start automatically to update your web app.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/customizing-metro/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Metro bundler

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/customizing-metro.mdx)

Copy

Learn about different Metro bundler configurations that can be customized.

* * *

Expo CLI uses [Metro](https://metrobundler.dev/) during [`npx expo start`](https://docs.expo.dev/more/expo-cli#develop) and [`npx expo export`](https://docs.expo.dev/more/expo-cli#exporting) to bundle your JavaScript code and assets. Metro is built and optimized for React Native and used for large-scale applications such as Facebook and Instagram.

## Customizing

You can customize the Metro bundler by creating a metro.config.js file at the root of your project. This file should export a [Metro configuration](https://metrobundler.dev/docs/configuration/) that extends [`expo/metro-config`](https://github.com/expo/expo/tree/main/packages/@expo/metro-config). Import `expo/metro-config` instead of `@expo/metro-config` to ensure version consistency.

Run the following command to generate the template file:

Terminal

`- ` `npx expo customize metro.config.js`

The metro.config.js file looks as below:

metro.config.js

```text-2xs text-default

See [metro.config.js documentation](https://metrobundler.dev/docs/configuration/) for more information.

## Assets

Metro resolves files as either source code or assets. Source code is JavaScript, TypeScript, JSON, and other files used by your application. [Assets](https://docs.expo.dev/develop/user-interface/assets) are images, fonts, and other files that should not be transformed by Metro. To accommodate large-scale codebases, Metro requires all extensions for both source code and assets to be explicitly defined before starting the bundler. This is done by adding the `resolver.sourceExts` and `resolver.assetExts` options to the Metro configuration. By default, the following extensions are included:

- [`resolver.assetExts`](https://github.com/facebook/metro/blob/7028b7f51074f9ceef22258a8643d0f90de2388b/packages/metro-config/src/defaults/defaults.js#L15)
- [`resolver.sourceExts`](https://github.com/facebook/metro/blob/7028b7f51074f9ceef22258a8643d0f90de2388b/packages/metro-config/src/defaults/defaults.js#L53)

### Adding more file extensions to `assetExts`

The most common customization is to include extra asset extensions to Metro.

In the metro.config.js file, add the file extension (without a leading `.`) to `resolver.assetExts` array:

## Aliases

Sometimes you want an import to be redirected to another module or file. This is called an alias. Due to the way Metro bundles for multiple platforms simultaneously, we recommend using a custom resolver to handle aliases.

In the following example, we'll add an alias for `old-module` to `new-module`:

If you want to only apply the alias on a certain platform, you can check the `platform` argument:

You will see the changes the next time you restart the dev server. Resolutions are never cached and do not need the `--clear` flag to update. If you use a transform-based system like `babel-plugin-module-resolver`, you will need to clear the cache to see changes applied.

[Customizing Metro resolution\\
\\
Learn more about advanced Metro resolving in your project.](https://docs.expo.dev/versions/latest/config/metro#custom-resolving)

## Bundle splitting

Expo CLI automatically splits bundles based on async imports (web-only).

This technique can be used with Expo Router to automatically split the bundle based on route files in the app directory. It will only load the code required for the current route, and defer loading additional JavaScript until the user navigates to different pages. See [Async Routes](https://docs.expo.dev/router/reference/async-routes) for more information.

## Tree shaking

[Tree shaking\\
\\
Learn about how Expo CLI optimizes production JavaScript bundles.](https://docs.expo.dev/guides/tree-shaking)

## Minification

[Minifying JavaScript\\
\\
Learn about customizing the JavaScript minification process in Expo CLI with Metro bundler.](https://docs.expo.dev/guides/minify)

## Web support

Expo CLI has support for bundling websites using Metro. This is the same bundler used for native apps, and it is designed to be universal across platforms. It is the recommended bundler for web projects.

### Expo webpack versus Expo Metro

If you previously wrote your website using the deprecated `@expo/webpack-adapter`, see the [migration guide](https://docs.expo.dev/router/migrate/from-expo-webpack) and [comparison chart](https://docs.expo.dev/router/migrate/from-expo-webpack#expo-cli).

### Adding Web support to Metro

Modify your [app config](https://docs.expo.dev/workflow/configuration) to enable the feature using the `expo.web.bundler` field:

app.json

#### Development

To start the development server run the following command:

`- ` `npx expo start --web`

Alternatively, press `W` in the Expo CLI terminal UI.

#### Static files

Expo's Metro implementation supports hosting static files from the dev server by putting them in the root public/ directory. It is similar to many other web frameworks.

When exporting with `npx expo export`, the contents of the public directory are copied into the dist/ directory. It means your app can expect to fetch these assets relative to the host URL. The most common example of this is the public/favicon.ico which is used by websites to render the tab icon.

You can overwrite the default index.html in Metro web by creating a public/index.html file in your project.

In the future, this will work universally across platforms with EAS Update hosting. Currently, the feature is web-only based on the static host used for the native app, for example, the legacy Expo service updates do not support this feature.

## TypeScript

Expo's Metro config supports the `compilerOptions.paths` and `compilerOptions.baseUrl` fields in the project's tsconfig.json (or jsconfig.json) file. This enables absolute imports and aliases in the project. See [TypeScript](https://docs.expo.dev/guides/typescript) guide for more information.

This feature requires additional setup in bare projects. See the [Metro setup guide](https://docs.expo.dev/versions/latest/config/metro#bare-workflow-setup) for more information.

## CSS

[Metro web CSS guide\\
\\
Learn how to use CSS in websites that are bundled with Expo CLI and Metro bundler.](https://docs.expo.dev/versions/latest/config/metro#css)

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/local-app-production/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Create a production build locally

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/local-app-production.mdx)

Copy

Learn how to create a production build for your Expo app locally.

* * *

To create your app's production build (also known as release build) locally, you need to follow separate steps on your computer and use the tools required to create any native app. This guide provides the necessary steps for Android and iOS.

## Android

Creating a production build locally for Android requires signing it with an [upload key](https://developer.android.com/studio/publish/app-signing#certificates-keystores) and generating an Android Application Bundle (.aab). Follow the steps below:

### Prerequisites

- [OpenJDK distribution](https://docs.expo.dev/get-started/set-up-your-environment?mode=development-build&buildEnv=local#install-watchman-and-jdk) installed to access the `keytool` command
- android directory generated. If you are using [CNG](https://docs.expo.dev/workflow/continuous-native-generation), then run `npx expo prebuild` to generate it.

1

### Create an upload key

Already created a build with EAS Build? Download your credentials and skip to the next step. [Permalink](https://docs.expo.dev/guides/local-app-production/#already-created-a-build-with-eas-build)

If you've already created a build with EAS Build, follow the steps below to download the credentials, which contains the upload key and its password, key alias, and key password:

1. In your terminal, run `eas credentials -p android` and select the build profile.

3. Move the downloaded keystore.jks file to the android/app directory.
4. Copy the values for the upload keystore password, key alias, and key password from the credentials.json as you will need them in the next step.

Inside your Expo project directory, run the following `keytool` command to create an upload key:

Terminal

`- ` `sudo keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000`

After running this command, you will be prompted to enter a password for the keystore. This password will protect the upload key. Remember the password you enter here, as you'll need it in the next step.

2

### Update gradle variables

Open android/gradle.properties file and add the following gradle variables at the end of the file. Replace the `*****` with the correct keystore and key password that you provided in the previous step.

These variables contain information about your upload key:

android/gradle.properties

```text-2xs text-default

3

### Add signing config to build.gradle

Open android/app/build.gradle file and add the following configuration:

android/app/build.gradle

| | | |
| --- | --- | --- |
| 101 | 101 | keyAlias 'androiddebugkey' |
| 102 | 102 | keyPassword 'android' |
| 103 | 103 | } |
| | 104 | release { |
| | 105 | if (project.hasProperty('MYAPP\_UPLOAD\_STORE\_FILE')) { |
| | 106 | storeFile file(MYAPP\_UPLOAD\_STORE\_FILE) |
| | 107 | storePassword MYAPP\_UPLOAD\_STORE\_PASSWORD |
| | 108 | keyAlias MYAPP\_UPLOAD\_KEY\_ALIAS |
| | 109 | keyPassword MYAPP\_UPLOAD\_KEY\_PASSWORD |
| | 110 | } |
| | 111 | } |
| 104 | 112 | } |
| 105 | 113 | buildTypes { |
| 106 | 114 | debug { |
| 107 | 115 | signingConfig signingConfigs.debug |
| 108 | 116 | } |
| 109 | 117 | release { |
| 110 | 118 | // Caution! In production, you need to generate your own keystore file. |
| 111 | 119 | // see https://reactnative.dev/docs/signed-apk-android. |
| | 120 | signingConfig signingConfigs.release |
| 112 | 121 | shrinkResources (findProperty('android.enableShrinkResourcesInReleaseBuilds')?.toBoolean() ?: false) |
| 113 | 122 | minifyEnabled enableProguardInReleaseBuilds |
| 114 | 123 | proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro" |

4

### Generate release Android Application Bundle (aab)

Navigate inside the android directory and create a production build in .aab format by running Gradle's `bundleRelease` command:

`- ` `cd android`

`- ` `./gradlew app:bundleRelease`

This command will generate app-release.aab inside the android/app/build/outputs/bundle/release directory.

5

### Manual app submission to Google Play Console

Google Play Store requires manual app submission when submitting the .aab file for the first time.

[Manual submission of an Android app\\
\\
Follow the steps from the FYI guide on manually submitting your app to Google Play Store for the first time.](https://expo.fyi/first-android-submission)

## iOS

To create an iOS production build locally for Apple App Store, you need to use Xcode which handles the signing and submission process via App Store Connect.

### Prerequisites

- Paid Apple Developer membership
- [Xcode installed](https://docs.expo.dev/get-started/set-up-your-environment?platform=ios&device=physical&mode=development-build&buildEnv=local#set-up-xcode-and-watchman) on your computer
- ios directory generated. If you are using [CNG](https://docs.expo.dev/workflow/continuous-native-generation), then run `npx expo prebuild` to generate it.

### Open iOS workspace in Xcode

Inside your Expo project directory, run the following command to open `your-project.xcworkspace` in Xcode:

`- ` `xed ios`

After opening the iOS project in Xcode:

1. From the sidebar on the left, select your app's workspace.
2. Go to Signing & Capabilities and select All or Release.

### Configure a release scheme

To configure your app's release scheme:

2. Select Run from the sidebar, then set the Build configuration to Release using the dropdown.

### Build app for release

### App submission using App Store Connect

Once the build is complete, you can distribute your app to TestFlight or submit it to the App Store using App Store Connect:

2. Under Archives, click Distribute App from the right sidebar.
3. Click App Store Connect and follow the prompts shown in the window. This step will create an app store record and upload your app to the App Store.
4. Now you can go to your App Store Connect account, select your app under Apps, and submit it for testing using TestFlight or prepare it for final release by following the steps in the App Store Connect dashboard.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/building-for-tv/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Build Expo apps for TV

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/building-for-tv.mdx)

Copy

A guide for building an Expo app for an Android TV or Apple TV target.

React Native is supported on Android TV and Apple TV through the [React Native TV project](https://github.com/react-native-tvos/react-native-tvos). This technology extends beyond TV, offering a comprehensive core repo fork with support for phone and TV targets, including Hermes and Fabric.

Using the React Native TV library as the `react-native` dependency in an Expo project, it becomes capable of targeting both mobile (Android, iOS) and TV (Android TV, Apple TV) devices.

## Prerequisites

The necessary changes to the native Android and iOS files are minimal and can be automated with a [config plugin](https://github.com/react-native-tvos/config-tv/tree/main/packages/config-tv) if you use [prebuild](https://docs.expo.dev/workflow/prebuild). Below is a list of changes made by the config plugins, which you can alternatively apply manually:

### Android

- AndroidManifest.xml is modified:
- The default phone portrait orientation is removed
- The required intent for TV apps is added
- MainApplication.kt is modified to remove unsupported Flipper invocations

### iOS

- ios/Podfile is modified to target tvOS instead of iOS
- The Xcode project is modified to target tvOS instead of iOS
- The splash screen (SplashScreen.storyboard) is modified to work on tvOS

## System requirements for TV development

### Android TV

- [Node.js (LTS)](https://nodejs.org/en/) on macOS or Linux.
- Android Studio (Iguana or later).
- In the Android Studio SDK manager, select the dropdown for the Android SDK you are using (API version 31 or later), and make sure an Android TV system image is selected for installation. (For Apple silicon, choose the ARM 64 image. Otherwise, choose the Intel x86\_64 image).
- After installing the Android TV system image, create an Android TV emulator using that image (the process is the same as creating an Android phone emulator).

### Apple TV

- [Node.js (LTS)](https://nodejs.org/en/) on macOS.
- Xcode 16 or later.
- tvOS SDK 17 or later. (This is not installed automatically with Xcode. You can install it later with `xcodebuild -downloadAllPlatforms`).

## Quick start

The fastest way to generate a new project is described in the [TV example](https://github.com/expo/examples/tree/master/with-tv) within the Expo examples repository:

Terminal

`- ` `npx create-expo-app MyTVProject -e with-tv`

You can start with the [TV Router example](https://github.com/expo/examples/tree/master/with-router-tv):

`- ` `npx create-expo-app MyTVProject -e with-router-tv`

This creates a new project that uses [Expo Router](https://docs.expo.dev/router/introduction) for file-based navigation, modeled after the [create-expo-app default template](https://docs.expo.dev/get-started/create-a-project).

See which libraries are supported [Permalink](https://docs.expo.dev/guides/building-for-tv/#see-which-libraries-are-supported)

At this time, TV applications work with the following libraries and APIs listed below:

- [AppleAuthentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication)
- [Application](https://docs.expo.dev/versions/latest/sdk/application)
- [Audio](https://docs.expo.dev/versions/latest/sdk/audio)
- [Asset](https://docs.expo.dev/versions/latest/sdk/asset)
- [AsyncStorage](https://docs.expo.dev/versions/latest/sdk/async-storage)
- [AV](https://docs.expo.dev/versions/latest/sdk/av)
- [BackgroundTask](https://docs.expo.dev/versions/latest/sdk/background-task)
- [BlurView](https://docs.expo.dev/versions/latest/sdk/blur-view)
- [BuildProperties](https://docs.expo.dev/versions/latest/sdk/build-properties)
- [Constants](https://docs.expo.dev/versions/latest/sdk/constants)
- [Crypto](https://docs.expo.dev/versions/latest/sdk/crypto)
- [DevClient](https://docs.expo.dev/versions/latest/sdk/dev-client)
- [Device](https://docs.expo.dev/versions/latest/sdk/device)
- [Expo UI](https://docs.expo.dev/versions/latest/sdk/ui)
- [FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem)
- [FlashList](https://docs.expo.dev/versions/latest/sdk/flash-list)
- [Font](https://docs.expo.dev/versions/latest/sdk/font)
- [Image](https://docs.expo.dev/versions/latest/sdk/image)
- [ImageManipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator)
- [KeepAwake](https://docs.expo.dev/versions/latest/sdk/keep-awake)
- [LinearGradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient)
- [Localization](https://docs.expo.dev/versions/latest/sdk/localization)
- [Manifests](https://docs.expo.dev/versions/latest/sdk/manifests)
- [MediaLibrary](https://docs.expo.dev/versions/latest/sdk/media-library)
- [NetInfo](https://docs.expo.dev/versions/latest/sdk/netinfo)
- [Network](https://docs.expo.dev/versions/latest/sdk/network)
- [Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated)
- [SafeAreaContext](https://docs.expo.dev/versions/latest/sdk/safe-area-context)
- [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore)
- [Skia](https://docs.expo.dev/versions/latest/sdk/skia)
- [SplashScreen](https://docs.expo.dev/versions/latest/sdk/splash-screen)
- [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite)
- [Svg](https://docs.expo.dev/versions/latest/sdk/svg)
- [SystemUI](https://docs.expo.dev/versions/latest/sdk/system-ui)
- [TaskManager](https://docs.expo.dev/versions/latest/sdk/task-manager)
- [TrackingTransparency](https://docs.expo.dev/versions/latest/sdk/tracking-transparency)
- [Updates](https://docs.expo.dev/versions/latest/sdk/updates)
- [Video](https://docs.expo.dev/versions/latest/sdk/video)
- [VideoThumbnails](https://docs.expo.dev/versions/latest/sdk/video-thumbnails)

TV also works with [React Navigation](https://reactnavigation.org/), [React Native Skia](https://shopify.github.io/react-native-skia/), and many other commonly used third-party React Native libraries. See [React Native directory](https://reactnative.directory/?tvos=true) to learn more about supported third-party libraries.

#### Limitations

- The [Expo DevClient](https://docs.expo.dev/versions/latest/sdk/dev-client) library is only supported in SDK 54 and later:
- Android TV: All operations are supported, similar to an Android phone.
- Apple TV: Basic operations with a local or tunneled packager are supported. Authentication to EAS and listing of EAS builds and updates is not yet supported.

## Integration with an existing Expo project

The following walkthrough describes the steps required to modify an Expo project for TV.

1

### Modify dependencies for TV

In package.json, modify the `react-native` dependency to use the TV repo, and exclude this dependency from [`npx expo install` version validation](https://docs.expo.dev/more/expo-cli#configuring-dependency-validation).

package.json

```text-2xs text-default

2

### Add the TV config plugin

`- ` `npx expo install @react-native-tvos/config-tv -- --dev`

When installed, the plugin will modify the project for TV when either:

- The environment variable `EXPO_TV` is set to `1`
- The plugin parameter `isTV` is set to `true`

Verify that this plugin appears in app.json:

app.json

To see additional information on the plugin's actions during prebuild, you can set [debug environment variables](https://github.com/debug-js/debug#conventions) before running prebuild. (See also our documentation on [Expo CLI environment variables](https://docs.expo.dev/more/expo-cli#environment-variables).)

`# See all Expo CLI and config plugin debug information`

`- ` `export DEBUG=expo:*`

`# See only debug information for the TV plugin`

`- ` `export DEBUG=expo:react-native-tvos:config-tv`

3

### Run prebuild

Set the `EXPO_TV` environment variable, and run prebuild to make the TV modifications to the project.

`- ` `export EXPO_TV=1`

4

### Build for Android TV

Start an Android TV emulator and use the following command to start the app on the emulator:

`- ` `npx expo run:android`

5

### Build for Apple TV

Run the following command to build and run the app on an Apple TV simulator:

`- ` `npx expo run:ios`

6

### Revert TV changes and build for phone

You can revert the changes for TV and go [SkiaMultiplatform\\
\\
Demonstrates React Native Skia on mobile, TV, and web.](https://github.com/react-native-tvos/SkiaMultiplatform) [NativewindMultiplatform\\
\\
Demonstrates using TailwindCSS styling on mobile, TV, and web.](https://github.com/react-native-tvos/NativewindMultiplatform)

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/typescript/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using TypeScript

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/typescript.mdx)

Copy

An in-depth guide on configuring an Expo project with TypeScript.

* * *

Expo has first-class support for [TypeScript](https://www.typescriptlang.org/). The JavaScript interface of Expo SDK is written in TypeScript.

This guide provides a quick way to get started for a new project and also steps to migrate your existing JavaScript based Expo project to use TypeScript.

## Quick start

To create a new project, use the default template which includes base TypeScript configuration, example code, and basic navigation structure:

Terminal

`- ` `npx create-expo-app@latest`

After you create a new project using the command above, make sure to follow instructions from:

- [Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment) which provides required steps for setting local development environment.
- [Start developing](https://docs.expo.dev/get-started/start-developing) which provides information on triggering a development server, file structure, and details about other features.

## Migrating existing JavaScript project

To migrate your existing JavaScript based project to use TypeScript, follow the instructions below:

1

### Rename files to use .tsx or .ts extension

Rename files to convert them to TypeScript. For example, start with the root component file such as App.js and rename it to App.tsx:

2

### Install required development dependencies

To install required `devDependencies` such as `typescript` and `@types/react` in package.json:

macOS/Linux

Windows

`- ` `npx expo install typescript @types/react --dev`

Type checking project files with `tsc` [Permalink](https://docs.expo.dev/guides/typescript/#type-checking-project-files-with-tsc)

To type check your project's files run `tsc` command within the root of your project directory:

`# For npm`

`- ` `npm run tsc`

`# For yarn`

`- ` `yarn tsc`

3

### Add base configuration with tsconfig.json

A project's tsconfig.json should extend `expo/tsconfig.base` by default. You can automatically generate a tsconfig.json file by running the command:

`- ` `npx expo customize tsconfig.json`

The default configuration in tsconfig.json is user-friendly and encourages adoption. If you prefer strict type checking and reduce the chances of runtime errors, enable `strict` under [`compilerOptions`](https://www.typescriptlang.org/docs/handbook/compiler-options.html):

tsconfig.json

```text-2xs text-default

4

### Path aliases (Optional)

Expo CLI supports [path aliases](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping) in tsconfig.json automatically. It allows importing modules with custom aliases instead of relative paths.

For example, to import `Button` component from src/components/Button.tsx using the alias @/components/Button, add the alias `@/*` in tsconfig.json and set it to the src directory:

Disable path aliases [Permalink](https://docs.expo.dev/guides/typescript/#disable-path-aliases)

`tsconfigPaths` is enabled by default which allows you to set path aliases. You can disable it by setting `tsconfigPaths` to `false` in the project's [app config](https://docs.expo.dev/workflow/configuration):

app.json

#### Considerations

When using path aliases, consider the following:

- Restart Expo CLI after modifying tsconfig.json to update path aliases. You don't need to clear the Metro cache when the aliases change.
- If not using TypeScript, jsconfig.json can serve as an alternative to tsconfig.json.
- Path aliases add additional resolution time when defined.
- Path aliases are only supported by Metro (including Metro web) and not by the deprecated `@expo/webpack-config`.
- Bare projects require additional setup for this feature. See the [Metro setup guide](https://docs.expo.dev/versions/latest/config/metro#bare-workflow-setup) for more information.

5

### Absolute imports (Optional)

To enable absolute imports from a project's root directory, define [`compilerOptions.baseUrl`](https://www.typescriptlang.org/docs/handbook/module-resolution.html#base-url) the tsconfig.json file:

For example, setting the above configuration allows importing `Button` component from the path src/components/Button:

#### Considerations

When using absolute imports, consider the following:

- `compilerOptions.paths` are resolved relative to the `compilerOptions.baseUrl` if it is defined, otherwise they're resolved against the project root directory.
- `compilerOptions.baseUrl` is resolved before node modules. This means if you have a file named `./path.ts`, it can be imported instead of a node module named `path`.
- Restarting Expo CLI is necessary to update [`compilerOptions.baseUrl`](https://www.typescriptlang.org/docs/handbook/module-resolution.html#base-url) after modifying the tsconfig.json.
- If you're not using TypeScript, jsconfig.json can serve as an alternative to tsconfig.json.
- Absolute imports are only supported by Metro (including Metro web) and not by `@expo/webpack-config`.
- Bare projects require additional setup for this feature. See the [versioned Metro setup guide](https://docs.expo.dev/versions/latest/config/metro#bare-workflow-setup) for more information.

## Type generation

Some Expo libraries provide both static types and type generation capabilities. These types are automatically generated when the project builds or by running the `npx expo customize tsconfig.json` command.

## TypeScript for project's config files

Additional setup is required to use TypeScript for configuration files such as metro.config.js or app.config.js. You need to utilize [`tsx/cjs` require hook](https://tsx.is/dev-api/entry-point#commonjs-mode-only) to import TypeScript files within your JS config file. This hook allows TypeScript imports while keeping the root file as JavaScript.

`- ` `npx expo install tsx --dev`

`- ` `npx expo install tsx "--" --dev`

### metro.config.js

Update metro.config.js to require metro.config.ts file:

metro.config.js

Update metro.config.ts file with your project's metro configuration:

metro.config.ts

Deprecated: webpack.config.js [Permalink](https://docs.expo.dev/guides/typescript/#deprecated-webpackconfigjs)

Install the `@expo/webpack-config` package.

webpack.config.js

webpack.config.ts

### app.config.js

app.config.ts is supported by default. However, it doesn't support external TypeScript modules, or tsconfig.json customization. You can use the following approach to get a more comprehensive TypeScript setup:

app.config.ts

## Other TypeScript features

Some language features may require additional configuration. For example, if you want to use decorators you'll need to add the `experimentalDecorators` option. For more information on the available properties see the [TypeScript compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) documentation.

## Learn how to use TypeScript

A good place to start learning TypeScript is the official [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html).

For TypeScript and React components, we recommend referring to the [React TypeScript CheatSheet](https://github.com/typescript-cheatsheets/react) to learn how to type your React components in a variety of common situations.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-sentry/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using Sentry

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-sentry.mdx)

Copy

A guide on installing and configuring Sentry for crash reporting.

* * *

[Sentry](http://getsentry.com/) is a crash reporting platform that provides you with real-time insight into production deployments with info to reproduce and fix crashes.

It notifies you of exceptions or errors that your users run into while using your app and organizes them for you on a web dashboard. Reported exceptions include stacktraces, device info, version, and other relevant context automatically. You can also provide additional context that is specific to your application such as the current route and user id.

## What you'll learn

This guide covers three main aspects of integrating Sentry with your Expo projects:

- [Install and configure Sentry](https://docs.expo.dev/guides/using-sentry#install-and-configure-sentry) in your React Native app

- Using Sentry with EAS:
- [EAS Build](https://docs.expo.dev/guides/using-sentry#usage-with-eas-build) for building your app
- [EAS Update](https://docs.expo.dev/guides/using-sentry#usage-with-eas-update) for over-the-air updates
- [Setting up the Sentry-Expo integration](https://docs.expo.dev/guides/using-sentry#sentry-integration-with-eas-dashboard) to view crash reports and session replays directly in your EAS dashboard

#### Platform compatibility

| Android Device | Android Emulator | iOS Device | iOS Simulator | Web |
| --- | --- | --- | --- | --- |
| | | | | |

## Install and configure Sentry

1

### Sign up for a Sentry account and create a project

Before proceeding with installing Sentry, you'll need to make sure you have created a Sentry account and project:

1.1

[Sign up for Sentry](https://sentry.io/signup/) (the free tier supports up to 5,000 events per month), and create a project in your
Dashboard. Take note of your organization slug, project name, and DSN as you'll need
them later:

- organization slug is available in your Organization settings tab

1.2

Once you have each of these: organization slug, project name, DSN, and auth token, you're all set to proceed.

2

### Use the Sentry wizard to set up your project

The easiest way to set up Sentry in your Expo project is to use the Sentry wizard. This tool will automatically configure your project with the right settings.

Run the following command in your project directory:

Terminal

`- ` `npx @sentry/wizard@latest -i reactNative`

The wizard will:

- Install the required dependencies
- Configure your project to use Sentry
- Set up the Metro configuration automatically
- Add the necessary initialization code to your app

Follow the prompts in the wizard to complete the setup process. The wizard will guide you to log in to your Sentry account and fetch all the correct information regarding your project.

3

### Verify the configuration

Create a new release build of your app and verify that it uploads source maps correctly. You may want to add a button in your app to test that it is working and sourcemaps are wired up as expected, for example:

```text-2xs text-default

## Usage with EAS Build

Ensure that `SENTRY_AUTH_TOKEN` is set in your build environment, and Sentry will automatically upload source maps for you. If you use environment variables rather than properties in your app config, ensure that those are set as well.

Using the above instructions, no additional work is needed to integrate Sentry into your project when using EAS Build.

## Usage with EAS Update

After running `eas update`, upload the source maps to Sentry:

``# Pass in the "dist" directory generated by `eas update` to the upload script``

`- ` `npx sentry-expo-upload-sourcemaps dist`

That's it! Errors for your updates will now be properly symbolicated in Sentry.

Do you want to publish an update and the sourcemaps in one command? [Permalink](https://docs.expo.dev/guides/using-sentry/#do-you-want-to-publish-an-update)

You can chain the commands together with `&&` to publish an update and upload the sourcemaps in one step:

Do you want to append additional update-related metadata to error reports? [Permalink](https://docs.expo.dev/guides/using-sentry/#do-you-want-to-append-additional-update-related)

Configuring Sentry to tag your scope with information about your update allows you to see errors happening on certain updates in the Sentry dashboard.

Add the following snippet in the global scope as early as possible in your application's lifecycle.

Once configured, information about the associated update will show up in an error's tag section:

## Sentry integration with EAS dashboard

The Sentry integration with Expo allows you to view crash reports and Session Replays for your Expo app deployments directly within your EAS dashboard. This integration provides a direct link to Sentry stack traces with full context, session replays, and debugging capabilities.

2. Under Connections and click Connect next to Sentry.
3. Log in to your Sentry account and accept the integration into your organization. You will be redirected

### Link your project

After connecting your accounts, you need to link your EAS Project to your Sentry Project:

2. Click Link and select your Sentry Project from the dropdown.

### Usage

With this integration, you can:

- View crash reports directly in your EAS dashboard
- Access Session Replays to see exactly what happened before an error occurred
- Get detailed stack traces with full context
- Navigate seamlessly between EAS and Sentry for debugging

## Learn more about Sentry

Sentry does more than just catch fatal errors, learn more about how to use Sentry from their [JavaScript usage](https://docs.sentry.io/platforms/javascript/) documentation.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/environment-variables/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Environment variables in Expo

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/environment-variables.mdx)

Copy

Learn how to use environment variables in an Expo project.

* * *

Environment variables are key-value pairs configured outside your source code that allow your app to behave differently depending on the environment. For example, you can enable or disable certain features when building a test version of your app, or switch to a different API endpoint when building for production.

The Expo CLI will automatically load environment variables with an `EXPO_PUBLIC_` prefix from .env files for use within your JavaScript code whenever you use the Expo CLI, such as when running `npx expo start` to start your app in local development mode.

## Reading environment variables from .env files

Create a .env file in the root of your project directory and add environment-specific variables on new lines in the form of `EXPO_PUBLIC_[NAME]=VALUE`:

.env

```text-2xs text-default

Now you can use environment variables directly in your source code:

### How variables are loaded

Expo CLI loads .env files according to the [standard .env file resolution](https://github.com/bkeepers/dotenv/blob/c6e583a/README.md#what-other-env-files-can-i-use) and then replaces all references in your code to `process.env.EXPO_PUBLIC_[VARNAME]` with the corresponding value set in the .env files. Code inside node\_modules is not affected for security purposes.

### How to read from environment variables

- Every environment variable must be statically referenced as a property of
`process.env` using JavaScript's dot notation for it to be inlined. For example, the expression
`process.env.EXPO_PUBLIC_KEY` is valid and will be inlined.

- Alternative versions of the expression are not supported. For example,
`process.env['EXPO_PUBLIC_KEY']` or `const {EXPO_PUBLIC_X} = process.env` is invalid and will not
be inlined.

### Using multiple .env files to define separate environments

You can define any of the [standard .env files](https://github.com/bkeepers/dotenv/blob/c6e583a/README.md#what-other-env-files-can-i-use), so it is possible to have separate .env and .env.local, files and they will load according to the standard priority.

You may choose to commit the default .env file or other standard configurations, but generally .env.local files should be added to your .gitignore, because they are used to specify environment configuration specific to your local machine (such as, for example, your network IP address if you need it to make a request against a local server).

.gitignore

#### Environment variables and `NODE_ENV`

We recommend against using `NODE_ENV` to switch between .env files (such as .env.test and .env.production). While it is technically possible ( `NODE_ENV=test npx expo start` will load .env.test) — it may not behave as you would expect. For example, `npx expo export` always forces `NODE_ENV` to `production`, so `NODE_ENV=test npx expo export` will not actually run the command with the `NODE_ENV` set to `test`.

Other tools that build on top of Expo CLI commands will exhibit the same behavior — for example, `eas update` calls into `npx expo export` and, as a result, `NODE_ENV=test eas update` will similarly not run with the `NODE_ENV` set to `test` (it will be `production`). The `NODE_ENV` environment variable is used by many tools in different ways (for example, if you run `NODE_ENV=production npm install` then your `devDependencies` will not be installed) and we have found that for React Native projects, it's best not to overload it further for this use case.

If you use EAS, consider using `eas env:pull` instead. This will swap your .env.local with an environment of your choice, rather than depending on `NODE_ENV`. You can accomplish a similar behavior without EAS by writing a script to overwrite .env.local or .env with the appropriate contents for the environment you wish to work with.

### Disabling environment variables

Environment variables in Expo CLI have two parts and both can be disabled:

1. Expo CLI automatically loads the .env files into the global process. To disable this behavior, set the environment variable `EXPO_NO_DOTENV` to `1` before running any Expo CLI command: `EXPO_NO_DOTENV=1`.
2. Expo's Metro config includes the inline serialization of environment variables in the client JavaScript bundle. To disable this behavior, you can use `EXPO_NO_CLIENT_ENV_VARS=1`.

If you're experiencing issues with environment variables, you can try disabling one or both of these features.

## Environment variables in Expo Application Services

### EAS Build

[EAS Build](https://docs.expo.dev/build/introduction) uses Metro Bundler to build the JavaScript bundle embedded within your app binary, so it will use .env files uploaded with your build job to inline `EXPO_PUBLIC_` variables into your code. EAS Build also lets you define environment variables within build profiles in eas.json and via EAS Secrets. Check out the EAS Build documentation on [environment variables and build secrets](https://docs.expo.dev/build-reference/variables) for more information.

### EAS Update

[EAS Update](https://docs.expo.dev/eas-update/introduction) uses Metro Bundler in your local environment or CI to build your app bundle, so it will use available .env files to inline `EXPO_PUBLIC_` variables into your code. Check out the EAS Update documentation on [environment variables](https://docs.expo.dev/eas-update/environment-variables) for more information.

## Migrating to Expo environment variables

### From react-native-config

Update your .env files to prefix any variables used within your JavaScript code with `EXPO_PUBLIC_`:

Then update your code to use `process.env.EXPO_PUBLIC_[VARNAME]`:

### From babel-plugin-transform-inline-environment-variables

Using a Babel plugin to transform your environment variable references in your code is similar to how Expo environment variables work. Set your variables inside a .env file and update your variable names to use the `EXPO_PUBLIC_` prefix:

Then you can remove the plugin from your [Babel config](https://docs.expo.dev/versions/latest/config/babel):

babel.config.js

After updating your Babel config file, be sure to clear your cache with `npx expo start --clear`.

### From direnv

Move any environment variables used in your JavaScript from their .envrc file to a .env file and prefix it with `EXPO_PUBLIC_`.

Previously with `direnv`, you would need to use a [dynamic app config](https://docs.expo.dev/versions/latest/config/app#app-config) that reads from [`process.env`](https://nodejs.org/dist/latest/docs/api/process.html#process_process_env) to set environment variables on the `extra` field so they can be used in your JavaScript code via [`expo-constants`](https://docs.expo.dev/versions/latest/sdk/constants). Move those references directly into your code, adding the `EXPO_PUBLIC_` prefix:

## Security considerations

Never store sensitive secrets in environment variables that are prefixed with `EXPO_PUBLIC_`. When an end-user runs your app, they have access to all of the code and embedded environment variables in your app. Read more about [storing sensitive info](https://reactnative.dev/docs/security#storing-sensitive-info).

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/facebook-authentication/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using Facebook authentication

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/facebook-authentication.mdx)

Copy

A guide on using react-native-fbsdk-next library to integrate Facebook authentication in your Expo project.

* * *

The [`react-native-fbsdk-next`](https://github.com/thebergamo/react-native-fbsdk-next/) library provides a wrapper around Facebook's Android and iOS SDKs. It allows integrating Facebook authentication into your Expo project and provide access to native components.

This guide provides additional information on configuring the library with Expo for Android.

## Prerequisites

The `react-native-fbsdk-next` library can't be used in the Expo Go app because it requires custom native code. Learn more about [adding custom native code to your app](https://docs.expo.dev/workflow/customizing).

## Installation

See `react-native-fbsdk-next` documentation for instructions on how to install and configure the library:

[React Native FBSDK Next: Expo installation instructions](https://github.com/thebergamo/react-native-fbsdk-next/#expo-installation)

## Configuration for Android

Adding Android as a platform in your Facebook project requires you to have your app approved by Google Play Store so that it has a valid Play Store URL, and the [`package`](https://docs.expo.dev/versions/latest/config/app#package) name associated with your app. Otherwise, you'll run into the following error:

See the following guides for more information on how to build your project for app stores:

[Build your project for app stores](https://docs.expo.dev/deploy/build-project) [Manually upload Android app for the first time](https://expo.fyi/first-android-submission)

Once you have uploaded the app to the Play Store you can submit your app review. When it is approved the Facebook project will be able to access it at a Play Store URL.

- You can find the Package name in your [app config](https://docs.expo.dev/versions/latest/config/app) under the [`android.package`](https://docs.expo.dev/versions/latest/config/app#package) field.
- The Class name is `MainActivity` by default, and you can use `package.MainActivity` where `package` is the `android.package` in your project's app config. For example, `com.myapp.example.MainActivity`, where `com.myapp.example` is the `package` name of your app.
- Then, click Save changes to save the configuration.

Now, you can use your Facebook project for development or release builds and production apps.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-firebase/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using Firebase

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-firebase.mdx)

Copy

A guide on getting started and using Firebase JS SDK and React Native Firebase library.

* * *

[Firebase](https://firebase.google.com/) is a Backend-as-a-Service (BaaS) app development platform that provides hosted backend services such as real-time database, cloud storage, authentication, crash reporting, analytics, and so on.
It is built on Google's infrastructure and scales automatically.

There are two different ways you can use Firebase in your projects:

- Using [Firebase JS SDK](https://docs.expo.dev/guides/using-firebase#using-firebase-js-sdk)
- Using [React Native Firebase](https://docs.expo.dev/guides/using-firebase#using-react-native-firebase)

React Native supports both the JS SDK and the native SDK. The following sections will guide you through when to use which SDK and all the configuration steps required to use Firebase in your Expo projects.

## Prerequisites

Before proceeding, make sure that you have created a new Firebase project or have an existing one using the [Firebase console](https://console.firebase.google.com/).

## Using Firebase JS SDK

The [Firebase JS SDK](https://firebase.google.com/docs/web/setup) is a JavaScript library that allows you to interact with Firebase services in your project.
It supports services such as [Authentication](https://firebase.google.com/docs/auth), [Firestore](https://firebase.google.com/docs/firestore), [Realtime Database](https://firebase.google.com/docs/database), and [Storage](https://firebase.google.com/docs/storage) in a React Native app.

### When to use Firebase JS SDK

You can consider using the Firebase JS SDK when you:

- Want to use Firebase services such as Authentication, Firestore, Realtime Database, and Storage in your app and want to develop your app with [Expo Go](https://docs.expo.dev/get-started/set-up-your-environment).
- Want a quick start with Firebase services.
- Want to create a universal app for Android, iOS, and the web.

#### Caveats

Firebase JS SDK does not support all services for mobile apps. Some of these services are Analytics, Dynamic Links and Crashlytics. See the [React Native Firebase](https://docs.expo.dev/guides/using-firebase#using-react-native-firebase) section if you want to use these services.

1

#### Install the SDK

After you have created your [Expo project](https://docs.expo.dev/get-started/create-a-project), you can install the Firebase JS SDK using the following command:

Terminal

`- ` `npx expo install firebase`

2

#### Initialize the SDK in your project

To initialize the Firebase instance in your Expo project, you must create a config object and pass it to the `initializeApp()` method imported from the `firebase/app` module.

The config object requires an API key and other unique identifiers. To obtain these values, you will have to register a web app in your Firebase project. You can find these instructions in the [Firebase documentation](https://firebase.google.com/docs/web/setup#register-app).

After you have the API key and other identifiers, you can paste the following code snippet by creating a new firebaseConfig.js file in your project's root directory or any other directory where you keep the configuration files.

firebaseConfig.js

```text-2xs text-default

You do not have to install other plugins or configurations to use Firebase JS SDK.

### Next steps

[Authentication\\
\\
For more information on how to use Authentication in your project, see Firebase documentation.](https://firebase.google.com/docs/auth/web/start) [Firestore\\
\\
For more information on how to use Firestore database in your project, see Firebase documentation.](https://firebase.google.com/docs/firestore/quickstart) [Realtime Database\\
\\
For more information on how to use Realtime Database in your project, see Firebase documentation.](https://firebase.google.com/docs/database) [Storage\\
\\
For more information on how to use Storage, see Firebase documentation.](https://firebase.google.com/docs/storage/web/start) [Firebase Storage example\\
\\
Learn how to use Firebase Storage in an Expo project with our example.](https://github.com/expo/examples/tree/master/with-firebase-storage-upload) [Managing API keys for Firebase projects\\
\\
For more information about managing API Key and unique identifiers in a Firebase project.](https://firebase.google.com/docs/projects/api-keys) [Migrate from Expo Firebase packages to React Native Firebase\\
\\
For more information on migrating from expo-firebase-analytics or expo-firebase-recaptcha packages to React Native Firebase.](https://expo.fyi/firebase-migration-guide)

## Using React Native Firebase

[React Native Firebase](https://rnfirebase.io/) provides access to native code by wrapping the native SDKs for Android and iOS into a JavaScript API.
Each Firebase service is available as a module that can be added as a dependency to your project. For example, the `auth` module provides access to the Firebase Authentication service.

### When to use React Native Firebase

You can consider using React Native Firebase when:

- Your app requires access to Firebase services not supported by the Firebase JS SDK, such as [Dynamic Links](https://rnfirebase.io/dynamic-links/usage), [Crashlytics](https://rnfirebase.io/crashlytics/usage), and so on.
For more information on the additional capabilities offered by the native SDK's, see [React Native Firebase documentation](https://rnfirebase.io/faqs-and-tips#why-react-native-firebase-over-firebase-js-sdk).
- You want to use native SDKs in your app.
- You have a bare React Native app with React Native Firebase already configured but are migrating to use Expo SDK.
- You want to use [Firebase Analytics](https://rnfirebase.io/analytics/usage) in your app.

Migrating from Expo Firebase packages? [Permalink](https://docs.expo.dev/guides/using-firebase/#migrating-from-expo-firebase-packages)

If your project has been previously using `expo-firebase-analytics` and `expo-firebase-recaptcha` packages, you can migrate to the React Native Firebase library. For more information, see [Firebase migration guide](https://expo.fyi/firebase-migration-guide).

#### Caveats

React Native Firebase requires [custom native code and cannot be used with Expo Go](https://docs.expo.dev/workflow/customizing).

### Install and initialize React Native Firebase

#### Install expo-dev-client

Since React Native Firebase requires custom native code, you need to install the `expo-dev-client` library in your project.
It allows configuring any native code required by React Native Firebase using [Config plugins](https://docs.expo.dev/config-plugins/introduction) without writing native code yourself.

To install [`expo-dev-client`](https://docs.expo.dev/development/getting-started#installing--expo-dev-client--in-your-project), run the following command in your project:

`- ` `npx expo install expo-dev-client`

#### Install React Native Firebase

To use React Native Firebase, it is necessary to install the `@react-native-firebase/app` module. This module provides the core functionality for all other modules.
It also adds custom native code in your project using a config plugin. You can install it using the following command:

`- ` `npx expo install @react-native-firebase/app`

At this point, you must follow the instructions from [React Native Firebase documentation](https://rnfirebase.io/#managed-workflow) as it covers all the steps required to configure your project with the library.

Once you have configured the React Native Firebase library in your project, come , you can create and install a development build on your devices. You do not need to run the project locally before creating a development build.
For more information on creating a development build, see the section on [installing a development build](https://docs.expo.dev/develop/development-builds/create-a-build).

Run project locally? [Permalink](https://docs.expo.dev/guides/using-firebase/#run-project-locally)

If you want to run the project locally, you need both Android Studio and Xcode installed and configured on your machine. See [Local app development](https://docs.expo.dev/guides/local-app-development) guide for more information.

If a particular React Native Firebase module requires custom native configuration steps, you must add it as a `plugin` to [app config](https://docs.expo.dev/workflow/configuration) file. Then, to run the project locally, run the `npx expo prebuild --clean` command to apply the native changes before the `npx expo run` commands.

### Next steps

After configuring React Native Firebase library, you can use any module it provides in your Expo project.

[React Native Firebase documentation\\
\\
For more information to install and use a certain module from React Native Firebase, we recommend you to check their documentation.](https://rnfirebase.io/)

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/progressive-web-apps/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Progressive web apps

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/progressive-web-apps.mdx)

Copy

Learn how to add progressive web app support to Expo websites.

* * *

A progressive web app (or PWA for short) is a website that can be installed on the user's device and used offline. We recommend building native apps whenever possible as they have the best offline support, but PWAs are a great option for desktop users.

## Favicons

Expo CLI automatically generates the favicon.ico file based on the `web.favicon` field in the app.json.

```text-2xs text-default

Alternatively, you can create a favicon.ico file in the public directory to manually specify the icon.

## Manifest file

PWAs can be [configured with a manifest file](https://developer.mozilla.org/en-US/docs/Web/Manifest) that describes the app's name, icon, and other metadata.

1

Create a PWA manifest in public/manifest.json:

2

The files logo192.png and logo512.png are the icons that will be used when the app is installed on the user's device. These should be added to the public directory too.

`public`

`manifest.json` `PWA Manifest`

`logo192.png` `192x192 icon`

`logo512.png` `512x512 icon`

3

Now link the manifest in your HTML file. The method here depends on the output mode of your website (indicated in `web.output` in the app.json––defaults to `single`).

single

static & server

If you're using a single-page app, you can link the manifest in your HTML file by first creating a template HTML in public/index.html:

Terminal

`- ` `npx expo customize public/index.html`

app/+html.tsx

## Service workers

For example, here's a possible flow for setting up Workbox:

Create a new project with the following command:

`- ` `npm create expo -t tabs my-app`

`- ` `cd my-app`

Now register the service worker in the HTML file. The method here depends on the output mode of your website (indicated in `web.output` in the app.json––defaults to `single`).

Next add a service worker registration script to the root index.html.

First create a template HTML in public/index.html if one does not already exist:

Next, create a root HTML file for the app and add the service worker registration script:

Now build the website before running the wizard:

`- ` `npx expo export -p web`

4

Run the wizard command, select `dist` as the root of the app, and the defaults for everything else:

`- ` `npx workbox-cli wizard`

`? What is the root of your web app (that is which directory do you deploy)? dist/` `? Which file types would you like to precache? js, html, ttf, ico, json` `? Where would you like your service worker file to be saved? dist/sw.js` `? Where would you like to save these configuration options? workbox-config.js` `? Does your web app manifest include search parameter(s) in the 'start_url', other than 'utm_' or 'fbclid' (like '?source=pwa')? No`

5

Finally, run `npx workbox-cli generateSW workbox-config.js` to generate the service worker config.

Going forward, you can add a build script in package.json to run both scripts in the correct order:

package.json

6

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/configuring-js-engines/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Configure JS engines

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/configuring-js-engines.mdx)

Copy

A guide on configuring JS engines for both Android and iOS in an Expo project.

* * *

JavaScript engines execute your application code and provide various features such as memory management, optimization, and error handling. By default, Expo projects use [Hermes](https://hermesengine.dev/) as the JavaScript engine (in SDK 47 and lower, the default was [JavaScriptCore](https://developer.apple.com/documentation/javascriptcore)). Switching to other engines, such as JSC or V8, for Android and iOS platforms is possible. However, not for the web because the JavaScript engine is included in the web browser.

We recommend Hermes because it is purpose built and optimized for React Native apps, and it has the best debugging experience. If you are familiar with the tradeoffs of different JavaScript engines and would like to change away from Hermes, the [`jsEngine`](https://docs.expo.dev/versions/latest/config/app#jsengine) field inside [app config](https://docs.expo.dev/workflow/configuration) allows you to specify the JavaScript engine for your app. The default value is `hermes`.

If you want to use JSC instead, set the `jsEngine` field in the app config:

app.json

```text-2xs text-default

Usage in bare React Native projects [Permalink](https://docs.expo.dev/guides/configuring-js-engines/#usage-in-bare-react-native-projects)

To change the JavaScript engine in a bare React Native project, update the `expo.jsEngine` value in android/gradle.properties and ios/Podfile.properties.json.

It's important to highlight that changing the JS engine will require you to recompile development builds with `eas build` to work properly.

## Using the V8 engine

To use the V8 engine, you need to install [`react-native-v8`](https://github.com/Kudo/react-native-v8), an opt-in package that adds V8 runtime support for React Native. You can install it by running the following command:

Terminal

`- ` `npx expo install react-native-v8 v8-android-jit`

Make sure to remove the `jsEngine` field from the app config.

Usage with Expo Prebuild [Permalink](https://docs.expo.dev/guides/configuring-js-engines/#usage-with-expo-prebuild)

Run `npx expo prebuild -p android --clean` after the installation to prebuild again.

## Switch JavaScript engine on a specific platform

To use a different engine on one specific platform, you can set the `"jsEngine"` value at the top level and then override it with a different value under the `"android"` or `"ios"` key. The value specified for the platform will take precedence over the common field.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/dom-components/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using React DOM in Expo native apps

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/dom-components.mdx)

Copy

Learn about rendering React DOM components in Expo native apps using the 'use dom' directive.

Expo offers a novel approach to work with modern web code directly in a native app via the `'use dom'` directive. This enables incremental migration for an entire website to a universal app by moving on a per-component basis.

## Prerequisites

Your project must use Expo CLI and extend the Expo Metro Config [Permalink](https://docs.expo.dev/guides/dom-components/#your-project-must-use-expo-cli-and)

If you already run your project with `npx expo [command]` (for example, if you created it with `npx create-expo-app`), then you're all set, and you can skip this step.

If you don't have the `expo` package in your project yet, then install it by running the command below and [opt in to using Expo CLI and Metro Config](https://docs.expo.dev/bare/installing-expo-modules#configure-expo-cli-for-bundling-on-android-and-ios):

Terminal

`- ` `npx install-expo-modules@latest`

If the command fails, refer to the [Installing Expo modules](https://docs.expo.dev/bare/installing-expo-modules#manual-installation) guide.

Expo Metro Runtime, React DOM, and React Native Web [Permalink](https://docs.expo.dev/guides/dom-components/#expo-metro-runtime-react-dom-and-react)

If you are using Expo Router and Expo Web, you can skip this step. Otherwise, install the following packages:

`- ` `npx expo install @expo/metro-runtime react-dom react-native-web`

## Usage

Install `react-native-webview` in your project:

`- ` `npx expo install react-native-webview`

To render a React component to the DOM, add the `'use dom'` directive to the top of the web component file:

my-component.tsx (web)

```text-2xs text-default

Inside the native component file, import the web component to use it:

App.tsx (native)

## Features

- Shared bundler config across web, native, and DOM components.
- React, TypeScript, CSS, and all other Metro features are enabled in DOM components.
- Logging in the terminal and Safari/Chrome debugging.
- Fast Refresh and HMR.
- Embedded exports for offline support.
- Assets are unified across web and native.
- DOM component bundles can be introspected in [Expo Atlas](https://docs.expo.dev/guides/analyzing-bundles#analyzing-bundle-size-with-atlas) for debugging.
- Access to all web functionality without needing a native rebuild.
- Runtime error overlay in development.
- Supports Expo Go.

## WebView props

To pass props to the underlying native WebView, use the `dom` prop on the component. This prop is built into every DOM component and accepts an object with any [`WebView` props](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md) that you would like to change.

On your DOM component, add the `dom` prop so it is recognized in TypeScript:

## Marshalled props

You can send data to the DOM component through serializable props ( `number`, `string`, `boolean`, `null`, `undefined`, `Array`, `Object`). For example, inside a native component file, you can pass a prop to the DOM component:

Inside the web component file, you can receive the prop as shown in the example below:

Props are sent over an asynchronous bridge so they are not updated synchronously. They are passed as props to the React root component, which means they re-render the entire React tree.

## Native actions

You can send type-safe native functions to DOM components by passing asynchronous functions as top-level props to the DOM component:

Native actions are always asynchronous and accept only serializable arguments (meaning no functions) because the data is sent over a bridge to the DOM component's JavaScript engine.

Native actions can return serializable data to the DOM component, which is useful for getting data back from the native side.

Think of these functions like React Server Functions, but instead of residing on the server, they live locally in the native app and communicate with the DOM component. This approach provides a powerful way to add truly native functionality to your DOM components.

You can use the `useDOMImperativeHandle` hook inside a DOM component to accept ref calls from the native side. This hook is similar to React's [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle) hook, but it does not need a ref object to be passed to it.

SDK 53 and above

SDK 52 and below

Expo SDK 53 and above use React 19. This means that the `ref` prop is passed to the component as a prop, and you can use it directly in the component.

In Expo SDK 52 and below (React 18), use the legacy `forwardRef` function to access the `ref` handle.

React is meant to have a unilateral data flow, so the concept of using callbacks to go back up the tree is not idiomatic. Expect the behavior to be flakey and possibly phased out in the future with newer versions of React. The preferred way to send data back up the tree is to use native actions, which update the state and then pass it function correctly. For example, the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) is only available in secure contexts. A secure context means that remote resources must be served over HTTPS. [Learn more about features restricted to secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts/features_restricted_to_secure_contexts).

To ensure your DOM components run within a secure context, follow these guidelines:

- Release builds: DOM components served using the `file://` scheme are provided a secure context by default.
- Debug builds: When using development servers (which default to the `http:// ` protocol), you can use [tunneling](https://docs.expo.dev/more/expo-cli#tunneling) to serve DOM components over HTTPS.

Example commands to tunnel DOM components over HTTPS [Permalink](https://docs.expo.dev/guides/dom-components/#example-commands-to-tunnel-dom-components-over)

`# Install expo-dev-client to enable connection to the remote development server:`

`- ` `npx expo install expo-dev-client`

`# Run the app on Android:`

`- ` `npx expo run:android`

`# Press Ctrl + C to stop the server`

`- ` `npx expo start --tunnel -d -a`

`# Run the app on iOS:`

`- ` `npx expo run:ios`

`- ` `npx expo start --tunnel -d -i`

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/authentication/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Authentication with OAuth or OpenID providers

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/authentication.mdx)

Copy

Learn how to utilize the expo-auth-session library to implement authentication with OAuth or OpenID providers.

* * *

[`expo-auth-session`](https://docs.expo.dev/versions/latest/sdk/auth-session) provides a unified API for implementing OAuth and OpenID Connect providers on Android, iOS, and web. This guide will show you how to use the `AuthSession` API using a few examples.

## Rules for all authentication providers

When using the `AuthSession` API, the following rules apply to all authentication providers:

- Use `WebBrowser.maybeCompleteAuthSession()` to dismiss the web popup. If you forget to add this then the popup window will not close.
- Create redirects with `AuthSession.makeRedirectUri()` this does a lot of the heavy lifting involved with universal platform support. Behind the scenes, it uses `expo-linking`.
- Build requests using `AuthSession.useAuthRequest()`, the hook allows for async setup which means mobile browsers won't block the authentication.
- Be sure to disable the prompt until `request` is defined.
- You can only invoke `promptAsync` in user interaction on the web.
- Expo Go cannot be used for local development and testing of OAuth or OpenID Connect-enabled apps due to the inability to customize your app scheme. You can instead use a [Development Build](https://docs.expo.dev/develop/development-builds/introduction), which enables an Expo Go-like development experience and supports OAuth redirects standard for secure authentication and authorization. In the authorization code grant, the identity provider returns a one-time code. This code is then exchanged for the user's access token.

Since [your client application code is not a secure place to store secrets](https://reactnative.dev/docs/security#storing-sensitive-info), it is necessary to exchange the authorization code in a server such as with [API routes](https://docs.expo.dev/router/reference/api-routes) or [React Server Components](https://docs.expo.dev/guides/server-components). This will allow you to securely store and use a client secret to access the provider's token endpoint.

## Examples

The following examples show how to use the `AuthSession` API to authenticate with a few popular providers.

### GitHub

[Create GitHub App](https://github.com/settings/developers)

| Website | Provider | PKCE | Auto Discovery |
| --- | --- | --- | --- |
| [Get Your Config](https://github.com/settings/developers) | OAuth 2.0 | Supported | Not Available |

- Provider only allows one redirect URI per app. You'll need an individual app for every method you want to use:
- Standalone / development build: `com.your.app://*`
- Web: `https://yourwebsite.com/*`
- The `redirectUri` requires two slashes ( `://`).
- `revocationEndpoint` is dynamic and requires your `config.clientId`.

GitHub Auth Example

```text-2xs text-default

### Okta

[Create Okta App](https://developer.okta.com/signup)

| Website | Provider | PKCE | Auto Discovery |
| --- | --- | --- | --- |

- You cannot define a custom `redirectUri`, Okta will provide you with one.

Okta Auth Example

## Redirect URI patterns

Here are a few examples of some common redirect URI patterns you may end up using.

In some cases there will be anywhere between 1 to 3 slashes ( `/`).

- Environment:
- Bare workflow
- `npx expo prebuild`
- Standalone builds in the App or Play Store or testing locally
- Android: `eas build` or `npx expo run:android`
- iOS: `eas build` or `npx expo run:ios`

- This link can often be created automatically but we recommend you define the `scheme` property at least. The entire URL can be overridden in apps by passing the `native` property. Often this will be used for providers like Google or Okta which require you to use a custom native URI redirect. You can add, list, and open URI schemes using `npx uri-scheme`.
- If you change the `expo.scheme` after ejecting then you'll need to use the `expo apply` command to apply the changes to your native project, then rebuild them ( `yarn ios`, `yarn android`).
- Usage: `promptAsync({ redirectUri })`

## Improving user experience

The "login flow" is an important thing to get right, in a lot of cases this is where the user will _commit_ to using your app again. A bad experience can cause users to give up on your app before they've really gotten to use it.

Here are a few tips you can use to make authentication quick, easy, and secure for your users:

### Warming the browser

On Android you can optionally warm up the web browser before it's used. This allows the browser app to pre-initialize itself in the background. Doing this can significantly speed up prompting the user for authentication.

### Implicit login

Because there was no secure way to do this to store client secrets in your app bundle, historically, many providers have offered an "Implicit flow" which enables you to request an access token without the client secret. This is no longer recommended due to inherent security risks, including the risk of access token injection. Instead, most providers now support the authorization code with PKCE (Proof Key for Code Exchange) extension to securely exchange an authorization code for an access token within your client app code. Learn more about [transitioning from Implicit flow to authorization code with PKCE](https://oauth.net/2/grant-types/implicit/).

`expo-auth-session` still supports Implicit flow for legacy code purposes. Below is an example implementation of the Implicit flow.

### Storing data

On native platforms such as Android and iOS, you can secure things like access tokens locally using a library called [`expo-secure-store`](https://docs.expo.dev/versions/latest/sdk/securestore) (This is different to `AsyncStorage` which is not secure). It provides native access to encrypted [`SharedPreferences`](https://developer.android.com/training/basics/data-storage/shared-preferences.html) on Android and [keychain services](https://developer.apple.com/documentation/security/keychain_services) on iOS and . There is no web equivalent to this functionality.

You can store your authentication results and rehydrate them later to avoid having to prompt the user to login again.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/monorepos/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Work with monorepos

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/monorepos.mdx)

Copy

Learn about setting up Expo projects in a monorepo with workspaces.

* * *

Automatic Configuration (Migrating to SDK 52+) [Permalink](https://docs.expo.dev/guides/monorepos/#automatic-configuration-migrating-to-sdk-52)

Since SDK 52, Expo configures Metro automatically for monorepos. You don't have to manually configure Metro when using monorepos if you use [`expo/metro-config`](https://docs.expo.dev/guides/customizing-metro).

If you're migrating to an Expo SDK version after 52 and have a metro.config.js that manually modifies one of the following properties, delete these from your configuration:

- `watchFolders`
- `resolver.nodeModulesPath`
- `resolver.extraNodeModules`
- `resolver.disableHierarchicalLookup`

After deleting these options, you'll need to run Expo with `npx expo start --clear` once to erase the outdated Metro cache. If your app continues working as expected afterwards, it's a regular Node monorepo and won't need any special configuration going forward.

Manual Configuration (Before SDK 52) [Permalink](https://docs.expo.dev/guides/monorepos/#manual-configuration-before-sdk-52)

Since SDK 52, Expo's Metro config has monorepo support for Bun, npm, pnpm and Yarn and configures itself automatically. You don't have to manually configure Metro when using monorepos if you use the config from [`expo/metro-config`](https://docs.expo.dev/guides/customizing-metro). If that's the case, you don't need to manually configure monorepo support.

Before SDK 52, to configure a monorepo with Metro manually, there were two manual changes:

1. Metro had to be configured to watch code within the monorepo manually (for example, not just apps/cool-app.)
2. Metro's resolution had to be adjusted to find packages in other workspaces and multiple `node_modules` folders (for example, apps/cool-app/node\_modules or node\_modules.)

The configuration was adjusted by [creating a metro.config.js](https://docs.expo.dev/guides/customizing-metro#customizing) with the following content:

metro.config.js

```text-2xs text-default

## Setting up a monorepo

In a monorepo, your app will typically be a in sub-directory of your repository and your package manager is configured to allow you to add dependencies to other packages from within your monorepo.
For example, a basic structure of a monorepo containing Expo apps may look like this:

- apps: Contains multiple projects, including Expo apps.
- packages: Contains different packages used by apps.
- package.json: Root package file.

All monorepos should have a "root" package.json file. It is the main configuration for monorepos and may contain tools installed for all projects in the repository. Depending on which package manager you're using, the steps for setting up workspaces might differ, but for [Bun](https://bun.sh/docs/install/workspaces), [npm](https://docs.npmjs.com/cli/using-npm/workspaces), and [Yarn](https://yarnpkg.com/features/workspaces), a `workspaces` property should be added to the root package.json file that specifies [glob patterns](https://classic.yarnpkg.com/lang/en/docs/workspaces/#toc-tips-tricks) for all workspaces in your monorepo:

package.json

For [pnpm](https://pnpm.io/workspaces), you'll have to create a [pnpm-workspace.yaml](https://pnpm.io/pnpm-workspace_yaml) instead:

pnpm-workspace.yaml

### Create your first app

Now that you have the basic monorepo structure set up, add your first app.

Before you create your app, you have to create the apps directory. This directory contains all separate apps or websites that belong to this monorepo. Inside this apps directory, you can create a sub-directory that contains the Expo app.

npm

Yarn

pnpm

Bun

Terminal

`- ` `npx create-expo-app@latest apps/cool-app`

`- ` `yarn create expo-app apps/cool-app`

`- ` `pnpm create expo-app apps/cool-app`

After copying or creating the first app, install your dependencies with your package manager from the root directory of your monorepo to check for common warnings.

### Create a package

Monorepos can help us group code in a single repository. That includes apps but also separate packages. They also don't need to be published. The [Expo repository](https://github.com/expo/expo) uses this as well. All the Expo SDK packages live inside the [packages](https://github.com/expo/expo/tree/main/packages) directory in our repo. It helps us test the code inside one of our [apps](https://github.com/expo/expo/tree/main/apps/native-component-list) directory before we publish them.

Let's go and [pnpm](https://pnpm.io/settings#nodelinker) have first-class support for isolated installs. For pnpm, this is the default installation strategy unless it's disabled.

With isolated dependencies, package managers don't hoist packages from nested `node_modules` directories into higher ones. Instead, they create a central directory that contains your Node modules and create links to this directory. This dependency structure enforces that packages may only access their explicitly declared dependencies. This is a much stricter installation strategy than the traditional hoisted installation strategy, which are npm's and Yarn's default, to install dependencies in a flattened structure.

A side-effect of hoisted installations is that you can accidentally depend on Node modules you haven't specified in your own package.json's `dependencies` or `peerDependencies`. Instead, many more dependencies that other packages rely on are hoisted and become accessible to you. This can cause non-deterministic behavior, and allow you to have broken dependency chains, which are more fragile and can cause resolution errors when updating or upgrading packages. This is especially common in monorepos.

Starting with SDK 54, Expo supports isolated dependencies. Unfortunately, not all packages you install will work and some React Native libraries may cause build or resolution errors when used with isolated dependencies. If you encounter issues with isolated installations with [pnpm](https://pnpm.io/settings#nodelinker), switch to the hoisted installation strategy by changing the `node-linker` setting in an .npmrc file in the root of your repository:

.npmrc

### Duplicate native packages within monorepos

Expo has improved support for more complete node\_modules patterns, such as isolated modules. Unfortunately, if your app contains duplicate dependencies, issues may still occur:

- Duplicate React Native versions in a single monorepo are not supported
- Duplicate React versions in a single app will cause runtime errors
- Duplicate versions of Turbo and Expo modules may cause runtime or build errors

You can check if your monorepo has multiple versions of a package, for example, `react-native`, and why they're installed through the package manager you use.

`- ` `npm why react-native`

`- ` `yarn why react-native`

`- ` `pnpm why --depth=10 react-native`

`- ` `bun pm why react-native`

The output of these commands will be very different from one package manager to another, but you can spot duplicate packages in any of their outputs by looking for multiple versions of the package, for example `react-native@0.79.5` and `react-native@0.81.0`.
npm,

#### Adding dependency resolutions for peer dependencies

If the duplicate dependency is not resolvable by you changing your dependencies, you may have to add a resolution. For example, not all packages have updated their peerDependencies to support React 19. To work around this, you can create a resolution to force a single version of `react` to be installed.

For [npm](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides), you have to use a property named `overrides` rather than `resolutions`.

This is an experimental feature starting in SDK 52 and above. The process will be more automated and have better support in future versions.

Often, duplicate dependencies won't cause any problems. However, native modules should never be duplicated, because only one version of a native module can be compiled for an app build at a time. Unlike JavaScript dependencies, native builds cannot contain two conflicting versions of a single native module.

From SDK 54, you can set set `experiments.autolinkingModuleResolution` to `true` in your app.json to apply autolinking to Expo CLI and Metro bundler automatically. This will force dependencies that Metro resolves to match the native modules that [autolinking](https://docs.expo.dev/modules/autolinking) links for your native builds.

### Script '...' does not exist

React Native uses packages to ship both JavaScript and native files. These native files also need to be linked, like the [react-native/react.Gradle](https://github.com/facebook/react-native/blob/v0.70.6/react.gradle) file from android/app/build.Gradle. Usually, this path is hardcoded to something like:

Android ( [source](https://github.com/facebook/react-native/blob/e918362be3cb03ae9dee3b8d50a240c599f6723f/template/android/app/build.gradle#L84))

iOS ( [source](https://github.com/facebook/react-native/blob/e918362be3cb03ae9dee3b8d50a240c599f6723f/template/ios/Podfile#L1))

Unfortunately, this path can be different in monorepos because of [hoisting](https://classic.yarnpkg.com/blog/2018/02/15/nohoist/). It also doesn't use the [Node module resolution](https://nodejs.org/api/modules.html#all-together). You can avoid this issue by using Node to find the location of the package instead of hardcoding this:

Android ( [source](https://github.com/expo/expo/blob/6877c1f5cdca62b395b0d5f49d87f2f3dbb50bec/templates/expo-template-bare-minimum/android/app/build.gradle#L87))

iOS ( [source](https://github.com/expo/expo/blob/61cbd9a5092af319b44c319f7d51e4093210e81b/templates/expo-template-bare-minimum/ios/Podfile#L2))

In the snippets above, you can see that we use Node's own [`require.resolve()`](https://nodejs.org/api/modules.html#requireresolverequest-options) method to find the package location. We explicitly refer to `package.json` because we want to find the root location of the package, not the location of the entry point. And with that root location, we can resolve to the expected relative path within the package. [Learn more about these references here](https://github.com/expo/expo/blob/4633ab2364e30ea87ca2da968f3adaf5cdde9d8b/packages/expo-modules-core/README.mdx#importing-native-dependencies---autolinking).

All Expo SDK modules and templates have these dynamic references and work with monorepos. However, occasionally, you might run into packages that still use the hardcoded path. You can manually edit it with [`patch-package`](https://github.com/ds300/patch-package#readme) or mention this to the package maintainers.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/store-assets/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Create app store assets

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/store-assets.mdx)

Copy

Learn how to create screenshots and previews for your app's store pages.

* * *

Before submitting your app to the Google Play Store and Apple App Store, you need to provide some assets for your store listing page. The goal of these images and videos is to give your prospective users an idea of what your app experience is going to be like.

You will need to upload app screenshots for both app stores. Even though they are called "app screenshots" on both stores, they _do_ have to include accurate visuals of your app. There is no rule citing that these images have to be screenshots taken on specific devices.

Both app stores have requirements on image format and size. However, within these restrictions, you can be creative. For example, a common approach is to design the assets using a design tool such as Figma and incorporate actual app screenshots (or designs) with supplementary messaging.

## Different approaches for creating "screenshots"

There are three commonly used approaches to creating your store screenshots. You can choose whichever approach works best for your app's needs and resources.

### Option 1: actual screenshots

The most straightforward option — open up your app on a real device and take screenshots.

Pros: Straightforward to do. Most accurate representation of your app.

Cons: Need to load the app on different devices for a full range of screenshots.

### Option 2: screenshots within a design

The majority of apps use this approach. It involves taking screenshots of the app (or in some cases, using existing designs instead of actual screenshots) and embedding them in the store assets along with appropriate messaging.

Pros: Allows to convey additional messaging within the assets.

Cons: The assets need to be created using a design program.

### Option 3: make it fancy

In this option, on the app store pages, you can incorporate elements of your app design and creative messaging to highlight your product.

Pros: You can make your store page creative and fun.

Cons: Need an experienced designer to create and maintain the assets.

## Google Play Store Asset Requirements

Google has specific requirements for the store asset format and dimensions, which are different from Apple's. For the most up-to-date specifications, see [official documentation](https://support.google.com/googleplay/android-developer/answer/9866151) for detailed requirements for your Google Play Store assets.

[Store assets Figma template\\
\\
See our template for a summary of the minimum asset requirements.](https://www.figma.com/community/file/1352686667495694112)

### App icon

Unlike on the Apple App Store, where the app icon is always taken automatically from the app bundle, on the Google Play Store, you must also upload a separate App Icon for your store listing.

### Feature graphic

A feature graphic must be provided to publish your Store Listing. It is a banner that is displayed at the top of your store listing page.

### Screenshots

You need to upload at least four screenshots to publish your app.

### Video (optional)

You can add one preview video to your Store Listing. The video needs to be uploaded to YouTube, and you can add it by entering a YouTube URL in the preview video field.

## iOS App Store Asset Requirements

For the iOS App Store, you can upload screenshots (images) and previews (videos). For each, Apple requires specific widths and heights. Make sure to reference the [Screenshot specifications from Apple](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/) for the exact sizing. Even a single pixel-off will mean you cannot submit the images.

### Screenshots

At a minimum, Apple requires you to upload screenshots for iPhone with the dynamic island (6.9 inch). You can optionally upload additional screenshots for other screen sizes. If specific screenshots are not provided, scaled down screenshots from the closest uploaded size will be used instead.

If your app runs on iPad, you must also provide one set of iPad screenshots (13 inch).

You can upload up to ten screenshots per localization. If your app is available in multiple languages and your screenshots include text, you should upload screenshots with the appropriate language for each localization.

Screenshots can be portrait or landscape.

### Preview (optional)

You can include An app preview video to demonstrate how your app works. You can add up to three app previews for each screen size.

See [App Preview Specifications](https://developer.apple.com/help/app-store-connect/reference/app-preview-specifications/) from Apple documentation for a summary of video size and format.

## Bare minimum

Below is the bare minimum needed to publish your apps.

### Play Store - Android

| Type | Amount | Dimensions | Requirements |
| --- | --- | --- | --- |
| App Icon | 1 | 512 × 512 | 32-bit PNG (with alpha); Maximum file size: 1024 KB |
| Feature Graphic | 1 | 1024 × 500 | JPEG or 24-bit PNG (no alpha) |

### App Store - iPhone

| Type | Amount | Dimensions (choose one) | Requirements |
| --- | --- | --- | --- |

### App Store - iPad

If your app also runs on an iPad, you need to supply additional screenshots.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-vexo/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using Vexo

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-vexo.mdx)

Copy

A guide on installing and configuring Vexo for real-time user analytics.

* * *

[Vexo](https://www.vexo.co/) provides real-time user analytics for your Expo application, helping you understand how users interact with your app, identify friction points, and improve engagement.

With a two-line integration, Vexo starts collecting data automatically, giving you actionable insights to optimize your app's user experience. If needed, you can also create custom events.

## Features

1. Complete Dashboard
- Active Users
- Session Time
- Downloads
- OS Distribution
- Version Adoption
- Geographic Insights
- Popular Screens
2. Session Replays
- Watch real user sessions to understand their interactions.
3. Heatmaps
- Identify the most engaged areas of your app.
4. Funnels
- Analyze user flows and optimize conversion rates.
5. Custom Events and Dashboard Personalization
- Track specific user actions by creating custom events.
- Customize your dashboard to visualize key metrics.

## Getting started

1. Create an account: Sign up for a [Vexo account](https://www.vexo.co/).

2. Create a new app: You'll be prompted to create a new app. Give it a name (you can change it later), and once you submit it, you'll receive an API key.

3. Install the Vexo package: Run the following command in your project:

npm

yarn

Terminal

`- ` `npm install vexo-analytics`

`- ` `yarn add vexo-analytics`

4. Initialize Vexo: Add the following code in your app's entry file (for example, index.js, App.js, or app/\_layout.tsx if using Expo Router):

app/\_layout.tsx

```text-2xs text-default

5. Rebuild and run your app: Since `vexo-analytics` includes native code, you need to rebuild your application.

6. Verify integration: Go to your app's page on Vexo and you should see your first event!

## Compatibility

- Expo: Vexo is compatible with [Development builds](https://docs.expo.dev/development/introduction) and does not require additional configuration plugins.
- Expo Go: Not supported, as Vexo requires custom native code.

## Learn more about Vexo

To learn more about using Vexo with Expo, check out the [Vexo documentation](https://docs.vexo.co/).

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

# https://docs.expo.dev/guides/using-hermes/

Search

`Ctrl` `K`

[Home](https://docs.expo.dev/) [Guides](https://docs.expo.dev/guides/overview) [EAS](https://docs.expo.dev/eas) [Reference](https://docs.expo.dev/versions/latest) [Learn](https://docs.expo.dev/tutorial/overview)

[Archive](https://docs.expo.dev/archive) [Expo Snack](https://snack.expo.dev/) [Discord and Forums](https://chat.expo.dev/) [Newsletter](https://expo.dev/mailing-list/signup)

# Using Hermes Engine

[Edit](https://github.com/expo/expo/edit/main/docs/pages/guides/using-hermes.mdx)

Copy

A guide on configuring Hermes for both Android and iOS in an Expo project.

* * *

[Hermes](https://hermesengine.dev/) is a JavaScript engine optimized for React Native. By compiling JavaScript into bytecode ahead of time, Hermes can improve your app start-up time. The binary size of Hermes is also smaller than other JavaScript engines, such as JavaScriptCore (JSC). It also uses less memory at runtime, which is particularly valuable on lower-end Android devices.

## Support

The Hermes engine is the default JavaScript engine used by Expo and it is fully supported across all Expo tooling.

### Switch JavaScript engine on a specific platform

You may want to use Hermes on one platform and JSC on another. One way to do this is to set the `"jsEngine"` to `"hermes"` at the top level in app config and then override it with `"jsc"` under the `"ios"` key. You may alternatively prefer to explicitly set `"hermes"` on just the `"android"` key in this case.

app.json

```text-2xs text-default

## Publish updates

Publishing updates with `eas update` and `npx expo export` will generate Hermes bytecode bundles and their source maps.

Note that the Hermes bytecode format may change between different Hermes versions — an update produced for a specific version of Hermes will not run on a different version of Hermes. Starting from Expo SDK 46 (React Native 0.69), [Hermes is bundled within React Native](https://reactnative.dev/architecture/bundled-hermes). Updating React Native version or Hermes version can be thought of in the same way as updating any other native module. So if you update the `react-native` version you should also update the `runtimeVersion` in app.json. If you don't do this, your app may crash on launch because the update may be loaded by an existing binary that uses an older Hermes version that is incompatible with the updated bytecode format. See [`runtimeVersion`](https://docs.expo.dev/eas-update/runtime-versions) for more information.

## JavaScript debugger

To debug JavaScript code running with Hermes, you can start your project with `npx expo start` then press `j` to open the debugger in Google Chrome or Microsoft Edge. The developer menu of development builds and Expo Go also have the Open JS Debugger option to do the same.

Alternatively, you can use the JavaScript inspector by opening [Google Chrome DevTools manually](https://reactnative.dev/docs/other-debugging-methods#remote-javascript-debugging-deprecated)

- Make sure you [set up Hermes in the `jsEngine` field](https://docs.expo.dev/guides/using-hermes#setup).

- If your app is built by `eas build`, `npx expo run:android` or `npx expo run:ios`, make sure it is a debug build.

- Internally, the app will establish a WebSocket connection, make sure your app is connected to the development server.

- Try to reload the app by pressing `r` in the Expo CLI Terminal UI.
- Test debugging availability by running the command: `curl http://127.0.0.1:8081/json/list` (adjust the `127.0.0.1:8081` to match your dev server URL). The HTTP response should be an array, as shown below. If it is an empty response, add either the `--localhost` or `--tunnel` flag to the `npx expo start` command.

### Can I use Remote Debugging with Hermes?

One of the many limitations of [remote debugging](https://docs.expo.dev/more/glossary-of-terms#remote-debugging) is that it does not work with modules built on top of [JSI](https://github.com/react-native-community/discussions-and-proposals/issues/91), such as [`react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated) version 2 or higher.

Hermes supports [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/v8/) to debug JavaScript in place by connecting to the engine running on the device, as opposed to remote debugging, which executes JavaScript within a desktop Chrome tab. Hermes apps use this debugging technique automatically when you open the debugger in Expo Go or a development build.

reCAPTCHA

Recaptcha requires verification.

[Privacy](https://www.google.com/intl/en/policies/privacy/) \- [Terms](https://www.google.com/intl/en/policies/terms/)

protected by **reCAPTCHA**

---

