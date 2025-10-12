# ![Expo Crypto icon](/static/images/packages/expo-crypto.png)Expo Crypto

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
crypto)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
crypto/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-crypto)

Ask AI

A universal library for crypto operations.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
crypto)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
crypto/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-crypto)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~15.0.7

Copy

* * *

`expo-crypto` enables you to hash data in an equivalent manner to the Node.js
core `crypto` API.

## Installation

Terminal

Copy

`- ``npx expo install expo-crypto`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

Basic Crypto usage

Copy

Open in Snack

    
    
    import { useEffect } from 'react';
    import { StyleSheet, View, Text } from 'react-native';
    import * as Crypto from 'expo-crypto';
    
    export default function App() {
      useEffect(() => {
        (async () => {
          const digest = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            'GitHub stars are neat 🌟'
          );
          console.log('Digest: ', digest);
          /* Some crypto operation... */
        })();
      }, []);
    
      return (
        <View style={styles.container}>
          <Text>Crypto Module Example</Text>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      },
    });
    

## API

    
    
    import * as Crypto from 'expo-crypto';
    

## Methods

### `Crypto.digest(algorithm, data)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
algorithm| `CryptoDigestAlgorithm`| The cryptographic hash function to use to
transform a block of data into a fixed-size output.  
data| `BufferSource`| The value that will be used to generate a digest.  
  
  

The `digest()` method of `Crypto` generates a digest of the supplied
`TypedArray` of bytes `data` with the provided digest `algorithm`. A digest is
a short fixed-length value derived from some variable-length input.
Cryptographic digests should exhibit _collision-resistance_ , meaning that
it's very difficult to generate multiple inputs that have equal digest values.
On web, this method can only be called from a secure origin (HTTPS) otherwise,
an error will be thrown.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[ArrayBuffer](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)>`

A Promise which fulfills with an ArrayBuffer representing the hashed input.

Example

    
    
    const array = new Uint8Array([1, 2, 3, 4, 5]);
    const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA512, array);
    console.log('Your digest: ' + digest);
    

### `Crypto.digestStringAsync(algorithm, data, options)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
algorithm| `CryptoDigestAlgorithm`| The cryptographic hash function to use to
transform a block of data into a fixed-size output.  
data| `string`| The value that will be used to generate a digest.  
options(optional)| `CryptoDigestOptions`| Format of the digest string.
Defaults to: `CryptoDigestOptions.HEX`.  
  
  

The `digestStringAsync()` method of `Crypto` generates a digest of the
supplied `data` string with the provided digest `algorithm`. A digest is a
short fixed-length value derived from some variable-length input.
Cryptographic digests should exhibit _collision-resistance_ , meaning that
it's very difficult to generate multiple inputs that have equal digest values.
You can specify the returned string format as one of `CryptoEncoding`. By
default, the resolved value will be formatted as a `HEX` string. On web, this
method can only be called from a secure origin (HTTPS) otherwise, an error
will be thrown.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<Digest>`

Return a Promise which fulfills with a value representing the hashed input.

Example

    
    
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA512,
      '🥓 Easy to Digest! 💙'
    );
    

### `Crypto.getRandomBytes(byteCount)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
byteCount| `number`| A number within the range from `0` to `1024`. Anything
else will throw a `TypeError`.  
  
  

Generates completely random bytes using native implementations. The
`byteCount` property is a `number` indicating the number of bytes to generate
in the form of a `Uint8Array`. Falls back to `Math.random` during development
to prevent issues with React Native Debugger.

Returns:

`[Uint8Array](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)`

An array of random bytes with the same length as the `byteCount`.

### `Crypto.getRandomBytesAsync(byteCount)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
byteCount| `number`| A number within the range from `0` to `1024`. Anything
else will throw a `TypeError`.  
  
  

Generates completely random bytes using native implementations. The
`byteCount` property is a `number` indicating the number of bytes to generate
in the form of a `Uint8Array`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Uint8Array](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)>`

A promise that fulfills with an array of random bytes with the same length as
the `byteCount`.

### `Crypto.getRandomValues(typedArray)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
typedArray| `T`| An integer based
[`TypedArray`](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) to fill with
cryptographically secure random values. It modifies the input array in place.  
  
  

The `getRandomValues()` method of `Crypto` fills a provided `TypedArray` with
cryptographically secure random values.

Returns:

`T`

The input array filled with cryptographically secure random values.

Example

    
    
    const byteArray = new Uint8Array(16);
    Crypto.getRandomValues(byteArray);
    console.log('Your lucky bytes: ' + byteArray);
    

### `Crypto.randomUUID()`

Android

iOS

tvOS

Web

The `randomUUID()` method returns a unique identifier based on the V4 UUID
spec (RFC4122). It uses cryptographically secure random values to generate the
UUID.

Returns:

`string`

A string containing a newly generated UUIDv4 identifier

Example

    
    
    const UUID = Crypto.randomUUID();
    console.log('Your UUID: ' + UUID);
    

## Types

### `CryptoDigestOptions`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
encoding| `CryptoEncoding`| Format the digest is returned in.  
  
### `Digest`

Android

iOS

tvOS

Web

Type: `string`

## Enums

### `CryptoDigestAlgorithm`

Android

iOS

tvOS

Web

[`Cryptographic hash function`](https://developer.mozilla.org/en-
US/docs/Glossary/Cryptographic_hash_function)

#### `MD2`

iOS

`CryptoDigestAlgorithm.MD2 ＝ "MD2"`

`128` bits.

#### `MD4`

iOS

`CryptoDigestAlgorithm.MD4 ＝ "MD4"`

`128` bits.

#### `MD5`

Android

iOS

`CryptoDigestAlgorithm.MD5 ＝ "MD5"`

`128` bits.

#### `SHA1`

`CryptoDigestAlgorithm.SHA1 ＝ "SHA-1"`

`160` bits.

#### `SHA256`

`CryptoDigestAlgorithm.SHA256 ＝ "SHA-256"`

`256` bits. Collision Resistant.

#### `SHA384`

`CryptoDigestAlgorithm.SHA384 ＝ "SHA-384"`

`384` bits. Collision Resistant.

#### `SHA512`

`CryptoDigestAlgorithm.SHA512 ＝ "SHA-512"`

`512` bits. Collision Resistant.

### `CryptoEncoding`

Android

iOS

tvOS

Web

#### `BASE64`

`CryptoEncoding.BASE64 ＝ "base64"`

Has trailing padding. Does not wrap lines. Does not have a trailing newline.

#### `HEX`

`CryptoEncoding.HEX ＝ "hex"`

## Error codes

Code| Description  
---|---  
`ERR_CRYPTO_UNAVAILABLE`| Web Only. Access to the WebCrypto API is restricted
to secure origins (localhost/https).  
`ERR_CRYPTO_DIGEST`| An invalid encoding type provided.

