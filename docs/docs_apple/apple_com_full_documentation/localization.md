[Learn about new App Store pricing upgrades](/news/?id=dbrszv62)

# Expanding your app to new markets

The App Store is available in 175 regions and 40 languages to make it easy for
users around the world to discover and download your app. Localizing your app
helps make it relevant to a variety of cultures and languages, and provides an
opportunity to grow your business. Learn how to prepare your app for a global
audience and understand considerations for expanding into new markets.

## Structure your app for localization

Internationalization, the process of structuring your app’s code and UI for
localization, is a fundamental first step in building apps for a global
audience. With Apple’s powerful tools and technologies, including Xcode,
Foundation APIs, Auto Layout, and Unicode support, it’s easy to prepare your
apps to support multiple languages and regions, even before you know which
languages you’d like to add.

Xcode automatically separates user-visible text and images are separated from
executable code. When you translate these elements into other languages, you
can integrate the content back into your app as separate localized resource
files stored within the app bundle. Images — including image sets, Apple Watch
complications, Apple TV image stacks, Sprite Atlases, and symbol sets — can be
localized directly in your Asset Catalog. You can also use localized [SF
system symbols](/design/human-interface-guidelines/sf-symbols/overview/) and
set the directionality for custom symbols — for example, for right-to-left
languages like Arabic and Hebrew.

Use Foundation APIs to correctly express user-visible or dynamically-generated
values, such as dates, lengths, weights, prices, and currency symbols, across
different locales. Ensure your app accepts user-generated text in any language
and in multiple languages at once, independent of the user interface language.
This allows app content to appear in the user’s preferred language and format.
SwiftUI makes it easy to create localized apps. User-visible text is
automatically extracted by Xcode and default layout behaviors are
localization-ready. You can also take advantage of [Auto
Layout](/library/archive/documentation/UserExperience/Conceptual/AutolayoutPG/index.html)
to automatically adjust the dimensions and layouts of views, extensive Unicode
support to work with text from any language, the powerful text handling
technologies of Cocoa and Cocoa Touch to display, lay out, and edit text in
many languages, and much more.

With iOS and iPadOS, users can select their preferred language for your app
independent of their device language, making it easy for multilingual users to
switch between languages in your app. On macOS, users can set the language of
an app in the Language & Region section of System Preferences.

  * [Localize your SwiftUI app](/videos/play/wwdc2021/10220/)
  * [Localizing your app](/documentation/xcode/localizing_your_app/)

## Prepare for a global audience

#### Investigate market factors

Market-specific demographics, such as population, language, and purchasing
power, can help you better understand areas that might have an affinity or
need for your app. Every market has its own preferences for the types of apps
or categories customers most enjoy. For example, games are popular worldwide,
however strategy games may be more popular in a particular region. Consider
selecting markets with similar attributes to those in which you have already
established success, such as strong app downloads, sales, usage, or retention
metrics, as this may make for easier growth. When selecting a market, assess
how your app might fit in and how its value and functionality aligns with that
market’s needs. You may even identify a need in the market that is not yet
filled, allowing you to bring unique value to users with your app.

#### Use App Analytics to determine potential markets

If you offer your app worldwide but haven’t localized for particular regions,
you can look at key performance metrics, such as Product Page Views, App
Units, Sales, and Active Devices, filtered by territory. This can help you
determine if your app is attracting users in a particular territory that might
benefit from localization. For example, if your app is primarily in English
and you see lower than average retention or Sessions per Active Device in
Germany, you might consider adding German language support. Keep in mind that
some markets may have greater proficiency with your app’s primary language,
while others may require more significant localization work. Usage data such
as active devices, sessions, and retention include only users who have agreed
to share their diagnostics and usage information with you.

For more information on using App Analytics, view [Gain insights with
analytics](/app-store-connect/analytics/).

#### Consider local culture and customs

While your app and product page should each provide a consistent experience
across all markets, it’s sometimes valuable to refine certain elements for
cultural relevance. For example, you might try incorporating market-specific
content or cultural moments, such as special holiday content or regional art
styles. You may want to consider any local policies and market regulations, as
well as any political or religious sensitivities, to increase the likelihood
that your app is well received.

## Localize your app

#### Translate user-visible content

Use the [Xcode Export For Localization](/documentation/xcode/exporting-
localizations/) feature to automatically extract all localizable content,
including localized strings referenced from code, stringsdict files, and
Interface Builder files, as well as any localized assets. This process
shouldn’t require modifications to your source code, making it easy to work on
translations in-house or with an external localization service. Be sure to
also localize [purpose
strings](/documentation/uikit/protecting_the_user_s_privacy/requesting_access_to_protected_resources/)
for a consistent app experience, and consider localizing your privacy policy
so that all users have a clear understanding of how their data may be handled.

**Apple services.** Use Apple APIs to automatically present localized buttons,
payment sheets, errors, and more for [Apple Pay](/apple-pay/implementation/),
[Apple Wallet](/documentation/passkit/wallet/), and [Sign in with
Apple](/documentation/sign_in_with_apple/).

**Audiovisual media.** You can also provide localized support for audiovisual
media in your app using AVKit and AVFoundation. These
[frameworks](/documentation/avfoundation/media_assets_playback_and_editing/adding_subtitles_and_alternative_audio_tracks/)
provide built-in support for easily presenting subtitles and closed captions,
and for selecting alternative audio and video tracks.

