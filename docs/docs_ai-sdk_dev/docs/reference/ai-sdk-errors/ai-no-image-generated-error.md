[AI SDK Errors](/docs/reference/ai-sdk-errors)AI_NoImageGeneratedError

Copy markdown

# AI_NoImageGeneratedError

This error occurs when the AI provider fails to generate an image. It can
arise due to the following reasons:

  * The model failed to generate a response.
  * The model generated an invalid response.

## Properties

  * `message`: The error message.
  * `responses`: Metadata about the image model responses, including timestamp, model, and headers.
  * `cause`: The cause of the error. You can use this for more detailed error handling.

## Checking for this Error

You can check if an error is an instance of `AI_NoImageGeneratedError` using:

    
    
    import { generateImage, NoImageGeneratedError } from 'ai';
    
    
    
    
    try {
    
      await generateImage({ model, prompt });
    
    } catch (error) {
    
      if (NoImageGeneratedError.isInstance(error)) {
    
        console.log('NoImageGeneratedError');
    
        console.log('Cause:', error.cause);
    
        console.log('Responses:', error.responses);
    
      }
    
    }

[PreviousAI_NoContentGeneratedError](/docs/reference/ai-sdk-errors/ai-no-
content-generated-error)

[NextAI_NoObjectGeneratedError](/docs/reference/ai-sdk-errors/ai-no-object-
generated-error)

