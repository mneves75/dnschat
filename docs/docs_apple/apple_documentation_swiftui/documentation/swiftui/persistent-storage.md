Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Persistent storage 

API Collection

# Persistent storage

Store data for use across sessions of your app.

## [Overview](/documentation/swiftui/persistent-storage#Overview)

The operating system provides ways to store data when your app closes, so that
when people open your app again later, they can continue working without
interruption. The mechanism that you use depends on factors like what and how
much you need to store, whether you need serialized or random access to the
data, and so on.

You use the same kinds of storage in a SwiftUI app that you use in any other
app. For example, you can access files on disk using the
[`FileManager`](/documentation/Foundation/FileManager) interface. However,
SwiftUI also provides conveniences that make it easier to use certain kinds of
persistent storage in a declarative environment. For example, you can use
[`FetchRequest`](/documentation/swiftui/fetchrequest) and
[`FetchedResults`](/documentation/swiftui/fetchedresults) to interact with a
Core Data model.

## [Topics](/documentation/swiftui/persistent-storage#topics)

### [Saving state across app launches](/documentation/swiftui/persistent-
storage#Saving-state-across-app-launches)

[Restoring Your App’s State with
SwiftUI](/documentation/swiftui/restoring_your_app_s_state_with_swiftui)

Provide app continuity for users by preserving their current activities.

[`func defaultAppStorage(UserDefaults) -> some
View`](/documentation/swiftui/view/defaultappstorage\(_:\))

The default store used by `AppStorage` contained within the view.

[`struct AppStorage`](/documentation/swiftui/appstorage)

A property wrapper type that reflects a value from `UserDefaults` and
invalidates a view on a change in value in that user default.

[`struct SceneStorage`](/documentation/swiftui/scenestorage)

A property wrapper type that reads and writes to persisted, per-scene storage.

### [Accessing Core Data](/documentation/swiftui/persistent-storage#Accessing-
Core-Data)

[Loading and Displaying a Large Data
Feed](/documentation/swiftui/loading_and_displaying_a_large_data_feed)

Consume data in the background, and lower memory use by batching imports and
preventing duplicate records.

[`var managedObjectContext:
NSManagedObjectContext`](/documentation/swiftui/environmentvalues/managedobjectcontext)

[`struct FetchRequest`](/documentation/swiftui/fetchrequest)

A property wrapper type that retrieves entities from a Core Data persistent
store.

[`struct FetchedResults`](/documentation/swiftui/fetchedresults)

A collection of results retrieved from a Core Data store.

[`struct SectionedFetchRequest`](/documentation/swiftui/sectionedfetchrequest)

A property wrapper type that retrieves entities, grouped into sections, from a
Core Data persistent store.

[`struct SectionedFetchResults`](/documentation/swiftui/sectionedfetchresults)

A collection of results retrieved from a Core Data persistent store, grouped
into sections.

## [See Also](/documentation/swiftui/persistent-storage#see-also)

### [Data and storage](/documentation/swiftui/persistent-storage#Data-and-
storage)

[API ReferenceModel data](/documentation/swiftui/model-data)

Manage the data that your app uses to drive its interface.

[API ReferenceEnvironment values](/documentation/swiftui/environment-values)

Share data throughout a view hierarchy using the environment.

[API ReferencePreferences](/documentation/swiftui/preferences)

Indicate configuration preferences from views to their container views.

