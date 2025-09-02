# Personal data | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/technologyoverviews/personal-data
> Fetched: 2025-08-31T18:32:44.931Z

Apple devices manage a lot of personal information, including a person’s contacts, their photos, and even their health data. Although people use system apps to manage many types of data, other apps can access that data too. For example, a running app might add each new workout to the person’s health data. For some types of data, you can also contribute new data your app collects.

The data people put on their devices belongs to them, and much of it is personal information they might not want to share. Before you access any personal data, request permission to do so and provide a reason why you need that data.

Before you access any personal data, each Apple technology has specific API you must call to request access to that data. The first time your app calls one of these API, the system displays a special panel to inform the person of your request. The person then uses this panel to grant or deny access, and the system records their choice and typically doesn’t display the panel again. Subsequent requests for access simply return the previously requested choice.

When the system prompts someone to grant or deny a request, the panel displays a _usage description_ string that you provide. This string is your opportunity to tell the person how you intend to use their data. People use these strings to decide whether or not to grant access, so it’s important to provide a compelling reason for access. Be clear about how your intentions, and communicate the benefits you provide with access to the data. For example, a running app might indicate that it contributes the workout data it collects to the person’s health records.

## [Fetch different types of personal data](https://developer.apple.com/documentation/technologyoverviews/personal-data#Fetch-different-types-of-personal-data)

Access or modify someone’s personal data using the appropriate system frameworks. The following table lists the types of data you can retrieve, the frameworks you use to access or modify that data, and the usage description keys you can include in the Info pane of your project in Xcode. When multiple keys are available, choose the ones that match the type of access you’re requesting.

Data

Framework

Usage description keys

Contacts

[Contacts](https://developer.apple.com/documentation/Contacts), [Contacts UI](https://developer.apple.com/documentation/ContactsUI)

[`NSContactsUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSContactsUsageDescription)

Calendar events

[EventKit](https://developer.apple.com/documentation/EventKit), [EventKit UI](https://developer.apple.com/documentation/EventKitUI)

[`NSCalendarsFullAccessUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSCalendarsFullAccessUsageDescription), [`NSCalendarsWriteOnlyAccessUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSCalendarsWriteOnlyAccessUsageDescription)

Health information

[HealthKit](https://developer.apple.com/documentation/HealthKit)

[`NSHealthClinicalHealthRecordsShareUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSHealthClinicalHealthRecordsShareUsageDescription), [`NSHealthShareUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSHealthShareUsageDescription), [`NSHealthUpdateUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSHealthUpdateUsageDescription)

Location

[Core Location](https://developer.apple.com/documentation/CoreLocation), [CoreLocationUI](https://developer.apple.com/documentation/CoreLocationUI)

[`NSLocationWhenInUseUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSLocationWhenInUseUsageDescription), [`NSLocationAlwaysAndWhenInUseUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSLocationAlwaysAndWhenInUseUsageDescription), [`NSLocationTemporaryUsageDescriptionDictionary`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSLocationTemporaryUsageDescriptionDictionary)

Music

[MusicKit](https://developer.apple.com/documentation/MusicKit), [Apple Music API](https://developer.apple.com/documentation/AppleMusicAPI)

[`NSAppleMusicUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSAppleMusicUsageDescription)

Photos

[PhotoKit](https://developer.apple.com/documentation/PhotoKit)

[`NSPhotoLibraryAddUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSPhotoLibraryAddUsageDescription), [`NSPhotoLibraryUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSPhotoLibraryUsageDescription)

Reminders

[EventKit](https://developer.apple.com/documentation/EventKit), [EventKit UI](https://developer.apple.com/documentation/EventKitUI)

[`NSRemindersFullAccessUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSRemindersFullAccessUsageDescription)

Financial data

[`PKPassLibrary`](https://developer.apple.com/documentation/PassKit/PKPassLibrary)

Game Center friends

[GameKit](https://developer.apple.com/documentation/GameKit)

[`NSGKFriendListUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSGKFriendListUsageDescription)

TV provider account information

[Video Subscriber Account](https://developer.apple.com/documentation/VideoSubscriberAccount)

[`NSVideoSubscriberAccountUsageDescription`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSVideoSubscriberAccountUsageDescription)

---

## [Access environmental data on Apple Vision Pro](https://developer.apple.com/documentation/technologyoverviews/personal-data#Access-environmental-data-on-Apple-Vision-Pro)

The cameras on Apple Vision Pro generate significant amounts of data about a person’s environment. To protect people’s privacy, visionOS limits the types of information apps can receive directly from these cameras. For example, the system provides a 3D mesh of a person’s environment to detect collisions with virtual content, but it doesn’t provide direct access to the cameras or LiDAR sensor it uses to generate that mesh. Similarly, the system handles many standard hand gestures, and makes hand positions and movements available through special APIs.

Most of the environmental data you receive in visionOS comes from the ARKit framework. This framework helps you detect items in a person’s environment in a privacy friendly way. You can perform and track, detect planes, build a mesh of the environment, track objects and images, and much more.

---

## [Verify someone’s identity](https://developer.apple.com/documentation/technologyoverviews/personal-data#Verify-someones-identity)

Many state and federal governments let people verify their identity digitally using their iPhone. Support for mobile driver’s licenses and national identity cards gives people a way to prove their identity in a more privacy friendly way than showing the corresponding documents. On iPhone, people store the digital versions of these documents in the Wallet app.

If you’re creating an app that requires an identity verification element, you can request access to someone’s documents using the [Verify with Wallet API](https://developer.apple.com/wallet/get-started-with-verify-with-wallet/). To use this API, first submit an [entitlement request form](https://developer.apple.com/contact/request/verify-with-wallet/), with the reason why you need this information. Upon receiving the entitlement, use the [PassKit (Apple Pay and Wallet)](https://developer.apple.com/documentation/PassKit) framework to [generate requests](https://developer.apple.com/documentation/PassKit/requesting-identity-data-from-a-wallet-pass) for someone’s digital identity.

If you need to verify identity information on someone else’s iPhone, use the [ProximityReader](https://developer.apple.com/documentation/ProximityReader) framework to read that data in a secure and private manner. For example, an app that provides an age verification service for patrons entering a bar might use this approach. Before entering the bar, the host would ask people to present their iPhone, which the host would then scan using the app. The host only receives confirmation that the person is the required age, and doesn’t receive any other personal information.
