Web Service

# App Store Connect API

Automate the tasks you perform on the Apple Developer website and in App Store
Connect.

App Store Connect API 1.0+

## [Overview](/documentation/AppStoreConnectAPI#overview)

The App Store Connect API is a REST API that enables the automation of actions
you take in App Store Connect. Click [OpenAPI
specification](https://developer.apple.com/sample-code/app-store-connect/app-
store-connect-openapi-specification.zip) to download the specification file.

Calls to the API require JSON Web Tokens (JWT) for authorization; you obtain
keys to create the tokens from your organization’s App Store Connect account.
See [Creating API Keys for App Store Connect
API](/documentation/appstoreconnectapi/creating-api-keys-for-app-store-
connect-api) to create your keys and tokens.

Important

Changes you make using the App Store Connect API affect the production data
you use for development and distribution.

The API provides resources to automate these areas of App Store Connect:

  * **In-App Purchases and Subscriptions.** Manage in-app purchases and auto-renewable subscriptions for your app.

  * **TestFlight.** Manage beta builds of your app, testers, and groups.

  * **Xcode Cloud.** Read Xcode Cloud data, manage workflows, and start builds.

  * **Users and Access.** Send invitations for users to join your team. Adjust their level of access or remove users.

  * **Provisioning.** Manage bundle IDs, capabilities, signing certificates, devices, and provisioning profiles.

  * **App Metadata.** Create new versions, manage App Store information, and submit your app to the App Store.

  * **App Clip Experiences.** Create an App Clip and manage App Clip experiences.

  * **Reporting.** Download sales and financial reports.

  * **Power and Performance Metrics.** Download aggregate metrics and diagnostics for App Store versions of your app.

  * **Customer Reviews and Review Responses.** Get the customer reviews for your app and manage your responses to the customer reviews.

The App Store Connect API returns responses from resources that are consistent
JSON data and contain links to additional related resources. Use these
relationships to navigate to the related resources—for example, to find beta
testers within specific beta groups in TestFlight. Apply filtering to requests
on specific resources to refine the response.

## [Topics](/documentation/AppStoreConnectAPI#topics)

### [Essentials](/documentation/AppStoreConnectAPI#Essentials)

[Creating API Keys for App Store Connect
API](/documentation/appstoreconnectapi/creating-api-keys-for-app-store-
connect-api)

Create API keys to sign JSON Web Tokens (JWTs) and authorize API requests.

[Generating Tokens for API
Requests](/documentation/appstoreconnectapi/generating-tokens-for-api-
requests)

Create JSON Web Tokens (JWTs) signed with your private key to authorize API
requests.

[Revoking API Keys](/documentation/appstoreconnectapi/revoking-api-keys)

Revoke unused, lost, or compromised private keys.

[Identifying Rate Limits](/documentation/appstoreconnectapi/identifying-rate-
limits)

Recognize the rate limits that REST API responses provide and handle them in
your code.

[Uploading Assets to App Store
Connect](/documentation/appstoreconnectapi/uploading-assets-to-app-store-
connect)

Upload screenshots, app previews, attachments for App Review, and routing app
coverage files to App Store Connect.

[API ReferenceApp Store Connect API Release
Notes](/documentation/appstoreconnectapi/app-store-connect-api-release-notes)

Learn about new features and updates in the App Store Connect API.

### [App Store](/documentation/AppStoreConnectAPI#App-Store)

[API ReferenceApp Store](/documentation/appstoreconnectapi/app-store)

Manage all aspects of your app, App Clips, in-app purchases, and customer
reviews in the App Store.

### [TestFlight](/documentation/AppStoreConnectAPI#TestFlight)

[API ReferencePrerelease Versions and Beta
Testers](/documentation/appstoreconnectapi/prerelease-versions-and-beta-
testers)

Manage your beta testing program, including beta testers and groups, apps, App
Clips, and builds.

### [Game Center](/documentation/AppStoreConnectAPI#Game-Center)

[API ReferenceGame Center](/documentation/appstoreconnectapi/game-center)

Manage Game Center data and configurations for your apps.

### [Provisioning](/documentation/AppStoreConnectAPI#Provisioning)

[API ReferenceBundle IDs](/documentation/appstoreconnectapi/bundle-ids)

Manage the bundle IDs that uniquely identify your apps.

[API ReferenceBundle ID
Capabilities](/documentation/appstoreconnectapi/bundle-id-capabilities)

Manage the app capabilities for a bundle ID.

[API ReferenceCertificates](/documentation/appstoreconnectapi/certificates)

Create, download, and revoke signing certificates for app development and
distribution.

[API ReferenceDevices](/documentation/appstoreconnectapi/devices)

Register devices for development and testing.

[API ReferenceProfiles](/documentation/appstoreconnectapi/profiles)

Create, delete, and download provisioning profiles that enable app
installations for development and distribution.

[API ReferenceMerchant ID](/documentation/appstoreconnectapi/merchantids)

Manage your merchant ID for Apple Pay.

[API ReferencePass type Ids](/documentation/appstoreconnectapi/pass-type-id)

Create, download, and revoke pass type ids for app development and
distribution.

### [Xcode Cloud](/documentation/AppStoreConnectAPI#Xcode-Cloud)

