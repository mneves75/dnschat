Framework

# App Intents

Make your app’s content and actions discoverable with system experiences like
Spotlight, widgets, and the Shortcuts app.

iOS 16.0+iPadOS 16.0+Mac Catalyst 16.0+macOS 13.0+tvOS 16.0+visionOS
1.0+watchOS 9.0+

## [Overview](/documentation/AppIntents#Overview)

The App Intents framework provides functionality to deeply integrate your
app’s actions and content with system experiences across platforms, including
Siri, Spotlight, widgets, controls and more. With Apple Intelligence and
enhancements to App Intents, Siri will suggest your app’s actions to help
people discover your app’s features and gains the ability to take actions in
and across apps.

By adopting the App Intents framework, you allow people to personalize their
devices by instantly using your app’s functionality with:

  * Interactions with Siri, including those that use the personal context awareness and action capabilities of Apple Intelligence.

  * Spotlight suggestions and search.

  * Actions and automations in the Shortcuts app.

  * Hardware interactions that initiate app actions, like the Action button and squeeze gestures on Apple Pencil.

  * Focus to allow people to reduce distractions.

Note

Siri’s personal context understanding, onscreen awareness, and in-app actions
are in development and will be available with a future software update.

For example, App Intents enables you to express your app’s actions, by
offering an App Shortcut. People can then ask Siri to take those actions on
their behalf, whether they’re in your app or elsewhere in the system. Use App
Entities to expose content in your app to Spotlight and semantic indexing with
Apple Intelligence. People can then ask Siri to retrieve information from your
app, like asking Siri to pull up flight information from a travel app to share
with a loved one.

You reuse these components with other technologies to offer additional
features and experiences that make your app and its functionality even more
discoverable and widely available. For example, you reuse modular App Intents
code together with [WidgetKit](/documentation/WidgetKit) to offer:

  * Interactive widgets

  * Controls

  * Live Activities

To learn more about features that the App Intents framework enables and how
you can best adopt the framework, see [Making actions and content discoverable
and widely available](/documentation/appintents/making-actions-and-content-
discoverable-and-widely-available).

For design guidance, see [Human Interface Guidelines > App
Shortcuts](https://developer.apple.com/design/human-interface-guidelines/app-
shortcuts), [Human Interface Guidelines >
Siri](https://developer.apple.com/design/human-interface-guidelines/siri), and
[Human Interface Guidelines > Action
Button](https://developer.apple.com/design/human-interface-guidelines/action-
button).

## [Topics](/documentation/AppIntents#topics)

### [Essentials](/documentation/AppIntents#Essentials)

[App Intents updates](/documentation/Updates/AppIntents)

Learn about important changes in App Intents.

[Making actions and content discoverable and widely
available](/documentation/appintents/making-actions-and-content-discoverable-
and-widely-available)

Adopt App Intents to make your app discoverable with Spotlight, controls,
widgets, and the Action button.

[Creating your first app intent](/documentation/appintents/creating-your-
first-app-intent)

Create your first app intent that makes your app available in system
experiences like Spotlight or the Shortcuts app.

[Adopting App Intents to support system
experiences](/documentation/appintents/adopting-app-intents-to-support-system-
experiences)

Create app intents and entities to incorporate system experiences such as
Spotlight, visual intelligence, and Shortcuts.

[Accelerating app interactions with App
Intents](/documentation/appintents/acceleratingappinteractionswithappintents)

Enable people to use your app’s features quickly through Siri, Spotlight, and
Shortcuts.

### [Siri and Apple Intelligence](/documentation/AppIntents#Siri-and-Apple-
Intelligence)

[Integrating actions with Siri and Apple
Intelligence](/documentation/appintents/integrating-actions-with-siri-and-
apple-intelligence)

Create app intents, entities, and enumerations that conform to assistant
schemas to tap into the enhanced action capabilities of Siri and Apple
Intelligence.

[API ReferenceMaking onscreen content available to Siri and Apple
Intelligence](/documentation/appintents/making-onscreen-content-available-to-
siri-and-apple-intelligence)

Enable Siri and Apple Intelligence to respond to a person’s questions and
action requests for your app’s onscreen content.

[API ReferenceApp intent domains](/documentation/appintents/app-intent-
domains)

Make your app’s actions and content available to Siri and Apple Intelligence
with assistant schemas.

[Making your app’s functionality available to
Siri](/documentation/appintents/making-your-app-s-functionality-available-to-
siri)

Add app intent schemas to your app so Siri can complete requests, and
integrate your app with Apple Intelligence, Spotlight, and other system
experiences.

### [Visual intelligence](/documentation/AppIntents#Visual-intelligence)

[Integrating your app with visual
intelligence](/documentation/VisualIntelligence/integrating-your-app-with-
visual-intelligence)

Enable people to find app content that matches their surroundings or objects
onscreen with visual intelligence.

[Visual Intelligence](/documentation/VisualIntelligence)

Include your app’s content in search results that visual intelligence
provides.

[`protocol IntentValueQuery`](/documentation/appintents/intentvaluequery)

A query that provides entity values to the system; for example, for visual
intelligence search.

### [Interactive Snippets](/documentation/AppIntents#Interactive-Snippets)

[Displaying static and interactive
snippets](/documentation/appintents/displaying-static-and-interactive-
snippets)

Enable people to view the outcome of an app intent and immediately perform
follow-up actions.

[`protocol SnippetIntent`](/documentation/appintents/snippetintent)

An app intent that presents an interactive snippet onscreen.

### [Other system experiences](/documentation/AppIntents#Other-system-
experiences)

