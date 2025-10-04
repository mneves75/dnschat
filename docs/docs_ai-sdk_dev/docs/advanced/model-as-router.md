[Advanced](/docs/advanced)Language Models as Routers

Copy markdown

# Generative User Interfaces

Since language models can render user interfaces as part of their generations,
the resulting model generations are referred to as generative user interfaces.

In this section we will learn more about generative user interfaces and their
impact on the way AI applications are built.

## Deterministic Routes and Probabilistic Routing

Generative user interfaces are not deterministic in nature because they depend
on the model's generation output. Since these generations are probabilistic in
nature, it is possible for every user query to result in a different user
interface.

Users expect their experience using your application to be predictable, so
non-deterministic user interfaces can sound like a bad idea at first. However,
language models can be set up to limit their generations to a particular set
of outputs using their ability to call functions.

When language models are provided with a set of function definitions and
instructed to execute any of them based on user query, they do either one of
the following things:

  * Execute a function that is most relevant to the user query.
  * Not execute any function if the user query is out of bounds of the set of functions available to them.

app/actions.ts

    
    
    const sendMessage = (prompt: string) =>
    
      generateText({
    
        model: 'gpt-3.5-turbo',
    
        system: 'you are a friendly weather assistant!',
    
        prompt,
    
        tools: {
    
          getWeather: {
    
            description: 'Get the weather in a location',
    
            parameters: z.object({
    
              location: z.string().describe('The location to get the weather for'),
    
            }),
    
            execute: async ({ location }: { location: string }) => ({
    
              location,
    
              temperature: 72 + Math.floor(Math.random() * 21) - 10,
    
            }),
    
          },
    
        },
    
      });
    
    
    
    
    sendMessage('What is the weather in San Francisco?'); // getWeather is called
    
    sendMessage('What is the weather in New York?'); // getWeather is called
    
    sendMessage('What events are happening in London?'); // No function is called

This way, it is possible to ensure that the generations result in
deterministic outputs, while the choice a model makes still remains to be
probabilistic.

This emergent ability exhibited by a language model to choose whether a
function needs to be executed or not based on a user query is believed to be
models emulating "reasoning".

As a result, the combination of language models being able to reason which
function to execute as well as render user interfaces at the same time gives
you the ability to build applications where language models can be used as a
router.

## Language Models as Routers

Historically, developers had to write routing logic that connected different
parts of an application to be navigable by a user and complete a specific
task.

In web applications today, most of the routing logic takes place in the form
of routes:

  * `/login` would navigate you to a page with a login form.
  * `/user/john` would navigate you to a page with profile details about John.
  * `/api/events?limit=5` would display the five most recent events from an events database.

While routes help you build web applications that connect different parts of
an application into a seamless user experience, it can also be a burden to
manage them as the complexity of applications grow.

Next.js has helped reduce complexity in developing with routes by introducing:

  * File-based routing system
  * Dynamic routing
  * API routes
  * Middleware
  * App router, and so on...

With language models becoming better at reasoning, we believe that there is a
future where developers only write core application specific components while
models take care of routing them based on the user's state in an application.

With generative user interfaces, the language model decides which user
interface to render based on the user's state in the application, giving users
the flexibility to interact with your application in a conversational manner
instead of navigating through a series of predefined routes.

### Routing by parameters

For routes like:

  * `/profile/[username]`
  * `/search?q=[query]`
  * `/media/[id]`

that have segments dependent on dynamic data, the language model can generate
the correct parameters and render the user interface.

For example, when you're in a search application, you can ask the language
model to search for artworks from different artists. The language model will
call the search function with the artist's name as a parameter and render the
search results.

Art made by Van Gogh?

searchImages("Van Gogh")

Here are a few of his notable works

![Starry Night](https://ai-sdk.dev/images/starry-night.jpg)

Starry Night

![Sunflowers](https://ai-sdk.dev/images/sunflowers.jpg)

Sunflowers

![Olive Trees](https://ai-sdk.dev/images/olive-trees.jpg)

Olive Trees

Wow, these look great! How about Monet?

searchImages("Monet")

Sure! Here are a few of his paintings

![Frau im Gartenfrau](https://ai-sdk.dev/images/frau-im-gartenfrau.jpg)

Frau im Gartenfrau

![Cliff Walk](https://ai-sdk.dev/images/cliff-walk.jpg)

Cliff Walk

![Waves](https://ai-sdk.dev/images/waves.jpg)

Waves

Media Search

Let your users see more than words can say by rendering components directly
within your search experience.

### Routing by sequence

For actions that require a sequence of steps to be completed by navigating
through different routes, the language model can generate the correct sequence
of routes to complete in order to fulfill the user's request.

For example, when you're in a calendar application, you can ask the language
model to schedule a happy hour evening with your friends. The language model
will then understand your request and will perform the right sequence of [tool
calls](/docs/ai-sdk-core/tools-and-tool-calling) to:

  1. Lookup your calendar
  2. Lookup your friends' calendars
  3. Determine the best time for everyone
  4. Search for nearby happy hour spots
  5. Create an event and send out invites to your friends

I'd like to get drinks with Max tomorrow evening after studio!

searchContacts("Max")

![max's
avatar](https://vercel.com/api/www/avatar/836cb03b75e81fb87a3abdcec7cabd9e71d50b1c?s=44)

max

@mleiter

![shu's
avatar](https://vercel.com/api/www/avatar/9fe20c938b5c550a007ae6206be9a085c7be7edc?s=44)

shu

@shuding

getEvents("2023-10-18", ["jrmy", "mleiter"])

4PM

5PM

6PM

7PM

studio

4-6 PM

searchNearby("Bar")

wild colonial

200m

the eddy

1.3km

createEvent("2023-10-18", ["jrmy", "mleiter"])

4PM

5PM

6PM

7PM

studio

4-6 PM

Drinks at Wild Colonial

6-7 PM

Exciting! Max is free around that time and Wild Colonial is right around the
corner, would you like me to mark it on your calendar?

Sure, sounds good!

Planning an Event

The model calls functions and generates interfaces based on user intent,
acting like a router.

Just by defining functions to lookup contacts, pull events from a calendar,
and search for nearby locations, the model is able to sequentially navigate
the routes for you.

To learn more, check out these [examples](/examples/next-app/interface) using
the `streamUI` function to stream generative user interfaces to the client
based on the response from the language model.

[PreviousRendering UI with Language Models](/docs/advanced/rendering-ui-with-
language-models)

[NextMultistep Interfaces](/docs/advanced/multistep-interfaces)

