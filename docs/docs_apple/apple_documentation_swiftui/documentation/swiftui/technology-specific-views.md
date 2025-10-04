Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Technology-specific views 

API Collection

# Technology-specific views

Use SwiftUI views that other Apple frameworks provide.

## [Overview](/documentation/swiftui/technology-specific-views#Overview)

To access SwiftUI views that another framework defines, import both SwiftUI
and the other framework into the file where you use the view. You can find the
framework to import by looking at the availability information on the view’s
documentation page.

For example, to use the [`Map`](/documentation/MapKit/Map) view in your app,
import both SwiftUI and MapKit.

    
    
    import SwiftUI
    import MapKit
    
    
    struct MyMapView: View {
        // Center the map on Joshua Tree National Park.
        var region = MKCoordinateRegion(
                center: CLLocationCoordinate2D(latitude: 34.011_286, longitude: -116.166_868),
                span: MKCoordinateSpan(latitudeDelta: 0.2, longitudeDelta: 0.2)
            )
    
    
        var body: some View {
            Map(initialPosition: .region(region))
        }
    }
    

For design guidance, see [Technologies](/design/Human-Interface-
Guidelines/technologies) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/technology-specific-views#topics)

### [Displaying web content](/documentation/swiftui/technology-specific-
views#Displaying-web-content)

[`@MainActor @preconcurrency struct WebView`](/documentation/WebKit/WebView-
swift.struct)

A view that displays some web content.

[`@MainActor final class WebPage`](/documentation/WebKit/WebPage)

An object that controls and manages the behavior of interactive web content.

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

### [Accessing Apple Pay and Wallet](/documentation/swiftui/technology-
specific-views#Accessing-Apple-Pay-and-Wallet)

[`@MainActor @preconcurrency struct PayWithApplePayButton<Fallback> where
Fallback : View`](/documentation/PassKit/PayWithApplePayButton)

A type that provides a button to pay with Apple pay.

[`@MainActor @preconcurrency struct AddPassToWalletButton<Fallback> where
Fallback : View`](/documentation/PassKit/AddPassToWalletButton)

A type that provides a button that enables people to add a new or existing
pass to Apple Wallet.

[`@MainActor @preconcurrency struct VerifyIdentityWithWalletButton<Fallback>
where Fallback : View`](/documentation/PassKit/VerifyIdentityWithWalletButton)

A type that displays a button to present the identity verification flow.

[`func addOrderToWalletButtonStyle(AddOrderToWalletButtonStyle) -> some
View`](/documentation/swiftui/view/addordertowalletbuttonstyle\(_:\))

Sets the button’s style.

[`func addPassToWalletButtonStyle(AddPassToWalletButtonStyle) -> some
View`](/documentation/swiftui/view/addpasstowalletbuttonstyle\(_:\))

Sets the style to be used by the button. (see `PKAddPassButtonStyle`).

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

[`func payLaterViewAction(PayLaterViewAction) -> some
View`](/documentation/swiftui/view/paylaterviewaction\(_:\))

Sets the action on the PayLaterView. See `PKPayLaterAction`.

[`func payLaterViewDisplayStyle(PayLaterViewDisplayStyle) -> some
View`](/documentation/swiftui/view/paylaterviewdisplaystyle\(_:\))

Sets the display style on the PayLaterView. See `PKPayLaterDisplayStyle`.

[`func payWithApplePayButtonStyle(PayWithApplePayButtonStyle) -> some
View`](/documentation/swiftui/view/paywithapplepaybuttonstyle\(_:\))

Sets the style to be used by the button. (see `PayWithApplePayButtonStyle`).

[`func
verifyIdentityWithWalletButtonStyle(VerifyIdentityWithWalletButtonStyle) ->
some
View`](/documentation/swiftui/view/verifyidentitywithwalletbuttonstyle\(_:\))

Sets the style to be used by the button. (see `PKIdentityButtonStyle`).

[`@MainActor @preconcurrency struct AsyncShareablePassConfiguration<Content>
where Content : View`](/documentation/PassKit/AsyncShareablePassConfiguration)

