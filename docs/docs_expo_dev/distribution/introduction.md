# Distribution: Overview

[Edit](https://github.com/expo/expo/edit/main/docs/pages/distribution/introduction.mdx)

Copy

An overview of submitting an app to the app stores or with the internal
distribution.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/distribution/introduction.mdx)

Copy

* * *

Get your app into the hands of users by submitting it to the app stores or
with [Internal Distribution](/build/internal-distribution).

Terminal

Copy

`# Install the CLI`

`- ``npm i -g eas-cli`

  
`# Build and submit your app`

`- ``eas build --auto-submit`

  
`# OR -- Submit existing binaries`

`- ``eas submit`

You can run `eas build --auto-submit` with [EAS CLI](/eas) to build your app
and automatically upload the binary for distribution on the Google Play Store
and Apple App Store.

This automatically manages all native code signing for Android and iOS for any
React Native app. Advanced features such as payments, notifications, universal
links, and iCloud can be automatically enabled based on your [config
plugins](/config-plugins/introduction) or native entitlements, meaning no more
wrestling with slow portals to get libraries set up correctly.

### Get started

[Submit to the Google Play StoreLearn how to submit an Android app to the
Google Play Store.](/submit/android) [Submit to the Apple App StoreLearn how
to submit an iOS or an iPadOS app to the Apple App Store from any operating
system.](/submit/ios) [Internal DistributionShare your mobile app internally
with testers using AdHoc builds.](/build/internal-distribution) [Publish
websitesExport your website and upload to any web host.](/guides/publishing-
websites) [OTA updatesSend over-the-air updates to your users
instantly.](/eas-update/introduction)

