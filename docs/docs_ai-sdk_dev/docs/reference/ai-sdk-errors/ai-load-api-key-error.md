[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_LoadAPIKeyError

Copy markdown

# AI_LoadAPIKeyError

This error occurs when API key is not loaded successfully.

## Properties

  * `message`: The error message

## Checking for this Error

You can check if an error is an instance of `AI_LoadAPIKeyError` using:

    
    
    import { LoadAPIKeyError } from 'ai';
    
    
    
    
    if (LoadAPIKeyError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_JSONParseError](/docs/reference/ai-sdk-errors/ai-json-parse-error)

[NextAI_LoadSettingError](/docs/reference/ai-sdk-errors/ai-load-setting-error)

