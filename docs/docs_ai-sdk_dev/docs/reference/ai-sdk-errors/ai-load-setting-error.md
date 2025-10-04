[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_LoadSettingError

Copy markdown

# AI_LoadSettingError

This error occurs when a setting is not loaded successfully.

## Properties

  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_LoadSettingError` using:

    
    
    import { LoadSettingError } from 'ai';
    
    
    
    
    if (LoadSettingError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_LoadAPIKeyError](/docs/reference/ai-sdk-errors/ai-load-api-key-
error)

[NextAI_MessageConversionError](/docs/reference/ai-sdk-errors/ai-message-
conversion-error)