[`func transactionTask(CredentialTransaction.Configuration?, action:
(CredentialTransaction) async -> Void) -> some
View`](/documentation/swiftui/view/transactiontask\(_:action:\))

Provides a task to perform before this view appears

### [Authorizing and authenticating](/documentation/swiftui/technology-
specific-views#Authorizing-and-authenticating)

[`@MainActor @preconcurrency struct LocalAuthenticationView<Label> where Label
: View`](/documentation/LocalAuthentication/LocalAuthenticationView)

A SwiftUI view that displays an authentication interface.

[`@MainActor @preconcurrency struct
SignInWithAppleButton`](/documentation/AuthenticationServices/SignInWithAppleButton)

A SwiftUI view that creates the Sign in with Apple button for display.

[`func signInWithAppleButtonStyle(SignInWithAppleButton.Style) -> some
View`](/documentation/swiftui/view/signinwithapplebuttonstyle\(_:\))

Sets the style used for displaying the control (see
`SignInWithAppleButton.Style`).

[`var authorizationController:
AuthorizationController`](/documentation/swiftui/environmentvalues/authorizationcontroller)

A value provided in the SwiftUI environment that views can use to perform
authorization requests.

[`var webAuthenticationSession:
WebAuthenticationSession`](/documentation/swiftui/environmentvalues/webauthenticationsession)

A value provided in the SwiftUI environment that views can use to authenticate
a user through a web service.

### [Configuring Family Sharing](/documentation/swiftui/technology-specific-
views#Configuring-Family-Sharing)

[`@MainActor @preconcurrency struct
FamilyActivityPicker`](/documentation/FamilyControls/FamilyActivityPicker)

A view in which users specify applications, web domains, and categories
without revealing their choices to the app.

[`func familyActivityPicker(isPresented: Binding<Bool>, selection:
Binding<FamilyActivitySelection>) -> some
View`](/documentation/swiftui/view/familyactivitypicker\(ispresented:selection:\))

Presents an activity picker view as a sheet.

[`func familyActivityPicker(headerText: String?, footerText: String?,
isPresented: Binding<Bool>, selection: Binding<FamilyActivitySelection>) ->
some
View`](/documentation/swiftui/view/familyactivitypicker\(headertext:footertext:ispresented:selection:\))

Presents an activity picker view as a sheet.

### [Reporting on device activity](/documentation/swiftui/technology-specific-
views#Reporting-on-device-activity)

[`@MainActor @preconcurrency struct
DeviceActivityReport`](/documentation/DeviceActivity/DeviceActivityReport)

A view that reports the user’s application, category, and web domain activity
in a privacy-preserving way.

### [Working with managed devices](/documentation/swiftui/technology-specific-
views#Working-with-managed-devices)

[`func managedContentStyle(ManagedContentStyle) -> some
View`](/documentation/swiftui/view/managedcontentstyle\(_:\))

Applies a managed content style to the view.

[`func automatedDeviceEnrollmentAddition(isPresented: Binding<Bool>) -> some
View`](/documentation/swiftui/view/automateddeviceenrollmentaddition\(ispresented:\))

Presents a modal view that enables users to add devices to their organization.

### [Creating graphics](/documentation/swiftui/technology-specific-
views#Creating-graphics)

[`@MainActor @preconcurrency struct Chart<Content> where Content :
ChartContent`](/documentation/Charts/Chart)

A SwiftUI view that displays a chart.

[`@MainActor @preconcurrency struct
SceneView`](/documentation/SceneKit/SceneView)

A SwiftUI view for displaying 3D SceneKit content.

Deprecated

[`@MainActor @preconcurrency struct
SpriteView`](/documentation/SpriteKit/SpriteView)

A SwiftUI view that renders a SpriteKit scene.

### [Getting location information](/documentation/swiftui/technology-specific-
views#Getting-location-information)

[`@MainActor @preconcurrency struct
LocationButton`](/documentation/CoreLocationUI/LocationButton)

A SwiftUI button that grants one-time location authorization.

[`@MainActor @preconcurrency struct Map<Content> where Content :
View`](/documentation/MapKit/Map)

