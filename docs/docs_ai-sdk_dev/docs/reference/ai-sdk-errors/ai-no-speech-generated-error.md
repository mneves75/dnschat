[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_NoSpeechGeneratedError

Copy markdown

# AI_NoSpeechGeneratedError

This error occurs when no audio could be generated from the input.

## Properties

  * `responses`: Array of responses
  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_NoSpeechGeneratedError` using:

    
    
    import { NoSpeechGeneratedError } from 'ai';
    
    
    
    
    if (NoSpeechGeneratedError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_NoOutputSpecifiedError](/docs/reference/ai-sdk-errors/ai-no-
output-specified-error)

[NextAI_NoSuchModelError](/docs/reference/ai-sdk-errors/ai-no-such-model-
error)

