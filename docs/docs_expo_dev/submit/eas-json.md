# Configure EAS Submit with eas.json

[Edit](https://github.com/expo/expo/edit/main/docs/pages/submit/eas-json.mdx)

Copy

Learn how to configure your project for EAS Submit with eas.json.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/submit/eas-json.mdx)

Copy

* * *

eas.json is the configuration file for EAS CLI and services. It is generated
when the [`eas build:configure` command](/build/setup#configure-the-project)
runs for the first time in your project and is located next to package.json at
the root of your project. Even though eas.json is not mandatory for using EAS
Submit, it makes your life easier if you need to switch between different
configurations.

## Production profile

Running `eas submit` without specifying a profile name will use the
`production` profile if it is already defined in eas.json to configure the
submission. If no values exist in the `production` profile, EAS CLI will
prompt you to provide the values interactively.

The `production` profile shown below is required to run Android and iOS
submissions in a CI/CD process, like with [EAS Workflows](/eas/workflows/get-
started):

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
            "ascAppId": "your-app-store-connect-app-id"
          }
        }
      }
    }
    

Learn more about the values you can set with the [Android specific
options](/eas/json#android-specific-options) and the [iOS specific
options](/eas/json#ios-specific-options). You can also learn how to submit to
the [Apple App Store](/submit/ios) and the [Google Play
Store](/submit/android).

## Multiple profiles

The JSON object under `submit` can contain multiple submit profiles. Each
profile under `submit` can have an arbitrary name as shown in the example
below:

eas.json

Copy

    
    
    {
      "cli": {
        "version": "SEMVER_RANGE",
        "requireCommit": boolean
      },
      "build": {
        // EAS Build configuration
        %%placeholder-start%%... %%placeholder-end%%
      },
      "submit": {
        "SUBMIT_PROFILE_NAME_1": {
          "android": {
            ...ANDROID_OPTIONS
          },
          "ios": {
            ...IOS_OPTIONS
          }
        },
        "SUBMIT_PROFILE_NAME_2": {
          "extends": "SUBMIT_PROFILE_NAME_1",
          "android": {
            ...ANDROID_OPTIONS
          }
        },
        %%placeholder-start%%... %%placeholder-end%%
      }
    }
    

When you select a build for submission, it chooses the profile that is used
for the selected build. If the profile does not exist, it selects the default
`production` profile.

You can also use EAS CLI to pick up another `submit` profile by specifying it
with a parameter, for example:

Terminal

Copy

`# Replace the <profile-name> with a submit profile from the eas.json`

`- ``eas submit --platform ios --profile <profile-name>`

## Share configuration between `submit` profiles

A `submit` profile can extend another profile using the `extends` key.

For example, in the `preview` profile you may have `"extends": "production"`.
This makes the `preview` profile inherit the configuration of the `production`
profile.

You can keep chaining profile extensions up to the depth of 5 as long as you
avoid making circular dependencies.

## Next step

[EAS Submit schema referenceLearn about available properties for EAS Submit to
configure and override their default behavior from within your
project.](/eas/json#eas-submit)

