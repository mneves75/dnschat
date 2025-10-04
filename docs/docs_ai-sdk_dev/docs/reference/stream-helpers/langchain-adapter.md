[Stream Helpers](/docs/reference/stream-helpers)@ai-sdk/langchain Adapter

Copy markdown

# `@ai-sdk/langchain`

The `@ai-sdk/langchain` module provides helper functions to transform
LangChain output streams into data streams and data stream responses. See the
[LangChain Adapter documentation](/providers/adapters/langchain) for more
information.

It supports:

  * LangChain StringOutputParser streams
  * LangChain AIMessageChunk streams
  * LangChain StreamEvents v2 streams

## Import

    
    
    import { toDataStreamResponse } from "@ai-sdk/langchain"

## API Signature

### Methods

### toDataStream:

(stream: ReadableStream<LangChainAIMessageChunk> | ReadableStream<string>, AIStreamCallbacksAndOptions) => AIStream

Converts LangChain output streams to data stream.

### toDataStreamResponse:

(stream: ReadableStream<LangChainAIMessageChunk> | ReadableStream<string>, options?: {init?: ResponseInit, data?: StreamData, callbacks?: AIStreamCallbacksAndOptions}) => Response

Converts LangChain output streams to data stream response.

### mergeIntoDataStream:

(stream: ReadableStream<LangChainStreamEvent> | ReadableStream<LangChainAIMessageChunk> | ReadableStream<string>, options: { dataStream: DataStreamWriter; callbacks?: StreamCallbacks }) => void

Merges LangChain output streams into an existing data stream.

## Examples

### Convert LangChain Expression Language Stream

app/api/completion/route.ts

    
    
    import { toUIMessageStream } from '@ai-sdk/langchain';
    
    import { ChatOpenAI } from '@langchain/openai';
    
    import { createUIMessageStreamResponse } from 'ai';
    
    
    
    
    export async function POST(req: Request) {
    
      const { prompt } = await req.json();
    
    
    
    
      const model = new ChatOpenAI({
    
        model: 'gpt-3.5-turbo-0125',
    
        temperature: 0,
    
      });
    
    
    
    
      const stream = await model.stream(prompt);
    
    
    
    
      return createUIMessageStreamResponse({
    
        stream: toUIMessageStream(stream),
    
      });
    
    }

### Convert StringOutputParser Stream

app/api/completion/route.ts

    
    
    import { toUIMessageStream } from '@ai-sdk/langchain';
    
    import { StringOutputParser } from '@langchain/core/output_parsers';
    
    import { ChatOpenAI } from '@langchain/openai';
    
    import { createUIMessageStreamResponse } from 'ai';
    
    
    
    
    export async function POST(req: Request) {
    
      const { prompt } = await req.json();
    
    
    
    
      const model = new ChatOpenAI({
    
        model: 'gpt-3.5-turbo-0125',
    
        temperature: 0,
    
      });
    
    
    
    
      const parser = new StringOutputParser();
    
    
    
    
      const stream = await model.pipe(parser).stream(prompt);
    
    
    
    
      return createUIMessageStreamResponse({
    
        stream: toUIMessageStream(stream),
    
      });
    
    }

[PreviousHuggingFaceStream](/docs/reference/stream-helpers/hugging-face-
stream)

[Next@ai-sdk/llamaindex Adapter](/docs/reference/stream-helpers/llamaindex-
adapter)

