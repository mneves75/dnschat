[AI SDK Core](/docs/ai-sdk-core)customProvider

Copy markdown

# `customProvider()`

With a custom provider, you can map ids to any model. This allows you to set
up custom model configurations, alias names, and more. The custom provider
also supports a fallback provider, which is useful for wrapping existing
providers and adding additional functionality.

### Example: custom model settings

You can create a custom provider using `customProvider`.

    
    
    import { openai } from '@ai-sdk/openai';
    
    import { customProvider } from 'ai';
    
    
    
    
    // custom provider with different model settings:
    
    export const myOpenAI = customProvider({
    
      languageModels: {
    
        // replacement model with custom settings:
    
        'gpt-4': wrapLanguageModel({
    
          model: openai('gpt-4'),
    
          middleware: defaultSettingsMiddleware({
    
            settings: {
    
              providerOptions: {
    
                openai: {
    
                  reasoningEffort: 'high',
    
                },
    
              },
    
            },
    
          }),
    
        }),
    
        // alias model with custom settings:
    
        'gpt-4o-reasoning-high': wrapLanguageModel({
    
          model: openai('gpt-4o'),
    
          middleware: defaultSettingsMiddleware({
    
            settings: {
    
              providerOptions: {
    
                openai: {
    
                  reasoningEffort: 'high',
    
                },
    
              },
    
            },
    
          }),
    
        }),
    
      },
    
      fallbackProvider: openai,
    
    });

## Import

    
    
    import {  customProvider } from "ai"

## API Signature

### Parameters

### languageModels?:

Record<string, LanguageModel>

A record of language models, where keys are model IDs and values are
LanguageModel instances.

### textEmbeddingModels?:

Record<string, EmbeddingModel<string>>

A record of text embedding models, where keys are model IDs and values are
EmbeddingModel<string> instances.

### imageModels?:

Record<string, ImageModel>

A record of image models, where keys are model IDs and values are ImageModelV2
instances.

### fallbackProvider?:

Provider

An optional fallback provider to use when a requested model is not found in
the custom provider.

### Returns

The `customProvider` function returns a `Provider` instance. It has the
following methods:

### languageModel:

(id: string) => LanguageModel

A function that returns a language model by its id (format:
providerId:modelId)

### textEmbeddingModel:

(id: string) => EmbeddingModel<string>

A function that returns a text embedding model by its id (format:
providerId:modelId)

### imageModel:

(id: string) => ImageModel

A function that returns an image model by its id (format: providerId:modelId)

[PreviouscreateProviderRegistry](/docs/reference/ai-sdk-core/provider-
registry)

[NextcosineSimilarity](/docs/reference/ai-sdk-core/cosine-similarity)

