  * [ SwiftUI ](/documentation/swiftui)
  * View 

Protocol

# View

A type that represents part of your app’s user interface and provides
modifiers that you use to configure views.

iOS 13.0+iPadOS 13.0+Mac Catalyst 13.0+macOS 10.15+tvOS 13.0+visionOS
1.0+watchOS 6.0+

    
    
    @[MainActor](/documentation/Swift/MainActor) @preconcurrency
    protocol View

## [ Mentioned in ](/documentation/swiftui/view#mentions)

[ Declaring a custom view ](/documentation/swiftui/declaring-a-custom-view)

[ Configuring views ](/documentation/swiftui/configuring-views)

[ Reducing view modifier maintenance ](/documentation/swiftui/reducing-view-
modifier-maintenance)

[ Displaying data in lists ](/documentation/swiftui/displaying-data-in-lists)

[ Migrating to the SwiftUI life cycle ](/documentation/swiftui/migrating-to-
the-swiftui-life-cycle)

## [Overview](/documentation/swiftui/view#overview)

You create custom views by declaring types that conform to the `View`
protocol. Implement the required
[`body`](/documentation/swiftui/view/body-8kl5o) computed property to provide
the content for your custom view.

    
    
    struct MyView: View {
        var body: some View {
            Text("Hello, World!")
        }
    }
    

Assemble the view’s body by combining one or more of the built-in views
provided by SwiftUI, like the [`Text`](/documentation/swiftui/text) instance
in the example above, plus other custom views that you define, into a
hierarchy of views. For more information about creating custom views, see
[Declaring a custom view](/documentation/swiftui/declaring-a-custom-view).

The `View` protocol provides a set of modifiers — protocol methods with
default implementations — that you use to configure views in the layout of
your app. Modifiers work by wrapping the view instance on which you call them
in another view with the specified characteristics, as described in
[Configuring views](/documentation/swiftui/configuring-views). For example,
adding the [`opacity(_:)`](/documentation/swiftui/view/opacity\(_:\)) modifier
to a text view returns a new view with some amount of transparency:

    
    
    Text("Hello, World!")
        .opacity(0.5) // Display partially transparent text.
    

The complete list of default modifiers provides a large set of controls for
managing views. For example, you can fine tune [Layout
modifiers](/documentation/swiftui/view-layout), add [Accessibility
modifiers](/documentation/swiftui/view-accessibility) information, and respond
to [Input and event modifiers](/documentation/swiftui/view-input-and-events).
You can also collect groups of default modifiers into new, custom view
modifiers for easy reuse.

A type conforming to this protocol inherits `@preconcurrency @MainActor`
isolation from the protocol if the conformance is declared in its original
declaration. Isolation to the main actor is the default, but it’s not
required. Declare the conformance in an extension to opt-out the isolation.

## [Topics](/documentation/swiftui/view#topics)

### [Implementing a custom view](/documentation/swiftui/view#Implementing-a-
custom-view)

[`var body: Self.Body`](/documentation/swiftui/view/body-8kl5o)

The content and behavior of the view.

**Required** Default implementations provided.

[`associatedtype Body : View`](/documentation/swiftui/view/body-
swift.associatedtype)

The type of view representing the body of this view.

**Required**

[` func modifier<T>(T) -> ModifiedContent<Self,
T>`](/documentation/swiftui/view/modifier\(_:\))

Applies a modifier to a view and returns a new view.

[API ReferencePreviews in Xcode](/documentation/swiftui/previews-in-xcode)

Generate dynamic, interactive previews of your custom views.

### [Configuring view elements](/documentation/swiftui/view#Configuring-view-
elements)

[API ReferenceAccessibility modifiers](/documentation/swiftui/view-
accessibility)

Make your SwiftUI apps accessible to everyone, including people with
disabilities.

[API ReferenceAppearance modifiers](/documentation/swiftui/view-appearance)

Configure a view’s foreground and background styles, controls, and visibility.

[API ReferenceText and symbol modifiers](/documentation/swiftui/view-text-and-
symbols)

Manage the rendering, selection, and entry of text in your view.

[API ReferenceAuxiliary view modifiers](/documentation/swiftui/view-auxiliary-
views)

Add and configure supporting views, like toolbars and context menus.

[API ReferenceChart view modifiers](/documentation/swiftui/view-chart-view)

Configure charts that you declare with Swift Charts.

### [Drawing views](/documentation/swiftui/view#Drawing-views)

[API ReferenceStyle modifiers](/documentation/swiftui/view-style-modifiers)

Apply built-in styles to different types of views.

[API ReferenceLayout modifiers](/documentation/swiftui/view-layout)

Tell a view how to arrange itself within a view hierarchy by adjusting its
size, position, alignment, padding, and so on.

[API ReferenceGraphics and rendering modifiers](/documentation/swiftui/view-
graphics-and-rendering)

Affect the way the system draws a view, for example by scaling or masking a
view, or by applying graphical effects.

### [Providing interactivity](/documentation/swiftui/view#Providing-
interactivity)

[API ReferenceInput and event modifiers](/documentation/swiftui/view-input-
and-events)

Supply actions for a view to perform in response to user input and system
events.

[API ReferenceSearch modifiers](/documentation/swiftui/view-search)

Enable people to search for content in your app.

[API ReferencePresentation modifiers](/documentation/swiftui/view-
presentation)

Define additional views for the view to present under specified conditions.

[API ReferenceState modifiers](/documentation/swiftui/view-state)

Access storage and provide child views with configuration data.

### [Deprecated modifiers](/documentation/swiftui/view#Deprecated-modifiers)

[API ReferenceDeprecated modifiers](/documentation/swiftui/view-deprecated)

Review unsupported modifiers and their replacements.

### [Instance Methods](/documentation/swiftui/view#Instance-Methods)

[`func accessibilityActions<Content>(category: AccessibilityActionCategory, ()
-> Content) -> some
View`](/documentation/swiftui/view/accessibilityactions\(category:_:\))

Adds multiple accessibility actions to the view with a specific category.
Actions allow assistive technologies, such as VoiceOver, to interact with the
view by invoking the action and are grouped by their category. When multiple
action modifiers with an equal category are applied to the view, the actions
are combined together.

[`func
accessibilityDefaultFocus<Value>(AccessibilityFocusState<Value>.Binding,
Value) -> some
View`](/documentation/swiftui/view/accessibilitydefaultfocus\(_:_:\))

Defines a region in which default accessibility focus is evaluated by
assigning a value to a given accessibility focus state binding.

[`func
accessibilityScrollStatus(_:isEnabled:)`](/documentation/swiftui/view/accessibilityscrollstatus\(_:isenabled:\))

Changes the announcement provided by accessibility technologies when a user
scrolls a scroll view within this view.

[`func accessoryWidgetGroupStyle(AccessoryWidgetGroupStyle) -> some
View`](/documentation/swiftui/view/accessorywidgetgroupstyle\(_:\))

The view modifier that can be applied to `AccessoryWidgetGroup` to specify the
shape the three content views will be masked with. The value of `style` is set
to `.automatic`, which is `.circular` by default.

[`func addOrderToWalletButtonStyle(AddOrderToWalletButtonStyle) -> some
View`](/documentation/swiftui/view/addordertowalletbuttonstyle\(_:\))

Sets the button’s style.

[`func addPassToWalletButtonStyle(AddPassToWalletButtonStyle) -> some
View`](/documentation/swiftui/view/addpasstowalletbuttonstyle\(_:\))

Sets the style to be used by the button. (see `PKAddPassButtonStyle`).

[`func allowsWindowActivationEvents() -> some
View`](/documentation/swiftui/view/allowswindowactivationevents\(\))

Configures gestures in this view hierarchy to handle events that activate the
containing window.

[`func appStoreMerchandising(isPresented: Binding<Bool>, kind:
AppStoreMerchandisingKind, onDismiss:
((Result<AppStoreMerchandisingKind.PresentationResult, any Error>) async ->
())?) -> some
View`](/documentation/swiftui/view/appstoremerchandising\(ispresented:kind:ondismiss:\))

[`func aspectRatio3D(Size3D?, contentMode: ContentMode) -> some
View`](/documentation/swiftui/view/aspectratio3d\(_:contentmode:\))

Constrains this view’s dimensions to the specified 3D aspect ratio.

[`func assistiveAccessNavigationIcon(Image) -> some
View`](/documentation/swiftui/view/assistiveaccessnavigationicon\(_:\))

Configures the view’s icon for purposes of navigation.

[`func assistiveAccessNavigationIcon(systemImage: String) -> some
View`](/documentation/swiftui/view/assistiveaccessnavigationicon\(systemimage:\))

Configures the view’s icon for purposes of navigation.

[`func
attributedTextFormattingDefinition(_:)`](/documentation/swiftui/view/attributedtextformattingdefinition\(_:\))

Apply a text formatting definition to nested views.

[`func automatedDeviceEnrollmentAddition(isPresented: Binding<Bool>) -> some
View`](/documentation/swiftui/view/automateddeviceenrollmentaddition\(ispresented:\))

Presents a modal view that enables users to add devices to their organization.

[`func backgroundExtensionEffect() -> some
View`](/documentation/swiftui/view/backgroundextensioneffect\(\))

Adds the background extension effect to the view. The view will be duplicated
into mirrored copies which will be placed around the view on any edge with
available safe area. Additionally, a blur effect will be applied on top to
blur out the copies.

[`func backgroundExtensionEffect(isEnabled: Bool) -> some
View`](/documentation/swiftui/view/backgroundextensioneffect\(isenabled:\))

Adds the background extension effect to the view. The view will be duplicated
into mirrored copies which will be placed around the view on any edge with
available safe area. Additionally, a blur effect will be applied on top to
blur out the copies.

[`func breakthroughEffect(BreakthroughEffect) -> some
View`](/documentation/swiftui/view/breakthrougheffect\(_:\))

