[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_InvalidPromptError

Copy markdown

# AI_InvalidPromptError

This error occurs when the prompt provided is invalid.

## Properties

  * `prompt`: The invalid prompt value
  * `message`: The error message
  * `cause`: The cause of the error

## Checking for this Error

You can check if an error is an instance of `AI_InvalidPromptError` using:

    
    
    import { InvalidPromptError } from 'ai';
    
    
    
    
    if (InvalidPromptError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_InvalidMessageRoleError](/docs/reference/ai-sdk-errors/ai-invalid-
message-role-error)

[NextAI_InvalidResponseDataError](/docs/reference/ai-sdk-errors/ai-invalid-
response-data-error)