[Making app entities available in Spotlight](/documentation/appintents/making-
app-entities-available-in-spotlight)

Allow people to find your app’s content in Spotlight by donating app entities
to its semantic index.

[API ReferenceFocus](/documentation/appintents/focus)

Adjust your app’s behavior and filter incoming notifications when the current
Focus changes.

[API ReferenceAction button on iPhone and Apple
Watch](/documentation/appintents/actionbutton)

Enable people to run your App Shortcuts with the Action button on iPhone or to
start your app’s workout or dive sessions using the Action button on Apple
Watch.

[Developing a WidgetKit strategy](/documentation/WidgetKit/Developing-a-
WidgetKit-strategy)

Explore features, tasks, related frameworks, and constraints as you make a
plan to implement widgets, controls, watch complications, and Live Activities.

### [SiriKit migration](/documentation/AppIntents#SiriKit-migration)

[Soup Chef with App Intents: Migrating custom
intents](/documentation/SiriKit/soup-chef-with-app-intents-migrating-custom-
intents)

Integrating App Intents to provide your appʼs actions to Siri and Shortcuts.

### [Actions](/documentation/AppIntents#Actions)

[API ReferenceApp intents](/documentation/appintents/app-intents)

Define the custom actions your app exposes to the system, and incorporate
support for existing SiriKit intents.

[API ReferenceIntent discovery](/documentation/appintents/intent-discovery)

Donate your app’s intents to the system to help it identify trends and predict
future behaviors.

[API ReferenceApp Shortcuts](/documentation/appintents/app-shortcuts)

Integrate your app’s intents and entities with the Shortcuts app, Siri,
Spotlight, and the Action button on supported iPhone and Apple Watch models.

### [Parameters, custom data types, and
queries](/documentation/AppIntents#Parameters-custom-data-types-and-queries)

[Adding parameters to an app intent](/documentation/appintents/adding-
parameters-to-an-app-intent)

Enable people to configure app intents with their custom input values.

[Integrating custom data types into your
intents](/documentation/appintents/integrating-custom-types-into-your-intents)

Provide the system with information about the types your app uses to model its
data so that your intents can use those types as parameters.

[API ReferenceParameter resolution](/documentation/appintents/parameter-
resolution)

Define the required parameters for your app intents and specify how to resolve
those parameters at runtime.

[API ReferenceApp entities](/documentation/appintents/app-entities)

Make core types or concepts discoverable to the system by declaring them as
app entities.

[API ReferenceEntity queries](/documentation/appintents/entity-queries)

Help the system find the entities your app defines and use them to resolve
parameters.

[API ReferenceResolvers](/documentation/appintents/resolvers)

Resolve the parameters of your app intents, and extend the standard resolution
types to include your app’s custom types.

### [Utility types](/documentation/AppIntents#Utility-types)

[API ReferenceCommon types](/documentation/appintents/common-data-types)

Specify common types that your app supports, including currencies, files, and
contacts.

### [Errors](/documentation/AppIntents#Errors)

[`struct AppIntentError`](/documentation/appintents/appintenterror)

Errors that your intent-handling code can return to indicate problems while
interpreting or executing an app intent.

### [Protocols](/documentation/AppIntents#Protocols)

[`protocol
AppIntentSceneDelegate`](/documentation/appintents/appintentscenedelegate)

Implement this protocol on your UIScene delegate to handle AppIntent
invocations targeting a specific scene Example:

[`protocol
AppShortcutsContent`](/documentation/appintents/appshortcutscontent)

[`protocol
CustomURLRepresentationParameterConvertible`](/documentation/appintents/customurlrepresentationparameterconvertible)

[`protocol ShowsSnippetIntent`](/documentation/appintents/showssnippetintent)

The result of performing an action that present a snippet generated by a
`SnippetIntent`-conforming type.

[`protocol
TargetContentProvidingIntent`](/documentation/appintents/targetcontentprovidingintent)

[`protocol UISceneAppIntent`](/documentation/appintents/uisceneappintent)

[`protocol UndoableIntent`](/documentation/appintents/undoableintent)

### [Structures](/documentation/AppIntents#Structures)

[`struct
ConfirmationConditions`](/documentation/appintents/confirmationconditions)

Conditions for a confirmation request.

[`struct
EntityPropertyModifiers`](/documentation/appintents/entitypropertymodifiers)

[`struct
EntityURLRepresentation`](/documentation/appintents/entityurlrepresentation)

The URL representation of an app entity.

[`struct
EnumURLRepresentation`](/documentation/appintents/enumurlrepresentation)

The URL representation of an app enum.

[`struct
FileEntityIdentifier`](/documentation/appintents/fileentityidentifier)

An identifier for an app entity that refers to a document or other file.

[`struct IntentChoiceOption`](/documentation/appintents/intentchoiceoption)

A structure representing an entry in a list of options for a person to choose
from before an app intent resumes its action.

[`struct IntentModes`](/documentation/appintents/intentmodes)

A set of options that describe an app intent’s behavior.

[`struct
IntentURLRepresentation`](/documentation/appintents/intenturlrepresentation)

The URL representation of an app intent.

### [Macros](/documentation/AppIntents#Macros)

[`macro UnionValue()`](/documentation/appintents/unionvalue\(\))

### [Enumerations](/documentation/AppIntents#Enumerations)

[`enum
AppShortcutPhraseToken`](/documentation/appintents/appshortcutphrasetoken)

Dynamic values you can include in the spoken phrases that run your shortcut.

[`enum VideoCategory`](/documentation/appintents/videocategory)

