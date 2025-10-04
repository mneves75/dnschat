  * [ Updates ](/documentation/updates)
  * SwiftUI updates 

Article

# SwiftUI updates

Learn about important changes to SwiftUI.

## [Overview](/documentation/Updates/SwiftUI#Overview)

Browse notable changes in [SwiftUI](/documentation/SwiftUI).

## [June 2025](/documentation/Updates/SwiftUI#June-2025)

### [General](/documentation/Updates/SwiftUI#General)

  * Apply Liquid Glass effects to views using doc://com.apple.documentation/documentation/swiftui/view/glasseffect(_:in:isenabled:).

  * Use [`glass`](/documentation/SwiftUI/PrimitiveButtonStyle/glass) with the [`buttonStyle(_:)`](/documentation/SwiftUI/View/buttonStyle\(_:\)-66fbx) modifier to apply Liquid Glass to instances of `Button`.

  * [`ToolbarSpacer`](/documentation/SwiftUI/ToolbarSpacer) creates a visual break between items in toolbars containing Liquid Glass.

  * Use [`scrollEdgeEffectStyle(_:for:)`](/documentation/SwiftUI/View/scrollEdgeEffectStyle\(_:for:\)) to configure the scroll edge effect style for scroll views.

  * [`backgroundExtensionEffect()`](/documentation/SwiftUI/View/backgroundExtensionEffect\(\)) duplicates, mirrors, and blurs views placed around edges with available safe areas.

  * Set behavior for tab bar minimization with [`tabBarMinimizeBehavior(_:)`](/documentation/SwiftUI/View/tabBarMinimizeBehavior\(_:\)).

  * Set the [`search`](/documentation/SwiftUI/TabRole/search) role on a tab to take someone to a search tab and have a search field take the place of the tab bar.

  * Adjust the content of accessory views based on the placement in a tab view with [`TabViewBottomAccessoryPlacement`](/documentation/SwiftUI/TabViewBottomAccessoryPlacement).

  * Connect a [`WebView`](/documentation/WebKit/WebView-swift.struct) with a [`WebPage`](/documentation/WebKit/WebPage) to fully control the browsing experience in your app.

  * Drag multiple items using the doc://com.apple.documentation/documentation/swiftui/view/draggable(_:_:) modifier. Make a view a container for draggable views using the doc://com.apple.documentation/documentation/swiftui/view/dragcontainer(for:id:in:selection:_:) modifier.

  * Use the [`Animatable()`](/documentation/SwiftUI/Animatable\(\)) macro to have SwiftUI synthesize custom animatable data properties.

  * [`Slider`](/documentation/SwiftUI/Slider) now supports tick marks. Tick marks appear automatically when initializing a `Slider` with the `step` parameter.

  * Use [`windowResizeAnchor(_:)`](/documentation/SwiftUI/View/windowResizeAnchor\(_:\)) to set the window anchor point when a window must resize.

### [Text](/documentation/Updates/SwiftUI#Text)

  * [`TextEditor`](/documentation/SwiftUI/TextEditor) now supports [`AttributedString`](/documentation/Foundation/AttributedString).

  * Handle text selection with attributed text using [`AttributedTextSelection`](/documentation/SwiftUI/AttributedTextSelection).

  * [`AttributedTextFormattingDefinition`](/documentation/SwiftUI/AttributedTextFormattingDefinition) defines how text can be styled in specific contexts.

  * Use [`FindContext`](/documentation/SwiftUI/FindContext) to create a find navigator in views that support text editing.

### [Accessibility](/documentation/Updates/SwiftUI#Accessibility)

  * Support Assistive Access in iOS and iPadOS scenes with [`AssistiveAccess`](/documentation/SwiftUI/AssistiveAccess).

### [HDR](/documentation/Updates/SwiftUI#HDR)

  * [`Color.ResolvedHDR`](/documentation/SwiftUI/Color/ResolvedHDR) is a set of RGBA values that represent a color that can be shown, including HDR headroom information.

### [UIKit and AppKit integration](/documentation/Updates/SwiftUI#UIKit-and-
AppKit-integration)

  * Host and present SwiftUI scenes in UIKit with [`UIHostingSceneDelegate`](/documentation/SwiftUI/UIHostingSceneDelegate) and in AppKit with [`NSHostingSceneRepresentation`](/documentation/SwiftUI/NSHostingSceneRepresentation).

  * Incorporate gesture recognizers in SwiftUI views from AppKit with [`NSGestureRecognizerRepresentable`](/documentation/SwiftUI/NSGestureRecognizerRepresentable).

