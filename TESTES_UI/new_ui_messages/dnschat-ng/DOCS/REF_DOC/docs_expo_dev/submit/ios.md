# Submit to the Apple App Store

[Edit](https://github.com/expo/expo/edit/main/docs/pages/submit/ios.mdx)

Copy

Learn how to submit your app to the Apple App Store from your computer and
CI/CD services.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/submit/ios.mdx)

Copy

* * *

This guide outlines how to submit your app to the Apple App Store from your
computer or from a CI/CD service.

## Submitting your app from your computer

Prerequisites

4 requirements

1.

Sign up for an Apple Developer account

An Apple Developer account is required to submit your app to the Apple App
Store. You can sign up for an Apple Developer account on the [Apple Developer
Portal](https://developer.apple.com/account/).

2.

Include a bundle identifier in app.json

Include your app's bundle identifier in app.json:

app.json

Copy

    
    
    {
      "ios": {
        "bundleIdentifier": "com.yourcompany.yourapp"
      }
    }
    

3.

Install EAS CLI and authenticate with your Expo account

Install EAS CLI and login with your Expo account:

Terminal

Copy

`- ``npm install -g eas-cli && eas login`

4.

Build a production app

You'll need a production build ready for store submission. You can create one
using [EAS Build](/build/introduction):

Terminal

Copy

`- ``eas build --platform ios --profile production`

Alternatively, you can build the app on your own computer with `eas build
--platform ios --profile production --local` or with Xcode.

Once you have completed all the prerequisites, you can start the submission
process.

Run the following command to submit a build to the Apple App Store:

Terminal

Copy

`- ``eas submit --platform ios`

The command will lead you step by step through the process of submitting the
app. You can configure the submission process by adding a submission profile
in eas.json:

eas.json

Copy

    
    
    {
      "submit": {
        "production": {
          "ios": {
            "ascAppId": "your-app-store-connect-app-id"
          }
        }
      }
    }
    

How to find `ascAppId`

  1. Sign in to [App Store Connect](https://appstoreconnect.apple.com/) and select your team.
  2. Navigate to the [Apps](https://appstoreconnect.apple.com/apps).
  3. Click on your app.
  4. Ensure that App Store tab is active.
  5. On the left pane, under the General section, select App Information.
  6. Your app's `ascAppId` can be found under General Information section under Apple ID.

![Apple ID and Apple Team ID in App Store Connect](/static/images/eas-
submit/finding-ascAppId.png)

Learn about all the options you can provide in the [eas.json
reference](/eas/json#ios-specific-options-1).

To speed up the submission process, you can use the `--auto-submit` flag to
automatically submit a build after it's built:

Terminal

Copy

`- ``eas build --platform ios --auto-submit`

Learn more about the `--auto-submit` flag in the [automate
submissions](/build/automate-submissions) guide.

## Submitting your app using CI/CD services

Prerequisites

5 requirements

1.

Sign up for an Apple Developer account

An Apple Developer account is required to submit your app to the Apple App
Store. You can sign up for an Apple Developer account on the [Apple Developer
Portal](https://developer.apple.com/account/).

2.

Include a bundle identifier in app.json

Include your app's bundle identifier in app.json:

app.json

Copy

    
    
    {
      "ios": {
        "bundleIdentifier": "com.yourcompany.yourapp"
      }
    }
    

3.

Configure your App Store Connect API Key

Run the following command to configure your App Store Connect API Key:

Terminal

Copy

`- ``eas credentials --platform ios`

The command will prompt you to select the type of credentials you want to
configure.

  1. Select the `production` build profile
  2. Log in with your Apple Developer account and follow the prompts
  3. Select App Store Connect: Manage your API Key
  4. Select Set up your project to use an API Key for EAS Submit

Do you want to use your own credentials?

App Store Connect API Key: Create your own [API
Key](https://expo.fyi/creating-asc-api-key) then set it with the
`ascApiKeyPath`, `ascApiKeyIssuerId`, and `ascApiKeyId` fields in eas.json.

App Specific Password: Provide your [password](https://expo.fyi/apple-app-
specific-password) and Apple ID Username by passing them in with the
`EXPO_APPLE_APP_SPECIFIC_PASSWORD` environment variable and `appleId` field in
eas.json, respectively.

4.

Provide a submission profile in eas.json

Then, you'll need to provide a submission profile in eas.json that includes
the following fields:

eas.json

Copy

    
    
      {
        "submit": {
          "production": {
            "ios": {
              "ascAppId": "your-app-store-connect-app-id"
            }
          }
        }
      }
    

How to find `ascAppId`

  1. Sign in to [App Store Connect](https://appstoreconnect.apple.com/) and select your team.
  2. Navigate to the [Apps](https://appstoreconnect.apple.com/apps).
  3. Click on your app.
  4. Ensure that App Store tab is active.
  5. On the left pane, under the General section, select App Information.
  6. Your app's `ascAppId` can be found under General Information section under Apple ID.

![Apple ID and Apple Team ID in App Store Connect](/static/images/eas-
submit/finding-ascAppId.png)

Learn about all the options you can provide in the [eas.json
reference](/eas/json#ios-specific-options-1).

5.

Build a production app

You'll need a production build ready for store submission. You can create one
using [EAS Build](/build/introduction):

Terminal

Copy

`- ``eas build --platform ios --profile production`

Alternatively, you can build the app on your own computer with `eas build
--platform ios --profile production --local` or with Xcode.

Once you have completed all the prerequisites, you can set up a CI/CD pipeline
to submit your app to the Apple App Store.

### Use EAS Workflows CI/CD

You can use [EAS Workflows](/eas-workflows/get-started) to build and submit
your app automatically.

  1. Create a workflow file named .eas/workflows/submit-ios.yml at the root of your project.

  2. Inside submit-ios.yml, you can use the following workflow to kick off a job that submits an iOS app:

.eas/workflows/submit-ios.yml

Copy

         
         on:
           push:
             branches: ['main']
         
         jobs:
           build_ios:
             name: Build iOS app
             type: build
             params:
               platform: ios
               profile: production
         
           submit_ios:
             name: Submit to TestFlight
             needs: [build_ios]
             type: testflight
             params:
               build_id: ${{ needs.build_ios.outputs.build_id }}
         

The workflow above will build the iOS app and then submit it Apple App Store's
TestFlight. You can share with internal and external testing groups using the
`testflight` job. See the [pre-packaged `testflight` job](/eas/workflows/pre-
packaged-jobs#testflight) for more information.

### Use other CI/CD services

You can use other CI/CD services to submit your app with EAS Submit, like
GitHub Actions, GitLab CI, and more by running the following command:

Terminal

Copy

`- ``eas submit --platform ios --profile production`

This command requires a [personal access token](/accounts/programmatic-
access#personal-access-tokens) to authenticate with your Expo account. Once
you have one, provide the `EXPO_TOKEN` environment variable in the CI/CD
service, which will allow the `eas submit` command to run.

## Manual submissions

If you ever need to submit your build without going through EAS Submit, for
example, if the service is temporarily unavailable for maintenance, you can
upload to the Apple App Store manually from a macOS device.

How to upload to the Apple App Store manually from a macOS device

#### Creating an entry on App Store Connect

Start by creating an app profile in App Store Connect, if you haven't already:

  1. Go to [App Store Connect](https://appstoreconnect.apple.com) and sign in. Make sure you have accepted any legal notices or terms at the top of the page.
  2. Click the blue plus button by the Apps header, then click New App.
  3. Add your app's name, language, bundle identifier, and SKU (this isn't seen by end users, it can be any unique string. A common choice is your app's bundle identifier, for example, "com.company.my-app").
  4. Click Create. If this succeeds, then you have created your application record.

#### Uploading with Transporter

Finally, you need to upload the IPA to the Apple App Store.

  1. Download [Transporter from the App Store](https://apps.apple.com/app/transporter/id1450874784).
  2. Sign in with your Apple ID.
  3. Add the build either by dragging the IPA file directly into the Transporter window or by selecting it from the file dialog opened with + or Add App button.
  4. Submit it by clicking the Deliver button.

This process can take a few minutes, then another 10-15 minutes of processing
on Apple's servers. Afterward, you can check the status of your binary in App
Store Connect:

  1. Visit [App Store Connect](https://appstoreconnect.apple.com), select My Apps, and click on the app entry you created earlier.
  2. Scroll down to the Build section and select your newly uploaded binary.

