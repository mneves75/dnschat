[AI SDK UI](/docs/ai-sdk-ui)useObject

Copy markdown

# `experimental_useObject()`

`useObject` is an experimental feature and only available in React, Svelte,
and Vue.

Allows you to consume text streams that represent a JSON object and parse them
into a complete object based on a schema. You can use it together with
[`streamObject`](/docs/reference/ai-sdk-core/stream-object) in the backend.

    
    
    'use client';
    
    
    
    
    import { experimental_useObject as useObject } from '@ai-sdk/react';
    
    
    
    
    export default function Page() {
    
      const { object, submit } = useObject({
    
        api: '/api/use-object',
    
        schema: z.object({ content: z.string() }),
    
      });
    
    
    
    
      return (
    
        <div>
    
          <button onClick={() => submit('example input')}>Generate</button>
    
          {object?.content && <p>{object.content}</p>}
    
        </div>
    
      );
    
    }

## Import

    
    
    import { experimental_useObject as useObject } from '@ai-sdk/react'

## API Signature

### Parameters

### api:

string

The API endpoint that is called to generate objects. It should stream JSON
that matches the schema as chunked text. It can be a relative path (starting
with `/`) or an absolute URL.

### schema:

Zod Schema | JSON Schema

A schema that defines the shape of the complete object. You can either pass in
a Zod schema or a JSON schema (using the `jsonSchema` function).

### id?:

string

A unique identifier. If not provided, a random one will be generated. When
provided, the `useObject` hook with the same `id` will have shared states
across components.

### initialValue?:

DeepPartial<RESULT> | undefined

An value for the initial object. Optional.

### fetch?:

FetchFunction

A custom fetch function to be used for the API call. Defaults to the global
fetch function. Optional.

### headers?:

Record<string, string> | Headers

A headers object to be passed to the API endpoint. Optional.

### credentials?:

RequestCredentials

The credentials mode to be used for the fetch request. Possible values are:
"omit", "same-origin", "include". Optional.

### onError?:

(error: Error) => void

Callback function to be called when an error is encountered. Optional.

### onFinish?:

(result: OnFinishResult) => void

Called when the streaming response has finished.

OnFinishResult

### object:

T | undefined

The generated object (typed according to the schema). Can be undefined if the
final object does not match the schema.

### error:

unknown | undefined

Optional error object. This is e.g. a TypeValidationError when the final
object does not match the schema.

### Returns

### submit:

(input: INPUT) => void

Calls the API with the provided input as JSON body.

### object:

DeepPartial<RESULT> | undefined

The current value for the generated object. Updated as the API streams JSON
chunks.

### error:

Error | unknown

The error object if the API call fails.

### isLoading:

boolean

Boolean flag indicating whether a request is currently in progress.

### stop:

() => void

Function to abort the current API request.

### clear:

() => void

Function to clear the object state.

## Examples

[Streaming Object Generation with useObject](/examples/next-
pages/basics/streaming-object-generation)

[PrevioususeCompletion](/docs/reference/ai-sdk-ui/use-completion)

[NextconvertToModelMessages](/docs/reference/ai-sdk-ui/convert-to-model-
messages)

