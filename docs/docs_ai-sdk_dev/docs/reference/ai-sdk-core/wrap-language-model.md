[AI SDK Core](/docs/ai-sdk-core)wrapLanguageModel

Copy markdown

# `wrapLanguageModel()`

The `wrapLanguageModel` function provides a way to enhance the behavior of
language models by wrapping them with middleware. See [Language Model
Middleware](/docs/ai-sdk-core/middleware) for more information on middleware.

    
    
    import { wrapLanguageModel } from 'ai';
    
    
    
    
    const wrappedLanguageModel = wrapLanguageModel({
    
      model: 'openai/gpt-4.1',
    
      middleware: yourLanguageModelMiddleware,
    
    });

## Import

    
    
    import { wrapLanguageModel } from "ai"

## API Signature

### Parameters

### model:

LanguageModelV2

The original LanguageModelV2 instance to be wrapped.

### middleware:

LanguageModelV2Middleware | LanguageModelV2Middleware[]

The middleware to be applied to the language model. When multiple middlewares
are provided, the first middleware will transform the input first, and the
last middleware will be wrapped directly around the model.

### modelId:

string

Optional custom model ID to override the original model's ID.

### providerId:

string

Optional custom provider ID to override the original model's provider.

### Returns

A new `LanguageModelV2` instance with middleware applied.

[PreviouscosineSimilarity](/docs/reference/ai-sdk-core/cosine-similarity)

[NextLanguageModelV2Middleware](/docs/reference/ai-sdk-core/language-
model-v2-middleware)

