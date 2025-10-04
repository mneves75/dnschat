  * [ RealityKit ](/documentation/realitykit)
  * [ Images ](/documentation/realitykit/scene-content-images)
  * Presenting images in RealityKit 

Sample Code

# Presenting images in RealityKit

Create and display spatial scenes in RealityKit

[ Download ](https://docs-
assets.developer.apple.com/published/7469d2a0cb00/PresentingImagesInRealityKit.zip)

visionOS 26.0+Xcode 26.0+

## [Overview](/documentation/RealityKit/presenting-images-in-
realitykit#Overview)

RealityKit apps can easily display images in 3D space using
[`ImagePresentationComponent`](/documentation/realitykit/imagepresentationcomponent),
which can display traditional 2D and _spatial photos_ as well as generate and
display _spatial scenes_ — which represents the content of an existing image
in three dimensions.

Spatial scenes are different from _spatial photos_. A _spatial photo_ presents
two separate 2D images, one to each eye, to create the illusion of a three
dimensional view. _Spatial scenes_ , on the other hand, generate textured 3D
geometry from either a _spatial photo_ or a regular 2D image.

This sample app demonstrates how to use
[`ImagePresentationComponent`](/documentation/realitykit/imagepresentationcomponent)
and
[`ImagePresentationComponent.Spatial3DImage`](/documentation/realitykit/imagepresentationcomponent/spatial3dimage)
to convert an existing 2D image to a 3D spatial scene, and how to present the
2D and 3D versions of the image using
[`RealityView`](/documentation/realitykit/realityview) in a SwiftUI app.

## [Choose viewing modes](/documentation/RealityKit/presenting-images-in-
realitykit#Choose-viewing-modes)

Image presentation components can present images in several modes. Your apps
can choose to use any or all of these modes.

[`mono`](/documentation/realitykit/imagepresentationcomponent/viewingmode-
swift.struct/mono)

    

Shows an image from a single point of view.

[`spatial3D`](/documentation/realitykit/imagepresentationcomponent/viewingmode-
swift.struct/spatial3d)

    

Shows a _spatial scene_ from the source image.

[`spatial3DImmersive`](/documentation/realitykit/imagepresentationcomponent/viewingmode-
swift.struct/spatial3dimmersive)

    

Shows a _spatial scene_ from the source image and displays it in immersive
mode.

[`spatialStereo`](/documentation/realitykit/imagepresentationcomponent/viewingmode-
swift.struct/spatialstereo)

    

Shows an image as a _spatial photo_.

[`spatialStereoImmersive`](/documentation/realitykit/imagepresentationcomponent/viewingmode-
swift.struct/spatialstereoimmersive)

    

Shows an image as _spatial photo_ and displays it in immersive mode.

This sample displays images using `mono` and `spatial3D` viewing modes.

## [Create an entity to present the
image](/documentation/RealityKit/presenting-images-in-realitykit#Create-an-
entity-to-present-the-image)

To display an image, create an
[`ImagePresentationComponent`](/documentation/realitykit/imagepresentationcomponent)
and attach it to an entity in your scene. You can attach it to any entity, and
you’ll also want to attach it to one that has no visual representation in your
scene. This sample creates an empty
[`Entity`](/documentation/realitykit/entity) property called `contentEntity`
in the `AppModel` class for that purpose.

    
    
    var contentEntity: Entity = Entity()
    

In the [`RealityView`](/documentation/realitykit/realityview) `make` closure,
the app calls an asynchronous method to create an
[`ImagePresentationComponent`](/documentation/realitykit/imagepresentationcomponent)
and adds it to `contentEntity`.

    
    
    await appModel.createImagePresentationComponent()
    

The `createImagePresentationComponent` function creates an
[`ImagePresentationComponent.Spatial3DImage`](/documentation/realitykit/imagepresentationcomponent/spatial3dimage)
from a 2D image, then creates an image presentation component with that image
and attaches it to the `contentEntity`:

    
    
    func createImagePresentationComponent() async {
        guard let imageURL else {
            print("ImageURL is nil.")
            return
        }
        spatial3DImageState = .notGenerated
        spatial3DImage = nil
        do {
            spatial3DImage = try await ImagePresentationComponent.Spatial3DImage(contentsOf: imageURL)
        } catch {
            print("Unable to initialize spatial 3D image: \(error.localizedDescription)")
        }
    
    
        guard let spatial3DImage else {
            print("Spatial3DImage is nil.")
            return
        }
        
        let imagePresentationComponent = ImagePresentationComponent(spatial3DImage: spatial3DImage)
        contentEntity.components.set(imagePresentationComponent)
        if let aspectRatio = imagePresentationComponent.aspectRatio(for: .mono) {
            imageAspectRatio = CGFloat(aspectRatio)
        }
    }
    

The `createImagePresentationComponent` method stores the
`ImagePresentationComponent/aspectRatio` of the newly created
ImagePresentationComponent in the `AppModel`.

The app implements an
[`onChange(of:perform:)`](/documentation/SwiftUI/View/onChange\(of:perform:\))
modifier for `aspectRatio` in the `AppModel` to ensure that the
[`UIWindowScene`](/documentation/UIKit/UIWindowScene) size matches the image.

    
    
    .onChange(of: appModel.imageAspectRatio) { _, newAspectRatio in
        guard let windowScene = sceneDelegate.windowScene else {
            print("Unable to get the window scene. Resizing is not possible.")
            return
        }
    
    
        let windowSceneSize = windowScene.effectiveGeometry.coordinateSpace.bounds.size
    
    
        //  width / height = aspect ratio
        // Change ONLY the width to match the aspect ratio.
        let width = newAspectRatio * windowSceneSize.height
    
    
        // Keep the height the same.
        let size = CGSize(width: width, height: UIProposedSceneSizeNoPreference)
    
    
        UIView.performWithoutAnimation {
            // Update the scene size.
            windowScene.requestGeometryUpdate(.Vision(size: size))
        }
    }
    

