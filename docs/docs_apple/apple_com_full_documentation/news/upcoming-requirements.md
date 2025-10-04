![Age Rating Updates](/news/images/icons/calendar-pre.svg)

## [Age Rating Updates](/news/upcoming-requirements/?id=07242025a)

Begins January 31, 2026

Ratings for all apps and games on the App Store have been automatically
updated to align with our new age rating system and will be reflected on Apple
devices running a minimum of iOS 26, iPadOS 26, macOS Tahoe 26, tvOS 26,
visionOS 26, and watchOS 26.

Provide responses to the updated age rating questions for each of your apps by
January 31, 2026, to avoid an interruption when submitting your app updates in
App Store Connect. You can view the age rating for each of your apps under the
updated system and respond to the new questions in the App Information section
of your app in App Store Connect.

  * [Learn more about age ratings values and definitions](/help/app-store-connect/reference/age-ratings-values-and-definitions/)
  * [Learn how to set your app rating](/help/app-store-connect/manage-app-information/set-an-app-age-rating/)

[Add to calendar](/news/upcoming-requirements/?getReminder=07242025a)

![SDK minimum requirements](/news/images/icons/calendar-post.svg)

## [SDK minimum requirements](/news/upcoming-requirements/?id=02212025a)

Since April 24, 2025

Apps uploaded to App Store Connect must be built with [Xcode
16](https://apps.apple.com/us/app/xcode/id497799835?mt=12) or later using an
SDK for [iOS 18](/ios/), [iPadOS 18](/ipados/), [tvOS 18](/tvos/), [visionOS
2](/visionos/), or [watchOS 11](/watchos/).

[Learn about submitting apps](/app-store/submitting/)

![APNs Certificate Update](/news/images/icons/calendar-post.svg)

## [APNs Certificate Update](/news/upcoming-requirements/?id=02242025a)

Since February 24, 2025

The Apple Push Notification service (APNs) will be updated with a new server
certificate in production on February 24, 2025. Update your application’s
Trust Store to include the new server certificate: SHA-2 Root : [USERTrust RSA
Certification Authority certificate](https://www.sectigo.com/knowledge-
base/detail/Sectigo-Intermediate-Certificates/kA01N000000rfBO).

![Quarantine attribute in macOS apps uploaded to App Store
Connect](/news/images/icons/calendar-post.svg)

## [Quarantine attribute in macOS apps uploaded to App Store
Connect](/news/upcoming-requirements/?id=02182025a)

Since February 18, 2025

macOS apps distributed on TestFlight and the App Store shouldn’t include the
quarantine extended file attribute com.apple.quarantine. Starting February 18,
you must remove this attribute from all files within macOS apps in order to
upload to App Store Connect.

![DSA trader status](/news/images/icons/calendar-post.svg)

## [DSA trader status required for apps in the EU](/news/upcoming-
requirements/?id=02172025a)

Since February 17, 2025

Apps without [trader status](/help/app-store-connect/manage-compliance-
information/manage-european-union-digital-services-act-trader-requirements/)
will be removed from the App Store in the European Union (EU) until trader
status is provided and verified in order to comply with the Digital Services
Act.

![App Store Receipt Signing Intermediate
Certificate](/news/images/icons/calendar-post.svg)

## [App Store Receipt Signing Intermediate Certificate](/news/upcoming-
requirements/?id=01242025a)

Since January 24, 2025

The SHA-1 intermediate certificate used for signing App Store receipts expires
on January 24, 2025. If your app performs on-device receipt validation, make
sure it supports the SHA-256 algorithm; alternatively, use the
[AppTransaction](https://developer.apple.com/documentation/storekit/apptransaction)
and
[Transaction](https://developer.apple.com/documentation/storekit/transaction)
APIs to verify App Store transactions.  
  
For more details, view [TN3138: Handling App Store receipt signing certificate
change](https://developer.apple.com/documentation/technotes/tn3138-handling-
app-store-receipt-signing-certificate-changes).

![APNs Certificate Update](/news/images/icons/calendar-post.svg)

## [APNs Certificate Update](/news/upcoming-requirements/?id=01202025a)

Since January 20, 2025

The Apple Push Notification service (APNs) will be updated with a new server
certificate in sandbox on January 20, 2025. Update your application’s Trust
Store to include the new server certificate: SHA-2 Root : [USERTrust RSA
Certification Authority certificate](https://www.sectigo.com/knowledge-
base/detail/Sectigo-Intermediate-Certificates/kA01N000000rfBO).

![DSA trader status](/news/images/icons/calendar-post.svg)

## [DSA trader status required for app updates in the EU](/news/upcoming-
requirements/?id=10162024a)

Since October 16, 2024

Your [trader status](/help/app-store-connect/manage-compliance-
information/manage-european-union-digital-services-act-trader-requirements/)
is required to submit app updates for apps distributed on the App Store in the
European Union (EU), in order to comply with the Digital Services Act.

![XML](/news/images/icons/calendar-post.svg)

## [Transition from XML to the App Store Connect API](/news/upcoming-
requirements/?id=07152024a)

