[AI SDK Core](/docs/ai-sdk-core)generateImage

Copy markdown

# `generateImage()`

`generateImage` is an experimental feature.

Generates images based on a given prompt using an image model.

It is ideal for use cases where you need to generate images programmatically,
such as creating visual content or generating images for data augmentation.

    
    
    import { experimental_generateImage as generateImage } from 'ai';
    
    
    
    
    const { images } = await generateImage({
    
      model: openai.image('dall-e-3'),
    
      prompt: 'A futuristic cityscape at sunset',
    
      n: 3,
    
      size: '1024x1024',
    
    });
    
    
    
    
    console.log(images);

## Import

    
    
    import { experimental_generateImage as generateImage } from "ai"

## API Signature

### Parameters

### model:

ImageModelV2

The image model to use.

### prompt:

string

The input prompt to generate the image from.

### n?:

number

Number of images to generate.

### size?:

string

Size of the images to generate. Format: `{width}x{height}`.

### aspectRatio?:

string

Aspect ratio of the images to generate. Format: `{width}:{height}`.

### seed?:

number

Seed for the image generation.

### providerOptions?:

ProviderOptions

Additional provider-specific options.

### maxRetries?:

number

Maximum number of retries. Default: 2.

### abortSignal?:

AbortSignal

An optional abort signal to cancel the call.

### headers?:

Record<string, string>

Additional HTTP headers for the request.

### Returns

### image:

GeneratedFile

The first image that was generated.

GeneratedFile

### base64:

string

Image as a base64 encoded string.

### uint8Array:

Uint8Array

Image as a Uint8Array.

### mediaType:

string

The IANA media type of the image.

### images:

Array<GeneratedFile>

All images that were generated.

GeneratedFile

### base64:

string

Image as a base64 encoded string.

### uint8Array:

Uint8Array

Image as a Uint8Array.

### mediaType:

string

The IANA media type of the image.

### warnings:

ImageGenerationWarning[]

Warnings from the model provider (e.g. unsupported settings).

### providerMetadata?:

ImageModelProviderMetadata

Optional metadata from the provider. The outer key is the provider name. The
inner values are the metadata. An `images` key is always present in the
metadata and is an array with the same length as the top level `images` key.
Details depend on the provider.

### responses:

Array<ImageModelResponseMetadata>

Response metadata from the provider. There may be multiple responses if we
made multiple calls to the model.

ImageModelResponseMetadata

### timestamp:

Date

Timestamp for the start of the generated response.

### modelId:

string

The ID of the response model that was used to generate the response.

### headers?:

Record<string, string>

Response headers.

[PreviousembedMany](/docs/reference/ai-sdk-core/embed-many)

[Nexttranscribe](/docs/reference/ai-sdk-core/transcribe)

