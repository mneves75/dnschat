[Stream Helpers](/docs/reference/stream-helpers)AWSBedrockCohereStream

Copy markdown

# `CohereStream`

CohereStream has been removed in AI SDK 4.0.

CohereStream is part of the legacy Cohere integration. It is not compatible
with the AI SDK 3.1 functions.

The CohereStream function is a utility that transforms the output from
Cohere's API into a ReadableStream. It uses AIStream under the hood, applying
a specific parser for the Cohere's response data structure. This works with
the official Cohere API, and it's supported in both Node.js, the Edge Runtime,
and browser environments.

## Import

### React

    
    
    import { CohereStream } from "ai"

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

[PreviousAWSBedrockLlama2Stream](/docs/reference/stream-helpers/aws-bedrock-
llama-2-stream)

[NextGoogleGenerativeAIStream](/docs/reference/stream-helpers/google-
generative-ai-stream)

