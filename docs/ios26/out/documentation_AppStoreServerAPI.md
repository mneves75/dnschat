# App Store Server API | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AppStoreServerAPI
> Fetched: 2025-08-31T18:31:37.994Z

## [Overview](https://developer.apple.com/documentation/AppStoreServerAPI#overview)

The App Store Server API is a REST API that you call from your server to request and provide information about your customers’ in-app purchases. The App Store signs the transaction and subscription renewal information that this API returns using the [JSON Web Signature (JWS)](https://datatracker.ietf.org/doc/html/rfc7515) specification. Most endpoints return data for a single customer of your app, indicated by a transaction identifier that you provide.

The App Store Server API is independent of the app’s installation status on the customers’ devices. The App Store server returns information based on a customer’s in-app purchase history regardless of whether the customer installs, removes, or reinstalls the app on their devices.

This API provides the following functionality:

- **Transactions and auto-renewable subscription status.** Get information for single transactions by calling [`Get Transaction Info`](https://developer.apple.com/documentation/appstoreserverapi/get-transaction-info) or a customer’s entire transaction history using [`Get Transaction History`](https://developer.apple.com/documentation/appstoreserverapi/get-transaction-history). Call [`Get All Subscription Statuses`](https://developer.apple.com/documentation/appstoreserverapi/get-all-subscription-statuses) for up-to-date subscription status. Use this information to keep your customers’ purchase information current on your server.
- **Refund information.** Call [`Get Refund History`](https://developer.apple.com/documentation/appstoreserverapi/get-refund-history) to get a customer’s refund history. Use the [`Send Consumption Information`](https://developer.apple.com/documentation/appstoreserverapi/send-consumption-information) endpoint to send information to the App Store when customers request a refund for a consumable in-app purchase, after you receive the `CONSUMPTION_REQUEST` [`notificationType`](https://developer.apple.com/documentation/AppStoreServerNotifications/notificationType) from [`App Store Server Notifications V2`](https://developer.apple.com/documentation/AppStoreServerNotifications/App-Store-Server-Notifications-V2). Your data helps inform refund decisions.
- **App Store Server Notifications history and testing.** Call [`Get Notification History`](https://developer.apple.com/documentation/appstoreserverapi/get-notification-history) to request the notifications your server may have missed in the past 180 days (or 30 days in the sandbox environment). Call [`Request a Test Notification`](https://developer.apple.com/documentation/appstoreserverapi/request-a-test-notification) and [`Get Test Notification Status`](https://developer.apple.com/documentation/appstoreserverapi/get-test-notification-status) to test if your server is successfully receiving notifications at its [`App Store Server Notifications V2`](https://developer.apple.com/documentation/AppStoreServerNotifications/App-Store-Server-Notifications-V2) endpoint.
- **Subscription renewal date extensions.** Call [`Extend a Subscription Renewal Date`](https://developer.apple.com/documentation/appstoreserverapi/extend-a-subscription-renewal-date) and related endpoints to compensate your customers for temporary service outages, canceled events, or interruptions to live-streamed events by extending the renewal date of their paid, active subscription. For more information, see [Extending the renewal date for auto-renewable subscriptions](https://developer.apple.com/documentation/appstoreserverapi/extending-the-renewal-date-for-auto-renewable-subscriptions).
- **Order information lookup.** Call [`Look Up Order ID`](https://developer.apple.com/documentation/appstoreserverapi/look-up-order-id) to get in-app purchase information based on a customer’s order ID, found on the App Store receipt that customers receive in email.

Your server must support the Transport Layer Security (TLS) protocol 1.2 or later to use the App Store Server API.

Check the [App Store Server API changelog](https://developer.apple.com/documentation/appstoreserverapi/app-store-server-api-changelog) to learn about the latest changes to this API. Look for videos about the App Store Server API on the [Apple Developer website](https://developer.apple.com/videos/all-videos/?q=%22App%20Store%20Server%20API%22).

Calls to the API require JSON Web Tokens (JWTs) for authorization; you obtain keys to create the tokens from your organization’s App Store Connect account. See [Creating API keys to authorize API requests](https://developer.apple.com/documentation/appstoreserverapi/creating-api-keys-to-authorize-api-requests) to create your keys. See [Generating JSON Web Tokens for API requests](https://developer.apple.com/documentation/appstoreserverapi/generating-json-web-tokens-for-api-requests) to generate tokens using your keys, and send API requests.

After you have a complete and signed token, provide the token in the request’s authorization header as a bearer token. Generate a new token for each new API request, or reuse tokens until they expire.

### [Create JWTs, verify transactions, and more using the App Store Server Library](https://developer.apple.com/documentation/AppStoreServerAPI#Create-JWTs-verify-transactions-and-more-using-the-App-Store-Server-Library)

The App Store Server Library is an open source library from Apple, available in four languages. It provides a client that make it easier to adopt the App Store Server APIs, including creating the JWTs to authorize calls. For more information, see [Simplifying your implementation by using the App Store Server Library](https://developer.apple.com/documentation/appstoreserverapi/simplifying-your-implementation-by-using-the-app-store-server-library) and the WWDC23 session [Meet the App Store Server Library](https://developer.apple.com/videos/play/wwdc2023/10143/).

### [Test using the sandbox environment](https://developer.apple.com/documentation/AppStoreServerAPI#Test-using-the-sandbox-environment)

All App Store Server API endpoints are available for testing in the sandbox environment, except [`Look Up Order ID`](https://developer.apple.com/documentation/appstoreserverapi/look-up-order-id). Access the sandbox environment by sending requests to the endpoints using the following base URL:

```
https://api.storekit-sandbox.itunes.apple.com/
```

For example, to call [`Get Transaction History`](https://developer.apple.com/documentation/appstoreserverapi/get-transaction-history) in the sandbox environment, send a request using the sandbox URL:

```
https://api.storekit-sandbox.itunes.apple.com/inApps/v2/history/{transactionId}
```

Note that `/inApps` in the path is case-sensitive.

For endpoints that take a [`transactionId`](https://developer.apple.com/documentation/appstoreserverapi/transactionid) as a parameter, be sure to call the endpoint using the same environment that creates the transaction identifier. Environment information is present in the [`environment`](https://developer.apple.com/documentation/appstoreserverapi/environment) property of the [`JWSTransactionDecodedPayload`](https://developer.apple.com/documentation/appstoreserverapi/jwstransactiondecodedpayload).

If you don’t have environment information, follow these steps:

1.  Call the endpoint using the production URL. If the call succeeds, the transaction identifier belongs to the production environment.
2.  If you receive an error code `4040010` [`TransactionIdNotFoundError`](https://developer.apple.com/documentation/appstoreserverapi/transactionidnotfounderror), call the endpoint using the sandbox environment.
3.  If the call succeeds, the transaction identifier belongs to the sandbox environment. If the call fails with the `4040010` error code, the transaction identifier isn’t present in either environment.