### [Immersive spaces](/documentation/Updates/SwiftUI#Immersive-spaces)

  * Manipulate views using common hand gestures with [`manipulable(coordinateSpace:operations:inertia:isEnabled:onChanged:)`](/documentation/SwiftUI/View/manipulable\(coordinateSpace:operations:inertia:isEnabled:onChanged:\)).

  * Snap volumes to horizontal surfaces and windows to vertical surfaces using [`SurfaceSnappingInfo`](/documentation/SwiftUI/SurfaceSnappingInfo).

  * Use [`RemoteImmersiveSpace`](/documentation/SwiftUI/RemoteImmersiveSpace) to render stereo content from your Mac app on Apple Vision Pro.

  * Use [`SpatialContainer`](/documentation/SwiftUI/SpatialContainer) to create a layout container that aligns overlapping content in 3D space.

  * Depth-based variants of modifiers allow easier volumetric layouts in SwiftUI. For example, [`aspectRatio3D(_:contentMode:)`](/documentation/SwiftUI/View/aspectRatio3D\(_:contentMode:\)), [`rotation3DLayout(_:)`](/documentation/SwiftUI/View/rotation3DLayout\(_:\)), and [`depthAlignment(_:)`](/documentation/SwiftUI/Layout/depthAlignment\(_:\)).

## [June 2024](/documentation/Updates/SwiftUI#June-2024)

### [Volumes](/documentation/Updates/SwiftUI#Volumes)

  * Specify the alignment of a volume when moved in the world using the [`volumeWorldAlignment(_:)`](/documentation/SwiftUI/Scene/volumeWorldAlignment\(_:\)) scene modifier.

  * Specify the default world scaling behavior of your scene using the [`defaultWorldScaling(_:)`](/documentation/SwiftUI/Scene/defaultWorldScaling\(_:\)) scene modifier.

  * Adjust the visibilty of a volume’s baseplate using the [`volumeBaseplateVisibility(_:)`](/documentation/SwiftUI/View/volumeBaseplateVisibility\(_:\)) view modifier.

  * Define a custom action to execute when the viewpoint of a volume changes using the [`onVolumeViewpointChange(updateStrategy:initial:_:)`](/documentation/SwiftUI/View/onVolumeViewpointChange\(updateStrategy:initial:_:\)) view modifier.

### [Windows](/documentation/Updates/SwiftUI#Windows)

  * Change the default initial size and position of a window using the [`defaultWindowPlacement(_:)`](/documentation/SwiftUI/Scene/defaultWindowPlacement\(_:\)) modifier.

  * Change the default behavior for how windows behave when performing a zoom using [`WindowIdealSize`](/documentation/SwiftUI/WindowIdealSize) and provide the placement for the zoomed window with the [`windowIdealPlacement(_:)`](/documentation/SwiftUI/Scene/windowIdealPlacement\(_:\)) modifier.

  * Create utility windows in SwiftUI using the new [`UtilityWindow`](/documentation/SwiftUI/UtilityWindow) scene type and toggle the window’s visibility using the [`WindowVisibilityToggle`](/documentation/SwiftUI/WindowVisibilityToggle).

  * Customize the style of a window using the new [`window`](/documentation/SwiftUI/ContainerBackgroundPlacement/window) container background placement, the [`toolbar(removing:)`](/documentation/SwiftUI/View/toolbar\(removing:\)) view modifier, and the [`plain`](/documentation/SwiftUI/WindowStyle/plain) window style.

  * Set the default launch behavior for a scene using the [`defaultLaunchBehavior(_:)`](/documentation/SwiftUI/Scene/defaultLaunchBehavior\(_:\)) modifier.

  * Replace one scene with another using the [`pushWindow`](/documentation/SwiftUI/EnvironmentValues/pushWindow) method.

### [Immersive spaces](/documentation/Updates/SwiftUI#Immersive-spaces)

  * Add an action to perform when the state of the immersion changes using the [`onImmersionChange(_:)`](/documentation/SwiftUI/View/onImmersionChange\(_:\)) modifier.

  * Apply a custom color or dim a passthrough video in an immersive space using the [`colorMultiply(_:)`](/documentation/SwiftUI/SurroundingsEffect/colorMultiply\(_:\)) and [`dim(intensity:)`](/documentation/SwiftUI/SurroundingsEffect/dim\(intensity:\)) initializers.

### [Documents](/documentation/Updates/SwiftUI#Documents)

  * Customize the launch experience of document-based applications using [`DocumentGroupLaunchScene`](/documentation/SwiftUI/DocumentGroupLaunchScene) and [`NewDocumentButton`](/documentation/SwiftUI/NewDocumentButton).

### [Navigation](/documentation/Updates/SwiftUI#Navigation)

  * Specify the appearance and interaction of [`TabView`](/documentation/SwiftUI/TabView) with the [`tabViewStyle(_:)`](/documentation/SwiftUI/View/tabViewStyle\(_:\)) modifier using values like [`sidebarAdaptable`](/documentation/SwiftUI/TabViewStyle/sidebarAdaptable), [`tabBarOnly`](/documentation/SwiftUI/TabViewStyle/tabBarOnly), and [`grouped`](/documentation/SwiftUI/TabViewStyle/grouped).

  * Build hierarchy by nesting tabs as a tab item within [`TabSection`](/documentation/SwiftUI/TabSection).

  * Enable people to customize a [`TabView`](/documentation/SwiftUI/TabView) using the [`tabViewCustomization(_:)`](/documentation/SwiftUI/View/tabViewCustomization\(_:\)) modifier and persist customization state in [`AppStorage`](/documentation/SwiftUI/AppStorage) with [`TabViewCustomization`](/documentation/SwiftUI/TabViewCustomization).

