[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_JSONParseError

Copy markdown

# AI_JSONParseError

This error occurs when JSON fails to parse.

## Properties

  * `text`: The text value that could not be parsed
  * `message`: The error message including parse error details

## Checking for this Error

You can check if an error is an instance of `AI_JSONParseError` using:

    
    
    import { JSONParseError } from 'ai';
    
    
    
    
    if (JSONParseError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_InvalidToolInputError](/docs/reference/ai-sdk-errors/ai-invalid-
tool-input-error)

[NextAI_LoadAPIKeyError](/docs/reference/ai-sdk-errors/ai-load-api-key-error)

