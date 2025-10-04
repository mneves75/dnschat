# Configuration with eas.json

[Edit](https://github.com/expo/expo/edit/main/docs/pages/eas/json.mdx)

Copy

Learn about available properties for EAS Build and EAS Submit to configure and
override their default behavior from within your project.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/eas/json.mdx)

Copy

* * *

eas.json is the configuration file for EAS CLI and services. You can find the
complete reference of all available schema properties for [EAS
Build](/build/introduction) and [EAS Submit](/submit/introduction) on this
page.

> To learn more about how a project using EAS services is configured with
> eas.json, see [Configure EAS Build with eas.json](/build/eas-json) and
> [Configure EAS Submit with eas.json](/submit/eas-json).

## EAS Build

The following properties are available in the schema for the `build` key in
eas.json.

Example schema of multiple build profiles

eas.json

Copy

    
    
    {
      "build": {
        "base": {
          "node": "12.13.0",
          "yarn": "1.22.5",
          "env": {
            "EXAMPLE_ENV": "example value"
          },
          "android": {
            "image": "default",
            "env": {
              "PLATFORM": "android"
            }
          },
          "ios": {
            "image": "latest",
            "env": {
              "PLATFORM": "ios"
            }
          }
        },
        "development": {
          "extends": "base",
          "developmentClient": true,
          "env": {
            "ENVIRONMENT": "development"
          },
          "android": {
            "distribution": "internal",
            "withoutCredentials": true
          },
          "ios": {
            "simulator": true
          }
        },
        "staging": {
          "extends": "base",
          "env": {
            "ENVIRONMENT": "staging"
          },
          "distribution": "internal",
          "android": {
            "buildType": "apk"
          }
        },
        "production": {
          "extends": "base",
          "env": {
            "ENVIRONMENT": "production"
          }
        }
      }
    }
    

### Common properties for native platforms

Property| Description  
---|---  
`withoutCredentials`| (boolean) \- When set to `true`, EAS CLI won't require
you to configure credentials when building the app. This comes in handy when
using EAS Build [custom builds](/custom-builds/get-started). Defaults to
`false`.  
`extends`| (string) \- The name of the build profile that the current one
should inherit values from. This value can't be specified per platform.  
`credentialsSource`| (enum: local, remote) \- The source of credentials used
to sign the application archive.

  * `local` \- if you want to provide your own [credentials.json](/app-signing/local-credentials).
  * `remote` \- if you want to use the credentials managed by EAS (default option).

  
`releaseChannel`| (string) \- Deprecated: Name of the release channel for the
Classic Updates service, which is only supported in SDK 49 and lower. If you
do not specify a channel, your binary will pull releases from the `default`
channel. EAS Update uses the channel field, so you can remove `releaseChannel`
after [migrating to EAS Update](/eas-update/migrate-from-classic-updates).  
`channel`| (string) \- The EAS Update channel where this build will look for
updates. [Learn more](/eas-update/how-it-works). Standalone builds will check
for and download updates matching platform, native runtime, and channel. This
field has no effect when `developmentClient` is set to `true`, as development
builds can run updates from any channel. If you have not yet migrated from
Classic Updates to EAS Update, then continue to use the `releaseChannel` field
instead.  
`distribution`| (enum: store, internal) \- The method of distributing your
app.

  * `internal` \- with this option you'll be able to share your build URLs with anyone, and they will be able to install the builds to their devices straight from the Expo website. When using `internal`, make sure the build produces a .apk or ipa file. Otherwise, the shareable URL will be not work. See [internal distribution](/build/internal-distribution) for more information.
  * `store` \- produces builds for store uploads, your build URLs won't be shareable.

  
