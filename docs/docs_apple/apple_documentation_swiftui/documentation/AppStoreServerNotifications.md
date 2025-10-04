Web Service

# App Store Server Notifications

Monitor In-App Purchase events in real time and learn of unreported external
purchase tokens, with server notifications from the App Store.

App Store Server Notifications 1.0+

## [Overview](/documentation/AppStoreServerNotifications#overview)

App Store Server Notifications is a server-to-server service that sends real-
time notifications for In-App Purchase events, and notifications for
unreported external purchase tokens. Use the data in the notifications to
update your user-account database, and to monitor and respond to in-app
purchase refunds. For notifications related to the [External
Purchase](/documentation/StoreKit/external-purchase) API, see
[`externalPurchaseToken`](/documentation/appstoreservernotifications/externalpurchasetoken).

Important

The [`App Store Server Notifications
V1`](/documentation/appstoreservernotifications/app-store-server-
notifications-v1) endpoint and version 1 notifications,
[`notification_type`](/documentation/appstoreservernotifications/notification_type),
are deprecated. Implement the [`App Store Server Notifications
V2`](/documentation/appstoreservernotifications/app-store-server-
notifications-v2) endpoint on your server to receive version 2 notifications
instead.

To receive server notifications from the App Store, provide your server’s
HTTPS URL in App Store Connect. Opt in to receive notifications for the
production environment and the sandbox environment. For more information, see
[Enabling App Store Server
Notifications](/documentation/appstoreservernotifications/enabling-app-store-
server-notifications).

Your server is responsible for parsing, interpreting, and responding to all
server-to-server notification posts. For more information, see [Receiving App
Store Server
Notifications](/documentation/appstoreservernotifications/receiving-app-store-
server-notifications) and [Responding to App Store Server
Notifications](/documentation/appstoreservernotifications/responding-to-app-
store-server-notifications).

### [Process in-app purchase
notifications](/documentation/AppStoreServerNotifications#Process-in-app-
purchase-notifications)

Notifications cover events in the in-app purchase life cycle, including
purchases, subscription renewals, offer redemptions, refunds, and more. For a
complete list of notification types, see
[`notificationType`](/documentation/appstoreservernotifications/notificationtype)
for [`App Store Server Notifications
V2`](/documentation/appstoreservernotifications/app-store-server-
notifications-v2).

Use the notification type, along with the transaction and subscription renewal
information, to update a customer’s service or to present promotional offers
according to your business logic.

### [Process external purchase token
notifications](/documentation/AppStoreServerNotifications#Process-external-
purchase-token-notifications)

A
[`notificationType`](/documentation/appstoreservernotifications/notificationtype)
of `EXTERNAL_PURCHASE_TOKEN` with an `UNREPORTED`
[`subtype`](/documentation/appstoreservernotifications/subtype) indicates that
Apple generated an external purchase token for your app but hasn’t received a
report for the token. The notification includes the token in the
[`externalPurchaseToken`](/documentation/appstoreservernotifications/externalpurchasetoken)
field of the
[`responseBodyV2DecodedPayload`](/documentation/appstoreservernotifications/responsebodyv2decodedpayload).
Use the token information to report it to Apple, including if you don’t
recognize the token in your system. To report tokens, with or without
associated transactions, call the [External Purchase Server
API](/documentation/ExternalPurchaseServerAPI)’s [`Send External Purchase
Report`](/documentation/ExternalPurchaseServerAPI/Send-External-Purchase-
Report) endpoint.

For more information about token reporting requirements, see [Using
alternative payment options on the App Store in the European
Union](https://developer.apple.com/support/apps-using-alternative-payment-
providers-in-the-eu/).

### [Test your server setup](/documentation/AppStoreServerNotifications#Test-
your-server-setup)

To determine whether your server is receiving notifications, call the
[`Request a Test Notification`](/documentation/AppStoreServerAPI/Request-a-
Test-Notification) endpoint in the [App Store Server
API](/documentation/AppStoreServerAPI) to ask the App Store server to send a
notification with the
[`notificationType`](/documentation/appstoreservernotifications/notificationtype)
`TEST`. Use the `testNotificationToken` you receive to call the [`Get Test
Notification Status`](/documentation/AppStoreServerAPI/Get-Test-Notification-
Status) endpoint to learn how your server responds to the test notification.

The App Store server sends the `TEST` notification in the version 2
notification format, however, it sends it to your server regardless of whether
you configure a version 1 or version 2 notification URL in App Store Connect.
For more information about configuring your URL in App Store Connect, see
[Enter a URL for App Store server notifications](https://help.apple.com/app-
store-connect/#/dev0067a330b).

## [Topics](/documentation/AppStoreServerNotifications#topics)

### [Essentials](/documentation/AppStoreServerNotifications#Essentials)

[Enabling App Store Server
Notifications](/documentation/appstoreservernotifications/enabling-app-store-
server-notifications)

Configure your server and provide an HTTPS URL to receive notifications about
in-app purchase events and unreported external purchase tokens.

[Receiving App Store Server
Notifications](/documentation/appstoreservernotifications/receiving-app-store-
server-notifications)

Implement server-side code to receive and parse notification posts.

[Responding to App Store Server
Notifications](/documentation/appstoreservernotifications/responding-to-app-
store-server-notifications)

Send HTTP status codes to indicate the success of a notification post.

[App Store Server Notifications
changelog](/documentation/appstoreservernotifications/app-store-server-
notifications-changelog)

Learn about changes to the App Store Server Notifications service.

### [Server notifications version
2](/documentation/AppStoreServerNotifications#Server-notifications-version-2)

[`App Store Server Notifications
V2`](/documentation/appstoreservernotifications/app-store-server-
notifications-v2)

Specify your secure server’s URL in App Store Connect to receive version 2
notifications.

[`object
responseBodyV2`](/documentation/appstoreservernotifications/responsebodyv2)

The response body the App Store sends in a version 2 server notification.

[`object
responseBodyV2DecodedPayload`](/documentation/appstoreservernotifications/responsebodyv2decodedpayload)

A decoded payload that contains the version 2 notification data.

[`type
notificationType`](/documentation/appstoreservernotifications/notificationtype)

The type that describes the in-app purchase or external purchase event for
which the App Store sends the version 2 notification.

[`type subtype`](/documentation/appstoreservernotifications/subtype)

A string that provides details about select notification types in version 2.

### [Deprecated](/documentation/AppStoreServerNotifications#Deprecated)

[API ReferenceApp Store Server Notifications Version
1](/documentation/appstoreservernotifications/app-store-server-notifications-
version-1)

Receive, parse, and interpret App Store Server Notifications version 1.

## [See Also](/documentation/AppStoreServerNotifications#see-also)

### [Related
Documentation](/documentation/AppStoreServerNotifications#Related-
Documentation)

[In-App Purchase](/documentation/StoreKit/in-app-purchase)

Offer content and services in your app across Apple platforms using a Swift-
based interface.

[App Store Server API](/documentation/AppStoreServerAPI)

Manage your customers’ App Store transactions from your server.

[App Store Receipts](/documentation/AppStoreReceipts)

Validate app and In-App Purchase receipts with the App Store.

Deprecated

