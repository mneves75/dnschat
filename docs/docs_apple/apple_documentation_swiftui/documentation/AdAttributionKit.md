Framework

# AdAttributionKit

Present, process, and register postbacks for in-app ads in the App Store and
alternative app marketplaces.

iOS 17.4+iPadOS 17.4+Mac Catalyst 17.4+

## [Overview](/documentation/AdAttributionKit#Overview)

AdAttributionKit helps advertisers measure the success of ad campaigns while
helping maintain user privacy.

The API involves three participants:

  * Ad networks that sign ads and receive postbacks after ads result in conversions

  * Publisher apps that display ads from the ad networks

  * Advertised apps that update conversion values as people engage with the app

Ad networks register with Apple to get an ad network ID and to use the API.
Developers configure their apps to accept attributable ads from ad networks
and receive copies of winning postbacks. For information about setup, see
[Registering an ad network](/documentation/adattributionkit/registering-an-ad-
network), [Configuring a publisher
app](/documentation/adattributionkit/configuring-a-publisher-app), and
[Configuring an advertised app](/documentation/adattributionkit/configuring-
an-advertised-app).

Below is the path of an ad impression that wins ad attribution. The ad network
serves an ad that an app displays. A person taps the ad and downloads or
reengages with the advertised app.  

Apple determines a postback data tier for the conversion, and the device uses
the tier later to determine the level of detail the postback can contain to
help ensure crowd anonymity. For more information about the postback contents
and the data tiers, see [Receiving postbacks in multiple conversion
windows](/documentation/adattributionkit/receiving-postbacks-in-multiple-
conversion-windows).

If a person launches the app within an attribution time-window, the ad
impression is eligible for postbacks. As that person engages with the app, the
app updates the conversion value. The system provides three conversion windows
if the ad network meets the criteria for conversion. The system sends the
postbacks to the ad network, and to the app’s developer if they opt in to
receive postbacks.

Devices send postbacks to multiple ad networks that sign their ads.

  * One ad network receives postbacks, as part of multiple conversion windows, with a `did-win` parameter value of `true` for the ad impression that wins the ad attribution.

  * For install conversions, up to five other ad networks receive a postback with a `did-win` parameter value of `false` if their ad impressions qualify for the attribution, but don’t win.

  * For reengagement conversions, a single ad network may receive winning postbacks in multiple conversion windows. The framework doesn’t generate runner-up postbacks for reengagements.

The following diagram shows the path of ad impressions that qualify for, but
don’t win, the ad attribution. Up to five ad networks receive a single
nonwinning postback.

For more information about receiving ad attributions, including time-window
details, information about install and reengagement conversions, and other
constraints, see [Receiving ad attributions and
postbacks](/documentation/adattributionkit/receiving-ad-attributions-and-
postbacks). The information in the postback that Apple cryptographically signs
doesn’t include user- or device-specific data. It can include values from the
ad network and the advertised app if providing those values meets the privacy
threshold that Apple sets. For more information about postback values and
postback data tiers, see [Receiving postbacks in multiple conversion
windows](/documentation/adattributionkit/receiving-postbacks-in-multiple-
conversion-windows). For more information about the contents of postbacks, see
[Verifying a postback](/documentation/adattributionkit/verifying-a-postback).

### [Present ads, update conversion values, and receive
attribution](/documentation/AdAttributionKit#Present-ads-update-conversion-
values-and-receive-attribution)

Each participant has specific responsibilities when using the APIs to present
ads and receive attribution.

The ad network’s responsibilities are to:

  * Register and provide its ad network identifier to developers. See [Registering an ad network](/documentation/adattributionkit/registering-an-ad-network).

  * Serve signed ads to the publisher app. See [Presenting ads in your app](/documentation/adattributionkit/presenting-ads-in-your-app).

  * Receive postbacks at the URL it establishes during registration.

  * Verify the postbacks. See [Verifying a postback](/documentation/adattributionkit/verifying-a-postback).

The publisher app’s responsibilities are to:

  * Add the ad network identifiers to its information property list. See [Configuring a publisher app](/documentation/adattributionkit/configuring-a-publisher-app).

  * Display ads that the ad network signs. See [Presenting ads in your app](/documentation/adattributionkit/presenting-ads-in-your-app).

The advertised app’s responsibilities are to:

  * Register a conversion by updating the conversion value when a person first launches the app by calling one of the conversion updating methods, such as [`updateConversionValue(_:lockPostback:)`](/documentation/adattributionkit/postback/updateconversionvalue\(_:lockpostback:\)).

  * Optionally, continue to update the conversion value as the person engages with the app by calling one of the conversion updating methods, such as [`updateConversionValue(_:coarseConversionValue:lockPostback:)`](/documentation/adattributionkit/postback/updateconversionvalue\(_:coarseconversionvalue:lockpostback:\)).

  * Optionally, specify a server URL in its information property list to receive a copy of the winning postback. See [Configuring an advertised app](/documentation/adattributionkit/configuring-an-advertised-app) .