### [Modal presentations](/documentation/Updates/SwiftUI#Modal-presentations)

  * Use built-in presentation sizes for sheets like [`form`](/documentation/SwiftUI/PresentationSizing/form) or [`page`](/documentation/SwiftUI/PresentationSizing/page) with the [`presentationSizing(_:)`](/documentation/SwiftUI/View/presentationSizing\(_:\)) modifier or create custom sized sheets using the [`PresentationSizing`](/documentation/SwiftUI/PresentationSizing) protocol.

### [Toolbars](/documentation/Updates/SwiftUI#Toolbars)

  * Specify the display mode of toolbars in macOS using the [`ToolbarLabelStyle`](/documentation/SwiftUI/ToolbarLabelStyle) type.

  * Configure the foreground style in the toolbar environment in watchOS using the [`toolbarForegroundStyle(_:for:)`](/documentation/SwiftUI/View/toolbarForegroundStyle\(_:for:\)) view modifier.

  * Anchor ornaments relative to the depth of your volume — in addition to the height and width — using the [`scene(_:)`](/documentation/SwiftUI/OrnamentAttachmentAnchor/scene\(_:\)-1l8wf) method that takes a [`UnitPoint3D`](/documentation/SwiftUI/UnitPoint3D).

### [Views](/documentation/Updates/SwiftUI#Views)

  * Create custom container views like [`Picker`](/documentation/SwiftUI/Picker), [`List`](/documentation/SwiftUI/List), and [`TabView`](/documentation/SwiftUI/TabView) using new [`Group`](/documentation/SwiftUI/Group) and [`ForEach`](/documentation/SwiftUI/ForEach) initializers, like [`init(subviews:transform:)`](/documentation/SwiftUI/Group/init\(subviews:transform:\)) and [`init(subviews:content:)`](/documentation/SwiftUI/ForEach/init\(subviews:content:\)), respectively.

  * Declare a custom container value by defining a key that conforms to the [`ContainerValueKey`](/documentation/SwiftUI/ContainerValueKey) protocol, and set the container value for a view using the [`containerValue(_:_:)`](/documentation/SwiftUI/View/containerValue\(_:_:\)) modifier.

  * Create [`EnvironmentValues`](/documentation/SwiftUI/EnvironmentValues), [`Transaction`](/documentation/SwiftUI/Transaction), [`ContainerValues`](/documentation/SwiftUI/ContainerValues), and [`FocusedValues`](/documentation/SwiftUI/FocusedValues) entries by using the [`Entry()`](/documentation/SwiftUI/Entry\(\)) macro to the variable declaration.

### [Animation](/documentation/Updates/SwiftUI#Animation)

  * Customize the transition when pushing a view onto a navigation stack or presenting a view with the [`navigationTransition(_:)`](/documentation/SwiftUI/View/navigationTransition\(_:\)) view modifier.

  * Add new symbols effects and configurations like [`wiggle`](/documentation/Symbols/SymbolEffect/wiggle), [`rotate`](/documentation/Symbols/SymbolEffect/rotate), and [`breathe`](/documentation/Symbols/SymbolEffect/breathe) using the [`symbolEffect(_:options:value:)`](/documentation/SwiftUI/View/symbolEffect\(_:options:value:\)) modifier.

### [Text input and output](/documentation/Updates/SwiftUI#Text-input-and-
output)

  * Add text suggestions support to any text field using [`textInputSuggestions(_:)`](/documentation/SwiftUI/View/textInputSuggestions\(_:\)) and [`textInputCompletion(_:)`](/documentation/SwiftUI/View/textInputCompletion\(_:\)) view modifiers.

  * Access and modify selected text using a new [`TextSelection`](/documentation/SwiftUI/TextSelection) binding for [`TextField`](/documentation/SwiftUI/TextField) and [`TextEditor`](/documentation/SwiftUI/TextEditor).

  * Bind to the focus state of an app’s search field using the [`searchFocused(_:equals:)`](/documentation/SwiftUI/View/searchFocused\(_:equals:\)) view modifier.

### [Drawing and graphics](/documentation/Updates/SwiftUI#Drawing-and-
graphics)

  * Precompile shaders at build time using the [`compile(as:)`](/documentation/SwiftUI/Shader/compile\(as:\)) method.

  * Create mesh gradients with a grid of points and colors using the new [`MeshGradient`](/documentation/SwiftUI/MeshGradient) type.

  * Extend SwiftUI Text views with custom rendering effects and interaction behaviors using [`TextAttribute`](/documentation/SwiftUI/TextAttribute), [`Text.Layout`](/documentation/SwiftUI/Text/Layout), and [`TextRenderer`](/documentation/SwiftUI/TextRenderer).

  * Create a new [`Color`](/documentation/SwiftUI/Color) by mixing two colors using the [`mix(with:by:in:)`](/documentation/SwiftUI/Color/mix\(with:by:in:\)) method.

