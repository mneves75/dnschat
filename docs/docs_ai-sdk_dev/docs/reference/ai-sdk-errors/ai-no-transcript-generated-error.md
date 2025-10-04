[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_NoTranscriptGeneratedError

Copy markdown

# AI_NoTranscriptGeneratedError

This error occurs when no transcript could be generated from the input.

## Properties

  * `responses`: Array of responses
  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_NoTranscriptGeneratedError`
using:

    
    
    import { NoTranscriptGeneratedError } from 'ai';
    
    
    
    
    if (NoTranscriptGeneratedError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_NoSuchToolError](/docs/reference/ai-sdk-errors/ai-no-such-tool-
error)

[NextAI_RetryError](/docs/reference/ai-sdk-errors/ai-retry-error)

