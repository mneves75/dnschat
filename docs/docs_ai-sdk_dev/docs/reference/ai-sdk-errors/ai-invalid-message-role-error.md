[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_InvalidMessageRoleError

Copy markdown

# AI_InvalidMessageRoleError

This error occurs when an invalid message role is provided.

## Properties

  * `role`: The invalid role value
  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_InvalidMessageRoleError`
using:

    
    
    import { InvalidMessageRoleError } from 'ai';
    
    
    
    
    if (InvalidMessageRoleError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_InvalidDataContent](/docs/reference/ai-sdk-errors/ai-invalid-data-
content)

[NextAI_InvalidPromptError](/docs/reference/ai-sdk-errors/ai-invalid-prompt-
error)

