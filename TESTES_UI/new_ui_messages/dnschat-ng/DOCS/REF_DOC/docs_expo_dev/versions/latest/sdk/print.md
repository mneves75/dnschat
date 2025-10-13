# ![Expo Print icon](/static/images/packages/expo-print.png)Expo Print

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
print)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
print/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-print)

Ask AI

A library that provides printing functionality for Android and iOS (AirPrint).

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
print)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
print/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-print)

Ask AI

Android

iOS

Web

Bundled version:

~15.0.7

Copy

* * *

`expo-print` provides an API for Android and iOS (AirPrint) printing
functionality.

## Installation

Terminal

Copy

`- ``npx expo install expo-print`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

Print usage

Copy

Open in Snack

    
    
    import { useState } from 'react';
    import { View, StyleSheet, Button, Platform, Text } from 'react-native';
    import * as Print from 'expo-print';
    import { shareAsync } from 'expo-sharing';
    
    const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
      </head>
      <body style="text-align: center;">
        <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: normal;">
          Hello Expo!
        </h1>
        <img
          src="https://d30j33t1r58ioz.cloudfront.net/static/guides/sdk.png"
          style="width: 90vw;" />
      </body>
    </html>
    `;
    
    export default function App() {
      const [selectedPrinter, setSelectedPrinter] = useState();
    
      const print = async () => {
        // On iOS/android prints the given html. On web prints the HTML from the current page.
        await Print.printAsync({
          html,
          printerUrl: selectedPrinter?.url, // iOS only
        });
      };
    
      const printToFile = async () => {
        // On iOS/android prints the given html. On web prints the HTML from the current page.
        const { uri } = await Print.printToFileAsync({ html });
        console.log('File has been saved to:', uri);
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      };
    
      const selectPrinter = async () => {
        const printer = await Print.selectPrinterAsync(); // iOS only
        setSelectedPrinter(printer);
      };
    
      return (
        <View style={styles.container}>
          <Button title="Print" onPress={print} />
          <View style={styles.spacer} />
          <Button title="Print to PDF file" onPress={printToFile} />
          {Platform.OS === 'ios' && (
            <>
              <View style={styles.spacer} />
              <Button title="Select printer" onPress={selectPrinter} />
              <View style={styles.spacer} />
              {selectedPrinter ? (
                <Text style={styles.printer}>{`Selected printer: ${selectedPrinter.name}`}</Text>
              ) : undefined}
            </>
          )}
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
        flexDirection: 'column',
        padding: 8,
      },
      spacer: {
        height: 8,
      },
      printer: {
        textAlign: 'center',
      },
    });
    

## API

    
    
    import * as Print from 'expo-print';
    

## Constants

### `Print.Orientation`

Android

iOS

Web

Type: `OrientationType`

The orientation of the printed content.

## Methods

### `Print.printAsync(options)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
options| `PrintOptions`| A map defining what should be printed.  
  
  

Prints a document or HTML, on web this prints the HTML from the page.

