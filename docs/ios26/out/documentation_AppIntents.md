# App Intents | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AppIntents
> Fetched: 2025-08-31T18:31:32.354Z

## [Overview](https://developer.apple.com/documentation/AppIntents#Overview)

The App Intents framework provides functionality to deeply integrate your app’s actions and content with system experiences across platforms, including Siri, Spotlight, widgets, controls and more. With Apple Intelligence and enhancements to App Intents, Siri will suggest your app’s actions to help people discover your app’s features and gains the ability to take actions in and across apps.

![A hero image of an App Intents framework icon.](https://docs-assets.developer.apple.com/published/4c11e7619eec4482c4c0d9fdb7676e38/app-intents-hero%402x.png)

By adopting the App Intents framework, you allow people to personalize their devices by instantly using your app’s functionality with:

- Interactions with Siri, including those that use the personal context awareness and action capabilities of Apple Intelligence.
- Spotlight suggestions and search.
- Actions and automations in the Shortcuts app.
- Hardware interactions that initiate app actions, like the Action button and squeeze gestures on Apple Pencil.
- Focus to allow people to reduce distractions.

For example, App Intents enables you to express your app’s actions, by offering an App Shortcut. People can then ask Siri to take those actions on their behalf, whether they’re in your app or elsewhere in the system. Use App Entities to expose content in your app to Spotlight and semantic indexing with Apple Intelligence. People can then ask Siri to retrieve information from your app, like asking Siri to pull up flight information from a travel app to share with a loved one.

You reuse these components with other technologies to offer additional features and experiences that make your app and its functionality even more discoverable and widely available. For example, you reuse modular App Intents code together with [WidgetKit](https://developer.apple.com/documentation/WidgetKit) to offer:

- Interactive widgets
- Controls
- Live Activities

To learn more about features that the App Intents framework enables and how you can best adopt the framework, see [Making actions and content discoverable and widely available](https://developer.apple.com/documentation/appintents/making-actions-and-content-discoverable-and-widely-available).

For design guidance, see [Human Interface Guidelines > App Shortcuts](https://developer.apple.com/design/human-interface-guidelines/app-shortcuts), [Human Interface Guidelines > Siri](https://developer.apple.com/design/human-interface-guidelines/siri), and [Human Interface Guidelines > Action Button](https://developer.apple.com/design/human-interface-guidelines/action-button).

## [Topics](https://developer.apple.com/documentation/AppIntents#topics)

### [Siri and Apple Intelligence](https://developer.apple.com/documentation/AppIntents#Siri-and-Apple-Intelligence)

[App intent domains](https://developer.apple.com/documentation/appintents/app-intent-domains)

Make your app’s actions and content available to Siri and Apple Intelligence with assistant schemas.

### [Visual intelligence](https://developer.apple.com/documentation/AppIntents#Visual-intelligence)

[Visual Intelligence](https://developer.apple.com/documentation/VisualIntelligence)

Include your app’s content in search results that visual intelligence provides.

Beta

### [Other system experiences](https://developer.apple.com/documentation/AppIntents#Other-system-experiences)

[Focus](https://developer.apple.com/documentation/appintents/focus)

Adjust your app’s behavior and filter incoming notifications when the current Focus changes.

[Action button on iPhone and Apple Watch](https://developer.apple.com/documentation/appintents/actionbutton)

Enable people to run your App Shortcuts with the Action button on iPhone or to start your app’s workout or dive sessions using the Action button on Apple Watch.

[Developing a WidgetKit strategy](https://developer.apple.com/documentation/WidgetKit/Developing-a-WidgetKit-strategy)

Explore features, tasks, related frameworks, and constraints as you make a plan to implement widgets, controls, watch complications, and Live Activities.

### [Actions](https://developer.apple.com/documentation/AppIntents#Actions)

[App intents](https://developer.apple.com/documentation/appintents/app-intents)

Define the custom actions your app exposes to the system, and incorporate support for existing SiriKit intents.

[Intent discovery](https://developer.apple.com/documentation/appintents/intent-discovery)

Donate your app’s intents to the system to help it identify trends and predict future behaviors.

[App Shortcuts](https://developer.apple.com/documentation/appintents/app-shortcuts)

Integrate your app’s intents and entities with the Shortcuts app, Siri, Spotlight, and the Action button on supported iPhone and Apple Watch models.

### [Parameters, custom data types, and queries](https://developer.apple.com/documentation/AppIntents#Parameters-custom-data-types-and-queries)

[Parameter resolution](https://developer.apple.com/documentation/appintents/parameter-resolution)

Define the required parameters for your app intents and specify how to resolve those parameters at runtime.

[App entities](https://developer.apple.com/documentation/appintents/app-entities)

Make core types or concepts discoverable to the system by declaring them as app entities.

[Entity queries](https://developer.apple.com/documentation/appintents/entity-queries)

Help the system find the entities your app defines and use them to resolve parameters.

[Resolvers](https://developer.apple.com/documentation/appintents/resolvers)

Resolve the parameters of your app intents, and extend the standard resolution types to include your app’s custom types.

### [Utility types](https://developer.apple.com/documentation/AppIntents#Utility-types)

[Common types](https://developer.apple.com/documentation/appintents/common-data-types)

Specify common types that your app supports, including currencies, files, and contacts.

### [Errors](https://developer.apple.com/documentation/AppIntents#Errors)

[`struct AppIntentError`](https://developer.apple.com/documentation/appintents/appintenterror)

Errors that your intent-handling code can return to indicate problems while interpreting or executing an app intent.

### [Structures](https://developer.apple.com/documentation/AppIntents#Structures)

[`struct EntityPropertyModifiers`](https://developer.apple.com/documentation/appintents/entitypropertymodifiers)

[`struct IntentChoiceOption`](https://developer.apple.com/documentation/appintents/intentchoiceoption)

A structure representing an entry in a list of options for a person to choose from before an app intent resumes its action.
