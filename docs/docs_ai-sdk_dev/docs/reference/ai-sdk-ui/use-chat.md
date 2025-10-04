[AI SDK UI](/docs/ai-sdk-ui)useChat

Copy markdown

# `useChat()`

Allows you to easily create a conversational user interface for your chatbot
application. It enables the streaming of chat messages from your AI provider,
manages the chat state, and updates the UI automatically as new messages are
received.

The `useChat` API has been significantly updated in AI SDK 5.0. It now uses a
transport-based architecture and no longer manages input state internally. See
the [migration guide](/docs/migration-guides/migration-guide-5-0#usechat-
changes) for details.

## Import

React

Svelte

Vue

    
    
    import { useChat } from '@ai-sdk/react'

## API Signature

### Parameters

### chat?:

Chat<UIMessage>

An existing Chat instance to use. If provided, other parameters are ignored.

### transport?:

ChatTransport

The transport to use for sending messages. Defaults to DefaultChatTransport
with `/api/chat` endpoint.

DefaultChatTransport

### api?:

string = '/api/chat'

The API endpoint for chat requests.

### credentials?:

RequestCredentials

The credentials mode for fetch requests.

### headers?:

Record<string, string> | Headers

HTTP headers to send with requests.

### body?:

object

Extra body object to send with requests.

### prepareSendMessagesRequest?:

PrepareSendMessagesRequest

A function to customize the request before chat API calls.

PrepareSendMessagesRequest

### options:

PrepareSendMessageRequestOptions

Options for preparing the request

PrepareSendMessageRequestOptions

### id:

string

The chat ID

### messages:

UIMessage[]

Current messages in the chat

### requestMetadata:

unknown

The request metadata

### body:

Record<string, any> | undefined

The request body

### credentials:

RequestCredentials | undefined

The request credentials

### headers:

HeadersInit | undefined

The request headers

### api:

string

The API endpoint to use for the request. If not specified, it defaults to the
transport’s API endpoint: /api/chat.

### trigger:

'submit-message' | 'regenerate-message'

The trigger for the request

### messageId:

string | undefined

The message ID if applicable

### prepareReconnectToStreamRequest?:

PrepareReconnectToStreamRequest

A function to customize the request before reconnect API call.

PrepareReconnectToStreamRequest

### options:

PrepareReconnectToStreamRequestOptions

Options for preparing the reconnect request

PrepareReconnectToStreamRequestOptions

### id:

string

The chat ID

### requestMetadata:

unknown

The request metadata

### body:

Record<string, any> | undefined

The request body

### credentials:

RequestCredentials | undefined

The request credentials

### headers:

HeadersInit | undefined

The request headers

### api:

string

The API endpoint to use for the request. If not specified, it defaults to the
transport’s API endpoint combined with the chat ID: /api/chat/{chatId}/stream.

### id?:

string

A unique identifier for the chat. If not provided, a random one will be
generated.

### messages?:

UIMessage[]

Initial chat messages to populate the conversation with.

### onToolCall?:

({toolCall: ToolCall}) => void | Promise<void>

Optional callback function that is invoked when a tool call is received. You
must call addToolResult to provide the tool result.

### sendAutomaticallyWhen?:

(options: { messages: UIMessage[] }) => boolean | PromiseLike<boolean>

When provided, this function will be called when the stream is finished or a
tool call is added to determine if the current messages should be resubmitted.
You can use the lastAssistantMessageIsCompleteWithToolCalls helper for common
scenarios.

### onFinish?:

(options: OnFinishOptions) => void

Called when the assistant response has finished streaming.

OnFinishOptions

### message:

UIMessage

The response message.

### messages:

UIMessage[]

All messages including the response message

### isAbort:

boolean

True when the request has been aborted by the client.

### isDisconnect:

boolean

True if the server has been disconnected, e.g. because of a network error.

### isError:

boolean

True if errors during streaming caused the response to stop early.

### onError?:

(error: Error) => void

Callback function to be called when an error is encountered.

### onData?:

(dataPart: DataUIPart) => void

Optional callback function that is called when a data part is received.

### experimental_throttle?:

number

Custom throttle wait in ms for the chat messages and data updates. Default is
undefined, which disables throttling.

### resume?:

boolean

Whether to resume an ongoing chat generation stream. Defaults to false.

### Returns

### id:

string

The id of the chat.

### messages:

UIMessage[]

The current array of chat messages.

UIMessage

### id:

string

A unique identifier for the message.

### role:

'system' | 'user' | 'assistant'

The role of the message.

### parts:

UIMessagePart[]

The parts of the message. Use this for rendering the message in the UI.

### metadata?:

unknown

The metadata of the message.

### status:

'submitted' | 'streaming' | 'ready' | 'error'

The current status of the chat: "ready" (idle), "submitted" (request sent),
"streaming" (receiving response), or "error" (request failed).

### error:

Error | undefined

The error object if an error occurred.

### sendMessage:

(message: CreateUIMessage | string, options?: ChatRequestOptions) => void

Function to send a new message to the chat. This will trigger an API call to
generate the assistant response.

ChatRequestOptions

### headers:

Record<string, string> | Headers

Additional headers that should be to be passed to the API endpoint.

### body:

object

Additional body JSON properties that should be sent to the API endpoint.

### data:

JSONValue

Additional data to be sent to the API endpoint.

### regenerate:

(options?: { messageId?: string }) => void

Function to regenerate the last assistant message or a specific message. If no
messageId is provided, regenerates the last assistant message.

### stop:

() => void

Function to abort the current streaming response from the assistant.

### clearError:

() => void

Clears the error state.

### resumeStream:

() => void

Function to resume an interrupted streaming response. Useful when a network
error occurs during streaming.

### addToolResult:

(options: { tool: string; toolCallId: string; output: unknown } | { tool: string; toolCallId: string; state: "output-error", errorText: string }) => void

Function to add a tool result to the chat. This will update the chat messages
with the tool result. If sendAutomaticallyWhen is configured, it may trigger
an automatic submission.

### setMessages:

(messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void

Function to update the messages state locally without triggering an API call.
Useful for optimistic updates.

## Learn more

  * [Chatbot](/docs/ai-sdk-ui/chatbot)
  * [Chatbot with Tools](/docs/ai-sdk-ui/chatbot-with-tool-calling)
  * [UIMessage](/docs/reference/ai-sdk-core/ui-message)

[PreviousAI SDK UI](/docs/reference/ai-sdk-ui)

[NextuseCompletion](/docs/reference/ai-sdk-ui/use-completion)

