# Communication and connection | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/technologyoverviews/communication-and-connection
> Fetched: 2025-08-31T18:32:47.989Z

Staying connected with friends and family is an important part of people’s everyday lives. Embrace technologies that help people interact with the people around them, and keep people informed about events happening all around the world.

---

## [Keep people informed with notifications](https://developer.apple.com/documentation/technologyoverviews/communication-and-connection#Keep-people-informed-with-notifications)

Notifications are a way to draw someone’s attention to important or time-sensitive information. When your app is running, you can [schedule notifications locally](https://developer.apple.com/documentation/UserNotifications/scheduling-a-notification-locally-from-your-app) in response to interactions with your app. For example, an egg-timer app can use local notifications to alert someone when the timer they created expires. If your app is running, it receives local notifications quietly so it can display its own interface. If your app isn’t running, the system displays a notification interface to alert the person to the event.

To keep people informed of events they might not know about, add support for push notifications. With push notifications, you monitor events people care about [from your own servers](https://developer.apple.com/documentation/UserNotifications/setting-up-a-remote-notification-server). When a notification-worthy event occurs, [send a notification request](https://developer.apple.com/documentation/UserNotifications/sending-notification-requests-to-apns) to the Apple Push Notification service (APNs) to deliver that notification to the person’s devices. For example, a sports app might send push notifications to alert someone when a game involving their favorite team is about to start.

In addition to keeping people informed about relevant events, [background push notifications](https://developer.apple.com/documentation/UserNotifications/implementing-background-push-notifications) are a way to update your app quietly in the background. When you send a background push notification to your app, the system launches your app and gives it some background execution time if conditions allow. For example, a social media app might use this time to download the latest comments and posts. Performing this work in the background gives you time to incorporate new data before someone opens your app. The system manages the amount of background runtime apps receive, limiting runtime as needed to preserve battery life or performance.

Because push notifications are a potential disruption, apps must receive authorization to deliver them to people’s devices. [Make an authorization request](https://developer.apple.com/documentation/UserNotifications/asking-permission-to-use-notifications) at a point in your app’s execution where the request makes sense. For example, you might wait to enable push notifications until the person enables features that rely on them. When requesting authorization, pay attention to the response you get. If someone chooses to deny your request, or limit the types of notifications you can send, make a note on your server to avoid sending any unwanted data.

---

## [Make your content available to Siri](https://developer.apple.com/documentation/technologyoverviews/communication-and-connection#Make-your-content-available-to-Siri)

Siri is Apple’s intelligent voice assistant, and people use it regularly to interact with their devices. When you add support for [App Intents](https://developer.apple.com/documentation/AppIntents) to your app, you give Siri the ability to interact with your app’s features. For example, if someone asks Siri to “play my favorite playlist” from your music app, Siri finds the requested playlist and instructs your app to start playing music.

The [App Intents](https://developer.apple.com/documentation/AppIntents) framework helps you add the information Siri needs to your app’s existing data structures. You don’t have to rearchitect your code to add Siri support. Instead, you use protocols to turn your app’s existing data types into [app entities](https://developer.apple.com/documentation/AppIntents/app-entities), and turn relevant actions into [app intents](https://developer.apple.com/documentation/AppIntents/app-intents). Siri uses this information to locate the data and actions it needs to fulfill a request. It then calls your code to actually handle the fulfillment process.

---

SharePlay is a way for people to enjoy app-specific activities together over FaceTime. If your app offers activities that people can share, make those activities available using the [Group Activities](https://developer.apple.com/documentation/GroupActivities) framework.

Shared activities are an interplay between your app and the system. Your app handles the presentation of activities on each participant’s device, and the system helps you synchronize data between devices. For example, a chess app might share move information between participant devices. Apps that support video or audio playback additionally use the [AVFoundation](https://developer.apple.com/documentation/AVFoundation) framework to synchronize playback of that media.

Make sure you consider the sharing experience when [designing your app’s interface](https://developer.apple.com/design/Human-Interface-Guidelines/shareplay). The [Group Activities](https://developer.apple.com/documentation/GroupActivities) framework helps you define your activities and start the sharing process, but you provide the interface for launching and using those activities.
