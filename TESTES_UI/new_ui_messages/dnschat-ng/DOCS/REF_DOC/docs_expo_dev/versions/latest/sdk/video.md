# ![Expo Video \(expo-video\) icon](/static/images/packages/expo-
video.png)Expo Video (expo-video)

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
video)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
video/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-video)

Ask AI

A library that provides an API to implement video playback in apps.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
video)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
video/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-video)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~3.0.11

Copy

* * *

`expo-video` is a cross-platform, performant video component for React Native
and Expo with Web support.

#### Known issues

Android

When two [`VideoView`](/versions/latest/sdk/video#videoview) components are
overlapping and have the [`contentFit`](/versions/latest/sdk/video#contentfit)
prop set to [`cover`](/versions/latest/sdk/video#videocontentfit), one of the
videos may be displayed out of bounds. This is a [known upstream
issue](https://github.com/androidx/media/issues/1107). To work around this
issue, use the [`surfaceType`](/versions/latest/sdk/video#surfacetype) prop
and set it to [`textureView`](/versions/latest/sdk/video#surfacetype-1).

## Installation

Terminal

Copy

`- ``npx expo install expo-video`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration in app config

You can configure `expo-video` using its built-in [config plugin](/config-
plugins/introduction) if you use config plugins in your project ([EAS
Build](/build/introduction) or `npx expo run:[android|ios]`). The plugin
allows you to configure various properties that cannot be set at runtime and
require building a new app binary to take effect. If your app does not use EAS
Build, then you'll need to manually configure the package.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "plugins": [
          [
            "expo-video",
            {
              "supportsBackgroundPlayback": true,
              "supportsPictureInPicture": true
            }
          ]
        ],
      }
    }
    

### Configurable properties

Name| Default| Description  
---|---|---  
`supportsBackgroundPlayback`| `undefined`| Only for: iOS  
A boolean value to enable background playback on iOS. If `true`, the `audio`
key is added to the `UIBackgroundModes` array in the Info.plist file. If
`false`, the key is removed. When `undefined`, the key is not modified.  
`supportsPictureInPicture`| `undefined`| A boolean value to enable Picture-in-
Picture on Android and iOS. If `true`, enables the
`android:supportsPictureInPicture` property on Android and adds the `audio`
key to the `UIBackgroundModes` array in the Info.plist file on iOS. If
`false`, the key is removed. When `undefined`, the configuration is not
modified.  
  
## Usage

Here's a simple example of a video with a play and pause button.

Video

Copy

Open in Snack

    
    
    import { useEvent } from 'expo';
    import { useVideoPlayer, VideoView } from 'expo-video';
    import { StyleSheet, View, Button } from 'react-native';
    
    const videoSource =
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    
    export default function VideoScreen() {
      const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.play();
      });
    
      const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
    
      return (
        <View style={styles.contentContainer}>
          <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
          <View style={styles.controlsContainer}>
            <Button
              title={isPlaying ? 'Pause' : 'Play'}
              onPress={() => {
                if (isPlaying) {
                  player.pause();
                } else {
                  player.play();
                }
              }}
            />
          </View>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      contentContainer: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 50,
      },
      video: {
        width: 350,
        height: 275,
      },
      controlsContainer: {
        padding: 10,
      },
    });
    

### Receiving events

