# Communication and promotion of offers on the App Store in the EU

In response to the recent order from the European Commission, developers have
more options for digital goods or services transactions in their apps
distributed on the App Store in the EU across iOS, iPadOS, macOS, tvOS,
visionOS, and watchOS. These include the ability to continue using the App
Store payment processing and related commerce services as well as
communicating and promoting offers in the app for digital goods or services,
including steering to transactions other than App Store In-App Purchase.

Developers who use the External Purchase Link Entitlement under the updated
Alternative Terms Addendum for Apps in the EU or the StoreKit External
Purchase Link Entitlement (EU) Addendum, will be able to:

  * Communicate and promote offers for purchases available at a destination of their choice. The destination can be a website, alternative app marketplace, or another app, and can be accessed outside the app or via a web view or native experience.
  * Design and execute within their apps the communication and promotion of offers. This includes providing information about prices of subscriptions or any other offer available both within or outside the app, and providing explanations or instructions about how to subscribe to offers outside the application. These communications must provide accurate information regarding the digital goods or services available for purchase.
  * Choose to use an actionable link that can be tapped, clicked, or scanned, to take users to their destination.
  * Use any number of URLs, without declaring them in the app’s Info.plist.
  * Implement links with additional parameters, redirects, and intermediate links to landing pages.
  * Move their apps to a lower tier of mandatory store services and pay a reduced store services fee.

* * *

## About the communication and promotion of offers

### Important considerations

Communicating and promoting offers in the app for digital goods or services
can create new threats to user security and privacy, and may compromise the
user experience. Developers considering use of these alternative options
should understand that some OS or App Store features may not work as users
expect. Helpful App Store features — like Report a Problem, Family Sharing,
and Ask to Buy — will also not reflect these transactions. Users may have to
share their payment information with additional parties, creating more
opportunities for bad actors to steal sensitive financial information. And on
the App Store, users’ purchase history and subscription management will only
reflect transactions made using the App Store’s In‑App Purchase system. Apple
will have less ability to support or refund customers encountering issues,
scams, or fraud.

If you choose to communicate and promote offers in your application, you’re
also responsible for managing payment or billing issues, taxes, and other
features currently supported by the App Store’s In-App Purchase system. In
addition, you’re responsible for complying with all applicable laws and
regulations related to payment processing, cancellation of transactions,
refunds, privacy, etc.

### Storefront options

You can define which EU markets will use the App Store’s In‑App Purchase
system, and which communicate and promote offers in the app. Due to the App
Store’s tight integration with In‑App Purchase and to reduce confusion for
users, you won’t be able to offer In‑App Purchase while communicating and
promoting offers within the same app on the same App Store storefront and
platform. If you want to continue using the App Store’s In‑App Purchase
system, you may do so and no action is needed. Information about purchasing on
other channels may not be included on your App Store product page.

### User disclosures

To help users understand whether an app uses these alternatives, the App Store
will display an informational banner on the app’s product page and a
disclosure in the Information section, and the download confirmation will have
an External Purchases notation.

![](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/screen-alt-product-page-medium_2x.png)

![](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/screen-alt-information-medium_2x.png)

![](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/screen-alt-confirmation-medium_2x.png)

Apps that include these options must use the StoreKit External Purchase Link
Entitlement and StoreKit External Purchase APIs to present users with the
system-provided disclosure sheet that lets users know they’ll be transacting
with the developer and not Apple. Users can opt out of seeing the disclosure
sheet before subsequent purchases.

### Store services options

The App Store’s single commission on digital goods or services is designed to
reflect the many ways Apple creates value for developers. This includes
everything from App Store distribution and discovery, secure payment
processing, and commerce services, to the trusted and secure platforms and all
the tools and technology to build and share innovative apps with users around
the world.

By default, apps on the App Store are provided Store Services Tier 2, the
complete suite of all capabilities designed to maximize visibility,
engagement, growth, and operational efficiency. Developers with apps on the
App Store in the EU that communicate and promote offers for digital goods or
services can choose to move their apps to only use Store Services Tier 1 and
pay a reduced store services fee.

  * Store Services Tier 1: This tier provides capabilities needed for app delivery, trust & safety, app management, and engagement; and features a reduced store services fee. This tier is mandatory for apps communicating and promoting offers.
  * Store Services Tier 2: This tier is optional, and provides additional capabilities for app delivery and management, engagement, curation & personalization, app insights, and developer marketing.

