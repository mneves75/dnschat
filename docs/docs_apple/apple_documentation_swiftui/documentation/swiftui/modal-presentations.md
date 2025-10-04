Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Modal presentations 

API Collection

# Modal presentations

Present content in a separate view that offers focused interaction.

## [Overview](/documentation/swiftui/modal-presentations#Overview)

To draw attention to an important, narrowly scoped task, you display a modal
presentation, like an alert, popover, sheet, or confirmation dialog.

In SwiftUI, you create a modal presentation using a view modifier that defines
how the presentation looks and the condition under which SwiftUI presents it.
SwiftUI detects when the condition changes and makes the presentation for you.
Because you provide a [`Binding`](/documentation/swiftui/binding) to the
condition that initiates the presentation, SwiftUI can reset the underlying
value when the user dismisses the presentation.

For design guidance, see [Modality](/design/Human-Interface-
Guidelines/modality) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/modal-presentations#topics)

### [Configuring a dialog](/documentation/swiftui/modal-
presentations#Configuring-a-dialog)

[`struct DialogSeverity`](/documentation/swiftui/dialogseverity)

The severity of an alert or confirmation dialog.

### [Showing a sheet, cover, or popover](/documentation/swiftui/modal-
presentations#Showing-a-sheet-cover-or-popover)

[`func sheet<Content>(isPresented: Binding<Bool>, onDismiss: (() -> Void)?,
content: () -> Content) -> some
View`](/documentation/swiftui/view/sheet\(ispresented:ondismiss:content:\))

Presents a sheet when a binding to a Boolean value that you provide is true.

[`func sheet<Item, Content>(item: Binding<Item?>, onDismiss: (() -> Void)?,
content: (Item) -> Content) -> some
View`](/documentation/swiftui/view/sheet\(item:ondismiss:content:\))

Presents a sheet using the given item as a data source for the sheet’s
content.

[`func fullScreenCover<Content>(isPresented: Binding<Bool>, onDismiss: (() ->
Void)?, content: () -> Content) -> some
View`](/documentation/swiftui/view/fullscreencover\(ispresented:ondismiss:content:\))

Presents a modal view that covers as much of the screen as possible when
binding to a Boolean value you provide is true.

[`func fullScreenCover<Item, Content>(item: Binding<Item?>, onDismiss: (() ->
Void)?, content: (Item) -> Content) -> some
View`](/documentation/swiftui/view/fullscreencover\(item:ondismiss:content:\))

Presents a modal view that covers as much of the screen as possible using the
binding you provide as a data source for the sheet’s content.

[`func popover<Item, Content>(item: Binding<Item?>, attachmentAnchor:
PopoverAttachmentAnchor, arrowEdge: Edge?, content: (Item) -> Content) -> some
View`](/documentation/swiftui/view/popover\(item:attachmentanchor:arrowedge:content:\))

Presents a popover using the given item as a data source for the popover’s
content.

[`func popover<Content>(isPresented: Binding<Bool>, attachmentAnchor:
PopoverAttachmentAnchor, arrowEdge: Edge?, content: () -> Content) -> some
View`](/documentation/swiftui/view/popover\(ispresented:attachmentanchor:arrowedge:content:\))

Presents a popover when a given condition is true.

[`enum
PopoverAttachmentAnchor`](/documentation/swiftui/popoverattachmentanchor)

An attachment anchor for a popover.

### [Adapting a presentation size](/documentation/swiftui/modal-
presentations#Adapting-a-presentation-size)

[`func presentationCompactAdaptation(horizontal: PresentationAdaptation,
vertical: PresentationAdaptation) -> some
View`](/documentation/swiftui/view/presentationcompactadaptation\(horizontal:vertical:\))

Specifies how to adapt a presentation to horizontally and vertically compact
size classes.

[`func presentationCompactAdaptation(PresentationAdaptation) -> some
View`](/documentation/swiftui/view/presentationcompactadaptation\(_:\))

Specifies how to adapt a presentation to compact size classes.

[`struct
PresentationAdaptation`](/documentation/swiftui/presentationadaptation)

Strategies for adapting a presentation to a different size class.

[`func presentationSizing(some PresentationSizing) -> some
View`](/documentation/swiftui/view/presentationsizing\(_:\))

Sets the sizing of the containing presentation.

[`protocol PresentationSizing`](/documentation/swiftui/presentationsizing)

A type that defines the size of the presentation content and how the
presentation size adjusts to its content’s size changing.

