[Reference](/docs/reference)AI SDK Core

Copy markdown

# AI SDK Core

[AI SDK Core](/docs/ai-sdk-core) is a set of functions that allow you to
interact with language models and other AI models. These functions are
designed to be easy-to-use and flexible, allowing you to generate text,
structured data, and embeddings from language models and other AI models.

AI SDK Core contains the following main functions:

[generateText()Generate text and call tools from a language
model.](/docs/reference/ai-sdk-core/generate-text)[streamText()Stream text and
call tools from a language model.](/docs/reference/ai-sdk-core/stream-
text)[generateObject()Generate structured data from a language
model.](/docs/reference/ai-sdk-core/generate-object)[streamObject()Stream
structured data from a language model.](/docs/reference/ai-sdk-core/stream-
object)[embed()Generate an embedding for a single value using an embedding
model.](/docs/reference/ai-sdk-core/embed)[embedMany()Generate embeddings for
several values using an embedding model (batch
embedding).](/docs/reference/ai-sdk-core/embed-
many)[experimental_generateImage()Generate images based on a given prompt
using an image model.](/docs/reference/ai-sdk-core/generate-
image)[experimental_transcribe()Generate a transcript from an audio
file.](/docs/reference/ai-sdk-
core/transcribe)[experimental_generateSpeech()Generate speech audio from
text.](/docs/reference/ai-sdk-core/generate-speech)

It also contains the following helper functions:

[tool()Type inference helper function for tools.](/docs/reference/ai-sdk-
core/tool)[experimental_createMCPClient()Creates a client for connecting to
MCP servers.](/docs/reference/ai-sdk-core/create-mcp-
client)[jsonSchema()Creates AI SDK compatible JSON schema
objects.](/docs/reference/ai-sdk-core/json-schema)[zodSchema()Creates AI SDK
compatible Zod schema objects.](/docs/reference/ai-sdk-core/zod-
schema)[createProviderRegistry()Creates a registry for using models from
multiple providers.](/docs/reference/ai-sdk-core/provider-
registry)[cosineSimilarity()Calculates the cosine similarity between two
vectors, e.g. embeddings.](/docs/reference/ai-sdk-core/cosine-
similarity)[simulateReadableStream()Creates a ReadableStream that emits values
with configurable delays.](/docs/reference/ai-sdk-core/simulate-readable-
stream)[wrapLanguageModel()Wraps a language model with
middleware.](/docs/reference/ai-sdk-core/wrap-language-
model)[extractReasoningMiddleware()Extracts reasoning from the generated text
and exposes it as a `reasoning` property on the result.](/docs/reference/ai-
sdk-core/extract-reasoning-middleware)[simulateStreamingMiddleware()Simulates
streaming behavior with responses from non-streaming language
models.](/docs/reference/ai-sdk-core/simulate-streaming-
middleware)[defaultSettingsMiddleware()Applies default settings to a language
model.](/docs/reference/ai-sdk-core/default-settings-
middleware)[smoothStream()Smooths text streaming output.](/docs/reference/ai-
sdk-core/smooth-stream)[generateId()Helper function for generating unique
IDs](/docs/reference/ai-sdk-core/generate-id)[createIdGenerator()Creates an ID
generator](/docs/reference/ai-sdk-core/create-id-generator)

[PreviousReference](/docs/reference)

[NextgenerateText](/docs/reference/ai-sdk-core/generate-text)

