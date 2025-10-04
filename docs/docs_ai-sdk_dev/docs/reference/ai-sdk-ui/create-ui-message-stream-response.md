[AI SDK UI](/docs/ai-sdk-ui)createUIMessageStreamResponse

Copy markdown

# `createUIMessageStreamResponse`

The `createUIMessageStreamResponse` function creates a Response object that
streams UI messages to the client.

## Import

    
    
    import { createUIMessageStreamResponse } from "ai"

## Example

    
    
    import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
    
    
    
    
    const response = createUIMessageStreamResponse({
    
      status: 200,
    
      statusText: 'OK',
    
      headers: {
    
        'Custom-Header': 'value',
    
      },
    
      stream: createUIMessageStream({
    
        execute({ writer }) {
    
          // Write custom data
    
          writer.write({
    
            type: 'data',
    
            value: { message: 'Hello' },
    
          });
    
    
    
    
          // Write text content
    
          writer.write({
    
            type: 'text',
    
            value: 'Hello, world!',
    
          });
    
    
    
    
          // Write source information
    
          writer.write({
    
            type: 'source-url',
    
            value: {
    
              type: 'source',
    
              id: 'source-1',
    
              url: 'https://example.com',
    
              title: 'Example Source',
    
            },
    
          });
    
    
    
    
          // Merge with LLM stream
    
          const result = streamText({
    
            model: openai('gpt-4'),
    
            prompt: 'Say hello',
    
          });
    
    
    
    
          writer.merge(result.toUIMessageStream());
    
        },
    
      }),
    
    });

## API Signature

### Parameters

### stream:

ReadableStream<UIMessageChunk>

The UI message stream to send to the client.

### status?:

number

The status code for the response. Defaults to 200.

### statusText?:

string

The status text for the response.

### headers?:

Headers | Record<string, string>

Additional headers for the response.

### consumeSseStream?:

(options: { stream: ReadableStream<string> }) => PromiseLike<void> | void

Optional callback to consume the Server-Sent Events stream.

### Returns

`Response`

A Response object that streams UI message chunks with the specified status,
headers, and content.

[PreviouscreateUIMessageStream](/docs/reference/ai-sdk-ui/create-ui-message-
stream)

[NextpipeUIMessageStreamToResponse](/docs/reference/ai-sdk-ui/pipe-ui-message-
stream-to-response)

