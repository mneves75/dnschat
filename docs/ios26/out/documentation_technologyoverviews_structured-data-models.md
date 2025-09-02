# Structured data models | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/technologyoverviews/structured-data-models
> Fetched: 2025-08-31T18:32:40.482Z

To manage even moderate amounts of data, you need an efficient system for storing and accessing it. You also need a system that’s easy to use and integrates with your app’s existing types. [SwiftData](https://developer.apple.com/documentation/SwiftData) and [Core Data](https://developer.apple.com/documentation/CoreData) provide database-level features, without requiring an actual database. And when you do need a database to manage your content, [SQLite](https://sqlite.org/) is available on all Apple platforms.

## [Build a structured model with modern Swift types](https://developer.apple.com/documentation/technologyoverviews/structured-data-models#Build-a-structured-model-with-modern-Swift-types)

If you’re building your app using SwiftUI, [SwiftData](https://developer.apple.com/documentation/SwiftData) makes a great companion for managing your data. With SwiftData, you can focus on building your app’s data structures first, and add persistence and other data management features second. That’s because SwiftData infers information about your data structures from the structures themselves. All you do is annotate your data structures with [information about how to manage them](https://developer.apple.com/videos/play/wwdc2023/10195).

SwiftData relies on Swift macros to inject code into your existing data structures. When you add the [`Model()`](<https://developer.apple.com/documentation/SwiftData/Model()>) macro as shown in the example, SwiftData converts the structure into a stored model object and starts managing it. Additional macros tell SwiftData how to manage specific properties of your structure. For example, adding the `.unique` attribute to a property tells SwiftData to prevent the creation of multiple objects with the same value in that property.

```
import SwiftData


@Model
class Trip {
@Attribute(.unique) var name: String
var destination: String
var endDate: Date
var startDate: Date


@Relationship(.cascade) var bucketList: [BucketListItem]? = []
var livingAccomodation: LivingAccomodation?
}
```

You can use SwiftData to save your data to a local disk or to someone’s [iCloud account](https://developer.apple.com/documentation/SwiftData/Syncing-model-data-across-a-persons-devices). In your code, identify groups of objects you want to store together and put them into a [model container](https://developer.apple.com/documentation/SwiftData/ModelContainer). Store all of your objects in one container or create multiple containers to manage different types of data separately. Retrieve objects from disk using a [query](https://developer.apple.com/documentation/SwiftData/Preserving-your-apps-model-data-across-launches). Because SwiftData works well with SwiftUI, you can incorporate queries directly into your app’s views and fetch your content there.

Like any modern data management system, SwiftData also supports the features that you need to ensure the integrity of your data. Add [concurrency support](https://developer.apple.com/documentation/SwiftData/ConcurrencySupport) to your types to ensure fetch and save operations behave correctly in threaded code. The framework also provides built-in support for [undo operations](https://developer.apple.com/documentation/SwiftData/Reverting-data-changes-using-the-undo-manager), so people can revert unwanted changes.

---

## [Build a structured model with any language](https://developer.apple.com/documentation/technologyoverviews/structured-data-models#Build-a-structured-model-with-any-language)

If you’re not using SwiftUI for your interface, or if you prefer to work in Objective-C, build your data model using [Core Data](https://developer.apple.com/documentation/CoreData). Core Data offers the same basic capabilities as SwiftData, including object-level management of data, query-based fetches, undo support, [iCloud support](https://developer.apple.com/documentation/CoreData/mirroring-a-core-data-store-with-cloudkit), and more.

With Core Data, you build the schema for your data model visually using Xcode’s [model editor](https://developer.apple.com/documentation/CoreData/modeling-data). Specify the entities for your data model and configure the attributes and relationships of those entities using this tool. At runtime, create [managed objects](https://developer.apple.com/documentation/CoreData/NSManagedObject) from the entities in your schema, put those objects in a [persistent container](https://developer.apple.com/documentation/CoreData/core-data-stack) and save them to disk using a [managed object context](https://developer.apple.com/documentation/CoreData/NSManagedObjectContext). Use the managed object context to coordinate other tasks, too, such as [undo operations](https://developer.apple.com/documentation/CoreData/NSManagedObjectContext/undoManager).

## [Store data using SQLite](https://developer.apple.com/documentation/technologyoverviews/structured-data-models#Store-data-using-SQLite)

If you’re already familiar with SQL databases, or simply need a lightweight and reliable database engine to manage large amounts of data, use [SQLite](https://sqlite.org/). This database engine is available in the SDK for all Apple platforms, so you can use the same code for all versions of your app. Use your code to store your app’s on-disk content, or to deliver content to your app over the network.
