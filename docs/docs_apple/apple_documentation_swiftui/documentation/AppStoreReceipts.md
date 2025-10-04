Web Service

# App Store Receipts

Validate app and In-App Purchase receipts with the App Store.

App Store Receipts 1.0–1.7Deprecated

Deprecated

Receipts are deprecated. To validate In-App Purchases on your server without
using receipts, call the [App Store Server
API](/documentation/AppStoreServerAPI) to get Apple-signed transaction and
subscription information for your customers, or verify the
[`AppTransaction`](/documentation/StoreKit/AppTransaction) and
[`Transaction`](/documentation/StoreKit/Transaction) signed data that your app
obtains. You can also get the same signed transaction and subscription
information from the [`App Store Server Notifications
V2`](/documentation/AppStoreServerNotifications/App-Store-Server-
Notifications-V2) endpoint.

## [Overview](/documentation/AppStoreReceipts#overview)

Important

The [`verifyReceipt`](/documentation/appstorereceipts/verify-receipt) endpoint
is deprecated. To validate receipts on your server, follow the steps in
[Validating receipts on the
device](/documentation/appstorereceipts/validating-receipts-on-the-device) on
your server.

Your server can access the
[`verifyReceipt`](/documentation/appstorereceipts/verify-receipt) endpoint to
validate app and in-app transaction receipts. Submit a receipt to the App
Store with your [shared secret](https://developer.apple.com/help/app-store-
connect/configure-in-app-purchase-settings/generate-a-shared-secret-to-verify-
receipts) to receive a JSON response containing the app information and in-app
purchase details in the fields that make up the receipt. Each field or
combination of fields provides insight you can use to deliver service and
content to the user, as you define.

In-app transactions that your app doesn’t mark as finished using
[`finishTransaction(_:)`](/documentation/StoreKit/SKPaymentQueue/finishTransaction\(_:\))
or [`finish()`](/documentation/StoreKit/Transaction/finish\(\)) remain in the
App Store receipt. Auto-renewable subscriptions, non-renewing subscriptions,
and non-consumables remain in the receipt indefinitely, and appear in the
customer transaction history when you call the [`Get Transaction History
V1`](/documentation/AppStoreServerAPI/Get-Transaction-History-V1) endpoint.

The
[`responseBody.Latest_receipt_info`](/documentation/appstorereceipts/responsebody/latest_receipt_info-
data.dictionary) object for auto-renewable subscriptions can grow over time
because the renewal transactions stay in the receipt indefinitely. To optimize
performance, the App Store may truncate receipts in the sandbox environment to
remove old transactions.

You can test validating receipts in the sandbox environment. For more
information, see [Testing In-App Purchases with
sandbox](/documentation/StoreKit/testing-in-app-purchases-with-sandbox) and
[Test in-app purchases](https://developer.apple.com/help/app-store-
connect/test-in-app-purchases-main/test-in-app-purchases).

You can validate receipts from the App Store using server-side receipt
validation or on-device validation. For more information about receipt
validation options, see [Choosing a receipt validation
technique](/documentation/StoreKit/choosing-a-receipt-validation-technique).

Related sessions from WWDC22

Session 110404: [Implement proactive in-app purchase
restore](https://developer.apple.com/videos/play/wwdc2022/110404/).

## [Topics](/documentation/AppStoreReceipts#topics)

### [Receipt data](/documentation/AppStoreReceipts#Receipt-data)

[API ReferenceApp Store receipt data
types](/documentation/appstorereceipts/app-store-receipt-data-types)

Data types of objects that return in the receipt.

### [Local receipt validation](/documentation/AppStoreReceipts#Local-receipt-
validation)

[Validating receipts on the
device](/documentation/appstorereceipts/validating-receipts-on-the-device)

Verify the contents of app receipts by decoding and parsing the receipt on the
device.

### [Deprecated](/documentation/AppStoreReceipts#Deprecated)

[`verifyReceipt`](/documentation/appstorereceipts/verify-receipt)

Send a receipt to the App Store for verification.

[`object requestBody`](/documentation/appstorereceipts/requestbody)

The JSON contents you submit with the request to the App Store.

[`object responseBody`](/documentation/appstorereceipts/responsebody)

The JSON data that returns in the response from the App Store.

[`object error`](/documentation/appstorereceipts/error)

Error information that returns in the response body when a request isn’t
successful.

