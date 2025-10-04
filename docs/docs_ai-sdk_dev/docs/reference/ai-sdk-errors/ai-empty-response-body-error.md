[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_EmptyResponseBodyError

Copy markdown

# AI_EmptyResponseBodyError

This error occurs when the server returns an empty response body.

## Properties

  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_EmptyResponseBodyError` using:

    
    
    import { EmptyResponseBodyError } from 'ai';
    
    
    
    
    if (EmptyResponseBodyError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_DownloadError](/docs/reference/ai-sdk-errors/ai-download-error)

[NextAI_InvalidArgumentError](/docs/reference/ai-sdk-errors/ai-invalid-
argument-error)

