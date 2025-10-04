[AI SDK Core](/docs/ai-sdk-core)generateId

Copy markdown

# `generateId()`

Generates a unique identifier. You can optionally provide the length of the
ID.

This is the same id generator used by the AI SDK.

    
    
    import { generateId } from 'ai';
    
    
    
    
    const id = generateId();

## Import

    
    
    import { generateId } from "ai"

## API Signature

### Parameters

### size:

number

The length of the generated ID. It defaults to 16. This parameter is
deprecated and will be removed in the next major version.

### Returns

A string representing the generated ID.

## See also

  * [`createIdGenerator()`](/docs/reference/ai-sdk-core/create-id-generator)

[PrevioussmoothStream](/docs/reference/ai-sdk-core/smooth-stream)

[NextcreateIdGenerator](/docs/reference/ai-sdk-core/create-id-generator)