`developmentClient`| (boolean) \- If set to `true` (defaults to `false`), this
field will produce a [development build](/workflow/overview#development-
builds). For the build to be successful, the project must have [`expo-dev-
client`](/versions/latest/sdk/dev-client) installed and configured. Note: this
field is for setting the `gradleCommand` to `:app:assembleDebug` for Android
and `buildConfiguration` to `Debug` for iOS . If these fields are provided for
the same build profile, will take precedence over `developmentClient`.  
`resourceClass`| (enum: default, medium, large) \- The resource class that
will be used to run this build. To see mapping for each platform, see Android-
specific resource class field and iOS-specific resource class field. The
`large` resource class is not available on the free plan.  
`prebuildCommand`| (string) \- Optional override of the [prebuild](/more/expo-
cli#prebuild) command used by EAS. For example, you can specify `prebuild
--template example-template` to use a custom template. Note: `--platform` and
`--non-interactive` will be added automatically by the build engine, so you do
not need to specify them manually.  
`buildArtifactPaths`| (string[]) \- List of paths (or patterns) where EAS
Build is going to look for the build artifacts. Use `applicationArchivePath`
for specifying the path for uploading the application archive. Build artifacts
are uploaded even if the build fails. EAS Build uses [glob
patterns](https://github.com/isaacs/node-glob#glob-primer) for pattern
matching.  
`node`| (string) \- Version of Node.js used for build.  
`corepack`| (boolean) \- If set to `true`,
[corepack](https://nodejs.org/api/corepack.html) will be enabled at the
beginning of build process. Defaults to `false`.  
`yarn`| (string) \- Version of Yarn used for build.  
`pnpm`| (string) \- Version of pnpm used for build.  
`bun`| (string) \- Version of Bun used for build. You can also use a specific
version. Learn [how to configure the exact version in eas.json](/guides/using-
bun#customize-bun-version-on-eas).  
`expoCli`| (string) \- Deprecated: Version of [`expo-
cli`](https://www.npmjs.com/package/expo-cli) used to [prebuild](/more/expo-
cli#prebuild) your app. It only affects managed projects on Expo SDK 45 and
lower. For newer SDKs, EAS Build will use the versioned [Expo CLI](/more/expo-
cli). It is included with `expo` library. You can opt out of using the
versioned Expo CLI by setting the `EXPO_USE_LOCAL_CLI=0` environment variable
in the build profile.  
`env`| (object) \- [Environment variables](/guides/environment-variables) that
should be set during the build process. It should only be used for values that
you would commit to your git repository and not for passwords or
[secrets](/build-reference/variables).  
`autoIncrement`| (boolean) \- Controls how EAS CLI bumps your application
build version. Defaults to `false`. When enabled, for Android, bumps
`expo.android.versionCode` (for example, `3`to `4`). For iOS, bumps the last
component of `expo.ios.buildNumber` (for example, `1.2.3.39` to `1.2.3.40`).  
`cache`| (object) \- Cache configuration. This feature is intended for caching
values that require a lot of computation. For example, compilation results
(both final binaries and any intermediate files). However, it doesn't work
well for node_modules because the cache is not local to the machine, so the
download speed is similar to downloading from the npm registry.  
`disabled`| (boolean) \- Disables caching. Defaults to `false`.  
`key`| (string) \- Cache key. You can invalidate the cache by changing this
value.  
`paths`| (array) \- List of the paths that will be saved after a successful
build and restored at the beginning of the next one. Both absolute and
relative paths are supported, where relative paths are resolved from the
directory with eas.json.  
`config`| (string) \- Custom workflow file name that will be used to run this
build. You can also specify this property on platform level for platform-
specific workflows. [Learn more](/custom-builds/get-started). Example:
`"config": "production.yml"` will use workflow from
`.eas/build/production.yml`.  
`environment`| (enum: development, preview, production) \- The environment
used to apply environment variables for the build process. [Learn
more](/eas/environment-variables).  
  
### Android-specific options

Property| Description  
---|---  
`withoutCredentials`| (boolean) \- When set to `true`, EAS CLI won't require
you to configure credentials when building the app. This comes in handy when
you want to build debug binaries and the debug keystore is checked in to the
repository. Defaults to `false`.  
`image`| (string) \- [Image with build environment](/build-
reference/infrastructure).  
`resourceClass`| (enum: default, medium, large) \- The Android-specific
resource class that will be used to run this build. Defaults to `medium`. For
information on available build resources for each resource class, see [Android
build server configurations](/build-reference/infrastructure#android-build-
server-configurations). The `large` resource class is not available on the
free plan.  
`ndk`| (string) \- Version of Android NDK.  
`autoIncrement`| (boolean | "version" | "versionCode") \- Controls how EAS CLI bumps your application build version. Defaults to `false`. Allowed values:

  * `"version"` \- bumps the patch of `expo.version` (for example, `1.2.3` to `1.2.4`).
  * `"versionCode"` (or `true`) - bumps `expo.android.versionCode` (for example, `3` to `4`).
  * `false` \- versions won't be bumped automatically (default).

Based on the value of [`cli.appVersionSource` in eas.json](/build-
reference/app-versions), the values will be updated locally in your project or
on EAS servers.  
`buildType`| (enum: app-bundle, apk) \- Type of the artifact you want to
build. It controls which Gradle task will be used to build the project. It can
be overridden by `gradleCommand` or `developmentClient: true` option.

  * `app-bundle` \- `:app:bundleRelease` (creates .aab artifact)
  * `apk` \- `:app:assembleRelease` (creates .apk artifact)

  
`gradleCommand`| (string) \- Gradle task that will be used to build your
project. For example, `:app:assembleDebug` to build a debug binary. It's not
recommended unless you need to run a task that `buildType` does not support,
it takes priority over `buildType` and `developmentClient`.  
`applicationArchivePath`| (string) \- Path (or pattern) where EAS Build is
going to look for the application archive. EAS Build uses [glob
patterns](https://github.com/isaacs/node-glob#glob-primer) for pattern
matching. The default value is `android/app/build/outputs/**/*.{apk,aab}`.  
`config`| (string) \- Custom workflow file name that will be used to run this
Android build. You can also specify this property on profile level for
platform-agnostic workflows. [Learn more](/custom-builds/get-started).
Example: `"config": "production-android.yml"` will use workflow from
`.eas/build/production-android.yml`.  
  
### iOS-specific options

Property| Description  
---|---  
`withoutCredentials`| (boolean) \- When set to `true`, EAS CLI won't require
you to configure credentials when building the app. This comes in handy when
using EAS Build [custom builds](/custom-builds/get-started). Defaults to
`false`.  
`simulator`| (boolean) \- If set to true, creates build for iOS Simulator.
Defaults to `false`.  
`enterpriseProvisioning`| (enum: universal, adhoc) \- Provisioning method used
for `"distribution": "internal"` when you have an Apple account with Apple
Developer Enterprise Program membership. You can choose if you want to use
`adhoc` or `universal` provisioning. The latter is recommended as it does not
require you to register each individual device. If you don't provide this
option and you still authenticate with an enterprise team, you'll be prompted
which provisioning method to use.  
`autoIncrement`| (boolean | "version" | "buildNumber") \- Controls how EAS CLI bumps your application build version. Defaults to `false`. Allowed values:

  * `"version"` \- bumps the patch of `expo.version` (for example, `1.2.3` to `1.2.4`).
  * `"buildNumber"` (or `true`) - bumps the last component of `expo.ios.buildNumber` (for example, `1.2.3.39` to `1.2.3.40`).
  * `false` \- versions won't be bumped automatically (default)

Based on the value of [`cli.appVersionSource` in eas.json](/build-
reference/app-versions), the values will be updated locally in your project or
on EAS servers.  
`image`| (string) \- [Image with build environment](/build-
reference/infrastructure).  
`resourceClass`| (enum: default, medium, large) \- The iOS-specific resource
class that will be used to run this build. Defaults to `medium`. For
information on available build resources for each resource class, see [iOS
build server configurations](/build-reference/infrastructure#ios-build-server-
configurations). The `large` resource class is not available on the free plan.  
`bundler`| (string) \- Version of [bundler](https://bundler.io/).  
`fastlane`| (string) \- Version of fastlane.  
`cocoapods`| (string) \- Version of CocoaPods.  
`scheme`| (string) \- Xcode project's scheme. If a project:

  * Has multiple schemes, you should set this value.
  * Has only one scheme, it will be detected automatically.
  * Have multiple schemes schemes and if this value is not set, EAS CLI will prompt you to select one of them.

  
`buildConfiguration`| (string) \- Xcode project's Build Configuration.

  * For an Expo project, the value is `"Release"` or `"Debug"`. Defaults to `"Release"`.
  * For a [bare React Native](/bare/overview) project, defaults to the value specified in the scheme.

It takes priority over `developmentClient`.  
`applicationArchivePath`| (string) \- Path (or pattern) where EAS Build is
going to look for the application archive. EAS Build uses [glob
patterns](https://github.com/isaacs/node-glob#glob-primer) for pattern
matching. You should modify that path only if you are using a custom Gymfile.
The default is `ios/build/Build/Products/*-iphonesimulator/*.app` when
building for simulator and `ios/build/*.ipa` in other cases.  
`config`| (string) \- Custom workflow file name that will be used to run this
iOS build. You can also specify this property on profile level for platform-
agnostic workflows. [Learn more](/custom-builds/get-started). Example:
`"config": "production-ios.yml"` will use workflow from
`.eas/build/production-ios.yml`.  
  
## EAS Submit

The following properties are available in the schema for the `submit` key in
eas.json.

Example schema of with production profile

eas.json

Copy

    
    
    {
      "cli": {
        "version": ">= 0.34.0"
      },
      "submit": {
        "production": {
          "android": {
            "serviceAccountKeyPath": "../path/to/api-xxx-yyy-zzz.json",
            "track": "internal"
          },
          "ios": {
            "appleId": "john@turtle.com",
            "ascAppId": "1234567890",
            "appleTeamId": "AB12XYZ34S"
          }
        }
      }
    }
    

### Android-specific options

Property| Description  
---|---  
`serviceAccountKeyPath`| (string) \- Path to the JSON file with [Google
Service Account Key](https://expo.fyi/creating-google-service-account) used to
authenticate with Google Play.  
`track`| (enum: production, beta, alpha, internal) \- The track of the
application to use.  
`releaseStatus`| (enum: completed, draft, halted, inProgress) \- The [status
of a release](https://developers.google.com/android-publisher/api-
ref/rest/v3/edits.tracks#status).  
`rollout`| (number) \- The initial fraction of users who are eligible to
receive the release. Should be a value from 0 (no users) to 1 (all users).
Works only with `inProgress` [release
status](https://developers.google.com/android-publisher/api-
ref/rest/v3/edits.tracks#status).  
`changesNotSentForReview`| (boolean) \- Indicates that the changes sent with
this submission will not be reviewed until they are explicitly sent for review
from the Google Play Console UI. Defaults to `false`.  
`applicationId`| (string) \- The application ID that is used when accessing
Service Account Key managed by Expo. It does not have any effect if you are
using local credentials. In most cases this value will be autodetected.
However, if you have multiple product flavors, this value might be necessary.  
  
### iOS-specific options

Property| Description  
---|---  
`appleId`| (string) \- Your Apple ID username (you can also set the
`EXPO_APPLE_ID` env variable).  
`ascAppId`| (string) \- [App Store Connect unique application Apple ID
number](https://expo.fyi/asc-app-id). When set, results in skipping the app
creation step.  
`appleTeamId`| (string) \- Your Apple Developer Team ID.  
`sku`| (string) \- An unique ID for your app that is not visible on the App
Store, will be generated unless provided.  
`language`| (string) \- Primary language. Defaults to "en-US".  
`companyName`| (string) \- The name of your company, needed only for the first
submission of any app to the App Store.  
`appName`| (string) \- The name of your app as it will appear on the App
Store. Defaults to `expo.name` from the [app config](/workflow/configuration).  
`ascApiKeyPath`| (string) \- The path to your [App Store Connect Api Key .p8
file](https://expo.fyi/creating-asc-api-key).  
`ascApiKeyIssuerId`| (string) \- The Issuer ID of your [App Store Connect Api
Key](https://expo.fyi/creating-asc-api-key).  
`ascApiKeyId`| (string) \- The Key ID of your [App Store Connect Api
Key](https://expo.fyi/creating-asc-api-key).  
`bundleIdentifier`| (string) \- The bundle identifier that will be used when
accessing submit credentials managed by Expo. It does not have any effect if
you are using local credentials. In most cases, this value will be
autodetected. However, if you have multiple Xcode schemes and targets, this
value might be necessary.  
`metadataPath`| (string) \- The path to your [store configuration
file](/eas/metadata).  
`groups`| (array) \- An array of TestFlight internal group names to add the
build to. Note: on top of the groups you provide here, the build will be
automatically added to the groups that have been created with the "Enable
automatic distribution" App Store Connect setting.