Ensures that the view is always visible to the user, even when other content
is occluding it, like 3D models.

[`func buttonSizing(ButtonSizing) -> some
View`](/documentation/swiftui/view/buttonsizing\(_:\))

The preferred sizing behavior of buttons in the view hierarchy.

[`func certificateSheet(trust: Binding<SecTrust?>, title: String?, message:
String?, help: URL?) -> some
View`](/documentation/swiftui/view/certificatesheet\(trust:title:message:help:\))

Displays a certificate sheet using the provided certificate trust.

[`func chart3DCameraProjection(Chart3DCameraProjection) -> some
View`](/documentation/swiftui/view/chart3dcameraprojection\(_:\))

[`func chart3DPose(_:)`](/documentation/swiftui/view/chart3dpose\(_:\))

Associates a binding to be updated when the 3D chart’s pose is changed by an
interaction.

[`func chart3DRenderingStyle(Chart3DRenderingStyle) -> some
View`](/documentation/swiftui/view/chart3drenderingstyle\(_:\))

[`func chartZAxis(Visibility) -> some
View`](/documentation/swiftui/view/chartzaxis\(_:\))

Sets the visibility of the z axis.

[`func chartZAxis<Content>(content: () -> Content) -> some
View`](/documentation/swiftui/view/chartzaxis\(content:\))

Configures the z-axis for 3D charts in the view.

[`func
chartZAxisLabel(_:position:alignment:spacing:)`](/documentation/swiftui/view/chartzaxislabel\(_:position:alignment:spacing:\))

Adds z axis label for charts in the view. It effects 3D charts only.

[`func chartZScale<Domain, Range>(domain: Domain, range: Range, type:
ScaleType?) -> some
View`](/documentation/swiftui/view/chartzscale\(domain:range:type:\))

Configures the z scale for 3D charts.

[`func chartZScale<Domain>(domain: Domain, type: ScaleType?) -> some
View`](/documentation/swiftui/view/chartzscale\(domain:type:\))

Configures the z scale for 3D charts.

[`func chartZScale<Range>(range: Range, type: ScaleType?) -> some
View`](/documentation/swiftui/view/chartzscale\(range:type:\))

Configures the z scale for 3D charts.

[`func chartZSelection<P>(range: Binding<ClosedRange<P>?>) -> some
View`](/documentation/swiftui/view/chartzselection\(range:\))

[`func chartZSelection<P>(value: Binding<P?>) -> some
View`](/documentation/swiftui/view/chartzselection\(value:\))

[`func contactAccessButtonCaption(ContactAccessButton.Caption) -> some
View`](/documentation/swiftui/view/contactaccessbuttoncaption\(_:\))

[`func contactAccessButtonStyle(ContactAccessButton.Style) -> some
View`](/documentation/swiftui/view/contactaccessbuttonstyle\(_:\))

[`func contactAccessPicker(isPresented: Binding<Bool>, completionHandler:
([String]) -> ()) -> some
View`](/documentation/swiftui/view/contactaccesspicker\(ispresented:completionhandler:\))

Modally present UI which allows the user to select which contacts your app has
access to.

[`func containerCornerOffset(Edge.Set, sizeToFit: Bool) -> some
View`](/documentation/swiftui/view/containercorneroffset\(_:sizetofit:\))

Adjusts the view’s layout to avoid the container view’s corner insets for the
specified edges.

[`func containerValue<V>(WritableKeyPath<ContainerValues, V>, V) -> some
View`](/documentation/swiftui/view/containervalue\(_:_:\))

Sets a particular container value of a view.

[`func contentCaptureProtected(Bool) -> some
View`](/documentation/swiftui/view/contentcaptureprotected\(_:\))

[`func
contentToolbar(for:content:)`](/documentation/swiftui/view/contenttoolbar\(for:content:\))

Populates the toolbar of the specified content view type with the views you
provide.

[`func continuityDevicePicker(isPresented: Binding<Bool>, onDidConnect:
((AVContinuityDevice?) -> Void)?) -> some
View`](/documentation/swiftui/view/continuitydevicepicker\(ispresented:ondidconnect:\))

A `continuityDevicePicker` should be used to discover and connect nearby
continuity device through a button interface or other form of activation. On
tvOS, this presents a fullscreen continuity device picker experience when
selected. The modal view covers as much the screen of `self` as possible when
a given condition is true.

[`func
controlWidgetActionHint(_:)`](/documentation/swiftui/view/controlwidgetactionhint\(_:\))

The action hint of the control described by the modified label.

[`func
controlWidgetStatus(_:)`](/documentation/swiftui/view/controlwidgetstatus\(_:\))

The status of the control described by the modified label.

[`func currentEntitlementTask(for: String, priority: TaskPriority, action:
(EntitlementTaskState<VerificationResult<Transaction>?>) async -> ()) -> some
View`](/documentation/swiftui/view/currententitlementtask\(for:priority:action:\))

Declares the view as dependent on the entitlement of an In-App Purchase
product, and returns a modified view.

[`func dialogPreventsAppTermination(Bool?) -> some
View`](/documentation/swiftui/view/dialogpreventsapptermination\(_:\))

Whether the alert or confirmation dialog prevents the app from being
quit/terminated by the system or app termination menu item.

[`func documentBrowserContextMenu(([URL]?) -> some View) -> some
View`](/documentation/swiftui/view/documentbrowsercontextmenu\(_:\))

Adds to a `DocumentLaunchView` actions that accept a list of selected files as
their parameter.

[`func dragConfiguration(DragConfiguration) -> some
View`](/documentation/swiftui/view/dragconfiguration\(_:\))

Configures a drag session.

[`func
dragContainer(for:in:_:)`](/documentation/swiftui/view/dragcontainer\(for:in:_:\))

A container with draggable views where the drag payload is based on multiple
identifiers of dragged items.

[`func
dragContainer(for:itemID:in:_:)`](/documentation/swiftui/view/dragcontainer\(for:itemid:in:_:\))

A container with draggable views.

[`func dragContainerSelection<ItemID>(@autoclosure () -> Array<ItemID>,
containerNamespace: Namespace.ID?) -> some
View`](/documentation/swiftui/view/dragcontainerselection\(_:containernamespace:\))

Provides multiple item selection support for drag containers.

[`func dragPreviewsFormation(DragDropPreviewsFormation) -> some
View`](/documentation/swiftui/view/dragpreviewsformation\(_:\))

Describes the way dragged previews are visually composed.

[`func draggable<Item>(Item.Type, containerNamespace: Namespace.ID?, () ->
Item?) -> some
View`](/documentation/swiftui/view/draggable\(_:containernamespace:_:\))

Activates this view as the source of a drag and drop operation, allowing to
provide optional identifiable payload and specify the namespace of the drag
container this view belongs to.

[`func draggable<Item, ItemID>(Item.Type, id: KeyPath<Item, ItemID>,
containerNamespace: Namespace.ID?, () -> Item?) -> some
View`](/documentation/swiftui/view/draggable\(_:id:containernamespace:_:\))

Activates this view as the source of a drag and drop operation, allowing to
provide optional payload and specify the namespace of the drag container this
view belongs to.

[`func draggable<Item, ItemID>(Item.Type, id: KeyPath<Item, ItemID>, item:
@autoclosure () -> Item?, containerNamespace: Namespace.ID?) -> some
View`](/documentation/swiftui/view/draggable\(_:id:item:containernamespace:\))

Activates this view as the source of a drag and drop operation, allowing to
provide optional payload and specify the namespace of the drag container this
view belongs to.

[`func draggable<Item>(Item.Type, item: @autoclosure () -> Item?,
containerNamespace: Namespace.ID?) -> some
View`](/documentation/swiftui/view/draggable\(_:item:containernamespace:\))

Activates this view as the source of a drag and drop operation, allowing to
provide optional identifiable payload and specify the namespace of the drag
container this view belongs to.

[`func draggable<ItemID>(containerItemID: ItemID, containerNamespace:
Namespace.ID?) -> some
View`](/documentation/swiftui/view/draggable\(containeritemid:containernamespace:\))

Inside a drag container, activates this view as the source of a drag and drop
operation. Supports lazy drag containers.

[`func dropConfiguration((DropSession) -> DropConfiguration) -> some
View`](/documentation/swiftui/view/dropconfiguration\(_:\))

Configures a drop session.

[`func dropDestination<T>(for: T.Type, isEnabled: Bool, action: ([T],
DropSession) -> Void) -> some
View`](/documentation/swiftui/view/dropdestination\(for:isenabled:action:\))

Defines the destination of a drag and drop operation that provides a drop
operation proposal and handles the dropped content with a closure that you
specify.

[`func dropPreviewsFormation(DragDropPreviewsFormation) -> some
View`](/documentation/swiftui/view/droppreviewsformation\(_:\))

Describes the way previews for a drop are composed.

[`func formStyle<S>(S) -> some
View`](/documentation/swiftui/view/formstyle\(_:\))

Sets the style for forms in a view hierarchy.

[`func gameSaveSyncingAlert(directory: Binding<GameSaveSyncedDirectory?>,
finishedLoading: () -> Void) -> some
View`](/documentation/swiftui/view/gamesavesyncingalert\(directory:finishedloading:\))

Presents a modal view while the game synced directory loads.

[`func glassBackgroundEffect<S>(S, displayMode: GlassBackgroundDisplayMode) ->
some
View`](/documentation/swiftui/view/glassbackgroundeffect\(_:displaymode:\))

Fills the view’s background with a custom glass background effect and
container-relative rounded rectangle shape.

[`func glassBackgroundEffect<T, S>(S, in: T, displayMode:
GlassBackgroundDisplayMode) -> some
View`](/documentation/swiftui/view/glassbackgroundeffect\(_:in:displaymode:\))

Fills the view’s background with a custom glass background effect and a shape
that you specify.

[`func glassEffect(Glass, in: some Shape) -> some
View`](/documentation/swiftui/view/glasseffect\(_:in:\))

