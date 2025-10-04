[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_NoOutputSpecifiedError

Copy markdown

# AI_NoOutputSpecifiedError

This error occurs when no output format was specified for the AI response, and
output-related methods are called.

## Properties

  * `message`: The error message (defaults to 'No output specified.')

## Checking for this Error

You can check if an error is an instance of `AI_NoOutputSpecifiedError` using:

    
    
    import { NoOutputSpecifiedError } from 'ai';
    
    
    
    
    if (NoOutputSpecifiedError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_NoObjectGeneratedError](/docs/reference/ai-sdk-errors/ai-no-
object-generated-error)

[NextAI_NoSpeechGeneratedError](/docs/reference/ai-sdk-errors/ai-no-speech-
generated-error)

