  * [ SwiftUI ](/documentation/swiftui)
  * [ Landmarks: Building an app with Liquid Glass ](/documentation/swiftui/landmarks-building-an-app-with-liquid-glass)
  * Landmarks: Refining the system provided Liquid Glass effect in toolbars 

Sample Code

# Landmarks: Refining the system provided Liquid Glass effect in toolbars

Organize toolbars into related groupings to improve their appearance and
utility.

[ Download ](https://docs-
assets.developer.apple.com/published/5494b10f5cc7/LandmarksBuildingAnAppWithLiquidGlass.zip)

iOS 26.0+iPadOS 26.0+macOS 26.0+Xcode 26.0+

## [Overview](/documentation/SwiftUI/Landmarks-Refining-the-system-provided-
glass-effect-in-toolbars#Overview)

The Landmarks app lets people explore interesting sites around the world.
Whether it’s a national park near their home or a far-flung location on a
different continent, the app provides a way for people to organize and mark
their adventures and receive custom activity badges along the way.

This sample demonstrates how to refine the system provided glass effect in
toolbars. In `LandmarkDetailView`, the sample adds toolbar items for:

  * sharing a landmark

  * adding or removing a landmark from a list of Favorites

  * adding or removing a landmark from Collections

  * showing or hiding the inspector

The system applies Liquid Glass to the toolbar items automatically.

## [Organize the toolbar items into logical
groupings](/documentation/SwiftUI/Landmarks-Refining-the-system-provided-
glass-effect-in-toolbars#Organize-the-toolbar-items-into-logical-groupings)

To organize the toolbar items into logical groupings, the sample adds
[`ToolbarSpacer`](/documentation/swiftui/toolbarspacer) items and passes
[`fixed`](/documentation/swiftui/spacersizing/fixed) as the `sizing` parameter
to divide the toolbar into sections:

    
    
    .toolbar {
        ToolbarSpacer(.flexible)
    
    
        ToolbarItem {
            ShareLink(item: landmark, preview: landmark.sharePreview)
        }
    
    
        ToolbarSpacer(.fixed)
        
        ToolbarItemGroup {
            LandmarkFavoriteButton(landmark: landmark)
            LandmarkCollectionsMenu(landmark: landmark)
        }
        
        ToolbarSpacer(.fixed)
    
    
        ToolbarItem {
            Button("Info", systemImage: "info") {
                modelData.selectedLandmark = landmark
                modelData.isLandmarkInspectorPresented.toggle()
            }
        }
    }
    

## [See Also](/documentation/SwiftUI/Landmarks-Refining-the-system-provided-
glass-effect-in-toolbars#see-also)

### [App features](/documentation/SwiftUI/Landmarks-Refining-the-system-
provided-glass-effect-in-toolbars#App-features)

[Landmarks: Applying a background extension
effect](/documentation/swiftui/landmarks-applying-a-background-extension-
effect)

Configure an image to blur and extend under a sidebar or inspector panel.

[Landmarks: Extending horizontal scrolling under a sidebar or
inspector](/documentation/swiftui/landmarks-extending-horizontal-scrolling-
under-a-sidebar-or-inspector)

Improve your horizontal scrollbar’s appearance by extending it under a sidebar
or inspector.

[Landmarks: Displaying custom activity
badges](/documentation/swiftui/landmarks-displaying-custom-activity-badges)

Provide people with a way to mark their adventures by displaying animated
custom activity badges.

