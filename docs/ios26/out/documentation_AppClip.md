# App Clips | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AppClip
> Fetched: 2025-08-31T18:31:29.521Z

## [Overview](https://developer.apple.com/documentation/AppClip#overview)

An _App Clip_ is a lightweight version of your app that offers access to some of the app’s functionality. For example, a donut shop’s app a person downloads and installs from the App Store may allow them to order donuts, save favorites, collect rewards, get special offers, and so on. The donut shop’s App Clip is instantly available – for example, when someone searches for “donuts” near the shop – without the need to install the full app. To ensure a fast launch experience and a fast order experience, the App Clip offers only the functionality to order donuts.

![A flowchart illustrating the flow for an App Clip. From left to right, the images shows an App Clip Code as an invocation, an App Clip card for a donut shop, the App Clip of the donut shop, and a donut.](https://docs-assets.developer.apple.com/published/1fa269ccc94c2866e6b1c27d127a4cb5/media-4301753%402x.png)

App Clips that conform to a set of constraints can be larger in size, making it possible to offer an App Clip that’s a demo version of your app. The larger demo size allows people to experience your app’s functionality without a purchase or subscription. For example, a game might offer an App Clip to play the first level, a fitness app might offer an App Clip with a free workout, and so on. When a person has finished the game’s first level or completed the free workout, the App Clip displays a prompt to install the full app.

### [Offer a great user experience](https://developer.apple.com/documentation/AppClip#Offer-a-great-user-experience)

App Clips provide a polished user experience that helps users solve a real-world task as quickly as possible or effortlessly try out a new app. Additionally, App Clips don’t appear on the Home screen, and users don’t manage them the way they manage full apps. Instead, the system removes an App Clip from a device after a period of inactivity, emphasizing the importance of a polished user experience.

For design guidance, see [Human Interface Guidelines > App Clips](https://developer.apple.com/design/human-interface-guidelines/app-clips/overview/).

### [Review App Clip creation](https://developer.apple.com/documentation/AppClip#Review-App-Clip-creation)

Limit the function of an App Clip to ensure a fast launch experience, protect user privacy, and preserve resources for in-the-moment experiences and demo versions of your app. Before you create an App Clip:

1.  Review technology available to App Clips and constraints that ensure a good user experience.
2.  Identify which of your app’s functionalities might make a great App Clip.
3.  Learn how people discover and launch App Clips with _invocations_ and how you configure App Clip experiences and use invocation URLs to offer a great launch experience.

For more information, refer to [Choosing the right functionality for your App Clip](https://developer.apple.com/documentation/appclip/choosing-the-right-functionality-for-your-app-clip) and [Configuring App Clip experiences](https://developer.apple.com/documentation/appclip/configuring-the-launch-experience-of-your-app-clip).

When you’ve identified functionality for your App Clip and identified invocations:

- Make changes to your app’s Xcode project and your code; for example, add an App Clip target and share code between your App Clip and full app.
- Add code to respond to invocations and to handle invocation URLs.
- Create App Clip experiences in App Store Connect.
- Optionally, associate your App Clip with your website to support additional invocations and advanced App Clip experiences.
- Optionally, create App Clip Codes that offer the best experience for people to discover and launch your App Clip.