[`struct
PresentationSizingRoot`](/documentation/swiftui/presentationsizingroot)

A proxy to a view provided to the presentation with a defined presentation
size.

[`struct
PresentationSizingContext`](/documentation/swiftui/presentationsizingcontext)

Contextual information about a presentation.

### [Configuring a sheet’s height](/documentation/swiftui/modal-
presentations#Configuring-a-sheets-height)

[`func presentationDetents(Set<PresentationDetent>) -> some
View`](/documentation/swiftui/view/presentationdetents\(_:\))

Sets the available detents for the enclosing sheet.

[`func presentationDetents(Set<PresentationDetent>, selection:
Binding<PresentationDetent>) -> some
View`](/documentation/swiftui/view/presentationdetents\(_:selection:\))

Sets the available detents for the enclosing sheet, giving you programmatic
control of the currently selected detent.

[`func presentationContentInteraction(PresentationContentInteraction) -> some
View`](/documentation/swiftui/view/presentationcontentinteraction\(_:\))

Configures the behavior of swipe gestures on a presentation.

[`func presentationDragIndicator(Visibility) -> some
View`](/documentation/swiftui/view/presentationdragindicator\(_:\))

Sets the visibility of the drag indicator on top of a sheet.

[`struct PresentationDetent`](/documentation/swiftui/presentationdetent)

A type that represents a height where a sheet naturally rests.

[`protocol
CustomPresentationDetent`](/documentation/swiftui/custompresentationdetent)

The definition of a custom detent with a calculated height.

[`struct
PresentationContentInteraction`](/documentation/swiftui/presentationcontentinteraction)

A behavior that you can use to influence how a presentation responds to swipe
gestures.

### [Styling a sheet and its background](/documentation/swiftui/modal-
presentations#Styling-a-sheet-and-its-background)

[`func presentationCornerRadius(CGFloat?) -> some
View`](/documentation/swiftui/view/presentationcornerradius\(_:\))

Requests that the presentation have a specific corner radius.

[`func presentationBackground<S>(S) -> some
View`](/documentation/swiftui/view/presentationbackground\(_:\))

Sets the presentation background of the enclosing sheet using a shape style.

[`func presentationBackground<V>(alignment: Alignment, content: () -> V) ->
some
View`](/documentation/swiftui/view/presentationbackground\(alignment:content:\))

Sets the presentation background of the enclosing sheet to a custom view.

[`func presentationBackgroundInteraction(PresentationBackgroundInteraction) ->
some
View`](/documentation/swiftui/view/presentationbackgroundinteraction\(_:\))

Controls whether people can interact with the view behind a presentation.

[`struct
PresentationBackgroundInteraction`](/documentation/swiftui/presentationbackgroundinteraction)

The kinds of interaction available to views behind a presentation.

### [Presenting an alert](/documentation/swiftui/modal-
presentations#Presenting-an-alert)

[`struct AlertScene`](/documentation/swiftui/alertscene)

A scene that renders itself as a standalone alert dialog.

[`func
alert(_:isPresented:actions:)`](/documentation/swiftui/view/alert\(_:ispresented:actions:\))

Presents an alert when a given condition is true, using a text view for the
title.

[`func
alert(_:isPresented:presenting:actions:)`](/documentation/swiftui/view/alert\(_:ispresented:presenting:actions:\))

Presents an alert using the given data to produce the alert’s content and a
text view as a title.

[`func alert<E, A>(isPresented: Binding<Bool>, error: E?, actions: () -> A) ->
some View`](/documentation/swiftui/view/alert\(ispresented:error:actions:\))

Presents an alert when an error is present.

[`func
alert(_:isPresented:actions:message:)`](/documentation/swiftui/view/alert\(_:ispresented:actions:message:\))

Presents an alert with a message when a given condition is true using a text
view as a title.

[`func
alert(_:isPresented:presenting:actions:message:)`](/documentation/swiftui/view/alert\(_:ispresented:presenting:actions:message:\))

Presents an alert with a message using the given data to produce the alert’s
content and a text view for a title.

[`func alert<E, A, M>(isPresented: Binding<Bool>, error: E?, actions: (E) ->
A, message: (E) -> M) -> some
View`](/documentation/swiftui/view/alert\(ispresented:error:actions:message:\))

Presents an alert with a message when an error is present.

### [Getting confirmation for an action](/documentation/swiftui/modal-
presentations#Getting-confirmation-for-an-action)

[`func
confirmationDialog(_:isPresented:titleVisibility:actions:)`](/documentation/swiftui/view/confirmationdialog\(_:ispresented:titlevisibility:actions:\))