Applies the Liquid Glass effect to a view.

[`func glassEffectID((some Hashable & Sendable)?, in: Namespace.ID) -> some
View`](/documentation/swiftui/view/glasseffectid\(_:in:\))

Associates an identity value to Liquid Glass effects defined within this view.

[`func glassEffectTransition(GlassEffectTransition) -> some
View`](/documentation/swiftui/view/glasseffecttransition\(_:\))

Associates a glass effect transition with any glass effects defined within
this view.

[`func glassEffectUnion(id: (some Hashable & Sendable)?, namespace:
Namespace.ID) -> some
View`](/documentation/swiftui/view/glasseffectunion\(id:namespace:\))

Associates any Liquid Glass effects defined within this view to a union with
the provided identifier.

[`func groupActivityAssociation(GroupActivityAssociationKind?) -> some
View`](/documentation/swiftui/view/groupactivityassociation\(_:\))

Specifies how a view should be associated with the current SharePlay group
activity.

[`func handGestureShortcut(HandGestureShortcut, isEnabled: Bool) -> some
View`](/documentation/swiftui/view/handgestureshortcut\(_:isenabled:\))

Assigns a hand gesture shortcut to the modified control.

[`func handPointerBehavior(HandPointerBehavior?) -> some
View`](/documentation/swiftui/view/handpointerbehavior\(_:\))

Sets the behavior of the hand pointer while the user is interacting with the
view.

[`func handlesGameControllerEvents(matching: GCUIEventTypes) -> some
View`](/documentation/swiftui/view/handlesgamecontrollerevents\(matching:\))

Specifies the game controllers events which should be delivered through the
GameController framework when the view, or one of its descendants has focus.

[`func handlesGameControllerEvents(matching: GCUIEventTypes, withOptions:
GameControllerEventHandlingOptions?) -> some
View`](/documentation/swiftui/view/handlesgamecontrollerevents\(matching:withoptions:\))

Specifies the game controllers events which should be delivered through the
GameController framework when the view or one of its descendants has focus.

[`func healthDataAccessRequest(store: HKHealthStore, objectType: HKObjectType,
predicate: NSPredicate?, trigger: some Equatable, completion: (Result<Bool,
any Error>) -> Void) -> some
View`](/documentation/swiftui/view/healthdataaccessrequest\(store:objecttype:predicate:trigger:completion:\))

Asynchronously requests permission to read a data type that requires per-
object authorization (such as vision prescriptions).

[`func healthDataAccessRequest(store: HKHealthStore, readTypes:
Set<HKObjectType>, trigger: some Equatable, completion: (Result<Bool, any
Error>) -> Void) -> some
View`](/documentation/swiftui/view/healthdataaccessrequest\(store:readtypes:trigger:completion:\))

Requests permission to read the specified HealthKit data types.

[`func healthDataAccessRequest(store: HKHealthStore, shareTypes:
Set<HKSampleType>, readTypes: Set<HKObjectType>?, trigger: some Equatable,
completion: (Result<Bool, any Error>) -> Void) -> some
View`](/documentation/swiftui/view/healthdataaccessrequest\(store:sharetypes:readtypes:trigger:completion:\))

Requests permission to save and read the specified HealthKit data types.

[`func imagePlaygroundGenerationStyle(ImagePlaygroundStyle, in:
[ImagePlaygroundStyle]) -> some
View`](/documentation/swiftui/view/imageplaygroundgenerationstyle\(_:in:\))

Sets the generation style for an image playground.

[`func
imagePlaygroundPersonalizationPolicy(ImagePlaygroundPersonalizationPolicy) ->
some
View`](/documentation/swiftui/view/imageplaygroundpersonalizationpolicy\(_:\))

Policy determining whether to support the usage of people in the playground or
not.

[`func imagePlaygroundSheet(isPresented: Binding<Bool>, concept: String,
sourceImage: Image?, onCompletion: (URL) -> Void, onCancellation: (() ->
Void)?) -> some
View`](/documentation/swiftui/view/imageplaygroundsheet\(ispresented:concept:sourceimage:oncompletion:oncancellation:\))

Presents the system sheet to create images from the specified input.

[`func imagePlaygroundSheet(isPresented: Binding<Bool>, concept: String,
sourceImageURL: URL, onCompletion: (URL) -> Void, onCancellation: (() ->
Void)?) -> some
View`](/documentation/swiftui/view/imageplaygroundsheet\(ispresented:concept:sourceimageurl:oncompletion:oncancellation:\))

Presents the system sheet to create images from the specified input.

[`func imagePlaygroundSheet(isPresented: Binding<Bool>, concepts:
[ImagePlaygroundConcept], sourceImage: Image?, onCompletion: (URL) -> Void,
onCancellation: (() -> Void)?) -> some
View`](/documentation/swiftui/view/imageplaygroundsheet\(ispresented:concepts:sourceimage:oncompletion:oncancellation:\))

Presents the system sheet to create images from the specified input.

[`func imagePlaygroundSheet(isPresented: Binding<Bool>, concepts:
[ImagePlaygroundConcept], sourceImageURL: URL, onCompletion: (URL) -> Void,
onCancellation: (() -> Void)?) -> some
View`](/documentation/swiftui/view/imageplaygroundsheet\(ispresented:concepts:sourceimageurl:oncompletion:oncancellation:\))

Presents the system sheet to create images from the specified input.

[`func immersiveEnvironmentPicker<Content>(content: () -> Content) -> some
View`](/documentation/swiftui/view/immersiveenvironmentpicker\(content:\))

Add menu items to open immersive spaces from a media player’s environment
picker.

[`func inAppPurchaseOptions(((Product) async -> Set<Product.PurchaseOption>)?)
-> some View`](/documentation/swiftui/view/inapppurchaseoptions\(_:\))

Add a function to call before initiating a purchase from StoreKit view within
this view, providing a set of options for the purchase.

[`func journalingSuggestionsPicker(isPresented: Binding<Bool>,
journalingSuggestionToken: JournalingSuggestionPresentationToken?,
onCompletion: (JournalingSuggestion) async -> Void) -> some
View`](/documentation/swiftui/view/journalingsuggestionspicker\(ispresented:journalingsuggestiontoken:oncompletion:\))

Presents a visual picker interface that contains events and images that a
person can select to retrieve more information.

[`func journalingSuggestionsPicker(isPresented: Binding<Bool>, onCompletion:
(JournalingSuggestion) async -> Void) -> some
View`](/documentation/swiftui/view/journalingsuggestionspicker\(ispresented:oncompletion:\))

Presents a visual picker interface that contains events and images that a
person can select to retrieve more information.

[`func labelIconToTitleSpacing(CGFloat) -> some
View`](/documentation/swiftui/view/labelicontotitlespacing\(_:\))

Set the spacing between the icon and title in labels.

[`func labelReservedIconWidth(CGFloat) -> some
View`](/documentation/swiftui/view/labelreservediconwidth\(_:\))

Set the width reserved for icons in labels.

[`func labeledContentStyle<S>(S) -> some
View`](/documentation/swiftui/view/labeledcontentstyle\(_:\))

Sets a style for labeled content.

[`func labelsVisibility(Visibility) -> some
View`](/documentation/swiftui/view/labelsvisibility\(_:\))

Controls the visibility of labels of any controls contained within this view.

[`func lineHeight(AttributedString.LineHeight?) -> some
View`](/documentation/swiftui/view/lineheight\(_:\))

A modifier for the default line height in the view hierarchy.

[`func listRowInsets(Edge.Set, CGFloat?) -> some
View`](/documentation/swiftui/view/listrowinsets\(_:_:\))

Sets the insets of rows in a list on the specified edges.

[`func listSectionIndexVisibility(Visibility) -> some
View`](/documentation/swiftui/view/listsectionindexvisibility\(_:\))

Changes the visibility of the list section index.

[`func listSectionMargins(Edge.Set, CGFloat?) -> some
View`](/documentation/swiftui/view/listsectionmargins\(_:_:\))

Set the section margins for the specific edges.

[`func lookAroundViewer(isPresented: Binding<Bool>, initialScene:
MKLookAroundScene?, allowsNavigation: Bool, showsRoadLabels: Bool,
pointsOfInterest: PointOfInterestCategories, onDismiss: (() -> Void)?) -> some
View`](/documentation/swiftui/view/lookaroundviewer\(ispresented:initialscene:allowsnavigation:showsroadlabels:pointsofinterest:ondismiss:\))

[`func lookAroundViewer(isPresented: Binding<Bool>, scene:
Binding<MKLookAroundScene?>, allowsNavigation: Bool, showsRoadLabels: Bool,
pointsOfInterest: PointOfInterestCategories, onDismiss: (() -> Void)?) -> some
View`](/documentation/swiftui/view/lookaroundviewer\(ispresented:scene:allowsnavigation:showsroadlabels:pointsofinterest:ondismiss:\))

[`func manageSubscriptionsSheet(isPresented: Binding<Bool>,
subscriptionGroupID: String) -> some
View`](/documentation/swiftui/view/managesubscriptionssheet\(ispresented:subscriptiongroupid:\))

[`func managedContentStyle(ManagedContentStyle) -> some
View`](/documentation/swiftui/view/managedcontentstyle\(_:\))

Applies a managed content style to the view.

[`func manipulable(coordinateSpace: some CoordinateSpaceProtocol, operations:
Manipulable.Operation.Set, inertia: Manipulable.Inertia, isEnabled: Bool,
onChanged: ((Manipulable.Event) -> Void)?) -> some
View`](/documentation/swiftui/view/manipulable\(coordinatespace:operations:inertia:isenabled:onchanged:\))

Allows this view to be manipulated using common hand gestures.

[`func manipulable(transform: Binding<AffineTransform3D>, coordinateSpace:
some CoordinateSpaceProtocol, operations: Manipulable.Operation.Set, inertia:
Manipulable.Inertia, isEnabled: Bool, onChanged: ((Manipulable.Event) ->
Void)?) -> some
View`](/documentation/swiftui/view/manipulable\(transform:coordinatespace:operations:inertia:isenabled:onchanged:\))

