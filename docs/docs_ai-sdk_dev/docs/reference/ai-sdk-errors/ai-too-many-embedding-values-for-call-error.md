[AI SDK Errors](/docs/reference/ai-sdk-
errors)AI_TooManyEmbeddingValuesForCallError

Copy markdown

# AI_TooManyEmbeddingValuesForCallError

This error occurs when too many values are provided in a single embedding
call.

## Properties

  * `provider`: The AI provider name
  * `modelId`: The ID of the embedding model
  * `maxEmbeddingsPerCall`: The maximum number of embeddings allowed per call
  * `values`: The array of values that was provided

## Checking for this Error

You can check if an error is an instance of
`AI_TooManyEmbeddingValuesForCallError` using:

    
    
    import { TooManyEmbeddingValuesForCallError } from 'ai';
    
    
    
    
    if (TooManyEmbeddingValuesForCallError.isInstance(error)) {
    
      // Handle the error
    
    }

[PreviousAI_RetryError](/docs/reference/ai-sdk-errors/ai-retry-error)

[NextToolCallRepairError](/docs/reference/ai-sdk-errors/ai-tool-call-repair-
error)

