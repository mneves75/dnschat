# Analytics Reports | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/analytics-reports
> Fetched: 2025-08-31T18:31:28.101Z

## [Overview](https://developer.apple.com/documentation/analytics-reports#Overview)

Use the Analytics Report API to analyze data about your apps on Apple platforms. This page provides details on downloading reports, report changes, and a list of available reports. You can look at specific reports to read descriptions of report fields, glossaries of values, definitions of key terms, and coverage across platforms.

You can review these reports if you have any of these API key roles:

- `ADMIN`
- `SALES_AND_REPORTS`
- `FINANCE`

### [Download and process reports](https://developer.apple.com/documentation/analytics-reports#Download-and-process-reports)

To start receiving reports, use the [`Request reports`](https://developer.apple.com/documentation/AppStoreConnectAPI/POST-v1-analyticsReportRequests) endpoint in the App Store Connect API. To learn more, see [Downloading Analytics Reports](https://developer.apple.com/documentation/AppStoreConnectAPI/downloading-analytics-reports). After you create your request, use [`Read report request information`](https://developer.apple.com/documentation/AppStoreConnectAPI/GET-v1-analyticsReportRequests-_id_) to poll the list of report instances to check whether new instances are downloadable. Apple does not generate reports until you create a valid Analytics Report Request.

Each report _instance_ represents a new set of data. Each instance can consist of multiple _segments_, which are physical partitions of one instance, so you need to download all segments for a given instance to get the complete set of data.

Each report instance has a specific granularity: daily, weekly, or monthly. _Daily_ instances may contain data for one day or more days. The Date column in the report content shows the day to which the events relate. _Weekly_ instances contain data from Monday to Sunday. _Monthly_ instances contain data for a full month. To learn more, see [Data Completeness and Corrections](https://developer.apple.com/documentation/analytics-reports/data-completeness-corrections).

### [Retrieve missed reports](https://developer.apple.com/documentation/analytics-reports#Retrieve-missed-reports)

Once you generate a report instance, it’s available for 35 days. After this period, the system automatically deletes report instances. In that event, you are able to initiate a new one-time snapshot request using the [Request reports](https://developer.apple.com/documentation/appstoreconnectapi/post-v1-analyticsreportrequests) endpoint in App Store Connect API to retrieve data that is no longer available in a daily generated report. This request generates a comprehensive data collection of all available historical reports. You can make a single, one-time snapshot request per month.

### [Monitor future report changes](https://developer.apple.com/documentation/analytics-reports#Monitor-future-report-changes)

Report column position might change over time. Rely on column names instead of column positions in the report files to ensure smoother schema upgrades. Report values are not case sensitive.

## [Topics](https://developer.apple.com/documentation/analytics-reports#topics)

### [App Store Engagement](https://developer.apple.com/documentation/analytics-reports#App-Store-Engagement)

Engagement information shows how people find, discover, and share your app on the App Store.

[App Store Web Preview](https://developer.apple.com/documentation/analytics-reports/app-store-web-preview)

Analyze how users engage with your app’s product pages and in-app events on web browsers.

### [App Store Commerce](https://developer.apple.com/documentation/analytics-reports#App-Store-Commerce)

Information about App Store downloads, pre-orders, and purchases.

[App Store Pre-orders](https://developer.apple.com/documentation/analytics-reports/app-store-pre-order)

Analyze details on the number of pre-orders that people place and cancel for your app on the App Store.

### [App Usage](https://developer.apple.com/documentation/analytics-reports#App-Usage)

Usage information helps you understand how people interact with your apps, and includes details about app sessions, installations, and crashes.

[App Crashes](https://developer.apple.com/documentation/analytics-reports/app-crashes)

Review crashes for your App Store apps based on app version and device type.

[App Store Opt-in](https://developer.apple.com/documentation/analytics-reports/app-store-opt-in)

Analyze the percentage of first-time app downloaders who choose to share their data with you.

[App Sessions](https://developer.apple.com/documentation/analytics-reports/app-sessions)

Analyze how often people open your App Store apps, and the average session duration.

[Platform App Installs](https://developer.apple.com/documentation/analytics-reports/platform-app-installs)

Analyze your app’s install data by date, install type, channel, device, platform version, and territory.

### [Framework Usage](https://developer.apple.com/documentation/analytics-reports#Framework-Usage)

Framework usage details help you analyze how people interact with your app and how your app uses APIs.

[App Runtime Usage](https://developer.apple.com/documentation/analytics-reports/app-runtime-usage)

Analyze how often your app executes specific symbols of different dynamic libraries.

[Audio Input Muting](https://developer.apple.com/documentation/analytics-reports/audio-input-muting)

Analyze details about audio-input muting and unmuting gestures during a call with conferencing apps.

[Home Screen Widgets](https://developer.apple.com/documentation/analytics-reports/home-screen-widgets)

Analyze when the system adds your app widget to a default Smart Stack on the Home Screen.

[Browser Choice Screen Selection](https://developer.apple.com/documentation/analytics-reports/browser-choice-screen-selection)

This report details percentage of devices that had your web browser application selected as default from the Browser Choice screen.

### [Performance](https://developer.apple.com/documentation/analytics-reports#Performance)

Performance metrics show how your app performs and how users interact with specific features.

[Audio Overloads](https://developer.apple.com/documentation/analytics-reports/audio-overloads)

Analyze how many audio glitches people experience in your app.