### [Layout](/documentation/Updates/SwiftUI#Layout)

  * Enable custom spacing between views in a [`ZStack`](/documentation/SwiftUI/ZStack) along the depth axis with the [`init(alignment:spacing:content:)`](/documentation/SwiftUI/ZStack/init\(alignment:spacing:content:\)) initializer.

### [Scrolling](/documentation/Updates/SwiftUI#Scrolling)

  * Scroll to a view, offset, or edge in a scroll view using the [`scrollPosition(_:anchor:)`](/documentation/SwiftUI/View/scrollPosition\(_:anchor:\)) view modifier and specifying one of the [`ScrollPosition`](/documentation/SwiftUI/ScrollPosition) values.

  * Limit the number of views that can be scrolled by a single interaction using the limit behavior value [`alwaysByFew`](/documentation/SwiftUI/ViewAlignedScrollTargetBehavior/LimitBehavior/alwaysByFew) or [`alwaysByOne`](/documentation/SwiftUI/ViewAlignedScrollTargetBehavior/LimitBehavior/alwaysByOne).

  * Add an action to be called when a view crosses a provided threshold using the [`onScrollVisibilityChange(threshold:_:)`](/documentation/SwiftUI/View/onScrollVisibilityChange\(threshold:_:\)) modifier.

  * Access both the old and new values when a scroll view’s phase changes by using the [`onScrollPhaseChange(_:)`](/documentation/SwiftUI/View/onScrollPhaseChange\(_:\)-7mica) modifier.

### [Gestures](/documentation/Updates/SwiftUI#Gestures)

  * Conditionally disable a gesture using the `isEnabled` parameter in a modifier like [`gesture(_:isEnabled:)`](/documentation/SwiftUI/View/gesture\(_:isEnabled:\)).

  * Create extra drag areas of a window in macOS when you add a [`WindowDragGesture`](/documentation/SwiftUI/WindowDragGesture) gesture.

  * Create a hand gesture shortcut for Double Tap in watchOS using the [`HandGestureShortcut`](/documentation/SwiftUI/HandGestureShortcut) structure.

  * Enable whether gestures can handle events that activate the containing window using the [`allowsWindowActivationEvents(_:)`](/documentation/SwiftUI/View/allowsWindowActivationEvents\(_:\)) view modifier.

### [Input events](/documentation/Updates/SwiftUI#Input-events)

  * Create a group of hover effects that activate together using [`HoverEffectGroup`](/documentation/SwiftUI/HoverEffectGroup) and apply them to a view using the [`hoverEffect(in:isEnabled:body:)`](/documentation/SwiftUI/View/hoverEffect\(in:isEnabled:body:\)) view modifier.

  * Customize the appearance of the system pointer in macOS, iPadOS, and visionOS with new pointer styles using [`pointerStyle(_:)`](/documentation/SwiftUI/View/pointerStyle\(_:\)) or the visibility with the [`pointerVisibility(_:)`](/documentation/SwiftUI/View/pointerVisibility\(_:\)) modifier.

  * Access keyboard modifier flags using the [`onModifierKeysChanged(mask:initial:_:)`](/documentation/SwiftUI/View/onModifierKeysChanged\(mask:initial:_:\)).

  * Replace the primary view with one or more alternative views when pressing a specified set of modifier keys using the [`modifierKeyAlternate(_:_:)`](/documentation/SwiftUI/View/modifierKeyAlternate\(_:_:\)) view modifier.

  * Enable the hand pointer for custom drawing and markup applications using the [`handPointerBehavior(_:)`](/documentation/SwiftUI/View/handPointerBehavior\(_:\)) modifier.

### [Previews in Xcode](/documentation/Updates/SwiftUI#Previews-in-Xcode)

  * Write dynamic properties inline in previews using the new [`Previewable()`](/documentation/SwiftUI/Previewable\(\)) macro.

  * Inject shared environment objects, model containers, or other dependencies into previews using the [`PreviewModifier`](/documentation/SwiftUI/PreviewModifier) protocol.

### [Accessibility](/documentation/Updates/SwiftUI#Accessibility)

  * Specify that your accessibility element behaves as a tab bar using the [`isTabBar`](/documentation/SwiftUI/AccessibilityTraits/isTabBar) accessibility trait with the [`accessibilityAddTraits(_:)`](/documentation/SwiftUI/View/accessibilityAddTraits\(_:\)) modifier. In UIKit, use [`tabBar`](/documentation/UIKit/UIAccessibilityTraits/tabBar).

  * Generate a localized description of a color in a string interpolation by adding `accessibilityName:`, such as `"\(accessibilityName: myColor)"`. Pass that string to any accessibility modifier.

### [Framework interoperability](/documentation/Updates/SwiftUI#Framework-
interoperability)

  * Reuse existing UIKit gesture recognizer code in SwiftUI. In SwiftUI, create UIKit gesture recognizers using [`UIGestureRecognizerRepresentable`](/documentation/SwiftUI/UIGestureRecognizerRepresentable). In UIKit, refer to SwiftUI gestures by name using [`name`](/documentation/UIKit/UIGestureRecognizer/name).

  * Share menu content definitions between SwiftUI and AppKit by using the [`NSHostingMenu`](/documentation/SwiftUI/NSHostingMenu) in your AppKit view hierarchy.

