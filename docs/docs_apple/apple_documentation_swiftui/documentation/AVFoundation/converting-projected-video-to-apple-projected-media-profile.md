  * [ AVFoundation ](/documentation/avfoundation)
  * [ Media reading and writing ](/documentation/avfoundation/media-reading-and-writing)
  * Converting projected video to Apple Projected Media Profile 

Sample Code

# Converting projected video to Apple Projected Media Profile

Convert content with equirectangular or half-equirectangular projection to
APMP.

[ Download ](https://docs-
assets.developer.apple.com/published/6a11c3cf4e6d/ConvertingProjectedVideoToAppleProjectedMediaProfile.zip)

macOS 26.0+Xcode 26.0+

## [Overview](/documentation/AVFoundation/converting-projected-video-to-apple-
projected-media-profile#Overview)

Note

This sample code project is associated with WWDC25 session 297: [Learn about
the Apple Projected Media
Profile](https://developer.apple.com/videos/play/wwdc2025/297).

### [Configure the sample code
project](/documentation/AVFoundation/converting-projected-video-to-apple-
projected-media-profile#Configure-the-sample-code-project)

The app takes a path to a monoscopic or stereoscopic (frame-packed) side-by-
side or over-under stereo input video file as a single command-line argument.
To run the app in Xcode, click the Run button to convert the included side-by-
side frame-packed stereoscopic 180 sample asset (`Lighthouse_sbs.mp4`), or
choose Product > Scheme > Edit Scheme, and edit the path to your file on the
Arguments tab of the Run build scheme action.

To add projected media metadata to an output file, pass one of the following
two options:

`--autoDetect` (or `-a`)

    

Examines the source file for spherical metadata compatible with APMP.

`--projectionKind <projection_kind>` (or `-p`)

    

Specifies the projection type, which can be `equirectangular` or
`halfequirectangular`.

Other options:

`--viewPackingKind <view_packing_kind>` (or `-v`)

    

Manually specifies the frame-packing mode, which can be `sidebyside` or
`overunder`. The app ignores this option if you specify the `--autoDetect`
option.

`--baseline` (or `-b`)

    

Specifies a baseline in millimeters (for example, `--baseline 64.0` for a 64mm
baseline).

`--fov` (or `-f`)

    

Specifies a horizontal field of view in degrees (for example, `--fov 80.0` for
an 80-degree field of view).

By default, the project’s scheme loads a side-by-side video from the Xcode
project folder named `Lighthouse_sbs.mp4`.

## [See Also](/documentation/AVFoundation/converting-projected-video-to-apple-
projected-media-profile#see-also)

### [Media writing](/documentation/AVFoundation/converting-projected-video-to-
apple-projected-media-profile#Media-writing)

[Converting side-by-side 3D video to multiview HEVC and spatial
video](/documentation/avfoundation/converting-side-by-side-3d-video-to-
multiview-hevc-and-spatial-video)

Create video content for visionOS by converting an existing 3D HEVC file to a
multiview HEVC format, optionally adding spatial metadata to create a spatial
video.

[Writing Fragmented MPEG-4 Files for HTTP Live
Streaming](/documentation/avfoundation/writing-fragmented-mpeg-4-files-for-
http-live-streaming)

Create an HTTP Live Streaming presentation by turning a movie file into a
sequence of fragmented MPEG-4 files.

[Creating spatial photos and videos with spatial
metadata](/documentation/ImageIO/Creating-spatial-photos-and-videos-with-
spatial-metadata)

Add spatial metadata to stereo photos and videos to create spatial media for
viewing on Apple Vision Pro.

[Tagging Media with Video Color
Information](/documentation/avfoundation/tagging-media-with-video-color-
information)

Inspect and set video color space information when writing and transcoding
media.

[API ReferenceEvaluating an App’s Video
Color](/documentation/avfoundation/evaluating-an-app-s-video-color)

Check color reproduction for a video in your app by using test patterns, video
test equipment, and light-measurement instruments.

[`class
AVOutputSettingsAssistant`](/documentation/avfoundation/avoutputsettingsassistant)

An object that builds audio and video output settings dictionaries.

[`class AVAssetWriter`](/documentation/avfoundation/avassetwriter)

An object that writes media data to a container file.

[`class AVAssetWriterInput`](/documentation/avfoundation/avassetwriterinput)

An object that appends media samples to a track in an asset writer’s output
file.

[`class
AVAssetWriterInputPixelBufferAdaptor`](/documentation/avfoundation/avassetwriterinputpixelbufferadaptor)

An object that appends video samples to an asset writer input.

[`class
AVAssetWriterInputTaggedPixelBufferGroupAdaptor`](/documentation/avfoundation/avassetwriterinputtaggedpixelbuffergroupadaptor)

An object that appends tagged buffer groups to an asset writer input.

[`class
AVAssetWriterInputMetadataAdaptor`](/documentation/avfoundation/avassetwriterinputmetadataadaptor)

An object that appends timed metadata groups to an asset writer input.

[`class
AVAssetWriterInputGroup`](/documentation/avfoundation/avassetwriterinputgroup)

A group of inputs with tracks that are mutually exclusive to each other for
playback or processing.