A view that displays an embedded map interface.

[`func mapStyle(MapStyle) -> some
View`](/documentation/swiftui/view/mapstyle\(_:\))

Specifies the map style to be used.

[`func mapScope(Namespace.ID) -> some
View`](/documentation/swiftui/view/mapscope\(_:\))

Creates a mapScope that SwiftUI uses to connect map controls to an associated
map.

[`func mapFeatureSelectionDisabled((MapFeature) -> Bool) -> some
View`](/documentation/swiftui/view/mapfeatureselectiondisabled\(_:\))

Specifies which map features should have selection disabled.

[`func mapFeatureSelectionAccessory(MapItemDetailSelectionAccessoryStyle?) ->
some View`](/documentation/swiftui/view/mapfeatureselectionaccessory\(_:\))

Specifies the selection accessory to display for a `MapFeature`

[`func mapFeatureSelectionContent(content: (MapFeature) -> some MapContent) ->
some
View`](/documentation/swiftui/view/mapfeatureselectioncontent\(content:\))

Specifies a custom presentation for the currently selected feature.

[`func mapControls(() -> some View) -> some
View`](/documentation/swiftui/view/mapcontrols\(_:\))

Configures all `Map` views in the associated environment to have standard size
and position controls

[`func mapControlVisibility(Visibility) -> some
View`](/documentation/swiftui/view/mapcontrolvisibility\(_:\))

Configures all Map controls in the environment to have the specified
visibility

[`func mapCameraKeyframeAnimator(trigger: some Equatable, keyframes:
(MapCamera) -> some Keyframes<MapCamera>) -> some
View`](/documentation/swiftui/view/mapcamerakeyframeanimator\(trigger:keyframes:\))

Uses the given keyframes to animate the camera of a `Map` when the given
trigger value changes.

[`func lookAroundViewer(isPresented: Binding<Bool>, scene:
Binding<MKLookAroundScene?>, allowsNavigation: Bool, showsRoadLabels: Bool,
pointsOfInterest: PointOfInterestCategories, onDismiss: (() -> Void)?) -> some
View`](/documentation/swiftui/view/lookaroundviewer\(ispresented:scene:allowsnavigation:showsroadlabels:pointsofinterest:ondismiss:\))

[`func lookAroundViewer(isPresented: Binding<Bool>, initialScene:
MKLookAroundScene?, allowsNavigation: Bool, showsRoadLabels: Bool,
pointsOfInterest: PointOfInterestCategories, onDismiss: (() -> Void)?) -> some
View`](/documentation/swiftui/view/lookaroundviewer\(ispresented:initialscene:allowsnavigation:showsroadlabels:pointsofinterest:ondismiss:\))

[`func
onMapCameraChange(frequency:_:)`](/documentation/swiftui/view/onmapcamerachange\(frequency:_:\))

Performs an action when Map camera framing changes

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

### [Displaying media](/documentation/swiftui/technology-specific-
views#Displaying-media)

[`@MainActor @preconcurrency struct
CameraView`](/documentation/HomeKit/CameraView)

A SwiftUI view into which a video stream or an image snapshot is rendered.

[`@MainActor @preconcurrency struct
NowPlayingView`](/documentation/WatchKit/NowPlayingView)

A view that displays the system’s Now Playing interface so that the user can
control audio.

[`@MainActor @preconcurrency struct VideoPlayer<VideoOverlay> where
VideoOverlay : View`](/documentation/AVKit/VideoPlayer)

A view that displays content from a player and a native user interface to
control playback.

[`func continuityDevicePicker(isPresented: Binding<Bool>, onDidConnect:
((AVContinuityDevice?) -> Void)?) -> some
View`](/documentation/swiftui/view/continuitydevicepicker\(ispresented:ondidconnect:\))

A `continuityDevicePicker` should be used to discover and connect nearby
continuity device through a button interface or other form of activation. On
tvOS, this presents a fullscreen continuity device picker experience when
selected. The modal view covers as much the screen of `self` as possible when
a given condition is true.