[API ReferenceXcode Cloud Workflows and
Builds](/documentation/appstoreconnectapi/xcode-cloud-workflows-and-builds)

Automate reading Xcode Cloud data, managing workflows, and starting builds.

### [Webhooks](/documentation/AppStoreConnectAPI#Webhooks)

[API ReferenceWebhook
notifications](/documentation/appstoreconnectapi/webhook-notifications)

Manage notifications from App Store about your apps and their statuses.

### [Reporting](/documentation/AppStoreConnectAPI#Reporting)

[API ReferenceSales and Finance](/documentation/appstoreconnectapi/sales-and-
finance)

Download your sales and financial reports.

[API ReferencePower and Performance Metrics and
Logs](/documentation/appstoreconnectapi/power-and-performance-metrics-and-
logs)

Get power and performance metrics, logs, and signatures.

[API ReferenceAnalytics](/documentation/appstoreconnectapi/analytics)

Get data about your apps and usage.

### [Users and Access](/documentation/AppStoreConnectAPI#Users-and-Access)

[API ReferenceUsers](/documentation/appstoreconnectapi/users)

Manage users on your App Store Connect team.

[API ReferenceUser Invitations](/documentation/appstoreconnectapi/user-
invitations)

Email invitations to join your App Store Connect team.

[API ReferenceSandbox Testers](/documentation/appstoreconnectapi/sandbox-
testers)

Manage sandbox testers on your App Store Connect team.

### [Error Handling](/documentation/AppStoreConnectAPI#Error-Handling)

[API ReferenceInterpreting and Handling
Errors](/documentation/appstoreconnectapi/interpreting-and-handling-errors)

Learn how the App Store Connect API returns errors and handle them in your
code.

### [Paging](/documentation/AppStoreConnectAPI#Paging)

[API ReferenceLarge Data Sets](/documentation/appstoreconnectapi/large-data-
sets)

Retrieve large data sets with paging information.

### [Alternative App
Distribution](/documentation/AppStoreConnectAPI#Alternative-App-Distribution)

[API ReferenceAlternative Marketplaces and Web
Distribution](/documentation/appstoreconnectapi/alternative-marketplaces-and-
web-distribution)

Manage keys, packages, and search for alternative app distribution.

### [Dictionaries](/documentation/AppStoreConnectAPI#Dictionaries)

[`object
CiBranchStartCondition`](/documentation/appstoreconnectapi/cibranchstartcondition)

Settings for a start condition that starts a build if a branch changes.

[`object
CiFilesAndFoldersRule`](/documentation/appstoreconnectapi/cifilesandfoldersrule)

Settings Xcode Cloud uses to determine whether a change should start a new
build or not.

[`object CiGitUser`](/documentation/appstoreconnectapi/cigituser)

The data structure that represents a Git Users resource.

[`object CiIssueCounts`](/documentation/appstoreconnectapi/ciissuecounts)

The data structure that represents an Issue Counts resource.

[`object
CiPullRequestStartCondition`](/documentation/appstoreconnectapi/cipullrequeststartcondition)

Settings for a start condition that starts a build if a pull request changes.

[`object
CiScheduledStartCondition`](/documentation/appstoreconnectapi/cischeduledstartcondition)

Settings for a start condition that starts a build based on a schedule.

[`object
CiTagStartCondition`](/documentation/appstoreconnectapi/citagstartcondition)

Settings for a start condition that starts a build if a Git tag changes.

[`object
CiTestDestination`](/documentation/appstoreconnectapi/citestdestination)

The test destination of a test action that Xcode Cloud performs.

[`object JsonPointer`](/documentation/appstoreconnectapi/jsonpointer)

An object that contains the JSON pointer that indicates the location of the
error.

[`object Parameter`](/documentation/appstoreconnectapi/parameter)

An object that contains the query parameter that produced the error.

### [Type Aliases](/documentation/AppStoreConnectAPI#Type-Aliases)

[`type
BuildAudienceType`](/documentation/appstoreconnectapi/buildaudiencetype)

A string that represents the App Store Connect audience for a build.

[`type CiActionType`](/documentation/appstoreconnectapi/ciactiontype)

A string that represents the type of an Xcode Cloud workflow’s action.

[`type
CiCompletionStatus`](/documentation/appstoreconnectapi/cicompletionstatus)

A string that represents the completion status of an Xcode Cloud build.

[`type
CiExecutionProgress`](/documentation/appstoreconnectapi/ciexecutionprogress)

A string that represents the progress of an ongoing Xcode Cloud build.

[`type
CiTestDestinationKind`](/documentation/appstoreconnectapi/citestdestinationkind)

The string that represents the kind of a test destination.

[`type CiTestStatus`](/documentation/appstoreconnectapi/citeststatus)

A string that represents test status information.

[`type
DiagnosticInsightDirection`](/documentation/appstoreconnectapi/diagnosticinsightdirection)

A string that describes the diagnostic insight direction.

[`type
DiagnosticInsightType`](/documentation/appstoreconnectapi/diagnosticinsighttype)

A string that desribes the diagnostic insight type.

[`type
GameCenterLeaderboardFormatter`](/documentation/appstoreconnectapi/gamecenterleaderboardformatter)

The values you can select to describe the format of a leaderboard.

[`type TerritoryCode`](/documentation/appstoreconnectapi/territorycode)

The App Store territory codes.