* * *

## [June 2023, visionOS](/documentation/Updates/SwiftUI#June-2023-visionOS)

### [Scenes](/documentation/Updates/SwiftUI#Scenes)

  * Create a volume that can display 3D models by applying the [`volumetric`](/documentation/SwiftUI/WindowStyle/volumetric) window style to an app’s window.

  * Make use of a Full Space by opening an [`ImmersiveSpace`](/documentation/SwiftUI/ImmersiveSpace) scene. You can use the [`mixed`](/documentation/SwiftUI/ImmersionStyle/mixed) immersion style to place objects in a person’s surroundings, or the [`full`](/documentation/SwiftUI/ImmersionStyle/full) style to completely control the visual experience.

  * Display 3D models in a volume or a Full Space using RealityKit entities that you load with that framework’s [`Model3D`](/documentation/RealityKit/Model3D) or [`RealityView`](/documentation/RealityKit/RealityView) structure.

### [Toolbars and ornaments](/documentation/Updates/SwiftUI#Toolbars-and-
ornaments)

  * Display a toolbar item in an ornament using the [`bottomOrnament`](/documentation/SwiftUI/ToolbarItemPlacement/bottomOrnament) toolbar item placement.

  * Add an ornament to a window directly using the [`ornament(visibility:attachmentAnchor:contentAlignment:ornament:)`](/documentation/SwiftUI/View/ornament\(visibility:attachmentAnchor:contentAlignment:ornament:\)) view modifier.

### [Drawing and graphics](/documentation/Updates/SwiftUI#Drawing-and-
graphics)

  * Detect view geometry in three dimensions using a [`GeometryReader3D`](/documentation/SwiftUI/GeometryReader3D).

  * Add a 3D visual effect using the [`visualEffect3D(_:)`](/documentation/SwiftUI/View/visualEffect3D\(_:\)) view modifier.

  * Rotate or scale in three dimensions with view modifiers like [`rotation3DEffect(_:anchor:)`](/documentation/SwiftUI/View/rotation3DEffect\(_:anchor:\)) and [`scaleEffect(x:y:z:anchor:)`](/documentation/SwiftUI/View/scaleEffect\(x:y:z:anchor:\)), respectively.

  * Convert between display points and physical distances using a [`PhysicalMetricsConverter`](/documentation/SwiftUI/PhysicalMetricsConverter).

### [View configuration](/documentation/Updates/SwiftUI#View-configuration)

  * Add a glass background effect to a view using the [`glassBackgroundEffect(displayMode:)`](/documentation/SwiftUI/View/glassBackgroundEffect\(displayMode:\)) view modifier.

  * Dim passthrough when appropriate by applying a [`preferredSurroundingsEffect(_:)`](/documentation/SwiftUI/View/preferredSurroundingsEffect\(_:\)) modifier.

### [View layout](/documentation/Updates/SwiftUI#View-layout)

  * Make 3D adjustments to layout with view modifiers like [`offset(z:)`](/documentation/SwiftUI/View/offset\(z:\)), [`padding3D(_:)`](/documentation/SwiftUI/View/padding3D\(_:\)-6bex4), and [`frame(depth:alignment:)`](/documentation/SwiftUI/View/frame\(depth:alignment:\)).

### [Gestures](/documentation/Updates/SwiftUI#Gestures)

  * Enable people to rotate objects in three dimensions when you add a [`RotateGesture3D`](/documentation/SwiftUI/RotateGesture3D) gesture.

* * *

## [June 2023](/documentation/Updates/SwiftUI#June-2023)

### [Scenes](/documentation/Updates/SwiftUI#Scenes)

  * Close windows by their identifier using the [`dismissWindow`](/documentation/SwiftUI/EnvironmentValues/dismissWindow) action stored in the environment.

  * Enable people to open a settings window by presenting a [`SettingsLink`](/documentation/SwiftUI/SettingsLink) button.

### [Navigation](/documentation/Updates/SwiftUI#Navigation)

  * Control views of a navigation split view or stack using a new overload of the [`navigationDestination(item:destination:)`](/documentation/SwiftUI/View/navigationDestination\(item:destination:\)) view modifier.

  * Manage column visibility of a navigation split view using new overloads of the view’s initializer, like [`init(columnVisibility:preferredCompactColumn:sidebar:content:detail:)`](/documentation/SwiftUI/NavigationSplitView/init\(columnVisibility:preferredCompactColumn:sidebar:content:detail:\)).

