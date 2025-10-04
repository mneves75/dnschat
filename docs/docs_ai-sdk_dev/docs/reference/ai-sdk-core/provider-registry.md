[AI SDK Core](/docs/ai-sdk-core)createProviderRegistry

Copy markdown

# `createProviderRegistry()`

When you work with multiple providers and models, it is often desirable to
manage them in a central place and access the models through simple string
ids.

`createProviderRegistry` lets you create a registry with multiple providers
that you can access by their ids in the format `providerId:modelId`.

### Setup

You can create a registry with multiple providers and models using
`createProviderRegistry`.

    
    
    import { anthropic } from '@ai-sdk/anthropic';
    
    import { createOpenAI } from '@ai-sdk/openai';
    
    import { createProviderRegistry } from 'ai';
    
    
    
    
    export const registry = createProviderRegistry({
    
      // register provider with prefix and default setup:
    
      anthropic,
    
    
    
    
      // register provider with prefix and custom setup:
    
      openai: createOpenAI({
    
        apiKey: process.env.OPENAI_API_KEY,
    
      }),
    
    });

### Custom Separator

By default, the registry uses `:` as the separator between provider and model
IDs. You can customize this separator by passing a `separator` option:

    
    
    const registry = createProviderRegistry(
    
      {
    
        anthropic,
    
        openai,
    
      },
    
      { separator: ' > ' },
    
    );
    
    
    
    
    // Now you can use the custom separator
    
    const model = registry.languageModel('anthropic > claude-3-opus-20240229');

### Language models

You can access language models by using the `languageModel` method on the
registry. The provider id will become the prefix of the model id:
`providerId:modelId`.

    
    
    import { generateText } from 'ai';
    
    import { registry } from './registry';
    
    
    
    
    const { text } = await generateText({
    
      model: registry.languageModel('openai:gpt-4.1'),
    
      prompt: 'Invent a new holiday and describe its traditions.',
    
    });

### Text embedding models

You can access text embedding models by using the `textEmbeddingModel` method
on the registry. The provider id will become the prefix of the model id:
`providerId:modelId`.

    
    
    import { embed } from 'ai';
    
    import { registry } from './registry';
    
    
    
    
    const { embedding } = await embed({
    
      model: registry.textEmbeddingModel('openai:text-embedding-3-small'),
    
      value: 'sunny day at the beach',
    
    });

### Image models

You can access image models by using the `imageModel` method on the registry.
The provider id will become the prefix of the model id: `providerId:modelId`.

    
    
    import { generateImage } from 'ai';
    
    import { registry } from './registry';
    
    
    
    
    const { image } = await generateImage({
    
      model: registry.imageModel('openai:dall-e-3'),
    
      prompt: 'A beautiful sunset over a calm ocean',
    
    });

## Import

    
    
    import { createProviderRegistry } from "ai"

## API Signature

### Parameters

### providers:

Record<string, Provider>

The unique identifier for the provider. It should be unique within the
registry.

Provider

### languageModel:

(id: string) => LanguageModel

A function that returns a language model by its id.

### textEmbeddingModel:

(id: string) => EmbeddingModel<string>

A function that returns a text embedding model by its id.

### imageModel:

(id: string) => ImageModel

A function that returns an image model by its id.

### options:

object

Optional configuration for the registry.

Options

### separator:

string

Custom separator between provider and model IDs. Defaults to ":".

### Returns

The `createProviderRegistry` function returns a `Provider` instance. It has
the following methods:

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

[PrevioussafeValidateUIMessages](/docs/reference/ai-sdk-core/safe-validate-ui-
messages)

[NextcustomProvider](/docs/reference/ai-sdk-core/custom-provider)

