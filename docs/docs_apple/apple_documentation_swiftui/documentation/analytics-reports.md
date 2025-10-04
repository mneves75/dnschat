# Analytics Reports

A list of app development reports, their field descriptions, and glossaries.

## [Overview](/documentation/analytics-reports#Overview)

Use the Analytics Report API to analyze data about your apps on Apple
platforms. This page provides details on downloading reports, report changes,
and a list of available reports. You can look at specific reports to read
descriptions of report fields, glossaries of values, definitions of key terms,
and coverage across platforms.

You can review these reports if you have any of these API key roles:

  * `ADMIN`

  * `SALES_AND_REPORTS`

  * `FINANCE`

Note

If you share an API key for your developer account with a third party for
analyzing or processing your reports, select the SALES_AND_REPORTS role when
generating a new key. This role can access to [`Download Sales and Trends
Reports`](/documentation/AppStoreConnectAPI/GET-v1-salesReports) but can’t
access [`Download Finance
Reports`](/documentation/AppStoreConnectAPI/GET-v1-financeReports) endpoint.

### [Download and process reports](/documentation/analytics-reports#Download-
and-process-reports)

To start receiving reports, use the [`Request
reports`](/documentation/AppStoreConnectAPI/POST-v1-analyticsReportRequests)
endpoint in the App Store Connect API. To learn more, see [Downloading
Analytics Reports](/documentation/AppStoreConnectAPI/downloading-analytics-
reports). After you create your request, use [`Read report request
information`](/documentation/AppStoreConnectAPI/GET-v1-analyticsReportRequests-
_id_) to poll the list of report instances to check whether new instances are
downloadable. Apple does not generate reports until you create a valid
Analytics Report Request.

Each report _instance_ represents a new set of data. Each instance can consist
of multiple _segments_ , which are physical partitions of one instance, so you
need to download all segments for a given instance to get the complete set of
data.

Each report instance has a specific granularity: daily, weekly, or monthly.
_Daily_ instances may contain data for one day or more days. The Date column
in the report content shows the day to which the events relate. _Weekly_
instances contain data from Monday to Sunday. _Monthly_ instances contain data
for a full month. To learn more, see [Data Completeness and
Corrections](/documentation/analytics-reports/data-completeness-corrections).

Note

For weekly and monthly report instances, the `Date` column represents the
first day of the week and month, respectively.

### [Retrieve missed reports](/documentation/analytics-reports#Retrieve-
missed-reports)

Once you generate a report instance, it’s available for 35 days. After this
period, the system automatically deletes report instances. In that event, you
are able to initiate a new one-time snapshot request using the [Request
reports](https://developer.apple.com/documentation/appstoreconnectapi/post-v1-analyticsreportrequests)
endpoint in App Store Connect API to retrieve data that is no longer available
in a daily generated report. This request generates a comprehensive data
collection of all available historical reports. You can make a single, one-
time snapshot request per month.

### [Monitor future report changes](/documentation/analytics-reports#Monitor-
future-report-changes)

Report column position might change over time. Rely on column names instead of
column positions in the report files to ensure smoother schema upgrades.
Report values are not case sensitive.

## [Topics](/documentation/analytics-reports#topics)

### [Essentials](/documentation/analytics-reports#Essentials)

[Data Completeness and Corrections](/documentation/analytics-reports/data-
completeness-corrections)

Understand how the Analytics Reports API provides complete data sets.

[Protecting user privacy in report data](/documentation/analytics-
reports/privacy)

Understand measures that help protect user privacy.

### [App Store Engagement](/documentation/analytics-reports#App-Store-
Engagement)

Engagement information shows how people find, discover, and share your app on
the App Store.

[App Store Discovery and Engagement](/documentation/analytics-reports/app-
store-discovery-and-engagement)

Analyze how users interact with your app on the App Store.

[App Store Web Preview](/documentation/analytics-reports/app-store-web-
preview)

Analyze how users engage with your app’s product pages and in-app events on
web browsers.

### [App Store Commerce](/documentation/analytics-reports#App-Store-Commerce)

Information about App Store downloads, pre-orders, and purchases.

[App Store Downloads](/documentation/analytics-reports/app-download)

Analyze how many times people download your app on the App Store.

[App Store Pre-orders](/documentation/analytics-reports/app-store-pre-order)

