# ![Expo Video \(expo-av\) icon](/static/images/packages/expo-av.png)Expo
Video (expo-av)

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
av)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
av/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-av)

Ask AI

A library that provides an API to implement video playback and recording in
apps.

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

> Deprecated: The `Video` component from `expo-av`, which is documented on
> this page, has now been deprecated and replaced by an improved version in
> `expo-video`. [Learn about `expo-video`](/versions/latest/sdk/video).

The `Video` component from `expo-av` displays a video inline with the other UI
elements in your app.

Much of Video and Audio have common APIs that are documented in [AV
documentation](/versions/latest/sdk/av). This page covers video-specific props
and APIs. We encourage you to skim through this document to get basic video
working, and then move on to [AV documentation](/versions/latest/sdk/av) for
more advanced functionality. The audio experience of video (such as whether to
interrupt music already playing in another app, or whether to play sound while
the phone is on silent mode) can be customized using the [Audio
API](/versions/latest/sdk/audio).

## Installation

Terminal

Copy

`- ``npx expo install expo-av`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

Here's a simple example of a video with a play/pause button.

Video

Copy

Open in Snack

    
    
    import { useState, useRef } from 'react';
    import { View, StyleSheet, Button } from 'react-native';
    import { Video, ResizeMode } from 'expo-av';
    
    export default function App() {
      const video = useRef(null);
      const [status, setStatus] = useState({});
      return (
        <View style={styles.container}>
          <Video
            ref={video}
            style={styles.video}
            source={{
              uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
            }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            onPlaybackStatusUpdate={status => setStatus(() => status)}
          />
          <View style={styles.buttons}>
            <Button
              title={status.isPlaying ? 'Pause' : 'Play'}
              onPress={() =>
                status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
              }
            />
          </View>
        </View>
      );
    }
    
    %%placeholder-start%%const styles = StyleSheet.create({ ... }); %%placeholder-end%%const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
      },
      video: {
        alignSelf: 'center',
        width: 320,
        height: 200,
      },
      buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      },
    });
    