### [Modal presentations](/documentation/Updates/SwiftUI#Modal-presentations)

  * Use new overloads of the file export, import, and move modifiers, like [`fileExporter(isPresented:document:contentTypes:defaultFilename:onCompletion:onCancellation:)`](/documentation/SwiftUI/View/fileExporter\(isPresented:document:contentTypes:defaultFilename:onCompletion:onCancellation:\)-34bd6), to access new file management features. For example, you can:

    * Configure a file import or export dialog to open on a default directory, enable only certain file types, display hidden files, and so on.

    * Retain file interface configuration that a person chooses from one presentation to the next.

    * Export types that conform to the [`Transferable`](/documentation/CoreTransferable/Transferable) protocol.

  * Specify a dialog severity using the [`dialogSeverity(_:)`](/documentation/SwiftUI/View/dialogSeverity\(_:\)) view modifier.

  * Provide a custom icon for a dialog using the [`dialogIcon(_:)`](/documentation/SwiftUI/View/dialogIcon\(_:\)) modifier.

  * Enable people to suppress dialogs using one of the dialog suppression modifiers, like [`dialogSuppressionToggle(isSuppressed:)`](/documentation/SwiftUI/View/dialogSuppressionToggle\(isSuppressed:\)).

### [Toolbars](/documentation/Updates/SwiftUI#Toolbars)

  * Configure the toolbar title display size using the [`toolbarTitleDisplayMode(_:)`](/documentation/SwiftUI/View/toolbarTitleDisplayMode\(_:\)) modifier.

### [Search](/documentation/Updates/SwiftUI#Search)

  * Present search programmatically using a binding to a new `isPresented` parameter available in some searchable view modifiers, like [`searchable(text:isPresented:placement:prompt:)`](/documentation/SwiftUI/View/searchable\(text:isPresented:placement:prompt:\)-1hn4y).

  * Create mutable search tokens by providing a binding to the input of the `token` closure in the applicable searchable view modifiers, like [`searchable(text:editableTokens:isPresented:placement:prompt:token:)`](/documentation/SwiftUI/View/searchable\(text:editableTokens:isPresented:placement:prompt:token:\)-2ilmg).

### [Data and storage](/documentation/Updates/SwiftUI#Data-and-storage)

  * Bridge between SwiftUI environment keys and UIKit traits more easily using the [`UITraitBridgedEnvironmentKey`](/documentation/SwiftUI/UITraitBridgedEnvironmentKey) protocol.

  * Get better performance when you share data throughout your app by using the new [`Observable()`](/documentation/Observation/Observable\(\)) macro.

  * Access both the old and new values of a value that changes when processing the completion closure of the [`onChange(of:initial:_:)`](/documentation/SwiftUI/View/onChange\(of:initial:_:\)-4psgg) view modifier.

### [Views](/documentation/Updates/SwiftUI#Views)

  * Display a standard interface when a resource, like search results or a network connection, isn’t available using the [`ContentUnavailableView`](/documentation/SwiftUI/ContentUnavailableView) view type.

  * Display a standard inspector interface with a platform-appropriate appearance by applying the [`inspector(isPresented:content:)`](/documentation/SwiftUI/View/inspector\(isPresented:content:\)) modifier.

### [Animation](/documentation/Updates/SwiftUI#Animation)

  * Perform an action when an animation completes by specifying a completion closure to the [`withAnimation(_:completionCriteria:_:completion:)`](/documentation/SwiftUI/withAnimation\(_:completionCriteria:_:completion:\)) view modifier.

  * Define custom animation behaviors by creating a type that conforms to the [`CustomAnimation`](/documentation/SwiftUI/CustomAnimation) protocol.

  * Perform animations that progress through predefined phases using the [`PhaseAnimator`](/documentation/SwiftUI/PhaseAnimator) structure, or according to a set of time-based keyframes by using the [`Keyframes`](/documentation/SwiftUI/Keyframes) protocol.

  * Specify information about a change in state — for example, to request a particular animation — using custom [`TransactionKey`](/documentation/SwiftUI/TransactionKey) instances.

  * Design custom animation curves using [`UnitCurve`](/documentation/SwiftUI/UnitCurve).

  * Apply streamlined spring parameters, now standardized across all Apple frameworks, using the new [`spring(duration:bounce:blendDuration:)`](/documentation/SwiftUI/Animation/spring\(duration:bounce:blendDuration:\)) animation. You can also use the [`Spring`](/documentation/SwiftUI/Spring) structure as a convenience to represent a spring’s motion.

### [Text input and output](/documentation/Updates/SwiftUI#Text-input-and-
output)

  * Indicate the language that appears in a specific [`Text`](/documentation/SwiftUI/Text) view so that SwiftUI can help to avoid clipping and collision of text, and perform proper line breaking and hyphenation using the [`typesettingLanguage(_:isEnabled:)`](/documentation/SwiftUI/View/typesettingLanguage\(_:isEnabled:\)-4ldzm) view modifier.

  * Scale text semantically, for example by labeling it as having a secondary text scale, using the [`textScale(_:isEnabled:)`](/documentation/SwiftUI/View/textScale\(_:isEnabled:\)) modifier.

