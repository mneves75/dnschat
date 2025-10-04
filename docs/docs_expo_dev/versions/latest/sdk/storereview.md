# ![Expo StoreReview icon](/static/images/packages/expo-store-review.png)Expo
StoreReview

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-store-
review)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
store-review/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-store-
review)

Ask AI

A library that provides access to native APIs for in-app reviews.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-store-
review)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
store-review/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-store-
review)

Ask AI

Android

iOS

Bundled version:

~9.0.8

Copy

* * *

`expo-store-review` is a library that provides access to `ReviewManager` API
on Android 5+ and `SKStoreReviewController` API on iOS. It allows you to ask
the user to rate your app without leaving the app itself.

![Screenshots of the store review API in action on iOS](/static/images/store-
review.png)

## Installation

Terminal

Copy

`- ``npx expo install expo-store-review`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

It is important that you follow the [Human Interface
Guidelines](https://developer.apple.com/design/human-interface-
guidelines/ratings-and-reviews) for iOS and
[Guidelines](https://developer.android.com/guide/playcore/in-app-review#when-
to-request) for Android when using this API.

Specifically:

  * Don't call `StoreReview.requestReview()` from a button - instead try calling it after the user has finished some signature interaction in the app.
  * Don't spam the user.
  * Don't request a review when the user is doing something time sensitive like navigating.
  * Don't ask the user any questions before or while presenting the rating button or card.

### Write reviews

#### Android

There is no equivalent redirect on Android, you can still open the Play Store
to the reviews sections using the query parameter `showAllReviews=true` like
this:

Android Play Store example

Copy

    
    
    const androidPackageName = 'host.exp.exponent';
    // Open the Android Play Store in the browser -> redirects to Play Store on Android
    Linking.openURL(
      `https://play.google.com/store/apps/details?id=${androidPackageName}&showAllReviews=true`
    );
    // Open the Android Play Store directly
    Linking.openURL(`market://details?id=${androidPackageName}&showAllReviews=true`);
    

#### iOS

You can redirect an app user to the "Write a Review" screen for an app in the
iOS App Store by using the query parameter `action=write-review`. For example:

iOS App Store example

Copy

    
    
    const itunesItemId = 982107779;
    // Open the iOS App Store in the browser -> redirects to App Store on iOS
    Linking.openURL(`https://apps.apple.com/app/apple-store/id${itunesItemId}?action=write-review`);
    // Open the iOS App Store directly
    Linking.openURL(
      `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${itunesItemId}?action=write-review`
    );
    

## API

    
    
    import * as StoreReview from 'expo-store-review';
    

## Methods

### `StoreReview.hasAction()`

Android

iOS

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

This returns a promise that fulfills to `true` if
`StoreReview.requestReview()` is capable directing the user to some kind of
store review flow. If the app config (`app.json`) does not contain store URLs
and native store review capabilities are not available then the promise will
fulfill to `false`.

Example

    
    
    if (await StoreReview.hasAction()) {
      // you can call StoreReview.requestReview()
    }
    

### `StoreReview.isAvailableAsync()`

Android

iOS

Determines if the platform has the capabilities to use
`StoreReview.requestReview()`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

This returns a promise fulfills with `boolean`, depending on the platform:

  * On iOS, it will resolve to `true` unless the app is distributed through TestFlight.
  * On Android, it will resolve to `true` if the device is running Android 5.0+.
  * On Web, it will resolve to `false`.

### `StoreReview.requestReview()`

Android

iOS

In ideal circumstances this will open a native modal and allow the user to
select a star rating that will then be applied to the App Store, without
leaving the app. If the device is running a version of Android lower than 5.0,
this will attempt to get the store URL and link the user to it.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `StoreReview.storeUrl()`

Android

iOS

This uses the `Constants` API to get the
`Constants.expoConfig.ios.appStoreUrl` on iOS, or the
`Constants.expoConfig.android.playStoreUrl` on Android.

On Web this will return `null`.

Returns:

`string | null`

## Error codes

### `ERR_STORE_REVIEW_FAILED`

This error occurs when the store review request was not successful.

