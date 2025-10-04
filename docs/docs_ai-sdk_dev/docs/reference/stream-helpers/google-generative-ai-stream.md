[Stream Helpers](/docs/reference/stream-helpers)GoogleGenerativeAIStream

Copy markdown

# `GoogleGenerativeAIStream`

GoogleGenerativeAIStream has been removed in AI SDK 4.0.

GoogleGenerativeAIStream is part of the legacy Google Generative AI
integration. It is not compatible with the AI SDK 3.1 functions. It is
recommended to use the [AI SDK Google Generative AI Provider](/providers/ai-
sdk-providers/google-generative-ai) instead.

The GoogleGenerativeAIStream function is a utility that transforms the output
from Google's Generative AI SDK into a ReadableStream. It uses AIStream under
the hood, applying a specific parser for the Google's response data structure.
This works with the official Generative AI SDK, and it's supported in both
Node.js, Edge Runtime, and browser environments.

## Import

### React

    
    
    import { GoogleGenerativeAIStream } from "ai"

## API Signature

### Parameters

### response:

{ stream: AsyncIterable<GenerateContentResponse> }

The response object returned by the Google Generative AI API.

### callbacks?:

AIStreamCallbacksAndOptions

An object containing callback functions to handle the start, each token, and
completion of the AI response. In the absence of this parameter, default
behavior is implemented.

AIStreamCallbacksAndOptions

### onStart:

() => Promise<void>

An optional function that is called at the start of the stream processing.

### onCompletion:

(completion: string) => Promise<void>

An optional function that is called for every completion. It's passed the
completion as a string.

### onFinal:

(completion: string) => Promise<void>

An optional function that is called once when the stream is closed with the
final completion message.

### onToken:

(token: string) => Promise<void>

An optional function that is called for each token in the stream. It's passed
the token as a string.

### Returns

A `ReadableStream`.

[PreviousCohereStream](/docs/reference/stream-helpers/cohere-stream)

[NextHuggingFaceStream](/docs/reference/stream-helpers/hugging-face-stream)

