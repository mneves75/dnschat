[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_NoContentGeneratedError

Copy markdown

# AI_NoContentGeneratedError

This error occurs when the AI provider fails to generate content.

## Properties

  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_NoContentGeneratedError`
using:

    
    
    import { NoContentGeneratedError } from 'ai';
    
    
    
    
    if (NoContentGeneratedError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_MessageConversionError](/docs/reference/ai-sdk-errors/ai-message-
conversion-error)

[NextAI_NoImageGeneratedError](/docs/reference/ai-sdk-errors/ai-no-image-
generated-error)