For more advanced examples, check out the [Playlist
example](https://github.com/expo/playlist-example/blob/master/App.js), and the
[custom `VideoPlayer` controls component](https://github.com/ihmpavel/expo-
video-player/blob/master/lib/index.tsx) that wraps `<Video>`, adds custom
controls and use the `<Video>` API extensively. The `VideoPlayer` controls is
used in [this app](https://github.com/expo/harvard-cs50-app).

## API

    
    
    import { Video } from 'expo-av';
    

## Component

### `Video`

Android

iOS

tvOS

Web

Type:
`React.[Component](https://react.dev/reference/react/Component)<VideoProps,
VideoState>`

The Video component props can be divided into following groups:

  * The `source` and `posterSource` props customize the source of the video content.
  * The `useNativeControls`, `resizeMode`, and `usePoster` props customize the UI of the component.
  * The `onPlaybackStatusUpdate`, `onReadyForDisplay`, and `onIOSFullscreenUpdate` props pass information of the state of the `Video` component.
  * The `onLoadStart`, `onLoad`, and `onError` props are also provided for backwards compatibility with `Image` (but they are redundant with `onPlaybackStatusUpdate`). Finally, the rest of props are available to control the playback of the video, but we recommend that, for finer control, you use the methods available on the `ref` described in the [AV documentation](/versions/latest/sdk/av).

VideoProps

### `audioPan`

Android

iOS

tvOS

Web

Optional • Type: `number`

The desired audio panning value of the audio for this media. This value must
be between `-1.0` (full left) and `1.0` (full right). See the [AV
documentation](/versions/latest/sdk/av) for more information.

### `isLooping`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

A boolean describing if the media should play once (`false`) or loop
indefinitely (`true`). See the [AV documentation](/versions/latest/sdk/av) for
more information.

### `isMuted`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

A boolean describing if the audio of this media should be muted. See the [AV
documentation](/versions/latest/sdk/av) for more information.

### `onError`

Android

iOS

tvOS

Web

Optional • Type: `(error: string) => void`

A function to be called if load or playback have encountered a fatal error.
The function is passed a single error message string as a parameter. Errors
sent here are also set on `playbackStatus.error` that are passed into the
`onPlaybackStatusUpdate` callback.

### `onFullscreenUpdate`

Android

iOS

tvOS

Web

Optional • Type: `(event: VideoFullscreenUpdateEvent) => void`

A function to be called when the state of the native iOS fullscreen view
changes (controlled via the `presentFullscreenPlayer()` and
`dismissFullscreenPlayer()` methods on the `Video`'s `ref`).

### `onLoad`

Android

iOS

tvOS

Web

Optional • Type: `(status:
[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)) => void`

A function to be called once the video has been loaded. The data is streamed
so all of it may not have been fetched yet, just enough to render the first
frame. The function is called with the `AVPlaybackStatus` of the video as its
parameter. See the [AV documentation](/versions/latest/sdk/av) for further
information.

### `onLoadStart`

Android

iOS

tvOS

Web

Optional • Type: `() => void`

A function to be called when the video begins to be loaded into memory. Called
without any arguments.

### `onPlaybackStatusUpdate`

Android

iOS

tvOS

Web

Optional • Type: `(status:
[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)) => void`

A function to be called regularly with the `AVPlaybackStatus` of the video.
You will likely be using this a lot. See the [AV
documentation](/versions/latest/sdk/av) for further information on
`onPlaybackStatusUpdate`, and the interval at which it is called.

### `onReadyForDisplay`

Android

iOS

tvOS

Web

Optional • Type: `(event: VideoReadyForDisplayEvent) => void`

A function to be called when the video is ready for display. Note that this
function gets called whenever the video's natural size changes.

### `positionMillis`

Android

iOS

tvOS

Web

Optional • Type: `number`

The desired position of playback in milliseconds. See the [AV
documentation](/versions/latest/sdk/av) for more information.

### `PosterComponent`

Android

iOS

tvOS

Web

Optional • Type: `React.ComponentType<{  source: ImageProps[source],  style:
ImageProps[style] }>`

A react-native `Image` like component to display the poster image.

### `posterSource`

Android

iOS

tvOS

Web

Optional • Type: `ImageProps[source]`

The source of an optional image to display over the video while it is loading.
The following forms are supported:

  * A dictionary of the form `{ uri: 'http://path/to/file' }` with a network URL pointing to an image file on the web.
  * `require('path/to/file')` for an image file asset in the source code directory.

### `posterStyle`

Android

iOS

tvOS

Web

Optional • Type: `ImageProps[style]`

An optional property to pass custom styles to the poster image.

### `progressUpdateIntervalMillis`

Android

iOS

tvOS

Web

Optional • Type: `number`

A number describing the new minimum interval in milliseconds between calls of
`onPlaybackStatusUpdate`. See the [AV documentation](/versions/latest/sdk/av)
for more information.

### `rate`

Android

iOS

tvOS

Web

Optional • Type: `number`

The desired playback rate of the media. This value must be between `0.0` and
`32.0`. Only available on Android API version 23 and later and iOS. See the
[AV documentation](/versions/latest/sdk/av) for more information.

### `resizeMode`

Android

iOS

tvOS

Web

Optional • Type: `ResizeMode`

A string describing how the video should be scaled for display in the
component view bounds. Must be one of the `ResizeMode` enum values.

### `shouldCorrectPitch`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

A boolean describing if we should correct the pitch for a changed rate. If set
to `true`, the pitch of the audio will be corrected (so a rate different than
`1.0` will timestretch the audio). See the [AV
documentation](/versions/latest/sdk/av) for more information.

### `shouldPlay`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

A boolean describing if the media is supposed to play. Playback may not start
immediately after setting this value for reasons such as buffering. Make sure
to update your UI based on the `isPlaying` and `isBuffering` properties of the
`AVPlaybackStatus`. See the [AV documentation](/versions/latest/sdk/av) for
more information.

### `source`

Android

iOS

tvOS

Web

Optional • Type:
`[AVPlaybackSource](/versions/latest/sdk/av#avplaybacksource)`

The source of the video data to display. If this prop is `null`, or left
blank, the video component will display nothing. Note that this can also be
set on the `ref` via `loadAsync()`. See the [AV
documentation](/versions/latest/sdk/av) for further information.

> See: The [Android developer
> documentation](https://developer.android.com/guide/topics/media/platform/supported-
> formats#video-formats) and the [iOS developer
> documentation](https://developer.apple.com/documentation/coremedia/1564239-video_codec_constants)
> lists of the video formats supported on Android and iOS.

### `status`

Android

iOS

tvOS

Web

Optional • Type:
`[AVPlaybackStatusToSet](/versions/latest/sdk/av#avplaybackstatustoset)`

A dictionary setting a new `AVPlaybackStatusToSet` on the video. See the [AV
documentation](/versions/latest/sdk/av#default-initial--avplaybackstatustoset)
for more information on `AVPlaybackStatusToSet`.

### `useNativeControls`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

A boolean which, if set to `true`, will display native playback controls (such
as play and pause) within the `Video` component. If you'd prefer to use custom
controls, you can write them yourself, and/or check out the [`VideoPlayer`
component](https://github.com/ihmpavel/expo-video-player).

### `usePoster`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

A boolean which, if set to `true`, will display an image (whose source is set
via the prop `posterSource`) while the video is loading.

### `videoStyle`

Android

iOS

tvOS

Web

Optional • Type: `StyleProp<[ViewStyle](https://reactnative.dev/docs/view-
style-props)>`

An optional property to pass custom styles to the internal video component.

### `volume`

Android

iOS

tvOS

Web

Optional • Type: `number`

The desired volume of the audio for this media. This value must be between
`0.0` (silence) and `1.0` (maximum volume). See the [AV
documentation](/versions/latest/sdk/av) for more information.

#### Inherited Props

  * `[ViewProps](https://reactnative.dev/docs/view#props)`

## Component Methods

### `dismissFullscreenPlayer()`

Android

iOS

tvOS

Web

This dismisses the fullscreen video view.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

A `Promise` that is fulfilled with the `AVPlaybackStatus` of the video once
the fullscreen player has finished dismissing, or rejects if there was an
error, or if this was called on an Android device.

### `presentFullscreenPlayer()`

Android

iOS

tvOS

Web

This presents a fullscreen view of your video component on top of your app's
UI. Note that even if `useNativeControls` is set to `false`, native controls
will be visible in fullscreen mode.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)>`

A `Promise` that is fulfilled with the `AVPlaybackStatus` of the video once
the fullscreen player has finished presenting, or rejects if there was an
error, or if this was called on an Android device.

### `setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
onPlaybackStatusUpdate| `null | (status: [AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)) => void`| A function taking a single parameter `AVPlaybackStatus`.  
  
  

Sets a function to be called regularly with the `AVPlaybackStatus` of the
playback object.

`onPlaybackStatusUpdate` will be called whenever a call to the API for this
playback object completes (such as `setStatusAsync()`, `getStatusAsync()`, or
`unloadAsync()`), nd will also be called at regular intervals while the media
is in the loaded state.

Set `progressUpdateIntervalMillis` via `setStatusAsync()` or
`setProgressUpdateIntervalAsync()` to modify the interval with which
`onPlaybackStatusUpdate` is called while loaded.

Returns:

`void`

## Types

### `VideoFullscreenUpdateEvent`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
fullscreenUpdate| `VideoFullscreenUpdate`| The kind of the fullscreen update.  
status(optional)|
`[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)`| The
`AVPlaybackStatus` of the video. See the [AV
documentation](/versions/latest/sdk/av) for further information.  
  
### `VideoNaturalSize`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
height| `number`| A number describing the height in pixels of the video data.  
orientation| `'portrait' | 'landscape'`| A string describing the natural orientation of the video data.  
width| `number`| A number describing the width in pixels of the video data.  
  
### `VideoReadyForDisplayEvent`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
naturalSize| `VideoNaturalSize`| An object containing the basic data about
video size.  
status(optional)|
`[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)`| The
`AVPlaybackStatus` of the video. See the [AV
documentation](/versions/latest/sdk/av#playback-status) for further
information.  
  
### `VideoState`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
showPoster| `boolean`| -  
  
## Enums

### `ResizeMode`

Android

iOS

tvOS

Web

#### `CONTAIN`

`ResizeMode.CONTAIN ＝ "contain"`

Fit within component bounds while preserving aspect ratio.

#### `COVER`

`ResizeMode.COVER ＝ "cover"`

Fill component bounds while preserving aspect ratio.

#### `STRETCH`

`ResizeMode.STRETCH ＝ "stretch"`

Stretch to fill component bounds.

### `VideoFullscreenUpdate`

Android

iOS

tvOS

Web

#### `PLAYER_WILL_PRESENT`

`VideoFullscreenUpdate.PLAYER_WILL_PRESENT ＝ 0`

Describing that the fullscreen player is about to present.

#### `PLAYER_DID_PRESENT`

`VideoFullscreenUpdate.PLAYER_DID_PRESENT ＝ 1`

Describing that the fullscreen player just finished presenting.

#### `PLAYER_WILL_DISMISS`

`VideoFullscreenUpdate.PLAYER_WILL_DISMISS ＝ 2`

Describing that the fullscreen player is about to dismiss.

#### `PLAYER_DID_DISMISS`

`VideoFullscreenUpdate.PLAYER_DID_DISMISS ＝ 3`

Describing that the fullscreen player just finished dismissing.

## Unified API

The rest of the API on the `Video` component `ref` is the same as the API for
`Audio.Sound` \- see the [AV documentation](/versions/latest/sdk/av#playback)
for further information.

