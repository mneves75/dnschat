[Reference](/docs/reference)AI SDK UI

Copy markdown

# AI SDK UI

[AI SDK UI](/docs/ai-sdk-ui) is designed to help you build interactive chat,
completion, and assistant applications with ease. It is framework-agnostic
toolkit, streamlining the integration of advanced AI functionalities into your
applications.

AI SDK UI contains the following hooks:

[useChatUse a hook to interact with language models in a chat
interface.](/docs/reference/ai-sdk-ui/use-chat)[useCompletionUse a hook to
interact with language models in a completion interface.](/docs/reference/ai-
sdk-ui/use-completion)[useObjectUse a hook for consuming a streamed JSON
objects.](/docs/reference/ai-sdk-ui/use-object)[convertToModelMessagesConvert
useChat messages to ModelMessages for AI functions.](/docs/reference/ai-sdk-
ui/convert-to-model-messages)[createUIMessageStreamCreate a UI message stream
to stream additional data to the client.](/docs/reference/ai-sdk-ui/create-ui-
message-stream)[createUIMessageStreamResponseCreate a response object to
stream UI messages to the client.](/docs/reference/ai-sdk-ui/create-ui-
message-stream-response)[pipeUIMessageStreamToResponsePipe a UI message stream
to a Node.js ServerResponse object.](/docs/reference/ai-sdk-ui/pipe-ui-
message-stream-to-response)[readUIMessageStreamTransform a stream of
UIMessageChunk objects into an AsyncIterableStream of UIMessage
objects.](/docs/reference/ai-sdk-ui/read-ui-message-stream)

## UI Framework Support

AI SDK UI supports the following frameworks: [React](https://react.dev/),
[Svelte](https://svelte.dev/), and [Vue.js](https://vuejs.org/). Here is a
comparison of the supported functions across these frameworks:

Function| React| Svelte| Vue.js  
---|---|---|---  
[useChat](/docs/reference/ai-sdk-ui/use-chat)| |  Chat|   
[useCompletion](/docs/reference/ai-sdk-ui/use-completion)| |  Completion|   
[useObject](/docs/reference/ai-sdk-ui/use-object)| |  StructuredObject|   
  
[Contributions](https://github.com/vercel/ai/blob/main/CONTRIBUTING.md) are
welcome to implement missing features for non-React frameworks.

[PreviouscreateIdGenerator](/docs/reference/ai-sdk-core/create-id-generator)

[NextuseChat](/docs/reference/ai-sdk-ui/use-chat)

