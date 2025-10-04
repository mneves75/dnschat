[Stream Helpers](/docs/reference/stream-helpers)HuggingFaceStream

Copy markdown

# `HuggingFaceStream`

HuggingFaceStream has been removed in AI SDK 4.0.

HuggingFaceStream is part of the legacy Hugging Face integration. It is not
compatible with the AI SDK 3.1 functions.

Converts the output from language models hosted on Hugging Face into a
ReadableStream.

While HuggingFaceStream is compatible with most Hugging Face language models,
the rapidly evolving landscape of models may result in certain new or niche
models not being supported. If you encounter a model that isn't supported, we
encourage you to open an issue.

To ensure that AI responses are comprised purely of text without any
delimiters that could pose issues when rendering in chat or completion modes,
we standardize and remove special end-of-response tokens. If your use case
requires a different handling of responses, you can fork and modify this
stream to meet your specific needs.

Currently, `</s>` and `<|endoftext|>` are recognized as end-of-stream tokens.

## Import

### React

    
    
    import { HuggingFaceStream } from "ai"

## API Signature

### Parameters

### iter:

AsyncGenerator<any>

This parameter should be the generator function returned by the
hf.textGenerationStream method in the Hugging Face Inference SDK.

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

[PreviousGoogleGenerativeAIStream](/docs/reference/stream-helpers/google-
generative-ai-stream)

[Next@ai-sdk/langchain Adapter](/docs/reference/stream-helpers/langchain-
adapter)

