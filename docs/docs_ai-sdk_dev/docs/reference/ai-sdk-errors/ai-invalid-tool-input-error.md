[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_InvalidToolInputError

Copy markdown

# AI_InvalidToolInputError

This error occurs when invalid tool input was provided.

## Properties

  * `toolName`: The name of the tool with invalid inputs
  * `toolInput`: The invalid tool inputs
  * `message`: The error message
  * `cause`: The cause of the error

## Checking for this Error

You can check if an error is an instance of `AI_InvalidToolInputError` using:

    
    
    import { InvalidToolInputError } from 'ai';
    
    
    
    
    if (InvalidToolInputError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_InvalidResponseDataError](/docs/reference/ai-sdk-errors/ai-
invalid-response-data-error)

[NextAI_JSONParseError](/docs/reference/ai-sdk-errors/ai-json-parse-error)

