[Stream Helpers](/docs/reference/stream-helpers)OpenAIStream

Copy markdown

# `OpenAIStream`

OpenAIStream has been removed in AI SDK 4.0

OpenAIStream is part of the legacy OpenAI integration. It is not compatible
with the AI SDK 3.1 functions. It is recommended to use the [AI SDK OpenAI
Provider](/providers/ai-sdk-providers/openai) instead.

Transforms the response from OpenAI's language models into a ReadableStream.

Note: Prior to v4, the official OpenAI API SDK does not support the Edge
Runtime and only works in serverless environments. The openai-edge package is
based on fetch instead of axios (and thus works in the Edge Runtime) so we
recommend using openai v4+ or openai-edge.

## Import

### React

    
    
    import { OpenAIStream } from "ai"

## API Signature

### Parameters

### response:

Response

The response object returned by a call made by the Provider SDK.

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

[PreviousstreamToResponse](/docs/reference/stream-helpers/stream-to-response)

[NextAnthropicStream](/docs/reference/stream-helpers/anthropic-stream)