Developers can move an app between tiers on a per-app, per-storefront basis
once a quarter.

To view the list of features available in the service tiers, see [Store
Services in the EU](/help/app-store-connect/reference/store-services-tiers).
If you’d like to update your app’s services tier, the Account Holder of your
program membership can [submit an update form](/contact/request/store-
services-tiers/).

* * *

## Get started

To get started with new options to communicate and promote offers for digital
goods or services for apps distributed in the EU, the Account Holder of your
Apple Developer Program membership will need to agree to either the updated
**[Alternative Terms Addendum for Apps in the
EU](/contact/request/alternative-eu-terms-addendum/)** or the **[StoreKit
External Purchase Link Entitlement (EU) Addendum](/contact/request/storekit-
external-purchase-link-entitlement-eu/)**. By agreeing to either set of terms,
your account will be assigned the External Purchase Link Entitlement required
to communicate and promote offers in your app. When using this entitlement,
you’ll need to:

  * Use required StoreKit External Purchase APIs;
  * Follow usage requirements and specifications designed to help protect people’s privacy and security, prevent scams and fraudulent activity;
  * Report external purchase tokens and transactions related to the tokens using the External Purchase Server API; and
  * Pay applicable fees and commissions.

### Alternative Terms Addendum for Apps in the EU

If you agree to the [Alternative Terms Addendum for Apps in the
EU](/contact/request/alternative-eu-terms-addendum/), your developer account
will be assigned the StoreKit External Purchase Link Entitlement to enable the
communication and promotion of offers. The agreement allows for two ways to
offer digital goods or services for sale, and includes new business terms.

  1. **App Store payment processing and related commerce services:** Use the In‑App Purchase system from the App Store to complete user transactions for digital goods and services within your app. 
     * **Reduced commission.** For iOS and iPadOS apps on the App Store, you’ll pay a reduced commission of either 10% (for the vast majority of developers and for subscriptions after their first year) or 17% on transactions for digital goods and services, regardless of the payment processing system selected.
     * **Payment processing fee.** Apps on the App Store can use App Store payment processing and commerce capabilities for an additional 3% fee.
  2. **Communication and promotion of offers:** Communicate and promote offers, including steering to transactions other than App Store In-App Purchase, to end users regarding digital goods or services that are available for purchase in a distribution channel of your choice. The distribution channel can be a website, alternative app marketplace, or another app, whether operated by you or someone else, and it can be accessed outside the app, or appear within the app in a web view or native experience. In addition, you may choose to take users to the destination using an actionable link (i.e., a link that can be tapped, clicked, or scanned). 
     * **Initial acquisition fee.** The initial acquisition fee applies when a customer purchases a digital good or service using an actionable link from your app within a 6 month period after their initial unpaid download of your app. The fee reflects the capabilities the App Store provides when connecting developers with customers in the EU.
     * **Store services fee.** In addition to the initial acquisition fee, you’ll pay Apple a fee on all sales of digital goods or services that occur within a 12-month period from the date of an install, including app updates and reinstalls, after you make your app available with the entitlement profile to communicate and promote offers. This reflects the ongoing services and capabilities that Apple provides developers, including app distribution and management; App Store trust and safety; re-discovery, re-engagement, and promotional tools and services; app insights, and more.

The initial acquisition fee and store services fees do not apply to auto-
renewals of subscriptions entered into previously, or to sales made pursuant
to your use of the App Store’s In-App Purchase system. Reduced fees apply to:

  * Developers enrolled in the [App Store Small Business Program](/app-store/small-business-program/)
  * Auto-renewing subscriptions beyond one year
  * Apps that use only Store Services - Tier 1

##### Store Services - Tier 1

For apps using mandatory store services