Presents a confirmation dialog when a given condition is true, using a text
view for the title.

[`func
confirmationDialog(_:isPresented:titleVisibility:presenting:actions:)`](/documentation/swiftui/view/confirmationdialog\(_:ispresented:titlevisibility:presenting:actions:\))

Presents a confirmation dialog using data to produce the dialog’s content and
a text view for the title.

[`func
dismissalConfirmationDialog(_:shouldPresent:actions:)`](/documentation/swiftui/view/dismissalconfirmationdialog\(_:shouldpresent:actions:\))

Presents a confirmation dialog when a dismiss action has been triggered.

### [Showing a confirmation dialog with a
message](/documentation/swiftui/modal-presentations#Showing-a-confirmation-
dialog-with-a-message)

[`func
confirmationDialog(_:isPresented:titleVisibility:actions:message:)`](/documentation/swiftui/view/confirmationdialog\(_:ispresented:titlevisibility:actions:message:\))

Presents a confirmation dialog with a message when a given condition is true,
using a text view for the title.

[`func
confirmationDialog(_:isPresented:titleVisibility:presenting:actions:message:)`](/documentation/swiftui/view/confirmationdialog\(_:ispresented:titlevisibility:presenting:actions:message:\))

Presents a confirmation dialog with a message using data to produce the
dialog’s content and a text view for the message.

[`func
dismissalConfirmationDialog(_:shouldPresent:actions:message:)`](/documentation/swiftui/view/dismissalconfirmationdialog\(_:shouldpresent:actions:message:\))

Presents a confirmation dialog when a dismiss action has been triggered.

### [Configuring a dialog](/documentation/swiftui/modal-
presentations#Configuring-a-dialog)

[`func dialogIcon(Image?) -> some
View`](/documentation/swiftui/view/dialogicon\(_:\))

Configures the icon used by dialogs within this view.

[`func dialogIcon(Image?) -> some
Scene`](/documentation/swiftui/scene/dialogicon\(_:\))

Configures the icon used by alerts.

[`func dialogSeverity(DialogSeverity) -> some
View`](/documentation/swiftui/view/dialogseverity\(_:\))

[`func dialogSeverity(DialogSeverity) -> some
Scene`](/documentation/swiftui/scene/dialogseverity\(_:\))

Sets the severity for alerts.

[`func dialogSuppressionToggle(isSuppressed: Binding<Bool>) -> some
View`](/documentation/swiftui/view/dialogsuppressiontoggle\(issuppressed:\))

Enables user suppression of dialogs and alerts presented within `self`, with a
default suppression message on macOS. Unused on other platforms.

[`func dialogSuppressionToggle(isSuppressed: Binding<Bool>) -> some
Scene`](/documentation/swiftui/scene/dialogsuppressiontoggle\(issuppressed:\))

Enables user suppression of an alert with a custom suppression message.

[`func
dialogSuppressionToggle(_:isSuppressed:)`](/documentation/swiftui/view/dialogsuppressiontoggle\(_:issuppressed:\))

Enables user suppression of dialogs and alerts presented within `self`, with a
custom suppression message on macOS. Unused on other platforms.

### [Exporting to file](/documentation/swiftui/modal-presentations#Exporting-
to-file)

[`func
fileExporter(isPresented:document:contentType:defaultFilename:onCompletion:)`](/documentation/swiftui/view/fileexporter\(ispresented:document:contenttype:defaultfilename:oncompletion:\))

Presents a system interface for exporting a document that’s stored in a value
type, like a structure, to a file on disk.

[`func
fileExporter(isPresented:documents:contentType:onCompletion:)`](/documentation/swiftui/view/fileexporter\(ispresented:documents:contenttype:oncompletion:\))

Presents a system interface for exporting a collection of value type documents
to files on disk.

[`func
fileExporter(isPresented:document:contentTypes:defaultFilename:onCompletion:onCancellation:)`](/documentation/swiftui/view/fileexporter\(ispresented:document:contenttypes:defaultfilename:oncompletion:oncancellation:\))

Presents a system interface for allowing the user to export a `FileDocument`
to a file on disk.

[`func
fileExporter(isPresented:documents:contentTypes:onCompletion:onCancellation:)`](/documentation/swiftui/view/fileexporter\(ispresented:documents:contenttypes:oncompletion:oncancellation:\))

Presents a system dialog for allowing the user to export a collection of
documents that conform to `FileDocument` to files on disk.

