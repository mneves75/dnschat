[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_RetryError

Copy markdown

# AI_RetryError

This error occurs when a retry operation fails.

## Properties

  * `reason`: The reason for the retry failure
  * `lastError`: The most recent error that occurred during retries
  * `errors`: Array of all errors that occurred during retry attempts
  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_RetryError` using:

    
    
    import { RetryError } from 'ai';
    
    
    
    
    if (RetryError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_NoTranscriptGeneratedError](/docs/reference/ai-sdk-errors/ai-no-
transcript-generated-error)

[NextAI_TooManyEmbeddingValuesForCallError](/docs/reference/ai-sdk-errors/ai-
too-many-embedding-values-for-call-error)

