[AI SDK UI](/docs/ai-sdk-ui)convertToModelMessages

Copy markdown

# `convertToModelMessages()`

The `convertToModelMessages` function is used to transform an array of UI
messages from the `useChat` hook into an array of `ModelMessage` objects.
These `ModelMessage` objects are compatible with AI core functions like
`streamText`.

app/api/chat/route.ts

    
    
    import { openai } from '@ai-sdk/openai';
    
    import { convertToModelMessages, streamText } from 'ai';
    
    
    
    
    export async function POST(req: Request) {
    
      const { messages } = await req.json();
    
    
    
    
      const result = streamText({
    
        model: openai('gpt-4o'),
    
        messages: convertToModelMessages(messages),
    
      });
    
    
    
    
      return result.toUIMessageStreamResponse();
    
    }

## Import

    
    
    import { convertToModelMessages } from "ai"

## API Signature

### Parameters

### messages:

Message[]

An array of UI messages from the useChat hook to be converted

### options:

{ tools?: ToolSet }

Optional configuration object. Provide tools to enable multi-modal tool
responses.

### Returns

An array of [`ModelMessage`](/docs/reference/ai-sdk-core/model-message)
objects.

### ModelMessage[]:

Array

An array of ModelMessage objects

## Multi-modal Tool Responses

The `convertToModelMessages` function supports tools that can return multi-
modal content. This is useful when tools need to return non-text content like
images.

    
    
    import { tool } from 'ai';
    
    import { z } from 'zod';
    
    
    
    
    const screenshotTool = tool({
    
      parameters: z.object({}),
    
      execute: async () => 'imgbase64',
    
      toModelOutput: result => [{ type: 'image', data: result }],
    
    });
    
    
    
    
    const result = streamText({
    
      model: openai('gpt-4'),
    
      messages: convertToModelMessages(messages, {
    
        tools: {
    
          screenshot: screenshotTool,
    
        },
    
      }),
    
    });

Tools can implement the optional `toModelOutput` method to transform their
results into multi-modal content. The content is an array of content parts,
where each part has a `type` (e.g., 'text', 'image') and corresponding data.

[PrevioususeObject](/docs/reference/ai-sdk-ui/use-object)

[NextcreateUIMessageStream](/docs/reference/ai-sdk-ui/create-ui-message-
stream)

