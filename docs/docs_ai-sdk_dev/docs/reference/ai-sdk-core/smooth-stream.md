[AI SDK Core](/docs/ai-sdk-core)smoothStream

Copy markdown

# `smoothStream()`

`smoothStream` is a utility function that creates a TransformStream for the
`streamText` `transform` option to smooth out text streaming by buffering and
releasing complete words with configurable delays. This creates a more natural
reading experience when streaming text responses.

    
    
    import { smoothStream, streamText } from 'ai';
    
    
    
    
    const result = streamText({
    
      model,
    
      prompt,
    
      experimental_transform: smoothStream({
    
        delayInMs: 20, // optional: defaults to 10ms
    
        chunking: 'line', // optional: defaults to 'word'
    
      }),
    
    });

## Import

    
    
    import { smoothStream } from "ai"

## API Signature

### Parameters

### delayInMs?:

number | null

The delay in milliseconds between outputting each chunk. Defaults to 10ms. Set
to `null` to disable delays.

### chunking?:

"word" | "line" | RegExp | (buffer: string) => string | undefined | null

Controls how the text is chunked for streaming. Use "word" to stream word by
word (default), "line" to stream line by line, or provide a custom callback or
RegExp pattern for custom chunking.

#### Word chunking caveats with non-latin languages

The word based chunking **does not work well** with the following languages
that do not delimit words with spaces:

For these languages we recommend using a custom regex, like the following:

  * Chinese - `/[\u4E00-\u9FFF]|\S+\s+/`
  * Japanese - `/[\u3040-\u309F\u30A0-\u30FF]|\S+\s+/`

Japanese example

    
    
    import { smoothStream, streamText } from 'ai';
    
    
    
    
    const result = streamText({
    
      model: 'openai/gpt-4.1',
    
      prompt: 'Your prompt here',
    
      experimental_transform: smoothStream({
    
        chunking: /[\u3040-\u309F\u30A0-\u30FF]|\S+\s+/,
    
      }),
    
    });

Chinese example

    
    
    import { smoothStream, streamText } from 'ai';
    
    
    
    
    const result = streamText({
    
      model: 'openai/gpt-4.1',
    
      prompt: 'Your prompt here',
    
      experimental_transform: smoothStream({
    
        chunking: /[\u4E00-\u9FFF]|\S+\s+/,
    
      }),
    
    });

For these languages you could pass your own language aware chunking function:

  * Vietnamese
  * Thai
  * Javanese (Aksara Jawa)

#### Regex based chunking

To use regex based chunking, pass a `RegExp` to the `chunking` option.

    
    
    // To split on underscores:
    
    smoothStream({
    
      chunking: /_+/,
    
    });
    
    
    
    
    // Also can do it like this, same behavior
    
    smoothStream({
    
      chunking: /[^_]*_/,
    
    });

#### Custom callback chunking

To use a custom callback for chunking, pass a function to the `chunking`
option.

    
    
    smoothStream({
    
      chunking: text => {
    
        const findString = 'some string';
    
        const index = text.indexOf(findString);
    
    
    
    
        if (index === -1) {
    
          return null;
    
        }
    
    
    
    
        return text.slice(0, index) + findString;
    
      },
    
    });

### Returns

Returns a `TransformStream` that:

  * Buffers incoming text chunks
  * Releases text when the chunking pattern is encountered
  * Adds configurable delays between chunks for smooth output
  * Passes through non-text chunks (like step-finish events) immediately

[PrevioussimulateReadableStream](/docs/reference/ai-sdk-core/simulate-
readable-stream)

[NextgenerateId](/docs/reference/ai-sdk-core/generate-id)