Commission/Fee | Rate | Program Rate* | Description  
---|---|---|---  
Initial acquisition fee | 2% | 0% | Within 6 months after the first install of your app.  
Store services fee | 5% | 5% | Within 12 months of the most recent install, update, or reinstall.  
Core Technology Fee (CTF) | €0.50 | €0.50 | iOS and iPadOS apps that exceed 1 million first annual installs per year distributed on the App Store, Web Distribution, and/or an alternative app marketplace.  
  
##### Store Services - Tier 2

For apps using optional store services

Commission/Fee | Rate | Program Rate* | Description  
---|---|---|---  
Initial acquisition fee | 2% | 0% | Within 6 months after the first install of your app.  
Store services fee | 13% | 10% | Within 12 months of the most recent install, update, or reinstall.  
Core Technology Fee (CTF) | €0.50 | €0.50 | iOS and iPadOS apps that exceed 1 million first annual installs per year distributed on the App Store, Web Distribution, and/or an alternative app marketplace.  
  
*For App Store Small Business Program participants or subscriptions after their first year.

**Core Technology Fee (CTF).** For iOS and iPadOS apps distributed on the App
Store, Web Distribution, and/or an alternative app marketplace that exceed 1
million first annual installs per year, you’ll pay €0.50 for each first annual
install. Membership in the Apple Developer Program includes 1 million first
annual installs per year for free for each of your apps in the EU.

[Learn more about the CTF](/support/core-technology-fee/)

### StoreKit External Purchase Link Entitlement (EU) Addendum

If you [agree to this addendum](/contact/request/storekit-external-purchase-
link-entitlement-eu/) to the Apple Developer Program License Agreement, your
developer account will be assigned the StoreKit External Purchase Link
Entitlement. The agreement allows the ability to communicate and promote
offers for purchases of digital goods or services for apps distributed on the
App Store in the EU and includes new business terms for those transactions.

**Communication and promotion of offers:** Communicate and promote offers,
including steering to transactions other than App Store In-App Purchase, to
end users regarding digital goods or services that are available for purchase
in a distribution channel of your choice. The distribution channel can be a
website, alternative app marketplace, or another app, whether operated by you
or someone else, and it can be accessed outside the app, or appear within the
app in a web view or native experience. In addition, you may choose whether to
take users to the destination using an actionable link (i.e., a link that can
be tapped, clicked, or scanned).

  * **Initial acquisition fee.** The initial acquisition fee applies when a customer purchases a digital goods or services using an actionable link from your app within a 6-month period after their initial unpaid download of your app. The fee reflects the capabilities the App Store provides when connecting developers with customers in the EU.
  * **Store services fee.** In addition to the initial acquisition fee, you’ll pay Apple a fee on all sales of digital goods or services that occur within a 12-month period from the date of an install, including app updates and reinstalls. This reflects the ongoing services and capabilities that Apple the App Store provides developers, including tools and technologies; app distribution and management; App Store trust and safety; re-discovery, re-engagement, and promotional tools and services; app insights, and more.
  * **Core Technology Commission.** You’ll also pay Apple a fee on all sales of digital goods or services that occur within a 12-month period from the date of an install, including app updates and reinstalls. This fee reflects value Apple provides developers through ongoing investments in tools, technologies, and services that enable them to build and share innovative apps with users.

The initial acquisition fee, store services fees, and Core Technology
Commission on these options do not apply to transactions made outside your app
that were communicated and promoted without an actionable link, auto-renewals
of subscriptions entered into previously, or to sales made pursuant to your
use of the App Store’s In-App Purchase system. Reduced fees apply to:

  * Developers enrolled in the [App Store Small Business Program](/app-store/small-business-program/)
  * Auto-renewing subscriptions beyond one year
  * Apps that use only Store Services - Tier 1

##### Store Services - Tier 1

For apps using mandatory store services

Commission/Fee | Rate | Program Rate* | Description  
---|---|---|---  
Initial acquisition fee | 2% | 0% | Within 6 months after the first install of your app.  
Store services fee | 5% | 5% | Within 12 months of the most recent install, update, or reinstall.  
Core Technology Commission (CTC) | 5% | 5% | Within 12 months of the most recent install, update, or reinstall.  
  
##### Store Services - Tier 2

For apps using optional store services

