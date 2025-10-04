[AI SDK UI](/docs/ai-sdk-ui)createUIMessageStream

Copy markdown

# `createUIMessageStream`

The `createUIMessageStream` function allows you to create a readable stream
for UI messages with advanced features like message merging, error handling,
and finish callbacks.

## Import

    
    
    import { createUIMessageStream } from "ai"

## Example

    
    
    const existingMessages: UIMessage[] = [
    
      /* ... */
    
    ];
    
    
    
    
    const stream = createUIMessageStream({
    
      async execute({ writer }) {
    
        // Start a text message
    
        // Note: The id must be consistent across text-start, text-delta, and text-end steps
    
        // This allows the system to correctly identify they belong to the same text block
    
        writer.write({
    
          type: 'text-start',
    
          id: 'example-text',
    
        });
    
    
    
    
        // Write a message chunk
    
        writer.write({
    
          type: 'text-delta',
    
          id: 'example-text',
    
          delta: 'Hello',
    
        });
    
    
    
    
        // End the text message
    
        writer.write({
    
          type: 'text-end',
    
          id: 'example-text',
    
        });
    
    
    
    
        // Merge another stream from streamText
    
        const result = streamText({
    
          model: openai('gpt-4o'),
    
          prompt: 'Write a haiku about AI',
    
        });
    
    
    
    
        writer.merge(result.toUIMessageStream());
    
      },
    
      onError: error => `Custom error: ${error.message}`,
    
      originalMessages: existingMessages,
    
      onFinish: ({ messages, isContinuation, responseMessage }) => {
    
        console.log('Stream finished with messages:', messages);
    
      },
    
    });

## API Signature

### Parameters

### execute:

(options: { writer: UIMessageStreamWriter }) => Promise<void> | void

A function that receives a writer instance and can use it to write UI message
chunks to the stream.

UIMessageStreamWriter

### write:

(part: UIMessageChunk) => void

Writes a UI message chunk to the stream.

### merge:

(stream: ReadableStream<UIMessageChunk>) => void

Merges the contents of another UI message stream into this stream.

### onError:

(error: unknown) => string

Error handler that is used by the stream writer for handling errors in merged
streams.

### onError:

(error: unknown) => string

A function that handles errors and returns an error message string. By
default, it returns the error message.

### originalMessages:

UIMessage[] | undefined

The original messages. If provided, persistence mode is assumed and a message
ID is provided for the response message.

### onFinish:

(options: { messages: UIMessage[]; isContinuation: boolean; responseMessage: UIMessage }) => void | undefined

A callback function that is called when the stream finishes.

FinishOptions

### messages:

UIMessage[]

The updated list of UI messages.

### isContinuation:

boolean

Indicates whether the response message is a continuation of the last original
message, or if a new message was created.

### responseMessage:

UIMessage

The message that was sent to the client as a response (including the original
message if it was extended).

### generateId:

IdGenerator | undefined

A function to generate unique IDs for messages. Uses the default ID generator
if not provided.

### Returns

`ReadableStream<UIMessageChunk>`

A readable stream that emits UI message chunks. The stream automatically
handles error propagation, merging of multiple streams, and proper cleanup
when all operations are complete.

[PreviousconvertToModelMessages](/docs/reference/ai-sdk-ui/convert-to-model-
messages)

[NextcreateUIMessageStreamResponse](/docs/reference/ai-sdk-ui/create-ui-
message-stream-response)

