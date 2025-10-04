[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_NoSuchProviderError

Copy markdown

# AI_NoSuchProviderError

This error occurs when a provider ID is not found.

## Properties

  * `providerId`: The ID of the provider that was not found
  * `availableProviders`: Array of available provider IDs
  * `modelId`: The ID of the model
  * `modelType`: The type of model
  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_NoSuchProviderError` using:

    
    
    import { NoSuchProviderError } from 'ai';
    
    
    
    
    if (NoSuchProviderError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_NoSuchModelError](/docs/reference/ai-sdk-errors/ai-no-such-model-
error)

[NextAI_NoSuchToolError](/docs/reference/ai-sdk-errors/ai-no-such-tool-error)