Analyze details on the number of pre-orders that people place and cancel for
your app on the App Store.

[App Store Purchases](/documentation/analytics-reports/app-store-purchase)

Analyze total revenue generated by your apps on the App Store.

### [App Usage](/documentation/analytics-reports#App-Usage)

Usage information helps you understand how people interact with your apps, and
includes details about app sessions, installations, and crashes.

[App Clip Usage](/documentation/analytics-reports/app-clip-usage)

Analyze how users engage with your App Clips.

[App Crashes](/documentation/analytics-reports/app-crashes)

Review crashes for your App Store apps based on app version and device type.

[App Store Installations and Deletions](/documentation/analytics-reports/app-
installs)

Analyze details on the number of times users install and delete your apps.

[App Store Opt-in](/documentation/analytics-reports/app-store-opt-in)

Analyze the percentage of first-time app downloaders who choose to share their
data with you.

[App Sessions](/documentation/analytics-reports/app-sessions)

Analyze how often people open your App Store apps, and the average session
duration.

[CarPlay App Usage](/documentation/analytics-reports/carplay-app-usage)

Review how people use CarPlay in your app.

[Platform App Installs](/documentation/analytics-reports/platform-app-
installs)

Analyze your app’s install data by date, install type, channel, device,
platform version, and territory.

### [Framework Usage](/documentation/analytics-reports#Framework-Usage)

Framework usage details help you analyze how people interact with your app and
how your app uses APIs.

[AccessorySetupKit Accessory Picker Sessions](/documentation/analytics-
reports/accessorysetupkit-accessory-picker-sessions)

Analyze how many people use your app to set up accessories by using
AccessorySetupKit.

[AccessorySetupKit Usage](/documentation/analytics-reports/accessorysetupkit-
usage)

Analyze how often your app uses AccessorySetupKit.

[AirPlay Discovery Sessions](/documentation/analytics-reports/airplay-
discovery-sessions)

Review information about AirPlay discovery sessions.

[Animoji Stickers Sent](/documentation/analytics-reports/animoji-stickers-
sent)

Analyze how many times people use Memoji stickers in your app.

[App Added to Focus](/documentation/analytics-reports/app-added-to-focus)

Review information about your app’s relationship to Focus modes.

[App Disk Space Usage](/documentation/analytics-reports/app-disk-space-usage)

Analyze your app’s disk space use.

[App Runtime Usage](/documentation/analytics-reports/app-runtime-usage)

Analyze how often your app executes specific symbols of different dynamic
libraries.

[App Sessions Context](/documentation/analytics-reports/app-sessions-context)

Analyze how many people use your app and for how long.

[Application Preferred Language Settings](/documentation/analytics-
reports/application-preferred-language-settings)

Review how people use language preference settings in your app.

[ARKit ARSession Duration](/documentation/analytics-reports/arkit-arsession-
duration)

Review information about ARKit ARSession duration.

[ARKit ARSession Failures](/documentation/analytics-reports/arkit-arsession-
failures)

Analyze details about ARKit ARSession failures.

[ARKit Capture Frame Rate Throttling](/documentation/analytics-reports/arkit-
capture-frame-rate-throttling)

Analyze how long it takes for ARKit to throttle the camera frame rate.

[ARKit Collaborative Session Features](/documentation/analytics-reports/arkit-
collaborative-session-features)

Review how your app uses ARKit collaborative session features.

[ARKit Face Tracking](/documentation/analytics-reports/arkit-face-tracking)

Analyze how often your app uses ARKit face tracking.

[ARKit Video Formats](/documentation/analytics-reports/arkit-video-formats)

Review information about ARKit video formats and high-resolution frames.

[ARKit World Tracking](/documentation/analytics-reports/arkit-world-tracking)

Review the configured settings for world tracking in your app.

[ARKit World Tracking Image Detection](/documentation/analytics-reports/arkit-
world-tracking-image-detection)

Analyze the number of images detected in ARKit world tracking.

[Audio Input Muting](/documentation/analytics-reports/audio-input-muting)

Analyze details about audio-input muting and unmuting gestures during a call
with conferencing apps.

[Audio Input Route and Duration and Call Mode](/documentation/analytics-
reports/audio-input-route-and-duration-and-call-mode)

Review how your app uses audio session inputs.

