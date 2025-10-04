[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_NoSuchModelError

Copy markdown

# AI_NoSuchModelError

This error occurs when a model ID is not found.

## Properties

  * `modelId`: The ID of the model that was not found
  * `modelType`: The type of model
  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_NoSuchModelError` using:

    
    
    import { NoSuchModelError } from 'ai';
    
    
    
    
    if (NoSuchModelError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_NoSpeechGeneratedError](/docs/reference/ai-sdk-errors/ai-no-
speech-generated-error)

[NextAI_NoSuchProviderError](/docs/reference/ai-sdk-errors/ai-no-such-
provider-error)

