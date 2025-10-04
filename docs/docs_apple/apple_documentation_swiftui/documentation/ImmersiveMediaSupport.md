Framework

# Immersive Media Support

Read and write essential Apple Immersive Video metadata.

macOS 26.0+visionOS 26.0+

## [Overview](/documentation/ImmersiveMediaSupport#Overview)

Immersive Media Support enables you to create custom workflows for processing
Apple Immersive Video (AIV). Use it to read and write AIV-specific metadata
and enable previewing content in editorial workflows.

## [Topics](/documentation/ImmersiveMediaSupport#topics)

### [Essentials](/documentation/ImmersiveMediaSupport#Essentials)

[Authoring Apple Immersive
Video](/documentation/immersivemediasupport/authoring-apple-immersive-video)

Prepare and package immersive video content for delivery.

### [Camera metadata](/documentation/ImmersiveMediaSupport#Camera-metadata)

[`actor
VenueDescriptor`](/documentation/immersivemediasupport/venuedescriptor)

The Apple Immersive Media Venue Descriptor is a collection of static metadata
necessary for every Apple Immersive Video.

[`struct
ImmersiveCamera`](/documentation/immersivemediasupport/immersivecamera)

A structure that holds the required information for an immersive media camera
to process and render video frames.

[`struct
ImmersiveCameraCalibration`](/documentation/immersivemediasupport/immersivecameracalibration)

A structure that represents immersive media camera calibration data.

[`enum
ImmersiveCameraMask`](/documentation/immersivemediasupport/immersivecameramask)

A structure that holds the camera mask type information and its relevant mask
name.

[`struct
ImmersiveDynamicMask`](/documentation/immersivemediasupport/immersivedynamicmask)

A type that holds the information required to dynamically generate an
immersive media mask at load time.

### [Presentation commands](/documentation/ImmersiveMediaSupport#Presentation-
commands)

[`enum
PresentationCommand`](/documentation/immersivemediasupport/presentationcommand)

A set of properties that define the interface for a presentation command.

[`struct FadeCommand`](/documentation/immersivemediasupport/fadecommand)

A command type for color fading during immersive media playback.

[`struct
FadeEnvironmentCommand`](/documentation/immersivemediasupport/fadeenvironmentcommand)

A command type for opacity fading environment backdrops during immersive media
playback.

[`struct
SetCameraCommand`](/documentation/immersivemediasupport/setcameracommand)

A command type for immersive camera switching during playback.

[`struct
ShotFlopCommand`](/documentation/immersivemediasupport/shotflopcommand)

A command type to flip the video frames horizontally (mirrored horizontally)
during playback for the duration of the command.

[`struct
PresentationDescriptor`](/documentation/immersivemediasupport/presentationdescriptor)

A structure that represents dynamic metadata used during playback or when
outputting the metadata track for an immersive video file.

[`class
PresentationDescriptorReader`](/documentation/immersivemediasupport/presentationdescriptorreader)

An object that provides the functionality required to understand and process
immersive presentation commands.

### [Parametric immersive
support](/documentation/ImmersiveMediaSupport#Parametric-immersive-support)

[`class
ParametricImmersiveAssetInfo`](/documentation/immersivemediasupport/parametricimmersiveassetinfo)

An object that helps convert the original wide field of view video asset to
parametric immersive asset.

### [Immersive video rendering
support](/documentation/ImmersiveMediaSupport#Immersive-video-rendering-
support)

[`struct
ImmersiveCameraViewModel`](/documentation/immersivemediasupport/immersivecameraviewmodel)

A view model that holds all the resources needed to render an immersive camera
view.

[`struct
ImmersiveVideoMask`](/documentation/immersivemediasupport/immersivevideomask)

A video mask to use during video rendering to smooth the edges of the mesh.

### [Preview](/documentation/ImmersiveMediaSupport#Preview)

[`class
ImmersiveMediaPreviewMessagingProtocol`](/documentation/immersivemediasupport/immersivemediapreviewmessagingprotocol)

An object that represents the messaging protocol a remote preview sender and
receiver use to communicate.

### [Validation](/documentation/ImmersiveMediaSupport#Validation)

[`struct AIVUValidator`](/documentation/immersivemediasupport/aivuvalidator)

A type to validate existing AIVU files to ensure that they meet the minimum
requirements for AIV.

### [Classes](/documentation/ImmersiveMediaSupport#Classes)

[`class
ImmersiveCameraMeshCalibration`](/documentation/immersivemediasupport/immersivecamerameshcalibration)

Calibration mesh geometry based on USDZ data.

[`class
ImmersiveImageMask`](/documentation/immersivemediasupport/immersiveimagemask)

An object that holds all the information needed to load immersive media masks
from image data or from a file.

[`class
ImmersiveMediaRemotePreviewReceiver`](/documentation/immersivemediasupport/immersivemediaremotepreviewreceiver)

An observable object that helps apps handle receiving commands and data sent
from an immersive media remote preview sender object.

[`class
ImmersiveMediaRemotePreviewSender`](/documentation/immersivemediasupport/immersivemediaremotepreviewsender)

An observable object that helps an app send the required data to all connected
receiver apps to help facilitate the complete preview of the immersive media
playback.

### [Structures](/documentation/ImmersiveMediaSupport#Structures)

[`struct
ImmersiveCameraLensDefinition`](/documentation/immersivemediasupport/immersivecameralensdefinition)

This type holds the ILPD lens configuration parameters to generate camera
calibration type instance.

[`struct
ImmersiveVideoFrame`](/documentation/immersivemediasupport/immersivevideoframe)

A type that represents an immersive video frame. An immersive video frame
contains: - layout (SideBySide, OverUnder, Separate, Mono) - presentationTime:
frame presentation time - pixelBuffers: an array with one or more images
representing the frame.

