# ![Expo Maps icon](/static/images/packages/expo-maps.png)Expo Maps

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
maps)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
maps/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-maps)

Ask AI

A library that provides access to Google Maps on Android and Apple Maps on
iOS.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
maps)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
maps/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-maps)

Ask AI

Android

iOS

Bundled version:

~0.12.8

Copy

* * *

> This library is currently in alpha and will frequently experience breaking
> changes. It is not available in the Expo Go app – use [development
> builds](/develop/development-builds/introduction) to try it out.

## Installation

Terminal

Copy

`- ``npx expo install expo-maps`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

  
[![Watch: Expo Maps Deep
Dive](https://i3.ytimg.com/vi/jDCuaIQ9vd0/maxresdefault.jpg)Watch: Expo Maps
Deep Dive](https://www.youtube.com/watch?v=jDCuaIQ9vd0)

## Configuration

Expo Maps provides access to the platform native map APIs on Android and iOS.

  * Apple Maps (available on 

iOS

only). No additional configuration is required to use it after installing this
package.

  * Google Maps (available on 

Android

only). While Google provides a Google Maps SDK for iOS, Expo Maps supports it
exclusively on Android. If you want to use Google Maps on iOS, you can look
into using an [alternative library](https://reactnative.directory/) or
[writing your own](/modules/overview).

### Google Cloud API setup

Before you can use Google Maps on Android, you need to register a Google Cloud
API project, enable the Maps SDK for Android, and add the associated
configuration to your Expo project.

Set up Google Maps on Android

> If you have already registered a project for another Google service on
> Android, such as Google Sign In, you enable the Maps SDK for Android on your
> project and jump to step 4.

1

Register a Google Cloud API project and enable the Maps SDK for Android

  * Open your browser to the [Google API Manager](https://console.developers.google.com/apis) and create a project.
  * Once it's created, go to the project and enable the Maps SDK for Android.

2

Copy your app's SHA-1 certificate fingerprint

For Google Play Store

For development builds

  * If you are deploying your app to the Google Play Store, you'll need to [upload your app binary to Google Play console](/submit/android) at least once. This is required for Google to generate your app signing credentials.
  * Go to the [Google Play Console](https://play.google.com/console) > (your app) > Test and release > App integrity > Play app signing > Settings > App signing key certificate.
  * Copy the value of SHA-1 certificate fingerprint.

  * If you have already created a [development build](/develop/development-builds/introduction), your project will be signed using a debug keystore.
  * After the build is complete, go to your [project's dashboard](https://expo.dev/accounts/%5Busername%5D/projects/%5Bproject-name%5D), then, under Project settings > click Credentials.
  * Under Application Identifiers, click your project's package name and under Android Keystore copy the value of SHA-1 Certificate Fingerprint.

3

Create an API key

  * Go to [Google Cloud Credential manager](https://console.cloud.google.com/apis/credentials) and click Create Credentials, then API Key.
  * In the modal, click Edit API key.
  * Under Key restrictions > Application restrictions, choose Android apps.
  * Under Restrict usage to your Android apps, click Add an item.
  * Add your `android.package` from app.json (for example: `com.company.myapp`) to the package name field.
  * Then, add the SHA-1 certificate fingerprint's value from step 2.
  * Click Done and then click Save.

4

Add the API key to your project

  * Copy your API Key into your app.json under the `android.config.googleMaps.apiKey` field.
  * Create a new development build, and you can now use the Google Maps API on Android with `expo-maps`.

## Permissions

To display the user's location on the map, you need to declare and request
location permission beforehand. You can configure this using the built-in
[config plugin](/config-plugins/introduction) if you use config plugins in
your project ([EAS Build](/build/introduction) or `npx expo
run:[android|ios]`). The plugin allows you to configure various properties
that cannot be set at runtime and require building a new app binary to take
effect.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "plugins": [
          [
            "expo-maps",
            {
              "requestLocationPermission": true,
              "locationPermission": "Allow $(PRODUCT_NAME) to use your location"
            }
          ]
        ]
      }
    }
    

### Configurable properties

Name| Default| Description  
---|---|---  
`requestLocationPermission`| `false`| A boolean to add permissions to
AndroidManifest.xml and Info.plist.  
`locationPermission`| `"Allow $(PRODUCT_NAME) to use your location"`| Only
for: iOS  
A string to set the `NSLocationWhenInUseUsageDescription` permission message.  
  
## Usage

    
    
    import { AppleMaps, GoogleMaps } from 'expo-maps';
    import { Platform, Text } from 'react-native';
    
    export default function App() {
      if (Platform.OS === 'ios') {
        return <AppleMaps.View style={{ flex: 1 }} />;
      } else if (Platform.OS === 'android') {
        return <GoogleMaps.View style={{ flex: 1 }} />;
      } else {
        return <Text>Maps are only available on Android and iOS</Text>;
      }
    }
    

## API

    
    
    import { AppleMaps, GoogleMaps } from 'expo-maps';
    
    // ApplesMaps.View and GoogleMaps.View are the React components
    

## Components

### `AppleMapsView`

iOS

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<[Omit](https://www.typescriptlang.org/docs/handbook/utility-
types.html#omittype-keys)<AppleMapsViewProps, 'ref'>>`

AppleMapsViewProps

### `annotations`

iOS

Optional • Type: `AppleMapsAnnotation[]`

The array of annotations to display on the map.

### `cameraPosition`

iOS

Optional • Type:
`[CameraPosition](/versions/v54.0.0/sdk/maps#cameraposition-2)`

The initial camera position of the map.

### `circles`

iOS

Optional • Type: `AppleMapsCircle[]`

The array of circles to display on the map.

### `markers`

iOS

Optional • Type: `AppleMapsMarker[]`

The array of markers to display on the map.

### `onCameraMove`

iOS

Optional • Type: `(event: {  bearing: number,  coordinates: Coordinates,
tilt: number,  zoom: number }) => void`

Lambda invoked when the map was moved by the user.

### `onCircleClick`

iOS 18.0+

Optional • Type: `(event: AppleMapsCircle) => void`

Lambda invoked when the circle is clicked

### `onMapClick`

iOS

Optional • Type: `(event: {  coordinates: Coordinates }) => void`

Lambda invoked when the user clicks on the map. It won't be invoked if the
user clicks on POI or a marker.

### `onMarkerClick`

iOS 18.0+

Optional • Type: `(event: AppleMapsMarker) => void`

Lambda invoked when the marker is clicked

### `onPolygonClick`

iOS 18.0+

Optional • Type: `(event: AppleMapsPolygon) => void`

Lambda invoked when the polygon is clicked

### `onPolylineClick`

iOS 18.0+

Optional • Type: `(event: AppleMapsPolyline) => void`

Lambda invoked when the polyline is clicked

### `polygons`

iOS

Optional • Type: `AppleMapsPolygon[]`

The array of polygons to display on the map.

### `polylines`

iOS

Optional • Type: `AppleMapsPolyline[]`

The array of polylines to display on the map.

### `properties`

iOS

Optional • Type: `AppleMapsProperties`

The properties for the map.

### `ref`

iOS

Optional • Type: `Ref<AppleMapsViewType>`

### `style`

iOS

Optional • Type: `StyleProp<[ViewStyle](https://reactnative.dev/docs/view-
style-props)>`

### `uiSettings`

iOS

Optional • Type: `AppleMapsUISettings`

The `MapUiSettings` to be used for UI-specific settings on the map.

### `GoogleMapsView`

Android

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<[Omit](https://www.typescriptlang.org/docs/handbook/utility-
types.html#omittype-keys)<GoogleMapsViewProps, 'ref'>>`

GoogleMapsViewProps

### `cameraPosition`

Android

Optional • Type:
`[CameraPosition](/versions/v54.0.0/sdk/maps#cameraposition-2)`

The initial camera position of the map.

### `circles`

Android

Optional • Type: `GoogleMapsCircle[]`

The array of circles to display on the map.

### `colorScheme`

Android

Optional • Type: `GoogleMapsColorScheme`

Defines the color scheme for the map.

### `contentPadding`

Android

Optional • Type: `GoogleMapsContentPadding`

The padding values used to signal that portions of the map around the edges
may be obscured. The map will move the Google logo, etc. to avoid overlapping
the padding.

### `mapOptions`

Android

Optional • Type: `GoogleMapsMapOptions`

Defines configuration GoogleMapOptions for a GoogleMap

### `markers`

Android

Optional • Type: `GoogleMapsMarker[]`

The array of markers to display on the map.

### `onCameraMove`

Android

Optional • Type: `(event: {  bearing: number,  coordinates: Coordinates,
tilt: number,  zoom: number }) => void`

Lambda invoked when the map was moved by the user.

### `onCircleClick`

Android

Optional • Type: `(event: GoogleMapsCircle) => void`

Lambda invoked when the circle is clicked.

### `onMapClick`

Android

Optional • Type: `(event: {  coordinates: Coordinates }) => void`

Lambda invoked when the user clicks on the map. It won't be invoked if the
user clicks on POI or a marker.

### `onMapLoaded`

Android

Optional • Type: `() => void`

Lambda invoked when the map is loaded.

### `onMapLongClick`

Android

Optional • Type: `(event: {  coordinates: Coordinates }) => void`

Lambda invoked when the user long presses on the map.

### `onMarkerClick`

Android

Optional • Type: `(event: GoogleMapsMarker) => void`

Lambda invoked when the marker is clicked

### `onPOIClick`

Android

Optional • Type: `(event: {  coordinates: Coordinates,  name: string }) =>
void`

Lambda invoked when a POI is clicked.

### `onPolygonClick`

Android

Optional • Type: `(event: GoogleMapsPolygon) => void`

Lambda invoked when the polygon is clicked.

### `onPolylineClick`

Android

Optional • Type: `(event: GoogleMapsPolyline) => void`

Lambda invoked when the polyline is clicked.

### `polygons`

Android

Optional • Type: `GoogleMapsPolygon[]`

The array of polygons to display on the map.

### `polylines`

Android

Optional • Type: `GoogleMapsPolyline[]`

The array of polylines to display on the map.

### `properties`

Android

Optional • Type: `GoogleMapsProperties`

The properties for the map.

### `ref`

Android

Optional • Type: `Ref<GoogleMapsViewType>`

### `style`

Android

Optional • Type: `StyleProp<[ViewStyle](https://reactnative.dev/docs/view-
style-props)>`

### `uiSettings`

Android

Optional • Type: `GoogleMapsUISettings`

The `MapUiSettings` to be used for UI-specific settings on the map.

### `userLocation`

Android

Optional • Type: `GoogleMapsUserLocation`

User location, overrides default behavior.

### `GoogleStreetView`

Android

Type: `React.Element<GoogleStreetViewProps>`

GoogleStreetViewProps

### `isPanningGesturesEnabled`

Android

Optional • Type: `boolean`

### `isStreetNamesEnabled`

Android

Optional • Type: `boolean`

### `isUserNavigationEnabled`

Android

Optional • Type: `boolean`

### `isZoomGesturesEnabled`

Android

Optional • Type: `boolean`

### `position`

Android

Type: `StreetViewCameraPosition`

### `style`

Android

Optional • Type: `StyleProp<[ViewStyle](https://reactnative.dev/docs/view-
style-props)>`

## Hooks

### `useLocationPermissions(options)`

Android

iOS

Parameter| Type  
---|---  
options(optional)| `PermissionHookOptions<object>`  
  
  

Check or request permissions to access the location. This uses both
`requestPermissionsAsync` and `getPermissionsAsync` to interact with the
permissions.

Returns:

`[null | PermissionResponse, RequestPermissionMethod<PermissionResponse>, GetPermissionMethod<PermissionResponse>]`

Example

    
    
    const [status, requestPermission] = useLocationPermissions();
    

## Methods

### `Maps.getPermissionsAsync()`

Android

iOS

Checks user's permissions for accessing location.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

A promise that fulfills with an object of type `PermissionResponse`.

### `Maps.requestPermissionsAsync()`

Android

iOS

Asks the user to grant permissions for location.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

A promise that fulfills with an object of type `PermissionResponse`.

## Types

### `AppleMapsAnnotation`

iOS

Type: `AppleMapsMarker` extended by:

Property| Type| Description  
---|---|---  
backgroundColor(optional)| `string`| The background color of the annotation.  
icon(optional)| `SharedRefType<'image'>`| The custom icon to display in the
annotation.  
text(optional)| `string`| The text to display in the annotation.  
textColor(optional)| `string`| The text color of the annotation.  
  
### `AppleMapsCircle`

iOS

Property| Type| Description  
---|---|---  
center| `Coordinates`| The coordinates of the circle.  
color(optional)| `ProcessedColorValue | string`| The color of the circle.  
id(optional)| `string`| The unique identifier for the circle. This can be used
to identify the clicked circle in the `onCircleClick` event.  
lineColor(optional)| `ProcessedColorValue | string`| The color of the circle line.  
lineWidth(optional)| `number`| The width of the circle line.  
radius| `number`| The radius of the circle (in meters).  
width(optional)| `number`| The width of the circle.  
  
### `AppleMapsMarker`

iOS

Property| Type| Description  
---|---|---  
coordinates(optional)| `Coordinates`| The coordinates of the marker.  
id(optional)| `string`| The unique identifier for the marker. This can be used
to identify the clicked marker in the `onMarkerClick` event.  
systemImage(optional)| `string`| The SF Symbol to display for the marker.  
tintColor(optional)| `string`| The tint color of the marker.  
title(optional)| `string`| The title of the marker, displayed in the callout
when the marker is clicked.  
  
### `AppleMapsPointOfInterestCategories`

iOS

Property| Type| Description  
---|---|---  
excluding(optional)| `AppleMapPointOfInterestCategory[]`| The POI categories
to exclude. To show all POIs, set this to an empty array.  
including(optional)| `AppleMapPointOfInterestCategory[]`| The POI categories
to include. To hide all POIs, set this to an empty array.  
  
### `AppleMapsPolygon`

iOS

Property| Type| Description  
---|---|---  
color(optional)| `ProcessedColorValue | string`| The color of the polygon.  
coordinates| `Coordinates[]`| The coordinates of the circle.  
id(optional)| `string`| The unique identifier for the polygon. This can be
used to identify the clicked polygon in the `onPolygonClick` event.  
lineColor(optional)| `ProcessedColorValue | string`| The color of the polygon.  
lineWidth(optional)| `number`| The width of the polygon.  
  
### `AppleMapsPolyline`

iOS

Property| Type| Description  
---|---|---  
color(optional)| `ProcessedColorValue | string`| The color of the polyline.  
contourStyle(optional)| `AppleMapsContourStyle`| The style of the polyline.  
coordinates| `Coordinates[]`| The coordinates of the polyline.  
id(optional)| `string`| The unique identifier for the polyline. This can be
used to identify the clicked polyline in the `onPolylineClick` event.  
width(optional)| `number`| The width of the polyline.  
  
### `AppleMapsProperties`

iOS

Property| Type| Description  
---|---|---  
elevation(optional)| `AppleMapsMapStyleElevation`| Values you use to determine
whether a map renders elevation.  
emphasis(optional)| `AppleMapsMapStyleEmphasis`| Values that control how the
framework emphasizes map features.  
isMyLocationEnabled(optional)| `boolean`| Whether the user location is shown
on the map.Default:`false`  
isTrafficEnabled(optional)| `boolean`| Whether the traffic layer is enabled on
the map.  
mapType(optional)| `AppleMapsMapType`| Defines which map type should be used.  
pointsOfInterest(optional)| `AppleMapsPointOfInterestCategories`| A structure
you use to define points of interest to include or exclude on a map.  
polylineTapThreshold(optional)| `number`| The maximum distance in meters from
a tap of a polyline for it to be considered a hit. If the distance is greater
than the threshold, the polyline is not considered a hit. If a hit occurs, the
`onPolylineClick` event will be triggered. Defaults to 20 meters.  
selectionEnabled(optional)| `boolean`| If true, the user can select a location
on the map to get more information.  
  
### `AppleMapsUISettings`

iOS

Property| Type| Description  
---|---|---  
compassEnabled(optional)| `boolean`| Whether the compass is enabled on the
map. If enabled, the compass is only visible when the map is rotated.  
myLocationButtonEnabled(optional)| `boolean`| Whether the my location button
is visible.  
scaleBarEnabled(optional)| `boolean`| Whether the scale bar is displayed when
zooming.  
togglePitchEnabled(optional)| `boolean`| Whether the user is allowed to change
the pitch type.  
  
### `AppleMapsViewType`

iOS

Property| Type| Description  
---|---|---  
openLookAroundAsync| `(coordinates: Coordinates) =>
[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`| Opens the
look around view at specified coordinates.`coordinates: Coordinates`The
coordinates of the location to open the look around view at.  
setCameraPosition| `(config:
[CameraPosition](/versions/v54.0.0/sdk/maps#cameraposition-2)) => void`|
Update camera position. Animation duration is not supported on iOS.`config:
[CameraPosition](/versions/v54.0.0/sdk/maps#cameraposition-2)`New camera
postion.  
  
### `CameraPosition`

Android

iOS

Property| Type| Description  
---|---|---  
coordinates(optional)| `Coordinates`| The middle point of the camera.  
zoom(optional)| `number`| The zoom level of the camera. For some view sizes,
lower zoom levels might not be available.  
  
### `Coordinates`

Android

iOS

Property| Type| Description  
---|---|---  
latitude(optional)| `number`| The latitude of the coordinate.  
longitude(optional)| `number`| The longitude of the coordinate.  
  
### `GoogleMapsAnchor`

Android

Property| Type| Description  
---|---|---  
x| `number`| The normalized horizontal anchor point from 0.0 (left edge) to
1.0 (right edge).  
y| `number`| The normalized vertical anchor point from 0.0 (top edge) to 1.0
(bottom edge).  
  
### `GoogleMapsCircle`

Android

Property| Type| Description  
---|---|---  
center| `Coordinates`| The coordinates of the circle.  
color(optional)| `ProcessedColorValue | string`| The color of the circle.  
id(optional)| `string`| The unique identifier for the circle. This can be used
to identify the clicked circle in the `onCircleClick` event.  
lineColor(optional)| `ProcessedColorValue | string`| The color of the circle line.  
lineWidth(optional)| `number`| The width of the circle line.  
radius| `number`| The radius of the circle.  
  
### `GoogleMapsContentPadding`

Android

Property| Type| Description  
---|---|---  
bottom(optional)| `number`| The padding on the bottom side of the map.  
end(optional)| `number`| In LTR contexts, `end` will be applied along the
right edge. In RTL contexts, `end` will correspond to the left edge.  
start(optional)| `number`| In LTR contexts, `start` will be applied along the
left edge. In RTL contexts, `start` will correspond to the right edge.  
top(optional)| `number`| The padding on the top side of the map.  
  
### `GoogleMapsMapOptions`

Android

Property| Type| Description  
---|---|---  
mapId(optional)| `string`| A map ID is a unique identifier that represents
Google Map styling and configuration settings that are stored in Google Cloud.

> See: For more information, see
> <https://developers.google.com/maps/documentation/android-sdk/map-ids/mapid-
> over>  
  
### `GoogleMapsMapStyleOptions`

Android

Property| Type| Description  
---|---|---  
json| `string`| The JSON string of the map style options.

> See: For creating map style options, see <https://mapstyle.withgoogle.com/>  
  
### `GoogleMapsMarker`

Android

Property| Type| Description  
---|---|---  
anchor(optional)| `GoogleMapsAnchor`| The anchor used to position the anchor
relative to its coordinates.Default:`bottom-center of the icon`  
coordinates(optional)| `Coordinates`| The coordinates of the marker.  
draggable(optional)| `boolean`| Whether the marker is draggable.  
icon(optional)| `SharedRefType<'image'>`| The custom icon to display for the
marker.  
id(optional)| `string`| The unique identifier for the marker. This can be used
to identify the clicked marker in the `onMarkerClick` event.  
showCallout(optional)| `boolean`| Whether the callout should be shown when the
marker is clicked.  
snippet(optional)| `string`| The snippet of the marker, displayed in the
callout when the marker is clicked.  
title(optional)| `string`| The title of the marker, displayed in the callout
when the marker is clicked.  
zIndex(optional)| `number`| The z-index to use for the marker.Default:`0`  
  
### `GoogleMapsPolygon`

Android

Property| Type| Description  
---|---|---  
color(optional)| `ProcessedColorValue | string`| The color of the polygon.  
coordinates| `Coordinates[]`| The coordinates of the circle.  
id(optional)| `string`| The unique identifier for the polygon. This can be
used to identify the clicked polygon in the `onPolygonClick` event.  
lineColor(optional)| `ProcessedColorValue | string`| The color of the polygon.  
lineWidth(optional)| `number`| The width of the polygon.  
  
### `GoogleMapsPolyline`

Android

Property| Type| Description  
---|---|---  
color(optional)| `ProcessedColorValue | string`| The color of the polyline.  
coordinates| `Coordinates[]`| The coordinates of the polyline.  
geodesic(optional)| `boolean`| Whether the polyline is geodesic.  
id(optional)| `string`| The unique identifier for the polyline. This can be
used to identify the clicked polyline in the `onPolylineClick` event.  
width(optional)| `number`| The width of the polyline.  
  
### `GoogleMapsProperties`

Android

Property| Type| Description  
---|---|---  
isBuildingEnabled(optional)| `boolean`| Whether the building layer is enabled
on the map.  
isIndoorEnabled(optional)| `boolean`| Whether the indoor layer is enabled on
the map.  
isMyLocationEnabled(optional)| `boolean`| Whether finding the user's location
is enabled on the map.  
isTrafficEnabled(optional)| `boolean`| Whether the traffic layer is enabled on
the map.  
mapStyleOptions(optional)| `GoogleMapsMapStyleOptions`| With style options you
can customize the presentation of the standard Google map styles, changing the
visual display of features like roads, parks, and other points of interest.  
mapType(optional)| `GoogleMapsMapType`| Defines which map type should be used.  
maxZoomPreference(optional)| `number`| The maximum zoom level for the map.  
minZoomPreference(optional)| `number`| The minimum zoom level for the map.  
selectionEnabled(optional)| `boolean`| If true, the user can select a location
on the map to get more information.  
  
### `GoogleMapsUISettings`

Android

Property| Type| Description  
---|---|---  
compassEnabled(optional)| `boolean`| Whether the compass is enabled on the
map. If enabled, the compass is only visible when the map is rotated.  
indoorLevelPickerEnabled(optional)| `boolean`| Whether the indoor level picker
is enabled .  
mapToolbarEnabled(optional)| `boolean`| Whether the map toolbar is visible.  
myLocationButtonEnabled(optional)| `boolean`| Whether the my location button
is visible.  
rotationGesturesEnabled(optional)| `boolean`| Whether rotate gestures are
enabled.  
scaleBarEnabled(optional)| `boolean`| Whether the scale bar is displayed when
zooming.  
scrollGesturesEnabled(optional)| `boolean`| Whether the scroll gestures are
enabled.  
scrollGesturesEnabledDuringRotateOrZoom(optional)| `boolean`| Whether the
scroll gestures are enabled during rotation or zoom.  
tiltGesturesEnabled(optional)| `boolean`| Whether the tilt gestures are
enabled.  
togglePitchEnabled(optional)| `boolean`| Whether the user is allowed to change
the pitch type.  
zoomControlsEnabled(optional)| `boolean`| Whether the zoom controls are
visible.  
zoomGesturesEnabled(optional)| `boolean`| Whether the zoom gestures are
enabled.  
  
### `GoogleMapsUserLocation`

Android

Property| Type| Description  
---|---|---  
coordinates| `Coordinates`| User location coordinates.  
followUserLocation| `boolean`| Should the camera follow the users' location.  
  
### `GoogleMapsViewType`

Android

Property| Type| Description  
---|---|---  
setCameraPosition| `(config: SetCameraPositionConfig) => void`| Update camera
position.`config: SetCameraPositionConfig`New camera position config.  
  
### `SetCameraPositionConfig`

Android

Type: `[CameraPosition](/versions/v54.0.0/sdk/maps#cameraposition-2)` extended
by:

Property| Type| Description  
---|---|---  
duration(optional)| `number`| The duration of the animation in milliseconds.  
  
### `StreetViewCameraPosition`

Android

Property| Type| Description  
---|---|---  
bearing(optional)| `number`| -  
coordinates| `Coordinates`| -  
tilt(optional)| `number`| -  
zoom(optional)| `number`| -  
  
## Enums

### `AppleMapPointOfInterestCategory`

iOS

> See:
> <https://developer.apple.com/documentation/mapkit/AppleMapPointOfInterestCategory>

#### `AIRPORT`

`AppleMapPointOfInterestCategory.AIRPORT ＝ "AIRPORT"`

#### `AMUSEMENT_PARK`

`AppleMapPointOfInterestCategory.AMUSEMENT_PARK ＝ "AMUSEMENT_PARK"`

#### `ANIMAL_SERVICE`

`AppleMapPointOfInterestCategory.ANIMAL_SERVICE ＝ "ANIMAL_SERVICE"`

#### `AQUARIUM`

`AppleMapPointOfInterestCategory.AQUARIUM ＝ "AQUARIUM"`

#### `ATM`

`AppleMapPointOfInterestCategory.ATM ＝ "ATM"`

#### `AUTOMOTIVE_REPAIR`

`AppleMapPointOfInterestCategory.AUTOMOTIVE_REPAIR ＝ "AUTOMOTIVE_REPAIR"`

#### `BAKERY`

`AppleMapPointOfInterestCategory.BAKERY ＝ "BAKERY"`

#### `BANK`

`AppleMapPointOfInterestCategory.BANK ＝ "BANK"`

#### `BASEBALL`

`AppleMapPointOfInterestCategory.BASEBALL ＝ "BASEBALL"`

#### `BASKETBALL`

`AppleMapPointOfInterestCategory.BASKETBALL ＝ "BASKETBALL"`

#### `BEACH`

`AppleMapPointOfInterestCategory.BEACH ＝ "BEACH"`

#### `BEAUTY`

`AppleMapPointOfInterestCategory.BEAUTY ＝ "BEAUTY"`

#### `BOWLING`

`AppleMapPointOfInterestCategory.BOWLING ＝ "BOWLING"`

#### `BREWERY`

`AppleMapPointOfInterestCategory.BREWERY ＝ "BREWERY"`

#### `CAFE`

`AppleMapPointOfInterestCategory.CAFE ＝ "CAFE"`

#### `CAMPGROUND`

`AppleMapPointOfInterestCategory.CAMPGROUND ＝ "CAMPGROUND"`

#### `CAR_RENTAL`

`AppleMapPointOfInterestCategory.CAR_RENTAL ＝ "CAR_RENTAL"`

#### `CASTLE`

`AppleMapPointOfInterestCategory.CASTLE ＝ "CASTLE"`

#### `CONVENTION_CENTER`

`AppleMapPointOfInterestCategory.CONVENTION_CENTER ＝ "CONVENTION_CENTER"`

#### `DISTILLERY`

`AppleMapPointOfInterestCategory.DISTILLERY ＝ "DISTILLERY"`

#### `EV_CHARGER`

`AppleMapPointOfInterestCategory.EV_CHARGER ＝ "EV_CHARGER"`

#### `FAIRGROUND`

`AppleMapPointOfInterestCategory.FAIRGROUND ＝ "FAIRGROUND"`

#### `FIRE_STATION`

`AppleMapPointOfInterestCategory.FIRE_STATION ＝ "FIRE_STATION"`

#### `FISHING`

`AppleMapPointOfInterestCategory.FISHING ＝ "FISHING"`

#### `FITNESS_CENTER`

`AppleMapPointOfInterestCategory.FITNESS_CENTER ＝ "FITNESS_CENTER"`

#### `FOOD_MARKET`

`AppleMapPointOfInterestCategory.FOOD_MARKET ＝ "FOOD_MARKET"`

#### `FORTRESS`

`AppleMapPointOfInterestCategory.FORTRESS ＝ "FORTRESS"`

#### `GAS_STATION`

`AppleMapPointOfInterestCategory.GAS_STATION ＝ "GAS_STATION"`

#### `GO_KART`

`AppleMapPointOfInterestCategory.GO_KART ＝ "GO_KART"`

#### `GOLF`

`AppleMapPointOfInterestCategory.GOLF ＝ "GOLF"`

#### `HIKING`

`AppleMapPointOfInterestCategory.HIKING ＝ "HIKING"`

#### `HOSPITAL`

`AppleMapPointOfInterestCategory.HOSPITAL ＝ "HOSPITAL"`

#### `HOTEL`

`AppleMapPointOfInterestCategory.HOTEL ＝ "HOTEL"`

#### `KAYAKING`

`AppleMapPointOfInterestCategory.KAYAKING ＝ "KAYAKING"`

#### `LANDMARK`

`AppleMapPointOfInterestCategory.LANDMARK ＝ "LANDMARK"`

#### `LAUNDRY`

`AppleMapPointOfInterestCategory.LAUNDRY ＝ "LAUNDRY"`

#### `LIBRARY`

`AppleMapPointOfInterestCategory.LIBRARY ＝ "LIBRARY"`

#### `MAILBOX`

`AppleMapPointOfInterestCategory.MAILBOX ＝ "MAILBOX"`

#### `MARINA`

`AppleMapPointOfInterestCategory.MARINA ＝ "MARINA"`

#### `MINI_GOLF`

`AppleMapPointOfInterestCategory.MINI_GOLF ＝ "MINI_GOLF"`

#### `MOVIE_THEATER`

`AppleMapPointOfInterestCategory.MOVIE_THEATER ＝ "MOVIE_THEATER"`

#### `MUSEUM`

`AppleMapPointOfInterestCategory.MUSEUM ＝ "MUSEUM"`

#### `MUSIC_VENUE`

`AppleMapPointOfInterestCategory.MUSIC_VENUE ＝ "MUSIC_VENUE"`

#### `NATIONAL_MONUMENT`

`AppleMapPointOfInterestCategory.NATIONAL_MONUMENT ＝ "NATIONAL_MONUMENT"`

#### `NATIONAL_PARK`

`AppleMapPointOfInterestCategory.NATIONAL_PARK ＝ "NATIONAL_PARK"`

#### `NIGHTLIFE`

`AppleMapPointOfInterestCategory.NIGHTLIFE ＝ "NIGHTLIFE"`

#### `PARK`

`AppleMapPointOfInterestCategory.PARK ＝ "PARK"`

#### `PARKING`

`AppleMapPointOfInterestCategory.PARKING ＝ "PARKING"`

#### `PHARMACY`

`AppleMapPointOfInterestCategory.PHARMACY ＝ "PHARMACY"`

#### `PLANETARIUM`

`AppleMapPointOfInterestCategory.PLANETARIUM ＝ "PLANETARIUM"`

#### `POLICE`

`AppleMapPointOfInterestCategory.POLICE ＝ "POLICE"`

#### `POST_OFFICE`

`AppleMapPointOfInterestCategory.POST_OFFICE ＝ "POST_OFFICE"`

#### `PUBLIC_TRANSPORT`

`AppleMapPointOfInterestCategory.PUBLIC_TRANSPORT ＝ "PUBLIC_TRANSPORT"`

#### `RESTAURANT`

`AppleMapPointOfInterestCategory.RESTAURANT ＝ "RESTAURANT"`

#### `RESTROOM`

`AppleMapPointOfInterestCategory.RESTROOM ＝ "RESTROOM"`

#### `ROCK_CLIMBING`

`AppleMapPointOfInterestCategory.ROCK_CLIMBING ＝ "ROCK_CLIMBING"`

#### `RV_PARK`

`AppleMapPointOfInterestCategory.RV_PARK ＝ "RV_PARK"`

#### `SCHOOL`

`AppleMapPointOfInterestCategory.SCHOOL ＝ "SCHOOL"`

#### `SKATE_PARK`

`AppleMapPointOfInterestCategory.SKATE_PARK ＝ "SKATE_PARK"`

#### `SKATING`

`AppleMapPointOfInterestCategory.SKATING ＝ "SKATING"`

#### `SKIING`

`AppleMapPointOfInterestCategory.SKIING ＝ "SKIING"`

#### `SOCCER`

`AppleMapPointOfInterestCategory.SOCCER ＝ "SOCCER"`

#### `SPA`

`AppleMapPointOfInterestCategory.SPA ＝ "SPA"`

#### `STADIUM`

`AppleMapPointOfInterestCategory.STADIUM ＝ "STADIUM"`

#### `STORE`

`AppleMapPointOfInterestCategory.STORE ＝ "STORE"`

#### `SURFING`

`AppleMapPointOfInterestCategory.SURFING ＝ "SURFING"`

#### `SWIMMING`

`AppleMapPointOfInterestCategory.SWIMMING ＝ "SWIMMING"`

#### `TENNIS`

`AppleMapPointOfInterestCategory.TENNIS ＝ "TENNIS"`

#### `THEATER`

`AppleMapPointOfInterestCategory.THEATER ＝ "THEATER"`

#### `UNIVERSITY`

`AppleMapPointOfInterestCategory.UNIVERSITY ＝ "UNIVERSITY"`

#### `VOLLEYBALL`

`AppleMapPointOfInterestCategory.VOLLEYBALL ＝ "VOLLEYBALL"`

#### `WINERY`

`AppleMapPointOfInterestCategory.WINERY ＝ "WINERY"`

#### `ZOO`

`AppleMapPointOfInterestCategory.ZOO ＝ "ZOO"`

### `AppleMapsContourStyle`

iOS

The style of the polyline.

#### `GEODESIC`

`AppleMapsContourStyle.GEODESIC ＝ "GEODESIC"`

A geodesic line.

#### `STRAIGHT`

`AppleMapsContourStyle.STRAIGHT ＝ "STRAIGHT"`

A straight line.

### `AppleMapsMapStyleElevation`

iOS

#### `AUTOMATIC`

`AppleMapsMapStyleElevation.AUTOMATIC ＝ "AUTOMATIC"`

The default elevation style, that renders a flat, 2D map.

#### `FLAT`

`AppleMapsMapStyleElevation.FLAT ＝ "FLAT"`

A flat elevation style.

#### `REALISTIC`

`AppleMapsMapStyleElevation.REALISTIC ＝ "REALISTIC"`

A value that renders a realistic, 3D map.

### `AppleMapsMapStyleEmphasis`

iOS

#### `AUTOMATIC`

`AppleMapsMapStyleEmphasis.AUTOMATIC ＝ "AUTOMATIC"`

The default level of emphasis.

#### `MUTED`

`AppleMapsMapStyleEmphasis.MUTED ＝ "MUTED"`

A muted emphasis style, that deemphasizes the map’s imagery.

### `AppleMapsMapType`

iOS

The type of map to display.

#### `HYBRID`

`AppleMapsMapType.HYBRID ＝ "HYBRID"`

A satellite image of the area with road and road name layers on top.

#### `IMAGERY`

`AppleMapsMapType.IMAGERY ＝ "IMAGERY"`

A satellite image of the area.

#### `STANDARD`

`AppleMapsMapType.STANDARD ＝ "STANDARD"`

A street map that shows the position of all roads and some road names.

### `GoogleMapsColorScheme`

Android

#### `DARK`

`GoogleMapsColorScheme.DARK ＝ "DARK"`

#### `FOLLOW_SYSTEM`

`GoogleMapsColorScheme.FOLLOW_SYSTEM ＝ "FOLLOW_SYSTEM"`

#### `LIGHT`

`GoogleMapsColorScheme.LIGHT ＝ "LIGHT"`

### `GoogleMapsMapType`

Android

The type of map to display.

#### `HYBRID`

`GoogleMapsMapType.HYBRID ＝ "HYBRID"`

Satellite imagery with roads and points of interest overlayed.

#### `NORMAL`

`GoogleMapsMapType.NORMAL ＝ "NORMAL"`

Standard road map.

#### `SATELLITE`

`GoogleMapsMapType.SATELLITE ＝ "SATELLITE"`

Satellite imagery.

#### `TERRAIN`

`GoogleMapsMapType.TERRAIN ＝ "TERRAIN"`

Topographic data.

## Permissions

### Android

To show the user's location on the map, the `expo-maps` library requires the
following permissions:

  * `ACCESS_COARSE_LOCATION`: for approximate device location
  * `ACCESS_FINE_LOCATION`: for precise device location

Android Permission| Description  
---|---  
`ACCESS_COARSE_LOCATION`| Allows an app to access approximate location.

> Alternatively, you might want
> `[ACCESS_FINE_LOCATION](https://developer.android.com/reference/android/Manifest.permission#ACCESS_FINE_LOCATION)`.  
  
`ACCESS_FINE_LOCATION`| Allows an app to access precise location.

> Alternatively, you might want
> `[ACCESS_COARSE_LOCATION](https://developer.android.com/reference/android/Manifest.permission#ACCESS_COARSE_LOCATION)`.  
  
`FOREGROUND_SERVICE`| Allows a regular application to use
Service.startForeground.

> Allows a regular application to use
> `[Service.startForeground](https://developer.android.com/reference/android/app/Service#startForeground\(int,%20android.app.Notification\))`.  
  
`FOREGROUND_SERVICE_LOCATION`| Allows a regular application to use
Service.startForeground with the type "location".

> Allows a regular application to use
> `[Service.startForeground](https://developer.android.com/reference/android/app/Service#startForeground\(int,%20android.app.Notification\))`
> with the type "location".  
  
`ACCESS_BACKGROUND_LOCATION`| Allows an app to access location in the
background.

> If you're requesting this permission, you must also request either
> `[ACCESS_COARSE_LOCATION](https://developer.android.com/reference/android/Manifest.permission#ACCESS_COARSE_LOCATION)`
> or
> `[ACCESS_FINE_LOCATION](https://developer.android.com/reference/android/Manifest.permission#ACCESS_FINE_LOCATION)`.
> Requesting this permission by itself doesn't give you location access.  
  
### iOS

The following usage description keys are used by this library:

Info.plist Key| Description  
---|---  
`NSLocationWhenInUseUsageDescription`| A message that tells the user why the
app is requesting access to the user’s location information while the app is
running in the foreground.