[`func cameraAnchor(isActive: Bool) -> some
View`](/documentation/swiftui/view/cameraanchor\(isactive:\))

Specifies the view that should act as the virtual camera for Apple Vision Pro
2D Persona stream.

### [Selecting photos](/documentation/swiftui/technology-specific-
views#Selecting-photos)

[`@MainActor @preconcurrency struct PhotosPicker<Label> where Label :
View`](/documentation/PhotosUI/PhotosPicker)

A view that displays a Photos picker for choosing assets from the photo
library.

[`func photosPicker(isPresented: Binding<Bool>, selection:
Binding<PhotosPickerItem?>, matching: PHPickerFilter?, preferredItemEncoding:
PhotosPickerItem.EncodingDisambiguationPolicy) -> some
View`](/documentation/swiftui/view/photospicker\(ispresented:selection:matching:preferreditemencoding:\))

Presents a Photos picker that selects a `PhotosPickerItem`.

[`func photosPicker(isPresented: Binding<Bool>, selection:
Binding<PhotosPickerItem?>, matching: PHPickerFilter?, preferredItemEncoding:
PhotosPickerItem.EncodingDisambiguationPolicy, photoLibrary: PHPhotoLibrary)
-> some
View`](/documentation/swiftui/view/photospicker\(ispresented:selection:matching:preferreditemencoding:photolibrary:\))

Presents a Photos picker that selects a `PhotosPickerItem` from a given photo
library.

[`func photosPicker(isPresented: Binding<Bool>, selection:
Binding<[PhotosPickerItem]>, maxSelectionCount: Int?, selectionBehavior:
PhotosPickerSelectionBehavior, matching: PHPickerFilter?,
preferredItemEncoding: PhotosPickerItem.EncodingDisambiguationPolicy) -> some
View`](/documentation/swiftui/view/photospicker\(ispresented:selection:maxselectioncount:selectionbehavior:matching:preferreditemencoding:\))

Presents a Photos picker that selects a collection of `PhotosPickerItem`.

[`func photosPicker(isPresented: Binding<Bool>, selection:
Binding<[PhotosPickerItem]>, maxSelectionCount: Int?, selectionBehavior:
PhotosPickerSelectionBehavior, matching: PHPickerFilter?,
preferredItemEncoding: PhotosPickerItem.EncodingDisambiguationPolicy,
photoLibrary: PHPhotoLibrary) -> some
View`](/documentation/swiftui/view/photospicker\(ispresented:selection:maxselectioncount:selectionbehavior:matching:preferreditemencoding:photolibrary:\))

Presents a Photos picker that selects a collection of `PhotosPickerItem` from
a given photo library.

[`func photosPickerAccessoryVisibility(Visibility, edges: Edge.Set) -> some
View`](/documentation/swiftui/view/photospickeraccessoryvisibility\(_:edges:\))

Sets the accessory visibility of the Photos picker. Accessories include
anything between the content and the edge, like the navigation bar or the
sidebar.

[`func photosPickerDisabledCapabilities(PHPickerCapabilities) -> some
View`](/documentation/swiftui/view/photospickerdisabledcapabilities\(_:\))

Disables capabilities of the Photos picker.

[`func photosPickerStyle(PhotosPickerStyle) -> some
View`](/documentation/swiftui/view/photospickerstyle\(_:\))

Sets the mode of the Photos picker.

### [Previewing content](/documentation/swiftui/technology-specific-
views#Previewing-content)

[`func quickLookPreview(Binding<URL?>) -> some
View`](/documentation/swiftui/view/quicklookpreview\(_:\))

Presents a Quick Look preview of the contents of a single URL.

[`func quickLookPreview<Items>(Binding<Items.Element?>, in: Items) -> some
View`](/documentation/swiftui/view/quicklookpreview\(_:in:\))

Presents a Quick Look preview of the URLs you provide.

### [Interacting with networked devices](/documentation/swiftui/technology-
specific-views#Interacting-with-networked-devices)

[`@MainActor @preconcurrency struct DevicePicker<Label, Fallback> where Label
: View, Fallback : View`](/documentation/DeviceDiscoveryUI/DevicePicker)

