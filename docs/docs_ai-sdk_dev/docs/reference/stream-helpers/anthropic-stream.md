[Stream Helpers](/docs/reference/stream-helpers)AnthropicStream

Copy markdown

# `AnthropicStream`

AnthropicStream has been removed in AI SDK 4.0.

AnthropicStream is part of the legacy Anthropic integration. It is not
compatible with the AI SDK 3.1 functions. It is recommended to use the [AI SDK
Anthropic Provider](/providers/ai-sdk-providers/anthropic) instead.

It is a utility function that transforms the output from Anthropic's SDK into
a ReadableStream. It uses AIStream under the hood, applying a specific parser
for the Anthropic's response data structure.

## Import

### React

    
    
    import { AnthropicStream } from "ai"

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

### Returns

A `ReadableStream`.

[PreviousOpenAIStream](/docs/reference/stream-helpers/openai-stream)

[NextAWSBedrockStream](/docs/reference/stream-helpers/aws-bedrock-stream)

