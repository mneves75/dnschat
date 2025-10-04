[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_NoSuchToolError

Copy markdown

# AI_NoSuchToolError

This error occurs when a model tries to call an unavailable tool.

## Properties

  * `toolName`: The name of the tool that was not found
  * `availableTools`: Array of available tool names
  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_NoSuchToolError` using:

    
    
    import { NoSuchToolError } from 'ai';
    
    
    
    
    if (NoSuchToolError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_NoSuchProviderError](/docs/reference/ai-sdk-errors/ai-no-such-
provider-error)

[NextAI_NoTranscriptGeneratedError](/docs/reference/ai-sdk-errors/ai-no-
transcript-generated-error)

