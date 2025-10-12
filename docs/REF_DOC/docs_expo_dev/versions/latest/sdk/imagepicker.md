# ![Expo ImagePicker icon](/static/images/packages/expo-image-picker.png)Expo
ImagePicker

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-image-
picker)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
image-picker/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-image-
picker)

Ask AI

A library that provides access to the system's UI for selecting images and
videos from the phone's library or taking a photo with the camera.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-image-
picker)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
image-picker/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-image-
picker)

Ask AI

Android

iOS

Web

Bundled version:

~17.0.8

Copy

* * *

`expo-image-picker` provides access to the system's UI for selecting images
and videos from the phone's library or taking a photo with the camera.

## Installation

Terminal

Copy

`- ``npx expo install expo-image-picker`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

#### Known issues

iOS

On iOS, when an image (usually of a [higher
resolution](http://www.openradar.me/49866214)) is picked from the camera roll,
the result of the cropped image gives the wrong value for the cropped
rectangle in some cases. Unfortunately, this issue is with the underlying
`UIImagePickerController` due to a bug in the closed-source tools built into
iOS.

## Configuration in app config

You can configure `expo-image-picker` using its built-in [config
plugin](/config-plugins/introduction) if you use config plugins in your
project ([EAS Build](/build/introduction) or `npx expo run:[android|ios]`).
The plugin allows you to configure various properties that cannot be set at
runtime and require building a new app binary to take effect.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "plugins": [
          [
            "expo-image-picker",
            {
              "photosPermission": "The app accesses your photos to let you share them with your friends."
            }
          ]
        ]
      }
    }
    

### Configurable properties

Name| Default| Description  
---|---|---  
`photosPermission`| `"Allow $(PRODUCT_NAME) to access your photos"`| Only for:
iOS  
A string to set the `NSPhotoLibraryUsageDescription` permission message.  
`cameraPermission`| `"Allow $(PRODUCT_NAME) to access your camera"`| Only for:
iOS  
A string to set the `NSCameraUsageDescription` permission message.  
`microphonePermission`| `"Allow $(PRODUCT_NAME) to access your microphone"`|
Only for: iOS  
A string to set the `NSMicrophoneUsageDescription` permission message.  
  
Are you using this library in an existing React Native app?

If you're not using Continuous Native Generation ([CNG](/workflow/continuous-
native-generation)) or you're using a native ios project manually, then you
need to add `NSPhotoLibraryUsageDescription`, `NSCameraUsageDescription`, and
`NSMicrophoneUsageDescription` keys to your ios/[app]/Info.plist:

Info.plist

Copy

    
    
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Give $(PRODUCT_NAME) permission to save photos</string>
    <key>NSCameraUsageDescription</key>
    <string>Give $(PRODUCT_NAME) permission to access your camera</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>Give $(PRODUCT_NAME) permission to use your microphone</string>
    

## Usage

Image Picker

Copy

Open in Snack

    
    
    import { useState } from 'react';
    import { Button, Image, View, StyleSheet } from 'react-native';
    import * as ImagePicker from 'expo-image-picker';
    
    export default function ImagePickerExample() {
      const [image, setImage] = useState<string | null>(null);
    
      const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images', 'videos'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        console.log(result);
    
        if (!result.canceled) {
          setImage(result.assets[0].uri);
        }
      };
    
      return (
        <View style={styles.container}>
          <Button title="Pick an image from camera roll" onPress={pickImage} />
          {image && <Image source={{ uri: image }} style={styles.image} />}
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      image: {
        width: 200,
        height: 200,
      },
    });
    

When you run this example and pick an image, you will see the image that you
picked show up in your app, and a similar log will be shown in the console:

    
    
    {
      "assets": [
        {
          "assetId": "C166F9F5-B5FE-4501-9531",
          "base64": null,
          "duration": null,
          "exif": null,
          "fileName": "IMG.HEIC",
          "fileSize": 6018901,
          "height": 3025,
          "type": "image",
          "uri": "file:///data/user/0/host.exp.exponent/cache/cropped1814158652.jpg"
          "width": 3024
        }
      ],
      "canceled": false
    }
    

### With AWS S3

