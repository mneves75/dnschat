[AI SDK RSC](/docs/ai-sdk-rsc)useStreamableValue

Copy markdown

# `useStreamableValue`

AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-
sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see
our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

It is a React hook that takes a streamable value created using
[`createStreamableValue`](/docs/reference/ai-sdk-rsc/create-streamable-value)
and returns the current value, error, and pending state.

## Import

    
    
    import { useStreamableValue } from "@ai-sdk/rsc"

## Example

This is useful for consuming streamable values received from a component's
props.

    
    
    function MyComponent({ streamableValue }) {
    
      const [data, error, pending] = useStreamableValue(streamableValue);
    
    
    
    
      if (pending) return <div>Loading...</div>;
    
      if (error) return <div>Error: {error.message}</div>;
    
    
    
    
      return <div>Data: {data}</div>;
    
    }

## API Signature

### Parameters

It accepts a streamable value created using `createStreamableValue`.

### Returns

It is an array, where the first element contains the data, the second element
contains an error if it is thrown anytime during the stream, and the third is
a boolean indicating if the value is pending.

[PrevioususeUIState](/docs/reference/ai-sdk-rsc/use-ui-state)

[Nextrender (Removed)](/docs/reference/ai-sdk-rsc/render)