[Audio Session Audio Unit Usage](/documentation/analytics-reports/audio-
session-audio-unit-usage)

Analyze your app’s audio unit use.

[Audio Volume Levels and Duration](/documentation/analytics-reports/audio-
volume-levels-and-duration)

Review how your app uses volume and duration for output audio.

[Automatic Speech Recognition Usage](/documentation/analytics-
reports/automatic-speech-recognition-usage)

Analyze how often people use dictation or Siri in your app.

[Bluetooth LE Advertising](/documentation/analytics-reports/bluetooth-le-
advertising)

Review how your app uses Bluetooth Low Energy (LE) advertising.

[Bluetooth LE Connection Results](/documentation/analytics-reports/bluetooth-
le-connection-results)

Analyze how often your app uses Low Energy (LE) connections and the connection
results.

[Bluetooth LE Connections Per App](/documentation/analytics-reports/bluetooth-
le-connections-per-app)

Analyze the number of completed Bluetooth Low Energy (LE) connections for your
app.

[Bluetooth LE Disconnection Results](/documentation/analytics-
reports/bluetooth-le-disconnection-results)

Review Low Energy (LE) disconnections for your app.

[Bluetooth LE Scans](/documentation/analytics-reports/bluetooth-le-scans)

Review how your app uses Bluetooth Low Energy (LE) scans.

[Bluetooth LE Sessions](/documentation/analytics-reports/bluetooth-le-
sessions)

Analyze how often your app uses Bluetooth Low Energy (LE) connections.

[Browser Choice Screen Engagement (iOS versions before
18.2)](/documentation/analytics-reports/browser-choice-screen-engagement)

Measure how often your web browser app is being selected as the default from
the browser choice screen on iOS.

[Call Services and Call Performance](/documentation/analytics-reports/call-
services-and-call-performance)

Review your app’s use of call services and call performance.

[CarPlay Navigation](/documentation/analytics-reports/carplay-navigation)

Analyze how often people start route-guidance sessions in your app.

[Collaboration Message Usage](/documentation/analytics-reports/collaboration-
message-usage)

Analyze how often people use collaboration messages in your app.

[Core Location Authorization Results](/documentation/analytics-reports/core-
location-authorization-results)

Review authorizations that people grant as a result of requests from your app.

[Core Location Geofencing](/documentation/analytics-reports/core-location-
geofencing)

Review how your app uses geo fences.

[CRABS-Based Video Playback Usage](/documentation/analytics-reports/crabs-
based-video-playback-usage)

Analyze how often your app uses CRABS video playback or video playback that
uses the CRABS protocol.

[Custom Language Model Builds Started](/documentation/analytics-
reports/custom-language-model-builds-started)

Analyze how often your app triggers a rebuild of custom language models.

[Customized Transcription Requests](/documentation/analytics-
reports/customized-transcription-requests)

Analyze transcription request use of custom language models.

[DockKit App Usage](/documentation/analytics-reports/dockkit-app-usage)

Review how your application uses DockKit accessories.

[Dynamic Island Layout Changes](/documentation/analytics-reports/dynamic-
island-layout-changes)

Analyze changes in Dynamic Island layout state.

[File-Based Video Playback Usage](/documentation/analytics-reports/file-based-
video-playback-usage)

Analyze how often your app uses file playback or playback that occurs on the
local file system.

[Flashlight Usage](/documentation/analytics-reports/flashlight-usage)

Review information about flashlight state.

[Game Controller Haptics Engine Creation](/documentation/analytics-
reports/game-controller-haptics-engine-creation)

Analyze how your app uses haptic localities and which controllers it uses.

[Game Controller Sessions](/documentation/analytics-reports/game-controller-
sessions)

Analyze how often and how long people are in game-controller sessions in your
app.

[Haptics Engine Usage](/documentation/analytics-reports/haptics-engine-usage)

Review how often your app plays haptics.

[Home Screen Widget Installs](/documentation/analytics-reports/home-screen-
widget-installs)

Analyze how often people add your widget to their Home Screens.

[Home Screen Widget Rotations](/documentation/analytics-reports/home-screen-
widget-rotations)

Analyze how often your app’s widget rotates to the front of a Smart Stack.

[Home Screen Widget Usage](/documentation/analytics-reports/home-screen-
widget-usage)

Analyze how many people are interacting with your Widget.

