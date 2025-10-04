Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Documents 

API Collection

# Documents

Enable people to open and manage documents.

## [Overview](/documentation/swiftui/documents#Overview)

Create a user interface for opening and editing documents using the
[`DocumentGroup`](/documentation/swiftui/documentgroup) scene type.

You initialize the scene with a model that describes the organization of the
document’s data, and a view hierarchy that SwiftUI uses to display the
document’s contents to the user. You can use either a value type model, which
you typically store as a structure, that conforms to the
[`FileDocument`](/documentation/swiftui/filedocument) protocol, or a reference
type model you store in a class instance that conforms to the
[`ReferenceFileDocument`](/documentation/swiftui/referencefiledocument)
protocol. You can also use SwiftData-backed documents using an initializer
like
[`init(editing:contentType:editor:prepareDocument:)`](/documentation/swiftui/documentgroup/init\(editing:contenttype:editor:preparedocument:\)).

SwiftUI supports standard behaviors that users expect from a document-based
app, appropriate for each platform, like multiwindow support, open and save
panels, drag and drop, and so on. For related design guidance, see
[Patterns](/design/Human-Interface-Guidelines/patterns) in the Human Interface
Guidelines.

## [Topics](/documentation/swiftui/documents#topics)

### [Creating a document](/documentation/swiftui/documents#Creating-a-
document)

[Building a document-based app with SwiftUI](/documentation/swiftui/building-
a-document-based-app-with-swiftui)

Create, save, and open documents in a multiplatform app.

[Building a document-based app using
SwiftData](/documentation/swiftui/building-a-document-based-app-using-
swiftdata)

Code along with the WWDC presenter to transform an app with SwiftData.

[`struct DocumentGroup`](/documentation/swiftui/documentgroup)

A scene that enables support for opening, creating, and saving documents.

### [Storing document data in a structure
instance](/documentation/swiftui/documents#Storing-document-data-in-a-
structure-instance)

[`protocol FileDocument`](/documentation/swiftui/filedocument)

A type that you use to serialize documents to and from file.

[`struct
FileDocumentConfiguration`](/documentation/swiftui/filedocumentconfiguration)

The properties of an open file document.

### [Storing document data in a class
instance](/documentation/swiftui/documents#Storing-document-data-in-a-class-
instance)

[`protocol
ReferenceFileDocument`](/documentation/swiftui/referencefiledocument)

A type that you use to serialize reference type documents to and from file.

[`struct
ReferenceFileDocumentConfiguration`](/documentation/swiftui/referencefiledocumentconfiguration)

The properties of an open reference file document.

[`var undoManager:
UndoManager?`](/documentation/swiftui/environmentvalues/undomanager)

The undo manager used to register a view’s undo operations.

### [Accessing document
configuration](/documentation/swiftui/documents#Accessing-document-
configuration)

[`var documentConfiguration:
DocumentConfiguration?`](/documentation/swiftui/environmentvalues/documentconfiguration)

The configuration of a document in a
[`DocumentGroup`](/documentation/swiftui/documentgroup).

[`struct DocumentConfiguration`](/documentation/swiftui/documentconfiguration)

### [Reading and writing documents](/documentation/swiftui/documents#Reading-
and-writing-documents)

[`struct
FileDocumentReadConfiguration`](/documentation/swiftui/filedocumentreadconfiguration)

The configuration for reading file contents.

[`struct
FileDocumentWriteConfiguration`](/documentation/swiftui/filedocumentwriteconfiguration)

The configuration for serializing file contents.

### [Opening a document
programmatically](/documentation/swiftui/documents#Opening-a-document-
programmatically)

[`var newDocument:
NewDocumentAction`](/documentation/swiftui/environmentvalues/newdocument)

An action in the environment that presents a new document.

[`struct NewDocumentAction`](/documentation/swiftui/newdocumentaction)

An action that presents a new document.

[`var openDocument:
OpenDocumentAction`](/documentation/swiftui/environmentvalues/opendocument)

An action in the environment that presents an existing document.

[`struct OpenDocumentAction`](/documentation/swiftui/opendocumentaction)

An action that presents an existing document.

### [Configuring the document launch
experience](/documentation/swiftui/documents#Configuring-the-document-launch-
experience)

[`struct
DocumentGroupLaunchScene`](/documentation/swiftui/documentgrouplaunchscene)

A launch scene for document-based applications.

[`struct DocumentLaunchView`](/documentation/swiftui/documentlaunchview)

A view to present when launching document-related user experience.

[`struct
DocumentLaunchGeometryProxy`](/documentation/swiftui/documentlaunchgeometryproxy)

A proxy for access to the frame of the scene and its title view.

[`struct
DefaultDocumentGroupLaunchActions`](/documentation/swiftui/defaultdocumentgrouplaunchactions)

The default actions for the document group launch scene and the document
launch view.

[`struct NewDocumentButton`](/documentation/swiftui/newdocumentbutton)

A button that creates and opens new documents.

[`protocol DocumentBaseBox`](/documentation/swiftui/documentbasebox)

A Box that allows setting its Document base not requiring the caller to know
the exact types of the box and its base.

### [Renaming a document](/documentation/swiftui/documents#Renaming-a-
document)

[`struct RenameButton`](/documentation/swiftui/renamebutton)

A button that triggers a standard rename action.

[`func renameAction(_:)`](/documentation/swiftui/view/renameaction\(_:\))

Sets a closure to run for the rename action.

[`var rename: RenameAction?`](/documentation/swiftui/environmentvalues/rename)

An action that activates the standard rename interaction.

[`struct RenameAction`](/documentation/swiftui/renameaction)

An action that activates a standard rename interaction.

## [See Also](/documentation/swiftui/documents#see-also)

### [App structure](/documentation/swiftui/documents#App-structure)

[API ReferenceApp organization](/documentation/swiftui/app-organization)

Define the entry point and top-level structure of your app.

[API ReferenceScenes](/documentation/swiftui/scenes)

Declare the user interface groupings that make up the parts of your app.

[API ReferenceWindows](/documentation/swiftui/windows)

Display user interface content in a window or a collection of windows.

[API ReferenceImmersive spaces](/documentation/swiftui/immersive-spaces)

Display unbounded content in a person’s surroundings.

[API ReferenceNavigation](/documentation/swiftui/navigation)

Enable people to move between different parts of your app’s view hierarchy
within a scene.

[API ReferenceModal presentations](/documentation/swiftui/modal-presentations)

Present content in a separate view that offers focused interaction.

[API ReferenceToolbars](/documentation/swiftui/toolbars)

Provide immediate access to frequently used commands and controls.

[API ReferenceSearch](/documentation/swiftui/search)

Enable people to search for text or other content within your app.

[API ReferenceApp extensions](/documentation/swiftui/app-extensions)

Extend your app’s basic functionality to other parts of the system, like by
adding a Widget.

