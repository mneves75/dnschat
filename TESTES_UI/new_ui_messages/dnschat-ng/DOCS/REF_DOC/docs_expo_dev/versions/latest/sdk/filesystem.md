# ![Expo FileSystem icon](/static/images/packages/expo-file-system.png)Expo
FileSystem

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-file-
system)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
file-system/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-file-system)

Ask AI

A library that provides access to the local file system on the device.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-file-
system)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
file-system/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-file-system)

Ask AI

Android

iOS

tvOS

Bundled version:

~19.0.16

Copy

* * *

`expo-file-system` provides access to files and directories stored on a device
or bundled as assets into the native project. It also allows downloading files
from the network.

## Installation

Terminal

Copy

`- ``npx expo install expo-file-system`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

    
    
    import { File, Directory, Paths } from 'expo-file-system';
    

The `File` and `Directory` instances hold a reference to a file, content, or
asset URI.

The file or directory does not need to exist — an error will be thrown from
the constructor only if the wrong class is used to represent an existing path
(so if you try to create a `File` instance passing a path to an already
existing directory).

## Features

  * Both synchronous and asynchronous, read and write access to file contents
  * Creation, modification and deletion
  * Available properties, such as `type`, `size`, `creationDate`, and more
  * Ability to read and write files as streams or using the `FileHandle` class
  * Easy file download/upload using `downloadFileAsync` or `expo/fetch`

## Examples

Writing and reading text files

example.ts

Copy

    
    
    import { File, Paths } from 'expo-file-system';
    
    try {
      const file = new File(Paths.cache, 'example.txt');
      file.create(); // can throw an error if the file already exists or no permission to create it
      file.write('Hello, world!');
      console.log(file.textSync()); // Hello, world!
    } catch (error) {
      console.error(error);
    }
    

Picking files using system pickers

Usage with `expo-document-picker`:

example.ts

Copy

    
    
    import { File } from 'expo-file-system';
    import * as DocumentPicker from 'expo-document-picker';
    
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      const file = new File(result.assets[0]);
      console.log(file.textSync());
    } catch (error) {
      console.error(error);
    }
    

Using the built-in `pickFileAsync` or `pickDirectoryAsync` method on Android:

example.ts

Copy

    
    
    import { File } from 'expo-file-system';
    
    try {
      const file = new File.pickFileAsync();
      console.log(file.textSync());
    } catch (error) {
      console.error(error);
    }
    

Downloading files

Using `downloadFileAsync`:

example.ts

Copy

    
    
    import { Directory, File, Paths } from 'expo-file-system';
    
    const url = 'https://pdfobject.com/pdf/sample.pdf';
    const destination = new Directory(Paths.cache, 'pdfs');
    try {
      destination.create();
      const output = await File.downloadFileAsync(url, destination);
      console.log(output.exists); // true
      console.log(output.uri); // path to the downloaded file, e.g., '${cacheDirectory}/pdfs/sample.pdf'
    } catch (error) {
      console.error(error);
    }
    

Or using `expo/fetch`:

example.ts

Copy

    
    
    import { fetch } from 'expo/fetch';
    import { File } from 'expo-file-system';
    
    const url = 'https://pdfobject.com/pdf/sample.pdf';
    const response = await fetch(url);
    const src = new File(Paths.cache, 'file.pdf');
    src.write(await response.bytes());
    

Uploading files using `expo/fetch`

You can upload files as blobs directly with `fetch` built into the Expo
package:

example.ts

Copy

    
    
    import { fetch } from 'expo/fetch';
    import { File } from 'expo-file-system';
    
    const file = new File(Paths.cache, 'file.txt');
    file.write('Hello, world!');
    
    const response = await fetch('https://example.com', {
      method: 'POST',
      body: file,
    });
    

Or using the `FormData` constructor:

example.ts

Copy

    
    
    import { fetch } from 'expo/fetch';
    import { File, Paths } from 'expo-file-system';
    
    const file = new File(Paths.cache, 'file.txt');
    file.write('Hello, world!');
    const formData = new FormData();
    formData.append('data', file);
    const response = await fetch('https://example.com', {
      method: 'POST',
      body: formData,
    });
    

