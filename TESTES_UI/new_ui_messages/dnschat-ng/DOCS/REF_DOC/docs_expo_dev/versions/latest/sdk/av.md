# ![Expo AV icon](/static/images/packages/expo-av.png)Expo AV

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
av)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
av/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-av)

Ask AI

A universal library that provides separate APIs for Audio and Video playback.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
av)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
av/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-av)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~16.0.7

Copy

* * *

> Deprecated: The `Video` and `Audio` APIs from `expo-av` have now been
> deprecated and replaced by improved versions in [`expo-
> video`](/versions/latest/sdk/video) and [`expo-
> audio`](/versions/latest/sdk/audio). We recommend using those libraries
> instead. `expo-av` is not receiving patches and will be removed in SDK 54.

The [`Audio.Sound`](/versions/latest/sdk/audio) objects and
[`Video`](/versions/latest/sdk/video-av) components share a unified imperative
API for media playback.

Note that for `Video`, all of the operations are also available via props on
the component. However, we recommend using this imperative playback API for
most applications where finer control over the state of the video playback is
needed.

See the [playlist example app](https://github.com/expo/playlist-example) for
an example on the playback API for both `Audio.Sound` and `Video`.

> Audio recording APIs are not available on tvOS (Apple TV).

## Installation

Terminal

Copy

`- ``npx expo install expo-av`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration in app config

You can configure `expo-av` using its built-in [config plugin](/config-
plugins/introduction) if you use config plugins in your project ([EAS
Build](/build/introduction) or `npx expo run:[android|ios]`). The plugin
allows you to configure various properties that cannot be set at runtime and
require building a new app binary to take effect.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "plugins": [
          [
            "expo-av",
            {
              "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
            }
          ]
        ]
      }
    }
    

### Configurable properties

Name| Default| Description  
---|---|---  
`microphonePermission`| `"Allow $(PRODUCT_NAME) to access your microphone"`|
Only for: iOS  
A string to set the `NSMicrophoneUsageDescription` permission message.  
  
Are you using this library in an existing React Native app?

If you're not using Continuous Native Generation ([CNG](/workflow/continuous-
native-generation)) (you're using native android and ios projects manually),
then you need to configure following permissions in your native projects:

  * For Android, add `android.permission.RECORD_AUDIO` permission to your project's android/app/src/main/AndroidManifest.xml:
        
        <uses-permission android:name="android.permission.RECORD_AUDIO" />
        

  * For iOS, add `NSMicrophoneUsageDescription` to your project's ios/[app]/Info.plist:
        
        <key>NSMicrophoneUsageDescription</key>
        <string>Allow $(PRODUCT_NAME) to access your microphone</string>
        

## Usage

On this page, we reference operations on `playbackObject`. Here is an example
of obtaining access to the reference for both sound and video:

### Example: `Audio.Sound`

    
    
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    
    const playbackObject = new Audio.Sound();
    // OR
    const { sound: playbackObject } = await Audio.Sound.createAsync(
      { uri: 'http://foo/bar.mp3' },
      { shouldPlay: true }
    );
    

See the [audio documentation](/versions/latest/sdk/audio-av) for further
information on `Audio.Sound.createAsync()`.

### Example: `Video`

    
    
    %%placeholder-start%%... %%placeholder-end%%
    _handleVideoRef = component => {
      const playbackObject = component;
      ...
    }
    %%placeholder-start%%... %%placeholder-end%%
    
    render() {
      return (
          <Video
            ref={this._handleVideoRef}
          />
          %%placeholder-start%%... %%placeholder-end%%
      )
    }
    

See the [video documentation](/versions/latest/sdk/video-av) for further
information.

### Example: `setOnPlaybackStatusUpdate()`

    
    
    _onPlaybackStatusUpdate = playbackStatus => {
      if (!playbackStatus.isLoaded) {
        // Update your UI for the unloaded state
        if (playbackStatus.error) {
          console.log(`Encountered a fatal error during playback: ${playbackStatus.error}`);
          // Send Expo team the error on Slack or the forums so we can help you debug!
        }
      } else {
        // Update your UI for the loaded state
    
        if (playbackStatus.isPlaying) {
          // Update your UI for the playing state
        } else {
          // Update your UI for the paused state
        }
    
        if (playbackStatus.isBuffering) {
          // Update your UI for the buffering state
        }
    
        if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
          // The player has just finished playing and will stop. Maybe you want to play something else?
        }
    
        %%placeholder-start%%... %%placeholder-end%%
      }
    };
    
    // Load the playbackObject and obtain the reference.
    playbackObject.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
    