Commission/Fee | Rate | Program Rate* | Description  
---|---|---|---  
Initial acquisition fee | 2% | 0% | Within 6 months after the first install of your app.  
Store services fee | 13% | 10% | Within 12 months of the most recent install, update, or reinstall.  
Core Technology Commission (CTC) | 5% | 5% | Within 12 months of the most recent install, update, or reinstall.  
  
*For App Store Small Business Program participants or subscriptions after their first year.

## Usage requirements

In addition to using the StoreKit External Purchase Link Entitlement and
required StoreKit External Purchase APIs when communicating and promoting
offers to users for other channels to purchase digital goods or services,
you’ll need to follow usage requirements designed to help protect people’s
privacy and security, prevent scams and fraudulent activity, and maintain the
overall quality of the user experience. Follow these usage requirements:

#### Communicating and promoting offers for digital goods or services within
your app

  * These options cannot be used on the same EU storefront and platform where your app uses the App Store In‑App Purchase system.
  * Your in‑app user flow may not contain any hidden, dormant, or undocumented payment functionality or behavior. 
  * Check and confirm that the user is in an EU storefront and can make payments.
  * Provide accurate information regarding the digital goods and services available for purchase on the channel.
  * Don’t include Information about purchasing on other channels on your App Store product page.
  * Ensure that all digital goods or services sold which are marketed as being for use in an app must be available for use in that app.

If your app engages in misleading marketing practices, such as bait and
switch, scams, or fraud, it will be removed from the App Store and you may be
removed from the Apple Developer Program.

#### Checking eligibility

You’ll need to determine eligibility using the
`ExternalPurchaseCustomLink.isEligible` property. For apps running on an
earlier OS than iOS 18.1, iPadOS 18.1, macOS 15.1, tvOS 18.1, visionOS 2.1,
and watchOS 11.1, you’ll need to manually implement the eligibility check
following these steps in an app that has the StoreKit External Purchase Link
Entitlement:

  1. Check [canMakePayments](/documentation/storekit/appstore/3822277-canmakepayments). If the value is `false`, the customer can’t authorize payments and eligibility fails; don’t present external purchases. If the value is `true`, continue to the next step.
  2. Check that the app is running in a storefront where external purchase links are allowed, and where your app supports external purchases. Get the [current](/documentation/storekit/storefront/3803207-current) value of the [Storefront](/documentation/storekit/storefront) API, and check its [countryCode](/documentation/storekit/storefront/3792000-countrycode) value. The allowed regions are: Austria (`at`), Belgium (`be`), Bulgaria (`bg`), Croatia (`hr`), Cyprus (`cy`), Czechia (`cz`), Denmark (`dk`), Estonia (`ee`), Finland (`fi`), France (`fr`), Germany (`de`), Greece (`gr`), Hungary (`hu`), Ireland (`ie`), Italy (`it`), Latvia (`lv`), Lithuania (`lt`), Luxembourg (`lu`), Malta (`mt`), Netherlands (`nl`), Poland (`pl`), Portugal (`pt`), Romania (`ro`), Slovakia (`sk`), Slovenia (`si`), Spain (`es`), Sweden (`se`)
  3. Eligibility succeeds if the current storefront is within the allowed regions, and your app supports external purchases in the same region. Otherwise, eligibility fails.

### In-app disclosure sheet

![](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/screen-in-app-disclosure-large_2x.png)

![](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/screen-in-app-disclosure2-large_2x.png)

