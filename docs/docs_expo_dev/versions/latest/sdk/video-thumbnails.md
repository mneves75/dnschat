# Expo VideoThumbnails

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-video-
thumbnails)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
video-thumbnails/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-video-
thumbnails)

Ask AI

A library that allows you to generate an image to serve as a thumbnail from a
video file.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-video-
thumbnails)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
video-thumbnails/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-video-
thumbnails)

Ask AI

Android

iOS

tvOS

Bundled version:

~10.0.7

Copy

* * *

`expo-video-thumbnails` allows you to generate an image to serve as a
thumbnail from a video file.

## Installation

Terminal

Copy

`- ``npx expo install expo-video-thumbnails`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

Video Thumbnails

Copy

Open in Snack

    
    
    import { useState } from 'react';
    import { StyleSheet, Button, View, Image, Text } from 'react-native';
    import * as VideoThumbnails from 'expo-video-thumbnails';
    
    export default function App() {
      const [image, setImage] = useState(null);
    
      const generateThumbnail = async () => {
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(
            'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
            {
              time: 15000,
            }
          );
          setImage(uri);
        } catch (e) {
          console.warn(e);
        }
      };
    
      return (
        <View style={styles.container}>
          <Button onPress={generateThumbnail} title="Generate thumbnail" />
          {image && <Image source={{ uri: image }} style={styles.image} />}
          <Text>{image}</Text>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
      },
      image: {
        width: 200,
        height: 200,
      },
    });
    

## API

    
    
    import * as VideoThumbnails from 'expo-video-thumbnails';
    

## Methods

### `VideoThumbnails.getThumbnailAsync(sourceFilename, options)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
sourceFilename| `string`| An URI of the video, local or remote.  
options(optional)| `VideoThumbnailsOptions`| A map defining how modified
thumbnail should be created.Default:`{}`  
  
  

Create an image thumbnail from video provided via `sourceFilename`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<VideoThumbnailsResult>`

Returns a promise which fulfils with `VideoThumbnailsResult`.

## Types

### `VideoThumbnailsOptions`

Android

iOS

tvOS

Property| Type| Description  
---|---|---  
headers(optional)| `Record<string, string>`| In case `sourceFilename` is a
remote URI, `headers` object is passed in a network request.  
quality(optional)| `number`| A value in range `0.0` \- `1.0` specifying
quality level of the result image. `1` means no compression (highest quality)
and `0` the highest compression (lowest quality).  
time(optional)| `number`| The time position where the image will be retrieved
in ms.  
  
### `VideoThumbnailsResult`

Android

iOS

tvOS

Property| Type| Description  
---|---|---  
height| `number`| Height of the created image.  
uri| `string`| URI to the created image (usable as the source for an
Image/Video element).  
width| `number`| Width of the created image.

