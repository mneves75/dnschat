  * [ Cinematic ](/documentation/cinematic)
  * Editing Spatial Audio with an audio mix 

Sample Code

# Editing Spatial Audio with an audio mix

Add Spatial Audio editing capabilities with the Audio Mix API in the Cinematic
framework.

[ Download ](https://docs-
assets.developer.apple.com/published/202c6393ee70/EditingSpatialAudioWithAnAudioMix.zip)

macOS 26.0+Xcode 26.0+

## [Overview](/documentation/Cinematic/editing-spatial-audio-with-an-audio-
mix#Overview)

Beginning with iPhone 16, you can use Spatial Audio capture to record video
with 3D audio, and edit the audio mix in the Photos app. With Audio Mix, you
have creative control of the background and foreground sounds in a recording.
It isolates speech as foreground and ambience as background, and you can
select between multiple creative rendering styles to adjust the mix.

The `SpatialAudioCLI` sample project is a command-line tool that demonstrates
three different methods for applying an audio mix: using
[`AVPlayer`](/documentation/AVFoundation/AVPlayer), using
[`AVAssetWriter`](/documentation/AVFoundation/AVAssetWriter), and using
[`AUAudioMix`](/documentation/AudioToolbox/kAudioUnitSubType_AUAudioMix).

Note

This sample code project is associated with WWDC25 session 251: [Enhance your
app’s audio content creation
capabilities](https://developer.apple.com/videos/play/wwdc2025/251).

### [Configure the sample code project](/documentation/Cinematic/editing-
spatial-audio-with-an-audio-mix#Configure-the-sample-code-project)

For best results, use `SpatialAudioCLI` with media that contains a Spatial
Audio track. On all iPhone 16 models, Spatial Audio recording is available
when capturing video with the Camera app. See the [iPhone User
Guide](https://support.apple.com/en-kw/guide/iphone/iph31c1ca6c7/ios) for how
to change sound recording options.

You can record Spatial Audio in your app by setting the
[`multichannelAudioMode`](/documentation/AVFoundation/AVCaptureDeviceInput/multichannelAudioMode)
property of the
[`AVCaptureDeviceInput`](/documentation/AVFoundation/AVCaptureDeviceInput) to
a value of `firstOrderAmbisonics`.

### [Adjust the audio mix in AVPlayer](/documentation/Cinematic/editing-
spatial-audio-with-an-audio-mix#Adjust-the-audio-mix-in-AVPlayer)

The simplest way to adjust the audio mix is to play Spatial Audio assets with
[`AVPlayer`](/documentation/AVFoundation/AVPlayer).

First, the sample loads the specified input file into an
[`AVPlayerItem`](/documentation/AVFoundation/AVPlayerItem):

    
    
    let myAsset = AVURLAsset(url: URL(filePath: "myMediaURL"))
    let myPlayerItem = AVPlayerItem(asset: myAsset)
    

Then the sample uses the [`AVAsset`](/documentation/AVFoundation/AVAsset) to
initialize an instance of `CNAssetSpatialAudioInfo`:

    
    
    do {
        // This command throws if the input file does not have proper Spatial Audio.
        let audioInfo = try await CNAssetSpatialAudioInfo(asset: myAsset)
    } catch {
        print("A problem occured reading the spatial audio asset: \(error)")
    }
    

The two primary mix parameters are `effectIntensity` and `renderingStyle`. The
sample creates an [`AVAudioMix`](/documentation/AVFoundation/AVAudioMix) with
the specified mix parameters and sets it on the
[`AVPlayerItem`](/documentation/AVFoundation/AVPlayerItem):

    
    
    // Sets the mix parameters.
    let intensity = 0.5 // Float values between 0.0 and 1.0.
    let style = CNSpatialAudioRenderingStyle.cinematic
    
    
    // Creates an `AVAudioMix` with effect intensity and rendering style.   
    let newAudioMix = audioInfo.audioMix(effectIntensity: intensity, renderingStyle: style)
    myPlayerItem.audioMix = newAudioMix
    
    
    // AVPlayer plays the asset with the new audio mix parameters.
    let player = AVPlayer(playerItem: myPlayerItem)
    

## [See Also](/documentation/Cinematic/editing-spatial-audio-with-an-audio-
mix#see-also)

### [Editing](/documentation/Cinematic/editing-spatial-audio-with-an-audio-
mix#Editing)

[`struct CNDetection`](/documentation/cinematic/cndetection-swift.struct)

A structure that represents a detected subject, face, torso or pet at a
particular time.

[`struct CNDecision`](/documentation/cinematic/cndecision-swift.struct)

An object that represents a decision to focus on a particular detection, or
group of detections, at a particular time.

[`class CNDetectionTrack`](/documentation/cinematic/cndetectiontrack-2bxtd)

An object representing a series of detections of the same subject over time.

[`class
CNFixedDetectionTrack`](/documentation/cinematic/cnfixeddetectiontrack-93rrw)

An object representing the fixed detection track.

[`class
CNCustomDetectionTrack`](/documentation/cinematic/cncustomdetectiontrack-9a2zo)

An object representing a discrete detection track composed of individual
detections.

[`enum CNDetectionType`](/documentation/cinematic/cndetectiontype)

The type of object detected, such as face, torso, cat, dog and so on.