The changes in properties of the
[`VideoPlayer`](/versions/latest/sdk/video#videoplayer) do not update the
React state. Therefore, to display the information about the current state of
the `VideoPlayer`, it is necessary to listen to the
[events](/versions/latest/sdk/video#videoplayerevents) it emits. The event
system is based on the
[`EventEmitter`](/versions/latest/sdk/expo#eventemitter) class and
[hooks](/versions/latest/sdk/expo#hooks) from the
[`expo`](/versions/latest/sdk/expo) package. There are a few ways to listen to
events:

#### `useEvent` hook

Creates a listener that will return a stateful value that can be used in a
component. It also cleans up automatically when the component unmounts.

useEvent

Copy

    
    
    import { useEvent } from 'expo';
    // ... Other imports, definition of the component, creating the player etc.
    
    const { status, error } = useEvent(player, 'statusChange', { status: player.status });
    // Rest of the component...
    

#### `useEventListener` hook

Built around the `Player.addListener` and `Player.removeListener` methods,
creates an event listener with automatic cleanup.

useEventListener

Copy

    
    
    import { useEventListener } from 'expo';
    // ...Other imports, definition of the component, creating the player etc.
    
    useEventListener(player, 'statusChange', ({ status, error }) => {
      setPlayerStatus(status);
      setPlayerError(error);
      console.log('Player status changed: ', status);
    });
    // Rest of the component...
    

#### `Player.addListener` method

Most flexible way to listen to events, but requires manual cleanup and more
boilerplate code.

Player.addListener

Copy

    
    
    // ...Imports, definition of the component, creating the player etc.
    
    useEffect(() => {
      const subscription = player.addListener('statusChange', ({ status, error }) => {
        setPlayerStatus(status);
        setPlayerError(error);
        console.log('Player status changed: ', status);
      });
    
      return () => {
        subscription.remove();
      };
    }, []);
    // Rest of the component...
    

### Playing local media from the assets directory

`expo-video` supports playing local media loaded using the `require` function.
You can use the result as a source directly, or assign it to the `assetId`
parameter of a [`VideoSource`](/versions/latest/sdk/video#videosource) if you
also want to configure other properties.

Playing local media

Copy

    
    
    import { VideoSource } from 'expo-video';
    
    const assetId = require('./assets/bigbuckbunny.mp4');
    
    const videoSource: VideoSource = {
      assetId,
      metadata: {
        title: 'Big Buck Bunny',
        artist: 'The Open Movie Project',
      },
    };
    
    const player1 = useVideoPlayer(assetId); // You can use the `asset` directly as a video source
    const player2 = useVideoPlayer(videoSource);
    

### Preloading videos

While another video is playing, a video can be loaded before showing it in the
view. This allows for quicker transitions between subsequent videos and a
better user experience.

To preload a video, you have to create a `VideoPlayer` with a video source.
Even when the player is not connected to a `VideoView`, it will fill the
buffers. Once it is connected to the `VideoView`, it will be able to start
playing without buffering.

In some cases, it is beneficial to preload a video later in the screen
lifecycle. In that case, a `VideoPlayer` with a `null` source should be
created. To start preloading, replace the player source with a video source
using the `replace()` function.

Here is an example of how to preload a video:

Preloading videos

Copy

Open in Snack

    
    
    import { useVideoPlayer, VideoView, VideoSource } from 'expo-video';
    import { useState, useCallback } from 'react';
    import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
    
    const bigBuckBunnySource: VideoSource =
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    
    const elephantsDreamSource: VideoSource =
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
    
    export default function PreloadingVideoPlayerScreen() {
      const player1 = useVideoPlayer(bigBuckBunnySource, player => {
        player.play();
      });
    
      const player2 = useVideoPlayer(elephantsDreamSource, player => {
        player.currentTime = 20;
      });
    
      const [currentPlayer, setCurrentPlayer] = useState(player1);
    
      const replacePlayer = useCallback(async () => {
        currentPlayer.pause();
        if (currentPlayer === player1) {
          setCurrentPlayer(player2);
          player1.pause();
          player2.play();
        } else {
          setCurrentPlayer(player1);
          player2.pause();
          player1.play();
        }
      }, [player1, currentPlayer]);
    
      return (
        <View style={styles.contentContainer}>
          <VideoView player={currentPlayer} style={styles.video} nativeControls={false} />
          <TouchableOpacity style={styles.button} onPress={replacePlayer}>
            <Text style={styles.buttonText}>Replace Player</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      contentContainer: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 50,
      },
      button: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#4630ec',
      },
      buttonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#eeeeee',
        textAlign: 'center',
      },
      video: {
        width: 300,
        height: 168.75,
        marginVertical: 20,
      },
    });
    

### Using the VideoPlayer directly

In most cases, the
[`useVideoPlayer`](/versions/latest/sdk/video#usevideoplayersource-setup) hook
should be used to create a `VideoPlayer` instance. It manages the player's
lifecycle and ensures that it is properly disposed of when the component is
unmounted. However, in some advanced use cases, it might be necessary to
create a `VideoPlayer` that does not get automatically destroyed when the
component is unmounted. In those cases, the `VideoPlayer` can be created using
the
[`createVideoPlayer`](/versions/latest/sdk/video#videocreatevideoplayersource)
function. You need be aware of the risks that come with this approach, as it
is your responsibility to call the
[`release()`](/versions/latest/sdk/expo#release) method when the player is no
longer needed. If not handled properly, this approach may lead to memory
leaks.

Creating player instance

Copy

    
    
    import { createVideoPlayer } from 'expo-video';
    const player = createVideoPlayer(videoSource);
    

> On Android, mounting multiple `VideoView` components at the same time with
> the same `VideoPlayer` instance will not work due to a [platform
> limitation](https://github.com/expo/expo/issues/35012).

### Caching videos

If your app frequently replays the same video, caching can be utilized to
minimize network usage and enhance user experience, albeit at the cost of
increased device storage usage. `expo-video` supports video caching on
`Android` and `iOS` platforms. This feature can be activated by setting the
[`useCaching`](/versions/latest/sdk/video#videosource) property of a
[`VideoSource`](/versions/latest/sdk/video#videosource) object to `true`.

The cache is persistent and will be cleared on a least-recently-used basis
once the preferred size is exceeded. Furthermore, the system can clear the
cache due to low storage availability, so it's not advisable to depend on the
cache to store critical data.

The cache functions offline. If a portion or the entirety of a video is
cached, it can be played from the cache even when the device is offline until
the cached data is exhausted.

> Due to platform limitations, the cache cannot be used with HLS video sources
> on iOS. Caching DRM-protected videos is not supported on Android and iOS.

### Managing the cache

  * The preferred cache size in bytes can be defined using the [`setVideoCacheSizeAsync`](/versions/latest/sdk/video#videosetvideocachesizeasyncsizebytes) function. The default cache size is 1GB.
  * The [`getCurrentVideoCacheSize`](/versions/latest/sdk/video#videogetcurrentvideocachesize) can be used to get the current storage occupied by the cache in bytes.
  * All cached videos can be cleared using the [`clearVideoCacheAsync`](/versions/latest/sdk/video#videoclearvideocacheasync) function.

## API

    
    
    import { VideoView, useVideoPlayer } from 'expo-video';
    

## Components

### `VideoView`

Android

iOS

tvOS

Web

Type:
`React.[PureComponent](https://react.dev/reference/react/PureComponent)<VideoViewProps>`

VideoViewProps

### `allowsFullscreen`

Android

iOS

tvOS

Web

Optional • Type: `boolean` • Default: `true`

Determines whether fullscreen mode is allowed or not.

> Note: This option has been deprecated in favor of the `fullscreenOptions`
> prop and will be disabled in the future.

### `allowsPictureInPicture`

Android

iOS

Web

Optional • Type: `boolean`

Determines whether the player allows Picture in Picture (PiP) mode.

> Note: The `supportsPictureInPicture` property of the config plugin has to be
> configured for the PiP to work.

### `allowsVideoFrameAnalysis`

iOS 16.0+

Optional • Type: `boolean` • Default: `true`

Specifies whether to perform video frame analysis (Live Text in videos). Check
official [Apple
documentation](https://developer.apple.com/documentation/avkit/avplayerviewcontroller/allowsvideoframeanalysis)
for more details.

### `contentFit`

Android

iOS

tvOS

Web

Optional • Type: `VideoContentFit` • Default: `'contain'`

Describes how the video should be scaled to fit in the container. Options are
`'contain'`, `'cover'`, and `'fill'`.

### `contentPosition`

iOS

Optional • Type: `{  dx: number,  dy: number }`

Determines the position offset of the video inside the container.

### `crossOrigin`

Web

Optional • Literal type: `string` • Default: `undefined`

Determines the [cross origin policy](https://developer.mozilla.org/en-
US/docs/Web/HTML/Reference/Attributes/crossorigin) used by the underlying
native view on web. If `undefined` (default), does not use CORS at all. If set
to `'anonymous'`, the video will be loaded with CORS enabled. Note that some
videos may not play if CORS is enabled, depending on the CDN settings. If you
encounter issues, consider adjusting the `crossOrigin` property.

Acceptable values are: `'anonymous'` | `'use-credentials'`

### `fullscreenOptions`

Android

iOS

tvOS

Web

Optional • Type: `FullscreenOptions`

Determines the fullscreen mode options.

### `nativeControls`

Android

iOS

tvOS

Web

Optional • Type: `boolean` • Default: `true`

Determines whether native controls should be displayed or not.

### `onFirstFrameRender`

Android

iOS

tvOS

Web

Optional • Type: `() => void`

A callback to call after the mounted `VideoPlayer` has rendered the first
frame into the `VideoView`. This event can be used to hide any cover images
that conceal the initial loading of the player.

> Note: This event may also be called during playback when the current video
> track changes (for example when the player switches video quality).

### `onFullscreenEnter`

Android

iOS

tvOS

Web

Optional • Type: `() => void`

A callback to call after the video player enters fullscreen mode.

### `onFullscreenExit`

Android

iOS

tvOS

Web

Optional • Type: `() => void`

A callback to call after the video player exits fullscreen mode.

### `onPictureInPictureStart`

Android

iOS

Web

Optional • Type: `() => void`

A callback to call after the video player enters Picture in Picture (PiP)
mode.

### `onPictureInPictureStop`

Android

iOS

Web

Optional • Type: `() => void`

A callback to call after the video player exits Picture in Picture (PiP) mode.

### `player`

Android

iOS

tvOS

Web

Type: `VideoPlayer`

A video player instance. Use `useVideoPlayer()` hook to create one.

### `playsInline`

Web

Optional • Type: `boolean`

Determines whether a video should be played "inline", that is, within the
element's playback area.

### `requiresLinearPlayback`

Android

iOS

Optional • Type: `boolean` • Default: `false`

Determines whether the player allows the user to skip media content.

### `showsTimecodes`

iOS

Optional • Type: `boolean` • Default: `true`

Determines whether the timecodes should be displayed or not.

### `startsPictureInPictureAutomatically`

Android 12+

iOS

Optional • Type: `boolean` • Default: `false`

Determines whether the player should start Picture in Picture (PiP)
automatically when the app is in the background.

> Note: Only one player can be in Picture in Picture (PiP) mode at a time.

> Note: The `supportsPictureInPicture` property of the config plugin has to be
> configured for the PiP to work.

### `surfaceType`

Android

Optional • Type: `SurfaceType` • Default: `'surfaceView'`

Determines the type of the surface used to render the video.

> This prop should not be changed at runtime.

### `useExoShutter`

Android

Optional • Type: `boolean` • Default: `false`

Determines whether the player should use the default ExoPlayer shutter that
covers the `VideoView` before the first video frame is rendered. Setting this
property to `false` makes the Android behavior the same as iOS.

#### Inherited Props

  * `[ViewProps](https://reactnative.dev/docs/view#props)`

### `VideoAirPlayButton`

iOS

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<VideoAirPlayButtonProps>`

A view displaying the
[`AVRoutePickerView`](https://developer.apple.com/documentation/avkit/avroutepickerview).
Shows a button, when pressed, an AirPlay device picker shows up, allowing
users to stream the currently playing video to any available AirPlay sink.

> When using this view, make sure that the `allowsExternalPlayback` player
> property is set to `true`.

VideoAirPlayButtonProps

### `activeTint`

iOS

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)` •
Default: `undefined`

The color of the button icon while AirPlay sharing is active.

### `onBeginPresentingRoutes`

iOS

Optional • Type: `() => void`

A callback called when the AirPlay route selection popup is about to show.

### `onEndPresentingRoutes`

iOS

Optional • Type: `() => void`

A callback called when the AirPlay route selection popup has disappeared.

### `prioritizeVideoDevices`

iOS

Optional • Type: `boolean` • Default: `true`

Determines whether the AirPlay device selection popup should show video
outputs first.

### `tint`

iOS

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)` •
Default: `undefined`

The color of the button icon while AirPlay sharing is not active.

#### Inherited Props

  * `[Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)<[ViewProps](https://reactnative.dev/docs/view#props), 'children'>`

## Component Methods

### `enterFullscreen()`

Android

iOS

tvOS

Web

Enters fullscreen mode.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `exitFullscreen()`

Android

iOS

tvOS

Web

Exits fullscreen mode.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `startPictureInPicture()`

Android

iOS

Web

Enters Picture in Picture (PiP) mode. Throws an exception if the device does
not support PiP.

> Note: Only one player can be in Picture in Picture (PiP) mode at a time.

> Note: The `supportsPictureInPicture` property of the config plugin has to be
> configured for the PiP to work.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `stopPictureInPicture()`

Android

iOS

Web

Exits Picture in Picture (PiP) mode.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

## Hooks

### `useVideoPlayer(source, setup)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
source| `VideoSource`| A video source that is used to initialize the player.  
setup(optional)| `(player: VideoPlayer) => void`| A function that allows
setting up the player. It will run after the player is created.  
  
  

Creates a `VideoPlayer`, which will be automatically cleaned up when the
component is unmounted.

Returns:

`VideoPlayer`

## Classes

### `VideoPlayer`

Android

iOS

tvOS

Web

Type: Class extends
`[SharedObject](/versions/v54.0.0/sdk/expo#sharedobjecttype)<VideoPlayerEvents>`

A class that represents an instance of the video player.

VideoPlayer Properties

### `allowsExternalPlayback`

iOS

Type: `boolean` • Default: `true`

Determines whether the player should allow external playback.

### `audioMixingMode`

Android

iOS

Type: `AudioMixingMode` • Default: `'auto'`

Determines how the player will interact with other audio playing in the
system.

### `audioTrack`

Android

iOS

Literal type: `union` • Default: `null`

Specifies the audio track currently played by the player. `null` when no audio
is played.

Acceptable values are: `null` | `AudioTrack`

### `availableAudioTracks`

Android

iOS

Read Only • Type: `AudioTrack[]`

An array of audio tracks available for the current video.

### `availableSubtitleTracks`

Android

iOS

Read Only • Type: `SubtitleTrack[]`

An array of subtitle tracks available for the current video.

### `availableVideoTracks`

Android

iOS

Read Only • Type: `VideoTrack[]`

An array of video tracks available for the current video.

> On iOS, when using a HLS source, make sure that the uri contains `.m3u8`
> extension or that the `contentType` property of the `VideoSource` has been
> set to `'hls'`. Otherwise, the video tracks will not be available.

### `bufferedPosition`

Android

iOS

tvOS

Web

Read Only • Type: `number`

Float value indicating how far the player has buffered the video in seconds.

This value is 0 when the player has not buffered up to the current playback
time. When it's impossible to determine the buffer state (for example, when
the player isn't playing any media), this value is -1.

### `bufferOptions`

Android

iOS

Type: `[BufferOptions](/versions/v54.0.0/sdk/video#bufferoptions-1)`

Specifies buffer options which will be used by the player when buffering the
video.

> You should provide a `BufferOptions` object when setting this property.
> Setting individual buffer properties is not supported.

### `currentLiveTimestamp`

Android

iOS

Read Only • Literal type: `union`

The exact timestamp when the currently displayed video frame was sent from the
server, based on the `EXT-X-PROGRAM-DATE-TIME` tag in the livestream metadata.
If this metadata is missing, this property will return `null`.

Acceptable values are: `null` | `number`

### `currentOffsetFromLive`

Android

iOS

Read Only • Literal type: `union`

Float value indicating the latency of the live stream in seconds. If a
livestream doesn't have the required metadata, this will return `null`.

Acceptable values are: `null` | `number`

### `currentTime`

Android

iOS

tvOS

Web

Type: `number`

Float value indicating the current playback time in seconds.

If the player is not yet playing, this value indicates the time position at
which playback will begin once the `play()` method is called.

Setting `currentTime` to a new value seeks the player to the given time. Note
that frame accurate seeking may incur additional decoding delay which can
impact seeking performance. Consider using the `seekBy` function if the time
does not have to be set precisely.

### `duration`

Android

iOS

tvOS

Web

Read Only • Type: `number`

Float value indicating the duration of the current video in seconds.

### `isExternalPlaybackActive`

iOS

Read Only • Type: `boolean`

Indicates whether the player is currently playing back the media to an
external device via AirPlay.

### `isLive`

Android

iOS

tvOS

Web

Read Only • Type: `boolean`

Boolean value indicating whether the player is currently playing a live
stream.

### `loop`

Android

iOS

tvOS

Web

Type: `boolean` • Default: `false`

Determines whether the player should automatically replay after reaching the
end of the video.

### `muted`

Android

iOS

tvOS

Web

Type: `boolean` • Default: `false`

Boolean value whether the player is currently muted. Setting this property to
`true`/`false` will mute/unmute the player.

### `playbackRate`

Android

iOS

tvOS

Web

Type: `number` • Default: `1.0`

Float value between `0` and `16.0` indicating the current playback speed of
the player.

### `playing`

Android

iOS

tvOS

Web

Read Only • Type: `boolean`

Boolean value whether the player is currently playing.

> Use `play` and `pause` methods to control the playback.

### `preservesPitch`

Android

iOS

tvOS

Web

Type: `boolean` • Default: `true`

Boolean value indicating if the player should correct audio pitch when the
playback speed changes.

### `showNowPlayingNotification`

Android

iOS

Type: `boolean` • Default: `false`

Boolean value determining whether the player should show the now playing
notification.

### `status`

Android

iOS

tvOS

Web

Read Only • Type: `VideoPlayerStatus`

Indicates the current status of the player.

### `staysActiveInBackground`

Android

iOS

Type: `boolean` • Default: `false`

Determines whether the player should continue playing after the app enters the
background.

### `subtitleTrack`

Android

iOS

Literal type: `union` • Default: `null`

Specifies the subtitle track which is currently displayed by the player.
`null` when no subtitles are displayed.

> To ensure a valid subtitle track, always assign one of the subtitle tracks
> from the `availableSubtitleTracks` array.

Acceptable values are: `null` | `SubtitleTrack`

### `targetOffsetFromLive`

iOS

Type: `number`

Float value indicating the time offset from the live in seconds.

### `timeUpdateEventInterval`

Android

iOS

tvOS

Web

Type: `number` • Default: `0`

Float value indicating the interval in seconds at which the player will emit
the `timeUpdate` event. When the value is equal to `0`, the event will not be
emitted.

### `videoTrack`

Android

iOS

Read Only • Literal type: `union` • Default: `null`

Specifies the video track currently played by the player. `null` when no video
is displayed.

Acceptable values are: `null` | `VideoTrack`

### `volume`

Android

iOS

tvOS

Web

Type: `number` • Default: `1.0`

Float value between `0` and `1.0` representing the current volume. Muting the
player doesn't affect the volume. In other words, when the player is muted,
the volume is the same as when unmuted. Similarly, setting the volume doesn't
unmute the player.

VideoPlayer Methods

### `generateThumbnailsAsync(times, options)`

Android

iOS

Parameter| Type  
---|---  
times| `number | number[]`  
options(optional)| `VideoThumbnailOptions`  
  
  

Generates thumbnails from the currently played asset. The thumbnails are
references to native images, thus they can be used as a source of the `Image`
component from `expo-image`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<VideoThumbnail[]>`

### `pause()`

Android

iOS

tvOS

Web

Pauses the player.

Returns:

`void`

### `play()`

Android

iOS

tvOS

Web

Resumes the player.

Returns:

`void`

### `replace(source, disableWarning)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
source| `VideoSource`  
disableWarning(optional)| `boolean`  
  
  

Replaces the current source with a new one.

> On iOS, this method loads the asset data synchronously on the UI thread and
> can block it for extended periods of time. Use `replaceAsync` to load the
> asset asynchronously and avoid UI lags.

> This method will be deprecated in the future.

Returns:

`void`

### `replaceAsync(source)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
source| `VideoSource`  
  
  

Replaces the current source with a new one, while offloading loading of the
asset to a different thread.

> On Android and Web, this method is equivalent to `replace`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `replay()`

Android

iOS

tvOS

Web

Seeks the playback to the beginning.

Returns:

`void`

### `seekBy(seconds)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
seconds| `number`  
  
  

Seeks the playback by the given number of seconds. The time to which the
player seeks may differ from the specified requested time for efficiency,
depending on the encoding and what is currently buffered by the player. Use
this function to implement playback controls that seek by specific amount of
time, in which case, the actual time usually does not have to be precise. For
frame accurate seeking, use the `currentTime` property.

Returns:

`void`

### `VideoThumbnail`

Android

iOS

Type: Class extends
`[SharedRef](/versions/v54.0.0/sdk/expo#sharedreftype)<'image'>`

Represents a video thumbnail that references a native image. Instances of this
class can be passed as a source to the `Image` component from `expo-image`.

VideoThumbnail Properties

### `actualTime`

iOS

Type: `number`

The time in seconds at which the thumbnail was actually generated.

### `height`

Android

iOS

Type: `number`

Height of the created thumbnail.

### `nativeRefType`

Android

iOS

Type: `string`

The type of the native reference.

### `requestedTime`

Android

iOS

Type: `number`

The time in seconds at which the thumbnail was to be created.

### `width`

Android

iOS

Type: `number`

Width of the created thumbnail.

## Methods

### `Video.clearVideoCacheAsync()`

Android

iOS

Clears all video cache.

> This function can be called only if there are no existing `VideoPlayer`
> instances.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A promise that fulfills after the cache has been cleaned.

### `Video.createVideoPlayer(source)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
source| `VideoSource`  
  
  

Creates a direct instance of `VideoPlayer` that doesn't release automatically.

> For most use cases you should use the `useVideoPlayer` hook instead. See the
> Using the VideoPlayer Directly section for more details.

Returns:

`VideoPlayer`

### `Video.getCurrentVideoCacheSize()`

Android

iOS

Returns the space currently occupied by the video cache in bytes.

Returns:

`number`

### `Video.isPictureInPictureSupported()`

Android

iOS

Returns whether the current device supports Picture in Picture (PiP) mode.

Returns:

`boolean`

A `boolean` which is `true` if the device supports PiP mode, and `false`
otherwise.

### `Video.setVideoCacheSizeAsync(sizeBytes)`

Android

iOS

Parameter| Type  
---|---  
sizeBytes| `number`  
  
  

Sets desired video cache size in bytes. The default video cache size is 1GB.
Value set by this function is persistent. The cache size is not guaranteed to
be exact and the actual cache size may be slightly larger. The cache is
evicted on a least-recently-used basis.

> This function can be called only if there are no existing `VideoPlayer`
> instances.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A promise that fulfills after the cache size has been set.

## Types

### `AudioMixingMode`

Android

iOS

tvOS

Web

Literal Type: `string`

Specifies the audio mode that the player should use. Audio mode is set on per-
app basis, if there are multiple players playing and have different a
`AudioMode` specified, the highest priority mode will be used. Priority order:
'doNotMix' > 'auto' > 'duckOthers' > 'mixWithOthers'.

  * `mixWithOthers`: The player will mix its audio output with other apps.
  * `duckOthers`: The player will lower the volume of other apps if any of the active players is outputting audio.
  * `auto`: The player will allow other apps to keep playing audio only when it is muted. On iOS it will always interrupt other apps when `showNowPlayingNotification` is `true` due to system requirements.
  * `doNotMix`: The player will pause playback in other apps, even when it's muted.

> On iOS, the Now Playing notification is dependent on the audio mode. If the
> audio mode is different from `doNotMix` or `auto` this feature will not
> work.

Acceptable values are: `'mixWithOthers'` | `'duckOthers'` | `'auto'` | `'doNotMix'`

### `AudioTrack`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
id| `string`| Only for: Android  
A string used by expo-video to identify the audio track.  
label| `string`| Label of the audio track in the language of the device.  
language| `string`| Language of the audio track. For example, 'en', 'pl',
'de'.  
  
### `BufferOptions`

Android

iOS

Specifies buffer options which will be used by the player when buffering the
video.

Property| Type| Description  
---|---|---  
maxBufferBytes(optional)| `number | null`| Only for: Android  
The maximum number of bytes that the player can buffer from the network. When
0 the player will automatically decide appropriate buffer size.Default:`0`  
minBufferForPlayback(optional)| `number`| Only for: Android  
Minimum duration of the buffer in seconds required to continue playing after
the player has been paused or started buffering.

> This property will be ignored if `preferredForwardBufferDuration` is lower.

Default:`2`  
preferredForwardBufferDuration(optional)| `number`| Only for: AndroidiOS  
The duration in seconds which determines how much media the player should
buffer ahead of the current playback time. On iOS when set to `0` the player
will automatically decide appropriate buffer duration. Equivalent to
[`AVPlayerItem.preferredForwardBufferDuration`](https://developer.apple.com/documentation/avfoundation/avplayeritem/1643630-preferredforwardbufferduration).Default:`Android:
20, iOS: 0`  
prioritizeTimeOverSizeThreshold(optional)| `boolean`| Only for: Android  
A Boolean value which determines whether the player should prioritize time
over size when buffering media.Default:`false`  
waitsToMinimizeStalling(optional)| `boolean`| Only for: iOS  
A Boolean value that indicates whether the player should automatically delay
playback in order to minimize stalling. Equivalent to
[`AVPlayer.automaticallyWaitsToMinimizeStalling`](https://developer.apple.com/documentation/avfoundation/avplayer/1643482-automaticallywaitstominimizestal).Default:`true`  
  
### `ContentType`

Android

iOS

tvOS

Web

Literal Type: `string`

Specifies the content type of the source.

  * `auto`: The player will automatically determine the content type of the video.
  * `progressive`: The player will use progressive download content type. This is the default `ContentType` when the uri does not contain an extension.
  * `hls`: The player will use HLS content type.
  * `dash`: The player will use DASH content type (Android-only).
  * `smoothStreaming`: The player will use SmoothStreaming content type (Android-only).

Acceptable values are: `'auto'` | `'progressive'` | `'hls'` | `'dash'` | `'smoothStreaming'`

### `DRMOptions`

Android

iOS

tvOS

Web

Specifies DRM options which will be used by the player while loading the
video.

Property| Type| Description  
---|---|---  
base64CertificateData(optional)| `string`| Only for: iOS  
Specifies the base64 encoded certificate data for the FairPlay DRM. When this
property is set, the `certificateUrl` property is ignored.  
certificateUrl(optional)| `string`| Only for: iOS  
Specifies the certificate URL for the FairPlay DRM.  
contentId(optional)| `string`| Only for: iOS  
Specifies the content ID of the stream.  
headers(optional)| `Record<string, string>`| Determines headers sent to the
license server on license requests.  
licenseServer| `string`| Determines the license server URL.  
multiKey(optional)| `boolean`| Only for: Android  
Specifies whether the DRM is a multi-key DRM.  
type| `DRMType`| Determines which type of DRM to use.  
  
### `DRMType`

Android

iOS

tvOS

Web

Literal Type: `string`

Specifies which type of DRM to use:

  * Android supports ClearKey, PlayReady and Widevine.
  * iOS supports FairPlay.

Acceptable values are: `'clearkey'` | `'fairplay'` | `'playready'` | `'widevine'`

### `IsExternalPlaybackActiveChangeEventPayload`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
isExternalPlaybackActive| `boolean`| The current external playback status.  
oldIsExternalPlaybackActive(optional)| `boolean`| The previous external
playback status.  
  
### `MutedChangeEventPayload`

Android

iOS

tvOS

Web

Data delivered with the `mutedChange` event.

Property| Type| Description  
---|---|---  
muted| `boolean`| Boolean value whether the player is currently muted.  
oldMuted(optional)| `boolean`| Previous value of the `isMuted` property.  
  
### `PlaybackRateChangeEventPayload`

Android

iOS

tvOS

Web

Data delivered with the `playbackRateChange` event.

Property| Type| Description  
---|---|---  
oldPlaybackRate(optional)| `number`| Previous value of the `playbackRate`
property.  
playbackRate| `number`| Float value indicating the current playback speed of
the player.  
  
### `PlayerError`

Android

iOS

tvOS

Web

Contains information about any errors that the player encountered during the
playback

Property| Type| Description  
---|---|---  
message| `string`| -  
  
### `PlayingChangeEventPayload`

Android

iOS

tvOS

Web

Data delivered with the `playingChange` event.

Property| Type| Description  
---|---|---  
isPlaying| `boolean`| Boolean value whether the player is currently playing.  
oldIsPlaying(optional)| `boolean`| Previous value of the `isPlaying` property.  
  
### `SourceChangeEventPayload`

Android

iOS

tvOS

Web

Data delivered with the `sourceChange` event.

Property| Type| Description  
---|---|---  
oldSource(optional)| `VideoSource`| Previous source of the player.  
source| `VideoSource`| New source of the player.  
  
### `SourceLoadEventPayload`

Android

iOS

tvOS

Web

Data delivered with the `sourceLoad` event, contains information about the
video source that has finished loading.

Property| Type| Description  
---|---|---  
availableAudioTracks| `AudioTrack[]`| Audio tracks available for the loaded
video source.  
availableSubtitleTracks| `SubtitleTrack[]`| Subtitle tracks available for the
loaded video source.  
availableVideoTracks| `VideoTrack[]`| Video tracks available for the loaded
video source.

> On iOS, when using a HLS source, make sure that the uri contains `.m3u8`
> extension or that the `contentType` property of the `VideoSource` has been
> set to `'hls'`. Otherwise, the video tracks will not be available.  
  
duration| `number`| Duration of the video source in seconds.  
videoSource| `VideoSource | null`| The video source that has been loaded.  
  
### `StatusChangeEventPayload`

Android

iOS

tvOS

Web

Data delivered with the `statusChange` event.

Property| Type| Description  
---|---|---  
error(optional)| `PlayerError`| Error object containing information about the
error that occurred.  
oldStatus(optional)| `VideoPlayerStatus`| Previous status of the player.  
status| `VideoPlayerStatus`| New status of the player.  
  
### `SubtitleTrack`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
id| `string`| Only for: Android  
A string used by `expo-video` to identify the subtitle track.  
label| `string`| Label of the subtitle track in the language of the device.  
language| `string`| Language of the subtitle track. For example, `en`, `pl`,
`de`.  
  
### `SubtitleTrackChangeEventPayload`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
oldSubtitleTrack(optional)| `SubtitleTrack | null`| Previous subtitle track of the player.  
subtitleTrack| `SubtitleTrack | null`| New subtitle track of the player.  
  
### `SurfaceType`

Android

Literal Type: `string`

Describes the type of the surface used to render the video.

  * `surfaceView`: Uses the `SurfaceView` to render the video. This value should be used in the majority of cases. Provides significantly lower power consumption, better performance, and more features.
  * `textureView`: Uses the `TextureView` to render the video. Should be used in cases where the SurfaceView is not supported or causes issues (for example, overlapping video views).

You can learn more about surface types in the official [ExoPlayer
documentation](https://developer.android.com/media/media3/ui/playerview#surfacetype).

Acceptable values are: `'textureView'` | `'surfaceView'`

### `TimeUpdateEventPayload`

Android

iOS

tvOS

Web

Data delivered with the `timeUpdate` event, contains information about the
current playback progress.

Property| Type| Description  
---|---|---  
bufferedPosition| `number`| Only for: AndroidiOS  
Float value indicating how far the player has buffered the video in seconds.
Same as the `bufferedPosition` property.  
currentLiveTimestamp| `number | null`| Only for: AndroidiOS  
The exact timestamp when the currently displayed video frame was sent from the
server, based on the `EXT-X-PROGRAM-DATE-TIME` tag in the livestream metadata.
Same as the `currentLiveTimestamp` property.  
currentOffsetFromLive| `number | null`| Only for: AndroidiOS  
Float value indicating the latency of the live stream in seconds. Same as the
`currentOffsetFromLive` property.  
currentTime| `number`| Float value indicating the current playback time in
seconds. Same as the `currentTime` property.  
  
### `VideoContentFit`

Android

iOS

tvOS

Web

Literal Type: `string`

Describes how a video should be scaled to fit in a container.

  * `contain`: The video maintains its aspect ratio and fits inside the container, with possible letterboxing/pillarboxing.
  * `cover`: The video maintains its aspect ratio and covers the entire container, potentially cropping some portions.
  * `fill`: The video stretches/squeezes to completely fill the container, potentially causing distortion.

Acceptable values are: `'contain'` | `'cover'` | `'fill'`

### `VideoMetadata`

Android

iOS

Contains information that will be displayed in the now playing notification
when the video is playing.

Property| Type| Description  
---|---|---  
artist(optional)| `string`| Only for: AndroidiOS  
Secondary text that will be displayed under the title.  
artwork(optional)| `string`| Only for: AndroidiOS  
The uri of the video artwork.  
title(optional)| `string`| Only for: AndroidiOS  
The title of the video.  
  
### `VideoPlayerEvents`

Android

iOS

tvOS

Web

Handlers for events which can be emitted by the player.

Property| Type| Description  
---|---|---  
audioTrackChange| `(payload: AudioTrackChangeEventPayload) => void`| Handler
for an event emitted when the current audio track changes.  
availableAudioTracksChange| `(payload: AvailableAudioTracksChangeEventPayload)
=> void`| Handler for an event emitted when the available audio tracks change.  
availableSubtitleTracksChange| `(payload:
AvailableSubtitleTracksChangeEventPayload) => void`| Handler for an event
emitted when the available subtitle tracks change.  
isExternalPlaybackActiveChange| `(payload:
IsExternalPlaybackActiveChangeEventPayload) => void`| Only for: iOS  
Handler for an event emitted when the video player starts or stops sharing the
video via AirPlay.  
mutedChange| `(payload: MutedChangeEventPayload) => void`| Handler for an
event emitted when the `muted` property of the player changes  
playbackRateChange| `(payload: PlaybackRateChangeEventPayload) => void`|
Handler for an event emitted when the `playbackRate` property of the player
changes.  
playingChange| `(payload: PlayingChangeEventPayload) => void`| Handler for an
event emitted when the player starts or stops playback.  
playToEnd| `() => void`| Handler for an event emitted when the player plays to
the end of the current source.  
sourceChange| `(payload: SourceChangeEventPayload) => void`| Handler for an
event emitted when the current media source of the player changes.  
sourceLoad| `(payload: SourceLoadEventPayload) => void`| Handler for an event
emitted when the player has finished loading metadata for the current video
source. This event is emitted when the player has finished metadata for a
`VideoSource`, but it doesn't mean that there is enough data buffered to start
the playback.  
statusChange| `(payload: StatusChangeEventPayload) => void`| Handler for an
event emitted when the status of the player changes.  
subtitleTrackChange| `(payload: SubtitleTrackChangeEventPayload) => void`|
Handler for an event emitted when the current subtitle track changes.  
timeUpdate| `(payload: TimeUpdateEventPayload) => void`| Handler for an event
emitted in a given interval specified by the `timeUpdateEventInterval`.  
videoTrackChange| `(payload: VideoTrackChangeEventPayload) => void`| Handler
for an event emitted when the current video track changes.  
volumeChange| `(payload: VolumeChangeEventPayload) => void`| Handler for an
event emitted when the `volume` of `muted` property of the player changes.  
  
### `VideoPlayerStatus`

Android

iOS

tvOS

Web

Literal Type: `string`

Describes the current status of the player.

  * `idle`: The player is not playing or loading any videos.
  * `loading`: The player is loading video data from the provided source
  * `readyToPlay`: The player has loaded enough data to start playing or to continue playback.
  * `error`: The player has encountered an error while loading or playing the video.

Acceptable values are: `'idle'` | `'loading'` | `'readyToPlay'` | `'error'`

### `VideoSize`

Android

iOS

tvOS

Web

Specifies the size of a video track.

Property| Type| Description  
---|---|---  
height| `number`| Height of the video track in pixels.  
width| `number`| Width of the video track in pixels.  
  
### `VideoSource`

Android

iOS

tvOS

Web

Type: `string` or `number` or `null` or `object` shaped as below:

Property| Type| Description  
---|---|---  
assetId(optional)| `number`| The asset ID of a local video asset, acquired
with the `require` function. This property is exclusive with the `uri`
property. When both are present, the `assetId` will be ignored.  
contentType(optional)| `ContentType`| Only for: AndroidiOS  
Specifies the content type of the video source. When set to `'auto'`, the
player will try to automatically determine the content type. You should use
this property when playing HLS, SmoothStreaming or DASH videos from an uri,
which does not contain a standardized extension for the corresponding media
type.Default:`'auto'`  
drm(optional)| `DRMOptions`| Specifies the DRM options which will be used by
the player while loading the video.  
headers(optional)| `Record<string, string>`| Only for: AndroidiOS  
Specifies headers sent with the video request.

> For DRM license headers use the `headers` field of `DRMOptions`.  
  
metadata(optional)| `VideoMetadata`| Only for: AndroidiOS  
Specifies information which will be displayed in the now playing notification.
When undefined the player will display information contained in the video
metadata.  
uri(optional)| `string`| The URI of the video. This property is exclusive with
the `assetId` property. When both are present, the `assetId` will be ignored.  
useCaching(optional)| `boolean`| Only for: AndroidiOS  
Specifies whether the player should use caching for the video.

> Due to platform limitations, the cache cannot be used with HLS video sources
> on iOS. Caching DRM-protected videos is not supported on Android and iOS.

Default:`false`  
  
### `VideoThumbnailOptions`

Android

iOS

tvOS

Web

Additional options for video thumbnails generation.

Property| Type| Description  
---|---|---  
maxHeight(optional)| `number`| Only for: AndroidiOS  
If provided, the generated thumbnail will not exceed this height in pixels,
preserving its aspect ratio.  
maxWidth(optional)| `number`| Only for: AndroidiOS  
If provided, the generated thumbnail will not exceed this width in pixels,
preserving its aspect ratio.  
  
### `VideoTrack`

Android

iOS

tvOS

Web

Specifies a VideoTrack loaded from a `VideoSource`.

Property| Type| Description  
---|---|---  
bitrate| `number | null`| Specifies the bitrate in bits per second. This is the peak bitrate if known, or else the average bitrate if known, or else null.  
frameRate| `number | null`| Specifies the frame rate of the video track in frames per second.  
id| `string`| The id of the video track.

> This field is platform-specific and may return different depending on the
> operating system.  
  
isSupported| `boolean`| Only for: Android  
Indicates whether the video track format is supported by the device.  
mimeType| `string | null`| MimeType of the video track or null if unknown.  
size| `VideoSize`| Size of the video track.  
  
### `VideoTrackChangeEventPayload`

Android

iOS

tvOS

Web

Data delivered with the `videoTrackChange` event, contains information about
the video track which is currently being played.

Property| Type| Description  
---|---|---  
oldVideoTrack(optional)| `VideoTrack | null`| Previous video track of the player.  
videoTrack| `VideoTrack | null`| New video track of the player.  
  
### `VolumeChangeEventPayload`

Android

iOS

tvOS

Web

Data delivered with the `volumeChange` event.

Property| Type| Description  
---|---|---  
oldVolume(optional)| `number`| Previous value of the `volume` property.  
volume| `number`| Float value indicating the current volume of the player.

