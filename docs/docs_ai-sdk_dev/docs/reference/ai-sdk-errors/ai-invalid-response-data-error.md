[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_InvalidResponseDataError

Copy markdown

# AI_InvalidResponseDataError

This error occurs when the server returns a response with invalid data
content.

## Properties

  * `data`: The invalid response data value
  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_InvalidResponseDataError`
using:

    
    
    import { InvalidResponseDataError } from 'ai';
    
    
    
    
    if (InvalidResponseDataError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_InvalidPromptError](/docs/reference/ai-sdk-errors/ai-invalid-
prompt-error)

[NextAI_InvalidToolInputError](/docs/reference/ai-sdk-errors/ai-invalid-tool-
input-error)

