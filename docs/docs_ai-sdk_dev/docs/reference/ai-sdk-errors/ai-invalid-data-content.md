[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_InvalidDataContent

Copy markdown

# AI_InvalidDataContent

This error occurs when invalid data content is provided.

## Properties

  * `content`: The invalid content value
  * `message`: The error message
  * `cause`: The cause of the error

## Checking for this Error

You can check if an error is an instance of `AI_InvalidDataContent` using:

    
    
    import { InvalidDataContent } from 'ai';
    
    
    
    
    if (InvalidDataContent.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_InvalidDataContentError](/docs/reference/ai-sdk-errors/ai-invalid-
data-content-error)

[NextAI_InvalidMessageRoleError](/docs/reference/ai-sdk-errors/ai-invalid-
message-role-error)