> Note: On iOS, printing from HTML source doesn't support local asset URLs
> (due to `WKWebView` limitations). As a workaround you can use inlined
> base64-encoded strings. See [this
> comment](https://github.com/expo/expo/issues/7940#issuecomment-657111033)
> for more details.

> Note: on iOS, when printing without providing a `PrintOptions.printerUrl`
> the `Promise` will be resolved once printing is started in the native print
> window and rejected if the window is closed without starting the print. On
> Android the `Promise` will be resolved immediately after displaying the
> native print window and won't be rejected if the window is closed without
> starting the print.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Resolves to an empty `Promise` if printing started.

### `Print.printToFileAsync(options)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
options(optional)| `FilePrintOptions`| A map of print options.Default:`{}`  
  
  

Prints HTML to PDF file and saves it to [app's cache
directory](/versions/latest/sdk/filesystem#filesystemcachedirectory). On Web
this method opens the print dialog.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<FilePrintResult>`

### `Print.selectPrinterAsync()`

iOS

Chooses a printer that can be later used in `printAsync`

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<Printer>`

A promise which fulfils with an object containing `name` and `url` of the
selected printer.

## Interfaces

### `OrientationType`

Android

iOS

Web

The possible values of orientation for the printed content.

Property| Type| Description  
---|---|---  
landscape| `string`| -  
portrait| `string`| -  
  
## Types

### `FilePrintOptions`

Android

iOS

Web

Property| Type| Description  
---|---|---  
base64(optional)| `boolean`| Whether to include base64 encoded string of the
file in the returned object.  
height(optional)| `number`| Height of the single page in pixels. Defaults to
`792` which is a height of US Letter paper format with 72 PPI.  
html(optional)| `string`| HTML string to print into PDF file.  
margins(optional)| `PageMargins`| Only for: iOS  
Page margins for the printed document.  
textZoom(optional)| `number`| Only for: Android  
The text zoom of the page in percent. The default is 100.  
useMarkupFormatter(optional)| `boolean`| Only for: iOS  
Alternative to default option that uses
[UIMarkupTextPrintFormatter](https://developer.apple.com/documentation/uikit/uimarkuptextprintformatter)
instead of WebView, but it doesn't display images.  
width(optional)| `number`| Width of the single page in pixels. Defaults to
`612` which is a width of US Letter paper format with 72 PPI.  
  
### `FilePrintResult`

Android

iOS

Web

Property| Type| Description  
---|---|---  
base64(optional)| `string`| Base64 encoded string containing the data of the
PDF file. Available only if `base64` option is truthy. It doesn't include data
URI prefix `data:application/pdf;base64,`.  
numberOfPages| `number`| Number of pages that were needed to render given
content.  
uri| `string`| A URI to the printed PDF file.  
  
### `PageMargins`

Android

iOS

Web

Property| Type| Description  
---|---|---  
bottom| `number`| -  
left| `number`| -  
right| `number`| -  
top| `number`| -  
  
### `Printer`

Android

iOS

Web

Property| Type| Description  
---|---|---  
name| `string`| Name of the printer.  
url| `string`| URL of the printer.  
  
### `PrintOptions`

Android

iOS

Web

Property| Type| Description  
---|---|---  
height(optional)| `number`| Height of the single page in pixels. Defaults to
`792` which is a height of US Letter paper format with 72 PPI. Available only
with `html` option.  
html(optional)| `string`| Only for: AndroidiOS  
HTML string to print.  
margins(optional)| `PageMargins`| Only for: iOS  
Page margins for the printed document.  
markupFormatterIOS(optional)| `string`|

> Deprecated This argument is deprecated, use `useMarkupFormatter` instead.
> Might be removed in the future releases.

iOS  
orientation(optional)| `OrientationType[portrait] | OrientationType[landscape]`| Only for: iOS  
The orientation of the printed content, `Print.Orientation.portrait` or
`Print.Orientation.landscape`.  
printerUrl(optional)| `string`| Only for: iOS  
URL of the printer to use. Returned from `selectPrinterAsync`.  
uri(optional)| `string`| Only for: AndroidiOS  
URI of a PDF file to print. Remote, local (ex. selected via `DocumentPicker`)
or base64 data URI starting with `data:application/pdf;base64,`. This only
supports PDF, not other types of document (e.g. images).  
useMarkupFormatter(optional)| `boolean`| Only for: iOS  
Alternative to default option that uses
[UIMarkupTextPrintFormatter](https://developer.apple.com/documentation/uikit/uimarkuptextprintformatter)
instead of WebView, but it doesn't display images.  
width(optional)| `number`| Width of the single page in pixels. Defaults to
`612` which is a width of US Letter paper format with 72 PPI. Available only
with `html` option.  
  
## Local images

On iOS, printing from HTML source doesn't support local asset URLs (due to
`WKWebView` limitations). Instead, images need to be converted to base64 and
inlined into the HTML.

Example

Copy

    
    
    import { Asset } from 'expo-asset';
    import { useImageManipulator } from 'expo-image-manipulator';
    import { printAsync } from 'expo-print';
    import { useEffect } from 'react';
    
    const IMAGE = Asset.fromModule(require('@/assets/images/icon.png'));
    
    export function ImageManipulatorExample() {
      const context = useImageManipulator(IMAGE.uri);
    
      useEffect(() => {
        async function generateAndPrint() {
          try {
            await IMAGE.downloadAsync();
            const manipulatedImage = await context.renderAsync();
            const result = await manipulatedImage.saveAsync({ base64: true });
    
            const html = `
              <html>
                <img
                  src="data:image/png;base64,${result.base64}"
                  style="width: 90vw;" />
              </html>
            `;
    
            await printAsync({ html });
          } catch (error) {
            console.error('Error:', error);
          }
        }
    
        generateAndPrint();
      }, [context]);
    
      return <>{/* Render UI */}</>;
    }
    

## Page margins

On iOS you can set the page margins using the `margins` option:

    
    
    const { uri } = await Print.printToFileAsync({
      html: 'This page is printed with margins',
      margins: {
        left: 20,
        top: 50,
        right: 20,
        bottom: 100,
      },
    });
    

If `useMarkupFormatter` is set to `true`, setting margins may cause a blank
page to appear at the end of your printout. To prevent this, make sure your
HTML string is a well-formed document, including `<!DOCTYPE html>` at the
beginning of the string.

On Android, if you're using `html` option in `printAsync` or
`printToFileAsync`, the resulting print might contain page margins (it depends
on the WebView engine). They are set by `@page` style block and you can
override them in your HTML code:

    
    
    <style>
      @page {
        margin: 20px;
      }
    </style>
    

See [`@page` documentation on MDN](https://developer.mozilla.org/en-
US/docs/Web/CSS/@page) for more details.