[AWS storage exampleAn example of how to use AWS storage can be found in with-
aws-storage-upload.](https://github.com/expo/examples/tree/master/with-aws-
storage-upload)

See [Amplify documentation](https://docs.amplify.aws/) guide to set up your
project correctly.

### With Firebase

[Firebase storage exampleAn example of how to use Firebase storage can be
found in with-firebase-storage-
upload.](https://github.com/expo/examples/tree/master/with-firebase-storage-
upload)

See [Using Firebase](/guides/using-firebase) guide to set up your project
correctly.

## API

    
    
    import * as ImagePicker from 'expo-image-picker';
    

## Hooks

### `useCameraPermissions(options)`

Android

iOS

Web

Parameter| Type  
---|---  
options(optional)| `PermissionHookOptions<object>`  
  
  

Check or request permissions to access the camera. This uses both
`requestCameraPermissionsAsync` and `getCameraPermissionsAsync` to interact
with the permissions.

Returns:

`[null | PermissionResponse, RequestPermissionMethod<PermissionResponse>, GetPermissionMethod<PermissionResponse>]`

Example

    
    
    const [status, requestPermission] = ImagePicker.useCameraPermissions();
    

### `useMediaLibraryPermissions(options)`

Android

iOS

Web

Parameter| Type  
---|---  
options(optional)| `PermissionHookOptions<{  writeOnly: boolean }>`  
  
  

Check or request permissions to access the media library. This uses both
`requestMediaLibraryPermissionsAsync` and `getMediaLibraryPermissionsAsync` to
interact with the permissions.

Returns:

`[null | MediaLibraryPermissionResponse, RequestPermissionMethod<MediaLibraryPermissionResponse>, GetPermissionMethod<MediaLibraryPermissionResponse>]`

Example

    
    
    const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();
    

## Methods

### `ImagePicker.getCameraPermissionsAsync()`

Android

iOS

Web

Checks user's permissions for accessing camera.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<CameraPermissionResponse>`

A promise that fulfills with an object of type CameraPermissionResponse.

### `ImagePicker.getMediaLibraryPermissionsAsync(writeOnly)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
writeOnly(optional)| `boolean`| Whether to request write or read and write
permissions. Defaults to `false`Default:`false`  
  
  

Checks user's permissions for accessing photos.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<MediaLibraryPermissionResponse>`

A promise that fulfills with an object of type MediaLibraryPermissionResponse.

### `ImagePicker.getPendingResultAsync()`

Android

iOS

Web

Android system sometimes kills the `MainActivity` after the `ImagePicker`
finishes. When this happens, we lose the data selected using the
`ImagePicker`. However, you can retrieve the lost data by calling
`getPendingResultAsync`. You can test this functionality by turning on `Don't
keep activities` in the developer options.

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<ImagePickerResult | ImagePickerErrorResult | null>`

  * On Android: a promise that resolves to an object of exactly same type as in `ImagePicker.launchImageLibraryAsync` or `ImagePicker.launchCameraAsync` if the `ImagePicker` finished successfully. Otherwise, an object of type `ImagePickerErrorResult`.
  * On other platforms: `null`

### `ImagePicker.launchCameraAsync(options)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
options(optional)| `ImagePickerOptions`| An `ImagePickerOptions`
object.Default:`{}`  
  
  

Display the system UI for taking a photo with the camera. Requires
`Permissions.CAMERA`. On Android and iOS 10 `Permissions.CAMERA_ROLL` is also
required. On mobile web, this must be called immediately in a user interaction
like a button press, otherwise the browser will block the request without a
warning.

> Note: Make sure that you handle `MainActivity` destruction on Android. See
> ImagePicker.getPendingResultAsync. Notes for Web: The system UI can only be
> shown after user activation (e.g. a `Button` press). Therefore, calling
> `launchCameraAsync` in `componentDidMount`, for example, will not work as
> intended. The `cancelled` event will not be returned in the browser due to
> platform restrictions and inconsistencies across browsers.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<ImagePickerResult>`

A promise that resolves to an object with `canceled` and `assets` fields. When
the user canceled the action the `assets` is always `null`, otherwise it's an
array of the selected media assets which have a form of `ImagePickerAsset`.

### `ImagePicker.launchImageLibraryAsync(options)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
options(optional)| `ImagePickerOptions`| An object extended by
`ImagePickerOptions`.Default:`{}`  
  
  

Display the system UI for choosing an image or a video from the phone's
library. Requires `Permissions.MEDIA_LIBRARY` on iOS 10 only. On mobile web,
this must be called immediately in a user interaction like a button press,
otherwise the browser will block the request without a warning.

Animated GIFs support: On Android, if the selected image is an animated GIF,
the result image will be an animated GIF too if and only if `quality` is
explicitly set to `1.0` and `allowsEditing` is set to `false`. Otherwise
compression and/or cropper will pick the first frame of the GIF and return it
as the result (on Android the result will be a PNG). On iOS, both quality and
cropping are supported.

> Notes for Web: The system UI can only be shown after user activation (e.g. a
> `Button` press). Therefore, calling `launchImageLibraryAsync` in
> `componentDidMount`, for example, will not work as intended. The `cancelled`
> event will not be returned in the browser due to platform restrictions and
> inconsistencies across browsers.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<ImagePickerResult>`

A promise that resolves to an object with `canceled` and `assets` fields. When
the user canceled the action the `assets` is always `null`, otherwise it's an
array of the selected media assets which have a form of `ImagePickerAsset`.

### `ImagePicker.requestCameraPermissionsAsync()`

Android

iOS

Web

Asks the user to grant permissions for accessing camera. This does nothing on
web because the browser camera is not used.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<CameraPermissionResponse>`

A promise that fulfills with an object of type CameraPermissionResponse.

### `ImagePicker.requestMediaLibraryPermissionsAsync(writeOnly)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
writeOnly(optional)| `boolean`| Whether to request write or read and write
permissions. Defaults to `false`Default:`false`  
  
  

Asks the user to grant permissions for accessing user's photo. This method
does nothing on web.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<MediaLibraryPermissionResponse>`

A promise that fulfills with an object of type MediaLibraryPermissionResponse.

## Types

### `CameraPermissionResponse`

Android

iOS

Web

Type: `PermissionResponse`

Alias for `PermissionResponse` type exported by `expo-modules-core`.

### `CropShape`

Android

iOS

Web

Literal Type: `string`

The shape of the crop area.

Acceptable values are: `'rectangle'` | `'oval'`

### `DefaultTab`

Android

Literal Type: `string`

The default tab with which the image picker will be opened.

  * `'photos'` \- the photos/videos tab will be opened.
  * `'albums'` \- the albums tab will be opened.

Acceptable values are: `'photos'` | `'albums'`

### `ImagePickerAsset`

Android

iOS

Web

Represents an asset (image or video) returned by the image picker or camera.

Property| Type| Description  
---|---|---  
assetId(optional)| `string | null`| Only for: AndroidiOS  
The unique ID that represents the picked image or video, if picked from the
library. It can be used by [expo-media-library](/versions/latest/sdk/media-
library) to manage the picked asset.

> This might be `null` when the ID is unavailable or the user gave limited
> permission to access the media library. On Android, the ID is unavailable
> when the user selects a photo by directly browsing file system.  
  
base64(optional)| `string | null`| When the `base64` option is truthy, it is a Base64-encoded string of the selected image's JPEG data, otherwise `null`. If you prepend this with `'data:image/jpeg;base64,'` to create a data URI, you can use it as the source of an `Image` element; for example:
    
    
    <Image
      source={{ uri: 'data:image/jpeg;base64,' + asset.base64 }}
      style={{ width: 200, height: 200 }}
    />
      
  
duration(optional)| `number | null`| Length of the video in milliseconds or `null` if the asset is not a video.  
exif(optional)| `Record<string, any> | null`| Only for: AndroidiOS  
The `exif` field is included if the `exif` option is truthy, and is an object
containing the image's EXIF data. The names of this object's properties are
EXIF tags and the values are the respective EXIF values for those tags.  
file(optional)| `File`| Only for: Web  
The web `File` object containing the selected media. This property is web-only
and can be used to upload to a server with `FormData`.  
fileName(optional)| `string | null`| Preferred filename to use when saving this item. This might be `null` when the name is unavailable or user gave limited permission to access the media library.  
fileSize(optional)| `number`| File size of the picked image or video, in
bytes.  
height| `number`| Height of the image or video.  
mimeType(optional)| `string`| The MIME type of the selected asset or `null` if
could not be determined.  
pairedVideoAsset(optional)| `ImagePickerAsset | null`| Only for: iOS  
Contains information about the video paired with the image file. This property
is only set when `livePhotos` media type was present in the `mediaTypes` array
when launching the picker and a live photo was selected.  
type(optional)| `'image' | 'video' | 'livePhoto' | 'pairedVideo'`| The type of the asset.

  * `'image'` \- for images.
  * `'video'` \- for videos.
  * `'livePhoto'` \- for live photos. (iOS only)
  * `'pairedVideo'` \- for videos paired with photos, which can be combined to create a live photo. (iOS only)

  
uri| `string`| URI to the local image or video file (usable as the source of
an `Image` element, in the case of an image) and `width` and `height` specify
the dimensions of the media.  
width| `number`| Width of the image or video.  
  
### `ImagePickerCanceledResult`

Android

iOS

Web

Type representing canceled pick result.

Property| Type| Description  
---|---|---  
assets| `null`| `null` signifying that the request was canceled.  
canceled| `true`| Boolean flag set to `true` showing that the request was
canceled.  
  
### `ImagePickerErrorResult`

Android

iOS

Web

Property| Type| Description  
---|---|---  
code| `string`| The error code.  
exception(optional)| `string`| The exception which caused the error.  
message| `string`| The error message.  
  
### `ImagePickerOptions`

Android

iOS

Web

Property| Type| Description  
---|---|---  
allowsEditing(optional)| `boolean`| Only for: AndroidiOS  
Whether to show a UI to edit the image after it is picked. On Android the user
can crop and rotate the image and on iOS simply crop it.

>   * Cropping multiple images is not supported - this option is mutually
> exclusive with `allowsMultipleSelection`.
>   * On iOS, this option is ignored if `allowsMultipleSelection` is enabled.
>   * On iOS cropping a `.bmp` image will convert it to `.png`.
>

Default:`false`  
allowsMultipleSelection(optional)| `boolean`| Only for: AndroidiOS 14+Web  
Whether or not to allow selecting multiple media files at once.

> Cropping multiple images is not supported - this option is mutually
> exclusive with `allowsEditing`. If this option is enabled, then
> `allowsEditing` is ignored.

Default:`false`  
aspect(optional)| `[number, number]`| An array with two entries `[x, y]`
specifying the aspect ratio to maintain if the user is allowed to edit the
image (by passing `allowsEditing: true`). This is only applicable on Android,
since on iOS the crop rectangle is always a square.  
base64(optional)| `boolean`| Whether to also include the image data in Base64
format.  
cameraType(optional)| `CameraType`| Selects the camera-facing type. The
`CameraType` enum provides two options: `front` for the front-facing camera
and `back` for the back-facing camera.

  * On Android, the behavior of this option may vary based on the camera app installed on the device.
  * On Web, if this option is not provided, use "camera" as the default value of internal input element for backwards compatibility.

Default:`CameraType.back`  
defaultTab(optional)| `DefaultTab`| Only for: Android  
Choose the default tab with which the image picker will be
opened.Default:`'photos'`  
exif(optional)| `boolean`| Only for: AndroidiOS  
Whether to also include the EXIF data for the image. On iOS the EXIF data does
not include GPS tags in the camera case.  
legacy(optional)| `boolean`| Only for: Android  
Uses the legacy image picker on Android. This will allow media to be selected
from outside the users photo library.Default:`false`  
mediaTypes(optional)| `MediaType | MediaType[] | MediaTypeOptions`| Choose what type of media to pick.Default:`'images'`  
orderedSelection(optional)| `boolean`| Only for: iOS 15+  
Whether to display number badges when assets are selected. The badges are
numbered in selection order. Assets are then returned in the exact same order
they were selected.

> Assets should be returned in the selection order regardless of this option,
> but there is no guarantee that it is always true when this option is
> disabled.

Default:`false`  
preferredAssetRepresentationMode(optional)|
`UIImagePickerPreferredAssetRepresentationMode`| Only for: iOS 14+  
Choose [preferred asset representation
mode](https://developer.apple.com/documentation/photokit/phpickerconfigurationassetrepresentationmode)
to use when loading
assets.Default:`ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Automatic`  
presentationStyle(optional)| `UIImagePickerPresentationStyle`| Only for: iOS  
Choose [presentation
style](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621355-modalpresentationstyle?language=objc)
to customize view during taking
photo/video.Default:`ImagePicker.UIImagePickerPresentationStyle.Automatic`  
quality(optional)| `number`| Only for: AndroidiOS  
Specify the quality of compression, from `0` to `1`. `0` means compress for
small size, `1` means compress for maximum quality.

> Note: If the selected image has been compressed before, the size of the
> output file may be bigger than the size of the original image.

> Note: On iOS, if a `.bmp` or `.png` image is selected from the library, this
> option is ignored.

Default:`1.0`  
selectionLimit(optional)| `number`| Only for: AndroidiOS 14+  
The maximum number of items that user can select. Applicable when
`allowsMultipleSelection` is enabled. Setting the value to `0` sets the
selection limit to the maximum that the system supports.Default:`0`  
shape(optional)| `CropShape`| Only for: Android  
Specify the shape of the crop area if the user is allowed to edit the image
(by passing `allowsEditing: true`). This option is only applicable on
Android.Default:`rectangle`  
videoExportPreset(optional)| `VideoExportPreset`|

> Deprecated See
> [`videoExportPreset`](https://developer.apple.com/documentation/uikit/uiimagepickercontroller/2890964-videoexportpreset?language=objc)
> in Apple documentation.

iOS 11+Specify preset which will be used to compress selected
video.Default:`ImagePicker.VideoExportPreset.Passthrough`  
videoMaxDuration(optional)| `number`| Maximum duration, in seconds, for video
recording. Setting this to `0` disables the limit. Defaults to `0` (no limit).

  * On iOS, when `allowsEditing` is set to `true`, maximum duration is limited to 10 minutes. This limit is applied automatically, if `0` or no value is specified.
  * On Android, effect of this option depends on support of installed camera app.
  * On Web this option has no effect - the limit is browser-dependant.

  
videoQuality(optional)| `UIImagePickerControllerQualityType`| Only for: iOS  
Specify the quality of recorded videos. Defaults to the highest quality
available for the
device.Default:`ImagePicker.UIImagePickerControllerQualityType.High`  
  
### `ImagePickerResult`

Android

iOS

Web

Literal Type: `union`

Type representing successful and canceled pick result.

Acceptable values are: `ImagePickerSuccessResult` | `ImagePickerCanceledResult`

### `ImagePickerSuccessResult`

Android

iOS

Web

Type representing successful pick result.

Property| Type| Description  
---|---|---  
assets| `ImagePickerAsset[]`| An array of picked assets.  
canceled| `false`| Boolean flag set to `false` showing that the request was
successful.  
  
### `MediaLibraryPermissionResponse`

Android

iOS

Web

Extends `PermissionResponse` type exported by `expo-modules-core`, containing
additional iOS-specific field.

Type: `PermissionResponse` extended by:

Property| Type| Description  
---|---|---  
accessPrivileges(optional)| `'all' | 'limited' | 'none'`| Indicates if your app has access to the whole or only part of the photo library. Possible values are:

  * `'all'` if the user granted your app access to the whole photo library
  * `'limited'` if the user granted your app access only to selected photos (only available on Android API 34+ and iOS 14.0+)
  * `'none'` if user denied or hasn't yet granted the permission

  
  
### `MediaType`

Android

iOS

Web

Literal Type: `string`

Media types that can be picked by the image picker.

  * `'images'` \- for images.
  * `'videos'` \- for videos.
  * `'livePhotos'` \- for live photos (iOS only).

> When the `livePhotos` type is added to the media types array and a live
> photo is selected, the resulting `ImagePickerAsset` will contain an
> unaltered image and the `pairedVideoAsset` field will contain a video asset
> paired with the image. This option will be ignored when the `allowsEditing`
> option is enabled. Due to platform limitations live photos are returned at
> original quality, regardless of the `quality` option.

> When on Android or Web `livePhotos` type passed as a media type will be
> ignored.

Acceptable values are: `'images'` | `'videos'` | `'livePhotos'`

### `PermissionExpiration`

Android

iOS

Web

Literal Type: `union`

Permission expiration time. Currently, all permissions are granted
permanently.

Acceptable values are: `'never'` | `number`

### `PermissionHookOptions`

Android

iOS

Web

Literal Type: `union`

Acceptable values are: `PermissionHookBehavior` | `Options`

### `PermissionResponse`

Android

iOS

Web

An object obtained by permissions get and request functions.

Property| Type| Description  
---|---|---  
canAskAgain| `boolean`| Indicates if user can be asked again for specific
permission. If not, one should be directed to the Settings app in order to
enable/disable the permission.  
expires| `PermissionExpiration`| Determines time when the permission expires.  
granted| `boolean`| A convenience boolean that indicates if the permission is
granted.  
status| `PermissionStatus`| Determines the status of the permission.  
  
## Enums

### `CameraType`

Android

iOS

Web

#### `back`

`CameraType.back ＝ "back"`

Back/rear camera.

#### `front`

`CameraType.front ＝ "front"`

Front camera

> Deprecated To set media types available in the image picker use an array of
> `MediaType` instead.

### `MediaTypeOptions`

Android

iOS

Web

#### `All`

`MediaTypeOptions.All ＝ "All"`

Images and videos.

#### `Images`

`MediaTypeOptions.Images ＝ "Images"`

Only images.

#### `Videos`

`MediaTypeOptions.Videos ＝ "Videos"`

Only videos.

### `PermissionStatus`

Android

iOS

Web

#### `DENIED`

`PermissionStatus.DENIED ＝ "denied"`

User has denied the permission.

#### `GRANTED`

`PermissionStatus.GRANTED ＝ "granted"`

User has granted the permission.

#### `UNDETERMINED`

`PermissionStatus.UNDETERMINED ＝ "undetermined"`

User hasn't granted or denied the permission yet.

### `UIImagePickerControllerQualityType`

Android

iOS

Web

#### `High`

`UIImagePickerControllerQualityType.High ＝ 0`

Highest available resolution.

#### `Medium`

`UIImagePickerControllerQualityType.Medium ＝ 1`

Depends on the device.

#### `Low`

`UIImagePickerControllerQualityType.Low ＝ 2`

Depends on the device.

#### `VGA640x480`

`UIImagePickerControllerQualityType.VGA640x480 ＝ 3`

640 × 480

#### `IFrame1280x720`

`UIImagePickerControllerQualityType.IFrame1280x720 ＝ 4`

1280 × 720

#### `IFrame960x540`

`UIImagePickerControllerQualityType.IFrame960x540 ＝ 5`

960 × 540

### `UIImagePickerPreferredAssetRepresentationMode`

iOS

Picker preferred asset representation mode. Its values are directly mapped to
the
[`PHPickerConfigurationAssetRepresentationMode`](https://developer.apple.com/documentation/photokit/phpickerconfigurationassetrepresentationmode).

#### `Automatic`

`UIImagePickerPreferredAssetRepresentationMode.Automatic ＝ "automatic"`

A mode that indicates that the system chooses the appropriate asset
representation.

#### `Compatible`

`UIImagePickerPreferredAssetRepresentationMode.Compatible ＝ "compatible"`

A mode that uses the most compatible asset representation.

#### `Current`

`UIImagePickerPreferredAssetRepresentationMode.Current ＝ "current"`

A mode that uses the current representation to avoid transcoding, if possible.

### `UIImagePickerPresentationStyle`

iOS

Picker presentation style. Its values are directly mapped to the
[`UIModalPresentationStyle`](https://developer.apple.com/documentation/uikit/uiviewcontroller/1621355-modalpresentationstyle).

#### `AUTOMATIC`

iOS

`UIImagePickerPresentationStyle.AUTOMATIC ＝ "automatic"`

The default presentation style chosen by the system. On older iOS versions,
falls back to `WebBrowserPresentationStyle.FullScreen`.

#### `CURRENT_CONTEXT`

`UIImagePickerPresentationStyle.CURRENT_CONTEXT ＝ "currentContext"`

A presentation style where the picker is displayed over the app's content.

#### `FORM_SHEET`

`UIImagePickerPresentationStyle.FORM_SHEET ＝ "formSheet"`

A presentation style that displays the picker centered in the screen.

#### `FULL_SCREEN`

`UIImagePickerPresentationStyle.FULL_SCREEN ＝ "fullScreen"`

A presentation style in which the presented picker covers the screen.

#### `OVER_CURRENT_CONTEXT`

`UIImagePickerPresentationStyle.OVER_CURRENT_CONTEXT ＝ "overCurrentContext"`

A presentation style where the picker is displayed over the app's content.

#### `OVER_FULL_SCREEN`

`UIImagePickerPresentationStyle.OVER_FULL_SCREEN ＝ "overFullScreen"`

A presentation style in which the picker view covers the screen.

#### `PAGE_SHEET`

`UIImagePickerPresentationStyle.PAGE_SHEET ＝ "pageSheet"`

A presentation style that partially covers the underlying content.

#### `POPOVER`

`UIImagePickerPresentationStyle.POPOVER ＝ "popover"`

A presentation style where the picker is displayed in a popover view.

### `VideoExportPreset`

Android

iOS

Web

#### `Passthrough`

`VideoExportPreset.Passthrough ＝ 0`

Resolution: Unchanged • Video compression: None • Audio compression: None

#### `LowQuality`

`VideoExportPreset.LowQuality ＝ 1`

Resolution: Depends on the device • Video compression: H.264 • Audio
compression: AAC

#### `MediumQuality`

`VideoExportPreset.MediumQuality ＝ 2`

Resolution: Depends on the device • Video compression: H.264 • Audio
compression: AAC

#### `HighestQuality`

`VideoExportPreset.HighestQuality ＝ 3`

Resolution: Depends on the device • Video compression: H.264 • Audio
compression: AAC

#### `H264_640x480`

`VideoExportPreset.H264_640x480 ＝ 4`

Resolution: 640 × 480 • Video compression: H.264 • Audio compression: AAC

#### `H264_960x540`

`VideoExportPreset.H264_960x540 ＝ 5`

Resolution: 960 × 540 • Video compression: H.264 • Audio compression: AAC

#### `H264_1280x720`

`VideoExportPreset.H264_1280x720 ＝ 6`

Resolution: 1280 × 720 • Video compression: H.264 • Audio compression: AAC

#### `H264_1920x1080`

`VideoExportPreset.H264_1920x1080 ＝ 7`

Resolution: 1920 × 1080 • Video compression: H.264 • Audio compression: AAC

#### `H264_3840x2160`

`VideoExportPreset.H264_3840x2160 ＝ 8`

Resolution: 3840 × 2160 • Video compression: H.264 • Audio compression: AAC

#### `HEVC_1920x1080`

`VideoExportPreset.HEVC_1920x1080 ＝ 9`

Resolution: 1920 × 1080 • Video compression: HEVC • Audio compression: AAC

#### `HEVC_3840x2160`

`VideoExportPreset.HEVC_3840x2160 ＝ 10`

Resolution: 3840 × 2160 • Video compression: HEVC • Audio compression: AAC

## Permissions

### Android

The following permissions are added automatically through the library's
AndroidManifest.xml.

Android Permission| Description  
---|---  
`CAMERA`| Required to be able to access the camera device.  
`READ_EXTERNAL_STORAGE`| Allows an application to read from external storage.  
`WRITE_EXTERNAL_STORAGE`| Allows an application to write to external storage.  
  
### iOS

The following usage description keys are used by the APIs in this library.

Info.plist Key| Description  
---|---  
`NSMicrophoneUsageDescription`| A message that tells the user why the app is
requesting access to the device’s microphone.  
`NSPhotoLibraryUsageDescription`| A message that tells the user why the app is
requesting access to the user’s photo library.  
`NSCameraUsageDescription`| A message that tells the user why the app is
requesting access to the device’s camera.