Since July 15, 2024

Game Center management will no longer be supported by the XML feed as of July
15, 2024.  
  
Support for in-app purchases, subscriptions, metadata, and app pricing ended
on November 9, 2022.  
  
You can manage this content via the [App Store Connect REST API](/app-store-
connect/api/), which makes it easy to customize and automate your workflows.

![Approved reasons for APIs](/news/images/icons/calendar-post.svg)

## [Approved reasons for APIs](/news/upcoming-requirements/?id=05012024a)

Since May 1, 2024

You’ll need to include approved reasons for the [listed
APIs](/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api)
used by your app’s code (including from third-party SDKs) to upload a new or
updated app to App Store Connect.

![Xcode 15](/news/images/icons/calendar-post.svg)

## [Xcode 15](/news/upcoming-requirements/?id=04292024a)

Since April 29, 2024

Apps uploaded to App Store Connect must be built with [Xcode
15](https://apps.apple.com/us/app/xcode/id497799835?mt=12) for [iOS
17](https://developer.apple.com/ios/), [iPadOS
17](https://developer.apple.com/ipados/), [tvOS
17](https://developer.apple.com/tvos/), or [watchOS
10](https://developer.apple.com/watchos/) starting April 29, 2024.

[Learn about submitting your apps](/app-store/submitting/)

![Apple notary service update](/news/images/icons/calendar-post.svg)

## [Apple notary service update](/news/upcoming-requirements/?id=11012023a)

Since November 1, 2023

If you notarize Mac software with the Apple notary service using the altool
command-line utility or Xcode 13 or earlier, you’ll need to transition to the
notarytool command-utility or upgrade to Xcode 14 or later. Starting November
1, 2023, the Apple notary service will no longer accept uploads from altool or
Xcode 13 or earlier. Existing notarized software will continue to function
properly.

[Learn about notarizing
software](/documentation/security/notarizing_macos_software_before_distribution)

![Game Center entitlement and configuration
requirement](/news/images/icons/calendar-post.svg)

## [Game Center entitlement and configuration requirement](/news/upcoming-
requirements/?id=06262023a)

Since August 16, 2023

New apps and app updates for iOS, iPadOS, or tvOS offering Game Center
features need to include the Game Center entitlement in the entitlements plist
and have Game Center features configured in App Store Connect before you can
submit them to the App Store.

[Learn about configuring Game Center in
Xcode](/documentation/gamekit/enabling_and_configuring_game_center/)

[Learn about configuring Game Center in App Store Connect](/help/app-store-
connect/configure-game-center/enable-an-app-version-for-game-center/)

[View capability and entitlement updates](/help/account/reference/capability-
entitlement-updates/)

![Intermediate certificate update](/news/images/icons/calendar-post.svg)

## [Intermediate certificate update](/news/upcoming-
requirements/?id=08162023a)

Since August 16, 2023

Receipts in new apps and app updates submitted to the App Store, as well as
all apps in sandbox, will be signed with the SHA‑256 intermediate certificate.
If your app verifies App Store transactions using the
[AppTransaction](/documentation/storekit/apptransaction) and
[Transaction](/documentation/storekit/transaction) APIs, or the
[verifyReceipt](/documentation/appstorereceipts/verifyreceipt) web service
endpoint, no action is required.

If your app validates App Store [receipts on
device](/documentation/appstorereceipts/validating_receipts_on_the_device),
make sure your app will support the SHA-256 version of this certificate. New
apps and app updates that don’t support the SHA-256 version of this
certificate will no longer be accepted by the App Store starting August 16,
2023.

![tvOS 16.1 SDK](/news/images/icons/calendar-post.svg)

## [tvOS 16.1 SDK](/news/upcoming-requirements/?id=07312023a)