[`func fileExporter<T>(isPresented: Binding<Bool>, item: T?, contentTypes:
[UTType], defaultFilename: String?, onCompletion: (Result<URL, any Error>) ->
Void, onCancellation: () -> Void) -> some
View`](/documentation/swiftui/view/fileexporter\(ispresented:item:contenttypes:defaultfilename:oncompletion:oncancellation:\))

Presents a system interface allowing the user to export a `Transferable` item
to file on disk.

[`func fileExporter<C, T>(isPresented: Binding<Bool>, items: C, contentTypes:
[UTType], onCompletion: (Result<[URL], any Error>) -> Void, onCancellation: ()
-> Void) -> some
View`](/documentation/swiftui/view/fileexporter\(ispresented:items:contenttypes:oncompletion:oncancellation:\))

Presents a system interface allowing the user to export a collection of items
to files on disk.

[`func
fileExporterFilenameLabel(_:)`](/documentation/swiftui/view/fileexporterfilenamelabel\(_:\))

On macOS, configures the `fileExporter` with a label for the file name field.

### [Importing from file](/documentation/swiftui/modal-
presentations#Importing-from-file)

[`func fileImporter(isPresented: Binding<Bool>, allowedContentTypes: [UTType],
allowsMultipleSelection: Bool, onCompletion: (Result<[URL], any Error>) ->
Void) -> some
View`](/documentation/swiftui/view/fileimporter\(ispresented:allowedcontenttypes:allowsmultipleselection:oncompletion:\))

Presents a system interface for allowing the user to import multiple files.

[`func fileImporter(isPresented: Binding<Bool>, allowedContentTypes: [UTType],
onCompletion: (Result<URL, any Error>) -> Void) -> some
View`](/documentation/swiftui/view/fileimporter\(ispresented:allowedcontenttypes:oncompletion:\))

Presents a system interface for allowing the user to import an existing file.

[`func fileImporter(isPresented: Binding<Bool>, allowedContentTypes: [UTType],
allowsMultipleSelection: Bool, onCompletion: (Result<[URL], any Error>) ->
Void, onCancellation: () -> Void) -> some
View`](/documentation/swiftui/view/fileimporter\(ispresented:allowedcontenttypes:allowsmultipleselection:oncompletion:oncancellation:\))

Presents a system dialog for allowing the user to import multiple files.

### [Moving a file](/documentation/swiftui/modal-presentations#Moving-a-file)

[`func fileMover(isPresented: Binding<Bool>, file: URL?, onCompletion:
(Result<URL, any Error>) -> Void) -> some
View`](/documentation/swiftui/view/filemover\(ispresented:file:oncompletion:\))

Presents a system interface for allowing the user to move an existing file to
a new location.

[`func fileMover<C>(isPresented: Binding<Bool>, files: C, onCompletion:
(Result<[URL], any Error>) -> Void) -> some
View`](/documentation/swiftui/view/filemover\(ispresented:files:oncompletion:\))

Presents a system interface for allowing the user to move a collection of
existing files to a new location.

[`func fileMover(isPresented: Binding<Bool>, file: URL?, onCompletion:
(Result<URL, any Error>) -> Void, onCancellation: () -> Void) -> some
View`](/documentation/swiftui/view/filemover\(ispresented:file:oncompletion:oncancellation:\))

Presents a system dialog for allowing the user to move an existing file to a
new location.

[`func fileMover<C>(isPresented: Binding<Bool>, files: C, onCompletion:
(Result<[URL], any Error>) -> Void, onCancellation: () -> Void) -> some
View`](/documentation/swiftui/view/filemover\(ispresented:files:oncompletion:oncancellation:\))

Presents a system dialog for allowing the user to move a collection of
existing files to a new location.

### [Configuring a file dialog](/documentation/swiftui/modal-
presentations#Configuring-a-file-dialog)

[`func fileDialogBrowserOptions(FileDialogBrowserOptions) -> some
View`](/documentation/swiftui/view/filedialogbrowseroptions\(_:\))

On macOS, configures the `fileExporter`, `fileImporter`, or `fileMover` to
provide a refined URL search experience: include or exclude hidden files,
allow searching by tag, etc.

[`func
fileDialogConfirmationLabel(_:)`](/documentation/swiftui/view/filedialogconfirmationlabel\(_:\))

On macOS, configures the the `fileExporter`, `fileImporter`, or `fileMover`
with a custom confirmation button label.