[Home Screen Widgets](/documentation/analytics-reports/home-screen-widgets)

Analyze when the system adds your app widget to a default Smart Stack on the
Home Screen.

[HTTP Live Streaming Playback Count](/documentation/analytics-reports/http-
live-streaming-playback-count)

Review your app’s use of HTTP Live Streaming (HLS) assets in AVFoundation
APIs.

[HTTP Live Streaming Video Playback Usage](/documentation/analytics-
reports/http-live-streaming-video-playback-usage)

Review information about how your app uses HTTP live streaming (HLS) video
playback or video playback that uses the HLS protocol.

[Keyboard Dictation Usage](/documentation/analytics-reports/keyboard-
dictation-usage)

Analyze how people use keyboard dictation in your app.

[Live Activity Use](/documentation/analytics-reports/live-activity-use)

Review how your app uses Live Activity.

[Load CoreML Models Metrics](/documentation/analytics-reports/load-coreml-
models-metrics)

Review your app’s use of Core ML models.

[Local Network Privacy](/documentation/analytics-reports/local-network-
privacy)

Analyze results of the Local Network Privacy prompt.

[Location Sessions](/documentation/analytics-reports/location-sessions)

Review how your app uses Core Location APIs.

[Lock Screen Widget Configuration](/documentation/analytics-reports/lock-
screen-widget-configuration)

Analyze how often people configure your widgets on the Lock Screen.

[Metal Command Queues](/documentation/analytics-reports/metal-command-queues)

Review your app’s use of Metal Command Queues.

[Mode Activity Notifications](/documentation/analytics-reports/mode-activity-
notifications)

Review information about how users resolve notifications in your app.

[Multiple Game Controllers Usage](/documentation/analytics-reports/multiple-
game-controllers-usage)

Review how people using your app use multiple game controllers.

[Notification Summary Engagement](/documentation/analytics-
reports/notification-summary-engagement)

Analyze how often people engage with notification summaries in your app.

[Photogrammetry ObjectCaptureSession API Usage](/documentation/analytics-
reports/photogrammetry-objectcapturesession-api-usage)

Review how often your app uses object capture for photogrammetry.

[PhotogrammetrySession API Usage](/documentation/analytics-
reports/photogrammetrysession-api-usage)

Review how often your app uses object modeling for photogrammetry.

[PhotoKit Imports](/documentation/analytics-reports/photokit-imports)

Review how your app imports PhotoKit assets.

[Photos Library Access](/documentation/analytics-reports/photos-library-
access)

Review what type of Photos Library Access people grant in your app.

[Photos Picker](/documentation/analytics-reports/photos-picker)

Analyze how people use Photos in your app.

[Photos Sharing](/documentation/analytics-reports/photos-sharing)

Analyze how often people share Photos in your app.

[Reminders Usage](/documentation/analytics-reports/reminders-usage)

Analyze how often your app interacts with system reminders.

[RoomPlan Usage](/documentation/analytics-reports/roomplan-usage)

Review how people use RoomPlan in your app.

[Safari Extensions Enablement](/documentation/analytics-reports/safari-
extensions-enablement)

Analyze how often people enable your Safari extension.

[Safari Extensions Usage](/documentation/analytics-reports/safari-extensions-
usage)

Review how people use your Safari extension.

[Shared With You Content Engagement](/documentation/analytics-reports/shared-
with-you-content-engagement)

Review information about people engaging with Shared with You content in your
app.

[SharePlay Usage by Activity Type](/documentation/analytics-reports/shareplay-
usage-by-activity-type)

Review how people use SharePlay in your app.

[ShazamKit Usage](/documentation/analytics-reports/shazamkit-usage)

Analyze how your app utilizes ShazamKit.

[Spatial Audio Usage](/documentation/analytics-reports/spatial-audio-usage)

Analyze changes in spatial audio modes.

[Speech Framework Transcription Request Audio
Duration](/documentation/analytics-reports/speech-framework-transcription-
request-audio-duration)

Analyze the distribution of audio duration for transcription requests in your
app.

[Speech Framework Transcription Requests](/documentation/analytics-
reports/speech-framework-transcription-requests)

Review transcription requests in your app.

[Text-Input Actions](/documentation/analytics-reports/text-input-actions)

Review information on text-input actions.