### [Shapes](/documentation/Updates/SwiftUI#Shapes)

  * Apply more than one [`fill(_:style:)`](/documentation/SwiftUI/Shape/fill\(_:style:\)-3y2ud) or [`stroke(_:style:antialiased:)`](/documentation/SwiftUI/Shape/stroke\(_:style:antialiased:\)) modifier to a single [`Shape`](/documentation/SwiftUI/Shape).

  * Apply Boolean operations to both shapes and paths, like [`intersection(_:eoFill:)`](/documentation/SwiftUI/Shape/intersection\(_:eoFill:\)) and [`union(_:eoFill:)`](/documentation/SwiftUI/Shape/union\(_:eoFill:\)).

  * Use predefined shape styles, like [`rect`](/documentation/SwiftUI/Shape/rect), to simplify your code.

  * Create rounded rectangles with uneven corners using [`rect(topLeadingRadius:bottomLeadingRadius:bottomTrailingRadius:topTrailingRadius:style:)`](/documentation/SwiftUI/Shape/rect\(topLeadingRadius:bottomLeadingRadius:bottomTrailingRadius:topTrailingRadius:style:\)).

### [Drawing and graphics](/documentation/Updates/SwiftUI#Drawing-and-
graphics)

  * Create fully customizable, high-performance graphics by drawing with Metal shaders inside a SwiftUI app using a [`Shader`](/documentation/SwiftUI/Shader) structure.

  * Configure an image with a specific dynamic range by applying the [`allowedDynamicRange(_:)`](/documentation/SwiftUI/View/allowedDynamicRange\(_:\)) view modifier.

  * Compose effects that you apply to a view based on some aspect of the geometry of the view using the [`visualEffect(_:)`](/documentation/SwiftUI/View/visualEffect\(_:\)) modifier. For example, you can apply a blur that varies depending on the view’s position in the display.

### [Layout](/documentation/Updates/SwiftUI#Layout)

  * Define custom coordinate spaces using the [`CoordinateSpaceProtocol`](/documentation/SwiftUI/CoordinateSpaceProtocol) with new [`GeometryProxy`](/documentation/SwiftUI/GeometryProxy) methods, like [`bounds(of:)`](/documentation/SwiftUI/GeometryProxy/bounds\(of:\)) and [`frame(in:)`](/documentation/SwiftUI/GeometryProxy/frame\(in:\)-68tks), to get the dimensions of containers.

  * Create a frame for a view that lays out its content based on characteristics of the container view using [`containerRelativeFrame(_:alignment:)`](/documentation/SwiftUI/View/containerRelativeFrame\(_:alignment:\)).

  * Set the background of a container view using the [`containerBackground(_:for:)`](/documentation/SwiftUI/View/containerBackground\(_:for:\)) view modifier.

### [Lists and tables](/documentation/Updates/SwiftUI#Lists-and-tables)

  * Disable selectability of an item in a [`List`](/documentation/SwiftUI/List) or [`Table`](/documentation/SwiftUI/Table) by applying the [`selectionDisabled(_:)`](/documentation/SwiftUI/View/selectionDisabled\(_:\)) modifier.

  * Collapse or expand a [`Section`](/documentation/SwiftUI/Section) of a list or table using the `isExpanded` binding in the section’s initializer.

  * Configure row or section spacing using the [`listRowSpacing(_:)`](/documentation/SwiftUI/View/listRowSpacing\(_:\)) and [`listSectionSpacing(_:)`](/documentation/SwiftUI/View/listSectionSpacing\(_:\)-5t518) modifiers, respectively.

  * Set the prominence of a badge using the [`badgeProminence(_:)`](/documentation/SwiftUI/View/badgeProminence\(_:\)) view modifier.

  * Configure alternating row backgrounds using the [`alternatingRowBackgrounds(_:)`](/documentation/SwiftUI/View/alternatingRowBackgrounds\(_:\)) modifier.

  * Customize table column visibility and reordering using the [`TableColumnCustomization`](/documentation/SwiftUI/TableColumnCustomization) structure.

  * Add hierarchical rows to a table using the [`DisclosureTableRow`](/documentation/SwiftUI/DisclosureTableRow) structure, or recursively hierarchical rows using the [`OutlineGroup`](/documentation/SwiftUI/OutlineGroup) structure.

  * Hide table column headers using the [`tableColumnHeaders(_:)`](/documentation/SwiftUI/View/tableColumnHeaders\(_:\)) modifier.

### [Scrolling](/documentation/Updates/SwiftUI#Scrolling)

  * Read the position of a scroll view using one of the scroll position modifiers, like [`scrollPosition(id:anchor:)`](/documentation/SwiftUI/View/scrollPosition\(id:anchor:\)).

  * Flash scroll indicators programmatically using a view modifier, like [`scrollIndicatorsFlash(onAppear:)`](/documentation/SwiftUI/View/scrollIndicatorsFlash\(onAppear:\)).

  * Clip scroll views in custom ways after disabling default clipping using the [`scrollClipDisabled(_:)`](/documentation/SwiftUI/View/scrollClipDisabled\(_:\)) modifier.

  * Create paged scroll views, aligned to either page or view boundaries, using the [`scrollTargetBehavior(_:)`](/documentation/SwiftUI/View/scrollTargetBehavior\(_:\)) view modifier.

  * Create custom scroll behaviors using the [`ScrollTargetBehavior`](/documentation/SwiftUI/ScrollTargetBehavior) protocol.

  * Control the insets of scrollable views using the [`safeAreaPadding(_:)`](/documentation/SwiftUI/View/safeAreaPadding\(_:\)-5lh9p) and [`contentMargins(_:_:for:)`](/documentation/SwiftUI/View/contentMargins\(_:_:for:\)-1lt8b) view modifiers.

  * Add effects to views as they scroll on- and offscreen using one of the [`scrollTransition(_:axis:transition:)`](/documentation/SwiftUI/View/scrollTransition\(_:axis:transition:\)) modifiers.

  * Create a [`TabView`](/documentation/SwiftUI/TabView) that supports vertical paging in watchOS by applying the [`verticalPage`](/documentation/SwiftUI/TabViewStyle/verticalPage) tab view style.