Applies the given 3D affine transform to the view and allows it to be
manipulated using common hand gestures.

[`func manipulable(using: Manipulable.GestureState) -> some
View`](/documentation/swiftui/view/manipulable\(using:\))

Allows the view to be manipulated using a manipulation gesture attached to a
different view.

[`func manipulationGesture(updating: Binding<Manipulable.GestureState>,
coordinateSpace: some CoordinateSpaceProtocol, operations:
Manipulable.Operation.Set, inertia: Manipulable.Inertia, isEnabled: Bool,
onChanged: ((Manipulable.Event) -> Void)?) -> some
View`](/documentation/swiftui/view/manipulationgesture\(updating:coordinatespace:operations:inertia:isenabled:onchanged:\))

Adds a manipulation gesture to this view without allowing this view to be
manipulable itself.

[`func mapCameraKeyframeAnimator(trigger: some Equatable, keyframes:
(MapCamera) -> some Keyframes<MapCamera>) -> some
View`](/documentation/swiftui/view/mapcamerakeyframeanimator\(trigger:keyframes:\))

Uses the given keyframes to animate the camera of a `Map` when the given
trigger value changes.

[`func mapControlVisibility(Visibility) -> some
View`](/documentation/swiftui/view/mapcontrolvisibility\(_:\))

Configures all Map controls in the environment to have the specified
visibility

[`func mapControls(() -> some View) -> some
View`](/documentation/swiftui/view/mapcontrols\(_:\))

Configures all `Map` views in the associated environment to have standard size
and position controls

[`func mapFeatureSelectionAccessory(MapItemDetailSelectionAccessoryStyle?) ->
some View`](/documentation/swiftui/view/mapfeatureselectionaccessory\(_:\))

Specifies the selection accessory to display for a `MapFeature`

[`func mapFeatureSelectionContent(content: (MapFeature) -> some MapContent) ->
some
View`](/documentation/swiftui/view/mapfeatureselectioncontent\(content:\))

Specifies a custom presentation for the currently selected feature.

[`func mapFeatureSelectionDisabled((MapFeature) -> Bool) -> some
View`](/documentation/swiftui/view/mapfeatureselectiondisabled\(_:\))

Specifies which map features should have selection disabled.

[`func mapItemDetailPopover(isPresented: Binding<Bool>, item: MKMapItem?,
displaysMap: Bool, attachmentAnchor: PopoverAttachmentAnchor) -> some
View`](/documentation/swiftui/view/mapitemdetailpopover\(ispresented:item:displaysmap:attachmentanchor:\))

Presents a map item detail popover.

[`func mapItemDetailPopover(isPresented: Binding<Bool>, item: MKMapItem?,
displaysMap: Bool, attachmentAnchor: PopoverAttachmentAnchor, arrowEdge: Edge)
-> some
View`](/documentation/swiftui/view/mapitemdetailpopover\(ispresented:item:displaysmap:attachmentanchor:arrowedge:\))

Presents a map item detail popover.

[`func mapItemDetailPopover(item: Binding<MKMapItem?>, displaysMap: Bool,
attachmentAnchor: PopoverAttachmentAnchor) -> some
View`](/documentation/swiftui/view/mapitemdetailpopover\(item:displaysmap:attachmentanchor:\))

Presents a map item detail popover.

[`func mapItemDetailPopover(item: Binding<MKMapItem?>, displaysMap: Bool,
attachmentAnchor: PopoverAttachmentAnchor, arrowEdge: Edge) -> some
View`](/documentation/swiftui/view/mapitemdetailpopover\(item:displaysmap:attachmentanchor:arrowedge:\))

Presents a map item detail popover.

[`func mapItemDetailSheet(isPresented: Binding<Bool>, item: MKMapItem?,
displaysMap: Bool) -> some
View`](/documentation/swiftui/view/mapitemdetailsheet\(ispresented:item:displaysmap:\))

Presents a map item detail sheet.

[`func mapItemDetailSheet(item: Binding<MKMapItem?>, displaysMap: Bool) ->
some
View`](/documentation/swiftui/view/mapitemdetailsheet\(item:displaysmap:\))

Presents a map item detail sheet.

[`func mapScope(Namespace.ID) -> some
View`](/documentation/swiftui/view/mapscope\(_:\))

Creates a mapScope that SwiftUI uses to connect map controls to an associated
map.

[`func mapStyle(MapStyle) -> some
View`](/documentation/swiftui/view/mapstyle\(_:\))

Specifies the map style to be used.

[`func matchedTransitionSource(id: some Hashable, in: Namespace.ID) -> some
View`](/documentation/swiftui/view/matchedtransitionsource\(id:in:\))

Identifies this view as the source of a navigation transition, such as a zoom
transition.

[`func matchedTransitionSource(id: some Hashable, in: Namespace.ID,
configuration: (EmptyMatchedTransitionSourceConfiguration) -> some
MatchedTransitionSourceConfiguration) -> some
View`](/documentation/swiftui/view/matchedtransitionsource\(id:in:configuration:\))

Identifies this view as the source of a navigation transition, such as a zoom
transition.

[`func materialActiveAppearance(MaterialActiveAppearance) -> some
View`](/documentation/swiftui/view/materialactiveappearance\(_:\))

Sets an explicit active appearance for materials in this view.

[`func multilineTextAlignment(strategy: Text.AlignmentStrategy) -> some
View`](/documentation/swiftui/view/multilinetextalignment\(strategy:\))

A modifier for the default text alignment strategy in the view hierarchy.

[`func navigationLinkIndicatorVisibility(Visibility) -> some
View`](/documentation/swiftui/view/navigationlinkindicatorvisibility\(_:\))

Configures whether navigation links show a disclosure indicator.

[`func navigationTransition(some NavigationTransition) -> some
View`](/documentation/swiftui/view/navigationtransition\(_:\))

Sets the navigation transition style for this view.

[`func onAppIntentExecution<I>(I.Type, perform: (I) -> Void) -> some
View`](/documentation/swiftui/view/onappintentexecution\(_:perform:\))

Registers a handler to invoke in response to the specified app intent that
your app receives.

[`func onApplePayCouponCodeChange(perform: (String) async ->
PKPaymentRequestCouponCodeUpdate) -> some
View`](/documentation/swiftui/view/onapplepaycouponcodechange\(perform:\))

Called when a user has entered or updated a coupon code. This is required if
the user is being asked to provide a coupon code.

[`func onApplePayPaymentMethodChange(perform: (PKPaymentMethod) async ->
PKPaymentRequestPaymentMethodUpdate) -> some
View`](/documentation/swiftui/view/onapplepaypaymentmethodchange\(perform:\))

Called when a payment method has changed and asks for an update payment
request. If this modifier isn’t provided Wallet will assume the payment method
is valid.

[`func onApplePayShippingContactChange(perform: (PKContact) async ->
PKPaymentRequestShippingContactUpdate) -> some
View`](/documentation/swiftui/view/onapplepayshippingcontactchange\(perform:\))

Called when a user selected a shipping address. This is required if the user
is being asked to provide a shipping contact.

[`func onApplePayShippingMethodChange(perform: (PKShippingMethod) async ->
PKPaymentRequestShippingMethodUpdate) -> some
View`](/documentation/swiftui/view/onapplepayshippingmethodchange\(perform:\))

Called when a user selected a shipping method. This is required if the user is
being asked to provide a shipping method.

[`func
onCameraCaptureEvent(isEnabled:defaultSoundDisabled:action:)`](/documentation/swiftui/view/oncameracaptureevent\(isenabled:defaultsounddisabled:action:\))

Used to register an action triggered by system capture events.

[`func
onCameraCaptureEvent(isEnabled:defaultSoundDisabled:primaryAction:secondaryAction:)`](/documentation/swiftui/view/oncameracaptureevent\(isenabled:defaultsounddisabled:primaryaction:secondaryaction:\))

Used to register actions triggered by system capture events.

[`func onDragSessionUpdated((DragSession) -> Void) -> some
View`](/documentation/swiftui/view/ondragsessionupdated\(_:\))

Specifies an action to perform on each update of an ongoing dragging operation
activated by `draggable(_:)` or anther drag modifiers.

[`func onDropSessionUpdated((DropSession) -> Void) -> some
View`](/documentation/swiftui/view/ondropsessionupdated\(_:\))

Specifies an action to perform on each update of an ongoing drop operation
activated by `dropDestination(_:)` or other drop modifiers.

[`func
onGeometryChange3D(for:of:action:)`](/documentation/swiftui/view/ongeometrychange3d\(for:of:action:\))

Returns a new view that arranges to call `action(value)` whenever the value
computed by `transform(proxy)` changes, where `proxy` provides access to the
view’s 3D geometry properties.

[`func onInAppPurchaseCompletion(perform: ((Product,
Result<Product.PurchaseResult, any Error>) async -> ())?) -> some
View`](/documentation/swiftui/view/oninapppurchasecompletion\(perform:\))

Add an action to perform when a purchase initiated from a StoreKit view within
this view completes.

[`func onInAppPurchaseStart(perform: ((Product) async -> ())?) -> some
View`](/documentation/swiftui/view/oninapppurchasestart\(perform:\))

Add an action to perform when a user triggers the purchase button on a
StoreKit view within this view.

[`func onInteractiveResizeChange((Bool) -> Void) -> some
View`](/documentation/swiftui/view/oninteractiveresizechange\(_:\))

Adds an action to perform when the enclosing window is being interactively
resized.

[`func
onMapCameraChange(frequency:_:)`](/documentation/swiftui/view/onmapcamerachange\(frequency:_:\))

Performs an action when Map camera framing changes

[`func onOpenURL(prefersInApp: Bool) -> some
View`](/documentation/swiftui/view/onopenurl\(prefersinapp:\))

