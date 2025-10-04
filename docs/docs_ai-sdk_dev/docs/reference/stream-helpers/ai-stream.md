[Stream Helpers](/docs/reference/stream-helpers)AIStream

Copy markdown

# `AIStream`

AIStream has been removed in AI SDK 4.0. Use
`streamText.toDataStreamResponse()` instead.

Creates a readable stream for AI responses. This is based on the responses
returned by fetch and serves as the basis for the OpenAIStream and
AnthropicStream. It allows you to handle AI response streams in a controlled
and customized manner that will work with useChat and useCompletion.

AIStream will throw an error if response doesn't have a 2xx status code. This
is to ensure that the stream is only created for successful responses.

## Import

### React

    
    
    import { AIStream } from "ai"

## API Signature

### response:

Response

This is the response object returned by fetch. It's used as the source of the
readable stream.

### customParser:

(AIStreamParser) => void

This is a function that is used to parse the events in the stream. It should
return a function that receives a stringified chunk from the LLM and extracts
the message content. The function is expected to return nothing (void) or a
string.

AIStreamParser

###

(data: string) => string | void

### callbacks:

AIStreamCallbacksAndOptions

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

[PreviousStream Helpers](/docs/reference/stream-helpers)

[NextStreamingTextResponse](/docs/reference/stream-helpers/streaming-text-
response)

