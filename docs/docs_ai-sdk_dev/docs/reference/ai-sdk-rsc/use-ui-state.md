[AI SDK RSC](/docs/ai-sdk-rsc)useUIState

Copy markdown

# `useUIState`

AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-
sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see
our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

It is a hook that enables you to read and update the UI State. The state is
client-side and can contain functions, React nodes, and other data. UIState is
the visual representation of the AI state.

## Import

    
    
    import { useUIState } from "@ai-sdk/rsc"

## API Signature

### Returns

Similar to useState, it is an array, where the first element is the current UI
state and the second element is the function that updates the state.

## Examples

[Learn to manage AI and UI states in Next.js](/examples/next-app/state-
management/ai-ui-states)

[PrevioususeActions](/docs/reference/ai-sdk-rsc/use-actions)

[NextuseStreamableValue](/docs/reference/ai-sdk-rsc/use-streamable-value)

