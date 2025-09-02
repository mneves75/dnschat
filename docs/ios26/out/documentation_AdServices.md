# AdServices | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AdServices
> Fetched: 2025-08-31T18:31:22.120Z

Framework

## AdServices

Attribute app-download campaigns that originate from the App Store, Apple News, or Stocks on iOS devices.

iOS 14.3+iPadOS 14.3+Mac Catalyst 14.3+macOS 11.1+visionOS 1.0+

## [Overview](https://developer.apple.com/documentation/AdServices#overview)

The Apple Ads Attribution API is a solution that combines the AdServices framework on client devices and a RESTful API for server-side communication with Apple’s attribution server. The API retrieves attribution data from app downloads and redownloads from Apple Search Ads campaigns. Measure attribution data using specific Apple Search Ads campaign metadata against the performance of Apple Search Ads campaigns. See [Attribution payload](<https://developer.apple.com/documentation/adservices/aaattribution/attributiontoken()#Attribution-payload>) for attribution responses.

Some developers use a server-side integration with Mobile Measurement Providers (MMPs) for enhanced reporting. Developers also have the option to hand off attribution data to an MMP or to manage their attribution data themselves. The following diagram illustrates using the AdServices framework in combination with a RESTful endpoint to retrieve attribution data:

![A diagram showing the sequence of interaction between the AdServices framework and RESTful API.](https://docs-assets.developer.apple.com/published/f0cd7bd0fb49333e7481ce470651a1cf/ad_services-1%402x.png)

- In step 1, the AdServices framework makes a call to request a token.
- In step 2, the AdServices framework generates a token. For more detail, see [`attributionToken()`](<https://developer.apple.com/documentation/adservices/aaattribution/attributiontoken()>).
- In step 3, an MMP or developer uses the token in a RESTful API request to retrieve an attribution record from Apple’s attribution server. For more detail, see [Attribution payload](<https://developer.apple.com/documentation/adservices/aaattribution/attributiontoken()#Attribution-payload>).
- In step 4, the attribution record that returns has key-value pairs that correspond to your campaigns in the Apple Search Ads Campaign Management API. For more detail, see [Attribution payload descriptions](<https://developer.apple.com/documentation/adservices/aaattribution/attributiontoken()#Attribution-payload-descriptions>).