Sets an `OpenURLAction` that prefers opening URL with an in-app browser. It’s
equivalent to calling `.onOpenURL(_:)`

[`func
onWorldRecenter(action:)`](/documentation/swiftui/view/onworldrecenter\(action:\))

Adds an action to perform when recentering the view with the digital crown.

[`func payLaterViewAction(PayLaterViewAction) -> some
View`](/documentation/swiftui/view/paylaterviewaction\(_:\))

Sets the action on the PayLaterView. See `PKPayLaterAction`.

[`func payLaterViewDisplayStyle(PayLaterViewDisplayStyle) -> some
View`](/documentation/swiftui/view/paylaterviewdisplaystyle\(_:\))

Sets the display style on the PayLaterView. See `PKPayLaterDisplayStyle`.

[`func payWithApplePayButtonDisableCardArt() -> some
View`](/documentation/swiftui/view/paywithapplepaybuttondisablecardart\(\))

Sets the features that should be allowed to show on the payment buttons.

[`func payWithApplePayButtonStyle(PayWithApplePayButtonStyle) -> some
View`](/documentation/swiftui/view/paywithapplepaybuttonstyle\(_:\))

Sets the style to be used by the button. (see `PayWithApplePayButtonStyle`).

[`func popoverTip((any Tip)?, arrowEdge: Edge?, action: (Tips.Action) -> Void)
-> some View`](/documentation/swiftui/view/popovertip\(_:arrowedge:action:\))

Presents a popover tip on the modified view.

[`func popoverTip((any Tip)?, isPresented: Binding<Bool>?, attachmentAnchor:
PopoverAttachmentAnchor, arrowEdge: Edge?, action: (Tips.Action) -> Void) ->
some
View`](/documentation/swiftui/view/popovertip\(_:ispresented:attachmentanchor:arrowedge:action:\))

Presents a popover tip on the modified view.

[`func popoverTip((any Tip)?, isPresented: Binding<Bool>?, attachmentAnchor:
PopoverAttachmentAnchor, arrowEdges: Edge.Set, action: (Tips.Action) -> Void)
-> some
View`](/documentation/swiftui/view/popovertip\(_:ispresented:attachmentanchor:arrowedges:action:\))

Presents a popover tip on the modified view.

[`func
postToPhotosSharedAlbumSheet(isPresented:items:photoLibrary:defaultAlbumIdentifier:completion:)`](/documentation/swiftui/view/posttophotossharedalbumsheet\(ispresented:items:photolibrary:defaultalbumidentifier:completion:\))

Presents an “Add to Shared Album” sheet that allows the user to post the given
items to a shared album.

[`func preferredSubscriptionOffer((Product, Product.SubscriptionInfo,
[Product.SubscriptionOffer]) -> Product.SubscriptionOffer?) -> some
View`](/documentation/swiftui/view/preferredsubscriptionoffer\(_:\))

Selects a subscription offer to apply to a purchase that a customer makes from
a subscription store view, a store view, or a product view.

[`func
preferredWindowClippingMargins(_:_:)`](/documentation/swiftui/view/preferredwindowclippingmargins\(_:_:\))

Requests additional margins for drawing beyond the bounds of the window.

[`func presentationBreakthroughEffect(BreakthroughEffect) -> some
View`](/documentation/swiftui/view/presentationbreakthrougheffect\(_:\))

Changes the way the enclosing presentation breaks through content occluding
it.

[`func presentationPreventsAppTermination(Bool?) -> some
View`](/documentation/swiftui/view/presentationpreventsapptermination\(_:\))

Whether a presentation prevents the app from being terminated/quit by the
system or app termination menu item.

[`func productDescription(Visibility) -> some
View`](/documentation/swiftui/view/productdescription\(_:\))

Configure the visibility of labels displaying an in-app purchase product
description within the view.

[`func productIconBorder() -> some
View`](/documentation/swiftui/view/producticonborder\(\))

Adds a standard border to an in-app purchase product’s icon .

[`func productViewStyle(some ProductViewStyle) -> some
View`](/documentation/swiftui/view/productviewstyle\(_:\))

Sets the style for In-App Purchase product views within a view.

[`func realityViewCameraControls(CameraControls) -> some
View`](/documentation/swiftui/view/realityviewcameracontrols\(_:\))

Adds gestures that control the position and direction of a virtual camera.

[`func realityViewLayoutBehavior(RealityViewLayoutOption) -> some
View`](/documentation/swiftui/view/realityviewlayoutbehavior\(_:\))

A view modifier that controls the frame sizing and content alignment behavior
for `RealityView`

[`func rotation3DLayout(Rotation3D) -> some
View`](/documentation/swiftui/view/rotation3dlayout\(_:\))

Rotates a view with impacts to its frame in a containing layout

[`func
rotation3DLayout(_:axis:)`](/documentation/swiftui/view/rotation3dlayout\(_:axis:\))

Rotates a view with impacts to its frame in a containing layout

[`func
safeAreaBar(edge:alignment:spacing:content:)`](/documentation/swiftui/view/safeareabar\(edge:alignment:spacing:content:\))

Shows the specified content as a custom bar beside the modified view.

[`func scaledToFill3D() -> some
View`](/documentation/swiftui/view/scaledtofill3d\(\))

Scales this view to fill its parent.

[`func scaledToFit3D() -> some
View`](/documentation/swiftui/view/scaledtofit3d\(\))

Scales this view to fit its parent.

[`func scrollEdgeEffectHidden(Bool, for: Edge.Set) -> some
View`](/documentation/swiftui/view/scrolledgeeffecthidden\(_:for:\))

Hides any scroll edge effects for scroll views within this hierarchy.

[`func scrollEdgeEffectStyle(ScrollEdgeEffectStyle?, for: Edge.Set) -> some
View`](/documentation/swiftui/view/scrolledgeeffectstyle\(_:for:\))

Configures the scroll edge effect style for scroll views within this
hierarchy.

[`func scrollInputBehavior(ScrollInputBehavior, for: ScrollInputKind) -> some
View`](/documentation/swiftui/view/scrollinputbehavior\(_:for:\))

Enables or disables scrolling in scrollable views when using particular
inputs.

[`func searchSelection(Binding<TextSelection?>) -> some
View`](/documentation/swiftui/view/searchselection\(_:\))

Binds the selection of the search field associated with the nearest searchable
modifier to the given [`TextSelection`](/documentation/swiftui/textselection)
value.

[`func searchToolbarBehavior(SearchToolbarBehavior) -> some
View`](/documentation/swiftui/view/searchtoolbarbehavior\(_:\))

Configures the behavior for search in the toolbar.

[`func
sectionIndexLabel(_:)`](/documentation/swiftui/view/sectionindexlabel\(_:\))

Sets the label that is used in a section index to point to this section,
typically only a single character long.

[`func signInWithAppleButtonStyle(SignInWithAppleButton.Style) -> some
View`](/documentation/swiftui/view/signinwithapplebuttonstyle\(_:\))

Sets the style used for displaying the control (see
`SignInWithAppleButton.Style`).

[`func sliderThumbVisibility(Visibility) -> some
View`](/documentation/swiftui/view/sliderthumbvisibility\(_:\))

Sets the thumb visibility for `Slider`s within this view.

[`func spatialOverlay<V>(alignment: Alignment3D, content: () -> V) -> some
View`](/documentation/swiftui/view/spatialoverlay\(alignment:content:\))

Adds secondary views within the 3D bounds of this view.

[`func spatialOverlayPreferenceValue<K, V>(K.Type, alignment: Alignment3D,
(K.Value) -> V) -> some
View`](/documentation/swiftui/view/spatialoverlaypreferencevalue\(_:alignment:_:\))

Uses the specified preference value from the view to produce another view
occupying the same 3D space of the first view.

[`func storeButton(Visibility, for: StoreButtonKind...) -> some
View`](/documentation/swiftui/view/storebutton\(_:for:\))

Specifies the visibility of auxiliary buttons that store view and subscription
store view instances may use.

[`func storeProductTask(for: Product.ID, priority: TaskPriority, action:
(Product.TaskState) async -> ()) -> some
View`](/documentation/swiftui/view/storeproducttask\(for:priority:action:\))

Declares the view as dependent on an In-App Purchase product and returns a
modified view.

[`func storeProductsTask(for: some Collection<String> & Equatable & Sendable,
priority: TaskPriority, action: (Product.CollectionTaskState) async -> ()) ->
some
View`](/documentation/swiftui/view/storeproductstask\(for:priority:action:\))

Declares the view as dependent on a collection of In-App Purchase products and
returns a modified view.

[`func subscriptionIntroductoryOffer(applyOffer: (Product,
Product.SubscriptionInfo) -> Bool, compactJWS: (Product,
Product.SubscriptionInfo) async throws -> String) -> some
View`](/documentation/swiftui/view/subscriptionintroductoryoffer\(applyoffer:compactjws:\))

Selects the introductory offer eligibility preference to apply to a purchase a
customer makes from a subscription store view.

[`func subscriptionOfferViewButtonVisibility(Visibility, for:
SubscriptionOfferViewButtonKind...) -> some
View`](/documentation/swiftui/view/subscriptionofferviewbuttonvisibility\(_:for:\))

[`func subscriptionOfferViewDetailAction((() -> ())?) -> some
View`](/documentation/swiftui/view/subscriptionofferviewdetailaction\(_:\))

[`func subscriptionOfferViewStyle(some SubscriptionOfferViewStyle) -> some
View`](/documentation/swiftui/view/subscriptionofferviewstyle\(_:\))

[`func subscriptionPromotionalOffer(offer: (Product, Product.SubscriptionInfo)
-> Product.SubscriptionOffer?, compactJWS: (Product, Product.SubscriptionInfo,
Product.SubscriptionOffer) async throws -> String) -> some
View`](/documentation/swiftui/view/subscriptionpromotionaloffer\(offer:compactjws:\))

