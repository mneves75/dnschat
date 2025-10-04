[AI SDK RSC](/docs/ai-sdk-rsc)useAIState

Copy markdown

# `useAIState`

AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-
sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see
our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

It is a hook that enables you to read and update the AI state. The AI state is
shared globally between all `useAIState` hooks under the same `<AI/>`
provider.

The AI state is intended to contain context and information shared with the AI
model, such as system messages, function responses, and other relevant data.

## Import

    
    
    import { useAIState } from "@ai-sdk/rsc"

## API Signature

### Returns

A single element array where the first element is the current AI state.

[PreviousgetMutableAIState](/docs/reference/ai-sdk-rsc/get-mutable-ai-state)

[NextuseActions](/docs/reference/ai-sdk-rsc/use-actions)