Since July 31, 2023

All tvOS apps submitted to the App Store must be built with Xcode 14.1 and
tvOS 16.1 SDK or later.

[Learn about submitting apps](/tvos/submit/)

![App Store global pricing update in May](/news/images/icons/calendar-
post.svg)

## [App Store global pricing update in May](/news/upcoming-
requirements/?id=05092023a)

Since May 9, 2023

Pricing for existing apps and one-time in-app purchases will be updated with
enhanced global prices across App Store storefronts using your current price
in the United States as the basis—unless you’ve made relevant updates after
March 8, 2023. This update has been deferred to later this year for the App
Store in Türkye.

[Learn more](/news/?id=74739es1)

![Xcode 14.1](/news/images/icons/calendar-post.svg)

## [Xcode 14.1](/news/upcoming-requirements/?id=04252023a)

Since April 25, 2023

iOS and iPadOS apps submitted to the App Store must be built with Xcode 14.1
and the iOS 16.1 SDK or later. And watchOS apps submitted to the App Store
must be built with Xcode 14.1 and the watchOS 9.1 SDK or later.

[Learn about submitting apps](/app-store/submitting/)

![Subscription reports](/news/images/icons/calendar-post.svg)

## [Transition from subscription reports version 1.2 to 1.3](/news/upcoming-
requirements/?id=03012023a)

Since March 1, 2023

Subscription reports version 1.2 will no longer be available as of March 1,
2023. If you automatically download subscription reports using the App Store
Connect API or Reporter, please update your query parameter to version 1.3 if
you haven’t already.

![XML](/news/images/icons/calendar-post.svg)

## [Transition from XML to App Store Connect API](/news/upcoming-
requirements/?id=11092022a)

Since November 9, 2022

The XML feed will no longer support in-app purchases, subscriptions, metadata,
or app pricing as of November 9, 2022. You can manage this content via the App
Store Connect REST API, which makes it easy to customize and automate your
workflows.  
  
The XML feed will continue to support existing Game Center management
functionality.

[Learn more about the API](/app-store-connect/api/)

![App Store](/news/images/icons/calendar-post.svg)

## [Online group event in-app purchases](/news/upcoming-
requirements/?id=06302022a)

Since June 30, 2022

App Store Review Guideline 3.11 requires apps offering paid online group
services to do so via in-app purchase. Given the recent resurgence of COVID
and its continued impact on in-person services, we’ve extended the most recent
deadline to June 30, 2022.

[Learn more](https://developer.apple.com/news/?id=i71db0mv)

![App Store](/news/images/icons/calendar-post.svg)

## [Account deletion within apps](/news/upcoming-requirements/?id=06302022b)

Since June 30, 2022

App Store Review Guideline 5.1.1 provides people with greater control over
their personal data by stating that all apps that allow for account creation
must also allow users to initiate deletion of their account from within the
app. Due to the complexity of implementing this requirement we’ve extended the
deadline to June 30, 2022.

[Learn more](https://developer.apple.com/news/?id=i71db0mv)

![Xcode 14](/news/images/icons/calendar-post.svg)

## [32-bit app support has been discontinued in Xcode 14](/news/upcoming-
requirements/?id=06062022a)

Since June 6, 2022

Starting with Xcode 14, the ability to build a single binary with both 32-bit
and 64-bit code has been removed. Xcode 14 will only build 64-bit apps. iOS
10, which was released in 2016, was the last version of iOS to run 32-bit
apps. As of iOS 11, all 32-bit apps installed on device will not launch.

[Learn more about Xcode](/xcode/)

![App Store](/news/images/icons/calendar-post.svg)

## [Xcode 13](/news/upcoming-requirements/?id=04252022a)

Since April 25, 2022

iOS and iPadOS apps submitted to the App Store must be built with Xcode 13 and
the iOS 15 SDK. And watchOS apps submitted to the App Store must be built with
Xcode 13 and the watchOS 8 SDK.

[Learn more](https://developer.apple.com/ios/submit/)

![App Store](/news/images/icons/calendar-post.svg)

## [Bank account holder address required in App Store Connect](/news/upcoming-
requirements/?id=11222021a)

Since October 22, 2021

Bank account holder’s address is required if you have bank account information
in App Store Connect. Account Holders, Admins, and Finance roles can now
provide a valid address in the Business section.

[Learn more](https://developer.apple.com/news/?id=ep8chzr8)