## [Manage image presentation](/documentation/RealityKit/presenting-images-in-
realitykit#Manage-image-presentation)

In the `update` closure of the
[`RealityView`](/documentation/realitykit/realityview), the app retrieves the
presentation screen size of the image presentation component using the
entity’s [`observable`](/documentation/realitykit/entity/observable-
swift.property) property. This ensures that update is called when the
`presentationScreenSize` changes.

    
    
    guard let presentationScreenSize = appModel
        .contentEntity
        .observable
        .components[ImagePresentationComponent.self]?
        .presentationScreenSize, presentationScreenSize != .zero else {
            print("Unable to get a valid presentation screen size from the content entity.")
            return
    }
    

The app sets the z axis position of the `contentEntity` to 0.0. This displays
the image presentation component flush against the background.

    
    
    let originalPosition = appModel.contentEntity.position(relativeTo: nil)
    appModel.contentEntity.setPosition(SIMD3<Float>(originalPosition.x, originalPosition.y, 0.0), relativeTo: nil)
    

To display the image at an appropriate size, the app wraps a
[`RealityView`](/documentation/realitykit/realityview) inside a
[`GeometryReader3D`](/documentation/SwiftUI/GeometryReader3D):

    
    
    GeometryReader3D { geometry in
        RealityView { content in
    

In the `make` and `update` closure of the
[`RealityView`](/documentation/realitykit/realityview), the app converts the
geometry reader’s frame bounds into the scene’s coordinate space:

    
    
    let availableBounds = content.convert(geometry.frame(in: .local), from: .local, to: .scene)
    

Then, the app calls the `scaleImagePresentationToFit` method which scales the
image to fit into the geometry reader’s frame bounds:

    
    
    scaleImagePresentationToFit(in: availableBounds)
    

The `scaleImagePresentationToFit` method calculates x and y scale values to
preserve the aspect ratio of the presented image at the current
[`presentationScreenSize`](/documentation/realitykit/imagepresentationcomponent/presentationscreensize),
and sets those scale values as the content entity’s scale:

    
    
    func scaleImagePresentationToFit(in boundsInMeters: BoundingBox) {
        guard let imagePresentationComponent = appModel.contentEntity.components[ImagePresentationComponent.self] else {
            return
        }
    
    
        let presentationScreenSize = imagePresentationComponent.presentationScreenSize
        let scale = min(
            boundsInMeters.extents.x / presentationScreenSize.x,
            boundsInMeters.extents.y / presentationScreenSize.y
        )
    
    
        appModel.contentEntity.scale = SIMD3<Float>(scale, scale, 1.0)
    }
    

## [Generate a spatial scene](/documentation/RealityKit/presenting-images-in-
realitykit#Generate-a-spatial-scene)

It can take several seconds to generate a spatial scene. To preserve the user
experience, you have two options:

  * You can generate the spatial scene first and then add it to the image presentation component.

  * Alternatively, you can can add it to the image presentation component first and then generate the spatial scene afterwards.

If you create the spatial scene before adding it to the component, the
generated spatial scene appears as soon as you add it. If you add a 2D or
stereo image to the component first and then generate the spatial scene later,
the component presents a conversion UI like the one in the Photos app. This
indicates that it’s generating the spatial scene

Note

Generation and viewing of spatial scenes is not supported in the simulator.

Video with custom controls.

Content description: A screen recording of a visionOS window displaying a
photograph of a windmill in the background and tulip flowers in the
foreground. Below the window, there is an ornament view with left and right
arrows and a button labeled Convert to 3D. The user taps on the Convert to 3D
button and colorful animation is shown on top of the photograph. The animation
completes and the windmill and tulip flowers is shown as a spatial scene. The
Convert to 3D button label changes to Show as 2D.

Play

This sample adds the images to the component first, then generates the spatial
scene on a button press. It does that by first declaring an enumeration in the
app data model to represent the current status of the displayed image.

    
    
    enum Spatial3DImageState {
        case notGenerated
        case generating
        case generated
    }
    

The app currently displays a 2D image in an
[`ImagePresentationComponent`](/documentation/realitykit/imagepresentationcomponent).
When the viewer clicks the Show as 3D button for the first time, it checks to
see if the spatial 3D image has been generated, and returns if it has to avoid
doing unnecessary work.

    
    
    guard spatial3DImageState == .notGenerated else {
        print("Spatial 3D image already generated or generation is in progress.")
        return
    }
    

The viewing mode of the image presentation component changes to
[`spatial3D`](/documentation/realitykit/imagepresentationcomponent/viewingmode-
swift.struct/spatial3d), calls
[`generate()`](/documentation/realitykit/imagepresentationcomponent/spatial3dimage/generate\(\))
on the spatial 3D image it displays, and sets the image state to `.generated`
so it knows not to generate it again:

    
    
    guard var imagePresentationComponent = contentEntity.components[ImagePresentationComponent.self] else {
        print("ImagePresentationComponent is missing from the entity.")
        return
    }
    // Set the desired viewing mode before generating so that it will trigger the
    // generation animation.
    imagePresentationComponent.desiredViewingMode = .spatial3D
    contentEntity.components.set(imagePresentationComponent)
    
    
    // Generate the Spatial3DImage scene.
    spatial3DImageState = .generating
    try await spatial3DImage.generate()
    spatial3DImageState = .generated
    

