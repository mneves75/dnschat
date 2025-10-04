[Stream Helpers](/docs/reference/stream-helpers)StreamingTextResponse

Copy markdown

# `StreamingTextResponse`

`StreamingTextResponse` has been removed in AI SDK 4.0. Use
[`streamText.toDataStreamResponse()`](/docs/reference/ai-sdk-core/stream-text)
instead.

It is a utility class that simplifies the process of returning a
ReadableStream of text in HTTP responses. It is a lightweight wrapper around
the native Response class, automatically setting the status code to 200 and
the Content-Type header to 'text/plain; charset=utf-8'.

## Import

    
    
    import { StreamingTextResponse } from "ai"

## API Signature

## Parameters

### stream:

ReadableStream

The stream of content which represents the HTTP response.

### init?:

ResponseInit

It can be used to customize the properties of the HTTP response. It is an
object that corresponds to the ResponseInit object used in the Response
constructor.

ResponseInit

### status?:

number

The status code for the response. StreamingTextResponse will overwrite this
value with 200.

### statusText?:

string

The status message associated with the status code.

### headers?:

HeadersInit

Any headers you want to add to your response. StreamingTextResponse will add
'Content-Type': 'text/plain; charset=utf-8' to these headers.

### data?:

StreamData

StreamData object that you are using to generate additional data for the
response.

### Returns

An instance of Response with the provided ReadableStream as the body, the
status set to 200, and the Content-Type header set to 'text/plain;
charset=utf-8'. Additional headers and properties can be added using the init
parameter

[PreviousAIStream](/docs/reference/stream-helpers/ai-stream)

[NextstreamToResponse](/docs/reference/stream-helpers/stream-to-response)

