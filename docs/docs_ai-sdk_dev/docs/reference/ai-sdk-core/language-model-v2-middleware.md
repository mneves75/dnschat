[AI SDK Core](/docs/ai-sdk-core)LanguageModelV2Middleware

Copy markdown

# `LanguageModelV2Middleware`

Language model middleware is an experimental feature.

Language model middleware provides a way to enhance the behavior of language
models by intercepting and modifying the calls to the language model. It can
be used to add features like guardrails, RAG, caching, and logging in a
language model agnostic way.

See [Language Model Middleware](/docs/ai-sdk-core/middleware) for more
information.

## Import

    
    
    import { LanguageModelV2Middleware } from "ai"

## API Signature

### transformParams:

({ type: "generate" | "stream", params: LanguageModelV2CallOptions }) => Promise<LanguageModelV2CallOptions>

Transforms the parameters before they are passed to the language model.

### wrapGenerate:

({ doGenerate: DoGenerateFunction, params: LanguageModelV2CallOptions, model:
LanguageModelV2 }) => Promise<DoGenerateResult>

Wraps the generate operation of the language model.

### wrapStream:

({ doStream: DoStreamFunction, params: LanguageModelV2CallOptions, model:
LanguageModelV2 }) => Promise<DoStreamResult>

Wraps the stream operation of the language model.

[PreviouswrapLanguageModel](/docs/reference/ai-sdk-core/wrap-language-model)

[NextextractReasoningMiddleware](/docs/reference/ai-sdk-core/extract-
reasoning-middleware)