[`func fileDialogCustomizationID(String) -> some
View`](/documentation/swiftui/view/filedialogcustomizationid\(_:\))

On macOS, configures the `fileExporter`, `fileImporter`, or `fileMover` to
persist and restore the file dialog configuration.

[`func fileDialogDefaultDirectory(URL?) -> some
View`](/documentation/swiftui/view/filedialogdefaultdirectory\(_:\))

Configures the `fileExporter`, `fileImporter`, or `fileMover` to open with the
specified default directory.

[`func fileDialogImportsUnresolvedAliases(Bool) -> some
View`](/documentation/swiftui/view/filedialogimportsunresolvedaliases\(_:\))

On macOS, configures the `fileExporter`, `fileImporter`, or `fileMover`
behavior when a user chooses an alias.

[`func
fileDialogMessage(_:)`](/documentation/swiftui/view/filedialogmessage\(_:\))

On macOS, configures the the `fileExporter`, `fileImporter`, or `fileMover`
with a custom text that is presented to the user, similar to a title.

[`func fileDialogURLEnabled(Predicate<URL>) -> some
View`](/documentation/swiftui/view/filedialogurlenabled\(_:\))

On macOS, configures the the `fileImporter` or `fileMover` to conditionally
disable presented URLs.

[`struct
FileDialogBrowserOptions`](/documentation/swiftui/filedialogbrowseroptions)

The way that file dialogs present the file system.

### [Presenting an inspector](/documentation/swiftui/modal-
presentations#Presenting-an-inspector)

[`func inspector<V>(isPresented: Binding<Bool>, content: () -> V) -> some
View`](/documentation/swiftui/view/inspector\(ispresented:content:\))

Inserts an inspector at the applied position in the view hierarchy.

[`func inspectorColumnWidth(CGFloat) -> some
View`](/documentation/swiftui/view/inspectorcolumnwidth\(_:\))

Sets a fixed, preferred width for the inspector containing this view when
presented as a trailing column.

[`func inspectorColumnWidth(min: CGFloat?, ideal: CGFloat, max: CGFloat?) ->
some
View`](/documentation/swiftui/view/inspectorcolumnwidth\(min:ideal:max:\))

Sets a flexible, preferred width for the inspector in a trailing-column
presentation.

### [Dismissing a presentation](/documentation/swiftui/modal-
presentations#Dismissing-a-presentation)

[`var isPresented:
Bool`](/documentation/swiftui/environmentvalues/ispresented)

A Boolean value that indicates whether the view associated with this
environment is currently presented.

[`var dismiss:
DismissAction`](/documentation/swiftui/environmentvalues/dismiss)

An action that dismisses the current presentation.

[`struct DismissAction`](/documentation/swiftui/dismissaction)

An action that dismisses a presentation.

[`func interactiveDismissDisabled(Bool) -> some
View`](/documentation/swiftui/view/interactivedismissdisabled\(_:\))

Conditionally prevents interactive dismissal of presentations like popovers,
sheets, and inspectors.

### [Deprecated modal presentations](/documentation/swiftui/modal-
presentations#Deprecated-modal-presentations)

[`struct Alert`](/documentation/swiftui/alert)

A representation of an alert presentation.

Deprecated

[`struct ActionSheet`](/documentation/swiftui/actionsheet)

A representation of an action sheet presentation.

Deprecated

## [See Also](/documentation/swiftui/modal-presentations#see-also)

### [App structure](/documentation/swiftui/modal-presentations#App-structure)

[API ReferenceApp organization](/documentation/swiftui/app-organization)

Define the entry point and top-level structure of your app.

[API ReferenceScenes](/documentation/swiftui/scenes)

Declare the user interface groupings that make up the parts of your app.

[API ReferenceWindows](/documentation/swiftui/windows)

Display user interface content in a window or a collection of windows.

[API ReferenceImmersive spaces](/documentation/swiftui/immersive-spaces)

Display unbounded content in a person’s surroundings.

[API ReferenceDocuments](/documentation/swiftui/documents)

Enable people to open and manage documents.

[API ReferenceNavigation](/documentation/swiftui/navigation)

Enable people to move between different parts of your app’s view hierarchy
within a scene.

[API ReferenceToolbars](/documentation/swiftui/toolbars)

Provide immediate access to frequently used commands and controls.

[API ReferenceSearch](/documentation/swiftui/search)

Enable people to search for text or other content within your app.

[API ReferenceApp extensions](/documentation/swiftui/app-extensions)

Extend your app’s basic functionality to other parts of the system, like by
adding a Widget.

