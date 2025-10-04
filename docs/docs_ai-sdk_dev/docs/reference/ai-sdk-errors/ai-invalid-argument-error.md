[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_InvalidArgumentError

Copy markdown

# AI_InvalidArgumentError

This error occurs when an invalid argument was provided.

## Properties

  * `parameter`: The name of the parameter that is invalid
  * `value`: The invalid value
  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_InvalidArgumentError` using:

    
    
    import { InvalidArgumentError } from 'ai';
    
    
    
    
    if (InvalidArgumentError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_EmptyResponseBodyError](/docs/reference/ai-sdk-errors/ai-empty-
response-body-error)

[NextAI_InvalidDataContentError](/docs/reference/ai-sdk-errors/ai-invalid-
data-content-error)