A SwiftUI view that displays other devices on the network, and creates an
encrypted connection to a copy of your app running on that device.

[`var devicePickerSupports:
DevicePickerSupportedAction`](/documentation/swiftui/environmentvalues/devicepickersupports)

Checks for support to present a DevicePicker.

### [Configuring a Live Activity](/documentation/swiftui/technology-specific-
views#Configuring-a-Live-Activity)

[`func activitySystemActionForegroundColor(Color?) -> some
View`](/documentation/swiftui/view/activitysystemactionforegroundcolor\(_:\))

The text color for the auxiliary action button that the system shows next to a
Live Activity on the Lock Screen.

[`func activityBackgroundTint(Color?) -> some
View`](/documentation/swiftui/view/activitybackgroundtint\(_:\))

Sets the tint color for the background of a Live Activity that appears on the
Lock Screen.

[`var isActivityFullscreen:
Bool`](/documentation/swiftui/environmentvalues/isactivityfullscreen)

A Boolean value that indicates whether the Live Activity appears in a full-
screen presentation.

[`var activityFamily:
ActivityFamily`](/documentation/swiftui/environmentvalues/activityfamily)

The size family of the current Live Activity.

### [Interacting with the App Store and Apple
Music](/documentation/swiftui/technology-specific-views#Interacting-with-the-
App-Store-and-Apple-Music)

[`func appStoreOverlay(isPresented: Binding<Bool>, configuration: () ->
SKOverlay.Configuration) -> some
View`](/documentation/swiftui/view/appstoreoverlay\(ispresented:configuration:\))

Presents a StoreKit overlay when a given condition is true.

[`func manageSubscriptionsSheet(isPresented: Binding<Bool>) -> some
View`](/documentation/swiftui/view/managesubscriptionssheet\(ispresented:\))

[`func refundRequestSheet(for: Transaction.ID, isPresented: Binding<Bool>,
onDismiss: ((Result<Transaction.RefundRequestStatus,
Transaction.RefundRequestError>) -> ())?) -> some
View`](/documentation/swiftui/view/refundrequestsheet\(for:ispresented:ondismiss:\))

Display the refund request sheet for the given transaction.

[`func offerCodeRedemption(isPresented: Binding<Bool>, onCompletion:
(Result<Void, any Error>) -> Void) -> some
View`](/documentation/swiftui/view/offercoderedemption\(ispresented:oncompletion:\))

Presents a sheet that enables users to redeem subscription offer codes that
you configure in App Store Connect.

[`func musicSubscriptionOffer(isPresented: Binding<Bool>, options:
MusicSubscriptionOffer.Options, onLoadCompletion: ((any Error)?) -> Void) ->
some
View`](/documentation/swiftui/view/musicsubscriptionoffer\(ispresented:options:onloadcompletion:\))

Initiates the process of presenting a sheet with subscription offers for Apple
Music when the `isPresented` binding is `true`.

[`func currentEntitlementTask(for: String, priority: TaskPriority, action:
(EntitlementTaskState<VerificationResult<Transaction>?>) async -> ()) -> some
View`](/documentation/swiftui/view/currententitlementtask\(for:priority:action:\))

Declares the view as dependent on the entitlement of an In-App Purchase
product, and returns a modified view.

[`func inAppPurchaseOptions(((Product) async -> Set<Product.PurchaseOption>)?)
-> some View`](/documentation/swiftui/view/inapppurchaseoptions\(_:\))

Add a function to call before initiating a purchase from StoreKit view within
this view, providing a set of options for the purchase.

[`func manageSubscriptionsSheet(isPresented: Binding<Bool>,
subscriptionGroupID: String) -> some
View`](/documentation/swiftui/view/managesubscriptionssheet\(ispresented:subscriptiongroupid:\))

[`func onInAppPurchaseCompletion(perform: ((Product,
Result<Product.PurchaseResult, any Error>) async -> ())?) -> some
View`](/documentation/swiftui/view/oninapppurchasecompletion\(perform:\))

Add an action to perform when a purchase initiated from a StoreKit view within
this view completes.

