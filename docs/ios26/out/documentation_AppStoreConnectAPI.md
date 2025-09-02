# App Store Connect API | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AppStoreConnectAPI
> Fetched: 2025-08-31T18:31:35.250Z

Web Service

## App Store Connect API

Automate the tasks you perform on the Apple Developer website and in App Store Connect.

App Store Connect API 1.0+

## [Overview](https://developer.apple.com/documentation/AppStoreConnectAPI#overview)

The App Store Connect API is a REST API that enables the automation of actions you take in App Store Connect. Click [OpenAPI specification](https://developer.apple.com/sample-code/app-store-connect/app-store-connect-openapi-specification.zip) to download the specification file.

Calls to the API require JSON Web Tokens (JWT) for authorization; you obtain keys to create the tokens from your organization’s App Store Connect account. See [Creating API Keys for App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi/creating-api-keys-for-app-store-connect-api) to create your keys and tokens.

The API provides resources to automate these areas of App Store Connect:

- **In-App Purchases and Subscriptions.** Manage in-app purchases and auto-renewable subscriptions for your app.
- **TestFlight.** Manage beta builds of your app, testers, and groups.
- **Xcode Cloud.** Read Xcode Cloud data, manage workflows, and start builds.
- **Users and Access.** Send invitations for users to join your team. Adjust their level of access or remove users.
- **Provisioning.** Manage bundle IDs, capabilities, signing certificates, devices, and provisioning profiles.
- **App Metadata.** Create new versions, manage App Store information, and submit your app to the App Store.
- **App Clip Experiences.** Create an App Clip and manage App Clip experiences.
- **Reporting.** Download sales and financial reports.
- **Power and Performance Metrics.** Download aggregate metrics and diagnostics for App Store versions of your app.
- **Customer Reviews and Review Responses.** Get the customer reviews for your app and manage your responses to the customer reviews.

The App Store Connect API returns responses from resources that are consistent JSON data and contain links to additional related resources. Use these relationships to navigate to the related resources—for example, to find beta testers within specific beta groups in TestFlight. Apply filtering to requests on specific resources to refine the response.

Current page is App Store Connect API
