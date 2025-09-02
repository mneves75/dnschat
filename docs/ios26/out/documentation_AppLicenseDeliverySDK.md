# App License Delivery SDK | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AppLicenseDeliverySDK
> Fetched: 2025-08-31T18:31:33.649Z

## [Overview](https://developer.apple.com/documentation/AppLicenseDeliverySDK#Overview)

This Swift SDK enables _digital rights management_ (DRM) for alternative distribution apps. Use this SDK to generate licenses for alternative app marketplaces you build with [MarketplaceKit](https://developer.apple.com/documentation/MarketplaceKit) or other apps that you distribute from your website. Alternative app marketplaces use this SDK to generate a license for each app that developers distribute on the marketplace. By licensing each download individually, you provide a secure installation experience similar to the App Store.

Use this SDK’s framework to implement a license server on your website back end that’s capable of running compiled Swift code. Then, publish endpoints for your license server in a standard location that the device’s operating system expects. On an as-needed basis, the system retrieves licenses from your endpoints when a person downloads:

- An alternative app marketplace from your website
- An app that developers distribute on your alternative app marketplace
- An app that you develop and distribute on your website

![A flow diagram that consists of two boxes stacked. The title of the upper box reads App web server and the title of the lower box reads The device’s OS. The flow begins with a stage at left in the lower box that reads Install request. A line extends to its right to a stage that reads Checks licensing endpoint. The diagram flow continues with an arrow upward into the upper-box to a stage that reads Provides licensing endpoint. Flow returns to the prior stage in the lower box and then continues to the right to a stage that reads Requests app license. Flow continues with an arrow upward to a stage in the upper box that reads Swift licenseing endpoint, which contains another box within it that reads Generates app license. A callout extends from the inner stage that reads App License Delivery SDK. Flow returns to the prior stage in the lower box and then continues to the right to a stage that reads Downloads app.](https://docs-assets.developer.apple.com/published/c876327122638bd2bbab73f72fab6637/app-license-delivery-hero%402x.png)

You can download this SDK from [Downloads](https://developer.apple.com/download/all/) if your developer account qualifies to distribute apps from your website. For more information, see [Distributing your app from your website](https://developer.apple.com/documentation/appdistribution/distributing-your-app-from-your-website).
