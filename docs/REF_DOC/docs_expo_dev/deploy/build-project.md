# Build your project for app stores

[Edit](https://github.com/expo/expo/edit/main/docs/pages/deploy/build-
project.mdx)

Copy

Learn how to create a production build for your app that is ready to be
submitted to app stores from the command line using EAS Build.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/deploy/build-
project.mdx)

Copy

* * *

Whether you have built a native app binary using [EAS](/build/setup) or
[locally](/guides/local-app-development), the next step in your app
development journey is to submit your app to the stores. To do so, you need to
create a production build.

Production builds are submitted to app stores for release to the general
public or as part of a store-facilitated testing process such as TestFlight.
This guide explains how to create production builds with [EAS](/deploy/build-
project#production-builds-using-eas) and [locally](/deploy/build-
project#production-builds-locally). It is also possible to create production
builds for Expo apps with any CI service capable of compiling Android and iOS
apps.

## Production builds using EAS

Production builds must be installed through their respective app stores. You
cannot install them directly on your Android Emulator, iOS Emulator, or
device. The only exception to this is if you explicitly set `"buildType":
"apk"` for Android on your build profile. However, it is recommended to use
aab when submitting to stores, and this is the default configuration.

### `eas.json` configuration

A minimal configuration for building a production build in eas.json is already
created when you create your first build:

eas.json

Copy

    
    
    {
      "build": {
        %%placeholder-start%%... %%placeholder-end%%
        "production": {}
        %%placeholder-start%%... %%placeholder-end%%
      }
    }
    

### Create a production build

To create a production build, run the following command for a platform:

Android

iOS

Terminal

Copy

`- ``eas build --platform android`

Terminal

Copy

`- ``eas build --platform ios`

You can attach a message to the build by passing `--message` to the build
command, for example, `eas build --platform ios --message "Some message"`. The
message will appear on the EAS dashboard. It comes in handy when you want to
specify the purpose of the build for your team.

Alternatively, you can use `--platform all` option to build for Android and
iOS at the same time:

Terminal

Copy

`- ``eas build --platform all`

## Developer account

You will need to have a developer account for the app store you want to submit
your app.

Google Play Developer membership is required to distribute to the Google Play
Store.

You can build and sign your app using EAS Build, but you can't upload it to
the Google Play Store unless you have a membership, a one-time $25 USD fee.

Apple Developer Program membership is required to build for the Apple App
Store.

If you are going to use EAS Build to create production builds for the Apple
App Store, you need access to an account with a $99 USD [Apple Developer
Program](https://developer.apple.com/programs) membership.

## App signing credentials

Before the build process can start for app stores, you need a store developer
account and generate or provide app signing credentials.

Whether you have experience with generating app signing credentials or not,
EAS CLI can do the heavy lifting. You can opt-in for EAS CLI to handle the app
signing credentials process.

### Android app signing credentials

  * If you have not yet generated a keystore for your app, use EAS CLI by selecting `Generate new keystore`, and then you are done. The keystore is stored securely on EAS servers.
  * If you want to manually generate your keystore, see the [manual Android credentials guide](/app-signing/local-credentials#android-credentials) for more information.

### iOS app signing credentials

  * If you have not generated a provisioning profile and/or distribution certificate yet, use EAS CLI by signing in to your Apple Developer Program account and following the prompts.
  * If you want to manually generate your credentials, see the [manual iOS credentials guide](/app-signing/local-credentials#ios-credentials) for more information.

## Wait for the build to complete

By default, the `eas build` command will wait for your build to complete, but
you can interrupt it if you prefer not to wait. Instead, use the builds
details page link prompted by EAS CLI to monitor the build progress and read
the build logs. You can also find this page by visiting [your build
dashboard](https://expo.dev/builds) or running the following command:

Terminal

Copy

`- ``eas build:list`

If you are a member of an organization and your build is on its behalf, you
will find the build details on [the build dashboard for that
account](https://expo.dev/accounts/%5Baccount%5D/builds).

## Create builds automatically

You can automatically create builds on commits to specific branches with [EAS
Workflows](/eas/workflows/get-started). First, you'll need to [configure your
project](/eas/workflows/get-started#configure-your-project), add a file named
.eas/workflows/create-builds.yml at the root of your project, then add the
following workflow configuration:

.eas/workflows/create-builds.yml

Copy

    
    
    name: Create builds
    
    on:
      push:
        branches: ['main']
    
    jobs:
      build_android:
        name: Build Android app
        type: build
        params:
          platform: android
          profile: production
      build_ios:
        name: Build iOS app
        type: build
        params:
          platform: ios
          profile: production
    

The workflow above will create Android and iOS builds on every commit to your
project's `main` branch. You can also run this workflow manually with the
following EAS CLI command:

Terminal

Copy

`- ``eas workflow:run create-builds.yml`

Learn more about common patterns with the [workflows examples
guide](/eas/workflows/examples).

## Production builds locally

To create a production build locally, see the following React Native guides
for more information on the necessary steps for Android and iOS.

These guides assume your project has android and/or ios directories containing
the respective native projects. If you use [Continuous Native
Generation](/workflow/continuous-native-generation) then you will need to run
[prebuild](/workflow/prebuild) to generate the directories before following
the guides.

> Note: Following the guide below, in step four, when you build the release
> .aab for Android, run `./gradlew app:bundleRelease` from the android
> directory instead of `npx react-native build-android --mode=release`.

[Publishing to Google Play StoreLearn how to publish an app to Google Play
Store by following the necessary steps
manually.](https://reactnative.dev/docs/signed-apk-android) [Publishing to
Apple App StoreLearn how to publish an app to Apple App Store by following the
necessary steps manually.](https://reactnative.dev/docs/publishing-to-app-
store)

## Next step

[App stores best practicesLearn about the best practices for submitting your
app to app stores.](/distribution/app-stores)

