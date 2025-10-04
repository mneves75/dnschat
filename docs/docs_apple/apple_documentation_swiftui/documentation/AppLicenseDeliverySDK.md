Framework

# App License Delivery SDK

Secure the installation of alternative distribution apps on iOS or iPadOS
devices by vending licenses from your web server.

## [Overview](/documentation/AppLicenseDeliverySDK#Overview)

This Swift SDK enables _digital rights management_ (DRM) for alternative
distribution apps. Use this SDK to generate licenses for alternative app
marketplaces you build with [MarketplaceKit](/documentation/MarketplaceKit) or
other apps that you distribute from your website. Alternative app marketplaces
use this SDK to generate a license for each app that developers distribute on
the marketplace. By licensing each download individually, you provide a secure
installation experience similar to the App Store.

Use this SDK’s framework to implement a license server on your website back
end that’s capable of running compiled Swift code. Then, publish endpoints for
your license server in a standard location that the device’s operating system
expects. On an as-needed basis, the system retrieves licenses from your
endpoints when a person downloads:

  * An alternative app marketplace from your website

  * An app that developers distribute on your alternative app marketplace

  * An app that you develop and distribute on your website

You can download this SDK from
[Downloads](https://developer.apple.com/download/all/) if your developer
account qualifies to distribute apps from your website. For more information,
see [Distributing your app from your
website](/documentation/appdistribution/distributing-your-app-from-your-
website).

Platform, OS, and tools requirements

Apple silicon Macs, Intel Macs, macOS 13.5+, select Linux versions on x86_64,
and Xcode 15+ (including the macOS 14 SDK).

## [Topics](/documentation/AppLicenseDeliverySDK#topics)

### [Essentials](/documentation/AppLicenseDeliverySDK#Essentials)

[Configuring your app licensing
environment](/documentation/applicensedeliverysdk/configuring-the-app-
licensing-environment)

Create your account-level signing assets and build the SDK for your target
platform.

### [App licensing](/documentation/AppLicenseDeliverySDK#App-licensing)

[Licensing alternative distribution
apps](/documentation/applicensedeliverysdk/licensing-alternative-distribution-
apps)

Build a license server that supports the installation of your apps and the
apps available in your marketplace.

[Renewing and revoking app
licenses](/documentation/applicensedeliverysdk/renewing-and-revoking-app-
licenses)

Determine whether an app for which you issue a license launches.

[`struct ALDAppKey`](/documentation/applicensedeliverysdk/aldappkey)

A structure that identifies an app and a key that’s required to decrypt the
app’s license request.

[`struct
ALDLicenseAttribute`](/documentation/applicensedeliverysdk/aldlicenseattribute)

A structure that defines the requested license type for the session.

[`class ALDProvider`](/documentation/applicensedeliverysdk/aldprovider)

An object that creates a session with the alternative app marketplace’s
signing assets.

[`class ALDSession`](/documentation/applicensedeliverysdk/aldsession)

A structure that contains the details of a license request and methods to
generate license responses.

