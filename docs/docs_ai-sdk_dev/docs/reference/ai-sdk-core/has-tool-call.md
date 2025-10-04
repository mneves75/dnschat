[AI SDK Core](/docs/ai-sdk-core)hasToolCall

Copy markdown

# `hasToolCall()`

Creates a stop condition that stops when a specific tool is called.

This function is used with `stopWhen` in `generateText` and `streamText` to
control when a tool-calling loop should stop based on whether a particular
tool has been invoked.

    
    
    import { openai } from '@ai-sdk/openai';
    
    import { generateText, hasToolCall } from 'ai';
    
    
    
    
    const result = await generateText({
    
      model: openai('gpt-4o'),
    
      tools: {
    
        weather: weatherTool,
    
        finalAnswer: finalAnswerTool,
    
      },
    
      // Stop when the finalAnswer tool is called
    
      stopWhen: hasToolCall('finalAnswer'),
    
    });

## Import

    
    
    import { hasToolCall } from "ai"

## API Signature

### Parameters

### toolName:

string

The name of the tool that should trigger the stop condition when called.

### Returns

A `StopCondition` function that returns `true` when the specified tool is
called in the current step. The function can be used with the `stopWhen`
parameter in `generateText` and `streamText`.

## Examples

### Basic Usage

Stop when a specific tool is called:

    
    
    import { generateText, hasToolCall } from 'ai';
    
    
    
    
    const result = await generateText({
    
      model: yourModel,
    
      tools: {
    
        submitAnswer: submitAnswerTool,
    
        search: searchTool,
    
      },
    
      stopWhen: hasToolCall('submitAnswer'),
    
    });

### Combining with Other Conditions

You can combine multiple stop conditions in an array:

    
    
    import { generateText, hasToolCall, stepCountIs } from 'ai';
    
    
    
    
    const result = await generateText({
    
      model: yourModel,
    
      tools: {
    
        weather: weatherTool,
    
        search: searchTool,
    
        finalAnswer: finalAnswerTool,
    
      },
    
      // Stop when weather tool is called OR finalAnswer is called OR after 5 steps
    
      stopWhen: [
    
        hasToolCall('weather'),
    
        hasToolCall('finalAnswer'),
    
        stepCountIs(5),
    
      ],
    
    });

### Agent Pattern

Common pattern for agents that run until they provide a final answer:

    
    
    import { generateText, hasToolCall } from 'ai';
    
    
    
    
    const result = await generateText({
    
      model: yourModel,
    
      tools: {
    
        search: searchTool,
    
        calculate: calculateTool,
    
        finalAnswer: {
    
          description: 'Provide the final answer to the user',
    
          parameters: z.object({
    
            answer: z.string(),
    
          }),
    
          execute: async ({ answer }) => answer,
    
        },
    
      },
    
      stopWhen: hasToolCall('finalAnswer'),
    
    });

## See also

  * [`stepCountIs()`](/docs/reference/ai-sdk-core/step-count-is)
  * [`generateText()`](/docs/reference/ai-sdk-core/generate-text)
  * [`streamText()`](/docs/reference/ai-sdk-core/stream-text)

[PreviousstepCountIs](/docs/reference/ai-sdk-core/step-count-is)

[NextsimulateReadableStream](/docs/reference/ai-sdk-core/simulate-readable-
stream)