Selects a promotional offer to apply to a purchase a customer makes from a
subscription store view.

[`func subscriptionPromotionalOffer(offer: (Product, Product.SubscriptionInfo)
-> Product.SubscriptionOffer?, signature: (Product, Product.SubscriptionInfo,
Product.SubscriptionOffer) async throws ->
Product.SubscriptionOffer.Signature) -> some
View`](/documentation/swiftui/view/subscriptionpromotionaloffer\(offer:signature:\))

Selects a promotional offer to apply to a purchase a customer makes from a
subscription store view.

Deprecated

[`func subscriptionStatusTask(for: String, priority: TaskPriority, action:
(EntitlementTaskState<[Product.SubscriptionInfo.Status]>) async -> ()) -> some
View`](/documentation/swiftui/view/subscriptionstatustask\(for:priority:action:\))

Declares the view as dependent on the status of an auto-renewable subscription
group, and returns a modified view.

[`func subscriptionStoreButtonLabel(SubscriptionStoreButtonLabel) -> some
View`](/documentation/swiftui/view/subscriptionstorebuttonlabel\(_:\))

Configures subscription store view instances within a view to use the provided
button label.

[`func
subscriptionStoreControlBackground(_:)`](/documentation/swiftui/view/subscriptionstorecontrolbackground\(_:\))

Set a standard effect to use for the background of subscription store view
controls within the view.

[`func subscriptionStoreControlIcon(icon: (Product, Product.SubscriptionInfo)
-> some View) -> some
View`](/documentation/swiftui/view/subscriptionstorecontrolicon\(icon:\))

Sets a view to use to decorate individual subscription options within a
subscription store view.

[`func subscriptionStoreControlStyle(some SubscriptionStoreControlStyle) ->
some View`](/documentation/swiftui/view/subscriptionstorecontrolstyle\(_:\))

Sets the control style for subscription store views within a view.

[`func subscriptionStoreControlStyle<S>(S, placement: S.Placement) -> some
View`](/documentation/swiftui/view/subscriptionstorecontrolstyle\(_:placement:\))

Sets the control style and control placement for subscription store views
within a view.

[`func subscriptionStoreOptionGroupStyle(some SubscriptionOptionGroupStyle) ->
some
View`](/documentation/swiftui/view/subscriptionstoreoptiongroupstyle\(_:\))

Sets the style subscription store views within this view use to display groups
of subscription options.

[`func subscriptionStorePickerItemBackground(some ShapeStyle) -> some
View`](/documentation/swiftui/view/subscriptionstorepickeritembackground\(_:\))

Sets the background style for picker items of the subscription store view
instances within a view.

[`func subscriptionStorePickerItemBackground(some ShapeStyle, in: some Shape)
-> some
View`](/documentation/swiftui/view/subscriptionstorepickeritembackground\(_:in:\))

Sets the background shape and style for subscription store view picker items
within a view.

[`func subscriptionStorePolicyDestination(for: SubscriptionStorePolicyKind,
destination: () -> some View) -> some
View`](/documentation/swiftui/view/subscriptionstorepolicydestination\(for:destination:\))

Configures a view as the destination for a policy button action in
subscription store views.

[`func subscriptionStorePolicyDestination(url: URL, for:
SubscriptionStorePolicyKind) -> some
View`](/documentation/swiftui/view/subscriptionstorepolicydestination\(url:for:\))

Configures a URL as the destination for a policy button action in subscription
store views.

[`func subscriptionStorePolicyForegroundStyle(some ShapeStyle) -> some
View`](/documentation/swiftui/view/subscriptionstorepolicyforegroundstyle\(_:\))

Sets the style for the terms of service and privacy policy buttons within a
subscription store view.

[`func subscriptionStorePolicyForegroundStyle(some ShapeStyle, some
ShapeStyle) -> some
View`](/documentation/swiftui/view/subscriptionstorepolicyforegroundstyle\(_:_:\))

Sets the primary and secondary style for the terms of service and privacy
policy buttons within a subscription store view.

[`func subscriptionStoreSignInAction((() -> ())?) -> some
View`](/documentation/swiftui/view/subscriptionstoresigninaction\(_:\))

Adds an action to perform when a person uses the sign-in button on a
subscription store view within a view.

[`func symbolColorRenderingMode(SymbolColorRenderingMode?) -> some
View`](/documentation/swiftui/view/symbolcolorrenderingmode\(_:\))

Sets the color rendering mode for symbol images.

[`func symbolVariableValueMode(SymbolVariableValueMode?) -> some
View`](/documentation/swiftui/view/symbolvariablevaluemode\(_:\))

Sets the variable value mode mode for symbol images within this view.

[`func tabBarMinimizeBehavior(TabBarMinimizeBehavior) -> some
View`](/documentation/swiftui/view/tabbarminimizebehavior\(_:\))

Sets the behavior for tab bar minimization.

[`func tabViewBottomAccessory<Content>(content: () -> Content) -> some
View`](/documentation/swiftui/view/tabviewbottomaccessory\(content:\))

[`func tabViewSearchActivation(TabSearchActivation) -> some
View`](/documentation/swiftui/view/tabviewsearchactivation\(_:\))

Configures the activation and deactivation behavior of search in the search
tab.

[`func tabletopGame(TabletopGame, parent: Entity, automaticUpdate: Bool) ->
some
View`](/documentation/swiftui/view/tabletopgame\(_:parent:automaticupdate:\))

Adds a tabletop game to a view.

[`func tabletopGame(TabletopGame, parent: Entity, automaticUpdate: Bool,
interaction: (TabletopInteraction.Value) -> any TabletopInteraction.Delegate)
-> some
View`](/documentation/swiftui/view/tabletopgame\(_:parent:automaticupdate:interaction:\))

Supplies a closure which returns a new interaction whenever needed.

[`func task<T>(id: T, name: String?, executorPreference: any TaskExecutor,
priority: TaskPriority, file: String, line: Int, sending () async -> Void) ->
some
View`](/documentation/swiftui/view/task\(id:name:executorpreference:priority:file:line:_:\))

Adds a task to perform before this view appears or when a specified value
changes.

Beta

[`func
textContentType(_:)`](/documentation/swiftui/view/textcontenttype\(_:\))

Sets the text content type for this view, which the system uses to offer
suggestions while the user enters text on macOS.

[`func textInputFormattingControlVisibility(Visibility, for:
TextInputFormattingControlPlacement.Set) -> some
View`](/documentation/swiftui/view/textinputformattingcontrolvisibility\(_:for:\))

Define which system text formatting controls are available.

[`func textRenderer<T>(T) -> some
View`](/documentation/swiftui/view/textrenderer\(_:\))

Returns a new view such that any text views within it will use `renderer` to
draw themselves.

[`func textSelectionAffinity(TextSelectionAffinity) -> some
View`](/documentation/swiftui/view/textselectionaffinity\(_:\))

Sets the direction of a selection or cursor relative to a text character.

[`func tipAnchor<AnchorID>(AnchorID) -> some
View`](/documentation/swiftui/view/tipanchor\(_:\))

Sets a value for the specified tip anchor to be used to anchor a tip view to
the `.bounds` of the view.

[`func tipBackground<S>(S) -> some
View`](/documentation/swiftui/view/tipbackground\(_:\))

Sets the tip’s view background to a style. Currently this only applies to
inline tips, not popover tips.

[`func tipBackgroundInteraction(PresentationBackgroundInteraction) -> some
View`](/documentation/swiftui/view/tipbackgroundinteraction\(_:\))

Controls whether people can interact with the view behind a presented tip.

[`func tipCornerRadius(CGFloat, antialiased: Bool) -> some
View`](/documentation/swiftui/view/tipcornerradius\(_:antialiased:\))

Sets the corner radius for an inline tip view.

[`func tipImageSize(CGSize) -> some
View`](/documentation/swiftui/view/tipimagesize\(_:\))

Sets the size for a tip’s image.

[`func tipImageStyle<S>(S) -> some
View`](/documentation/swiftui/view/tipimagestyle\(_:\))

Sets the style for a tip’s image.

[`func tipImageStyle<S1, S2>(S1, S2) -> some
View`](/documentation/swiftui/view/tipimagestyle\(_:_:\))

Sets the style for a tip’s image.

[`func tipImageStyle<S1, S2, S3>(S1, S2, S3) -> some
View`](/documentation/swiftui/view/tipimagestyle\(_:_:_:\))

Sets the style for a tip’s image.

[`func tipViewStyle(some TipViewStyle) -> some
View`](/documentation/swiftui/view/tipviewstyle\(_:\))

Sets the given style for TipView within the view hierarchy.

[`func toolbarItemHidden(Bool) -> some
View`](/documentation/swiftui/view/toolbaritemhidden\(_:\))

Hides an individual view within a control group toolbar item.

[`func transactionPicker(isPresented: Binding<Bool>, selection:
Binding<[Transaction]>) -> some
View`](/documentation/swiftui/view/transactionpicker\(ispresented:selection:\))

Presents a picker that selects a collection of transactions.

[`func transactionTask(CredentialTransaction.Configuration?, action:
(CredentialTransaction) async -> Void) -> some
View`](/documentation/swiftui/view/transactiontask\(_:action:\))

Provides a task to perform before this view appears

[`func translationPresentation(isPresented: Binding<Bool>, text: String,
attachmentAnchor: PopoverAttachmentAnchor, arrowEdge: Edge, replacementAction:
((String) -> Void)?) -> some
View`](/documentation/swiftui/view/translationpresentation\(ispresented:text:attachmentanchor:arrowedge:replacementaction:\))

Presents a translation popover when a given condition is true.

[`func translationTask(TranslationSession.Configuration?, action:
(TranslationSession) async -> Void) -> some
View`](/documentation/swiftui/view/translationtask\(_:action:\))

Adds a task to perform before this view appears or when the translation
configuration changes.

