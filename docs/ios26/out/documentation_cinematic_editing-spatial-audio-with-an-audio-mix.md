# Editing Spatial Audio with an audio mix | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/cinematic/editing-spatial-audio-with-an-audio-mix
> Fetched: 2025-08-31T18:32:14.198Z

## [Overview](https://developer.apple.com/documentation/cinematic/editing-spatial-audio-with-an-audio-mix#Overview)

Beginning with iPhone 16, you can use Spatial Audio capture to record video with 3D audio, and edit the audio mix in the Photos app. With Audio Mix, you have creative control of the background and foreground sounds in a recording. It isolates speech as foreground and ambience as background, and you can select between multiple creative rendering styles to adjust the mix.

The `SpatialAudioCLI` sample project is a command-line tool that demonstrates three different methods for applying an audio mix: using [`AVPlayer`](https://developer.apple.com/documentation/AVFoundation/AVPlayer), using [`AVAssetWriter`](https://developer.apple.com/documentation/AVFoundation/AVAssetWriter), and using [`AUAudioMix`](https://developer.apple.com/documentation/AudioToolbox/kAudioUnitSubType_AUAudioMix).

### [Configure the sample code project](https://developer.apple.com/documentation/cinematic/editing-spatial-audio-with-an-audio-mix#Configure-the-sample-code-project)

For best results, use `SpatialAudioCLI` with media that contains a Spatial Audio track. On all iPhone 16 models, Spatial Audio recording is available when capturing video with the Camera app. See the [iPhone User Guide](https://support.apple.com/en-kw/guide/iphone/iph31c1ca6c7/ios) for how to change sound recording options.

You can record Spatial Audio in your app by setting the [`multichannelAudioMode`](https://developer.apple.com/documentation/AVFoundation/AVCaptureDeviceInput/multichannelAudioMode) property of the [`AVCaptureDeviceInput`](https://developer.apple.com/documentation/AVFoundation/AVCaptureDeviceInput) to a value of `firstOrderAmbisonics`.

### [Adjust the audio mix in AVPlayer](https://developer.apple.com/documentation/cinematic/editing-spatial-audio-with-an-audio-mix#Adjust-the-audio-mix-in-AVPlayer)

The simplest way to adjust the audio mix is to play Spatial Audio assets with [`AVPlayer`](https://developer.apple.com/documentation/AVFoundation/AVPlayer).

First, the sample loads the specified input file into an [`AVPlayerItem`](https://developer.apple.com/documentation/AVFoundation/AVPlayerItem):

```
let myAsset = AVURLAsset(url: URL(filePath: "myMediaURL"))
let myPlayerItem = AVPlayerItem(asset: myAsset)
```

Then the sample uses the [`AVAsset`](https://developer.apple.com/documentation/AVFoundation/AVAsset) to initialize an instance of `CNAssetSpatialAudioInfo`:

```
do {
    // This command throws if the input file does not have proper Spatial Audio.
    let audioInfo = try await CNAssetSpatialAudioInfo(asset: myAsset)
} catch {
    print("A problem occured reading the spatial audio asset: \(error)")
}
```

The two primary mix parameters are `effectIntensity` and `renderingStyle`. The sample creates an [`AVAudioMix`](https://developer.apple.com/documentation/AVFoundation/AVAudioMix) with the specified mix parameters and sets it on the [`AVPlayerItem`](https://developer.apple.com/documentation/AVFoundation/AVPlayerItem):

```
// Sets the mix parameters.
let intensity = 0.5 // Float values between 0.0 and 1.0.
let style = CNSpatialAudioRenderingStyle.cinematic


// Creates an `AVAudioMix` with effect intensity and rendering style.
let newAudioMix = audioInfo.audioMix(effectIntensity: intensity, renderingStyle: style)
myPlayerItem.audioMix = newAudioMix


// AVPlayer plays the asset with the new audio mix parameters.
let player = AVPlayer(playerItem: myPlayerItem)
```
