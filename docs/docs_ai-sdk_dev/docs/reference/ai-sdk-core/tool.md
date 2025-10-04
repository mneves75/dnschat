[AI SDK Core](/docs/ai-sdk-core)tool

Copy markdown

# `tool()`

Tool is a helper function that infers the tool input for its `execute` method.

It does not have any runtime behavior, but it helps TypeScript infer the types
of the input for the `execute` method.

Without this helper function, TypeScript is unable to connect the
`inputSchema` property to the `execute` method, and the argument types of
`execute` cannot be inferred.

    
    
    import { tool } from 'ai';
    
    import { z } from 'zod';
    
    
    
    
    export const weatherTool = tool({
    
      description: 'Get the weather in a location',
    
      inputSchema: z.object({
    
        location: z.string().describe('The location to get the weather for'),
    
      }),
    
      // location below is inferred to be a string:
    
      execute: async ({ location }) => ({
    
        location,
    
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
    
      }),
    
    });

## Import

    
    
    import { tool } from "ai"

## API Signature

### Parameters

### tool:

Tool

The tool definition.

Tool

### description?:

string

Information about the purpose of the tool including details on how and when it
can be used by the model.

### inputSchema:

Zod Schema | JSON Schema

The schema of the input that the tool expects. The language model will use
this to generate the input. It is also used to validate the output of the
language model. Use descriptions to make the input understandable for the
language model. You can either pass in a Zod schema or a JSON schema (using
the `jsonSchema` function).

### execute?:

async (input: INPUT, options: ToolCallOptions) => RESULT | Promise<RESULT> | AsyncIterable<RESULT>

An async function that is called with the arguments from the tool call and
produces a result or a results iterable. If an iterable is provided, all
results but the last one are considered preliminary. If not provided, the tool
will not be executed automatically.

ToolCallOptions

### toolCallId:

string

The ID of the tool call. You can use it e.g. when sending tool-call related
information with stream data.

### messages:

ModelMessage[]

Messages that were sent to the language model to initiate the response that
contained the tool call. The messages do not include the system prompt nor the
assistant response that contained the tool call.

### abortSignal?:

AbortSignal

An optional abort signal that indicates that the overall operation should be
aborted.

### experimental_context?:

unknown

Context that is passed into tool execution. Experimental (can break in patch
releases).

### outputSchema?:

Zod Schema | JSON Schema

The schema of the output that the tool produces. Used for validation and type
inference.

### toModelOutput?:

(output: RESULT) => LanguageModelV2ToolResultPart['output']

Optional conversion function that maps the tool result to an output that can
be used by the language model. If not provided, the tool result will be sent
as a JSON object.

### onInputStart?:

(options: ToolCallOptions) => void | PromiseLike<void>

Optional function that is called when the argument streaming starts. Only
called when the tool is used in a streaming context.

### onInputDelta?:

(options: { inputTextDelta: string } & ToolCallOptions) => void | PromiseLike<void>

Optional function that is called when an argument streaming delta is
available. Only called when the tool is used in a streaming context.

### onInputAvailable?:

(options: { input: INPUT } & ToolCallOptions) => void | PromiseLike<void>

Optional function that is called when a tool call can be started, even if the
execute function is not provided.

### providerOptions?:

ProviderOptions

Additional provider-specific metadata. They are passed through to the provider
from the AI SDK and enable provider-specific functionality that can be fully
encapsulated in the provider.

### type?:

'function' | 'provider-defined'

The type of the tool. Defaults to "function" for regular tools. Use "provider-
defined" for provider-specific tools.

### id?:

string

The ID of the tool for provider-defined tools. Should follow the format
`<provider-name>.<unique-tool-name>`. Required when type is "provider-
defined".

### name?:

string

The name of the tool that the user must use in the tool set. Required when
type is "provider-defined".

### args?:

Record<string, unknown>

The arguments for configuring the tool. Must match the expected arguments
defined by the provider for this tool. Required when type is "provider-
defined".

### Returns

The tool that was passed in.

[PreviousgenerateSpeech](/docs/reference/ai-sdk-core/generate-speech)

[NextdynamicTool](/docs/reference/ai-sdk-core/dynamic-tool)

