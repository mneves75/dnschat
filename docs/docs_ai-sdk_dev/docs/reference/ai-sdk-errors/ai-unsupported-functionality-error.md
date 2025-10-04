[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_UnsupportedFunctionalityError

Copy markdown

# AI_UnsupportedFunctionalityError

This error occurs when functionality is not unsupported.

## Properties

  * `functionality`: The name of the unsupported functionality
  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_UnsupportedFunctionalityError`
using:

    
    
    import { UnsupportedFunctionalityError } from 'ai';
    
    
    
    
    if (UnsupportedFunctionalityError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_TypeValidationError](/docs/reference/ai-sdk-errors/ai-type-
validation-error)

[NextMigration Guides](/docs/migration-guides)