[`func translationTask(source: Locale.Language?, target: Locale.Language?,
action: (TranslationSession) async -> Void) -> some
View`](/documentation/swiftui/view/translationtask\(source:target:action:\))

Adds a task to perform before this view appears or when the specified source
or target languages change.

[`func
verifyIdentityWithWalletButtonStyle(VerifyIdentityWithWalletButtonStyle) ->
some
View`](/documentation/swiftui/view/verifyidentitywithwalletbuttonstyle\(_:\))

Sets the style to be used by the button. (see `PKIdentityButtonStyle`).

[`func
webViewBackForwardNavigationGestures(WebView.BackForwardNavigationGesturesBehavior)
-> some
View`](/documentation/swiftui/view/webviewbackforwardnavigationgestures\(_:\))

Determines whether horizontal swipe gestures trigger backward and forward page
navigation.

[`func webViewContentBackground(Visibility) -> some
View`](/documentation/swiftui/view/webviewcontentbackground\(_:\))

Specifies the visibility of the webpage’s natural background color within this
view.

[`func webViewContextMenu(menu: (WebView.ActivatedElementInfo) -> some View)
-> some View`](/documentation/swiftui/view/webviewcontextmenu\(menu:\))

Adds an item-based context menu to a WebView, replacing the default set of
context menu items.

[`func webViewElementFullscreenBehavior(WebView.ElementFullscreenBehavior) ->
some
View`](/documentation/swiftui/view/webviewelementfullscreenbehavior\(_:\))

Determines whether a web view can display content full screen.

[`func webViewLinkPreviews(WebView.LinkPreviewBehavior) -> some
View`](/documentation/swiftui/view/webviewlinkpreviews\(_:\))

Determines whether pressing a link displays a preview of the destination for
the link.

[`func webViewMagnificationGestures(WebView.MagnificationGesturesBehavior) ->
some View`](/documentation/swiftui/view/webviewmagnificationgestures\(_:\))

Determines whether magnify gestures change the view’s magnification.

[`func webViewOnScrollGeometryChange<T>(for: T.Type, of: (ScrollGeometry) ->
T, action: (T, T) -> Void) -> some
View`](/documentation/swiftui/view/webviewonscrollgeometrychange\(for:of:action:\))

Adds an action to be performed when a value, created from a scroll geometry,
changes.

[`func webViewScrollInputBehavior(ScrollInputBehavior, for: ScrollInputKind)
-> some
View`](/documentation/swiftui/view/webviewscrollinputbehavior\(_:for:\))

Enables or disables scrolling in web views when using particular inputs.

[`func webViewScrollPosition(Binding<ScrollPosition>) -> some
View`](/documentation/swiftui/view/webviewscrollposition\(_:\))

Associates a binding to a scroll position with the web view.

[`func webViewTextSelection<S>(S) -> some
View`](/documentation/swiftui/view/webviewtextselection\(_:\))

Determines whether to allow people to select or otherwise interact with text.

[`func windowResizeAnchor(UnitPoint?) -> some
View`](/documentation/swiftui/view/windowresizeanchor\(_:\))

Sets the window anchor point used when the size of the view changes such that
the window must resize.

[`func windowToolbarFullScreenVisibility(WindowToolbarFullScreenVisibility) ->
some
View`](/documentation/swiftui/view/windowtoolbarfullscreenvisibility\(_:\))

Configures the visibility of the window toolbar when the window enters full
screen mode.

[`func workoutPreview(WorkoutPlan, isPresented: Binding<Bool>) -> some
View`](/documentation/swiftui/view/workoutpreview\(_:ispresented:\))

Presents a preview of the workout contents as a modal sheet

[`func writingDirection(strategy: Text.WritingDirectionStrategy) -> some
View`](/documentation/swiftui/view/writingdirection\(strategy:\))

A modifier for the default text writing direction strategy in the view
hierarchy.

[`func writingToolsAffordanceVisibility(Visibility) -> some
View`](/documentation/swiftui/view/writingtoolsaffordancevisibility\(_:\))

Specifies whether the system should show the Writing Tools affordance for text
input views affected by the environment.

[`func writingToolsBehavior(WritingToolsBehavior) -> some
View`](/documentation/swiftui/view/writingtoolsbehavior\(_:\))

Specifies the Writing Tools behavior for text and text input in the
environment.

## [Relationships](/documentation/swiftui/view#relationships)

### [Inherited By](/documentation/swiftui/view#inherited-by)

  * [`DynamicViewContent`](/documentation/swiftui/dynamicviewcontent)
  * [`InsettableShape`](/documentation/swiftui/insettableshape)
  * [`NSViewControllerRepresentable`](/documentation/swiftui/nsviewcontrollerrepresentable)
  * [`NSViewRepresentable`](/documentation/swiftui/nsviewrepresentable)
  * [`RoundedRectangularShape`](/documentation/swiftui/roundedrectangularshape)
  * [`Shape`](/documentation/swiftui/shape)
  * [`ShapeView`](/documentation/swiftui/shapeview)
  * [`UIViewControllerRepresentable`](/documentation/swiftui/uiviewcontrollerrepresentable)
  * [`UIViewRepresentable`](/documentation/swiftui/uiviewrepresentable)
  * [`WKInterfaceObjectRepresentable`](/documentation/swiftui/wkinterfaceobjectrepresentable)

### [Conforming Types](/documentation/swiftui/view#conforming-types)

  * [`AngularGradient`](/documentation/swiftui/angulargradient)
  * [`AnyShape`](/documentation/swiftui/anyshape)
  * [`AnyView`](/documentation/swiftui/anyview)
  * [`AsyncImage`](/documentation/swiftui/asyncimage)
  * [`Button`](/documentation/swiftui/button)
  * [`ButtonBorderShape`](/documentation/swiftui/buttonbordershape)
  * [`ButtonStyleConfiguration.Label`](/documentation/swiftui/buttonstyleconfiguration/label-swift.struct)
  * [`Canvas`](/documentation/swiftui/canvas)

Conforms when `Symbols` conforms to `View`.

  * [`Capsule`](/documentation/swiftui/capsule)
  * [`Circle`](/documentation/swiftui/circle)
  * [`Color`](/documentation/swiftui/color)
  * [`ColorPicker`](/documentation/swiftui/colorpicker)
  * [`ConcentricRectangle`](/documentation/swiftui/concentricrectangle)
  * [`ContainerRelativeShape`](/documentation/swiftui/containerrelativeshape)
  * [`ContentUnavailableView`](/documentation/swiftui/contentunavailableview)
  * [`ControlGroup`](/documentation/swiftui/controlgroup)
  * [`ControlGroupStyleConfiguration.Content`](/documentation/swiftui/controlgroupstyleconfiguration/content-swift.struct)
  * [`ControlGroupStyleConfiguration.Label`](/documentation/swiftui/controlgroupstyleconfiguration/label-swift.struct)
  * [`DatePicker`](/documentation/swiftui/datepicker)
  * [`DatePickerStyleConfiguration.Label`](/documentation/swiftui/datepickerstyleconfiguration/label-swift.struct)
  * [`DebugReplaceableView`](/documentation/swiftui/debugreplaceableview)
  * [`DefaultButtonLabel`](/documentation/swiftui/defaultbuttonlabel)
  * [`DefaultDateProgressLabel`](/documentation/swiftui/defaultdateprogresslabel)
  * [`DefaultDocumentGroupLaunchActions`](/documentation/swiftui/defaultdocumentgrouplaunchactions)
  * [`DefaultGlassEffectShape`](/documentation/swiftui/defaultglasseffectshape)
  * [`DefaultSettingsLinkLabel`](/documentation/swiftui/defaultsettingslinklabel)
  * [`DefaultShareLinkLabel`](/documentation/swiftui/defaultsharelinklabel)
  * [`DefaultTabLabel`](/documentation/swiftui/defaulttablabel)
  * [`DefaultWindowVisibilityToggleLabel`](/documentation/swiftui/defaultwindowvisibilitytogglelabel)
  * [`DisclosureGroup`](/documentation/swiftui/disclosuregroup)
  * [`DisclosureGroupStyleConfiguration.Content`](/documentation/swiftui/disclosuregroupstyleconfiguration/content-swift.struct)
  * [`DisclosureGroupStyleConfiguration.Label`](/documentation/swiftui/disclosuregroupstyleconfiguration/label-swift.struct)
  * [`Divider`](/documentation/swiftui/divider)
  * [`DocumentLaunchView`](/documentation/swiftui/documentlaunchview)
  * [`EditButton`](/documentation/swiftui/editbutton)
  * [`EditableCollectionContent`](/documentation/swiftui/editablecollectioncontent)

Conforms when `Content` conforms to `View`, `Data` conforms to `Copyable`, and
`Data` conforms to `Escapable`.

  * [`Ellipse`](/documentation/swiftui/ellipse)
  * [`EllipticalGradient`](/documentation/swiftui/ellipticalgradient)
  * [`EmptyView`](/documentation/swiftui/emptyview)
  * [`EquatableView`](/documentation/swiftui/equatableview)
  * [`FillShapeView`](/documentation/swiftui/fillshapeview)
  * [`ForEach`](/documentation/swiftui/foreach)