[`func onInAppPurchaseStart(perform: ((Product) async -> ())?) -> some
View`](/documentation/swiftui/view/oninapppurchasestart\(perform:\))

Add an action to perform when a user triggers the purchase button on a
StoreKit view within this view.

[`func productIconBorder() -> some
View`](/documentation/swiftui/view/producticonborder\(\))

Adds a standard border to an in-app purchase product’s icon .

[`func productViewStyle(some ProductViewStyle) -> some
View`](/documentation/swiftui/view/productviewstyle\(_:\))

Sets the style for In-App Purchase product views within a view.

[`func productDescription(Visibility) -> some
View`](/documentation/swiftui/view/productdescription\(_:\))

Configure the visibility of labels displaying an in-app purchase product
description within the view.

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

[`func subscriptionStatusTask(for: String, priority: TaskPriority, action:
(EntitlementTaskState<[Product.SubscriptionInfo.Status]>) async -> ()) -> some
View`](/documentation/swiftui/view/subscriptionstatustask\(for:priority:action:\))

Declares the view as dependent on the status of an auto-renewable subscription
group, and returns a modified view.

[`func subscriptionStoreButtonLabel(SubscriptionStoreButtonLabel) -> some
View`](/documentation/swiftui/view/subscriptionstorebuttonlabel\(_:\))

Configures subscription store view instances within a view to use the provided
button label.

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

[`func
subscriptionStoreControlBackground(_:)`](/documentation/swiftui/view/subscriptionstorecontrolbackground\(_:\))

Set a standard effect to use for the background of subscription store view
controls within the view.

[`func subscriptionPromotionalOffer(offer: (Product, Product.SubscriptionInfo)
-> Product.SubscriptionOffer?, signature: (Product, Product.SubscriptionInfo,
Product.SubscriptionOffer) async throws ->
Product.SubscriptionOffer.Signature) -> some
View`](/documentation/swiftui/view/subscriptionpromotionaloffer\(offer:signature:\))

Selects a promotional offer to apply to a purchase a customer makes from a
subscription store view.

Deprecated

[`func preferredSubscriptionOffer((Product, Product.SubscriptionInfo,
[Product.SubscriptionOffer]) -> Product.SubscriptionOffer?) -> some
View`](/documentation/swiftui/view/preferredsubscriptionoffer\(_:\))

Selects a subscription offer to apply to a purchase that a customer makes from
a subscription store view, a store view, or a product view.

### [Accessing health data](/documentation/swiftui/technology-specific-
views#Accessing-health-data)

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

[`func workoutPreview(WorkoutPlan, isPresented: Binding<Bool>) -> some
View`](/documentation/swiftui/view/workoutpreview\(_:ispresented:\))

Presents a preview of the workout contents as a modal sheet

### [Providing tips](/documentation/swiftui/technology-specific-
views#Providing-tips)

[`func popoverTip((any Tip)?, arrowEdge: Edge?, action: (Tips.Action) -> Void)
-> some View`](/documentation/swiftui/view/popovertip\(_:arrowedge:action:\))

Presents a popover tip on the modified view.

[`func tipBackground<S>(S) -> some
View`](/documentation/swiftui/view/tipbackground\(_:\))

Sets the tip’s view background to a style. Currently this only applies to
inline tips, not popover tips.

[`func tipCornerRadius(CGFloat, antialiased: Bool) -> some
View`](/documentation/swiftui/view/tipcornerradius\(_:antialiased:\))

Sets the corner radius for an inline tip view.

[`func tipImageSize(CGSize) -> some
View`](/documentation/swiftui/view/tipimagesize\(_:\))

Sets the size for a tip’s image.

[`func tipViewStyle(some TipViewStyle) -> some
View`](/documentation/swiftui/view/tipviewstyle\(_:\))

Sets the given style for TipView within the view hierarchy.

[`func tipImageStyle<S>(S) -> some
View`](/documentation/swiftui/view/tipimagestyle\(_:\))

Sets the style for a tip’s image.

[`func tipImageStyle<S1, S2>(S1, S2) -> some
View`](/documentation/swiftui/view/tipimagestyle\(_:_:\))

