  * [ StoreKit ](/documentation/storekit)
  * [ In-App Purchase ](/documentation/storekit/in-app-purchase)
  * Implementing a store in your app using the StoreKit API 

Sample Code

# Implementing a store in your app using the StoreKit API

Offer In-App Purchases and manage entitlements using signed transactions and
status information.

[ Download ](https://docs-
assets.developer.apple.com/published/57774b5b5848/ImplementingAStoreInYourAppUsingTheStoreKitAPI.zip)

iOS 26.0+iPadOS 26.0+Xcode 26.0+

## [Overview](/documentation/StoreKit/implementing-a-store-in-your-app-using-
the-storekit-api#Overview)

The sample project demonstrates how to use StoreKit in a SwiftUI-based iOS app
with a simulated app server, SKDemoServer. SKDemoServer is a Swift package
that acts as the app’s backend by vending product identifiers and persisting
consumable purchase entitlements using SwiftData.

To test your implementation of In-App Purchases using StoreKit, you can use
StoreKit Testing in Xcode and the sandbox environment. For more information,
see [Testing at all stages of development with Xcode and the
sandbox](/documentation/StoreKit/testing-at-all-stages-of-development-with-
xcode-and-the-sandbox), [Testing In-App Purchases with
sandbox](/documentation/StoreKit/testing-in-app-purchases-with-sandbox), and
[Setting up StoreKit Testing in Xcode](/documentation/Xcode/setting-up-
storekit-testing-in-xcode).

Note

This sample code project is associated with WWDC25 session 241: [What’s new in
StoreKit and In-App
Purchase](https://developer.apple.com/videos/play/wwdc2025/241/).

### [Test the sample code project in
Xcode](/documentation/StoreKit/implementing-a-store-in-your-app-using-the-
storekit-api#Test-the-sample-code-project-in-Xcode)

This sample code project implements StoreKit Testing in Xcode to let you test
In-App Purchases without completing any product set up in App Store Connect.
It defines In-App Purchases in a `Products.storekit` file.

To test the sample in Xcode:

  1. Select the sample target, then configure it to use your Developer team for signing. For more information, see Assign the project to a team in [Preparing your app for distribution](/documentation/Xcode/preparing-your-app-for-distribution).

  2. Edit the SKDemo “Run” scheme, and select `Products.storekit` for StoreKit configuration. For more information, see Enable StoreKit Testing in Xcode in [Setting up StoreKit Testing in Xcode](/documentation/Xcode/setting-up-storekit-testing-in-xcode).

  3. Build and run the sample app on a device or in the Simulator.

  4. The sample app displays a list of products available for sale in `Products.storekit` upon launching. If the sample app fails to display an In-App Purchase, see [TN3185: Troubleshooting In-App Purchases availability in Xcode](/documentation/Technotes/tn3185-troubleshooting-in-app-purchases-availability-in-xcode).

### [Test the sample code project in the sandbox
environment](/documentation/StoreKit/implementing-a-store-in-your-app-using-
the-storekit-api#Test-the-sample-code-project-in-the-sandbox-environment)

To test your app in the sandbox environment, sign in to a Sandbox Apple
Account. In the sandbox environment, you can test In-App Purchases using real
product information from App Store Connect without incurring charges. This
sample code project defines In-App Purchases in a `Products.plist` file.
Before you can start testing the sample app in the sandbox environment, you
need to complete configuration steps in App Store Connect and Xcode. For more
information, see Prepare for sandbox testing in [Testing In-App Purchases with
sandbox](/documentation/StoreKit/testing-in-app-purchases-with-sandbox).

To prepare this sample code project to run in the sandbox, perform the
following steps in App Store Connect:

  1. Find or create an app that supports In-App Purchases and you can use for testing purposes.

  2. Select the app and make a note of its bundle ID.

  3. Create an In-App Purchase that uses a product identifier from `Products.plist`. Use information from `Products.storekit` to set up the In-App Purchase. Repeat this step for all identifiers in `Products.plist`.

  4. After you create the SKDemo+ subscription group, make note of its Group ID.

  5. Create a [Sandbox Apple Account](https://developer.apple.com/help/app-store-connect/test-in-app-purchases/create-a-sandbox-apple-account/).

To prepare this sample code project to use information from App Store Connect,
perform the following steps in Xcode:

  1. Select the sample target, then change the bundle ID to your testing app’s bundle ID. For more information, see Set the bundle ID in [Preparing your app for distribution](/documentation/Xcode/preparing-your-app-for-distribution).

  2. Configure the target to use your Developer team for signing. For more information, see Assign the project to a team in [Preparing your app for distribution](/documentation/Xcode/preparing-your-app-for-distribution).

  3. Edit the SKDemo “Run” scheme, and remove `Products.storekit` from StoreKit configuration. For more information, see Disable StoreKit Testing in Xcode in [Setting up StoreKit Testing in Xcode](/documentation/Xcode/setting-up-storekit-testing-in-xcode).

  4. In the `Server.swift` file, replace 3F19ED53 with your new SKDemo+ subscription Group ID from App Store Connect.

You’re now ready to test this sample in the sandbox environment. Sign in to
the device with a Sandbox Apple Account, then build and run this sample in
Xcode. The sample app displays a list of products available for sale in the
App Store upon launching. If the sample app fails to display an In-App
Purchase, see [TN3186: Troubleshooting In-App Purchases availability in the
sandbox](/documentation/Technotes/tn3186-troubleshooting-in-app-purchases-
availability-in-the-sandbox).

## [See Also](/documentation/StoreKit/implementing-a-store-in-your-app-using-
the-storekit-api#see-also)

### [Product and subscription
information](/documentation/StoreKit/implementing-a-store-in-your-app-using-
the-storekit-api#Product-and-subscription-information)

[`struct Product`](/documentation/storekit/product)

Information about a product that you configure in App Store Connect.

[`struct SubscriptionInfo`](/documentation/storekit/product/subscriptioninfo)

Information about an auto-renewable subscription, such as its status, period,
subscription group, and subscription offer details.

[`typealias SubscriptionInfo`](/documentation/storekit/subscriptioninfo)

Information about an auto-renewable subscription.

[`typealias SubscriptionStatus`](/documentation/storekit/subscriptionstatus)

Represents the renewal status information for an auto-renewable subscription.

