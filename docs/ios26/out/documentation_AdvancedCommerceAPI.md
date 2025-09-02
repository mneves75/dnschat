# Advanced Commerce API | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AdvancedCommerceAPI
> Fetched: 2025-08-31T18:31:24.852Z

## [Overview](https://developer.apple.com/documentation/AdvancedCommerceAPI#Overview)

Use this framework to offer an exceptionally large catalog of one-time purchases, subscriptions, and subscriptions with optional add-ons while using the App Store commerce system. Apps that use this API host and manage their own catalog of In-App Purchases, or SKUs. The App Store commerce system handles the end-to-end payment processing, global distribution, tax support, and customer service.

You can use the Advanced Commerce API and the StoreKit [In-App Purchase](https://developer.apple.com/documentation/StoreKit/in-app-purchase) API in the same app. Both APIs use the App Store commerce system, including the same signed JWS transactions and JWS renewal info. For products that you offer using the In-App Purchase API, you set up product identifiers in App Store Connect. For products that you offer using the Advanced Commerce API, you host and manage your own catalog of SKUs and add product details dynamically at runtime. For complete setup information, see [Setting up your project for Advanced Commerce API](https://developer.apple.com/documentation/advancedcommerceapi/setting-up-your-project-for-advanced-commerce).

Advanced Commerce API features are available through requests you make using StoreKit in your app and endpoint requests from your server. To authorize these requests, you generate JSON Web Tokens (JWTs). The App Store Server Library provides a client that makes it easier to create JWTs to authorize calls. For more information about the library, see [Simplifying your implementation by using the App Store Server Library](https://developer.apple.com/documentation/AppStoreServerAPI/simplifying-your-implementation-by-using-the-app-store-server-library). For more information about authorizing calls, see [Authorizing API requests from your server](https://developer.apple.com/documentation/advancedcommerceapi/authorizing-server-calls).

Your server must support the Transport Layer Security (TLS) protocol 1.2 or later to call the Advanced Commerce API.

## [Topics](https://developer.apple.com/documentation/AdvancedCommerceAPI#topics)

### [Subscription price change from the server](https://developer.apple.com/documentation/AdvancedCommerceAPI#Subscription-price-change-from-the-server)

[`Change Subscription Price`](https://developer.apple.com/documentation/advancedcommerceapi/change-subscription-price)

Increase or decrease the price of an auto-renewable subscription, a bundle, or individual items within a subscription at the next renewal.

### [Subscription revocation from the server](https://developer.apple.com/documentation/AdvancedCommerceAPI#Subscription-revocation-from-the-server)

[`Revoke Subscription`](https://developer.apple.com/documentation/advancedcommerceapi/revoke-subscription)

Immediately cancel a customer’s subscription and all the items that are included in the subscription, and request a full or prorated refund.

### [Refund request from the server](https://developer.apple.com/documentation/AdvancedCommerceAPI#Refund-request-from-the-server)

[`object RequestRefundItem`](https://developer.apple.com/documentation/advancedcommerceapi/requestrefunditem)

Information about the refund request for an item, such as its SKU, the refund amount, reason, and type.

### [Subscription metadata changes from the server](https://developer.apple.com/documentation/AdvancedCommerceAPI#Subscription-metadata-changes-from-the-server)

[`Change Subscription Metadata`](https://developer.apple.com/documentation/advancedcommerceapi/change-subscription-metadata)

Update the SKU, display name, and description associated with a subscription, without affecting the subscription’s billing or its service.

### [Migration from the server](https://developer.apple.com/documentation/AdvancedCommerceAPI#Migration-from-the-server)

[`object SubscriptionMigrateRequest`](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmigraterequest)

The subscription details you provide to migrate a subscription from In-App Purchase to the Advanced Commerce API, such as descriptors, items, storefront, and more.

[`object SubscriptionMigrateResponse`](https://developer.apple.com/documentation/advancedcommerceapi/subscriptionmigrateresponse)

A response that contains signed renewal and transaction information after a subscription successfully migrates to the Advanced Commerce API.

### [Objects and types](https://developer.apple.com/documentation/AdvancedCommerceAPI#Objects-and-types)

[Data types](https://developer.apple.com/documentation/advancedcommerceapi/datatypes)

Objects and data types for the Advanced Commerce API.

### [Signed transaction information](https://developer.apple.com/documentation/AdvancedCommerceAPI#Signed-transaction-information)

[`type JWSRenewalInfo`](https://developer.apple.com/documentation/advancedcommerceapi/jwsrenewalinfo)

Subscription renewal information signed by the App Store, in JSON Web Signature (JWS) format.

[`type JWSTransaction`](https://developer.apple.com/documentation/advancedcommerceapi/jwstransaction)

Transaction information signed by the App Store, in JSON Web Signature (JWS) Compact Serialization format.