Moving and copying files

example.ts

Copy

    
    
    import { Directory, File, Paths } from 'expo-file-system';
    try {
      const file = new File(Paths.document, 'example.txt');
      file.create();
      console.log(file.uri); // '${documentDirectory}/example.txt'
      const copiedFile = new File(Paths.cache, 'example-copy.txt');
      file.copy(copiedFile);
      console.log(copiedFile.uri); // '${cacheDirectory}/example-copy.txt'
      file.move(Paths.cache);
      console.log(file.uri); // '${cacheDirectory}/example.txt'
      file.move(new Directory(Paths.cache, 'newFolder'));
      console.log(file.uri); // '${cacheDirectory}/newFolder/example.txt'
    } catch (error) {
      console.error(error);
    }
    

Using legacy FileSystem API

example.ts

Copy

    
    
    import * as FileSystem from 'expo-file-system/legacy';
    import { File, Paths } from 'expo-file-system';
    
    try {
      const file = new File(Paths.cache, 'example.txt');
      const content = await FileSystem.readAsStringAsync(file.uri);
      console.log(content);
    } catch (error) {
      console.error(error);
    }
    

Listing directory contents recursively

example.ts

Copy

    
    
    import { Directory, Paths } from 'expo-file-system';
    
    function printDirectory(directory: Directory, indent: number = 0) {
      console.log(`${' '.repeat(indent)} + ${directory.name}`);
      const contents = directory.list();
      for (const item of contents) {
        if (item instanceof Directory) {
          printDirectory(item, indent + 2);
        } else {
          console.log(`${' '.repeat(indent + 2)} - ${item.name} (${item.size} bytes)`);
        }
      }
    }
    
    try {
      printDirectory(new Directory(Paths.cache));
    } catch (error) {
      console.error(error);
    }
    

## API

## Classes

### `Directory`

Android

iOS

tvOS

Type: Class extends `FileSystemDirectory`

Represents a directory on the filesystem.

A `Directory` instance can be created for any path, and does not need to exist
on the filesystem during creation.

The constructor accepts an array of strings that are joined to create the
directory URI. The first argument can also be a `Directory` instance (like
`Paths.cache`).

Example

    
    
    const directory = new Directory(Paths.cache, "subdirName");
    

Directory Properties

### `exists`

Android

iOS

tvOS

Type: `boolean`

A boolean representing if a directory exists and can be accessed.

### `size`

Android

iOS

tvOS

Literal type: `union`

A size of the directory in bytes. Null if the directory does not exist, or it
cannot be read.

Acceptable values are: `null` | `number`

### `uri`

Android

iOS

tvOS

Read Only • Type: `string`

Represents the directory URI. The field is read-only, but it may change as a
result of calling some methods such as `move`.

### `name`

Android

iOS

tvOS

Type: `string`

Directory name.

### `parentDirectory`

Android

iOS

tvOS

Type: `Directory`

Directory containing the file.

Directory Methods

### `copy(destination)`

Android

iOS

tvOS

Parameter| Type  
---|---  
destination| `Directory | File`  
  
  

Copies a directory.

Returns:

`void`

### `create(options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
options(optional)| `DirectoryCreateOptions`  
  
  

Creates a directory that the current uri points to.

Returns:

`void`

### `createDirectory(name)`

Android

iOS

tvOS

Parameter| Type  
---|---  
name| `string`  
  
  

Returns:

`Directory`

### `createFile(name, mimeType)`

Android

iOS

tvOS

Parameter| Type  
---|---  
name| `string`  
mimeType| `null | string`  
  
  

Returns:

`File`

### `delete()`

Android

iOS

tvOS

Deletes a directory. Also deletes all files and directories inside the
directory.

Returns:

`void`

### `info()`

Android

iOS

tvOS

Retrieves an object containing properties of a directory.

Returns:

`DirectoryInfo`

