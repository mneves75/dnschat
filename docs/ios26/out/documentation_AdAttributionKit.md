# AdAttributionKit | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AdAttributionKit
> Fetched: 2025-08-31T18:31:18.198Z

## [Overview](https://developer.apple.com/documentation/AdAttributionKit#Overview)

AdAttributionKit helps advertisers measure the success of ad campaigns while helping maintain user privacy.

The API involves three participants:

- Ad networks that sign ads and receive postbacks after ads result in conversions
- Publisher apps that display ads from the ad networks
- Advertised apps that update conversion values as people engage with the app

Ad networks register with Apple to get an ad network ID and to use the API. Developers configure their apps to accept attributable ads from ad networks and receive copies of winning postbacks. For information about setup, see [Registering an ad network](https://developer.apple.com/documentation/adattributionkit/registering-an-ad-network), [Configuring a publisher app](https://developer.apple.com/documentation/adattributionkit/configuring-a-publisher-app), and [Configuring an advertised app](https://developer.apple.com/documentation/adattributionkit/configuring-an-advertised-app).

Below is the path of an ad impression that wins ad attribution. The ad network serves an ad that an app displays. A person taps the ad and downloads or reengages with the advertised app.  
![“A flow diagram showing the path of a winning ad impression. The diagram has two horizontal sections that contain rectangles. The top section is labeled Server and the bottom is labeled Device. The flow begins at the top left with the rectangle labeled Ad network serves ad. An arrow points down from it to a second rectangle in the bottom section labeled App presents ad, and another arrow points down from the second rectangle to a third labeled Download or reengagement. From the third rectangle, a dotted line on the right connects to a rectangle in the top section labeled Apple ensures crowd anonymity, and an arrow just below the dotted line connects to an adjacent rectangle labeled Person interacts with advertised app. A dotted line labeled Postback data tier connects downward from the Apple ensures crowd anonymity rectangle to the Person interacts with advertised app rectangle. An arrow connects the Person interacts with advertised app rectangle to a rectangle on the right labeled Multiple conversions that contains three subrectangles labeled Postback 1, Postback 2, and Postback 3. Arrows connect each subrectangle to a rectangle in the top section that contains two subrectangles labeled Ad Network (winning) and Developer.”](https://docs-assets.developer.apple.com/published/3b3d53d0451298e0d08b41db5f1d00eb/adattributionkit-winning-A%402x.png)

Apple determines a postback data tier for the conversion, and the device uses the tier later to determine the level of detail the postback can contain to help ensure crowd anonymity. For more information about the postback contents and the data tiers, see [Receiving postbacks in multiple conversion windows](https://developer.apple.com/documentation/adattributionkit/receiving-postbacks-in-multiple-conversion-windows).

If a person launches the app within an attribution time-window, the ad impression is eligible for postbacks. As that person engages with the app, the app updates the conversion value. The system provides three conversion windows if the ad network meets the criteria for conversion. The system sends the postbacks to the ad network, and to the app’s developer if they opt in to receive postbacks.

Devices send postbacks to multiple ad networks that sign their ads.

- One ad network receives postbacks, as part of multiple conversion windows, with a `did-win` parameter value of `true` for the ad impression that wins the ad attribution.
- For install conversions, up to five other ad networks receive a postback with a `did-win` parameter value of `false` if their ad impressions qualify for the attribution, but don’t win.
- For reengagement conversions, a single ad network may receive winning postbacks in multiple conversion windows. The framework doesn’t generate runner-up postbacks for reengagements.

The following diagram shows the path of ad impressions that qualify for, but don’t win, the ad attribution. Up to five ad networks receive a single nonwinning postback.

![“A flow diagram showing the path of a nonwinning ad impression. The diagram has two horizontal sections that contain rectangles. The top section is labeled Server and the bottom is labeled Device. The flow begins at the top left with the rectangle labeled Ad network serves ad. An arrow points down from it to a second rectangle in the bottom section labeled App presents ad, and another arrow points down from the second rectangle to a third labeled Download or reengagement. From the third rectangle, a dotted line on the right connects to a rectangle in the top section labeled Apple ensures crowd anonymity, and an arrow just below the dotted line connects to an adjacent rectangle labeled Person interacts with advertised app. A dotted line labeled Postback data tier connects downward from the Apple ensures crowd anonymity rectangle to the Person interacts with advertised app rectangle. An arrow connects the Person interacts with advertised app rectangle to a rectangle on the right labeled Postback that contains a stack of rectangles labeled Nonwinning postbacks. Arrows connect the rectangles to a collection of stacked rectangles in the top section labeled Ad Networks (nonwinning).”](https://docs-assets.developer.apple.com/published/ee17d89742ccefcdf3499b3c2fbcef6a/adattributionkit-non-winning-A%402x.png)

For more information about receiving ad attributions, including time-window details, information about install and reengagement conversions, and other constraints, see [Receiving ad attributions and postbacks](https://developer.apple.com/documentation/adattributionkit/receiving-ad-attributions-and-postbacks). The information in the postback that Apple cryptographically signs doesn’t include user- or device-specific data. It can include values from the ad network and the advertised app if providing those values meets the privacy threshold that Apple sets. For more information about postback values and postback data tiers, see [Receiving postbacks in multiple conversion windows](https://developer.apple.com/documentation/adattributionkit/receiving-postbacks-in-multiple-conversion-windows). For more information about the contents of postbacks, see [Verifying a postback](https://developer.apple.com/documentation/adattributionkit/verifying-a-postback).

### [Present ads, update conversion values, and receive attribution](https://developer.apple.com/documentation/AdAttributionKit#Present-ads-update-conversion-values-and-receive-attribution)

Each participant has specific responsibilities when using the APIs to present ads and receive attribution.

The ad network’s responsibilities are to:

- Register and provide its ad network identifier to developers. See [Registering an ad network](https://developer.apple.com/documentation/adattributionkit/registering-an-ad-network).
- Serve signed ads to the publisher app. See [Presenting ads in your app](https://developer.apple.com/documentation/adattributionkit/presenting-ads-in-your-app).
- Receive postbacks at the URL it establishes during registration.
- Verify the postbacks. See [Verifying a postback](https://developer.apple.com/documentation/adattributionkit/verifying-a-postback).

The publisher app’s responsibilities are to:

- Add the ad network identifiers to its information property list. See [Configuring a publisher app](https://developer.apple.com/documentation/adattributionkit/configuring-a-publisher-app).
- Display ads that the ad network signs. See [Presenting ads in your app](https://developer.apple.com/documentation/adattributionkit/presenting-ads-in-your-app).

The advertised app’s responsibilities are to:

- Register a conversion by updating the conversion value when a person first launches the app by calling one of the conversion updating methods, such as [`updateConversionValue(_:lockPostback:)`](<https://developer.apple.com/documentation/adattributionkit/postback/updateconversionvalue(_:lockpostback:)>).
- Optionally, continue to update the conversion value as the person engages with the app by calling one of the conversion updating methods, such as [`updateConversionValue(_:coarseConversionValue:lockPostback:)`](<https://developer.apple.com/documentation/adattributionkit/postback/updateconversionvalue(_:coarseconversionvalue:lockpostback:)>).
- Optionally, specify a server URL in its information property list to receive a copy of the winning postback. See [Configuring an advertised app](https://developer.apple.com/documentation/adattributionkit/configuring-an-advertised-app) .

Apple designs ad attribution APIs to help maintain user privacy. Apps don’t need to use [App Tracking Transparency](https://developer.apple.com/documentation/apptrackingtransparency) before calling ad attribution APIs, and can call these APIs regardless of their tracking authorization status. For more information about privacy, see [User privacy and data use](https://developer.apple.com/app-store/user-privacy-and-data-use/).
