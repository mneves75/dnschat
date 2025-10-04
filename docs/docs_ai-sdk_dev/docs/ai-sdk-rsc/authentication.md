[AI SDK RSC](/docs/ai-sdk-rsc)Handling Authentication

Copy markdown

# Authentication

AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-
sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see
our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

The RSC API makes extensive use of [`Server
Actions`](https://nextjs.org/docs/app/building-your-application/data-
fetching/server-actions-and-mutations) to power streaming values and UI from
the server.

Server Actions are exposed as public, unprotected endpoints. As a result, you
should treat Server Actions as you would public-facing API endpoints and
ensure that the user is authorized to perform the action before returning any
data.

app/actions.tsx

    
    
    'use server';
    
    
    
    
    import { cookies } from 'next/headers';
    
    import { createStremableUI } from '@ai-sdk/rsc';
    
    import { validateToken } from '../utils/auth';
    
    
    
    
    export const getWeather = async () => {
    
      const token = cookies().get('token');
    
    
    
    
      if (!token || !validateToken(token)) {
    
        return {
    
          error: 'This action requires authentication',
    
        };
    
      }
    
      const streamableDisplay = createStreamableUI(null);
    
    
    
    
      streamableDisplay.update(<Skeleton />);
    
      streamableDisplay.done(<Weather />);
    
    
    
    
      return {
    
        display: streamableDisplay.value,
    
      };
    
    };

[PreviousError Handling](/docs/ai-sdk-rsc/error-handling)

[NextMigrating from RSC to UI](/docs/ai-sdk-rsc/migrating-to-ui)

