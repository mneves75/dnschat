[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_MessageConversionError

Copy markdown

# AI_MessageConversionError

This error occurs when message conversion fails.

## Properties

  * `originalMessage`: The original message that failed conversion
  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_MessageConversionError` using:

    
    
    import { MessageConversionError } from 'ai';
    
    
    
    
    if (MessageConversionError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_LoadSettingError](/docs/reference/ai-sdk-errors/ai-load-setting-
error)

[NextAI_NoContentGeneratedError](/docs/reference/ai-sdk-errors/ai-no-content-
generated-error)