Conforms when `Data` conforms to `RandomAccessCollection`, `ID` conforms to
`Hashable`, and `Content` conforms to `View`.

  * [`Form`](/documentation/swiftui/form)
  * [`FormStyleConfiguration.Content`](/documentation/swiftui/formstyleconfiguration/content-swift.struct)
  * [`Gauge`](/documentation/swiftui/gauge)
  * [`GaugeStyleConfiguration.CurrentValueLabel`](/documentation/swiftui/gaugestyleconfiguration/currentvaluelabel-swift.struct)
  * [`GaugeStyleConfiguration.Label`](/documentation/swiftui/gaugestyleconfiguration/label-swift.struct)
  * [`GaugeStyleConfiguration.MarkedValueLabel`](/documentation/swiftui/gaugestyleconfiguration/markedvaluelabel)
  * [`GaugeStyleConfiguration.MaximumValueLabel`](/documentation/swiftui/gaugestyleconfiguration/maximumvaluelabel-swift.struct)
  * [`GaugeStyleConfiguration.MinimumValueLabel`](/documentation/swiftui/gaugestyleconfiguration/minimumvaluelabel-swift.struct)
  * [`GeometryReader`](/documentation/swiftui/geometryreader)
  * [`GeometryReader3D`](/documentation/swiftui/geometryreader3d)
  * [`GlassBackgroundEffectConfiguration.Content`](/documentation/swiftui/glassbackgroundeffectconfiguration/content-swift.struct)
  * [`GlassEffectContainer`](/documentation/swiftui/glasseffectcontainer)
  * [`Grid`](/documentation/swiftui/grid)

Conforms when `Content` conforms to `View`.

  * [`GridRow`](/documentation/swiftui/gridrow)

Conforms when `Content` conforms to `View`.

  * [`Group`](/documentation/swiftui/group)

Conforms when `Content` conforms to `View`.

  * [`GroupBox`](/documentation/swiftui/groupbox)
  * [`GroupBoxStyleConfiguration.Content`](/documentation/swiftui/groupboxstyleconfiguration/content-swift.struct)
  * [`GroupBoxStyleConfiguration.Label`](/documentation/swiftui/groupboxstyleconfiguration/label-swift.struct)
  * [`GroupElementsOfContent`](/documentation/swiftui/groupelementsofcontent)
  * [`GroupSectionsOfContent`](/documentation/swiftui/groupsectionsofcontent)
  * [`HSplitView`](/documentation/swiftui/hsplitview)
  * [`HStack`](/documentation/swiftui/hstack)
  * [`HelpLink`](/documentation/swiftui/helplink)
  * [`Image`](/documentation/swiftui/image)
  * [`KeyframeAnimator`](/documentation/swiftui/keyframeanimator)
  * [`Label`](/documentation/swiftui/label)
  * [`LabelStyleConfiguration.Icon`](/documentation/swiftui/labelstyleconfiguration/icon-swift.struct)
  * [`LabelStyleConfiguration.Title`](/documentation/swiftui/labelstyleconfiguration/title-swift.struct)
  * [`LabeledContent`](/documentation/swiftui/labeledcontent)

Conforms when `Label` conforms to `View` and `Content` conforms to `View`.

  * [`LabeledContentStyleConfiguration.Content`](/documentation/swiftui/labeledcontentstyleconfiguration/content-swift.struct)
  * [`LabeledContentStyleConfiguration.Label`](/documentation/swiftui/labeledcontentstyleconfiguration/label-swift.struct)
  * [`LabeledControlGroupContent`](/documentation/swiftui/labeledcontrolgroupcontent)
  * [`LabeledToolbarItemGroupContent`](/documentation/swiftui/labeledtoolbaritemgroupcontent)
  * [`LazyHGrid`](/documentation/swiftui/lazyhgrid)
  * [`LazyHStack`](/documentation/swiftui/lazyhstack)
  * [`LazyVGrid`](/documentation/swiftui/lazyvgrid)
  * [`LazyVStack`](/documentation/swiftui/lazyvstack)
  * [`LinearGradient`](/documentation/swiftui/lineargradient)
  * [`Link`](/documentation/swiftui/link)
  * [`List`](/documentation/swiftui/list)
  * [`Menu`](/documentation/swiftui/menu)
  * [`MenuButton`](/documentation/swiftui/menubutton)
  * [`MenuStyleConfiguration.Content`](/documentation/swiftui/menustyleconfiguration/content)
  * [`MenuStyleConfiguration.Label`](/documentation/swiftui/menustyleconfiguration/label)
  * [`MeshGradient`](/documentation/swiftui/meshgradient)
  * [`ModifiedContent`](/documentation/swiftui/modifiedcontent)

Conforms when `Content` conforms to `View` and `Modifier` conforms to
`ViewModifier`.

  * [`MultiDatePicker`](/documentation/swiftui/multidatepicker)
  * [`NavigationLink`](/documentation/swiftui/navigationlink)
  * [`NavigationSplitView`](/documentation/swiftui/navigationsplitview)
  * [`NavigationStack`](/documentation/swiftui/navigationstack)
  * [`NavigationView`](/documentation/swiftui/navigationview)
  * [`NewDocumentButton`](/documentation/swiftui/newdocumentbutton)
  * [`OffsetShape`](/documentation/swiftui/offsetshape)
  * [`OutlineGroup`](/documentation/swiftui/outlinegroup)

Conforms when `Data` conforms to `RandomAccessCollection`, `ID` conforms to
`Hashable`, `Parent` conforms to `View`, `Leaf` conforms to `View`, and
`Subgroup` conforms to `View`.

  * [`OutlineSubgroupChildren`](/documentation/swiftui/outlinesubgroupchildren)
  * [`PasteButton`](/documentation/swiftui/pastebutton)
  * [`Path`](/documentation/swiftui/path)
  * [`PhaseAnimator`](/documentation/swiftui/phaseanimator)
  * [`Picker`](/documentation/swiftui/picker)
  * [`PlaceholderContentView`](/documentation/swiftui/placeholdercontentview)
  * [`PresentedWindowContent`](/documentation/swiftui/presentedwindowcontent)
  * [`PreviewModifierContent`](/documentation/swiftui/previewmodifiercontent)
  * [`PrimitiveButtonStyleConfiguration.Label`](/documentation/swiftui/primitivebuttonstyleconfiguration/label-swift.struct)
  * [`ProgressView`](/documentation/swiftui/progressview)
  * [`ProgressViewStyleConfiguration.CurrentValueLabel`](/documentation/swiftui/progressviewstyleconfiguration/currentvaluelabel-swift.struct)
  * [`ProgressViewStyleConfiguration.Label`](/documentation/swiftui/progressviewstyleconfiguration/label-swift.struct)
  * [`RadialGradient`](/documentation/swiftui/radialgradient)
  * [`Rectangle`](/documentation/swiftui/rectangle)
  * [`RenameButton`](/documentation/swiftui/renamebutton)
  * [`RotatedShape`](/documentation/swiftui/rotatedshape)
  * [`RoundedRectangle`](/documentation/swiftui/roundedrectangle)
  * [`ScaledShape`](/documentation/swiftui/scaledshape)
  * [`ScrollView`](/documentation/swiftui/scrollview)
  * [`ScrollViewReader`](/documentation/swiftui/scrollviewreader)
  * [`SearchUnavailableContent.Actions`](/documentation/swiftui/searchunavailablecontent/actions)
  * [`SearchUnavailableContent.Description`](/documentation/swiftui/searchunavailablecontent/description)
  * [`SearchUnavailableContent.Label`](/documentation/swiftui/searchunavailablecontent/label)
  * [`Section`](/documentation/swiftui/section)

Conforms when `Parent` conforms to `View`, `Content` conforms to `View`, and
`Footer` conforms to `View`.

  * [`SectionConfiguration.Actions`](/documentation/swiftui/sectionconfiguration/actions-swift.struct)
  * [`SecureField`](/documentation/swiftui/securefield)
  * [`SettingsLink`](/documentation/swiftui/settingslink)
  * [`ShareLink`](/documentation/swiftui/sharelink)
  * [`Slider`](/documentation/swiftui/slider)
  * [`Spacer`](/documentation/swiftui/spacer)
  * [`Stepper`](/documentation/swiftui/stepper)
  * [`StrokeBorderShapeView`](/documentation/swiftui/strokebordershapeview)
  * [`StrokeShapeView`](/documentation/swiftui/strokeshapeview)
  * [`SubscriptionView`](/documentation/swiftui/subscriptionview)
  * [`Subview`](/documentation/swiftui/subview)
  * [`SubviewsCollection`](/documentation/swiftui/subviewscollection)
  * [`SubviewsCollectionSlice`](/documentation/swiftui/subviewscollectionslice)
  * [`TabContentBuilder.Content`](/documentation/swiftui/tabcontentbuilder/content)
  * [`TabView`](/documentation/swiftui/tabview)
  * [`Table`](/documentation/swiftui/table)
  * [`Text`](/documentation/swiftui/text)
  * [`TextEditor`](/documentation/swiftui/texteditor)
  * [`TextField`](/documentation/swiftui/textfield)
  * [`TextFieldLink`](/documentation/swiftui/textfieldlink)
  * [`TimelineView`](/documentation/swiftui/timelineview)

Conforms when `Schedule` conforms to `TimelineSchedule` and `Content` conforms
to `View`.

  * [`Toggle`](/documentation/swiftui/toggle)
  * [`ToggleStyleConfiguration.Label`](/documentation/swiftui/togglestyleconfiguration/label-swift.struct)
  * [`TransformedShape`](/documentation/swiftui/transformedshape)
  * [`TupleView`](/documentation/swiftui/tupleview)
  * [`UnevenRoundedRectangle`](/documentation/swiftui/unevenroundedrectangle)
  * [`VSplitView`](/documentation/swiftui/vsplitview)
  * [`VStack`](/documentation/swiftui/vstack)
  * [`ViewThatFits`](/documentation/swiftui/viewthatfits)
  * [`WindowVisibilityToggle`](/documentation/swiftui/windowvisibilitytoggle)
  * [`ZStack`](/documentation/swiftui/zstack)
  * [`ZStackContent3D`](/documentation/swiftui/zstackcontent3d)

Conforms when `Content` conforms to `View`.

## [See Also](/documentation/swiftui/view#see-also)

### [Creating a view](/documentation/swiftui/view#Creating-a-view)

[Declaring a custom view](/documentation/swiftui/declaring-a-custom-view)

Define views and assemble them into a view hierarchy.

[`struct ViewBuilder`](/documentation/swiftui/viewbuilder)

A custom parameter attribute that constructs views from closures.