When taking users to their destination using an actionable link (i.e., a link
that can be tapped, clicked, or scanned), your app must use the
[ExternalPurchaseCustomLink
API](https://developer.apple.com/documentation/storekit/externalpurchasecustomlink/shownotice\(type:\))
to display a system-provided disclosure sheet that explains to the user
they’ll be transacting with the developer and not Apple.

  * By tapping the Continue button, users will be directed to the developer’s preferred channel.
  * Users are given the option to not show the disclosure sheet before subsequent purchases with "Show This Reminder Next Time?" modal dialog.

### Design resources

![](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/screen-sign-in-medium_2x.png)

Sign in screen

![](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/screen-account-medium_2x.png)

Account screen

![](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/screen-app-page-medium_2x.png)

App page

Developers may design the promotion and communication of offers within their
apps. Apple is providing the following optional
[templates](/support/downloads/Link-out-template.zip) for various use cases as
a resource for your apps. These templates follow the Plain Button style, as
specified in the [Human Interface Guidelines](/design/human-interface-
guidelines/buttons#Platform-considerations/), and are localized in 40 locales.

**Purchase template:**

Purchase from the website at www.example.com ![Link-out
icon](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/link-out-light.svg)![Link-out icon](/support/images/alternative-payment-
options-on-the-app-store-in-the-eu/link-out-dark.svg)

**Special offer template:**

For special offers, go to www.example.com ![Link-out
icon](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/link-out-light.svg)![Link-out icon](/support/images/alternative-payment-
options-on-the-app-store-in-the-eu/link-out-dark.svg)

For a special offer, go to www.example.com ![Link-out
icon](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/link-out-light.svg)![Link-out icon](/support/images/alternative-payment-
options-on-the-app-store-in-the-eu/link-out-dark.svg)

**Lower price template:**

Lower prices offered on  www.example.com ![Link-out
icon](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/link-out-light.svg)![Link-out icon](/support/images/alternative-payment-
options-on-the-app-store-in-the-eu/link-out-dark.svg)

Lower price offered on  www.example.com ![Link-out
icon](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/link-out-light.svg)![Link-out icon](/support/images/alternative-payment-
options-on-the-app-store-in-the-eu/link-out-dark.svg)

**Percent off template:**

To get XX% off, go to www.example.com ![Link-out
icon](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/link-out-light.svg)![Link-out icon](/support/images/alternative-payment-
options-on-the-app-store-in-the-eu/link-out-dark.svg)

**Specific price template:**

Buy for $X.XX at www.example.com ![Link-out icon](/support/images/alternative-
payment-options-on-the-app-store-in-the-eu/link-out-light.svg)![Link-out
icon](/support/images/alternative-payment-options-on-the-app-store-in-the-
eu/link-out-dark.svg)

* * *

## Entitlements and implementation

You can choose to use the App Store’s In‑App Purchase system or use options to
communicate and promote offers for digital goods or services per EU storefront
and per-app, which you can update by changing the entitlement election in
Xcode by updating the property list key with a new app submission.

### Configure and enable the entitlement in Xcode

Once the entitlement is assigned to your account and you’ve configured the App
ID in Certificates, Identifiers & Profiles to support this entitlement, you’ll
need to update your Xcode project, entitlements property list, and Info.plist
file to list the entitlement and metadata.

The Entitlement Profile is compatible with and may only be used in apps on EU
storefronts on devices running a minimum of iOS 17.4, iPadOS 17.4, macOS 14.4,
tvOS 17.4, visionOS 1.2, and watchOS 10.4.

  1. Enable the entitlement in the Xcode Capability library or on the [developer website](/help/account/manage-identifiers/enable-app-capabilities).
  2. Provide the following values for the entitlements: 
     1. Key: `com.apple.developer.storekit.external-purchase-link`
     2. Type: Boolean
     3. Value: True

On the next build to your device or distribution request in Xcode Organizer,
Xcode will detect that the .entitlements file and cached provisioning profile
don’t match, and will request a new provisioning profile based on the latest
App ID configuration to complete the code signing process.

### Set up SKExternalPurchaseCustomLinkRegions

  1. Select the Info.plist file from the Project Navigator in your OS target.
  2. Provide the following values for this property list key: 
     1. Key: [`SKExternalPurchaseCustomLinkRegions`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/SKExternalPurchaseCustomLinkRegions)
     2. Type: Array of strings

Include an entry for each country code where your app supports communicating
and promoting offers.

The valid EU country codes are: Austria (`at`), Belgium (`be`), Bulgaria
(`bg`), Croatia (`hr`), Cyprus (`cy`), Czechia (`cz`), Denmark (`dk`), Estonia
(`ee`), Finland (`fi`), France (`fr`), Germany (`de`), Greece (`gr`), Hungary
(`hu`), Ireland (`ie`), Italy (`it`), Latvia (`lv`), Lithuania (`lt`),
Luxembourg (`lu`), Malta (`mt`), Netherlands (`nl`), Poland (`pl`), Portugal
(`pt`), Romania (`ro`), Slovakia (`sk`), Slovenia (`si`), Spain (`es`), Sweden
(`se`)

### Implement StoreKit External Purchase APIs

  1. Configure the `com.apple.developer.storekit.external-purchase-link` entitlement for your app.
  2. Configure the `SKExternalPurchaseCustomLinkRegions` property list key. Include the country code for each permitted region where your app offers external purchase custom links.
  3. Check the `isEligible` property of the `ExternalPurchaseCustomLink` type to determine whether external purchase is available.
  4. At launch, call the `token(for:)` function to request the external purchase tokens, using the token types `ACQUISITION` and `SERVICES`. Associate these tokens with a customer account on your server.
  5. Call the `showNotice(type:)` function after a deliberate customer interaction, such as tapping a button, and before linking out to external purchases.
  6. From your server, report the external purchase tokens and the transactions associated with the tokens by using the [External Purchase Server API](/documentation/externalpurchaseserverapi/).

* * *

## Submitting your app for review in App Store Connect

When submitting your new app binary for review in App Store Connect, make sure
to follow these submission requirements as well as the Alternative Terms
Addendum for Apps in the EU or the StoreKit External Purchase Link Entitlement
(EU) Addendum, the App Review Guidelines, and the Apple Developer Program
License Agreement.

  * Your app is properly implemented and tested.
  * If you use an alternative PSP, the name of your payment service provider (PSP) should be included in the review notes. Make sure the PSP is ready to complete transactions from your app. Your PSP must: 
    * Meet Level 1 Payment Card Industry (PCI) compliance for handling credit and debit card data; and
    * Make a customer service process available for users, including a process to dispute unauthorized transactions, manage subscriptions (if applicable), and request refunds.

If your submission is incomplete, review times may be delayed or your app may
be rejected. Once your app has been reviewed, its status will update in App
Store Connect and you’ll be notified.

* * *

## Commissions, transaction reporting, and payments

### Commissions

#### Alternative Terms Addendum for Apps in the EU

Sales of digital goods or services in the EU using Apple’s In-App Purchase
system are subject to a commission under the terms of the Alternative Terms
Addendum for Apps in the EU.

Type | Description | iOS, iPadOS | macOS, tvOS, visionOS, watchOS  
---|---|---|---  
App Store Commission | For paid apps, and in-app purchases of digital goods or services, the following rates apply. | 17% | 27%  
| If you’re enrolled in the App Store Small Business Program or renew a qualifying auto-renewal subscription beyond one year, the following reduced commission rates apply. | 10% | 12%  
| If you’re enrolled in the Apple Video Partner Program or News Partner Program, the following reduced commission rates apply. The App Store payment processing fee of 3% also applies. | 10% | 12%  
Payment processing fee | When using the App Store payment processing and related commerce services for in-app purchases, the following fees apply. This fee also applies to all paid apps. | 3% | 3%  
Core Technology Fee | For iOS and iPadOs apps distributed on the App Store, Web Distribution, and/or an alternative app marketplace that reach significant scale, you’ll pay for each first annual install over 1 million first annual installs. For more details, [view documentation](/support/core-technology-fee/). | €0.50 | No fee  
  
**Communication and promotion of offers.** If your App Store app communicates
and promotes offers for digital goods or services for end users at a
destination of your choice, including steering to non-App Store In-App
Purchase transactions, those transactions are subject to an initial
acquisition fee and an ongoing store services fee. This includes any
adjustments for refunds, reversals and chargebacks.

##### Store Services - Tier 1

For apps using mandatory store services

Commission/Fee | Rate | Program Rate* | Description  
---|---|---|---  
Initial acquisition fee | 2% | 0% | Within 6 months after the first install of your app.  
Store services fee | 5% | 5% | Within 12 months of the most recent install, update, or reinstall.  
Core Technology Fee (CTF) | €0.50 | €0.50 | iOS and iPadOS apps that exceed 1 million first annual installs per year distributed on the App Store, Web Distribution, and/or an alternative app marketplace.  
  
##### Store Services - Tier 2

For apps using optional store services

Commission/Fee | Rate | Program Rate* | Description  
---|---|---|---  
Initial acquisition fee | 2% | 0% | Within 6 months after the first install of your app.  
Store services fee | 13% | 10% | Within 12 months of the most recent install, update, or reinstall.  
Core Technology Fee (CTF) | €0.50 | €0.50 | iOS and iPadOS apps that exceed 1 million first annual installs per year distributed on the App Store, Web Distribution, and/or an alternative app marketplace.  
  
*For App Store Small Business Program participants or subscriptions after their first year.

#### StoreKit External Purchase Link Entitlement (EU) Addendum

**Communication and promotion of offers.** If your App Store app communicates
and promotes offers for digital goods or services for end users at a
destination of your choice, including steering to non-App Store In-App
Purchase transactions, those transactions are subject to an initial
acquisition fee, an ongoing store services fee, and Core Technology
Commission. This includes any adjustments for refunds, reversals and
chargebacks.

##### Store Services - Tier 1

For apps using mandatory store services

Commission/Fee | Rate | Program Rate* | Description  
---|---|---|---  
Initial acquisition fee | 2% | 0% | Within 6 months after the first install of your app.  
Store services fee | 5% | 5% | Within 12 months of the most recent install, update, or reinstall.  
Core Technology Commission (CTC) | 5% | 5% | Within 12 months of the most recent install, update, or reinstall.  
  
##### Store Services - Tier 2

For apps using optional store services

Commission/Fee | Rate | Program Rate* | Description  
---|---|---|---  
Initial acquisition fee | 2% | 0% | Within 6 months after the first install of your app.  
Store services fee | 13% | 10% | Within 12 months of the most recent install, update, or reinstall.  
Core Technology Commission (CTC) | 5% | 5% | Within 12 months of the most recent install, update, or reinstall.  
  
*For App Store Small Business Program participants or subscriptions after their first year.

For auto-renewable subscriptions, the initial acquisition fee classifies a
transaction as a sale occurring within a 6-month period after an initial
install, including each auto-renewal within the 6-month period. For the store
services fee and Core Technology Commission, a transaction is classified as a
sale occurring within 12-months of the most recent install, update, or
reinstall, and the fee will apply to each subscription sale and/or auto-
renewal occurring during that period. Renewals of auto-renewing subscriptions
that were initiated before the user installed the app with the communication
or promotion of offers are not classified as transactions for either the
initial acquisition fee, store services fee, or Core Technology Commission.

### Taxes

These commission rates apply to all prices payable by each user minus any
transaction taxes charged by the app. You are responsible for the collection
and remittance of any applicable taxes for sales processed by an alternative
payment provider. For additional details, view [App Store Connect
Help](/help/app-store-connect/).

### Transaction reporting

If your app adopts the StoreKit External Purchase Link Entitlement, you’re
required to use the [External Purchase Server
API](https://developer.apple.com/documentation/externalpurchaseserverapi/) to
report transactions to Apple for applicable commission and fee calculation and
collection purposes. Required reporting includes refunds, corrections,
renewals, one-time purchases, and transactions which didn’t result in a
purchase.

If your app is communicating and promoting offers for digital goods or
services at a distribution channel of your choice using the StoreKit External
Purchase Link Entitlement, you’re required to send a report to Apple recording
all sales of digital goods or services made on any platform. You need to
provide this report monthly, within 15 calendar days following the end of
Apple’s fiscal month.

### Payments

You’ll receive a monthly invoice based on the reporting for commissionable
transactions for digital goods or services for which commission or fees are
owed. Transactions will be aggregated and commissions calculated by Apple by
the 15th of the following month. You’ll need to provide payment within 30 days
of receiving the invoice. For additional details, view [App Store Connect
Help](/help/app-store-connect/).

Please note that Apple has audit rights pursuant to the Alternative Terms
Addendum for Apps in the EU and StoreKit External Purchase Link Entitlement
(EU) Addendum. This will allow Apple to review the accuracy of your record of
digital transactions as a result of the entitlement, ensuring the appropriate
commission and fees have been paid to Apple. Late payments accrue interest and
nonpayment may result in the offset of App Store In‑App Purchase proceeds owed
to you, removal of the app from the App Store, or removal from the Apple
Developer Program.

* * *

## Supporting customers

If your app adopts either of these entitlements, it’s your responsibility to
provide timely support to customers if questions or issues arise. Apple won’t
be able to assist customers with refunds, purchase history, subscription
management, and other issues encountered when purchasing digital goods and
services. You’ll be responsible for addressing these issues with customers
directly.

* * *

## Q&A

##### Can I communicate and promote offers for digital goods or services for a
single EU country only, and use the App Store In‑App Purchases system for the
rest of Europe and the world?

Yes. You may choose which EU storefronts use the App Store In‑App Purchase
system or alternatives. For more information, see SKExternalPurchase. Due to
the App Store’s tight integration with In‑App Purchase, and to reduce
confusion for users, you may not offer both App Store In‑App Purchase and
alternatives to users in your app on the same App Store storefront.

##### If a customer purchases a subscription using the App Store In‑App
Purchase system, and the next version of the app supports transactions other
than App Store In-App Purchase, how is the customer billed for subscription
renewals?

Subscriptions will continue to renew on the payment processing system used
when the subscription started. In this example, the customer’s subscription
would continue to use the App Store In‑App Purchase system until the
subscription becomes inactive or the customer makes a new selection. You
shouldn’t merchandize the same subscription to a user who already subscribed
on the App Store In‑App Purchase system, as they’ll be double charged for the
same service.

##### If I start communicating and promoting offers for digital goods or
services instead of the App Store In‑App Purchase system, will my users be
charged twice for their subscriptions or In‑App Purchases?

Subscriptions will continue to renew on the payment system where the
subscription originated. When customers update their app to the version that
supports alternatives, one-time purchases from that point forward occur with
alternatives and not on the App Store In‑App Purchase system.

##### If I previously offered digital goods or services using App Store
payment processing and start using alternatives, how will I be charged?

Due to the App Store’s tight integration with In-App Purchase, and to reduce
confusion for users, developers may not offer both In-App Purchase and
alternatives to purchase to users in their App Store app on the same
storefront. Once you stop offering In-App Purchases to users and communicate
and promote offers for digital goods or services, you may continue to earn
revenue from legacy auto-renewing subscriptions, which will continue to be
charged the appropriate commission and App Store payment processing fee.
Transactions made via alternatives will be charged the appropriate commission
and fees.

##### Can customers still use the App Store In‑App Purchase system if they’re
running earlier OS versions or haven’t updated my app to the latest version
that supports transactions other than App Store In-App Purchase?

Anyone running an OS version earlier than iOS 17.4 or an earlier version of
your app that only supports App Store In-App Purchase system can keep using
the App Store In‑App Purchase system at the reduced App Store commission and
payment processing fee. Once a customer updates to iOS 17.4 and the latest app
version, they can take advantage of the new alternatives. Please note that
apps can’t use the App Store In‑App Purchase system and alternatives in the
same storefront and OS (including the same OS version and app version) at the
same time.

##### Will I need to pay an initial acquisition fee or store services fee on
subscriptions that began before I added the entitlement to my app?

No, auto-renewals of subscriptions that began before you include the
entitlement in your app do not qualify for an initial acquisition fee or store
services fee, or Core Technology Commission if applicable. If any of those
existing subscribers begin a new subscription after you’ve added the
entitlement, then the initial acquisition and/or store services fees and Core
Technology Commission will apply, as long as the purchases and/or renewals
occur within a 6-month period for initial acquisition fee or 12-month period
for store services fee and Core Technology Commission after an install,
reinstall, or update.

##### How long do I need to pay the store services fee and Core Technology
Commission on my auto-renewable subscription plans?

Whenever a user installs, reinstalls, or updates to a version of your app with
the entitlement, the store services fee and Core Technology Commission applies
to all new subscription sales and renewals occurring within 12 months of that
install, reinstall, or update. If the user doesn’t install, reinstall, or
update your app with the entitlement again after 12 months, then the store
services fee and Core Technology Commission will expire. If the user installs,
reinstalls, or updates your app again after the initial 12-month window had
ended, then another 12-month window will start and the Store Services fee and
Core Technology Commission will apply again to each subscription sale and/or
auto-renewal occurring during that new window.

