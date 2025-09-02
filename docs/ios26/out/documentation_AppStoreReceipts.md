# App Store Receipts | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AppStoreReceipts
> Fetched: 2025-08-31T18:31:36.595Z

## [Overview](https://developer.apple.com/documentation/AppStoreReceipts#overview)

Your server can access the [`verifyReceipt`](https://developer.apple.com/documentation/appstorereceipts/verify-receipt) endpoint to validate app and in-app transaction receipts. Submit a receipt to the App Store with your [shared secret](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/generate-a-shared-secret-to-verify-receipts) to receive a JSON response containing the app information and in-app purchase details in the fields that make up the receipt. Each field or combination of fields provides insight you can use to deliver service and content to the user, as you define.

In-app transactions that your app doesn’t mark as finished using [`finishTransaction(_:)`](<https://developer.apple.com/documentation/StoreKit/SKPaymentQueue/finishTransaction(_:)>) or [`finish()`](<https://developer.apple.com/documentation/StoreKit/Transaction/finish()>) remain in the App Store receipt. Auto-renewable subscriptions, non-renewing subscriptions, and non-consumables remain in the receipt indefinitely, and appear in the customer transaction history when you call the [`Get Transaction History V1`](https://developer.apple.com/documentation/AppStoreServerAPI/Get-Transaction-History-V1) endpoint.

The [`responseBody.Latest_receipt_info`](https://developer.apple.com/documentation/appstorereceipts/responsebody/latest_receipt_info-data.dictionary) object for auto-renewable subscriptions can grow over time because the renewal transactions stay in the receipt indefinitely. To optimize performance, the App Store may truncate receipts in the sandbox environment to remove old transactions.

You can test validating receipts in the sandbox environment. For more information, see [Testing In-App Purchases with sandbox](https://developer.apple.com/documentation/StoreKit/testing-in-app-purchases-with-sandbox) and [Test in-app purchases](https://developer.apple.com/help/app-store-connect/test-in-app-purchases-main/test-in-app-purchases).

You can validate receipts from the App Store using server-side receipt validation or on-device validation. For more information about receipt validation options, see [Choosing a receipt validation technique](https://developer.apple.com/documentation/StoreKit/choosing-a-receipt-validation-technique).
