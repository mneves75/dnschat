[Stream Helpers](/docs/reference/stream-helpers)AWSBedrockLlama2Stream

Copy markdown

# `AWSBedrockLlama2Stream`

AWSBedrockLlama2Stream has been removed in AI SDK 4.0.

AWSBedrockLlama2Stream is part of the legacy AWS Bedrock integration. It is
not compatible with the AI SDK 3.1 functions.

The AWS Bedrock stream functions are utilties that transform the outputs from
the AWS Bedrock API into a ReadableStream. It uses AIStream under the hood and
handle parsing Bedrock's response.

## Import

### React

    
    
    import { AWSBedrockLlama2Stream } from "ai"

## API Signature

### Parameters

### response:

AWSBedrockResponse

The response object returned from AWS Bedrock.

AWSBedrockResponse

### body?:

AsyncIterable<{ chunk?: { bytes?: Uint8Array } }>

An optional async iterable of objects containing optional binary data chunks.

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

[PreviousAWSBedrockCohereStream](/docs/reference/stream-helpers/aws-bedrock-
cohere-stream)

[NextCohereStream](/docs/reference/stream-helpers/cohere-stream)

