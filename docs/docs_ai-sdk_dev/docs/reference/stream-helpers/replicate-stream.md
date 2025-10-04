[Stream Helpers](/docs/reference/stream-helpers)ReplicateStream

Copy markdown

# `ReplicateStream`

ReplicateStream has been removed in AI SDK 4.0.

ReplicateStream is part of the legacy Replicate integration. It is not
compatible with the AI SDK 3.1 functions.

The ReplicateStream function is a utility that handles extracting the stream
from the output of [Replicate](https://replicate.com)'s API. It expects a
Prediction object as returned by the [Replicate JavaScript
SDK](https://github.com/replicate/replicate-javascript), and returns a
ReadableStream. Unlike other wrappers, ReplicateStream returns a Promise
because it makes a fetch call to the [Replicate streaming
API](https://github.com/replicate/replicate-javascript#streaming) under the
hood.

## Import

### React

    
    
    import { ReplicateStream } from "ai"

## API Signature

### Parameters

### pre:

Prediction

Object returned by the Replicate JavaScript SDK.

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

### options:

{ headers?: Record<string, string> }

An optional parameter for passing additional headers.

### Returns

A `ReadableStream` wrapped in a promise.

[PreviousMistralStream](/docs/reference/stream-helpers/mistral-stream)

[NextInkeepStream](/docs/reference/stream-helpers/inkeep-stream)

