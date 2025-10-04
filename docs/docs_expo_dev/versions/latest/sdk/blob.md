# Expo Blob

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
blob)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
blob/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-blob)

Ask AI

A web standards-compliant Blob implementation for React Native.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
blob)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
blob/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-blob)

Ask AI

Android

iOS

Web

Copy

* * *

`expo-blob` provides a web standards-compliant Blob implementation for React
Native that offers superior performance and works consistently across all
platforms. It is more reliable compared to the implementation exported from
`react-native`, unlike Blob from `react-native`, which has limitations with
the `slice()` method and other Web API features.

## Installation

Terminal

Copy

`- ``npx expo install expo-blob`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

### Basic blob creation

    
    
    import { Blob } from 'expo-blob';
    
    // Create an empty blob
    const emptyBlob = new Blob();
    
    // Create a blob from text
    const textBlob = new Blob(['Hello, World!'], { type: 'text/plain' });
    
    // Create a blob from binary data
    const binaryBlob = new Blob([new Uint8Array([1, 2, 3, 4])], {
      type: 'application/octet-stream',
    });
    
    // Create a blob from mixed content
    const mixedBlob = new Blob(
      [
        'Text content',
        new Uint8Array([65, 66, 67]), // ABC in ASCII
        'More text',
      ],
      { type: 'text/plain' }
    );
    

### Blob properties

    
    
    const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
    
    console.log(blob.size); // 13 (bytes)
    console.log(blob.type); // "text/plain"
    

### Reading blob content

    
    
    const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
    
    // Read as text
    const text = await blob.text();
    console.log(text); // "Hello, World!"
    
    // Read as bytes
    const bytes = await blob.bytes();
    console.log(bytes); // Uint8Array(13) [72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]
    
    // Read as ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();
    console.log(arrayBuffer); // ArrayBuffer(13)
    

### Slicing blobs

    
    
    const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
    
    // Slice from position 0 to 5
    const slice1 = blob.slice(0, 5);
    console.log(await slice1.text()); // "Hello"
    
    // Slice from position 7 to end
    const slice2 = blob.slice(7);
    console.log(await slice2.text()); // "World!"
    
    // Slice with custom type
    const slice3 = blob.slice(0, 5, 'text/html');
    console.log(slice3.type); // "text/html"
    

### Streaming

    
    
    const blob = new Blob(['Large content...'], { type: 'text/plain' });
    
    // Create a readable stream
    const stream = blob.stream();
    const reader = stream.getReader();
    
    // Read chunks
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      console.log('Chunk:', value);
    }
    

## API

## Classes

### `Blob`

Android

iOS

Web

Blob Properties

### `size`

Android

iOS

Web

Read Only • Type: `number`

The size of the `Blob` in bytes.

### `type`

Android

iOS

Web

Read Only • Type: `string`

The MIME type of the `Blob`, or the empty string if the type cannot be
determined.

Blob Methods

### `arrayBuffer()`

Android

iOS

Web

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[ArrayBuffer](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)>`

Promise resolving to the `Blob`'s binary data as an `ArrayBuffer`.

### `bytes()`

Android

iOS

Web

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Uint8Array](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)>`

Promise resolving to the `Blob`'s binary data as a `Uint8Array`.

### `slice(start, end, contentType)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
start(optional)| `number`| The starting byte index (inclusive) represented as
a signed 32 bit integer (up to 2^31 - 1).  
end(optional)| `number`| The ending byte index (exclusive) represented as a
signed 32 bit integer (up to 2^31 - 1).  
contentType(optional)| `string`| The MIME type of the new `Blob`. If not
provided, defaults to an empty string.  
  
  

Returns:

`[Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)`

A new `Blob` object containing the data in the specified range of bytes of the
source `Blob`.

### `stream()`

Android

iOS

Web

> Note: The current implementation loads the entire `Blob` into memory before
> streaming.

Returns:

`[ReadableStream](https://developer.mozilla.org/en-
US/docs/Web/API/ReadableStream)`

A `ReadableStream` of the `Blob`'s data.

### `text()`

Android

iOS

Web

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

Promise that resolves with the entire contents of the `Blob` as a UTF-8
string.

## Types

### `BlobPart`

Android

iOS

Web

Literal Type: `union`

Represents a part of a `Blob`. Can be a `string`, `ArrayBuffer`,
`ArrayBufferView`, or another `Blob`.

Acceptable values are: `string` | `[ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)` | `ArrayBufferView` | `[Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)`