Sets the style for a tip’s image.

[`func tipImageStyle<S1, S2, S3>(S1, S2, S3) -> some
View`](/documentation/swiftui/view/tipimagestyle\(_:_:_:\))

Sets the style for a tip’s image.

### [Showing a translation](/documentation/swiftui/technology-specific-
views#Showing-a-translation)

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

### [Presenting journaling suggestions](/documentation/swiftui/technology-
specific-views#Presenting-journaling-suggestions)

[`func journalingSuggestionsPicker(isPresented: Binding<Bool>, onCompletion:
(JournalingSuggestion) async -> Void) -> some
View`](/documentation/swiftui/view/journalingsuggestionspicker\(ispresented:oncompletion:\))

Presents a visual picker interface that contains events and images that a
person can select to retrieve more information.

### [Managing contact access](/documentation/swiftui/technology-specific-
views#Managing-contact-access)

[`func contactAccessButtonCaption(ContactAccessButton.Caption) -> some
View`](/documentation/swiftui/view/contactaccessbuttoncaption\(_:\))

[`func contactAccessButtonStyle(ContactAccessButton.Style) -> some
View`](/documentation/swiftui/view/contactaccessbuttonstyle\(_:\))

[`func contactAccessPicker(isPresented: Binding<Bool>, completionHandler:
([String]) -> ()) -> some
View`](/documentation/swiftui/view/contactaccesspicker\(ispresented:completionhandler:\))

Modally present UI which allows the user to select which contacts your app has
access to.

### [Handling game controller events](/documentation/swiftui/technology-
specific-views#Handling-game-controller-events)

[`func handlesGameControllerEvents(matching: GCUIEventTypes) -> some
View`](/documentation/swiftui/view/handlesgamecontrollerevents\(matching:\))

Specifies the game controllers events which should be delivered through the
GameController framework when the view, or one of its descendants has focus.

### [Creating a tabletop game](/documentation/swiftui/technology-specific-
views#Creating-a-tabletop-game)

[`func tabletopGame(TabletopGame, parent: Entity, automaticUpdate: Bool) ->
some
View`](/documentation/swiftui/view/tabletopgame\(_:parent:automaticupdate:\))

Adds a tabletop game to a view.

[`func tabletopGame(TabletopGame, parent: Entity, automaticUpdate: Bool,
interaction: (TabletopInteraction.Value) -> any TabletopInteraction.Delegate)
-> some
View`](/documentation/swiftui/view/tabletopgame\(_:parent:automaticupdate:interaction:\))

Supplies a closure which returns a new interaction whenever needed.

### [Configuring camera controls](/documentation/swiftui/technology-specific-
views#Configuring-camera-controls)

[`var realityViewCameraControls:
CameraControls`](/documentation/swiftui/environmentvalues/realityviewcameracontrols)

The camera controls for the reality view.

[`func realityViewCameraControls(CameraControls) -> some
View`](/documentation/swiftui/view/realityviewcameracontrols\(_:\))

Adds gestures that control the position and direction of a virtual camera.

### [Interacting with transactions](/documentation/swiftui/technology-
specific-views#Interacting-with-transactions)

[`func transactionPicker(isPresented: Binding<Bool>, selection:
Binding<[Transaction]>) -> some
View`](/documentation/swiftui/view/transactionpicker\(ispresented:selection:\))

Presents a picker that selects a collection of transactions.

## [See Also](/documentation/swiftui/technology-specific-views#see-also)

### [Framework integration](/documentation/swiftui/technology-specific-
views#Framework-integration)

[API ReferenceAppKit integration](/documentation/swiftui/appkit-integration)

Add AppKit views to your SwiftUI app, or use SwiftUI views in your AppKit app.

[API ReferenceUIKit integration](/documentation/swiftui/uikit-integration)

Add UIKit views to your SwiftUI app, or use SwiftUI views in your UIKit app.

[API ReferenceWatchKit integration](/documentation/swiftui/watchkit-
integration)

Add WatchKit views to your SwiftUI app, or use SwiftUI views in your WatchKit
app.