An object with directory metadata (for example, size, creation date, and so
on).

### `list()`

Android

iOS

tvOS

Lists the contents of a directory. Calling this method if the parent directory
does not exist will throw an error.

Returns:

`(File | Directory)[]`

An array of `Directory` and `File` instances.

### `move(destination)`

Android

iOS

tvOS

Parameter| Type  
---|---  
destination| `Directory | File`  
  
  

Moves a directory. Updates the `uri` property that now points to the new
location.

Returns:

`void`

### `pickDirectoryAsync(initialUri)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
initialUri(optional)| `string`| An optional uri pointing to an initial folder
on which the directory picker is opened.  
  
  

A static method that opens a file picker to select a directory.

On iOS, the selected directory grants temporary read and write access for the
current app session only. After the app restarts, you must prompt the user
again to regain access.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<Directory>`

a `Directory` instance. On Android, the underlying uri will be a content URI.

### `rename(newName)`

Android

iOS

tvOS

Parameter| Type  
---|---  
newName| `string`  
  
  

Renames a directory.

Returns:

`void`

### `File`

Android

iOS

tvOS

Type: Class extends `FileSystemFile` implements
`[Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)`

Represents a file on the filesystem.

A `File` instance can be created for any path, and does not need to exist on
the filesystem during creation.

The constructor accepts an array of strings that are joined to create the file
URI. The first argument can also be a `Directory` instance (like
`Paths.cache`) or a `File` instance (which creates a new reference to the same
file).

Example

    
    
    const file = new File(Paths.cache, "subdirName", "file.txt");
    

File Properties

### `creationTime`

Android

iOS

tvOS

Literal type: `union`

A creation time of the file expressed in milliseconds since epoch. Returns
null if the file does not exist, cannot be read or the Android version is
earlier than API 26.

Acceptable values are: `null` | `number`

### `exists`

Android

iOS

tvOS

Type: `boolean`

A boolean representing if a file exists. `true` if the file exists, `false`
otherwise. Also, `false` if the application does not have read access to the
file.

### `md5`

Android

iOS

tvOS

Literal type: `union`

A md5 hash of the file. Null if the file does not exist, or it cannot be read.

Acceptable values are: `null` | `string`

### `modificationTime`

Android

iOS

tvOS

Literal type: `union`

A last modification time of the file expressed in milliseconds since epoch.
Returns a Null if the file does not exist, or it cannot be read.

Acceptable values are: `null` | `number`

### `size`

Android

iOS

tvOS

Type: `number`

A size of the file in bytes. 0 if the file does not exist, or it cannot be
read.

### `type`

Android

iOS

tvOS

Type: `string`

A mime type of the file. An empty string if the file does not exist, or it
cannot be read.

### `uri`

Android

iOS

tvOS

Read Only • Type: `string`

Represents the file URI. The field is read-only, but it may change as a result
of calling some methods such as `move`.

### `extension`

Android

iOS

tvOS

Type: `string`

File extension.

Example

`'.png'`

### `name`

Android

iOS

tvOS

Type: `string`

File name. Includes the extension.

### `parentDirectory`

Android

iOS

tvOS

Type: `Directory`

Directory containing the file.

File Methods

### `arrayBuffer()`

Android

iOS

tvOS

The `arrayBuffer()` method of the Blob interface returns a Promise that
resolves with the contents of the blob as binary data contained in an
ArrayBuffer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/arrayBuffer)

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[ArrayBuffer](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)>`

### `base64()`

Android

iOS

tvOS

Retrieves content of the file as base64.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

A promise that resolves with the contents of the file as a base64 string.

### `base64Sync()`

Android

iOS

tvOS

Retrieves content of the file as base64.

Returns:

`string`

The contents of the file as a base64 string.

### `bytes()`

Android

iOS

tvOS

