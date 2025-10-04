  * [ Immersive Media Support ](/documentation/immersivemediasupport)
  * Authoring Apple Immersive Video 

Sample Code

# Authoring Apple Immersive Video

Prepare and package immersive video content for delivery.

[ Download ](https://docs-
assets.developer.apple.com/published/b64c668d9fd1/AuthoringAppleImmersiveVideo.zip)

macOS 26.0+Xcode 26.0+

## [Overview](/documentation/ImmersiveMediaSupport/authoring-apple-immersive-
video#Overview)

Note

This sample code project is associated with WWDC25 session 403: [Learn about
Apple Immersive Video
technologies](https://developer.apple.com/videos/play/wwdc2025/403).

### [Configure the sample code
project](/documentation/ImmersiveMediaSupport/authoring-apple-immersive-
video#Configure-the-sample-code-project)

Running this sample requires [downloading](https://devstreaming-
cdn.apple.com/videos/streaming/examples/immersive-
media/AIV/Apple_Immersive_Video_Beach.zip) a zip file that contains an example
QuickTime movie and supporting content. When the download completes, expand
the zip file.

To run the app in Xcode, choose Product > Scheme > Edit Scheme, and update the
command-line argument paths to reference the downloaded files:

`--input`

    

An Apple Immersive Video MV-HEVC video file without any necessary metadata.

`--aime`

    

An `AIME` file with the correct camera calibrations for the provided input
file.

`--usdz`

    

An optional `USDZ` file to use for camera calibration instead of an `AIME`
file. This argument also requires the `--mask` option.

`--mask`

    

An optional dynamic mask JSON data file to use for camera calibration instead
of an AIME file. This argument also requires the `--usdz` option.

`--output`

    

The `AIVU` file to write that contains Immersive Media Support metadata.

