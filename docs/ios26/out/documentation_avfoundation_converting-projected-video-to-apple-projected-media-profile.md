# Converting projected video to Apple Projected Media Profile | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/avfoundation/converting-projected-video-to-apple-projected-media-profile
> Fetched: 2025-08-31T18:32:11.243Z

## [Overview](https://developer.apple.com/documentation/avfoundation/converting-projected-video-to-apple-projected-media-profile#Overview)

### [Configure the sample code project](https://developer.apple.com/documentation/avfoundation/converting-projected-video-to-apple-projected-media-profile#Configure-the-sample-code-project)

The app takes a path to a monoscopic or stereoscopic (frame-packed) side-by-side or over-under stereo input video file as a single command-line argument. To run the app in Xcode, click the Run button to convert the included side-by-side frame-packed stereoscopic 180 sample asset (`Lighthouse_sbs.mp4`), or choose Product > Scheme > Edit Scheme, and edit the path to your file on the Arguments tab of the Run build scheme action.

To add projected media metadata to an output file, pass one of the following two options:

`--autoDetect` (or `-a`)

Examines the source file for spherical metadata compatible with APMP.

`--projectionKind <projection_kind>` (or `-p`)

Specifies the projection type, which can be `equirectangular` or `halfequirectangular`.

Other options:

`--viewPackingKind <view_packing_kind>` (or `-v`)

Manually specifies the frame-packing mode, which can be `sidebyside` or `overunder`. The app ignores this option if you specify the `--autoDetect` option.

`--baseline` (or `-b`)

Specifies a baseline in millimeters (for example, `--baseline 64.0` for a 64mm baseline).

`--fov` (or `-f`)

Specifies a horizontal field of view in degrees (for example, `--fov 80.0` for an 80-degree field of view).

By default, the project’s scheme loads a side-by-side video from the Xcode project folder named `Lighthouse_sbs.mp4`.
