# Submit to the Google Play Store

[Edit](https://github.com/expo/expo/edit/main/docs/pages/submit/android.mdx)

Copy

Learn how to submit your app to the Google Play Store from your computer and
CI/CD services.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/submit/android.mdx)

Copy

* * *

This guide outlines how to submit your app to the Google Play Store from your
computer or from a CI/CD service.

## Submitting your app from your computer

Prerequisites

7 requirements

1.

Sign up for a Google Play Developer account

A Google Play Developer account is required to submit your app to the Google
Play Store. You can sign up for a Google Play Developer account on the [Google
Play Console sign-up page](https://play.google.com/apps/publish/signup/).

2.

Create an app on Google Play Console

Create an app by clicking Create app in the [Google Play
Console](https://play.google.com/apps/publish/).

3.

Create a Google Service Account

EAS requires you to upload and configure a Google Service Account Key to
submit your Android app to the Google Play Store. You can create one with the
[uploading a Google Service Account Key for Play Store submissions with
EAS](https://github.com/expo/fyi/blob/main/creating-google-service-account.md)
guide.

4.

Install EAS CLI and authenticate with your Expo account

Install EAS CLI and login with your Expo account:

Terminal

Copy

`- ``npm install -g eas-cli && eas login`

5.

Include a package name in app.json

Include your app's package name in app.json:

app.json

Copy

    
    
    {
      "android": {
        "package": "com.yourcompany.yourapp"
      }
    }
    

6.

Build a production app

You'll need a production build ready for store submission. You can create one
using [EAS Build](/build/introduction):

Terminal

Copy

`- ``eas build --platform android --profile production`

Alternatively, you can build the app on your own computer with `eas build
--platform android --profile production --local` or with Android Studio.

7.

Upload your app manually at least once

You have to upload your app manually at least once. This is a limitation of
the Google Play Store API.

Learn how with the [first submission of an Android
app](https://expo.fyi/first-android-submission) guide.

Once you have completed all the prerequisites, you can start the submission
process.

Run the following command to submit a build to the Google Play Store:

Terminal

Copy

`- ``eas submit --platform android`

The command will lead you step by step through the process of submitting the
app. You can configure the submission process by adding a submission profile
in eas.json. Learn about all the options you can provide in the [eas.json
reference](/eas/json#android-specific-options-1).

To speed up the submission process, you can use the `--auto-submit` flag to
automatically submit a build after it's built:

Terminal

Copy

`- ``eas build --platform android --auto-submit`

Learn more about the `--auto-submit` flag in the [automate
submissions](/build/automate-submissions) guide.

## Submitting your app using CI/CD services

Prerequisites

8 requirements

1.

Sign up for a Google Play Developer account

A Google Play Developer account is required to submit your app to the Google
Play Store. You can sign up for a Google Play Developer account on the [Google
Play Console sign-up page](https://play.google.com/apps/publish/signup/).

2.

Create an app on Google Play Console

Create an app by clicking Create app in the [Google Play
Console](https://play.google.com/apps/publish/).

3.

Create a Google Service Account

EAS requires you to upload and configure a Google Service Account Key to
submit your Android app to the Google Play Store. You can create one with the
[uploading a Google Service Account Key for Play Store submissions with
EAS](https://github.com/expo/fyi/blob/main/creating-google-service-account.md)
guide.

4.

Install EAS CLI and authenticate with your Expo account

Install EAS CLI and login with your Expo account:

Terminal

Copy

`- ``npm install -g eas-cli && eas login`

5.

Include a package name in app.json

Include your app's package name in app.json:

app.json

Copy

    
    
    {
      "android": {
        "package": "com.yourcompany.yourapp"
      }
    }
    

6.

Provide a submission profile in eas.json

Then, you'll need to provide a submission profile in eas.json that includes
your app's `serviceAccountKeyPath`:

eas.json

Copy

    
    
    {
      "submit": {
        "production": {
          "android": {
            "serviceAccountKeyPath": "../path/to/api-xxx-yyy-zzz.json"
          }
        }
      }
    }
    

There are additional options available for Android submissions. Learn more
from the [eas.json reference](/eas/json#android-specific-options-1).

7.

Build a production app

You'll need a production build ready for store submission. You can create one
using [EAS Build](/build/introduction):

Terminal

Copy

`- ``eas build --platform android --profile production`

Alternatively, you can build the app on your own computer with `eas build
--platform android --profile production --local` or with Android Studio.

8.

Upload your app manually at least once

You have to upload your app manually at least once. This is a limitation of
the Google Play Store API.

Learn how with the [first submission of an Android
app](https://expo.fyi/first-android-submission) guide.

Once you have completed all the prerequisites, you can set up a CI/CD pipeline
to submit your app to the Google Play Store.

### Use EAS Workflows CI/CD

You can use [EAS Workflows](/eas-workflows/get-started) to build and submit
your app automatically.

  1. Create a workflow file named .eas/workflows/submit-android.yml at the root of your project.

  2. Inside submit-android.yml, you can use the following workflow to kick off a job that submits an Android app:

.eas/workflows/submit-android.yml

Copy

         
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
         
           submit_android:
             name: Submit to Google Play Store
             needs: [build_android]
             type: submit
             params:
               platform: android
               build_id: ${{ needs.build_android.outputs.build_id }}
         

The workflow above will build the Android app and then submit it to the Google
Play Store.

### Use other CI/CD services

You can use other CI/CD services to submit your app with EAS Submit, like
GitHub Actions, GitLab CI, and more by running the following command:

Terminal

Copy

`- ``eas submit --platform android --profile production`

This command requires a [personal access token](/accounts/programmatic-
access#personal-access-tokens) to authenticate with your Expo account. Once
you have one, provide the `EXPO_TOKEN` environment variable in the CI/CD
service, which will allow the `eas submit` command to run.

