[AI SDK Core](/docs/ai-sdk-core)embed

Copy markdown

# `embed()`

Generate an embedding for a single value using an embedding model.

This is ideal for use cases where you need to embed a single value to e.g.
retrieve similar items or to use the embedding in a downstream task.

    
    
    import { openai } from '@ai-sdk/openai';
    
    import { embed } from 'ai';
    
    
    
    
    const { embedding } = await embed({
    
      model: openai.textEmbeddingModel('text-embedding-3-small'),
    
      value: 'sunny day at the beach',
    
    });

## Import

    
    
    import { embed } from "ai"

## API Signature

### Parameters

### model:

EmbeddingModel

The embedding model to use. Example: openai.textEmbeddingModel('text-
embedding-3-small')

### value:

VALUE

The value to embed. The type depends on the model.

### maxRetries?:

number

Maximum number of retries. Set to 0 to disable retries. Default: 2.

### abortSignal?:

AbortSignal

An optional abort signal that can be used to cancel the call.

### headers?:

Record<string, string>

Additional HTTP headers to be sent with the request. Only applicable for HTTP-
based providers.

### experimental_telemetry?:

TelemetrySettings

Telemetry configuration. Experimental feature.

TelemetrySettings

### isEnabled?:

boolean

Enable or disable telemetry. Disabled by default while experimental.

### recordInputs?:

boolean

Enable or disable input recording. Enabled by default.

### recordOutputs?:

boolean

Enable or disable output recording. Enabled by default.

### functionId?:

string

Identifier for this function. Used to group telemetry data by function.

### metadata?:

Record<string, string | number | boolean | Array<null | undefined | string> | Array<null | undefined | number> | Array<null | undefined | boolean>>

Additional information to include in the telemetry data.

### tracer?:

Tracer

A custom tracer to use for the telemetry data.

### Returns

### value:

VALUE

The value that was embedded.

### embedding:

number[]

The embedding of the value.

### usage:

EmbeddingModelUsage

The token usage for generating the embeddings.

EmbeddingModelUsage

### tokens:

number

The number of tokens used in the embedding.

### response?:

Response

Optional response data.

Response

### headers?:

Record<string, string>

Response headers.

### body?:

unknown

The response body.

### providerMetadata?:

ProviderMetadata | undefined

Optional metadata from the provider. The outer key is the provider name. The
inner values are the metadata. Details depend on the provider.

[PreviousstreamObject](/docs/reference/ai-sdk-core/stream-object)

[NextembedMany](/docs/reference/ai-sdk-core/embed-many)

