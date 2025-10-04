[AI SDK Core](/docs/ai-sdk-core)extractReasoningMiddleware

Copy markdown

# `extractReasoningMiddleware()`

`extractReasoningMiddleware` is a middleware function that extracts XML-tagged
reasoning sections from generated text and exposes them separately from the
main text content. This is particularly useful when you want to separate an AI
model's reasoning process from its final output.

    
    
    import { extractReasoningMiddleware } from 'ai';
    
    
    
    
    const middleware = extractReasoningMiddleware({
    
      tagName: 'reasoning',
    
      separator: '\n',
    
    });

## Import

    
    
    import { extractReasoningMiddleware } from "ai"

## API Signature

### Parameters

### tagName:

string

The name of the XML tag to extract reasoning from (without angle brackets)

### separator?:

string

The separator to use between reasoning and text sections. Defaults to "\n"

### startWithReasoning?:

boolean

Starts with reasoning tokens. Set to true when the response always starts with
reasoning and the initial tag is omitted. Defaults to false.

### Returns

Returns a middleware object that:

  * Processes both streaming and non-streaming responses
  * Extracts content between specified XML tags as reasoning
  * Removes the XML tags and reasoning from the main text
  * Adds a `reasoning` property to the result containing the extracted content
  * Maintains proper separation between text sections using the specified separator

### Type Parameters

The middleware works with the `LanguageModelV2StreamPart` type for streaming
responses.

[PreviousLanguageModelV2Middleware](/docs/reference/ai-sdk-core/language-
model-v2-middleware)

[NextsimulateStreamingMiddleware](/docs/reference/ai-sdk-core/simulate-
streaming-middleware)

