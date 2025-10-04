  * [ Network Extension ](/documentation/networkextension)
  * [ URL filters ](/documentation/networkextension/url-filters)
  * Filtering traffic by URL 

Sample Code

# Filtering traffic by URL

Perform fast and robust filtering of full URLs by managing URL filtering
configurations.

[ Download ](https://docs-
assets.developer.apple.com/published/c9c981cf08eb/SimpleURLFilter.zip)

iOS 26.0+iPadOS 26.0+Xcode 26.0+

## [Overview](/documentation/NetworkExtension/filtering-traffic-by-
url#Overview)

Note

This sample code project is associated with WWDC25 session 234: [Filter and
tunnel network traffic with
NetworkExtension](https://developer.apple.com/videos/play/wwdc25/234/).

## [Configure the sample code
project](/documentation/NetworkExtension/filtering-traffic-by-url#Configure-
the-sample-code-project)

To configure the sample code project, do the following in Xcode:

  1. Set the developer team for all targets to your team so Xcode automatically manages the provisioning profile. For more information, see [Assign a project to a team](https://help.apple.com/xcode/mac/current/#/dev23aab79b4).

  2. Optionally build and run the Private Information Retrieval (PIR) server sample provided with the sample code download. If you have your own PIR server ready for use, you can use that instead.

## [See Also](/documentation/NetworkExtension/filtering-traffic-by-url#see-
also)

### [URL filters](/documentation/NetworkExtension/filtering-traffic-by-
url#URL-filters)

[`class
NEURLFilterManager`](/documentation/networkextension/neurlfiltermanager)

A class you use to configure and control a URL filter.

[`protocol
NEURLFilterControlProvider`](/documentation/networkextension/neurlfiltercontrolprovider)

A protocol that defines an object that’s responsible for fetching pre-filter
data.

[`class
NEURLFilterControlProviderConfiguration`](/documentation/networkextension/neurlfiltercontrolproviderconfiguration)

A class that defines app extension configurations for the URL Filter control
provider app extension.

[`class NEURLFilter`](/documentation/networkextension/neurlfilter)

A class used to voluntarily validate URLs for apps that don’t use WebKit or
the URL session API.