Apple designs ad attribution APIs to help maintain user privacy. Apps don’t
need to use [App Tracking
Transparency](https://developer.apple.com/documentation/apptrackingtransparency)
before calling ad attribution APIs, and can call these APIs regardless of
their tracking authorization status. For more information about privacy, see
[User privacy and data use](https://developer.apple.com/app-store/user-
privacy-and-data-use/).

## [Topics](/documentation/AdAttributionKit#topics)

### [Essentials](/documentation/AdAttributionKit#Essentials)

[Understanding AdAttributionKit and SKAdNetwork
interoperability](/documentation/adattributionkit/adattributionkit-
skadnetwork-interoperability)

Learn how attribution APIs interact to deliver ad impressions.

[Presenting ads in your app](/documentation/adattributionkit/presenting-ads-
in-your-app)

Render different ad styles in your app.

[Receiving ad attributions and
postbacks](/documentation/adattributionkit/receiving-ad-attributions-and-
postbacks)

Understand timeframes and priorities for ad impressions that result in ad
attributions, and how impressions qualify for postbacks.

[Identifying conversion values with conversion
tags](/documentation/adattributionkit/conversion-tags)

Use conversion tags to identify and update specific postbacks when you have
overlapping conversion windows.

### [Ad network registration and
configuration](/documentation/AdAttributionKit#Ad-network-registration-and-
configuration)

[Registering an ad network](/documentation/adattributionkit/registering-an-ad-
network)

Use the AdAttributionKit APIs for your ad campaigns after registering your ad
network with Apple.

[Configuring a publisher app](/documentation/adattributionkit/configuring-a-
publisher-app)

Set up a publisher app to participate in ad campaigns.

[Configuring an advertised app](/documentation/adattributionkit/configuring-
an-advertised-app)

Prepare an advertised app to participate in ad campaigns.

[Configuring attribution rules for your
app](/documentation/adattributionkit/configuring-attribution-rules-for-your-
app)

Tune aspects of attribution flow, including the time available to register
impressions and the minimum time your app is willing to accept conversions.

### [Ad attribution testing](/documentation/AdAttributionKit#Ad-attribution-
testing)

[Testing ad attributions with Developer
Mode](/documentation/adattributionkit/testing-adattributionkit-with-developer-
mode)

Reduce the time-window for ad attributions and inspect postbacks using a proxy
during testing.

[Creating postbacks in developer
settings](/documentation/adattributionkit/creating-postbacks-in-developer-
settings)

Test development postbacks for your advertised app without interacting with
ads from a publisher app.

[Testing ad attributions with a downloaded
profile](/documentation/adattributionkit/testing-ad-attributions-with-a-
downloaded-profile)

Reduce the time-window for ad attributions and inspect postbacks using a proxy
during testing.

### [Signatures](/documentation/AdAttributionKit#Signatures)

[Generating JWS impressions](/documentation/adattributionkit/generating-jws-
impressions)

Create a JSON Web Signature (JWS) for use with app impressions in
AdAttributionKit.

### [App impressions](/documentation/AdAttributionKit#App-impressions)

[`struct AppImpression`](/documentation/adattributionkit/appimpression)

A structure that represents an attributable impression the developer generates
in response to a person’s interaction with an ad in an app.

### [Postbacks](/documentation/AdAttributionKit#Postbacks)

[`struct Postback`](/documentation/adattributionkit/postback)

A structure that provides methods you use to update conversion values for ad
attributions.

[`struct PostbackUpdate`](/documentation/adattributionkit/postbackupdate)

Values you use to update properties in a postback, such as the conversion
value.

[`enum
CoarseConversionValue`](/documentation/adattributionkit/coarseconversionvalue)

Values that describe developer-defined, relative-attribution conversion
values.

### [Postback verification and parameter
identification](/documentation/AdAttributionKit#Postback-verification-and-
parameter-identification)

[Verifying a postback](/documentation/adattributionkit/verifying-a-postback)

Ensure the validity of a postback you receive after an ad conversion by
verifying its cryptographic signature.

[Identifying the parameters in a
postback](/documentation/adattributionkit/identifying-the-parameters-in-a-
postback)

Interpret postback properties to understand the attribution report.

### [Errors](/documentation/AdAttributionKit#Errors)

[`enum
AdAttributionKitError`](/documentation/adattributionkit/adattributionkiterror)

Values that describe ad attribution error conditions.

### [Articles](/documentation/AdAttributionKit#Articles)

[Receiving postbacks in multiple conversion
windows](/documentation/adattributionkit/receiving-postbacks-in-multiple-
conversion-windows)

Learn about the data that postbacks can contain in each conversion window.