[Translation Request Usage](/documentation/analytics-reports/translation-
request-usage)

Review information about how people use speech-to-text translation in your
app.

[Verify With Wallet Document Request Availability](/documentation/analytics-
reports/verify-with-wallet-document-request-availability)

Review how your app uses identity and authorization APIs to check document
request availability

[Verify with Wallet Document Requests](/documentation/analytics-
reports/verify-with-wallet-document-requests)

Review how your app uses identity and authorization APIs.

[Video Duration Information](/documentation/analytics-reports/video-duration-
information)

Review information about video duration.

[Video PiP Duration](/documentation/analytics-reports/video-pip-duration)

Review the duration of time your app uses Picture in Picture (PiP).

[VisionKit Data Detectors](/documentation/analytics-reports/visionkit-data-
detectors)

Review your app’s use of data detector invocation for VisionKit.

[VisionKit Image Analysis](/documentation/analytics-reports/visionkit-image-
analysis)

Analyze VisionKit analysis requests on images.

[VisionKit Live Text Usage](/documentation/analytics-reports/visionkit-live-
text-usage)

Review information about how people interact with Live Text.

[VisionKit Sessions](/documentation/analytics-reports/visionkit-sessions)

Review VisionKit sessions in your app.

[Browser Choice Screen Selection](/documentation/analytics-reports/browser-
choice-screen-selection)

This report details percentage of devices that had your web browser
application selected as default from the Browser Choice screen.

[Default Browser Usage Rate](/documentation/analytics-reports/default-browser-
usage-rate)

Review percentage of devices where your browser app is set as the default web
browser.

[Wi-Fi Known Network Modifications](/documentation/analytics-reports/wi-fi-
known-network-modifications)

Analyze details about people adding and removing known networks by using Wi-Fi
manager in your app.

### [Performance](/documentation/analytics-reports#Performance)

Performance metrics show how your app performs and how users interact with
specific features.

[AirPlay Errors](/documentation/analytics-reports/airplay-errors)

Analyze AirPlay errors in your apps.

[AirPlay Performance](/documentation/analytics-reports/airplay-performance)

Review AirPlay performance in your apps.

[App Crashes Expanded](/documentation/analytics-reports/app-crashes-expanded)

Analyze the rate at which your app crashes.

[App Installs Performance](/documentation/analytics-reports/app-installs-
performance)

Analyze details about installation success and failure rates for your apps.

[App Storage Reads and Writes](/documentation/analytics-reports/app-storage-
reads-and-writes)

Analyze how often your app uses disk reads and writes.

[Audio Overloads](/documentation/analytics-reports/audio-overloads)

Analyze how many audio glitches people experience in your app.

[Bluetooth LE Session Duration](/documentation/analytics-reports/bluetooth-le-
session-duration)

Analyze how long your app uses Bluetooth Low Energy (LE) connections.

[Bluetooth System Wakes](/documentation/analytics-reports/bluetooth-system-
wakes)

Analyze details about bluetooth system wakes that your app causes.

[CAMetalLayer Performance](/documentation/analytics-reports/cametallayer-
performance)

Review CAMetalLayer metadata and performance in your app.

[Custom Language Model Builds Failed](/documentation/analytics-reports/custom-
language-model-builds-failed)

Analyze how often your app-triggered rebuild of a custom language model
failed.

[Display Power Information](/documentation/analytics-reports/display-power-
information)

Review your app’s impact on display pixel attributes.

[HTTP Live Streaming Playback Errors](/documentation/analytics-reports/http-
live-streaming-playback-errors)

Analyze playback errors that your app receives.

[Launch Image Over Memory Limit](/documentation/analytics-reports/launch-
image-over-memory-limit)

Analyze how often your app fails to load because it’s over the memory limit.

[Networking Connection Activity](/documentation/analytics-reports/networking-
connection-activity)

Review how your app uses network connections.

[Spotlight Query Performance](/documentation/analytics-reports/spotlight-
query-performance)

Review how your app uses Spotlight queries.

[Streaming Downloads Performance](/documentation/analytics-reports/streaming-
downloads-performance)

Review download performance when using the AVAssetDownloadTask APIs in your
apps.

[Streaming Playback Performance](/documentation/analytics-reports/streaming-
playback-performance)

Review playback performance when using the AVPlayerItem APIs in your apps.