### [Gestures](/documentation/Updates/SwiftUI#Gestures)

  * Make smoother transitions between gestures and animations by using a new [`velocity`](/documentation/SwiftUI/DragGesture/Value/velocity) property on the values associated with certain gestures and a [`tracksVelocity`](/documentation/SwiftUI/Transaction/tracksVelocity) property on [`Transaction`](/documentation/SwiftUI/Transaction).

  * Gain access to more information, including both velocity and position, by migrating to the new [`MagnifyGesture`](/documentation/SwiftUI/MagnifyGesture) and [`RotateGesture`](/documentation/SwiftUI/RotateGesture), which replace the now deprecated `MagnificationGesture` and `RotationGesture`.

### [Input events](/documentation/Updates/SwiftUI#Input-events)

  * Enable a view that’s in focus to react directly to keyboard input by applying one of the [`onKeyPress(_:action:)`](/documentation/SwiftUI/View/onKeyPress\(_:action:\)) view modifiers.

  * Enable people to choose from a compact collection of items in a [`Menu`](/documentation/SwiftUI/Menu) by styling a [`Picker`](/documentation/SwiftUI/Picker) with the [`palette`](/documentation/SwiftUI/PickerStyle/palette) style.

  * Provide haptic or audio feedback in response to an event using one of the sensory feedback modifiers, like [`sensoryFeedback(_:trigger:)`](/documentation/SwiftUI/View/sensoryFeedback\(_:trigger:\)).

  * Create buttons and toggles that perform an [`AppIntent`](/documentation/AppIntents/AppIntent) in a widget, Live Activity, and other places using new initializers like [`init(_:intent:)`](/documentation/SwiftUI/Button/init\(_:intent:\)-7urde) and [`init(_:isOn:intent:)`](/documentation/SwiftUI/Toggle/init\(_:isOn:intent:\)-4lsrf).

### [Focus](/documentation/Updates/SwiftUI#Focus)

  * Distinguish between views for which focus serves different purposes, such as those that have a primary action like a button and those that take input like a text field, using the new [`focusable(_:interactions:)`](/documentation/SwiftUI/View/focusable\(_:interactions:\)) view modifier.

  * Manage the effect that receiving focus has on a view using the [`focusEffectDisabled(_:)`](/documentation/SwiftUI/View/focusEffectDisabled\(_:\)) modifier.

### [Previews in Xcode](/documentation/Updates/SwiftUI#Previews-in-Xcode)

  * Reduce the amount of boilerplate that you need to create Xcode previews by using the new [`Preview(_:traits:_:body:)`](/documentation/SwiftUI/Preview\(_:traits:_:body:\)) macro.

## [See Also](/documentation/Updates/SwiftUI#see-also)

### [Technology updates](/documentation/Updates/SwiftUI#Technology-updates)

[Accelerate updates](/documentation/updates/accelerate)

Learn about important changes to Accelerate.

[Accessibility updates](/documentation/updates/accessibility)

Learn about important changes to Accessibility.

[ActivityKit updates](/documentation/updates/activitykit)

Learn about important changes in ActivityKit.

[AdAttributionKit Updates](/documentation/updates/adattributionkit)

Learn about important changes to AdAttributionKit.

[App Clips updates](/documentation/updates/appclips)

Learn about important changes in App Clips.

[App Intents updates](/documentation/updates/appintents)

Learn about important changes in App Intents.

[AppKit updates](/documentation/updates/appkit)

Learn about important changes to AppKit.

[Apple Intelligence updates](/documentation/updates/apple-intelligence)

Learn about important changes to Apple Intelligence.

[AppleMapsServerAPI Updates](/documentation/updates/applemapsserverapi)

Learn about important changes to AppleMapsServerAPI.

[Apple Pencil updates](/documentation/updates/applepencil)

Learn about important changes to Apple Pencil.

[ARKit updates](/documentation/updates/arkit)

Learn about important changes to ARKit.

[Audio Toolbox updates](/documentation/updates/audiotoolbox)

Learn about important changes to Audio Toolbox.

[AuthenticationServices
updates](/documentation/updates/authenticationservices)

Learn about important changes to AuthenticationServices.

[AVFAudio updates](/documentation/updates/avfaudio)

Learn about important changes to AVFAudio.

[AVFoundation updates](/documentation/updates/avfoundation)

Learn about important changes to AVFoundation.