### Example: Loop media exactly 20 times

    
    
    const N = 20;
    %%placeholder-start%%... %%placeholder-end%%
    
    _onPlaybackStatusUpdate = playbackStatus => {
      if (playbackStatus.didJustFinish) {
        if (this.state.numberOfLoops == N - 1) {
          playbackObject.setIsLooping(false);
        }
        this.setState({ numberOfLoops: this.state.numberOfLoops + 1 });
      }
    };
    
    %%placeholder-start%%... %%placeholder-end%%
    this.setState({ numberOfLoops: 0 });
    // Load the playbackObject and obtain the reference.
    playbackObject.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
    playbackObject.setIsLooping(true);
    

## What is seek tolerance and why would I want to use it

iOS

When asked to seek an A/V item, native player in iOS sometimes may seek to a
slightly different time. This technique, mentioned in [Apple
documentation](https://developer.apple.com/documentation/avfoundation/avplayer/1387741-seek#discussion),
is used to shorten the time of the `seekTo` call (the player may decide to
play immediately from a different time than requested, instead of decoding the
exact requested part and playing it with the decoding delay).

If precision is important, you can specify the tolerance with which the player
will seek. However, this will result in an increased delay.

## API

    
    
    import { Audio, Video } from 'expo-av';
    

## Constants

### `AV._DEFAULT_INITIAL_PLAYBACK_STATUS`

Android

iOS

tvOS

Web

Type: `[AVPlaybackStatusToSet](/versions/latest/sdk/av#avplaybackstatustoset)`

The default initial `AVPlaybackStatusToSet` of all `Audio.Sound` objects and
`Video` components is as follows:

    
    
    {
      progressUpdateIntervalMillis: 500,
      positionMillis: 0,
      shouldPlay: false,
      rate: 1.0,
      shouldCorrectPitch: false,
      volume: 1.0,
      isMuted: false,
      isLooping: false,
    }
    

This default initial status can be overwritten by setting the optional
`initialStatus` in `loadAsync()` or `Audio.Sound.createAsync()`.

## Interfaces

### `AV`

Android

iOS

tvOS

Web

AV Methods

### `getStatusAsync()`

Android

iOS

tvOS

Web

Gets the `AVPlaybackStatus` of the `playbackObject`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

A `Promise` that is fulfilled with the `AVPlaybackStatus` of the
`playbackObject`.

### `setStatusAsync(status)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
status|
`[AVPlaybackStatusToSet](/versions/latest/sdk/av#avplaybackstatustoset)`| The
new `AVPlaybackStatusToSet` of the `playbackObject`, whose values will
override the current playback status.  
  
  

Sets a new `AVPlaybackStatusToSet` on the `playbackObject`. This method can
only be called if the media has been loaded.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

A `Promise` that is fulfilled with the `AVPlaybackStatus` of the
`playbackObject` once the new status has been set successfully, or rejects if
setting the new status failed. See below for details on `AVPlaybackStatus`.

### `Playback`

Android

iOS

tvOS

Web

Extends: `AV`

On the `playbackObject` reference, the following API is provided.

Playback Methods

### `loadAsync(source, initialStatus, downloadAsync)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
source| `[AVPlaybackSource](/versions/latest/sdk/av#avplaybacksource)`| The
source of the media.  
initialStatus(optional)|
`[AVPlaybackStatusToSet](/versions/latest/sdk/av#avplaybackstatustoset)`| The
initial intended `AVPlaybackStatusToSet` of the `playbackObject`, whose values
will override the default initial playback status. This value defaults to `{}`
if no parameter is passed. For more information see the details on
`AVPlaybackStatusToSet` type and the default initial playback status.  
downloadAsync(optional)| `boolean`| If set to `true`, the system will attempt
to download the resource to the device before loading. This value defaults to
`true`. Note that at the moment, this will only work for `source`s of the form
`require('path/to/file')` or `Asset` objects.  
  
  

Loads the media from `source` into memory and prepares it for playing. This
must be called before calling `setStatusAsync()` or any of the convenience set
status methods. This method can only be called if the `playbackObject` is in
an unloaded state.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

A `Promise` that is fulfilled with the `AVPlaybackStatus` of the
`playbackObject` once it is loaded, or rejects if loading failed. The
`Promise` will also reject if the `playbackObject` was already loaded. See
below for details on `AVPlaybackStatus`.

### `pauseAsync()`

Android

iOS

tvOS

Web

This is equivalent to `playbackObject.setStatusAsync({ shouldPlay: false })`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

### `playAsync()`

Android

iOS

tvOS

Web

This is equivalent to `playbackObject.setStatusAsync({ shouldPlay: true })`.

Playback may not start immediately after calling this function for reasons
such as buffering. Make sure to update your UI based on the `isPlaying` and
`isBuffering` properties of the `AVPlaybackStatus`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

### `playFromPositionAsync(positionMillis, tolerances)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
positionMillis| `number`| The desired position of playback in milliseconds.  
tolerances(optional)| `AVPlaybackTolerance`| The tolerances are used only on
iOS (more details).  
  
  

This is equivalent to `playbackObject.setStatusAsync({ shouldPlay: true,
positionMillis, seekMillisToleranceAfter: tolerances.seekMillisToleranceAfter,
seekMillisToleranceBefore: tolerances.seekMillisToleranceBefore })`.

Playback may not start immediately after calling this function for reasons
such as buffering. Make sure to update your UI based on the `isPlaying` and
`isBuffering` properties of the `AVPlaybackStatus`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

### `replayAsync(status)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
status|
`[AVPlaybackStatusToSet](/versions/latest/sdk/av#avplaybackstatustoset)`| The
new `AVPlaybackStatusToSet` of the `playbackObject`, whose values will
override the current playback status. `positionMillis` and `shouldPlay`
properties will be overridden with respectively `0` and `true`.  
  
  

Replays the playback item. When using `playFromPositionAsync(0)` the item is
seeked to the position at `0 ms`. On iOS this method uses internal
implementation of the player and is able to play the item from the beginning
immediately.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

A `Promise` that is fulfilled with the `AVPlaybackStatus` of the
`playbackObject` once the new status has been set successfully, or rejects if
setting the new status failed.

### `setIsLoopingAsync(isLooping)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
isLooping| `boolean`| A boolean describing if the media should play once
(`false`) or loop indefinitely (`true`).  
  
  

This is equivalent to `playbackObject.setStatusAsync({ isLooping })`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

### `setIsMutedAsync(isMuted)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
isMuted| `boolean`| A boolean describing if the audio of this media should be
muted.  
  
  

This is equivalent to `playbackObject.setStatusAsync({ isMuted })`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

### `setPositionAsync(positionMillis, tolerances)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
positionMillis| `number`| The desired position of playback in milliseconds.  
tolerances(optional)| `AVPlaybackTolerance`| The tolerances are used only on
iOS (more details).  
  
  

This is equivalent to `playbackObject.setStatusAsync({ positionMillis })`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

### `setProgressUpdateIntervalAsync(progressUpdateIntervalMillis)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
progressUpdateIntervalMillis| `number`| The new minimum interval in
milliseconds between calls of `onPlaybackStatusUpdate`. See
`setOnPlaybackStatusUpdate()` for details.  
  
  

This is equivalent to `playbackObject.setStatusAsync({
progressUpdateIntervalMillis })`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

### `setRateAsync(rate, shouldCorrectPitch, pitchCorrectionQuality)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
rate| `number`| The desired playback rate of the media. This value must be
between `0.0` and `32.0`. Only available on Android API version 23 and later
and iOS.  
shouldCorrectPitch| `boolean`| A boolean describing if we should correct the
pitch for a changed rate. If set to `true`, the pitch of the audio will be
corrected (so a rate different than `1.0` will timestretch the audio).  
pitchCorrectionQuality(optional)| `PitchCorrectionQuality`| iOS time pitch
algorithm setting, defaults to `Audio.PitchCorrectionQuality.Medium`. Using
`Audio.PitchCorrectionQuality.Low` may cause automatic playback rate changes
on iOS >= 17, as `AVAudioTimePitchAlgorithmLowQualityZeroLatency` is
deprecated.  
  
  

This is equivalent to `playbackObject.setStatusAsync({ rate,
shouldCorrectPitch, pitchCorrectionQuality })`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

### `setVolumeAsync(volume, audioPan)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
volume| `number`| A number between `0.0` (silence) and `1.0` (maximum volume).  
audioPan(optional)| `number`| A number between `-1.0` (full left) and `1.0`
(full right).  
  
  

This is equivalent to `playbackObject.setStatusAsync({ volume, audioPan })`.
Note: `audioPan` is currently only supported on Android using
`androidImplementation: 'MediaPlayer'`

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

### `stopAsync()`

Android

iOS

tvOS

Web

This is equivalent to `playbackObject.setStatusAsync({ shouldPlay: false,
positionMillis: 0 })`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

### `unloadAsync()`

Android

iOS

tvOS

Web

Unloads the media from memory. `loadAsync()` must be called again in order to
be able to play the media.

> This cleanup function will be automatically called in the `Video`
> component's `componentWillUnmount`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

A `Promise` that is fulfilled with the `AVPlaybackStatus` of the
`playbackObject` once it is unloaded, or rejects if unloading failed.

## Types

### `AVMetadata`

Android

iOS

tvOS

Web

Object passed to the `onMetadataUpdate` function.

Property| Type| Description  
---|---|---  
title(optional)| `string`| A string with the title of the sound object.  
  
### `AVPlaybackSource`

Android

iOS

tvOS

Web

Literal Type: `union`

The following forms of source are supported:

  * A dictionary of the form `AVPlaybackSourceObject`. The `overrideFileExtensionAndroid` property may come in handy if the player receives an URL like `example.com/play` which redirects to `example.com/player.m3u8`. Setting this property to `m3u8` would allow the Android player to properly infer the content type of the media and use proper media file reader.
  * `require('path/to/file')` for a media file asset in the source code directory.
  * An [`Asset`](/versions/latest/sdk/asset) object for a media file asset.

The [iOS developer
documentation](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/OSX_Technology_Overview/MediaLayer/MediaLayer.html)
lists the audio and video formats supported on iOS.

There are two sets of audio and video formats supported on Android: [formats
supported by ExoPlayer](https://exoplayer.dev/supported-formats.html) and
[formats supported by Android's
MediaPlayer](https://developer.android.com/guide/topics/media/platform/supported-
formats#formats-table). Expo uses ExoPlayer implementation by default. To use
`MediaPlayer`, add `androidImplementation: 'MediaPlayer'` to the initial
status of the AV object.

Acceptable values are: `number` | `AVPlaybackSourceObject` | `[Asset](/versions/latest/sdk/asset#asset)`

### `AVPlaybackSourceObject`

Android

iOS

tvOS

Web

One of the possible forms of the `AVPlaybackSource`.

Property| Type| Description  
---|---|---  
headers(optional)| `Record<string, string>`| An optional headers object passed
in a network request.  
overrideFileExtensionAndroid(optional)| `string`| Only for: Android  
An optional string overriding extension inferred from the URL.  
uri| `string`| A network URL pointing to a media file.  
  
### `AVPlaybackStatus`

Android

iOS

tvOS

Web

Literal Type: `union`

This is the structure returned from all playback API calls and describes the
state of the `playbackObject` at that point in time. It can take a form of
`AVPlaybackStatusSuccess` or `AVPlaybackStatusError` based on the
`playbackObject` load status.

Acceptable values are: `AVPlaybackStatusError` | `AVPlaybackStatusSuccess`

### `AVPlaybackStatusError`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
androidImplementation(optional)| `string`| Only for: Android  
Underlying implementation to use (when set to `MediaPlayer` it uses [Android's
MediaPlayer](https://developer.android.com/reference/android/media/MediaPlayer.html),
uses [ExoPlayer](https://exoplayer.dev/) otherwise). You may need to use this
property if you're trying to play an item unsupported by ExoPlayer ([formats
supported by ExoPlayer](https://exoplayer.dev/supported-formats.html),
[formats supported by Android's
MediaPlayer](https://developer.android.com/guide/topics/media/platform/supported-
formats#formats-table)). Note that setting this property takes effect only
when the AV object is just being created (toggling its value later will do
nothing).  
error(optional)| `string`| A string only present if the `playbackObject` just
encountered a fatal error and forced unload. Populated exactly once when an
error forces the object to unload.  
isLoaded| `false`| A boolean set to `false`.  
  
### `AVPlaybackStatusSuccess`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
androidImplementation(optional)| `string`| Only for: Android  
Underlying implementation to use (when set to `MediaPlayer` it uses [Android's
MediaPlayer](https://developer.android.com/reference/android/media/MediaPlayer.html),
uses [ExoPlayer](https://exoplayer.dev/) otherwise). You may need to use this
property if you're trying to play an item unsupported by ExoPlayer ([formats
supported by ExoPlayer](https://exoplayer.dev/supported-formats.html),
[formats supported by Android's
MediaPlayer](https://developer.android.com/guide/topics/media/platform/supported-
formats#formats-table)). Note that setting this property takes effect only
when the AV object is just being created (toggling its value later will do
nothing).  
audioPan| `number`| The current audio panning value of the audio for this
media.  
didJustFinish| `boolean`| A boolean describing if the media just played to
completion at the time that this status was received. When the media plays to
completion, the function passed in `setOnPlaybackStatusUpdate()` is called
exactly once with `didJustFinish` set to `true`. `didJustFinish` is never
`true` in any other case.  
durationMillis(optional)| `number`| The duration of the media in milliseconds.
This is only present if the media has a duration.

> Note that in some cases, a media file's duration is readable on Android, but
> not on iOS.  
  
isBuffering| `boolean`| A boolean describing if the media is currently
buffering.  
isLoaded| `true`| A boolean set to `true`.  
isLooping| `boolean`| A boolean describing if the media is currently looping.  
isMuted| `boolean`| A boolean describing if the audio of this media is
currently muted.  
isPlaying| `boolean`| A boolean describing if the media is currently playing.  
pitchCorrectionQuality(optional)| `PitchCorrectionQuality`| iOS time pitch
algorithm setting. See `setRateAsync` for details.  
playableDurationMillis(optional)| `number`| The position until which the media
has been buffered into memory. Like `durationMillis`, this is only present in
some cases.  
positionMillis| `number`| The current position of playback in milliseconds.  
progressUpdateIntervalMillis| `number`| The minimum interval in milliseconds
between calls of `onPlaybackStatusUpdate`. See `setOnPlaybackStatusUpdate()`
for details.  
rate| `number`| The current rate of the media.  
seekMillisToleranceAfter(optional)| `number`| -  
seekMillisToleranceBefore(optional)| `number`| -  
shouldCorrectPitch| `boolean`| A boolean describing if we are correcting the
pitch for a changed rate.  
shouldPlay| `boolean`| A boolean describing if the media is supposed to play.  
uri| `string`| The location of the media source.  
volume| `number`| The current volume of the audio for this media.  
  
### `AVPlaybackStatusToSet`

Android

iOS

tvOS

Web

This is the structure passed to `setStatusAsync()` to modify the state of the
`playbackObject`.

Property| Type| Description  
---|---|---  
androidImplementation(optional)| `string`| Only for: Android  
Underlying implementation to use (when set to `MediaPlayer` it uses [Android's
MediaPlayer](https://developer.android.com/reference/android/media/MediaPlayer.html),
uses [ExoPlayer](https://exoplayer.dev/) otherwise). You may need to use this
property if you're trying to play an item unsupported by ExoPlayer ([formats
supported by ExoPlayer](https://exoplayer.dev/supported-formats.html),
[formats supported by Android's
MediaPlayer](https://developer.android.com/guide/topics/media/platform/supported-
formats#formats-table)). Note that setting this property takes effect only
when the AV object is just being created (toggling its value later will do
nothing).  
audioPan(optional)| `number`| Only for: Android  
The current audio panning value of the audio for this media.

> Note that this only affect the audio of this `playbackObject` and do NOT
> affect the system volume. Also note that this is only available when the
> video was loaded using `androidImplementation: 'MediaPlayer'`  
  
isLooping(optional)| `boolean`| A boolean describing if the media is currently
looping.  
isMuted(optional)| `boolean`| A boolean describing if the audio of this media
is currently muted.

> Note that this only affect the audio of this `playbackObject` and do NOT
> affect the system volume.  
  
pitchCorrectionQuality(optional)| `PitchCorrectionQuality`| iOS time pitch
algorithm setting. See `setRateAsync` for details.  
positionMillis(optional)| `number`| The current position of playback in
milliseconds.  
progressUpdateIntervalMillis(optional)| `number`| The minimum interval in
milliseconds between calls of `onPlaybackStatusUpdate`. See
`setOnPlaybackStatusUpdate()` for details.  
rate(optional)| `number`| Only for: Android API 23+iOS  
The current rate of the media.  
seekMillisToleranceAfter(optional)| `number`| -  
seekMillisToleranceBefore(optional)| `number`| -  
shouldCorrectPitch(optional)| `boolean`| A boolean describing if we are
correcting the pitch for a changed rate.  
shouldPlay(optional)| `boolean`| A boolean describing if the media is supposed
to play.  
volume(optional)| `number`| The current volume of the audio for this media.

> Note that this only affect the audio of this `playbackObject` and do NOT
> affect the system volume.  
  
### `AVPlaybackTolerance`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
toleranceMillisAfter(optional)| `number`| -  
toleranceMillisBefore(optional)| `number`| -  
  
## Enums

### `PitchCorrectionQuality`

Android

iOS

tvOS

Web

Check [official Apple
documentation](https://developer.apple.com/documentation/avfoundation/audio_settings/time_pitch_algorithm_settings)
for more information.

#### `High`

`PitchCorrectionQuality.High ＝ number`

Equivalent to `AVAudioTimePitchAlgorithmSpectral`.

#### `Low`

`PitchCorrectionQuality.Low ＝ number`

Equivalent to `AVAudioTimePitchAlgorithmLowQualityZeroLatency`.

#### `Medium`

`PitchCorrectionQuality.Medium ＝ number`

Equivalent to `AVAudioTimePitchAlgorithmTimeDomain`.

## Permissions

### Android

You must add the following permissions to your app.json inside the
[`expo.android.permissions`](/versions/latest/config/app#permissions) array.

Android Permission| Description  
---|---  
`RECORD_AUDIO`| Allows an application to record audio.  
  
### iOS

The following usage description keys are used by this library:

Info.plist Key| Description  
---|---  
`NSMicrophoneUsageDescription`| A message that tells the user why the app is
requesting access to the device’s microphone.

