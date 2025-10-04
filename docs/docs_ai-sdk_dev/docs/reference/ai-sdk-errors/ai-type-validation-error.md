[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_TypeValidationError

Copy markdown

# AI_TypeValidationError

This error occurs when type validation fails.

## Properties

  * `value`: The value that failed validation
  * `message`: The error message including validation details

## Checking for this Error

You can check if an error is an instance of `AI_TypeValidationError` using:

    
    
    import { TypeValidationError } from 'ai';
    
    
    
    
    if (TypeValidationError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousToolCallRepairError](/docs/reference/ai-sdk-errors/ai-tool-call-
repair-error)

[NextAI_UnsupportedFunctionalityError](/docs/reference/ai-sdk-errors/ai-
unsupported-functionality-error)

