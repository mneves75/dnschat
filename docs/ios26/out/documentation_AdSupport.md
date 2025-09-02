# AdSupport | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AdSupport
> Fetched: 2025-08-31T18:31:23.356Z

## [Overview](https://developer.apple.com/documentation/AdSupport#overview)

Use the AdSupport framework to obtain an advertising identifier. The [`advertisingIdentifier`](https://developer.apple.com/documentation/adsupport/asidentifiermanager/advertisingidentifier) is an alphanumeric string that’s unique to each device, and which you only use for advertising. On devices running iOS 14.5 and later and iPadOS 14.5 and later, your app must support `App Tracking Transparency` and define the purpose string [`NSUserTrackingUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSUserTrackingUsageDescription) before it can get the [`advertisingIdentifier`](https://developer.apple.com/documentation/adsupport/asidentifiermanager/advertisingidentifier) property.

### [Get an Advertising Identifier](https://developer.apple.com/documentation/AdSupport#Get-an-Advertising-Identifier)

Before requesting the advertising identifier for the first time, your app must make a one-time call to [`requestTrackingAuthorization(completionHandler:)`](<https://developer.apple.com/documentation/AppTrackingTransparency/ATTrackingManager/requestTrackingAuthorization(completionHandler:)>). That method presents the app-tracking authorization request to the user. The user chooses whether to allow tracking, but can change your app’s authorization at any time in Settings > Privacy > Tracking. You can determine the user’s intent by checking your app’s authorization status with [`trackingAuthorizationStatus`](https://developer.apple.com/documentation/AppTrackingTransparency/ATTrackingManager/trackingAuthorizationStatus).

To get the advertising identifier, follow these steps:

1.  Use the AdSupport framework to call the [`shared()`](<https://developer.apple.com/documentation/adsupport/asidentifiermanager/shared()>) class method to retrieve an instance of [`ASIdentifierManager`](https://developer.apple.com/documentation/adsupport/asidentifiermanager).
2.  Use the [`advertisingIdentifier`](https://developer.apple.com/documentation/adsupport/asidentifiermanager/advertisingidentifier) property to obtain the UUID.

The code below shows how to retrieve the advertising identifier.

```
import AdSupport


let sharedASIdentifierManager = ASIdentifierManager.shared()
var adID = sharedASIdentifierManager.advertisingIdentifier


```

The advertising identifier returns either a unique UUID, or all zeros. For more information on the returned value, see [`advertisingIdentifier`](https://developer.apple.com/documentation/adsupport/asidentifiermanager/advertisingidentifier).

For more information about asking users for permission to track, see [User Privacy and Data Use](https://developer.apple.com/app-store/user-privacy-and-data-use/).