**Localization services.** If choosing an external localization service to
help translate content, find out if they specialize in localizing for
particular languages, cultures, or categories, and confirm the levels of
quality assurance they provide. Providing the service with context about your
app and content can help increase efficiency and minimize translation errors.
Consider creating a guide with important details — for example, a playbook
with character names and personalities, explanations of jokes or humor, a
glossary of frequently used terms, and screenshots that show where the
translations will be used. Avoid machine translation as your only translation
method, since this can lead to inaccurate and low-quality translation because
it does not account for context, cultural sensitivities or language nuances.
For example, the “book” button in a hotel app might be incorrectly translated
to be “novel” rather than “reserve”.

  * [Xcode documentation: Localization](/documentation/Xcode/localization/)

#### Test your localization

Configure test plans in Xcode to easily run tests with different settings and
define your testing variants in one place. This helps flag any instances of
clipping, truncation, layout overlapping, or issues with right-to-left
formatting for the devices and languages you support. You can use the
Localization Screenshots feature to generate localized screenshots from
successful tests and export these screenshots for use in tutorials, marketing
materials, or your App Store product page. Once your app is localized, use
[TestFlight](/testflight/) to share your app with a group of users in the
market to get feedback and gather opportunities for improvement.

  * [Previewing localizations](/documentation/xcode/previewing-localizations/)
  * [Testing localizations when running your app](/documentation/xcode/testing-localizations-when-running-your-app/)

## Prepare for launch

#### Localize your product page

Localize your App Store metadata in App Store Connect — such as your app
description, keywords, app previews, and screenshots — for each of the regions
in which you offer your app. You can also translate your app’s name and tailor
your keywords to reflect the values of each market so your app might better
resonate with the local audience. You can use the App Store Connect API to
automate your metadata upload and management for multiple localizations.

  * [Localize App Store information](/help/app-store-connect/manage-app-information/localize-app-store-information/)
  * [Creating your product page](/app-store/product-page/)
  * [Automate your workflow with the App Store Connect API](/app-store-connect/api/)

#### International payment methods and pricing

The App Store handles payment processing, so it’s easy to offer your content
to users around the world. Users pay for your apps and in-app purchases with
credit or debit cards, carrier billing, digital wallets, or App Store and
iTunes gift cards, depending on regional availability.

When pricing your apps and in-app purchases, you’ll choose a price tier in App
Store Connect that contains prices already adjusted appropriately for the
market in each region. For auto-renewable subscriptions, you can choose from
800 price points across all available currencies and price tiers to offer
appropriate pricing for each storefront, with an additional 100 higher price
points available [upon request](/contact/request/app-store-higher-price-
points/).

  * [Set in-app purchase pricing](/help/app-store-connect/manage-consumable-and-non-consumable-in-app-purchases/manage-in-app-purchase-pricing/)
  * [Pricing subscriptions for each territory](/app-store/subscriptions/#territory)

#### Adapt your marketing strategy

When launching your app in a new market, adapt your marketing strategy to the
region to help your audience easily learn about your app and the value it
provides. Research which social networks or other channels are most popular
with local audiences, as these may vary significantly across markets, and use
them to spread the word about your app. Localize any materials you use in your
marketing and user acquisition efforts, such as screenshots, banners, and
advertisements.

**App Store badges.** Use the Download on the App Store badge in your
communications as a clear call to action to download your app. Localized
badges are available to let your international audience know that your app is
tailored for them. Download badges from the [App Store Marketing
Guidelines](/app-store/marketing/guidelines/).

**App Store marketing tools.** Generate short links or embeddable code that
lead to your App Store product page and display your app icon, a QR code, or
an App Store badge. You can also create custom marketing assets — such as
banners and images — and add preset messages in multiple languages to promote
your apps in your regional advertising efforts. View [App Store marketing
tools](https://toolbox.marketingtools.apple.com/app-store/).

**Apple Ads.** Promote your app across the App Store. Reach people on the
Today tab, on the Search tab, at the top of search results, and at the bottom
of product pages. Available in 91 countries and regions. Try it for free with
a 100 USD credit.* [Learn more and read developer success
stories](https://ads.apple.com/app-store/).

*Eligible developers who sign up for Apple Ads will have a 100 USD credit applied to their new account. [Full terms and conditions apply](https://ads.apple.com/app-store/promo-terms/).

## Evaluate success

Use App Analytics in App Store Connect to find out how customers discover and
engage with your app, and filter this data by the territories in which you’ve
expanded. See how many users discover your app while searching or browsing on
the App Store and measure the percentage of views that result in a first-time
download. Find out if users continue to use your app, and see the number of
installations, sessions, and active devices. Compare this data to that of
other markets where your app has been available longer. You may find you need
to adjust your marketing strategy or better localize your app to improve
performance. Once you’ve found success in your chosen markets, you can
identify new markets and add additional localizations to provide a great user
experience for even more customers.

[Learn about measuring app performance](/app-store/measuring-app-performance/)

## Resources

Find tools, documentation, and resources you need to localize your app and
product page.

[Learn more](/localization/resources/)

