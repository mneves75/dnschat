[AI SDK UI](/docs/ai-sdk-ui)useCompletion

Copy markdown

# `useCompletion()`

Allows you to create text completion based capabilities for your application.
It enables the streaming of text completions from your AI provider, manages
the state for chat input, and updates the UI automatically as new messages are
received.

## Import

React

Svelte

Vue

    
    
    import { useCompletion } from '@ai-sdk/react'

## API Signature

### Parameters

### api:

string = '/api/completion'

The API endpoint that is called to generate text. It can be a relative path
(starting with `/`) or an absolute URL.

### id:

string

An unique identifier for the completion. If not provided, a random one will be
generated. When provided, the `useCompletion` hook with the same `id` will
have shared states across components. This is useful when you have multiple
components showing the same chat stream

### initialInput:

string

An optional string for the initial prompt input.

### initialCompletion:

string

An optional string for the initial completion result.

### onFinish:

(prompt: string, completion: string) => void

An optional callback function that is called when the completion stream ends.

### onError:

(error: Error) => void

An optional callback that will be called when the chat stream encounters an
error.

### headers:

Record<string, string> | Headers

An optional object of headers to be passed to the API endpoint.

### body:

any

An optional, additional body object to be passed to the API endpoint.

### credentials:

'omit' | 'same-origin' | 'include'

An optional literal that sets the mode of credentials to be used on the
request. Defaults to same-origin.

### streamProtocol?:

'text' | 'data'

An optional literal that sets the type of stream to be used. Defaults to
`data`. If set to `text`, the stream will be treated as a text stream.

### fetch?:

FetchFunction

Optional. A custom fetch function to be used for the API call. Defaults to the
global fetch function.

### experimental_throttle?:

number

React only. Custom throttle wait time in milliseconds for the completion and
data updates. When specified, throttles how often the UI updates during
streaming. Default is undefined, which disables throttling.

### Returns

### completion:

string

The current text completion.

### complete:

(prompt: string, options: { headers, body }) => void

Function to execute text completion based on the provided prompt.

### error:

undefined | Error

The error thrown during the completion process, if any.

### setCompletion:

(completion: string) => void

Function to update the `completion` state.

### stop:

() => void

Function to abort the current API request.

### input:

string

The current value of the input field.

### setInput:

React.Dispatch<React.SetStateAction<string>>

The current value of the input field.

### handleInputChange:

(event: any) => void

Handler for the `onChange` event of the input field to control the input's
value.

### handleSubmit:

(event?: { preventDefault?: () => void }) => void

Form submission handler that automatically resets the input field and appends
a user message.

### isLoading:

boolean

Boolean flag indicating whether a fetch operation is currently in progress.

[PrevioususeChat](/docs/reference/ai-sdk-ui/use-chat)

[NextuseObject](/docs/reference/ai-sdk-ui/use-object)