Retrieves byte content of the entire file.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Uint8Array](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)<[ArrayBuffer](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)>>`

A promise that resolves with the contents of the file as a `Uint8Array`.

### `bytesSync()`

Android

iOS

tvOS

Retrieves byte content of the entire file.

Returns:

`[Uint8Array](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)`

The contents of the file as a `Uint8Array`.

### `copy(destination)`

Android

iOS

tvOS

Parameter| Type  
---|---  
destination| `Directory | File`  
  
  

Copies a file.

Returns:

`void`

### `create(options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
options(optional)| `FileCreateOptions`  
  
  

Creates a file.

Returns:

`void`

### `delete()`

Android

iOS

tvOS

Deletes a file.

Returns:

`void`

### `downloadFileAsync(url, destination, options)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
url| `string`| The URL of the file to download.  
destination| `Directory | File`| The destination directory or file. If a directory is provided, the resulting filename will be determined based on the response headers.  
options(optional)| `DownloadOptions`| Download options. When the destination
already contains a file, the promise rejects with a `DestinationAlreadyExists`
error unless `options.idempotent` is set to `true`. With `idempotent: true`,
the download overwrites the existing file instead of failing.  
  
  

A static method that downloads a file from the network.

On Android, the response body streams directly into the target file. If the
download fails after it starts, a partially written file may remain at the
destination. On iOS, the download first completes in a temporary location and
the file is moved into place only after success, so no file is left behind
when the request fails.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<File>`

A promise that resolves to the downloaded file. When the server responds with
a non-2xx HTTP status, the promise rejects with an `UnableToDownload` error
whose message includes the status code. No file is created in that scenario.

Example

    
    
    const file = await File.downloadFileAsync("https://example.com/image.png", new Directory(Paths.document));
    

### `info(options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
options(optional)| `InfoOptions`  
  
  

Retrieves an object containing properties of a file

Returns:

`FileInfo`

An object with file metadata (for example, size, creation date, and so on).

### `move(destination)`

Android

iOS

tvOS

Parameter| Type  
---|---  
destination| `Directory | File`  
  
  

Moves a directory. Updates the `uri` property that now points to the new
location.

Returns:

`void`

### `open()`

Android

iOS

tvOS

Returns A `FileHandle` object that can be used to read and write data to the
file.

Returns:

`FileHandle`

### `pickFileAsync(initialUri, mimeType)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
initialUri(optional)| `string`| An optional URI pointing to an initial folder
on which the file picker is opened.  
mimeType(optional)| `string`| A mime type that is used to filter out files
that can be picked out.  
  
  

A static method that opens a file picker to select a single file of specified
type. On iOS, it returns a temporary copy of the file leaving the original
file untouched.

Selecting multiple files is not supported yet.

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<File | File[]>`

A `File` instance or an array of `File` instances.

### `readableStream()`

Android

iOS

tvOS

Returns:

`[ReadableStream](https://developer.mozilla.org/en-
US/docs/Web/API/ReadableStream)<[Uint8Array](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)<[ArrayBuffer](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)>>`

### `rename(newName)`

Android

iOS

tvOS

Parameter| Type  
---|---  
newName| `string`  
  
  

Renames a file.

Returns:

`void`

### `slice(start, end, contentType)`

Android

iOS

tvOS

Parameter| Type  
---|---  
start(optional)| `number`  
end(optional)| `number`  
contentType(optional)| `string`  
  
  

The `slice()` method of the Blob interface creates and returns a new `Blob`
object which contains data from a subset of the blob on which it's called.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/slice)

Returns:

`[Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)`

### `stream()`

Android

iOS

tvOS

The `stream()` method of the Blob interface returns a ReadableStream which
upon reading returns the data contained within the `Blob`.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/stream)

Returns:

`[ReadableStream](https://developer.mozilla.org/en-
US/docs/Web/API/ReadableStream)<[Uint8Array](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)<[ArrayBuffer](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)>>`

### `text()`

Android

iOS

tvOS

Retrieves text from the file.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

A promise that resolves with the contents of the file as string.

### `textSync()`

Android

iOS

tvOS

Retrieves text from the file.

Returns:

`string`

The contents of the file as string.

### `writableStream()`

Android

iOS

tvOS

Returns:

`[WritableStream](https://developer.mozilla.org/en-
US/docs/Web/API/WritableStream)<[Uint8Array](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)>`

### `write(content)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
content| `string | [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)`| The content to write into the file.  
  
  

Writes content to the file.

Returns:

`void`

### `FileHandle`

Android

iOS

tvOS

FileHandle Properties

### `offset`

Android

iOS

tvOS

Literal type: `union`

A property that indicates the current byte offset in the file. Calling
`readBytes` or `writeBytes` will read or write a specified amount of bytes
starting from this offset. The offset is incremented by the number of bytes
read or written. The offset can be set to any value within the file size. If
the offset is set to a value greater than the file size, the next write
operation will append data to the end of the file. Null if the file handle is
closed.

Acceptable values are: `null` | `number`

### `size`

Android

iOS

tvOS

Literal type: `union`

A size of the file in bytes or `null` if the file handle is closed.

Acceptable values are: `null` | `number`

FileHandle Methods

### `close()`

Android

iOS

tvOS

Closes the file handle. This allows the file to be deleted, moved or read by a
different process. Subsequent calls to `readBytes` or `writeBytes` will throw
an error.

Returns:

`void`

### `readBytes(length)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
length| `number`| The number of bytes to read.  
  
  

Reads the specified amount of bytes from the file at the current offset.

Returns:

`[Uint8Array](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)<[ArrayBuffer](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)>`

### `writeBytes(bytes)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
bytes| `[Uint8Array](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)`| A `Uint8Array`
array containing bytes to write.  
  
  

Writes the specified bytes to the file at the current offset.

Returns:

`void`

### `Paths`

Android

iOS

tvOS

Type: Class extends `PathUtilities`

Paths Properties

### `appleSharedContainers`

Android

iOS

tvOS

Type: `Record<string, Directory>`

### `availableDiskSpace`

Android

iOS

tvOS

Type: `number`

A property that represents the available space on device's internal storage,
represented in bytes.

### `bundle`

Android

iOS

tvOS

Type: `Directory`

A property containing the bundle directory – the directory where assets
bundled with the application are stored.

### `cache`

Android

iOS

tvOS

Type: `Directory`

A property containing the cache directory – a place to store files that can be
deleted by the system when the device runs low on storage.

### `document`

Android

iOS

tvOS

Type: `Directory`

A property containing the document directory – a place to store files that are
safe from being deleted by the system.

### `totalDiskSpace`

Android

iOS

tvOS

Type: `number`

A property that represents the total space on device's internal storage,
represented in bytes.

Paths Methods

### `basename(path, ext)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
path| `string | File | Directory`| The path to get the base name from.  
ext(optional)| `string`| An optional file extension.  
  
  

Returns the base name of a path.

Returns:

`string`

A string representing the base name.

### `dirname(path)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
path| `string | File | Directory`| The path to get the directory name from.  
  
  

Returns the directory name of a path.

Returns:

`string`

A string representing the directory name.

### `extname(path)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
path| `string | File | Directory`| The path to get the extension from.  
  
  

Returns the extension of a path.

Returns:

`string`

A string representing the extension.

### `info(...uris)`

Android

iOS

tvOS

Parameter| Type  
---|---  
...uris| `string[]`  
  
  

Returns an object that indicates if the specified path represents a directory.

Returns:

`PathInfo`

### `isAbsolute(path)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
path| `string | File | Directory`| The path to check.  
  
  

Checks if a path is absolute.

Returns:

`boolean`

`true` if the path is absolute, `false` otherwise.

### `join(...paths)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
...paths| `(string | File | Directory)[]`| An array of path segments.  
  
  

Joins path segments into a single path.

Returns:

`string`

A string representing the joined path.

### `normalize(path)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
path| `string | File | Directory`| The path to normalize.  
  
  

Normalizes a path.

Returns:

`string`

A string representing the normalized path.

### `parse(path)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
path| `string | File | Directory`| The path to parse.  
  
  

Parses a path into its components.

Returns:

`{  base: string,  dir: string,  ext: string,  name: string,  root: string }`

An object containing the parsed path components.

### `relative(from, to)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
from| `string | File | Directory`| The base path.  
to| `string | File | Directory`| The relative path.  
  
  

Resolves a relative path to an absolute path.

Returns:

`string`

A string representing the resolved path.

## Methods

> Deprecated Use `new File().copy()` or import this method from `expo-file-
> system/legacy`. This method will throw in runtime.

### `FileSystem.copyAsync(options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
options| `RelocatingOptions`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

> Deprecated Import this method from `expo-file-system/legacy`. This method
> will throw in runtime.

### `FileSystem.createDownloadResumable(uri, fileUri, options, callback,
resumeData)`

Android

iOS

tvOS

Parameter| Type  
---|---  
uri| `string`  
fileUri| `string`  
options(optional)| `DownloadOptions`  
callback(optional)|
`FileSystemNetworkTaskProgressCallback<DownloadProgressData>`  
resumeData(optional)| `string`  
  
  

Returns:

`any`

> Deprecated Import this method from `expo-file-system/legacy`. This method
> will throw in runtime.

### `FileSystem.createUploadTask(url, fileUri, options, callback)`

Android

iOS

tvOS

Parameter| Type  
---|---  
url| `string`  
fileUri| `string`  
options(optional)| `FileSystemUploadOptions`  
callback(optional)|
`FileSystemNetworkTaskProgressCallback<UploadProgressData>`  
  
  

Returns:

`any`

> Deprecated Use `new File().delete()` or `new Directory().delete()` or import
> this method from `expo-file-system/legacy`. This method will throw in
> runtime.

### `FileSystem.deleteAsync(fileUri, options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
fileUri| `string`  
options(optional)| `DeletingOptions`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

> Deprecated

### `FileSystem.deleteLegacyDocumentDirectoryAndroid()`

Android

iOS

tvOS

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

> Deprecated Use `File.downloadFileAsync` or import this method from `expo-
> file-system/legacy`. This method will throw in runtime.

### `FileSystem.downloadAsync(uri, fileUri, options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
uri| `string`  
fileUri| `string`  
options(optional)| `DownloadOptions`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<FileSystemDownloadResult>`

> Deprecated Import this method from `expo-file-system/legacy`. This method
> will throw in runtime.

### `FileSystem.getContentUriAsync(fileUri)`

Android

iOS

tvOS

Parameter| Type  
---|---  
fileUri| `string`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

> Deprecated Use `Paths.availableDiskSpace` or import this method from `expo-
> file-system/legacy`. This method will throw in runtime.

### `FileSystem.getFreeDiskStorageAsync()`

Android

iOS

tvOS

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<number>`

> Deprecated Use `new File().info` or import this method from `expo-file-
> system/legacy`. This method will throw in runtime.

### `FileSystem.getInfoAsync(fileUri, options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
fileUri| `string`  
options(optional)| `InfoOptions`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<FileInfo>`

> Deprecated Use `Paths.totalDiskSpace` or import this method from `expo-file-
> system/legacy`. This method will throw in runtime.

### `FileSystem.getTotalDiskCapacityAsync()`

Android

iOS

tvOS

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<number>`

> Deprecated Use `new Directory().create()` or import this method from `expo-
> file-system/legacy`. This method will throw in runtime.

### `FileSystem.makeDirectoryAsync(fileUri, options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
fileUri| `string`  
options(optional)| `MakeDirectoryOptions`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

> Deprecated Use `new File().move()` or import this method from `expo-file-
> system/legacy`. This method will throw in runtime.

### `FileSystem.moveAsync(options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
options| `RelocatingOptions`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

> Deprecated Use `new File().text()` or import this method from `expo-file-
> system/legacy`. This method will throw in runtime.

### `FileSystem.readAsStringAsync(fileUri, options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
fileUri| `string`  
options(optional)| `ReadingOptions`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

> Deprecated Use `new Directory().list()` or import this method from `expo-
> file-system/legacy`. This method will throw in runtime.

### `FileSystem.readDirectoryAsync(fileUri)`

Android

iOS

tvOS

Parameter| Type  
---|---  
fileUri| `string`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string[]>`

> Deprecated Use `@expo/fetch` or import this method from `expo-file-
> system/legacy`. This method will throw in runtime.

### `FileSystem.uploadAsync(url, fileUri, options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
url| `string`  
fileUri| `string`  
options(optional)| `FileSystemUploadOptions`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<FileSystemUploadResult>`

> Deprecated Use `new File().write()` or import this method from `expo-file-
> system/legacy`. This method will throw in runtime.

### `FileSystem.writeAsStringAsync(fileUri, contents, options)`

Android

iOS

tvOS

Parameter| Type  
---|---  
fileUri| `string`  
contents| `string`  
options(optional)| `WritingOptions`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

## Types

### `DirectoryCreateOptions`

Android

iOS

tvOS

Property| Type| Description  
---|---|---  
idempotent(optional)| `boolean`| This flag controls whether the `create`
operation is idempotent (safe to call multiple times without error). If
`true`, creating a file or directory that already exists will succeed
silently. If `false`, an error will be thrown when the target already
exists.Default:`false`  
intermediates(optional)| `boolean`| Whether to create intermediate directories
if they do not exist.Default:`false`  
overwrite(optional)| `boolean`| Whether to overwrite the directory if it
exists.Default:`false`  
  
### `DirectoryInfo`

Android

iOS

tvOS

Property| Type| Description  
---|---|---  
creationTime(optional)| `number`| A creation time of the directory expressed
in milliseconds since epoch. Returns null if the Android version is earlier
than API 26.  
exists| `boolean`| Indicates whether the directory exists.  
files(optional)| `string[]`| A list of file names contained within a
directory.  
modificationTime(optional)| `number`| The last modification time of the
directory expressed in milliseconds since epoch.  
size(optional)| `number`| The size of the file in bytes.  
uri(optional)| `string`| A `file://` URI pointing to the directory.  
  
### `DownloadOptions`

Android

iOS

tvOS

Property| Type| Description  
---|---|---  
headers(optional)| `undefined`| The headers to send with the request.  
idempotent(optional)| `boolean`| This flag controls whether the `download`
operation is idempotent (safe to call multiple times without error). If
`true`, downloading a file that already exists overwrites the previous one. If
`false`, an error is thrown when the target file already
exists.Default:`false`  
  
### `FileCreateOptions`

Android

iOS

tvOS

Property| Type| Description  
---|---|---  
intermediates(optional)| `boolean`| Whether to create intermediate directories
if they do not exist.Default:`false`  
overwrite(optional)| `boolean`| Whether to overwrite the file if it
exists.Default:`false`  
  
### `FileInfo`

Android

iOS

tvOS

Property| Type| Description  
---|---|---  
creationTime(optional)| `number`| A creation time of the file expressed in
milliseconds since epoch. Returns null if the Android version is earlier than
API 26.  
exists| `boolean`| Indicates whether the file exists.  
md5(optional)| `string`| Present if the `md5` option was truthy. Contains the
MD5 hash of the file.  
modificationTime(optional)| `number`| The last modification time of the file
expressed in milliseconds since epoch.  
size(optional)| `number`| The size of the file in bytes.  
uri(optional)| `string`| A `file://` URI pointing to the file. This is the
same as the `fileUri` input parameter.  
  
### `InfoOptions`

Android

iOS

tvOS

Property| Type| Description  
---|---|---  
md5(optional)| `boolean`| Whether to return the MD5 hash of the
file.Default:`false`  
  
### `PathInfo`

Android

iOS

tvOS

Property| Type| Description  
---|---|---  
exists| `boolean`| Indicates whether the path exists. Returns true if it
exists; false if the path does not exist or if there is no read permission.  
isDirectory| `boolean | null`| Indicates whether the path is a directory. Returns true or false if the path exists; otherwise, returns null.

